import { useState, useCallback, useRef } from 'react';
import { X, Upload, FileImage, AlertCircle, CheckCircle2, Loader2, Folder, File } from 'lucide-react';
import { useViewerStore } from '../../store/viewerStore';
import { importDicomFiles } from '../../lib/dicomImporter';
import { initializeCornerstone } from '../../lib/cornerstoneInit';

/**
 * DICOM Import Modal
 * 
 * Allows users to:
 * - Drag & drop DICOM files
 * - Select files via file picker
 * - Shows import progress and results
 */
export function DicomImportModal() {
  const {
    showImportModal,
    setShowImportModal,
    setDicomStudies,
    setLoadingState,
    setErrorMessage,
  } = useViewerStore();
  
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    details?: string[];
  } | null>(null);
  const [selectionMode, setSelectionMode] = useState<'files' | 'folder'>('folder');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleClose = useCallback(() => {
    if (!isProcessing) {
      setShowImportModal(false);
      setResult(null);
    }
  }, [isProcessing, setShowImportModal]);
  
  const processFiles = useCallback(async (files: FileList | File[]) => {
    if (files.length === 0) return;
    
    setIsProcessing(true);
    setResult(null);
    setLoadingState('loading', 'Initializing...');
    
    try {
      // Initialize Cornerstone if not already done
      await initializeCornerstone();
      
      setLoadingState('loading', 'Parsing DICOM files...');
      
      // Import files with progress tracking
      const importResult = await importDicomFiles(files, (current, total) => {
        setProgress({ current, total });
        setLoadingState('loading', `Processing file ${current} of ${total}...`);
      });
      
      if (importResult.validFiles === 0) {
        setResult({
          success: false,
          message: 'No valid DICOM files found',
          details: importResult.errors.length > 0 
            ? importResult.errors 
            : ['The selected files do not appear to be valid DICOM files.'],
        });
        setLoadingState('error', 'No valid DICOM files found');
        setErrorMessage('No valid DICOM files found in the selected files.');
        return;
      }
      
      // Calculate totals
      let totalSeries = 0;
      let totalImages = 0;
      for (const study of importResult.studies) {
        totalSeries += study.series.length;
        for (const series of study.series) {
          totalImages += series.instances.length;
        }
      }
      
      // Update store with imported studies
      setDicomStudies(importResult.studies);
      
      setResult({
        success: true,
        message: `Successfully loaded ${totalImages} images`,
        details: [
          `${importResult.studies.length} study(ies) found`,
          `${totalSeries} series found`,
          `${importResult.validFiles} of ${importResult.totalFiles} files processed`,
          ...(importResult.errors.length > 0 
            ? [`${importResult.errors.length} file(s) could not be parsed`] 
            : []),
        ],
      });
      
      // Auto-close after success
      setTimeout(() => {
        handleClose();
      }, 2000);
      
    } catch (error) {
      console.error('DICOM import error:', error);
      setResult({
        success: false,
        message: 'Failed to import DICOM files',
        details: [error instanceof Error ? error.message : 'Unknown error occurred'],
      });
      setLoadingState('error', 'Import failed');
      setErrorMessage('Failed to import DICOM files. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  }, [setDicomStudies, setLoadingState, setErrorMessage, handleClose]);
  
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);
  
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);
  
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);
  
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    processFiles(files);
  }, [processFiles]);
  
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      processFiles(files);
    }
  }, [processFiles]);
  
  const handleBrowseClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);
  
  if (!showImportModal) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-viewer-panel border border-viewer-border rounded-xl shadow-2xl w-full max-w-lg mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-viewer-border">
          <div className="flex items-center gap-3">
            <FileImage className="text-viewer-accent" size={24} />
            <h2 className="text-lg font-semibold text-viewer-text">Import DICOM Files</h2>
          </div>
          <button
            onClick={handleClose}
            disabled={isProcessing}
            className="p-1 text-viewer-text-muted hover:text-viewer-text transition-colors disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6">
          {/* Drop zone */}
          <div
            className={`
              relative border-2 border-dashed rounded-lg p-8 text-center transition-colors
              ${isDragging 
                ? 'border-viewer-accent bg-viewer-accent/10' 
                : 'border-viewer-border hover:border-viewer-accent/50'
              }
              ${isProcessing ? 'pointer-events-none opacity-60' : ''}
            `}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple={selectionMode === 'files'}
              {...(selectionMode === 'folder' ? { webkitdirectory: '', directory: '' } as any : {})}
              accept="*"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            {isProcessing ? (
              <div className="space-y-4">
                <Loader2 className="mx-auto text-viewer-accent animate-spin" size={48} />
                <div className="text-viewer-text">
                  Processing files...
                </div>
                <div className="text-viewer-text-muted text-sm">
                  {progress.current} of {progress.total} files
                </div>
                <div className="w-full bg-viewer-bg rounded-full h-2">
                  <div
                    className="bg-viewer-accent h-2 rounded-full transition-all"
                    style={{ width: `${progress.total > 0 ? (progress.current / progress.total) * 100 : 0}%` }}
                  />
                </div>
              </div>
            ) : (
              <>
                {selectionMode === 'folder' ? (
                  <Folder className="mx-auto text-viewer-text-muted mb-4" size={48} />
                ) : (
                  <Upload className="mx-auto text-viewer-text-muted mb-4" size={48} />
                )}
                <div className="text-viewer-text mb-2">
                  {selectionMode === 'folder' 
                    ? 'Select a folder to import all DICOM files'
                    : 'Drag & drop DICOM files here'
                  }
                </div>
                <div className="text-viewer-text-muted text-sm mb-4">
                  or
                </div>
                
                {/* Mode toggle */}
                <div className="flex gap-2 mb-4 justify-center">
                  <button
                    onClick={() => setSelectionMode('folder')}
                    className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                      selectionMode === 'folder'
                        ? 'bg-viewer-accent text-white'
                        : 'bg-viewer-bg text-viewer-text-muted hover:text-viewer-text'
                    }`}
                  >
                    <Folder size={16} />
                    Select Folder
                  </button>
                  <button
                    onClick={() => setSelectionMode('files')}
                    className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                      selectionMode === 'files'
                        ? 'bg-viewer-accent text-white'
                        : 'bg-viewer-bg text-viewer-text-muted hover:text-viewer-text'
                    }`}
                  >
                    <File size={16} />
                    Select Files
                  </button>
                </div>
                
                <button
                  onClick={handleBrowseClick}
                  className="px-6 py-2 bg-viewer-accent text-white rounded-lg hover:bg-viewer-accent/80 transition-colors"
                >
                  {selectionMode === 'folder' ? 'Browse Folder' : 'Browse Files'}
                </button>
                <div className="text-viewer-text-muted text-xs mt-4">
                  {selectionMode === 'folder'
                    ? 'All files in the folder and subfolders will be scanned for DICOM data'
                    : 'Select individual DICOM files to import'
                  }
                </div>
              </>
            )}
          </div>
          
          {/* Result message */}
          {result && (
            <div
              className={`mt-4 p-4 rounded-lg ${
                result.success 
                  ? 'bg-green-900/30 border border-green-700/50' 
                  : 'bg-red-900/30 border border-red-700/50'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                {result.success ? (
                  <CheckCircle2 className="text-green-400" size={20} />
                ) : (
                  <AlertCircle className="text-red-400" size={20} />
                )}
                <span className={result.success ? 'text-green-400' : 'text-red-400'}>
                  {result.message}
                </span>
              </div>
              {result.details && result.details.length > 0 && (
                <ul className="text-sm text-viewer-text-muted space-y-1 ml-7">
                  {result.details.map((detail, idx) => (
                    <li key={idx}>{detail}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="px-6 py-4 border-t border-viewer-border flex justify-end gap-3">
          <button
            onClick={handleClose}
            disabled={isProcessing}
            className="px-4 py-2 text-viewer-text-muted hover:text-viewer-text transition-colors disabled:opacity-50"
          >
            {result?.success ? 'Close' : 'Cancel'}
          </button>
        </div>
      </div>
    </div>
  );
}
