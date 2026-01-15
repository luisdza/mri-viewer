/**
 * DICOM Importer Module
 * 
 * This module handles:
 * - Parsing DICOM files
 * - Extracting metadata
 * - Grouping files by Study/Series
 * - Sorting instances by position
 */

import dicomParser from 'dicom-parser';
import type { DicomStudy, DicomSeries, DicomInstance, DicomImportResult } from '../types';
import { createImageIdForFile } from './cornerstoneInit';

/**
 * Helper to safely get a string from DICOM dataset
 */
function getString(dataSet: dicomParser.DataSet, tag: string): string {
  try {
    return dataSet.string(tag) || '';
  } catch {
    return '';
  }
}

/**
 * Helper to safely get a number from DICOM dataset
 */
function getNumber(dataSet: dicomParser.DataSet, tag: string): number {
  try {
    const value = dataSet.intString(tag);
    return value !== undefined ? value : 0;
  } catch {
    return 0;
  }
}

/**
 * Helper to parse ImagePositionPatient (3D coordinates)
 */
function getImagePosition(dataSet: dicomParser.DataSet): number[] | null {
  try {
    const posString = dataSet.string('x00200032'); // ImagePositionPatient
    if (posString) {
      const parts = posString.split('\\').map(Number);
      if (parts.length === 3 && parts.every((n) => !isNaN(n))) {
        return parts;
      }
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Helper to get slice location
 */
function getSliceLocation(dataSet: dicomParser.DataSet): number | null {
  try {
    const value = dataSet.floatString('x00201041'); // SliceLocation
    return value !== undefined ? value : null;
  } catch {
    return null;
  }
}

/**
 * Format DICOM date string to readable format
 */
function formatDicomDate(dateStr: string): string {
  if (!dateStr || dateStr.length !== 8) return dateStr || 'Unknown';
  const year = dateStr.substring(0, 4);
  const month = dateStr.substring(4, 6);
  const day = dateStr.substring(6, 8);
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthIndex = parseInt(month, 10) - 1;
  return `${monthNames[monthIndex] || month} ${parseInt(day, 10)}, ${year}`;
}

/**
 * Parse a single DICOM file and extract metadata
 */
async function parseDicomFile(file: File): Promise<{
  study: Partial<DicomStudy>;
  series: Partial<DicomSeries>;
  instance: DicomInstance;
} | null> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    
    reader.onload = () => {
      try {
        const arrayBuffer = reader.result as ArrayBuffer;
        const byteArray = new Uint8Array(arrayBuffer);
        const dataSet = dicomParser.parseDicom(byteArray);
        
        // Create image ID for this file
        const imageId = createImageIdForFile(file);
        
        // Extract study-level metadata
        const study: Partial<DicomStudy> = {
          studyInstanceUID: getString(dataSet, 'x0020000d'),
          studyDescription: getString(dataSet, 'x00081030') || 'Unnamed Study',
          studyDate: formatDicomDate(getString(dataSet, 'x00080020')),
          patientName: getString(dataSet, 'x00100010').replace(/\^/g, ' ').trim() || 'Unknown Patient',
          patientId: getString(dataSet, 'x00100020') || 'Unknown',
          accessionNumber: getString(dataSet, 'x00080050') || '',
          institution: getString(dataSet, 'x00080080') || 'Unknown Institution',
          referringPhysician: getString(dataSet, 'x00080090').replace(/\^/g, ' ').trim() || '',
          modality: getString(dataSet, 'x00080060') || 'Unknown',
        };
        
        // Extract series-level metadata
        const series: Partial<DicomSeries> = {
          seriesInstanceUID: getString(dataSet, 'x0020000e'),
          seriesDescription: getString(dataSet, 'x0008103e') || 'Unnamed Series',
          seriesNumber: getNumber(dataSet, 'x00200011'),
          modality: getString(dataSet, 'x00080060') || 'Unknown',
        };
        
        // Extract instance-level metadata
        const instance: DicomInstance = {
          sopInstanceUID: getString(dataSet, 'x00080018'),
          imageId,
          instanceNumber: getNumber(dataSet, 'x00200013'),
          imagePositionPatient: getImagePosition(dataSet),
          sliceLocation: getSliceLocation(dataSet),
          file,
        };
        
        resolve({ study, series, instance });
      } catch (error) {
        console.warn(`Failed to parse DICOM file: ${file.name}`, error);
        resolve(null);
      }
    };
    
    reader.onerror = () => {
      console.warn(`Failed to read file: ${file.name}`);
      resolve(null);
    };
    
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Sort instances within a series by position/location
 */
function sortInstances(instances: DicomInstance[]): DicomInstance[] {
  return [...instances].sort((a, b) => {
    // First, try to sort by ImagePositionPatient (Z coordinate)
    if (a.imagePositionPatient && b.imagePositionPatient) {
      const zDiff = a.imagePositionPatient[2] - b.imagePositionPatient[2];
      if (Math.abs(zDiff) > 0.001) return zDiff;
    }
    
    // Fall back to SliceLocation
    if (a.sliceLocation !== null && b.sliceLocation !== null) {
      const locDiff = a.sliceLocation - b.sliceLocation;
      if (Math.abs(locDiff) > 0.001) return locDiff;
    }
    
    // Fall back to InstanceNumber
    return a.instanceNumber - b.instanceNumber;
  });
}

/**
 * Import DICOM files and organize into studies/series
 */
export async function importDicomFiles(
  files: FileList | File[],
  onProgress?: (current: number, total: number) => void
): Promise<DicomImportResult> {
  const fileArray = Array.from(files);
  const errors: string[] = [];
  let validFiles = 0;
  
  // Maps to group by Study/Series
  const studyMap = new Map<string, DicomStudy>();
  const seriesMap = new Map<string, DicomSeries>();
  
  // Parse all files
  for (let i = 0; i < fileArray.length; i++) {
    const file = fileArray[i];
    onProgress?.(i + 1, fileArray.length);
    
    // Skip non-DCM files (though we try to parse anyway)
    const result = await parseDicomFile(file);
    
    if (!result) {
      errors.push(`Failed to parse: ${file.name}`);
      continue;
    }
    
    const { study, series, instance } = result;
    
    // Validate required UIDs
    if (!study.studyInstanceUID || !series.seriesInstanceUID || !instance.sopInstanceUID) {
      errors.push(`Missing required UIDs: ${file.name}`);
      continue;
    }
    
    validFiles++;
    
    // Get or create study
    let studyObj = studyMap.get(study.studyInstanceUID);
    if (!studyObj) {
      studyObj = {
        studyInstanceUID: study.studyInstanceUID,
        studyDescription: study.studyDescription || 'Unnamed Study',
        studyDate: study.studyDate || 'Unknown Date',
        patientName: study.patientName || 'Unknown Patient',
        patientId: study.patientId || 'Unknown',
        accessionNumber: study.accessionNumber || '',
        institution: study.institution || 'Unknown Institution',
        referringPhysician: study.referringPhysician || '',
        modality: study.modality || 'Unknown',
        series: [],
      };
      studyMap.set(study.studyInstanceUID, studyObj);
    }
    
    // Get or create series
    let seriesObj = seriesMap.get(series.seriesInstanceUID);
    if (!seriesObj) {
      seriesObj = {
        seriesInstanceUID: series.seriesInstanceUID,
        seriesDescription: series.seriesDescription || 'Unnamed Series',
        seriesNumber: series.seriesNumber || 0,
        modality: series.modality || 'Unknown',
        instances: [],
        imageIds: [],
      };
      seriesMap.set(series.seriesInstanceUID, seriesObj);
      studyObj.series.push(seriesObj);
    }
    
    // Add instance to series
    seriesObj.instances.push(instance);
  }
  
  // Sort instances within each series and build imageIds array
  for (const series of seriesMap.values()) {
    series.instances = sortInstances(series.instances);
    series.imageIds = series.instances.map((inst) => inst.imageId);
  }
  
  // Sort series within each study by series number
  for (const study of studyMap.values()) {
    study.series.sort((a, b) => a.seriesNumber - b.seriesNumber);
  }
  
  // Convert to array
  const studies = Array.from(studyMap.values());
  
  return {
    studies,
    totalFiles: fileArray.length,
    validFiles,
    errors: errors.slice(0, 10), // Limit error messages
  };
}

/**
 * Get series by UID from studies array
 */
export function findSeriesByUID(
  studies: DicomStudy[],
  seriesUID: string
): { study: DicomStudy; series: DicomSeries } | null {
  for (const study of studies) {
    const series = study.series.find((s) => s.seriesInstanceUID === seriesUID);
    if (series) {
      return { study, series };
    }
  }
  return null;
}
