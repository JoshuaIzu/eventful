declare module 'multer' {
  interface FileFilterCallback {
    (error: Error | null, acceptFile: boolean): void;
  }

  interface Multer {
    (options?: MulterOptions): Multer;
    memoryStorage(): StorageEngine;
    diskStorage(options: DiskStorageOptions): StorageEngine;
  }

  interface MulterOptions {
    storage?: StorageEngine;
    limits?: {
      fileSize?: number;
      files?: number;
      fields?: { [fieldName: string]: number };
    };
    fileFilter?: (
      req: any,
      file: any,
      callback: FileFilterCallback
    ) => void;
  }

  interface StorageEngine {
    _handleFile(
      req: any,
      file: any,
      callback: (error?: Error | null, info?: any) => void
    ): void;
    _removeFile(
      req: any,
      file: any,
      callback: (error?: Error | null) => void
    ): void;
  }

  interface DiskStorageOptions {
    destination?: string | ((req: any, file: any, callback: (error: Error | null, destination: string) => void) => void);
    filename?: string | ((req: any, file: any, callback: (error: Error | null, filename: string) => void) => void);
  }

  const multer: Multer;
  export = multer;
}
