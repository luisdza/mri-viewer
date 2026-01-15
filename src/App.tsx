import { TopBar, BodyRegionsSidebar, ViewerPanel, RightSidebar } from './components/Layout';
import { DicomImportModal } from './components/common';

/**
 * MRI Viewer Clone Application
 * 
 * A React + TypeScript + Tailwind application that mimics a medical imaging viewer.
 * Supports loading real DICOM files via the Import DICOM button.
 * 
 * Layout Structure:
 * ┌────────────────────────────────────────────────────────────────────┐
 * │                           TopBar (fixed)                           │
 * ├──────────────┬───────────────────────────────────┬─────────────────┤
 * │              │                                   │                 │
 * │   Body       │       Viewer Panel                │    Right        │
 * │   Regions    │   (Cornerstone Viewport)          │    Sidebar      │
 * │   Sidebar    │                                   │                 │
 * │   (~260px)   │       (flexible)                  │    (~320px)     │
 * │              │                                   │                 │
 * │              ├───────────────────────────────────┤                 │
 * │              │   Controls (slice, W/L sliders)   │                 │
 * └──────────────┴───────────────────────────────────┴─────────────────┘
 */
function App() {
  return (
    <div className="h-screen w-screen flex flex-col bg-viewer-bg text-viewer-text overflow-hidden">
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

export default App;
