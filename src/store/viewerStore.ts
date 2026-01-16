import { createContext, createElement, useCallback, useContext, useMemo, useState } from 'react';
import type { ViewerState, DicomStudy, LoadingState } from '../types';
import { findSeriesByUID } from '../lib/dicomImporter';

/**
 * Global state store using React context
 * Manages all viewer state including selection, viewport settings, DICOM data, and UI state
 */
type ViewerActionKeys =
  | 'setSelectedRegion'
  | 'setSelectedSeries'
  | 'setSliceIndex'
  | 'setZoom'
  | 'setBrightness'
  | 'setContrast'
  | 'setActivePanel'
  | 'toggleRegionExpanded'
  | 'setShowImportModal'
  | 'setDicomStudies'
  | 'selectDicomSeries'
  | 'setLoadingState'
  | 'setErrorMessage'
  | 'resetDicomState';

type ViewerStateData = Omit<ViewerState, ViewerActionKeys>;

const initialState: ViewerStateData = {
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
};

const ViewerStoreContext = createContext<ViewerState | null>(null);

export function ViewerStoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ViewerStateData>(initialState);

  const setSelectedRegion = useCallback((regionId: string) => {
    setState((prev) => ({ ...prev, selectedRegionId: regionId }));
  }, []);

  const setSelectedSeries = useCallback((seriesId: string, totalSlices: number) => {
    setState((prev) => ({
      ...prev,
      selectedSeriesId: seriesId,
      totalSlices,
      currentSliceIndex: 1,
    }));
  }, []);

  const setSliceIndex = useCallback((index: number) => {
    setState((prev) => ({ ...prev, currentSliceIndex: index }));
  }, []);

  const setZoom = useCallback((zoom: number) => {
    setState((prev) => ({
      ...prev,
      zoom: Math.max(0.5, Math.min(10, zoom)),
    }));
  }, []);

  const setBrightness = useCallback((brightness: number) => {
    setState((prev) => ({
      ...prev,
      brightness: Math.max(0, Math.min(200, brightness)),
    }));
  }, []);

  const setContrast = useCallback((contrast: number) => {
    setState((prev) => ({
      ...prev,
      contrast: Math.max(0, Math.min(200, contrast)),
    }));
  }, []);

  const setActivePanel = useCallback((panel: 'report' | 'info') => {
    setState((prev) => ({ ...prev, activePanel: panel }));
  }, []);

  const toggleRegionExpanded = useCallback((regionId: string) => {
    setState((prev) => ({
      ...prev,
      expandedRegions: prev.expandedRegions.includes(regionId)
        ? prev.expandedRegions.filter((id) => id !== regionId)
        : [...prev.expandedRegions, regionId],
    }));
  }, []);

  const setShowImportModal = useCallback((show: boolean) => {
    setState((prev) => ({ ...prev, showImportModal: show }));
  }, []);

  const setDicomStudies = useCallback((studies: DicomStudy[]) => {
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

    setState((prev) => ({
      ...prev,
      dicomStudies: studies,
      selectedDicomSeriesUID: selectedUID,
      currentImageIds: imageIds,
      totalSlices: sliceCount,
      currentSliceIndex: 1,
      hasDicomLoaded: studies.length > 0,
      loadingState: 'success',
      loadingMessage: '',
    }));
  }, []);

  const selectDicomSeries = useCallback((seriesUID: string) => {
    setState((prev) => {
      const result = findSeriesByUID(prev.dicomStudies, seriesUID);

      if (!result) {
        return prev;
      }

      return {
        ...prev,
        selectedDicomSeriesUID: seriesUID,
        currentImageIds: result.series.imageIds,
        totalSlices: result.series.instances.length,
        currentSliceIndex: 1,
      };
    });
  }, []);

  const setLoadingState = useCallback((loadingState: LoadingState, message = '') => {
    setState((prev) => ({
      ...prev,
      loadingState,
      loadingMessage: message,
    }));
  }, []);

  const setErrorMessage = useCallback((message: string | null) => {
    setState((prev) => ({ ...prev, errorMessage: message }));
  }, []);

  const resetDicomState = useCallback(() => {
    setState((prev) => ({
      ...prev,
      dicomStudies: [],
      selectedDicomSeriesUID: null,
      currentImageIds: [],
      loadingState: 'idle',
      loadingMessage: '',
      errorMessage: null,
      hasDicomLoaded: false,
      currentSliceIndex: 1,
      totalSlices: 95,
    }));
  }, []);

  const value = useMemo(
    () => ({
      ...state,
      setSelectedRegion,
      setSelectedSeries,
      setSliceIndex,
      setZoom,
      setBrightness,
      setContrast,
      setActivePanel,
      toggleRegionExpanded,
      setShowImportModal,
      setDicomStudies,
      selectDicomSeries,
      setLoadingState,
      setErrorMessage,
      resetDicomState,
    }),
    [
      state,
      setSelectedRegion,
      setSelectedSeries,
      setSliceIndex,
      setZoom,
      setBrightness,
      setContrast,
      setActivePanel,
      toggleRegionExpanded,
      setShowImportModal,
      setDicomStudies,
      selectDicomSeries,
      setLoadingState,
      setErrorMessage,
      resetDicomState,
    ]
  );

  return createElement(ViewerStoreContext.Provider, { value }, children);
}

export function useViewerStore(): ViewerState {
  const context = useContext(ViewerStoreContext);

  if (!context) {
    throw new Error('useViewerStore must be used within ViewerStoreProvider');
  }

  return context;
}
