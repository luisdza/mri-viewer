import { useEffect, useRef, useCallback, useState } from 'react';
import { useViewerStore } from '../../store/viewerStore';
import { findSeriesById } from '../../data/mockStudy';
import { findSeriesByUID } from '../../lib/dicomImporter';
import {
  initializeCornerstone,
  cornerstone,
} from '../../lib/cornerstoneInit';
import type { Types } from '@cornerstonejs/core';

const VIEWPORT_ID = 'mriViewport';
const RENDERING_ENGINE_ID = 'mriRenderingEngine';

/**
 * Cornerstone3D Viewport Component
 * 
 * This component renders:
 * - Real DICOM images when loaded via the importer
 * - Mock MRI visualization when no DICOM is loaded
 * 
 * Features:
 * - Mouse wheel slice scrolling
 * - Zoom and pan support
 * - Brightness/contrast (Window/Level) adjustment
 */
export function CornerstoneViewport() {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<Types.IStackViewport | null>(null);
  const renderingEngineRef = useRef<Types.IRenderingEngine | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isViewportReady, setIsViewportReady] = useState(false);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  
  // Store original VOI (Window/Level) values from the image
  const originalVoiRef = useRef<{ windowWidth: number; windowCenter: number } | null>(null);
  const originalZoomRef = useRef<number | null>(null);
  
  const {
    selectedSeriesId,
    currentSliceIndex,
    totalSlices,
    zoom,
    brightness,
    contrast,
    setSliceIndex,
    setZoom,
    hasDicomLoaded,
    currentImageIds,
    dicomStudies,
    selectedDicomSeriesUID,
  } = useViewerStore();

  // Get current series information
  let regionName = 'Spine';
  let sequence = 'T2';
  let orientation = 'Sagittal';
  
  if (hasDicomLoaded && selectedDicomSeriesUID) {
    const dicomResult = findSeriesByUID(dicomStudies, selectedDicomSeriesUID);
    if (dicomResult) {
      regionName = dicomResult.study.studyDescription || 'DICOM Study';
      sequence = dicomResult.series.modality;
      orientation = dicomResult.series.seriesDescription;
    }
  } else if (selectedSeriesId) {
    const seriesInfo = findSeriesById(selectedSeriesId);
    if (seriesInfo) {
      regionName = seriesInfo.region.name;
      sequence = seriesInfo.series.sequence;
      orientation = seriesInfo.series.orientation;
    }
  }

  // Track container size with ResizeObserver - runs whenever containerRef changes
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          setContainerSize({ width, height });
        }
      }
    });
    
    observer.observe(container);
    
    // Get initial size immediately
    const rect = container.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      setContainerSize({ width: rect.width, height: rect.height });
    }
    
    // Also try after a short delay to ensure layout is complete
    const timer = setTimeout(() => {
      const rect = container.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setContainerSize({ width: rect.width, height: rect.height });
      }
    }, 100);
    
    return () => {
      observer.disconnect();
      clearTimeout(timer);
    };
  }, [hasDicomLoaded]); // Re-run when DICOM loads to ensure we pick up container dimensions

  // Initialize Cornerstone ONCE on mount
  useEffect(() => {
    const init = async () => {
      try {
        await initializeCornerstone();
        console.log('Cornerstone initialized');
      } catch (err) {
        console.error('Cornerstone init error:', err);
      }
    };
    
    init();
  }, []);

  // Setup viewport when DICOM is loaded AND container has valid dimensions
  useEffect(() => {
    if (!hasDicomLoaded || !containerRef.current) {
      setIsViewportReady(false);
      return;
    }
    
    // Wait for valid dimensions
    if (containerSize.width < 10 || containerSize.height < 10) {
      console.log('Waiting for container dimensions...', containerSize);
      return;
    }
    
    let mounted = true;
    
    const setupViewport = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const container = containerRef.current;
        if (!container || !mounted) return;
        
        console.log('Setting up viewport with dimensions:', containerSize.width, 'x', containerSize.height);
        
        // Destroy existing viewport if any
        if (renderingEngineRef.current) {
          try {
            renderingEngineRef.current.destroy();
          } catch (e) {
            // Ignore cleanup errors
          }
          renderingEngineRef.current = null;
          viewportRef.current = null;
        }
        
        // Create fresh rendering engine
        const renderingEngine = new cornerstone.RenderingEngine(RENDERING_ENGINE_ID);
        renderingEngineRef.current = renderingEngine;
        
        // Create viewport configuration
        const viewportInput: Types.PublicViewportInput = {
          viewportId: VIEWPORT_ID,
          type: cornerstone.Enums.ViewportType.STACK,
          element: container,
          defaultOptions: {
            background: [0, 0, 0] as Types.Point3,
          },
        };
        
        // Enable the element (creates the canvas)
        renderingEngine.enableElement(viewportInput);
        
        // Get the viewport
        const viewport = renderingEngine.getViewport(VIEWPORT_ID) as Types.IStackViewport;
        viewportRef.current = viewport;
        
        // Force a resize to ensure proper canvas dimensions
        renderingEngine.resize(true, true);
        
        if (mounted) {
          setIsViewportReady(true);
          console.log('Viewport ready');
        }
        
      } catch (err) {
        console.error('Failed to setup viewport:', err);
        if (mounted) setError('Failed to initialize viewer');
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    
    setupViewport();
    
    return () => {
      mounted = false;
    };
  }, [hasDicomLoaded, containerSize.width, containerSize.height]);

  // Load images when viewport is ready and imageIds change
  useEffect(() => {
    if (!isViewportReady || !viewportRef.current || currentImageIds.length === 0) {
      return;
    }
    
    let mounted = true;
    
    const loadImages = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const viewport = viewportRef.current;
        if (!viewport || !mounted) return;
        
        // Reset stored values when loading new images
        originalVoiRef.current = null;
        originalZoomRef.current = null;
        
        console.log('Loading image stack with', currentImageIds.length, 'images');
        console.log('First imageId:', currentImageIds[0]);
        
        // Set the image stack - this loads and displays the images
        await viewport.setStack(currentImageIds, 0);
        
        // Reset the camera to fit the image
        viewport.resetCamera();
        
        // Render the viewport
        viewport.render();
        
        console.log('Images loaded and rendered');
        
      } catch (err) {
        console.error('Failed to load images:', err);
        if (mounted) setError('Failed to load DICOM images');
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    
    loadImages();
    
    return () => {
      mounted = false;
    };
  }, [isViewportReady, currentImageIds]);

  // Handle resize - update container size and resize rendering engine
  useEffect(() => {
    if (!containerRef.current) return;
    
    const handleResize = () => {
      if (renderingEngineRef.current) {
        renderingEngineRef.current.resize(true, true);
      }
    };
    
    // Debounce resize to avoid too many calls
    let resizeTimeout: NodeJS.Timeout;
    const debouncedResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(handleResize, 50);
    };
    
    window.addEventListener('resize', debouncedResize);
    
    return () => {
      clearTimeout(resizeTimeout);
      window.removeEventListener('resize', debouncedResize);
    };
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (renderingEngineRef.current) {
        try {
          renderingEngineRef.current.destroy();
        } catch (e) {
          // Ignore
        }
      }
    };
  }, []);

  // Update slice when index changes
  useEffect(() => {
    if (!viewportRef.current || !hasDicomLoaded || currentImageIds.length === 0) return;
    
    const viewport = viewportRef.current;
    const imageIndex = Math.max(0, Math.min(currentSliceIndex - 1, currentImageIds.length - 1));
    
    viewport.setImageIdIndex(imageIndex);
  }, [currentSliceIndex, hasDicomLoaded, currentImageIds]);

  // Apply zoom - only when user changes zoom, not on every render
  useEffect(() => {
    if (!viewportRef.current || !hasDicomLoaded || !isViewportReady) return;
    
    const viewport = viewportRef.current;
    
    // Store original zoom on first access
    if (originalZoomRef.current === null) {
      const camera = viewport.getCamera();
      originalZoomRef.current = camera.parallelScale || 100;
    }
    
    // Only apply if zoom has been changed from default (1.0)
    if (zoom !== 1.0) {
      const camera = viewport.getCamera();
      viewport.setCamera({
        ...camera,
        parallelScale: originalZoomRef.current / zoom,
      });
      viewport.render();
    }
  }, [zoom, hasDicomLoaded, isViewportReady]);

  // Apply Window/Level (brightness/contrast) - use original values as baseline
  useEffect(() => {
    if (!viewportRef.current || !hasDicomLoaded || !isViewportReady) return;
    
    const viewport = viewportRef.current;
    
    // Store original VOI on first access
    if (originalVoiRef.current === null) {
      const voiRange = viewport.getProperties().voiRange;
      if (voiRange) {
        const width = voiRange.upper - voiRange.lower;
        const center = (voiRange.upper + voiRange.lower) / 2;
        originalVoiRef.current = { windowWidth: width, windowCenter: center };
        console.log('Original VOI:', originalVoiRef.current);
      } else {
        // Default fallback
        originalVoiRef.current = { windowWidth: 255, windowCenter: 128 };
      }
    }
    
    // Only apply if brightness or contrast have been changed from default (100)
    if (brightness !== 100 || contrast !== 100) {
      const { windowWidth, windowCenter } = originalVoiRef.current;
      
      // Brightness adjusts window center (higher = brighter = lower center value)
      // Contrast adjusts window width (higher = more contrast = narrower window)
      const newCenter = windowCenter * (200 - brightness) / 100;
      const newWidth = windowWidth * (200 - contrast) / 100;
      
      viewport.setProperties({
        voiRange: {
          lower: newCenter - newWidth / 2,
          upper: newCenter + newWidth / 2,
        },
      });
      viewport.render();
    }
  }, [brightness, contrast, hasDicomLoaded, isViewportReady]);

  // Handle mouse wheel for slice scrolling (DICOM mode)
  const handleWheel = useCallback(
    (event: WheelEvent) => {
      event.preventDefault();
      
      if (event.ctrlKey) {
        // Ctrl + wheel = zoom
        const delta = event.deltaY > 0 ? -0.1 : 0.1;
        setZoom(zoom + delta);
      } else {
        // Regular wheel = slice scroll
        const delta = event.deltaY > 0 ? 1 : -1;
        const maxSlices = hasDicomLoaded ? currentImageIds.length : totalSlices;
        const newIndex = Math.max(1, Math.min(maxSlices, currentSliceIndex + delta));
        setSliceIndex(newIndex);
      }
    },
    [currentSliceIndex, totalSlices, zoom, setSliceIndex, setZoom, hasDicomLoaded, currentImageIds]
  );

  // Attach wheel event listener
  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
      return () => container.removeEventListener('wheel', handleWheel);
    }
  }, [handleWheel]);

  // Only render when DICOM data is loaded
  if (!hasDicomLoaded) {
    return (
      <div className="flex items-center justify-center w-full h-full bg-black">
        <div className="text-center text-viewer-text-muted">
          <p className="text-lg mb-2">No DICOM files loaded</p>
          <p className="text-sm">Import DICOM files to begin viewing</p>
        </div>
      </div>
    );
  }

  // Render DICOM viewport
  return (
    <div 
      ref={containerRef}
      className="absolute inset-0 bg-black overflow-hidden cursor-crosshair select-none"
    >
        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
            <div className="text-viewer-accent animate-pulse">Loading...</div>
          </div>
        )}
        
        {/* Error overlay */}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
            <div className="text-red-400">{error}</div>
          </div>
        )}

        {/* Top-left overlay: Region and sequence info */}
        <div className="absolute top-4 left-4 text-viewer-accent text-sm z-20 pointer-events-none">
          <div className="font-medium">{regionName}</div>
          <div className="text-xs opacity-80">{sequence}</div>
        </div>

        {/* Top-right overlay: Slice counter and orientation */}
        <div className="absolute top-4 right-4 text-right text-viewer-accent text-sm z-20 pointer-events-none">
          <div className="font-medium">{currentSliceIndex}/{currentImageIds.length}</div>
          <div className="text-xs opacity-80 max-w-[150px] truncate">{orientation}</div>
        </div>

        {/* Bottom-left overlay: Window/Level indicator */}
        <div className="absolute bottom-4 left-4 text-viewer-text-muted text-xs z-20 pointer-events-none">
          <span>W:{Math.round(brightness)} L:{Math.round(contrast)}</span>
        </div>

        {/* Bottom-right overlay: Zoom indicator */}
        <div className="absolute bottom-4 right-4 text-viewer-accent text-sm font-medium z-20 pointer-events-none">
          {zoom.toFixed(1)}x
        </div>

        {/* Left/Right orientation markers */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-viewer-text-muted text-xl font-bold opacity-50 z-20 pointer-events-none">
          ≡
        </div>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-viewer-text-muted text-xl font-bold opacity-50 z-20 pointer-events-none">
          ≡
        </div>
      </div>
    );
}
