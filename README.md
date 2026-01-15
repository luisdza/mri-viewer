# MRI Viewer Clone

A React + TypeScript + Tailwind CSS medical imaging viewer that supports loading and viewing real DICOM files.

<!--
Project created with:
npm create vite@latest mri-viewer-clone -- --template react-ts
cd mri-viewer-clone
npm install
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
npm install zustand lucide-react @cornerstonejs/core @cornerstonejs/tools @cornerstonejs/dicom-image-loader dicom-parser
-->

## Features

- 🏥 **Dark themed UI** matching professional medical imaging software
- 📁 **DICOM Import** - Load real DICOM files via drag & drop or file picker
- 📋 **Left sidebar** with body regions and imported DICOM series navigation
- 🖼️ **Cornerstone3D Viewport** for rendering actual DICOM images
- 📊 **Right sidebar** with study information, report details, and series table
- 🎚️ **Interactive controls** for slice navigation, brightness, and contrast
- 🔍 **Zoom support** via toolbar buttons and Ctrl+scroll
- 🖱️ **Slice scrolling** via mouse wheel
- 📂 **Multi-file support** - Import entire series with automatic grouping

## Installation

```bash
cd mri-viewer-clone
npm install
```

## Development

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Loading DICOM Files

1. Click the **"Import DICOM"** button (folder icon) in the toolbar
2. Either:
   - Drag & drop `.dcm` files into the drop zone
   - Click "Browse Files" to select files
3. The viewer will:
   - Parse all DICOM metadata
   - Group files by Study and Series
   - Sort slices by position
   - Display the first series automatically
4. Navigate between series using the left sidebar

## Build

```bash
npm run build
```

## Project Structure

```
src/
├── components/
│   ├── common/              # Reusable UI components
│   │   ├── ToolbarButton.tsx
│   │   ├── SidebarSection.tsx
│   │   └── DicomImportModal.tsx  # DICOM file import UI
│   ├── Layout/              # Main layout components
│   │   ├── TopBar.tsx
│   │   ├── BodyRegionsSidebar.tsx
│   │   ├── ViewerPanel.tsx
│   │   └── RightSidebar.tsx
│   └── viewer/              # Viewport components
│       └── CornerstoneViewport.tsx
├── data/
│   └── mockStudy.ts         # Mock study data (fallback display)
├── lib/
│   ├── cornerstoneInit.ts   # Cornerstone3D initialization
│   └── dicomImporter.ts     # DICOM file parsing and grouping
├── store/
│   └── viewerStore.ts       # Zustand state management
├── types/
│   └── index.ts             # TypeScript type definitions
├── App.tsx                  # Main application component
├── main.tsx                 # Entry point
└── index.css                # Tailwind CSS entry point
```

## DICOM Import Module

The `src/lib/dicomImporter.ts` module handles:

- **File Parsing**: Uses `dicom-parser` to extract metadata
- **Study Grouping**: Groups files by `StudyInstanceUID`
- **Series Grouping**: Groups files by `SeriesInstanceUID`
- **Instance Sorting**: Sorts by `ImagePositionPatient` or `SliceLocation`
- **Error Handling**: Reports invalid/unparseable files

### Supported DICOM Tags

- Patient Name, ID
- Study Date, Description, Accession
- Series Description, Number, Modality
- Instance Number, SOP Instance UID
- Image Position Patient, Slice Location

## State Management

The Zustand store (`src/store/viewerStore.ts`) manages:

### DICOM State
- `dicomStudies` - Imported study/series hierarchy
- `selectedDicomSeriesUID` - Currently selected series
- `currentImageIds` - Cornerstone image IDs for viewport
- `loadingState` - Import progress tracking
- `hasDicomLoaded` - Whether real DICOM is active

### Viewport State
- `currentSliceIndex` / `totalSlices`
- `zoom`, `brightness`, `contrast`

### Actions
- `setDicomStudies()` - Set imported studies
- `selectDicomSeries()` - Switch to a series
- `resetDicomState()` - Clear loaded DICOM

## Customization

### Modify Sample Body Regions

Edit `src/data/mockStudy.ts` to customize the sample data shown when no DICOM is loaded.

### Styling

Custom color palette in `tailwind.config.js`:

- `viewer-bg`: Main background color
- `viewer-panel`: Panel/sidebar background
- `viewer-card`: Card background
- `viewer-border`: Border color
- `viewer-accent`: Accent color (blue)
- `viewer-text`: Primary text color
- `viewer-text-muted`: Secondary text color
- `viewer-success`: Success indicator (green)

## Controls

| Action | Input |
|--------|-------|
| Import DICOM | Click folder icon in toolbar |
| Scroll through slices | Mouse wheel |
| Zoom in/out | Ctrl + Mouse wheel or toolbar buttons |
| Change slice | Slice slider |
| Adjust brightness | Brightness slider |
| Adjust contrast | Contrast slider |
| Select series | Click on series in left sidebar |

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first styling
- **Zustand** - State management
- **Cornerstone3D** - Medical imaging rendering
- **@cornerstonejs/dicom-image-loader** - DICOM file loading
- **dicom-parser** - DICOM metadata extraction
- **Lucide React** - Icon library

## Browser Requirements

- Modern browser with WebGL2 support
- SharedArrayBuffer support (requires COOP/COEP headers - configured in Vite)
- Recommended: Chrome, Firefox, Edge (latest versions)

## Troubleshooting

### "SharedArrayBuffer is not defined"
The Vite dev server is configured with the required headers. If deploying, ensure your server sends:
```
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
```

### DICOM files not loading
- Ensure files are valid DICOM format
- Check browser console for parsing errors
- Try files from a known-good DICOM source

### Blank viewport
- Check browser console for Cornerstone initialization errors
- Ensure WebGL2 is supported in your browser

## License

MIT
