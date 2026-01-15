import type { MockStudyData } from '../types';

/**
 * Mock study data for the MRI Viewer
 * This file contains all the sample data displayed in the UI
 * Customize this file to change body regions, series, and study metadata
 */
export const mockStudyData: MockStudyData = {
  studyInfo: {
    studyDate: 'Nov 26, 2025',
    modality: 'MRI',
    description: 'MRI BRAIN W/O CONTRAST; MRI SPINE CERVICAL W/O CONTRAST',
    institution: 'Advanced Medical Imaging Center',
    referring: 'Dr. Smith, John',
    accession: 'WM2352-109',
    patientName: 'Tobias Lutke',
    mrn: '123456789',
  },
  
  reportInfo: {
    radiologist: 'Dr. Johnson, Sarah',
    reportDate: '2025-11-29',
    status: 'Final',
  },
  
  bodyRegions: [
    {
      id: 'localizer',
      name: 'Localizer',
      icon: 'Target',
      totalSlices: 383,
      series: [
        { id: 'localizer-whole-body', name: 'Whole Body Localizer', sliceCount: 383, orientation: 'Coronal', sequence: 'Localizer' },
      ],
    },
    {
      id: 'brain',
      name: 'Brain',
      icon: 'Brain',
      totalSlices: 595,
      series: [
        { id: 'brain-tof-3d-source', name: 'TOF MRA 3D Source', sliceCount: 298, orientation: 'Axial', sequence: 'TOF' },
        { id: 'brain-tof-3d-composite', name: 'TOF MRA 3D Composite', sliceCount: 1, orientation: 'Axial', sequence: 'TOF' },
        { id: 'brain-tof-radial-mip', name: 'TOF MRA Radial MIP', sliceCount: 34, orientation: 'Axial', sequence: 'TOF' },
        { id: 'brain-tof-axial-mip', name: 'TOF MRA Axial MIP', sliceCount: 12, orientation: 'Axial', sequence: 'TOF' },
        { id: 'brain-tof-coronal-mip', name: 'TOF MRA Coronal MIP', sliceCount: 1, orientation: 'Coronal', sequence: 'TOF' },
        { id: 'brain-tof-sagittal-mip', name: 'TOF MRA Sagittal MIP', sliceCount: 1, orientation: 'Sagittal', sequence: 'TOF' },
        { id: 'brain-axial-t2', name: 'Brain Axial T2', sliceCount: 25, orientation: 'Axial', sequence: 'T2' },
        { id: 'brain-axial-flair', name: 'Brain Axial FLAIR', sliceCount: 25, orientation: 'Axial', sequence: 'FLAIR' },
        { id: 'brain-axial-t1', name: 'Brain Axial T1', sliceCount: 52, orientation: 'Axial', sequence: 'T1' },
        { id: 'brain-dwi', name: 'Brain DWI', sliceCount: 26, orientation: 'Axial', sequence: 'DWI' },
        { id: 'brain-adc', name: 'Brain ADC', sliceCount: 30, orientation: 'Axial', sequence: 'ADC' },
      ],
    },
    {
      id: 'neck',
      name: 'Neck',
      icon: 'User',
      totalSlices: 184,
      series: [
        { id: 'neck-axial-t2', name: 'Neck Axial T2', sliceCount: 92, orientation: 'Axial', sequence: 'T2' },
        { id: 'neck-sagittal-t1', name: 'Neck Sagittal T1', sliceCount: 92, orientation: 'Sagittal', sequence: 'T1' },
      ],
    },
    {
      id: 'spine',
      name: 'Spine',
      icon: 'Bone',
      totalSlices: 160,
      series: [
        { id: 'spine-sagittal-t2', name: 'Spine Sagittal T2', sliceCount: 95, orientation: 'Sagittal', sequence: 'T2 SPACE' },
        { id: 'spine-sagittal-t2-filtered', name: 'Spine Sagittal T2 Filtered', sliceCount: 28, orientation: 'Sagittal', sequence: 'T2 SPACE' },
        { id: 'spine-sagittal-stir', name: 'Spine Sagittal STIR', sliceCount: 20, orientation: 'Sagittal', sequence: 'STIR' },
        { id: 'spine-sagittal-stir-filtered', name: 'Spine Sagittal STIR Filtered', sliceCount: 25, orientation: 'Sagittal', sequence: 'STIR' },
      ],
    },
    {
      id: 'chest',
      name: 'Chest',
      icon: 'Heart',
      totalSlices: 105,
      series: [
        { id: 'chest-axial-t2', name: 'Chest Axial T2', sliceCount: 55, orientation: 'Axial', sequence: 'T2' },
        { id: 'chest-coronal-t1', name: 'Chest Coronal T1', sliceCount: 50, orientation: 'Coronal', sequence: 'T1' },
      ],
    },
    {
      id: 'shoulders',
      name: 'Shoulders',
      icon: 'Activity',
      totalSlices: 111,
      series: [
        { id: 'shoulders-axial-pd', name: 'Shoulders Axial PD', sliceCount: 56, orientation: 'Axial', sequence: 'PD' },
        { id: 'shoulders-coronal-t2', name: 'Shoulders Coronal T2', sliceCount: 55, orientation: 'Coronal', sequence: 'T2' },
      ],
    },
    {
      id: 'abdomen',
      name: 'Abdomen',
      icon: 'Circle',
      totalSlices: 456,
      series: [
        { id: 'abdomen-axial-t2', name: 'Abdomen Axial T2', sliceCount: 228, orientation: 'Axial', sequence: 'T2' },
        { id: 'abdomen-coronal-t1', name: 'Abdomen Coronal T1', sliceCount: 228, orientation: 'Coronal', sequence: 'T1' },
      ],
    },
    {
      id: 'pelvis',
      name: 'Pelvis',
      icon: 'Hexagon',
      totalSlices: 24,
      series: [
        { id: 'pelvis-axial-t2', name: 'Pelvis Axial T2', sliceCount: 24, orientation: 'Axial', sequence: 'T2' },
      ],
    },
    {
      id: 'hips',
      name: 'Hips',
      icon: 'Diamond',
      totalSlices: 24,
      series: [
        { id: 'hips-coronal-pd', name: 'Hips Coronal PD', sliceCount: 24, orientation: 'Coronal', sequence: 'PD' },
      ],
    },
    {
      id: 'knees',
      name: 'Knees',
      icon: 'Disc',
      totalSlices: 54,
      series: [
        { id: 'knees-sagittal-pd', name: 'Knees Sagittal PD', sliceCount: 27, orientation: 'Sagittal', sequence: 'PD' },
        { id: 'knees-axial-t2', name: 'Knees Axial T2', sliceCount: 27, orientation: 'Axial', sequence: 'T2' },
      ],
    },
  ],
  
  // Series table data for the right sidebar
  seriesTable: [
    { region: 'Localizer', seriesName: 'Whole Body Localizer', sliceCount: 383 },
    { region: 'Brain', seriesName: 'TOF MRA 3D Source', sliceCount: 298 },
    { region: 'Brain', seriesName: 'TOF MRA 3D Composite', sliceCount: 1 },
    { region: 'Brain', seriesName: 'TOF MRA Radial MIP', sliceCount: 34 },
    { region: 'Brain', seriesName: 'TOF MRA Axial MIP', sliceCount: 12 },
    { region: 'Brain', seriesName: 'TOF MRA Coronal MIP', sliceCount: 1 },
    { region: 'Brain', seriesName: 'TOF MRA Sagittal MIP', sliceCount: 1 },
    { region: 'Brain', seriesName: 'Brain Axial T2', sliceCount: 25 },
    { region: 'Brain', seriesName: 'Brain Axial FLAIR', sliceCount: 25 },
    { region: 'Brain', seriesName: 'Brain Axial T1', sliceCount: 52 },
    { region: 'Brain', seriesName: 'Brain DWI', sliceCount: 26 },
    { region: 'Brain', seriesName: 'Brain ADC', sliceCount: 30 },
  ],
};

/**
 * Helper function to find a series by ID
 */
export function findSeriesById(seriesId: string): { region: typeof mockStudyData.bodyRegions[0]; series: typeof mockStudyData.bodyRegions[0]['series'][0] } | null {
  for (const region of mockStudyData.bodyRegions) {
    const series = region.series.find((s) => s.id === seriesId);
    if (series) {
      return { region, series };
    }
  }
  return null;
}

/**
 * Helper function to find a region by ID
 */
export function findRegionById(regionId: string): typeof mockStudyData.bodyRegions[0] | null {
  return mockStudyData.bodyRegions.find((r) => r.id === regionId) ?? null;
}
