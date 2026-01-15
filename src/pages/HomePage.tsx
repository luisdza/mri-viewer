import { useNavigate } from 'react-router-dom';

/**
 * Home Page - Landing page that loads minimal JS
 * User can choose to open the viewer from here
 */
export function HomePage() {
  const navigate = useNavigate();

  return (
    <main id="main-content" className="h-screen w-screen flex flex-col items-center justify-center bg-viewer-bg text-viewer-text">
      <div className="text-center max-w-2xl px-8">
        <h1 className="text-4xl font-bold mb-4">MRI Viewer</h1>
        <p className="text-lg text-gray-400 mb-8">
          A medical imaging viewer for DICOM files with advanced visualization capabilities
        </p>
        
        <div className="space-y-4">
          <button
            onClick={() => navigate('/viewer')}
            className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-lg font-semibold transition-colors focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50"
            aria-label="Open MRI Viewer application"
          >
            Open Viewer
          </button>
          
          <p className="text-sm text-gray-500" role="note">
            The viewer will load Cornerstone3D libraries on demand
          </p>
        </div>
      </div>
    </main>
  );
}
