import { useCallback, useRef } from 'react';
import { CornerstoneViewport } from '../viewer/CornerstoneViewport';
import { useViewerStore } from '../../store/viewerStore';

/**
 * Central viewer panel containing:
 * - The main Cornerstone viewport
 * - Slice navigation slider
 * - Brightness and contrast controls
 */
export function ViewerPanel() {
  const {
    currentSliceIndex,
    totalSlices,
    brightness,
    contrast,
    setSliceIndex,
    setBrightness,
    setContrast,
    hasDicomLoaded,
    currentImageIds,
  } = useViewerStore();

  // Debounce refs for slider changes
  const brightnessTimeoutRef = useRef<NodeJS.Timeout>();
  const contrastTimeoutRef = useRef<NodeJS.Timeout>();

  // Debounced brightness change
  const handleBrightnessChange = useCallback((value: number) => {
    clearTimeout(brightnessTimeoutRef.current);
    brightnessTimeoutRef.current = setTimeout(() => {
      setBrightness(value);
    }, 16); // ~60fps
  }, [setBrightness]);

  // Debounced contrast change  
  const handleContrastChange = useCallback((value: number) => {
    clearTimeout(contrastTimeoutRef.current);
    contrastTimeoutRef.current = setTimeout(() => {
      setContrast(value);
    }, 16); // ~60fps
  }, [setContrast]);

  // Use DICOM slice count if available
  const maxSlices = hasDicomLoaded && currentImageIds.length > 0 
    ? currentImageIds.length 
    : totalSlices;

  return (
    <div className="flex-1 flex flex-col bg-viewer-bg min-w-0">
      {/* Main viewport area */}
      <div className="flex-1 min-h-0 p-2">
        <div className="relative w-full h-full rounded-lg overflow-hidden border border-viewer-border shadow-lg">
          <CornerstoneViewport />
        </div>
      </div>

      {/* Controls panel below the viewport */}
      <div className="px-4 py-3 bg-viewer-panel border-t border-viewer-border">
        {/* Slice slider */}
        <div className="flex items-center gap-4 mb-4">
          <label htmlFor="slice-slider" className="text-sm text-viewer-text whitespace-nowrap">
            Slice: {currentSliceIndex} / {maxSlices}
          </label>
          <input
            id="slice-slider"
            type="range"
            min={1}
            max={maxSlices}
            value={Math.min(currentSliceIndex, maxSlices)}
            onChange={(e) => setSliceIndex(Number(e.target.value))}
            className="flex-1 h-1.5"
            aria-label={`Slice navigation, current slice ${currentSliceIndex} of ${maxSlices}`}
            aria-valuemin={1}
            aria-valuemax={maxSlices}
            aria-valuenow={currentSliceIndex}
          />
        </div>

        {/* Brightness and Contrast sliders */}
        <div className="flex items-center gap-6">
          {/* Brightness slider */}
          <div className="flex items-center gap-3 flex-1">
            <label htmlFor="brightness-slider" className="text-xs text-viewer-text-muted uppercase tracking-wider w-24">
              Brightness
            </label>
            <input
              id="brightness-slider"
              type="range"
              min={0}
              max={200}
              defaultValue={100}
              onChange={(e) => handleBrightnessChange(Number(e.target.value))}
              className="flex-1 h-1.5"
              aria-label={`Brightness adjustment, current value ${brightness}%`}
              aria-valuemin={0}
              aria-valuemax={200}
              aria-valuenow={brightness}
            />
            <span className="text-xs text-viewer-text-muted w-10 text-right" aria-live="polite">
              {brightness}%
            </span>
          </div>

          {/* Contrast slider */}
          <div className="flex items-center gap-3 flex-1">
            <label htmlFor="contrast-slider" className="text-xs text-viewer-text-muted uppercase tracking-wider w-24">
              Contrast
            </label>
            <input
              id="contrast-slider"
              type="range"
              min={0}
              max={200}
              defaultValue={100}
              onChange={(e) => handleContrastChange(Number(e.target.value))}
              className="flex-1 h-1.5"
              aria-label={`Contrast adjustment, current value ${contrast}%`}
              aria-valuemin={0}
              aria-valuemax={200}
              aria-valuenow={contrast}
            />
            <span className="text-xs text-viewer-text-muted w-10 text-right" aria-live="polite">
              {contrast}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
