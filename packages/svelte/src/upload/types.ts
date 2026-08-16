import type { Snippet } from 'svelte';

/**
 * 文件项上传状态（严格对齐 Semi FileItemStatus，constants.ts 真值）：
 * - `wait`：已入列，等待上传。
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

/**
 * 文件列表展示类型（严格对齐 Semi UploadListType，constants.ts LIST_TYPE 真值）：
 * - `list`（默认）：文本文件卡片列表。
 * - `picture`：照片墙缩略图网格。
 * - `none`：不渲染列表。
 */
export type UploadListType = 'list' | 'picture' | 'none';

/**
 * 组件级校验态（对齐 Semi validateStatus / ValidateStatus）。
 * 表单联动，影响上传区/边框色。
 */
export type UploadValidateStatus = 'default' | 'error' | 'warning' | 'success';

/** 提示位置（对齐 Semi PromptPositionType，constants.ts PROMPT_POSITION 真值）。 */
export type UploadPromptPosition = 'left' | 'right' | 'bottom';

/** 静态对象或按当前 file 求值的函数（对标 Semi data/headers）。 */
export type UploadDataOrFn = Record<string, string> | ((file: File) => Record<string, string>);

/**
 * 文件名超长提示配置（对标 Semi showTooltip）。
 * boolean：true=用 Tooltip 包裹文件名弹出提示；false=不弹出浮层（对齐 Semi，无 title 兜底）。
 * 对象：type 选 Tooltip/Popover 组件包裹文件名；opts 透传给组件；
 * renderTooltip 完全接管浮层——与 Semi `(content, children) => ReactNode` 语义一致。
 */
export type UploadShowTooltip =
  | boolean
  | {
      type?: 'tooltip' | 'popover';
      opts?: Record<string, unknown>;
      /** 完全接管浮层，位置参数 (fullText, trigger)，与 Semi `(content, children)` 及 Typography.Text 契约一致。 */
      renderTooltip?: Snippet<[string, Snippet]>;
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
  /** 文件体积的格式化展示串（严格对齐 Semi `size: string`，如 "1.2KB"/"3.4MB"，见 core getFileSize）。 */
  size: string;
  status: UploadStatus;
  percent?: number;
  /** 原始 File 对象（对齐 Semi `fileInstance`）。 */
  fileInstance?: File;
  /**
   * 是否为该项启用内置缩略图预览（对标 Semi preview）。
   * picture 列表中：`preview === true` 或存在 `url` 时读取地址显示缩略图；
   * 显式 `preview === false` 可禁用缩略图（即便有 url 也不预览）。不传时按有无 url 判定（默认预览）。
   */
  preview?: boolean;
  /** 远程预览地址（picture 列表优先用它，否则由 fileInstance 生成 objectURL） */
  url?: string;
  /**
   * 校验/上传信息文案（对标 Semi validateMessage）。status==='validateFail' 时展示。
   * 供 afterUpload/beforeUpload 回写自定义文案。
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

/**
 * beforeUpload 返回的富对象（对标 Semi BeforeUploadObjectResult）。
 * 除返回 boolean（true 通过/false 拒绝）外，可返回该对象精细控制：
 * - `shouldUpload`：是否继续上传（false 停在 validateFail/自定义 status）。
 * - `autoRemove`：true 则自动移除该文件项。
 * - `status`：直接改该项状态（如标 validateFail）。
 * - `validateMessage`：校验文案。
 * - `fileInstance`：替换上传的 File（如压缩后，对齐 Semi）。
 */
export interface BeforeUploadObjectResult {
  shouldUpload?: boolean;
  autoRemove?: boolean;
  status?: UploadStatus;
  validateMessage?: string;
  fileInstance?: File;
}

/** beforeUpload 入参（对标 Semi BeforeUploadProps）。 */
export interface BeforeUploadProps {
  file: UploadFileItem;
  fileList: UploadFileItem[];
}

/**
 * customRequest 入参（对标 Semi customRequestArgs）。消费者接管上传时通过
 * onProgress/onError/onSuccess 把结果回写进组件状态（对齐 Semi post() 里传给
 * option.customRequest 的完整字段集，而非仅传文件项）。
 */
export interface CustomRequestArgs {
  /** 当前上传字段名（对标 Semi fileName，回退链 name || fileName || fileInstance.name 求值后的结果）。 */
  fileName: string;
  /** 用户设置的 props.data（求值后的对象，静态或函数形态均已解析）。 */
  data: Record<string, unknown>;
  file: UploadFileItem;
  /** 原始 File 对象（对标 Semi fileInstance）。 */
  fileInstance: File;
  /** 上传进度回调，e 需含 total/loaded（对标 Semi onProgress）。 */
  onProgress: (e?: { total: number; loaded: number }) => void;
  /** 上传失败回调（对标 Semi onError）。 */
  onError: (userXhr?: { status?: number }, e?: Event) => void;
  /** 上传成功回调，response 为上传成功后的请求结果（对标 Semi onSuccess）。 */
  onSuccess: (response: unknown, e?: Event) => void;
  /** 用户设置的 props.withCredentials（对标 Semi withCredentials）。 */
  withCredentials: boolean;
  /** 用户设置的 props.action（对标 Semi action）。 */
  action: string;
}

/** afterUpload 入参（对标 Semi AfterUploadProps）。 */
export interface AfterUploadProps {
  response: unknown;
  file: UploadFileItem;
  fileList: UploadFileItem[];
}

/** afterUpload 返回（对标 Semi AfterUploadResult）。 */
export interface AfterUploadResult {
  autoRemove?: boolean;
  status?: UploadStatus;
  validateMessage?: string;
  name?: string;
  url?: string;
}

/**
 * render 家族入参（对标 Semi RenderFileItemProps）。
 * 在 UploadFileItem 基础上挂 index/listType/操作回调等全量字段，
 * 供 renderFileItem / renderFileOperation / renderPicInfo / renderPicPreviewIcon / previewFile 消费。
 */
export interface RenderFileItemProps extends UploadFileItem {
  index: number;
  listType: UploadListType;
  disabled: boolean;
  showRetry?: boolean;
  showReplace?: boolean;
  showPicInfo?: boolean;
  onRemove: () => void;
  onRetry: () => void;
  onReplace: () => void;
  onPreviewClick?: () => void;
}

/** renderPicClose 入参（对标 Semi RenderPictureCloseProps）。 */
export interface RenderPictureCloseProps {
  className: string;
  remove: () => void;
}
