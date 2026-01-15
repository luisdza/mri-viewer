/**
 * Cornerstone3D Initialization Module
 * 
 * This module sets up Cornerstone3D with the DICOM image loader
 * and configures all necessary components for DICOM viewing.
 */

import * as cornerstone from '@cornerstonejs/core';
import * as cornerstoneTools from '@cornerstonejs/tools';
import cornerstoneDICOMImageLoader from '@cornerstonejs/dicom-image-loader';
import dicomParser from 'dicom-parser';

// Track initialization state
let isInitialized = false;
let initializationPromise: Promise<void> | null = null;

/**
 * Initialize Cornerstone3D and all required loaders
 * This function is idempotent - safe to call multiple times
 */
export async function initializeCornerstone(): Promise<void> {
  // Return existing promise if initialization is in progress
  if (initializationPromise) {
    return initializationPromise;
  }

  // Return immediately if already initialized
  if (isInitialized) {
    return Promise.resolve();
  }

  initializationPromise = performInitialization();
  return initializationPromise;
}

async function performInitialization(): Promise<void> {
  try {
    // Initialize DICOM Image Loader with dicomParser FIRST
    cornerstoneDICOMImageLoader.external.cornerstone = cornerstone;
    cornerstoneDICOMImageLoader.external.dicomParser = dicomParser;

    // Configure the DICOM image loader WITHOUT web workers 
    // (web workers require complex setup with bundlers)
    cornerstoneDICOMImageLoader.configure({
      useWebWorkers: false, // Disable web workers for simpler setup
      decodeConfig: {
        convertFloatPixelDataToInt: false,
        use16BitDataType: true,
      },
    });

    // Register the DICOM image loader with Cornerstone BEFORE init
    cornerstone.imageLoader.registerImageLoader(
      'wadouri',
      cornerstoneDICOMImageLoader.wadouri.loadImage as unknown as cornerstone.Types.ImageLoaderFn
    );

    cornerstone.imageLoader.registerImageLoader(
      'dicomfile',
      cornerstoneDICOMImageLoader.wadouri.loadImage as unknown as cornerstone.Types.ImageLoaderFn
    );

    // Initialize Cornerstone3D core
    await cornerstone.init();

    // Initialize Cornerstone Tools
    await cornerstoneTools.init();

    isInitialized = true;
    console.log('Cornerstone3D initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Cornerstone3D:', error);
    initializationPromise = null;
    throw error;
  }
}

/**
 * Check if Cornerstone has been initialized
 */
export function isCornerstoneInitialized(): boolean {
  return isInitialized;
}

/**
 * Get the Cornerstone rendering engine or create one
 */
export function getRenderingEngine(engineId: string = 'mriViewerEngine'): cornerstone.RenderingEngine {
  let engine = cornerstone.getRenderingEngine(engineId);
  if (!engine) {
    engine = new cornerstone.RenderingEngine(engineId);
  }
  return engine as cornerstone.RenderingEngine;
}

/**
 * Create an image ID for a local DICOM file
 */
export function createImageIdForFile(file: File): string {
  const imageId = cornerstoneDICOMImageLoader.wadouri.fileManager.add(file);
  return imageId;
}

/**
 * Purge cached images to free memory
 */
export function purgeCache(): void {
  cornerstone.cache.purgeCache();
}

// Export cornerstone modules for use elsewhere
export { cornerstone, cornerstoneTools, cornerstoneDICOMImageLoader };
