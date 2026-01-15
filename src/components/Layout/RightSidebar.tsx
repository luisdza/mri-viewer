import { SidebarSection, InfoRow } from '../common';
import { mockStudyData } from '../../data/mockStudy';
import { useViewerStore } from '../../store/viewerStore';

/**
 * Right sidebar containing Study Information, Report, and Series table
 * Displays metadata and allows viewing report details
 * Shows DICOM metadata when real DICOM files are loaded
 */
export function RightSidebar() {
  const { activePanel, hasDicomLoaded, dicomStudies, selectedDicomSeriesUID } = useViewerStore();

  // Get study info - prefer DICOM data if loaded
  const studyInfo = hasDicomLoaded && dicomStudies.length > 0
    ? {
        studyDate: dicomStudies[0].studyDate,
        modality: dicomStudies[0].modality,
        description: dicomStudies[0].studyDescription,
        institution: dicomStudies[0].institution,
        referring: dicomStudies[0].referringPhysician || 'N/A',
        accession: dicomStudies[0].accessionNumber || 'N/A',
      }
    : mockStudyData.studyInfo;

  // Build series table from DICOM data or mock
  const seriesTable = hasDicomLoaded && dicomStudies.length > 0
    ? dicomStudies.flatMap((study) =>
        study.series.map((series) => ({
          region: study.studyDescription || 'Study',
          seriesName: series.seriesDescription || `Series ${series.seriesNumber}`,
          sliceCount: series.instances.length,
          seriesUID: series.seriesInstanceUID,
        }))
      )
    : mockStudyData.seriesTable.map((row) => ({ ...row, seriesUID: '' }));

  return (
    <aside className="w-80 bg-viewer-panel border-l border-viewer-border flex flex-col h-full overflow-hidden">
      {/* DICOM Loaded indicator */}
      {hasDicomLoaded && (
        <div className="px-3 pt-3">
          <div className="bg-green-900/30 border border-green-700/50 rounded-lg px-3 py-2 text-green-400 text-sm flex items-center gap-2">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            DICOM Study Loaded
          </div>
        </div>
      )}

      {/* Study Information Section */}
      <div className="p-3">
        <SidebarSection title="Study Information">
          <div className="divide-y divide-viewer-border/50">
            <InfoRow label="Study Date" value={studyInfo.studyDate} />
            <InfoRow label="Modality" value={studyInfo.modality} />
            <InfoRow label="Description" value={studyInfo.description} />
            <InfoRow label="Institution" value={studyInfo.institution} />
            <InfoRow label="Referring" value={studyInfo.referring} />
            <InfoRow label="Accession" value={studyInfo.accession} />
          </div>
        </SidebarSection>
      </div>

      {/* Report Section */}
      {activePanel === 'report' && (
        <div className="px-3 pb-3">
          <SidebarSection title="Report">
            <div className="divide-y divide-viewer-border/50">
              <InfoRow label="Radiologist" value={mockStudyData.reportInfo.radiologist} />
              <InfoRow label="Report Date" value={mockStudyData.reportInfo.reportDate} />
              <InfoRow label="Status" value={mockStudyData.reportInfo.status} />
            </div>
          </SidebarSection>
        </div>
      )}

      {/* Series Table Section */}
      <div className="flex-1 px-3 pb-3 overflow-hidden flex flex-col">
        <SidebarSection
          title="Series"
          badge={seriesTable.length}
          className="flex-1 flex flex-col overflow-hidden"
        >
          {/* Table header */}
          <div className="grid grid-cols-[80px_1fr_50px] gap-2 text-xs text-viewer-text-muted font-medium pb-2 border-b border-viewer-border">
            <span>Region</span>
            <span>Series Name</span>
            <span className="text-right">Slices</span>
          </div>

          {/* Scrollable table body */}
          <div className="flex-1 overflow-y-auto mt-1">
            {seriesTable.map((row, index) => {
              const isSelected = hasDicomLoaded && row.seriesUID === selectedDicomSeriesUID;
              
              return (
                <div
                  key={index}
                  className={`
                    grid grid-cols-[80px_1fr_50px] gap-2 py-1.5 text-sm 
                    hover:bg-viewer-bg/50 rounded px-1 -mx-1
                    ${isSelected ? 'bg-viewer-accent/20' : ''}
                  `}
                >
                  <span className="text-viewer-text-muted truncate">{row.region}</span>
                  <span className={`truncate ${isSelected ? 'text-viewer-accent' : 'text-viewer-text'}`}>
                    {row.seriesName}
                  </span>
                  <span className="text-viewer-text-muted text-right">{row.sliceCount}</span>
                </div>
              );
            })}
          </div>
        </SidebarSection>
      </div>
    </aside>
  );
}
