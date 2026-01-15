import {
  ChevronLeft,
  ZoomIn,
  ZoomOut,
  Circle,
  LayoutGrid,
  FileText,
  Info,
  Sun,
  FolderOpen,
  CheckCircle2,
} from 'lucide-react';
import { ToolbarButton } from '../common';
import { useViewerStore } from '../../store/viewerStore';
import { mockStudyData, findSeriesById } from '../../data/mockStudy';
import { findSeriesByUID } from '../../lib/dicomImporter';

/**
 * Top navigation bar with app branding, toolbar, and panel toggles
 * Fixed at the top of the viewport
 */
export function TopBar() {
  const { 
    selectedSeriesId, 
    activePanel, 
    setActivePanel, 
    zoom, 
    setZoom,
    setShowImportModal,
    hasDicomLoaded,
    dicomStudies,
    selectedDicomSeriesUID,
  } = useViewerStore();
  
  // Get current series info - prefer DICOM data if loaded
  let seriesName = 'Select a series';
  let orientation = '';
  let sequence = '';
  let sliceCount = 0;
  let studyDate = mockStudyData.studyInfo.studyDate;
  let patientName = mockStudyData.studyInfo.patientName;
  let mrn = mockStudyData.studyInfo.mrn;
  
  if (hasDicomLoaded && selectedDicomSeriesUID) {
    const dicomResult = findSeriesByUID(dicomStudies, selectedDicomSeriesUID);
    if (dicomResult) {
      seriesName = dicomResult.series.seriesDescription;
      sequence = dicomResult.series.modality;
      sliceCount = dicomResult.series.instances.length;
      studyDate = dicomResult.study.studyDate;
      patientName = dicomResult.study.patientName;
      mrn = dicomResult.study.patientId;
    }
  } else if (selectedSeriesId) {
    const seriesInfo = findSeriesById(selectedSeriesId);
    if (seriesInfo) {
      seriesName = seriesInfo.series.name;
      orientation = seriesInfo.series.orientation;
      sequence = seriesInfo.series.sequence;
      sliceCount = seriesInfo.series.sliceCount;
    }
  }

  return (
    <header className="h-14 bg-viewer-panel border-b border-viewer-border flex items-center px-4 shadow-lg z-50">
      {/* Left section: Back button and app branding */}
      <div className="flex items-center gap-3 min-w-[200px]">
        <button className="flex items-center gap-1 text-viewer-text-muted hover:text-viewer-text transition-colors">
          <ChevronLeft size={18} />
          <span className="text-sm">Back</span>
        </button>
        
        <div className="flex items-center gap-2 ml-2">
          <div className="w-8 h-8 bg-viewer-accent rounded flex items-center justify-center text-white font-bold text-sm">
            MR
          </div>
          <span className="font-semibold text-viewer-text">MRI Viewer</span>
        </div>
        
        {/* Patient info */}
        <div className="ml-4 flex items-center gap-4 text-sm border-l border-viewer-border pl-4">
          <div>
            <span className="text-viewer-text-muted text-xs block">PATIENT</span>
            <span className="text-viewer-text">{patientName}</span>
          </div>
          <div>
            <span className="text-viewer-text-muted text-xs block">MRN</span>
            <span className="text-viewer-text">{mrn}</span>
          </div>
        </div>
      </div>
      
      {/* Center section: Toolbar and series title */}
      <div className="flex-1 flex items-center justify-center gap-6">
        {/* Toolbar buttons */}
        <div className="flex items-center gap-1 bg-viewer-bg rounded-lg p-1">
          {/* Import DICOM button */}
          <ToolbarButton
            icon={<FolderOpen size={18} />}
            label="Import DICOM"
            size="sm"
            onClick={() => setShowImportModal(true)}
            className={hasDicomLoaded ? 'text-viewer-success' : ''}
          />
          <div className="w-px h-5 bg-viewer-border mx-1" />
          <ToolbarButton
            icon={<ZoomOut size={18} />}
            label="Zoom Out"
            size="sm"
            onClick={() => setZoom(zoom - 0.2)}
          />
          <ToolbarButton
            icon={<ZoomIn size={18} />}
            label="Zoom In"
            size="sm"
            onClick={() => setZoom(zoom + 0.2)}
          />
          <div className="w-px h-5 bg-viewer-border mx-1" />
          <ToolbarButton
            icon={<Circle size={18} />}
            label="Window/Level"
            size="sm"
          />
          <ToolbarButton
            icon={<LayoutGrid size={18} />}
            label="Layout"
            size="sm"
          />
        </div>
        
        {/* Current series title */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2">
            <span className="text-viewer-text font-medium">{seriesName}</span>
            {hasDicomLoaded && (
              <CheckCircle2 size={14} className="text-viewer-success" />
            )}
          </div>
          <div className="text-viewer-text-muted text-xs">
            {sequence}{orientation ? ` • ${orientation}` : ''} • {sliceCount} images
          </div>
        </div>
      </div>
      
      {/* Right section: Report/Info toggle and date */}
      <div className="flex items-center gap-4 min-w-[200px] justify-end">
        {/* Report toggle button */}
        <div className="flex items-center gap-2 bg-viewer-bg rounded-lg p-1">
          <button
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-sm transition-colors ${
              activePanel === 'report'
                ? 'bg-viewer-accent text-white'
                : 'text-viewer-text-muted hover:text-viewer-text'
            }`}
            onClick={() => setActivePanel('report')}
          >
            <FileText size={16} />
            Report
          </button>
          <button
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-sm transition-colors ${
              activePanel === 'info'
                ? 'bg-viewer-accent text-white'
                : 'text-viewer-text-muted hover:text-viewer-text'
            }`}
            onClick={() => setActivePanel('info')}
          >
            <Info size={16} />
            Info
          </button>
        </div>
        
        {/* Study date badge */}
        <div className="flex items-center gap-2 text-sm">
          <div className="w-2 h-2 bg-viewer-success rounded-full" />
          <Sun size={14} className="text-viewer-text-muted" />
          <span className="text-viewer-text">{studyDate}</span>
        </div>
      </div>
    </header>
  );
}
