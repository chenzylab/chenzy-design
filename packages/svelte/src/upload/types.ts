import type { Snippet } from 'svelte';

export type UploadStatus = 'ready' | 'uploading' | 'success' | 'error';

/** 静态对象或按当前 file 求值的函数（对标 Semi data/headers）。 */
export type UploadDataOrFn = Record<string, string> | ((file: File) => Record<string, string>);

/**
 * 文件名超长提示配置（对标 Semi showTooltip）。
 * boolean：true=用原生 title 属性；false=不展示。
 * 对象：type 选 Tooltip/Popover 组件包裹文件名；opts 透传给组件；renderTooltip 自定义提示内容渲染。
 */
export type UploadShowTooltip =
  | boolean
  | {
      type?: 'tooltip' | 'popover';
      opts?: Record<string, unknown>;
      renderTooltip?: Snippet<[{ content: string }]>;
    };

/**
 * 文件列表标题（对标 Semi fileListTitle）。
 * string：仅替换标题文字（保留默认清空按钮）；false：不渲染标题区；
 * Snippet：完全自定义标题区（入参含 fileList / onClear / clearText）。
 */
export type UploadFileListTitle =
  | string
  | false
  | Snippet<[{ fileList: UploadFileItem[]; onClear: () => void; clearText: string }]>;

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
