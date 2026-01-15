import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HomePage } from './pages/HomePage';

// Lazy load entire ViewerPage to defer Cornerstone3D loading
const ViewerPage = lazy(() => import('./pages/ViewerPage').then(m => ({ default: m.ViewerPage })));

/**
 * MRI Viewer Clone Application
 * 
 * A React + TypeScript + Tailwind application that mimics a medical imaging viewer.
 * Supports loading real DICOM files via the Import DICOM button.
 * 
 * Route Structure:
 * - / : Landing page (minimal JS, fast load)
 * - /viewer : Full viewer with Cornerstone3D (lazy loaded)
 * 
 * This routing strategy defers loading 3+ MB of Cornerstone libraries
 * until the user explicitly opens the viewer.
 */
function App() {
  return (
    <BrowserRouter>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <Routes>
        {/* Home route - loads immediately with minimal JS */}
        <Route path="/" element={<HomePage />} />
        
        {/* Viewer route - lazy loads Cornerstone3D libraries on demand */}
        <Route 
          path="/viewer" 
          element={
            <Suspense fallback={
              <div className="h-screen w-screen flex items-center justify-center bg-viewer-bg text-viewer-text">
                <div className="text-center">
                  <div className="text-xl mb-2">Loading Medical Imaging Viewer...</div>
                  <div className="text-sm text-gray-400">Initializing Cornerstone3D libraries</div>
                </div>
              </div>
            }>
              <ViewerPage />
            </Suspense>
          } 
        />
        
        {/* Redirect any unknown routes to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
