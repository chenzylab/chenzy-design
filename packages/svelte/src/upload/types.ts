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
  /** 校验失败时的本地化提示（如大小超限/过小）；status==='error' 时展示 */
  error?: string;
  /** 目录上传时文件相对路径（webkitRelativePath，若可用） */
  relativePath?: string;
}
