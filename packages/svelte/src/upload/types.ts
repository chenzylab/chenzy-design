import type { Snippet } from 'svelte';

/**
 * 文件项上传状态（对齐 Semi FileItemStatus）：
 * - `wait`：已入列，等待上传（旧值 `ready`）。
 * - `validating`：校验中（异步 beforeUpload/transformFile 进行中的中间态）。
 * - `uploading`：上传中。
 * - `success`：上传成功。
 * - `validateFail`：校验失败（accept/maxSize/minSize 等不符）。不显示重试。
 * - `uploadFail`：上传失败（网络/超时等）。可重试（retry）。
 */
export type UploadStatus =
  | 'wait'
  | 'validating'
  | 'uploading'
  | 'success'
  | 'validateFail'
  | 'uploadFail';

/** 静态对象或按当前 file 求值的函数（对标 Semi data/headers）。 */
export type UploadDataOrFn = Record<string, string> | ((file: File) => Record<string, string>);

/**
 * 文件名超长提示配置（对标 Semi showTooltip）。
 * boolean：true=用原生 title 属性；false=不展示。
 * 对象：type 选 Tooltip/Popover 组件包裹文件名；opts 透传给组件；
 * renderTooltip 完全接管浮层——与 Semi `(content, children) => ReactNode` 语义一致：
 * 传入 content（文件名文案）与 children（渲染文件名节点的 Snippet），
 * 由用户自行组织（如 `<Tooltip content={content}>{@render children()}</Tooltip>`）。
 * 传了 renderTooltip 时不再套内置 Tooltip/Popover（也不要求先声明 type）。
 */
export type UploadShowTooltip =
  | boolean
  | {
      type?: 'tooltip' | 'popover';
      opts?: Record<string, unknown>;
      renderTooltip?: Snippet<[{ content: string; children: Snippet }]>;
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
  /**
   * 原始 File 对象。对标 Semi `fileInstance`——本仓库统一命名为 `file`，
   * 二者等价（同一 File 引用）；Semi demo 里读 `fileItem.fileInstance` 的写法请改用 `fileItem.file`。
   */
  file?: File;
  /**
   * 是否为该项启用内置缩略图预览（对标 Semi preview）。
   * image/picture-card 列表中：`preview === true` 或存在 `url` 时读取地址显示缩略图；
   * 显式 `preview === false` 可禁用缩略图（即便有 url 也不预览）。不传时按有无 url 判定（默认预览）。
   */
  preview?: boolean;
  /** 远程预览地址（image/picture-card 列表优先用它，否则由 file 生成 objectURL） */
  url?: string;
  /** 校验失败时的本地化提示（如大小超限/过小）；status==='validateFail' 时展示 */
  error?: string;
  /**
   * 校验/上传信息文案（对标 Semi validateMessage）。与 `error` 等价并存：
   * 优先展示 `validateMessage`，回退 `error`。供 afterUpload/beforeUpload 回写自定义文案。
   */
  validateMessage?: string;
  /**
   * 项级：单独控制该文件项在 success 态是否显示"替换"按钮（对标 Semi FileItem.showReplace）。
   * 覆盖组件级 `showReplace`；不传时跟随组件级。
   */
  showReplace?: boolean;
  /**
   * 项级：单独控制该文件项在 uploadFail 态是否显示"重试"按钮（对标 Semi FileItem.showRetry）。
   * 覆盖组件级 `showRetry`；不传时跟随组件级。
   */
  showRetry?: boolean;
  /** 服务端响应体（对标 Semi FileItem.response）。XHR success 后写入 responseText 或解析后的 JSON。 */
  response?: unknown;
  /** 关联的 XHR 事件（对标 Semi FileItem.event）。成功/失败时的原始 ProgressEvent，供业务读取。 */
  event?: Event;
  /** 目录上传时文件相对路径（webkitRelativePath，若可用） */
  relativePath?: string;
}
