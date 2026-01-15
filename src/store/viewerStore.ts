import { create } from 'zustand';
import type { ViewerState, DicomStudy } from '../types';
import { findSeriesByUID } from '../lib/dicomImporter';

/**
 * Global state store using Zustand
 * Manages all viewer state including selection, viewport settings, DICOM data, and UI state
 */
export const useViewerStore = create<ViewerState>((set, get) => ({
  // Initial selection state
  selectedRegionId: 'spine',
  selectedSeriesId: 'spine-sagittal-t2',
  
  // Initial viewport state
  currentSliceIndex: 28,
  totalSlices: 95,
  zoom: 2.8,
  brightness: 100,
  contrast: 100,
  
  // Initial UI state
  activePanel: 'report',
  expandedRegions: ['spine'], // Spine region is expanded by default
  showImportModal: false,
  
  // DICOM state
  dicomStudies: [],
  selectedDicomSeriesUID: null,
  currentImageIds: [],
  loadingState: 'idle',
  loadingMessage: '',
  errorMessage: null,
  hasDicomLoaded: false,
  
  // Actions
  setSelectedRegion: (regionId) => set({ selectedRegionId: regionId }),
  
  setSelectedSeries: (seriesId, totalSlices) => set({
    selectedSeriesId: seriesId,
    totalSlices: totalSlices,
    currentSliceIndex: 1, // Reset to first slice when changing series
  }),
  
  setSliceIndex: (index) => set({ currentSliceIndex: index }),
  
  setZoom: (zoom) => set({ zoom: Math.max(0.5, Math.min(10, zoom)) }), // Clamp between 0.5x and 10x
  
  setBrightness: (brightness) => set({ brightness: Math.max(0, Math.min(200, brightness)) }),
  
  setContrast: (contrast) => set({ contrast: Math.max(0, Math.min(200, contrast)) }),
  
  setActivePanel: (panel) => set({ activePanel: panel }),
  
  toggleRegionExpanded: (regionId) => set((state) => ({
    expandedRegions: state.expandedRegions.includes(regionId)
      ? state.expandedRegions.filter((id) => id !== regionId)
      : [...state.expandedRegions, regionId],
  })),
  
  // DICOM actions
  setShowImportModal: (show) => set({ showImportModal: show }),
  
  setDicomStudies: (studies: DicomStudy[]) => {
    // Auto-select first series if available
    let selectedUID: string | null = null;
    let imageIds: string[] = [];
    let sliceCount = 0;
    
    if (studies.length > 0 && studies[0].series.length > 0) {
      const firstSeries = studies[0].series[0];
      selectedUID = firstSeries.seriesInstanceUID;
      imageIds = firstSeries.imageIds;
      sliceCount = firstSeries.instances.length;
    }
    
    set({
      dicomStudies: studies,
      selectedDicomSeriesUID: selectedUID,
      currentImageIds: imageIds,
      totalSlices: sliceCount,
      currentSliceIndex: 1,
      hasDicomLoaded: studies.length > 0,
      loadingState: 'success',
      loadingMessage: '',
    });
  },
  
  selectDicomSeries: (seriesUID: string) => {
    const { dicomStudies } = get();
    const result = findSeriesByUID(dicomStudies, seriesUID);
    
    if (result) {
      set({
        selectedDicomSeriesUID: seriesUID,
        currentImageIds: result.series.imageIds,
        totalSlices: result.series.instances.length,
        currentSliceIndex: 1,
      });
    }
  },
  
  setLoadingState: (state, message = '') => set({
    loadingState: state,
    loadingMessage: message,
  }),
  
  setErrorMessage: (message) => set({ errorMessage: message }),
  
  resetDicomState: () => set({
    dicomStudies: [],
    selectedDicomSeriesUID: null,
    currentImageIds: [],
    loadingState: 'idle',
    loadingMessage: '',
    errorMessage: null,
    hasDicomLoaded: false,
    currentSliceIndex: 1,
    totalSlices: 95, // Reset to mock default
  }),
}));
