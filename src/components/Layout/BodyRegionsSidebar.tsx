import { ChevronRight, ChevronDown, Layers, FileImage } from 'lucide-react';
import { useViewerStore } from '../../store/viewerStore';
import type { DicomStudy } from '../../types';

/**
 * Left sidebar showing DICOM studies and series
 * Allows navigation between imported studies and series
 */
export function BodyRegionsSidebar() {
  const {
    expandedRegions,
    toggleRegionExpanded,
    hasDicomLoaded,
    dicomStudies,
    selectedDicomSeriesUID,
    selectDicomSeries,
  } = useViewerStore();

  const handleDicomSeriesClick = (seriesUID: string) => {
    selectDicomSeries(seriesUID);
  };

  // Calculate total images for a DICOM study
  const getStudyImageCount = (study: DicomStudy): number => {
    return study.series.reduce((sum, s) => sum + s.instances.length, 0);
  };

  return (
    <aside className="w-64 bg-viewer-panel border-r border-viewer-border flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-viewer-border">
        <h2 className="text-xs font-semibold text-viewer-text-muted tracking-wider">
          DICOM STUDIES
        </h2>
      </div>

      {/* Scrollable study list */}
      <div className="flex-1 overflow-y-auto">
        {/* Show DICOM studies if loaded */}
        {hasDicomLoaded && dicomStudies.length > 0 ? (
          <>
            {dicomStudies.map((study) => {
              const studyId = study.studyInstanceUID;
              const isExpanded = expandedRegions.includes(studyId);

              return (
                <div key={studyId}>
                  {/* Study header */}
                  <button
                    className={`
                      w-full px-4 py-2.5 flex items-center gap-3 text-left
                      transition-colors hover:bg-viewer-card bg-viewer-card/50
                      border-l-2 border-viewer-accent
                    `}
                    onClick={() => toggleRegionExpanded(studyId)}
                  >
                    {/* Expand/collapse icon */}
                    <span className="text-viewer-text-muted">
                      {isExpanded ? (
                        <ChevronDown size={16} />
                      ) : (
                        <ChevronRight size={16} />
                      )}
                    </span>

                    {/* Study icon */}
                    <Layers size={18} className="text-viewer-accent" />

                    {/* Study info */}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-viewer-text truncate">
                        {study.studyDescription || 'Unnamed Study'}
                      </div>
                      <div className="text-xs text-viewer-text-muted truncate">
                        {study.patientName} • {study.studyDate}
                      </div>
                    </div>

                    {/* Image count badge */}
                    <span className="text-xs bg-viewer-bg px-2 py-0.5 rounded text-viewer-text-muted">
                      {getStudyImageCount(study)}
                    </span>
                  </button>

                  {/* Series list (shown when expanded) */}
                  {isExpanded && (
                    <div className="bg-viewer-bg/50">
                      {study.series.map((series) => {
                        const isSeriesSelected = selectedDicomSeriesUID === series.seriesInstanceUID;

                        return (
                          <button
                            key={series.seriesInstanceUID}
                            className={`
                              w-full pl-12 pr-4 py-2 flex items-center justify-between text-left
                              transition-colors hover:bg-viewer-card
                              ${isSeriesSelected ? 'bg-viewer-accent/20 border-l-2 border-viewer-accent' : ''}
                            `}
                            onClick={() => handleDicomSeriesClick(series.seriesInstanceUID)}
                          >
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                              <FileImage 
                                size={14} 
                                className={isSeriesSelected ? 'text-viewer-accent' : 'text-viewer-text-muted'} 
                              />
                              <span
                                className={`text-sm truncate ${
                                  isSeriesSelected ? 'text-viewer-accent font-medium' : 'text-viewer-text-muted'
                                }`}
                              >
                                {series.seriesDescription || `Series ${series.seriesNumber}`}
                              </span>
                            </div>
                            <span className="text-xs text-viewer-text-muted ml-2">
                              {series.instances.length}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </>
        ) : (
          <div className="flex items-center justify-center h-full p-6">
            <div className="text-center text-viewer-text-muted">
              <Layers size={48} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">No DICOM studies loaded</p>
              <p className="text-xs mt-1 opacity-70">Import files to begin</p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
