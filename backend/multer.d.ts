declare module 'multer' {
  import { RequestHandler } from 'express';

  export interface FileFilterCallback {
    (error: Error | null, acceptFile: boolean): void;
  }

  export interface Multer {
    (options?: MulterOptions): Multer;
    memoryStorage(): StorageEngine;
    diskStorage(options: DiskStorageOptions): StorageEngine;
    single(fieldName: string): RequestHandler;
    array(fieldName: string, maxCount?: number): RequestHandler;
    fields(fields: Array<{ name: string; maxCount?: number }>): RequestHandler;
    none(): RequestHandler;
    any(): RequestHandler;
  }

  export interface MulterOptions {
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

  export interface StorageEngine {
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

  export interface DiskStorageOptions {
    destination?: string | ((req: any, file: any, callback: (error: Error | null, destination: string) => void) => void);
    filename?: string | ((req: any, file: any, callback: (error: Error | null, filename: string) => void) => void);
  }

  const multer: Multer;
  export default multer;
}
