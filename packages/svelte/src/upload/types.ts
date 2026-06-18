export type UploadStatus = 'ready' | 'uploading' | 'success' | 'error';

export interface UploadFileItem {
  uid: string;
  name: string;
  size: number;
  status: UploadStatus;
  percent?: number;
  file?: File;
}
