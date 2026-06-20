export type UploadStatus = 'ready' | 'uploading' | 'success' | 'error';

export interface UploadFileItem {
  uid: string;
  name: string;
  size: number;
  status: UploadStatus;
  percent?: number;
  file?: File;
  /** 远程预览地址（image/picture-card 列表优先用它，否则由 file 生成 objectURL） */
  url?: string;
}
