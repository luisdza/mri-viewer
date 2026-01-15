// Type declarations for packages that don't have official types

declare module '@cornerstonejs/dicom-image-loader' {
  import type * as cornerstone from '@cornerstonejs/core';
  
  interface External {
    cornerstone: typeof cornerstone;
    dicomParser: typeof import('dicom-parser');
  }
  
  interface DecodeConfig {
    convertFloatPixelDataToInt?: boolean;
    use16BitDataType?: boolean;
  }
  
  interface Configuration {
    useWebWorkers?: boolean;
    decodeConfig?: DecodeConfig;
  }
  
  interface TaskConfiguration {
    decodeTask?: {
      initializeCodecsOnStartup?: boolean;
      strict?: boolean;
    };
  }
  
  interface WebWorkerManagerOptions {
    maxWebWorkers: number;
    startWebWorkersOnDemand?: boolean;
    taskConfiguration?: TaskConfiguration;
  }
  
  interface FileManager {
    add: (file: File) => string;
    get: (imageId: string) => File | undefined;
    remove: (imageId: string) => void;
    purge: () => void;
  }
  
  interface WADOURILoader {
    loadImage: (imageId: string) => Promise<cornerstone.Types.IImage>;
    fileManager: FileManager;
  }
  
  interface WebWorkerManager {
    initialize: (options: WebWorkerManagerOptions) => void;
    terminate: () => void;
  }
  
  const cornerstoneDICOMImageLoader: {
    external: External;
    configure: (config: Configuration) => void;
    wadouri: WADOURILoader;
    webWorkerManager: WebWorkerManager;
  };
  
  export default cornerstoneDICOMImageLoader;
}
