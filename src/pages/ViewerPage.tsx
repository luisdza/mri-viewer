import { TopBar, BodyRegionsSidebar, RightSidebar, ViewerPanel } from '../components/Layout';
import { DicomImportModal } from '../components/common';

/**
 * Viewer Page - Full MRI viewer with Cornerstone3D
 * This page is lazy-loaded, so it only loads the heavy Cornerstone libraries when needed
 */
export function ViewerPage() {
  return (
    <div id="main-content" className="h-screen w-screen flex flex-col bg-viewer-bg text-viewer-text overflow-hidden">
      {/* Fixed top navigation bar */}
      <TopBar />
      
      {/* Main content area with 3-column layout */}
      <div className="flex-1 flex min-h-0">
        {/* Left sidebar: Body regions and series navigation */}
        <BodyRegionsSidebar />
        
        {/* Center: Main viewport and controls */}
        <ViewerPanel />
        
        {/* Right sidebar: Study info, report, series table */}
        <RightSidebar />
      </div>
      
      {/* DICOM Import Modal */}
      <DicomImportModal />
    </div>
  );
}
