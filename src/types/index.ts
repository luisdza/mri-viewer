/**
 * Type definitions for the MRI Viewer application
 * All types are centralized here for easy maintenance
 */

/** Represents a single series within a body region */
export interface Series {
  id: string;
  name: string;
  sliceCount: number;
  orientation: 'Sagittal' | 'Axial' | 'Coronal';
  sequence: string; // e.g., "T2 SPACE", "T1", "FLAIR"
}

/** Represents a body region containing multiple series */
export interface BodyRegion {
  id: string;
  name: string;
  icon: string; // Icon name from lucide-react
  totalSlices: number;
  series: Series[];
}

/** Study information metadata */
export interface StudyInfo {
  studyDate: string;
  modality: string;
  description: string;
  institution: string;
  referring: string;
  accession: string;
  patientName: string;
  mrn: string;
}

/** Report metadata */
export interface ReportInfo {
  radiologist: string;
  reportDate: string;
  status: 'Preliminary' | 'Final' | 'Addendum';
}

/** Row in the series table on the right sidebar */
export interface SeriesTableRow {
  region: string;
  seriesName: string;
  sliceCount: number;
}

/** Complete mock study data structure */
export interface MockStudyData {
  studyInfo: StudyInfo;
  reportInfo: ReportInfo;
  bodyRegions: BodyRegion[];
  seriesTable: SeriesTableRow[];
}

// ============ DICOM Types ============

/** Represents a single DICOM instance/image */
export interface DicomInstance {
  sopInstanceUID: string;
  imageId: string;
  instanceNumber: number;
  imagePositionPatient: number[] | null;
  sliceLocation: number | null;
  file: File;
}

/** Represents a DICOM series containing multiple instances */
export interface DicomSeries {
  seriesInstanceUID: string;
  seriesDescription: string;
  seriesNumber: number;
  modality: string;
  instances: DicomInstance[];
  imageIds: string[];
}

/** Represents a DICOM study containing multiple series */
export interface DicomStudy {
  studyInstanceUID: string;
  studyDescription: string;
  studyDate: string;
  patientName: string;
  patientId: string;
  accessionNumber: string;
  institution: string;
  referringPhysician: string;
  modality: string;
  series: DicomSeries[];
}

/** Result from DICOM import process */
export interface DicomImportResult {
  studies: DicomStudy[];
  totalFiles: number;
  validFiles: number;
  errors: string[];
}

/** Loading state for DICOM operations */
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

/** Viewer state managed by Zustand */
export interface ViewerState {
  // Selection state
  selectedRegionId: string | null;
  selectedSeriesId: string | null;
  
  // Viewport state
  currentSliceIndex: number;
  totalSlices: number;
  zoom: number;
  brightness: number; // 0-200, default 100
  contrast: number;   // 0-200, default 100
  
  // UI state
  activePanel: 'report' | 'info';
  expandedRegions: string[];
  showImportModal: boolean;
  
  // DICOM state
  dicomStudies: DicomStudy[];
  selectedDicomSeriesUID: string | null;
  currentImageIds: string[];
  loadingState: LoadingState;
  loadingMessage: string;
  errorMessage: string | null;
  hasDicomLoaded: boolean;
  
  // Actions
  setSelectedRegion: (regionId: string) => void;
  setSelectedSeries: (seriesId: string, totalSlices: number) => void;
  setSliceIndex: (index: number) => void;
  setZoom: (zoom: number) => void;
  setBrightness: (brightness: number) => void;
  setContrast: (contrast: number) => void;
  setActivePanel: (panel: 'report' | 'info') => void;
  toggleRegionExpanded: (regionId: string) => void;
  
  // DICOM actions
  setShowImportModal: (show: boolean) => void;
  setDicomStudies: (studies: DicomStudy[]) => void;
  selectDicomSeries: (seriesUID: string) => void;
  setLoadingState: (state: LoadingState, message?: string) => void;
  setErrorMessage: (message: string | null) => void;
  resetDicomState: () => void;
}

/** Tool button configuration */
export interface ToolConfig {
  id: string;
  icon: string;
  label: string;
  active?: boolean;
}
