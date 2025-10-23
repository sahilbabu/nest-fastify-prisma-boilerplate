export interface IStorageDriver {
  upload(file: Buffer, filename: string, mimeType: string): Promise<{ path: string; url?: string }>;
  delete(path: string): Promise<void>;
  getUrl(path: string, isPublic?: boolean): Promise<string>;
  exists(path: string): Promise<boolean>;
}
