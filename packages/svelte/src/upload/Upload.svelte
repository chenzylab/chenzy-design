<!--
  Upload — see specs/components/input/Upload.spec.md
  Basic subset: file selection (click + drag) + file list (name/size/status/remove).
  Controlled / uncontrolled `value`. 真实上传：有 action 且无 customRequest 时，
  选文件后自动 XHR 上传（uploading→进度→success/uploadFail），customRequest 优先；
  XHR 句柄存 Map，remove/卸载时 abort。uploading 时渲染 Progress（line）。
  listType=image/picture-card：缩略图预览（item.url 优先，否则 file → objectURL，移除/卸载 revoke）。
  concurrency 并发上限（0=不限，超出排队、完成补位，core createUploadQueue 调度）；
  beforeUpload 异步校验/转换（false/reject 跳过该文件，返回 File 替换，true 正常上传）。
  directory：input 命令式加 webkitdirectory，可递归选择整个目录（保留 relativePath）。
  minSize/maxSize：core validateFileSize 纯函数校验（单位 KB），超限标 validateFail + i18n 提示。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import {
    useId,
    useLiveAnnouncer,
    computeUploadPercent,
    isUploadOk,
    createUploadQueue,
    resolveBeforeUpload,
    validateFileSize,
    type BeforeUploadResult,
  } from '@chenzy-design/core';
  import { useLocale } from '../locale-provider/index.js';
  import { Progress } from '../progress/index.js';
  import { Modal } from '../modal/index.js';
  import { Cropper } from '../cropper/index.js';
  import { Tooltip } from '../tooltip/index.js';
  import { Popover } from '../popover/index.js';
  import { Icon } from '../icon/index.js';

  // 拖拽区默认图标（云上传，对齐 Semi drag-area 默认 IconUpload）。用户传 dragIcon 时覆盖。
  const DEFAULT_DRAG_ICON_SVG =
    '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M12 15V4m0 0L8 8m4-4 4 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M4 14v3.5A2.5 2.5 0 0 0 6.5 20h11a2.5 2.5 0 0 0 2.5-2.5V14" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  // 文件卡片预览占位图标（对标 Semi fileCard 非图片时的 IconFile）：通用文件轮廓。
  const DEFAULT_FILE_ICON_SVG =
    '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M6 2.75h7L18.25 8v13.25H6V2.75Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M13 3v5h5" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>';
  // 文件卡片失败态内联错误图标（对标 Semi fileCard file-card-icon-error 的 IconAlertCircle）。
  const DEFAULT_ERROR_ICON_SVG =
    '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.6"/><path d="M12 7.5v5.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><circle cx="12" cy="16.25" r="1" fill="currentColor"/></svg>';
  import type { CropperShape } from '../cropper/index.js';
  import type {
    UploadFileItem,
    UploadDataOrFn,
    UploadShowTooltip,
    UploadFileListTitle,
  } from './types.js';

  /**
   * 裁剪配置（对标 Semi CropProps）。crop=true 时用默认配置；传对象覆盖。
   */
  export interface UploadCropProps {
    /** 裁切框宽高比（w/h），如 16/9、1、4/3。 */
    aspectRatio?: number;
    /** 裁切框形状，默认 'rect'。round=圆形，roundRect=圆角矩形。 */
    shape?: CropperShape;
    /** 缩放下限。 */
    minZoom?: number;
    /** 缩放上限。 */
    maxZoom?: number;
    /** 滚轮缩放步长。 */
    zoomStep?: number;
    /** 输出图片质量 0-1，默认 0.92。 */
    quality?: number;
    /** 裁切结果非图片区域填充色，默认 '#fff'。 */
    fill?: string;
    /** 裁切弹窗标题。 */
    modalTitle?: string;
    /** 确认按钮文字。 */
    modalOkText?: string;
    /** 取消按钮文字。 */
    modalCancelText?: string;
  }

  /**
   * render 家族入参里的文件项：在 UploadFileItem 基础上挂操作方法（对标 Semi
   * `fileItem.onRemove()` 等直接可调）。与外层分开传的 remove/retry/preview 等价并存，
   * 便于同时兼容 Semi 写法（`fileItem.onRemove()`）与本仓库既有写法（`remove()`）。
   */
  type UploadFileItemWithOps = UploadFileItem & {
    onRemove: () => void;
    onRetry: () => void;
    onPreview: () => void;
    onReplace: () => void;
  };

  interface Props {
    value?: UploadFileItem[];
    defaultValue?: UploadFileItem[];
    accept?: string;
    multiple?: boolean;
    /** 上传整个目录（input 加 webkitdirectory，递归选择目录下所有文件）。 */
    directory?: boolean;
    limit?: number;
    /** Max size per file, in KB. */
    maxSize?: number;
    /** Min size per file, in KB. 小于此值的文件校验失败（error）。 */
    minSize?: number;
    disabled?: boolean;
    /**
     * 组件级尺寸（触发按钮/列表项），与其它表单控件一致。
     * 注意：区别于每个文件项的 file.size（字节体积）。
     */
    size?: 'small' | 'default' | 'large';
    /**
     * 组件级校验态（表单联动），影响上传区/边框色。
     * 注意：区别于每个文件项的 file.status（wait/uploading/success/validateFail/uploadFail 上传进度态）。
     */
    status?: 'default' | 'warning' | 'error';
    listType?: 'text' | 'image' | 'picture-card' | 'none';
    drag?: boolean;
    /** 上传地址；提供且无 customRequest 时选文件后自动 XHR 上传 */
    action?: string;
    /** 表单字段名，默认 'file' */
    uploadName?: string;
    /** 额外请求头。静态对象或按当前 file 求值的函数（对标 Semi headers） */
    headers?: UploadDataOrFn;
    /** 随文件一起提交的额外字段。静态对象或按当前 file 求值的函数（对标 Semi data） */
    uploadData?: UploadDataOrFn;
    /** 同时进行的上传数上限；0/不传=不限（受控调度，超出排队，完成补位） */
    concurrency?: number;
    /**
     * 每个文件上传前调用：返回 false / reject 跳过该文件（移除）；
     * 返回 File 替换为该文件（如压缩后）；返回 true / resolve 正常上传。异步会被 await。
     */
    beforeUpload?: (file: File, fileList: File[]) => BeforeUploadResult | Promise<BeforeUploadResult>;
    /** 自定义上传实现（优先于 action）。返回 Promise 时受 concurrency 调度（完成才释放槽位）。 */
    customRequest?: (item: UploadFileItem) => void | Promise<void>;
    onChange?: (list: UploadFileItem[]) => void;
    onExceed?: (files: File[]) => void;
    onSuccess?: (response: string, item: UploadFileItem) => void;
    onError?: (item: UploadFileItem) => void;
    /** 单文件上传进度回调（对标 Semi onProgress）。仅内置 XHR 上传触发，customRequest 外部自管 */
    onProgress?: (percent: number, item: UploadFileItem) => void;
    children?: Snippet;
    /** 上传失败是否显示重试按钮。默认 true */
    showRetry?: boolean;
    /**
     * 已上传（success）文件项上显示"替换"按钮，点击后重新选择文件替换该项（对标 Semi showReplace）。
     * text 列表与 picture-card 均支持。默认 false。
     */
    showReplace?: boolean;
    /** 是否渲染文件列表（text 列表 / picture 网格），false 时不渲染列表区但触发器/上传照常。默认 true（对标 Semi showUploadList） */
    showUploadList?: boolean;
    /** 是否显示批量清除按钮。默认 false（注：Semi 默认 true，本仓库为不破坏现有行为保持 false） */
    showClear?: boolean;
    /** 清除按钮点击回调 */
    onClear?: () => void;
    /**
     * 批量清除前的钩子（对标 Semi beforeClear）：返回 false / Promise.resolve(false) / reject
     * 会阻止清除；返回 true / 不返回则继续清除。支持异步（await）。入参为当前文件列表。
     */
    beforeClear?: (fileList: UploadFileItem[]) => boolean | Promise<boolean>;
    /**
     * 单个文件上传成功后的钩子（对标 Semi afterUpload）。在 XHR success（终态且无错误）后同步触发，
     * 可据返回值更新该文件项：status（改状态，如标记 error）、validateMessage（校验文案）、
     * name（重命名）、url（替换预览地址）、autoRemove（true 则自动移除该项）。
     * 注意：与 Semi 一致，afterUpload 为同步返回，不支持异步。
     */
    afterUpload?: (payload: { response: unknown; file: UploadFileItem; fileList: UploadFileItem[] }) => {
      autoRemove?: boolean;
      status?: UploadFileItem['status'];
      validateMessage?: string;
      name?: string;
      url?: string;
    } | void;
    /**
     * 文件列表标题（对标 Semi fileListTitle）。string=仅替换标题文字（保留默认清空按钮）；
     * false=不渲染标题区；Snippet=完全自定义标题区（入参 fileList/onClear/clearText）。
     * 默认 undefined（不渲染）
     */
    fileListTitle?: UploadFileListTitle;
    /**
     * 文件名超长提示（对标 Semi showTooltip）。boolean：true=原生 title 属性，false=不展示；
     * 对象：{ type?: 'tooltip'|'popover'; opts?; renderTooltip? } 用对应组件包裹文件名。默认 true
     */
    showTooltip?: UploadShowTooltip;
    /** 上传区提示内容（文字或 Snippet） */
    prompt?: string | Snippet;
    /** 提示位置：left/right 为水平排列，bottom 为下方。默认 'bottom' */
    promptPosition?: 'left' | 'right' | 'bottom';
    /** 拖拽放下回调 */
    onDrop?: (e: DragEvent, files: File[], rejectFiles: File[]) => void;
    /** 打开文件选择弹窗时回调 */
    onOpenFileDialog?: () => void;
    /** 预览图点击回调（image/picture-card listType） */
    onPreviewClick?: (fileItem: UploadFileItem) => void;
    /** accept 校验失败（文件类型不符）的回调 */
    onAcceptInvalid?: (files: File[]) => void;
    /** 重试回调 */
    onRetry?: (file: UploadFileItem) => void;
    /** 大小校验失败回调 */
    onSizeError?: (file: UploadFileItem, validResult: 'max' | 'min') => void;
    /** 校验失败统一文案（覆盖 i18n 默认文案） */
    validateMessage?: string;
    /** XHR withCredentials（跨域凭证） */
    withCredentials?: boolean;
    /** 上传前文件转换（async，返回转换后的 File） */
    transformFile?: (file: File) => Promise<File>;
    /** 拖拽区自定义图标 Snippet */
    dragIcon?: Snippet;
    /** 拖拽区主文案（Snippet 或 string） */
    dragMainText?: string | Snippet;
    /** 拖拽区副文案（Snippet 或 string） */
    dragSubText?: string | Snippet;
    /** 粘贴添加文件（监听 document paste） */
    addOnPasting?: boolean;
    /**
     * 粘贴上传出错时的回调（对标 Semi onPastingError）。addOnPasting 为 true 时，
     * 读取剪贴板文件失败（如权限拒绝 / 读取异常）会触发。
     */
    onPastingError?: (error: unknown) => void;
    /** 触发热点位置（拖拽区时无效）。'start'=前置，'end'=后置，'none'=隐藏触发器。默认 'start' */
    hotSpotLocation?: 'start' | 'end' | 'none';

    // ——— 裁剪集成（对标 Semi crop 家族）———
    /**
     * 启用图片裁切：选中 image/* 文件后先进裁切弹窗（Modal + Cropper），确认后用裁切结果
     * （canvas → toBlob → File，保留原文件名/type）替换原文件再走上传流程。非图片文件正常上传。
     * 传 true 用默认配置；传对象自定义裁切参数（宽高比/形状/质量等）。
     */
    crop?: boolean | UploadCropProps;
    /**
     * 裁切前钩子：返回 false / Promise<false> 跳过裁切直接上传该文件；返回 true / 不返回则继续裁切。
     * 支持异步返回。
     */
    beforeCrop?: (file: File) => boolean | Promise<boolean>;
    /** 裁切失败（如 canvas.toBlob 失败）时的回调。 */
    onCropError?: (err: unknown) => void;
    /** 透传给裁切 Modal 的额外 props（样式/宽度等）。loading/open 由内部控制。 */
    cropModalProps?: Record<string, unknown>;

    // ——— render 家族（对标 Semi render 函数，用 Svelte Snippet）———
    /**
     * 完全自定义单个文件项的渲染（替换默认列表项，list/text listType）。
     * 入参含 fileItem 与操作回调（remove/retry/preview）。
     */
    renderFileItem?: Snippet<[{ fileItem: UploadFileItemWithOps; remove: () => void; retry: () => void; preview: () => void }]>;
    /**
     * 自定义缩略图预览内容：返回内容替换默认的缩略图 <img>（image/picture-card listType）。
     * 对标 Semi previewFile：按 fileItem 返回预览节点。
     */
    previewFile?: Snippet<[{ fileItem: UploadFileItem }]>;
    /**
     * 自定义整个缩略图容器（picture-card listType）。对标 Semi renderThumbnail：
     * 与 previewFile 区别——previewFile 只替换缩略图内容（默认操作浮层/信息层保留），
     * renderThumbnail 接管整个缩略图区域（含图片本身，常配合 Image 组件实现点击放大）。
     */
    renderThumbnail?: Snippet<[{ fileItem: UploadFileItem }]>;
    /** 是否在 picture-card 上显示图片信息浮层（文件名等）。默认 false。只在 picture-card 有效。 */
    showPicInfo?: boolean;
    /** 自定义 picture-card 图片信息浮层渲染（showPicInfo 为 true 时生效）。 */
    renderPicInfo?: Snippet<[{ fileItem: UploadFileItem }]>;
    /**
     * 自定义照片墙 hover 时展示的预览图标（对标 Semi renderPicPreviewIcon）。
     * 只在 picture-card listType 有效。返回内容替换默认的预览热区/图标，
     * 常配合 onPreviewClick 监听点击。入参含 fileItem 与操作回调。
     */
    renderPicPreviewIcon?: Snippet<[{ fileItem: UploadFileItemWithOps; remove: () => void; retry: () => void; preview: () => void }]>;
    /**
     * 自定义照片墙的关闭（移除）按钮（对标 Semi renderPicClose）。
     * 只在 picture-card listType 有效。入参 className 为默认关闭按钮类名，remove 为移除回调。
     */
    renderPicClose?: Snippet<[{ className: string; remove: () => void }]>;
    /**
     * 自定义文件列表项操作区（对标 Semi renderFileOperation）。
     * 只在 text/list listType 有效。返回内容替换默认的重试/移除操作区，
     * 入参含 fileItem 与操作回调（remove/retry/preview）。
     */
    renderFileOperation?: Snippet<[{ fileItem: UploadFileItemWithOps; remove: () => void; retry: () => void; preview: () => void }]>;
    /**
     * 照片墙模式下自定义图片展示高度（对标 Semi picHeight）。number 视为像素。
     * 只在 image/picture-card listType 有效，写入缩略图卡片 inline style。
     */
    picHeight?: number | string;
    /**
     * 照片墙模式下自定义图片展示宽度（对标 Semi picWidth）。number 视为像素。
     * 只在 image/picture-card listType 有效，写入缩略图卡片 inline style。
     */
    picWidth?: number | string;
    /**
     * 透传给底层 file input 的 capture 属性（对标 Semi capture），移动端拍照/录像来源。
     * boolean 或 'user'（前置）/'environment'（后置）。命令式设置到隐藏 input。
     */
    capture?: boolean | 'user' | 'environment';
    /**
     * 每个文件列表项的自定义 style（对标 Semi itemStyle）。合并进默认列表项/卡片容器 style。
     * 支持字符串或对象（对象会拼成 style 字符串；值为 number 时按 CSS 数字属性惯例补 px，如 { width: 300 } → width: 300px）。
     */
    itemStyle?: string | Record<string, string | number>;
    /**
     * 选中原始 File 列表变化的回调（对标 Semi onFileChange）。
     * 区别于 onChange（回传 UploadFileItem 列表）：onFileChange 在用户每次选择/拖入/粘贴文件、
     * 经 accept/limit 过滤后回传当次入列的原始 File 数组。
     */
    onFileChange?: (files: File[]) => void;

    // ——— 移除 / 超时 / 触发时机（对标 Semi onRemove/beforeRemove/timeout/uploadTrigger）———
    /**
     * 移除文件前的钩子（对标 Semi beforeRemove）：返回 false / Promise.resolve(false) / reject
     * 会阻止移除；返回 true / 不返回则继续移除。支持异步（await）。
     * 入参为待移除的文件项与当前文件列表。
     */
    beforeRemove?: (file: UploadFileItem, fileList: UploadFileItem[]) => boolean | Promise<boolean>;
    /**
     * 文件被移除后的回调（对标 Semi onRemove）。在移除完成（从列表删除）后触发。
     * 入参：currentFile 为被移除文件的原始 File（若存在），fileList 为移除后的文件列表，
     * currentFileItem 为被移除的文件项。
     */
    onRemove?: (currentFile: File | undefined, fileList: UploadFileItem[], currentFileItem: UploadFileItem) => void;
    /**
     * 单文件上传超时（毫秒）。> 0 时为 XHR 设置 timeout，超时自动中止该请求并标记 error。
     * 0 / 不传 = 不限制。仅对内置 XHR 上传（action）生效，customRequest 自管超时。
     */
    timeout?: number;
    /**
     * 上传触发时机（对标 Semi uploadTrigger）。'auto'（默认）=选中文件即自动上传；
     * 'custom'=选中文件后不自动上传，文件进入列表并停在 ready 态，需通过 bind:this 命令式
     * 调用 upload() 方法才批量上传所有 ready 文件。
     */
    uploadTrigger?: 'auto' | 'custom';
  }

  let {
    value,
    defaultValue = [],
    accept,
    multiple = false,
    directory = false,
    limit,
    maxSize,
    minSize,
    disabled = false,
    size = 'default',
    status = 'default',
    listType = 'text',
    drag = false,
    action,
    uploadName = 'file',
    headers,
    uploadData,
    concurrency = 0,
    beforeUpload,
    customRequest,
    onChange,
    onExceed,
    onSuccess,
    onError,
    onProgress,
    children,
    showRetry = true,
    showReplace = false,
    showUploadList = true,
    showClear = false,
    onClear,
    beforeClear,
    afterUpload,
    fileListTitle,
    showTooltip = true,
    prompt,
    promptPosition = 'bottom',
    onDrop,
    onOpenFileDialog,
    onPreviewClick,
    onAcceptInvalid,
    onRetry,
    onSizeError,
    validateMessage,
    withCredentials = false,
    transformFile,
    dragIcon,
    dragMainText,
    dragSubText,
    addOnPasting = false,
    onPastingError,
    hotSpotLocation = 'start',
    crop = false,
    beforeCrop,
    onCropError,
    cropModalProps,
    renderFileItem,
    previewFile,
    renderThumbnail,
    showPicInfo = false,
    renderPicInfo,
    renderPicPreviewIcon,
    renderPicClose,
    renderFileOperation,
    picHeight,
    picWidth,
    capture,
    itemStyle,
    onFileChange,
    beforeRemove,
    onRemove,
    timeout = 0,
    uploadTrigger = 'auto',
  }: Props = $props();

  const loc = useLocale();
  // 屏幕阅读器播报（spec §6）：进度 polite（节流，避免每 1% 刷屏），成功 polite、失败 assertive。
  // 命令式调用在 XHR 事件回调里（非 render 期），符合红线 #3。
  const announcer = useLiveAnnouncer();
  // 每个文件上次播报的进度档（每 25% 一档），避免逐 % 重复播报。
  const announcedBucket = new Map<string, number>();

  const isControlled = $derived(value !== undefined);
  let inner = $state<UploadFileItem[]>(getInitialValue());
  // Controlled (`value=`): parent owns the list; we never write the prop, only
  // propagate via `onChange`. Uncontrolled: keep our own state in sync.
  const current = $derived(isControlled ? (value ?? []) : inner);

  function getInitialValue(): UploadFileItem[] {
    return [...defaultValue];
  }

  let inputEl: HTMLInputElement | null = null;

  // 拖拽区合法拖入高亮态（对标 Semi dragAreaStatus === DRAG_AREA_LEGAL）。
  let dragOver = $state(false);
  // 记录 dragenter 的 target（对标 Semi _dragEnterTarget）：dragleave 仅当 target 相等才清除，
  // 防止拖过子元素时误触发的 dragleave 抖动清态。
  let dragEnterTarget: EventTarget | null = null;

  // 进行中的 XHR 句柄（uid → xhr），remove/卸载时 abort。
  const xhrMap = new Map<string, XMLHttpRequest>();

  // 并发调度队列：concurrency 变化时重建（新文件用新上限，进行中的 XHR 不受影响）。
  // concurrency<=0 时不限，行为与未接入队列前一致。
  const queue = $derived(createUploadQueue(concurrency));

  // 卸载标记：避免卸载后仍向已 abort 的 XHR/已移除项回写状态。
  let mounted = true;

  // image/picture-card 预览：本地缓存 file → objectURL（uid → url），移除/卸载 revoke。
  const objectUrls = new Map<string, string>();
  const isImageList = $derived(listType === 'image' || listType === 'picture-card');
  function previewUrl(item: UploadFileItem): string | undefined {
    // 显式禁用预览（对标 Semi preview:false）：即便有 url/file 也不显示缩略图。
    if (item.preview === false) return undefined;
    if (item.url) return item.url;
    if (!item.file) return undefined;
    let u = objectUrls.get(item.uid);
    if (u === undefined) {
      u = URL.createObjectURL(item.file);
      objectUrls.set(item.uid, u);
    }
    return u;
  }
  // 文本列表项预览缩略图地址（对标 Semi fileCard.renderFile 的 previewContent）：
  // 仅当该项是图片（有 url 且未禁预览，或 file 为 image/*）才返回地址；否则 undefined → 显示占位。
  function itemThumbUrl(item: UploadFileItem): string | undefined {
    if (item.preview === false) return undefined;
    const isImage = item.file ? item.file.type.startsWith('image/') : Boolean(item.url);
    if (!isImage) return undefined;
    return previewUrl(item);
  }
  function revokeUrl(uid: string) {
    const u = objectUrls.get(uid);
    if (u !== undefined) {
      URL.revokeObjectURL(u);
      objectUrls.delete(uid);
    }
  }

  // 按 uid 局部更新某个文件项（不破坏受控/非受控约定，走 commit）。
  function patchItem(uid: string, patch: Partial<UploadFileItem>) {
    commit(current.map((it) => (it.uid === uid ? { ...it, ...patch } : it)));
  }

  // afterUpload（对标 Semi handleSuccess 的 notifyAfterUpload 分支）：上传成功后据回调返回值
  // 更新该文件项。返回 { autoRemove } → 从列表移除；否则应用 status/validateMessage/name/url。
  // 与 Semi 一致：response 优先按 JSON 解析，失败回退原始文本；afterUpload 为同步返回。
  function applyAfterUpload(uid: string, responseText: string) {
    if (!afterUpload) return;
    const item = current.find((it) => it.uid === uid);
    if (!item) return;
    let response: unknown = responseText;
    try {
      response = JSON.parse(responseText);
    } catch {
      response = responseText;
    }
    const result = afterUpload({ response, file: item, fileList: current });
    if (!result) return;
    if (result.autoRemove) {
      removeInternal(uid);
      return;
    }
    const patch: Partial<UploadFileItem> = {};
    if (result.status) patch.status = result.status;
    if (result.validateMessage !== undefined) patch.error = result.validateMessage;
    if (result.name !== undefined) patch.name = result.name;
    if (result.url !== undefined) {
      // 用户替换预览地址：释放本地 objectURL，改用返回的 url。
      revokeUrl(uid);
      patch.url = result.url;
    }
    if (Object.keys(patch).length > 0) patchItem(uid, patch);
  }

  // directory 是非标准 input 属性（webkitdirectory），Svelte 模板不直接支持，
  // 故命令式 toggle（红线 #3）。directory 变化时同步增删。
  // capture（移动端拍照来源）同为需命令式设置的 input 属性：true → 空串（默认来源），
  // 'user'/'environment' 指定前/后置；false/undefined → 移除。
  $effect(() => {
    if (!inputEl) return;
    inputEl.toggleAttribute('webkitdirectory', directory);
    if (capture === undefined || capture === false) {
      inputEl.removeAttribute('capture');
    } else {
      inputEl.setAttribute('capture', capture === true ? '' : capture);
    }
  });

  // 卸载时中止所有进行中的上传 + 释放预览 objectURL。
  $effect(() => {
    return () => {
      mounted = false;
      for (const xhr of xhrMap.values()) xhr.abort();
      xhrMap.clear();
      for (const u of objectUrls.values()) URL.revokeObjectURL(u);
      objectUrls.clear();
      announcedBucket.clear();
      // 裁切中卸载：revoke 当前裁切图并 settle 悬挂的 Promise（跳过该文件）。
      if (cropSrc) URL.revokeObjectURL(cropSrc);
      cropResolve?.(null);
      cropResolve = null;
    };
  });

  // 粘贴监听：addOnPasting 时挂载 document paste。
  $effect(() => {
    if (!addOnPasting || disabled) return;
    function handlePaste(e: ClipboardEvent) {
      try {
        const items = e.clipboardData?.items;
        if (!items) return;
        const files: File[] = [];
        for (const item of Array.from(items)) {
          if (item.kind === 'file') {
            const f = item.getAsFile();
            if (f) files.push(f);
          }
        }
        if (files.length > 0) addFiles(files);
      } catch (error) {
        // 读取剪贴板文件失败（如权限拒绝 / 读取异常）：通知外部（对标 Semi onPastingError）。
        onPastingError?.(error);
      }
    }
    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  });

  // 进度播报节流：每跨过一个 25% 档位才播一次（25/50/75），避免逐 % 刷屏。
  // 0% 与 100% 不在此播报（开始无意义、完成走 success 文案）。
  function announceProgress(item: UploadFileItem, percent: number) {
    const bucket = Math.floor(percent / 25);
    if (bucket <= 0 || bucket >= 4) return;
    if (announcedBucket.get(item.uid) === bucket) return;
    announcedBucket.set(item.uid, bucket);
    announcer.announce(loc().t('Upload.announceUploading', { name: item.name, percent }));
  }

  // XHR 上传单个文件项：uploading → onprogress 更新 percent → success/error。
  // 返回 Promise，在 load/error/abort 任一终态 resolve，供并发队列释放槽位。
  function uploadItem(item: UploadFileItem, file: File): Promise<void> {
    return new Promise<void>((resolve) => {
      if (!action) {
        resolve();
        return;
      }
      const xhr = new XMLHttpRequest();
      xhrMap.set(item.uid, xhr);
      patchItem(item.uid, { status: 'uploading', percent: 0 });

      let settled = false;
      const done = () => {
        if (settled) return;
        settled = true;
        resolve();
      };

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const percent = computeUploadPercent(e.loaded, e.total);
          patchItem(item.uid, { percent });
          announceProgress(item, percent);
          // onProgress（对标 Semi）：内置 XHR 上传的进度回调，回传当前项（含最新 percent）。
          onProgress?.(percent, { ...item, percent });
        }
      };
      xhr.onload = () => {
        xhrMap.delete(item.uid);
        announcedBucket.delete(item.uid);
        if (isUploadOk(xhr.status)) {
          // response（对标 Semi FileItem.response）：优先解析 JSON，失败回退原始文本。
          let response: unknown = xhr.responseText;
          try {
            response = JSON.parse(xhr.responseText);
          } catch {
            response = xhr.responseText;
          }
          patchItem(item.uid, { status: 'success', percent: 100, response });
          // afterUpload（对标 Semi）：成功终态后据返回值改该项状态/文案/名称/预览地址或自动移除。
          applyAfterUpload(item.uid, xhr.responseText);
          // 完成必播（polite，不抢断）。
          announcer.announce(loc().t('Upload.announceSuccess', { name: item.name }));
          onSuccess?.(xhr.responseText, item);
        } else {
          // 网络层失败（HTTP 非 2xx）→ uploadFail（可重试）。
          patchItem(item.uid, { status: 'uploadFail' });
          // 失败必播（assertive，立即打断）。
          announcer.announce(loc().t('Upload.announceError', { name: item.name }), 'assertive');
          onError?.(item);
        }
        done();
      };
      xhr.onerror = (e) => {
        xhrMap.delete(item.uid);
        announcedBucket.delete(item.uid);
        // 网络错误 → uploadFail（可重试）；event 记录原始事件（对标 Semi FileItem.event）。
        patchItem(item.uid, { status: 'uploadFail', event: e as Event });
        announcer.announce(loc().t('Upload.announceError', { name: item.name }), 'assertive');
        onError?.(item);
        done();
      };
      // abort（remove/卸载）也要释放槽位，否则队列卡死。
      xhr.onabort = () => {
        xhrMap.delete(item.uid);
        announcedBucket.delete(item.uid);
        done();
      };
      // 超时：与 onerror 同处理（标 error + 播报），并释放槽位（同 onabort）。
      xhr.ontimeout = () => {
        xhrMap.delete(item.uid);
        announcedBucket.delete(item.uid);
        // 超时属网络原因 → uploadFail（可重试）。
        patchItem(item.uid, { status: 'uploadFail', error: loc().t('Upload.timeoutError') });
        announcer.announce(loc().t('Upload.timeoutError', { name: item.name }), 'assertive');
        onError?.(item);
        done();
      };

      const form = new FormData();
      form.append(uploadName, file, item.name);
      // uploadData/headers 支持静态对象或按当前 file 求值的函数（对标 Semi data/headers）。
      const resolvedData = typeof uploadData === 'function' ? uploadData(file) : uploadData;
      if (resolvedData) {
        for (const [k, v] of Object.entries(resolvedData)) form.append(k, v);
      }
      xhr.open('POST', action);
      // 单文件上传超时（毫秒）：>0 时启用，超时触发 ontimeout（标 error）。
      if (timeout > 0) xhr.timeout = timeout;
      if (withCredentials) xhr.withCredentials = true;
      const resolvedHeaders = typeof headers === 'function' ? headers(file) : headers;
      if (resolvedHeaders) {
        for (const [k, v] of Object.entries(resolvedHeaders)) xhr.setRequestHeader(k, v);
      }
      xhr.send(form);
    });
  }

  /** Format a byte count: <1KiB → B, <1MiB → KB, else MB (1 decimal). */
  function formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  function commit(next: UploadFileItem[]) {
    if (!isControlled) inner = next;
    onChange?.(next);
  }

  /** accept 过滤：返回通过和拒绝两组文件。 */
  function filterByAccept(files: File[]): { accepted: File[]; rejected: File[] } {
    if (!accept) return { accepted: files, rejected: [] };
    const acceptList = accept.split(',').map((s) => s.trim().toLowerCase());
    const accepted: File[] = [];
    const rejected: File[] = [];
    for (const f of files) {
      const ext = '.' + f.name.split('.').pop()!.toLowerCase();
      const mime = f.type.toLowerCase();
      const ok = acceptList.some((a) => {
        if (a.startsWith('.')) return ext === a;
        if (a.endsWith('/*')) return mime.startsWith(a.slice(0, -1));
        return mime === a;
      });
      if (ok) accepted.push(f);
      else rejected.push(f);
    }
    return { accepted, rejected };
  }

  function buildItem(file: File): UploadFileItem {
    // 纯函数校验大小（KB），min/max 同源；超限 → error + 本地化提示。
    const sizeError = validateFileSize(file.size, { minSize, maxSize });
    // 目录上传时浏览器在 webkitRelativePath 上保留相对路径（如 dir/sub/a.txt）。
    const relativePath = (file as File & { webkitRelativePath?: string }).webkitRelativePath;
    const item: UploadFileItem = {
      uid: useId('cd-upload'),
      name: file.name,
      size: file.size,
      // 大小校验失败 → validateFail（校验态，不可重试）；否则 wait（等待上传）。
      status: sizeError ? 'validateFail' : 'wait',
      file,
    };
    if (relativePath) item.relativePath = relativePath;
    if (sizeError) {
      const limitKB = sizeError === 'max' ? maxSize! : minSize!;
      item.error = validateMessage ?? loc().t(sizeError === 'max' ? 'Upload.sizeError' : 'Upload.minSizeError', {
        size: formatSize(limitKB * 1024),
      });
    }
    return item;
  }

  // 导出：供外部程序化添加文件（如 Chat 整容器拖拽上传），走完整校验 / accept / limit 管线。
  // crop 开启时：image/* 文件先逐个进裁切弹窗，确认后用裁切结果 File 替换，再走上传管线；
  // 非图片文件直接入管线。裁切是异步流程，故与同步的 addFilesInternal 分层。
  export function addFiles(fileList: FileList | File[]) {
    if (disabled) return;
    const allFiles = Array.from(fileList);
    if (allFiles.length === 0) return;
    if (crop) {
      void runCropPipeline(allFiles);
      return;
    }
    addFilesInternal(allFiles);
  }

  // 过滤选中文件（accept + limit），返回入列的原始 File 数组与是否走 limit=1 替换语义。
  // limit=1 时始终用最新文件替换当前（对标 Semi），不触发 onExceed；否则按剩余空位裁剪、超出触发 onExceed。
  // insertLen 为已在本批插入但尚未反映进 current 的项数（insert 分多段时用于精确计算剩余空位）。
  function filterSelected(files: File[], insertLen = 0): { accepted: File[]; replaceOne: boolean } {
    // accept 校验
    const { accepted: afterAccept, rejected } = filterByAccept(files);
    if (rejected.length > 0) onAcceptInvalid?.(rejected);
    if (afterAccept.length === 0) return { accepted: [], replaceOne: false };

    // limit=1 替换语义（对标 Semi）：取最新（最后一个）文件替换当前列表，不触发 onExceed。
    if (limit === 1) {
      return { accepted: [afterAccept[afterAccept.length - 1]!], replaceOne: true };
    }

    let accepted = afterAccept;
    if (limit !== undefined) {
      const room = limit - current.length - insertLen;
      if (room <= 0) {
        onExceed?.(accepted);
        return { accepted: [], replaceOne: false };
      }
      if (accepted.length > room) {
        onExceed?.(accepted.slice(room));
        accepted = accepted.slice(0, room);
      }
    }
    return { accepted, replaceOne: false };
  }

  // 派发入列文件项：onSizeError 通知 + beforeUpload/上传管线。
  function dispatchNewItems(newItems: UploadFileItem[], accepted: File[]) {
    // onSizeError 回调：大小校验失败项（validateFail）通知外部
    for (const item of newItems) {
      if (item.status === 'validateFail' && item.file) {
        const result = validateFileSize(item.file.size, { minSize, maxSize });
        if (result) onSizeError?.(item, result);
      }
    }
    // beforeUpload 通过的项才进队列受 concurrency 调度。
    // customRequest 完全接管；否则有 action 时自动 XHR 上传。仅处理无校验错误的项。
    for (const item of newItems) {
      if (item.status === 'validateFail' || !item.file) continue;
      dispatch(item, item.file, accepted);
    }
  }

  function addFilesInternal(fileList: FileList | File[]) {
    if (disabled) return;
    const allFiles = Array.from(fileList);
    if (allFiles.length === 0) return;

    const { accepted, replaceOne } = filterSelected(allFiles);
    if (accepted.length === 0) return;

    // onFileChange（对标 Semi notifyFileSelect）：回传当次经 accept/limit 过滤后入列的原始 File 数组。
    onFileChange?.(accepted);

    const newItems = accepted.map(buildItem);
    // limit=1 替换：先中止/释放当前项，再用新项替换整个列表。
    if (replaceOne) {
      for (const it of current) removeInternalResources(it.uid);
      commit(newItems);
    } else {
      commit([...current, ...newItems]);
    }

    dispatchNewItems(newItems, accepted);
  }

  // 命令式插入文件到指定 index（对标 Semi insert）：走完整 accept/limit/校验管线，
  // 不传 index 则追加到末尾。limit=1 时同 addFilesInternal 的替换语义。
  export function insert(files: File[], index?: number) {
    if (disabled) return;
    const allFiles = Array.from(files);
    if (allFiles.length === 0) return;

    const { accepted, replaceOne } = filterSelected(allFiles);
    if (accepted.length === 0) return;

    onFileChange?.(accepted);

    const newItems = accepted.map(buildItem);
    if (replaceOne) {
      for (const it of current) removeInternalResources(it.uid);
      commit(newItems);
    } else {
      const at = index === undefined ? current.length : Math.max(0, Math.min(index, current.length));
      const next = [...current];
      next.splice(at, 0, ...newItems);
      commit(next);
    }

    dispatchNewItems(newItems, accepted);
  }

  // 单个文件的上传派发：先跑（可能异步的）beforeUpload，通过后入队受并发调度。
  async function dispatch(item: UploadFileItem, original: File, fileList: File[]) {
    let file = original;
    if (beforeUpload) {
      let result: BeforeUploadResult;
      try {
        result = await beforeUpload(original, fileList);
      } catch {
        // reject 视为拒绝该文件。
        result = false;
      }
      if (!mounted) return;
      // 上传开始前可能已被手动移除。
      if (!current.some((it) => it.uid === item.uid)) return;
      const decision = resolveBeforeUpload(original, result);
      if (!decision.upload) {
        // 跳过该文件：从列表移除（受控仅 onChange，不回写）。内部移除，不触发 beforeRemove/onRemove。
        removeInternal(item.uid);
        return;
      }
      file = decision.file ?? original;
      if (file !== original) patchItem(item.uid, { name: file.name, size: file.size, file });
    }
    if (!mounted) return;

    // transformFile：上传前文件转换
    if (transformFile) {
      file = await transformFile(file);
      if (!mounted) return;
      patchItem(item.uid, { name: file.name, size: file.size, file });
    }

    // uploadTrigger='custom'：不自动上传，文件停在 ready 态等待命令式 upload() 触发。
    // 记录已通过 beforeUpload/transformFile 的最终 File，供 upload() 直接入队。
    if (uploadTrigger === 'custom') {
      pendingFiles.set(item.uid, file);
      return;
    }

    enqueueUpload(item, file);
  }

  // 待手动上传的文件（uploadTrigger='custom' 时，dispatch 处理完 beforeUpload/transformFile
  // 后暂存最终 File；调用 upload() 时逐个入队）。
  const pendingFiles = new Map<string, File>();

  // 将单个文件项入并发队列：customRequest 返回 Promise 时队列会 await 其完成来释放槽位
  // （同步返回则立即释放，由其自管生命周期）；否则由队列 await XHR。
  function enqueueUpload(item: UploadFileItem, file: File) {
    queue.add(() => {
      if (!mounted) return;
      if (!current.some((it) => it.uid === item.uid)) return;
      if (customRequest) {
        return customRequest({ ...item, file });
      }
      if (action) return uploadItem(item, file);
    });
  }

  // 命令式手动触发上传（对标 Semi ref.upload）：配合 uploadTrigger='custom'，
  // 将所有 ready 且已就绪的文件批量入队上传。命令式操作在 handler 内（红线 #3）。
  export function upload() {
    if (disabled) return;
    for (const it of current) {
      if (it.status !== 'wait') continue;
      const file = pendingFiles.get(it.uid) ?? it.file;
      if (!file) continue;
      pendingFiles.delete(it.uid);
      enqueueUpload(it, file);
    }
  }

  // 释放单个文件项占用的资源（中止 XHR、revoke objectURL、清簿记），不改列表。
  function removeInternalResources(uid: string) {
    const xhr = xhrMap.get(uid);
    if (xhr) {
      xhr.abort();
      xhrMap.delete(uid);
    }
    revokeUrl(uid);
    announcedBucket.delete(uid);
    pendingFiles.delete(uid);
  }

  // 内部移除：中止 XHR、释放预览、从列表删除。不跑 beforeRemove/onRemove
  // （供 beforeUpload 跳过等内部流程直接调用）。
  function removeInternal(uid: string) {
    removeInternalResources(uid);
    commit(current.filter((item) => item.uid !== uid));
  }

  // 用户发起的移除（点击移除按钮 / renderFileItem 的 remove 回调）：
  // 先跑 beforeRemove（false/reject 阻止），移除后触发 onRemove。异步 await。
  async function remove(uid: string) {
    if (disabled) return;
    const item = current.find((it) => it.uid === uid);
    if (!item) return;
    if (beforeRemove) {
      let allow: boolean;
      try {
        allow = await beforeRemove(item, current);
      } catch {
        // reject 视为阻止移除。
        allow = false;
      }
      if (allow === false) return;
      if (!mounted) return;
      // 异步期间可能已被其它路径移除。
      if (!current.some((it) => it.uid === uid)) return;
    }
    // 移除后的列表（供 onRemove 精确入参，避免依赖 derived 的同步时机）。
    const nextList = current.filter((it) => it.uid !== uid);
    removeInternal(uid);
    // 移除完成后通知（fileList 为移除后的列表）。
    onRemove?.(item.file, nextList, item);
  }

  /** 重试失败项：重置状态后重新派发上传。 */
  function retryItem(item: UploadFileItem) {
    onRetry?.(item);
    if (!item.file) return;
    // Drop `percent` and `error` keys entirely (exactOptionalPropertyTypes: true requires
    // omission rather than explicit undefined assignment).
    commit(current.map((it) => {
      if (it.uid !== item.uid) return it;
      const { percent: _p, error: _e, ...rest } = it;
      return { ...rest, status: 'wait' };
    }));
    dispatch(item, item.file, [item.file]);
  }

  // 在文件项上挂操作方法（对标 Semi fileItem.onRemove/onRetry/onPreview 直接可调）。
  // render 家族入参统一走它，既兼容 Semi 写法，又不破坏现有分开传的 remove/retry/preview。
  function withOps(item: UploadFileItem): UploadFileItemWithOps {
    return {
      ...item,
      onRemove: () => remove(item.uid),
      onRetry: () => retryItem(item),
      onPreview: () => onPreviewClick?.(item),
      onReplace: () => openReplace(item.uid),
    };
  }

  /**
   * 清除所有文件：先跑 beforeClear（false/reject 阻止清除），通过后中止进行中的上传、
   * 释放 objectURL、清空列表。异步 await（对标 Semi handleClear）。
   */
  async function clearAll() {
    if (disabled) return;
    if (beforeClear) {
      let allow: boolean;
      try {
        allow = await beforeClear(current);
      } catch {
        // reject 视为阻止清除。
        allow = false;
      }
      if (allow === false) return;
      if (!mounted) return;
    }
    for (const xhr of xhrMap.values()) xhr.abort();
    xhrMap.clear();
    for (const u of objectUrls.values()) URL.revokeObjectURL(u);
    objectUrls.clear();
    announcedBucket.clear();
    commit([]);
    onClear?.();
  }

  function openPicker() {
    if (disabled) return;
    onOpenFileDialog?.();
    inputEl?.click();
  }

  // 命令式打开文件选择器（对标 Semi openFileDialog）。等价于点击触发器。
  export function openFileDialog() {
    openPicker();
  }

  function handleInputChange(e: Event & { currentTarget: HTMLInputElement }) {
    const fl = e.currentTarget.files;
    if (fl) addFiles(fl);
    // Reset so selecting the same file again re-fires change.
    e.currentTarget.value = '';
  }

  // ——— showReplace：替换已上传文件 ———
  // 隐藏 input，点击"替换"按钮时打开；选中新文件后用其替换目标 uid 的项并重新走上传。
  // bind:this 在 {#if showReplace} 内条件挂载，用 $state 以正确响应挂载/卸载（对齐 svelte 校验）。
  let replaceInputEl = $state<HTMLInputElement | null>(null);
  // 当前待替换的目标 uid（打开替换选择器时记录）。
  let replaceTargetUid: string | null = null;

  function openReplace(uid: string) {
    if (disabled) return;
    replaceTargetUid = uid;
    replaceInputEl?.click();
  }

  function handleReplaceChange(e: Event & { currentTarget: HTMLInputElement }) {
    const fl = e.currentTarget.files;
    const target = replaceTargetUid;
    replaceTargetUid = null;
    e.currentTarget.value = '';
    if (!fl || fl.length === 0 || !target) return;
    const file = fl[0]!;
    if (disabled) return;
    // accept 校验：不符则通知外部并放弃替换。
    const { accepted, rejected } = filterByAccept([file]);
    if (rejected.length > 0) onAcceptInvalid?.(rejected);
    if (accepted.length === 0) return;
    const chosen = accepted[0]!;
    // 释放旧项资源，用新 File 构建替换项（沿用同一 uid，保持列表位置）。
    removeInternalResources(target);
    const built = buildItem(chosen);
    const replaced: UploadFileItem = { ...built, uid: target };
    commit(current.map((it) => (it.uid === target ? replaced : it)));
    onFileChange?.([chosen]);
    // 重新走上传管线（onSizeError + beforeUpload/上传）。
    dispatchNewItems([replaced], [chosen]);
  }

  function handleDragEnter(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    // 记录进入 target（对标 Semi handleDragEnter 记 _dragEnterTarget = currentTarget）。
    dragEnterTarget = e.currentTarget;
    if (!disabled) dragOver = true;
  }

  function handleDragLeave(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    // 仅当离开的 target 与进入时相同才清态（对标 Semi handleDragLeave 的子元素抖动防护）。
    if (dragEnterTarget === e.target) dragOver = false;
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    dragOver = false;
    if (disabled) return;
    const dt = e.dataTransfer;
    if (dt?.files && dt.files.length > 0) {
      const files = Array.from(dt.files);
      // accept 过滤
      const { accepted, rejected } = filterByAccept(files);
      onDrop?.(e, files, rejected);
      if (accepted.length > 0) addFiles(accepted);
    }
  }

  function handleDragKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openPicker();
    }
  }

  // 是否水平布局 prompt（left 或 right）
  const promptRow = $derived(promptPosition === 'left' || promptPosition === 'right');

  // showTooltip 归一：boolean 与对象两种形态拆解，供模板分发。
  const tooltipObj = $derived(
    showTooltip !== null && typeof showTooltip === 'object' ? showTooltip : undefined,
  );
  // boolean=true（或对象但未指定 type）时用原生 title 属性；对象且指定 type 时用组件包裹。
  const useTitleAttr = $derived(showTooltip !== false && tooltipObj?.type === undefined);
  // 清空按钮文案（对标 Semi clearText），供默认标题区/自定义标题 Snippet 复用。
  const clearText = $derived(loc().t('Upload.clear'));
  // fileListTitle 归一：string / false / Snippet 三态。
  const titleSnippet = $derived(
    typeof fileListTitle === 'function'
      ? (fileListTitle as Snippet<[{ fileList: UploadFileItem[]; onClear: () => void; clearText: string }]>)
      : undefined,
  );
  const titleText = $derived(typeof fileListTitle === 'string' ? fileListTitle : undefined);

  // itemStyle（对标 Semi）：每个文件列表项/卡片的自定义 style。对象形态拼成 style 字符串，
  // 字符串形态原样透传；未提供则为 undefined（不加 style 属性）。
  const itemStyleStr = $derived.by<string | undefined>(() => {
    if (itemStyle === undefined) return undefined;
    if (typeof itemStyle === 'string') return itemStyle;
    // 对象形态：值为 number 时按 CSS 数字属性惯例补 px（对齐 Semi，如 { width: 300 } → width: 300px），
    // 与 picWidth/picHeight number→px 一致。字符串值原样透传（允许带单位或 CSS 关键字）。
    const parts = Object.entries(itemStyle).map(
      ([k, v]) => `${k}: ${typeof v === 'number' ? `${v}px` : v}`,
    );
    return parts.length > 0 ? parts.join('; ') : undefined;
  });

  // picWidth/picHeight（对标 Semi）：照片墙缩略图卡片自定义宽高。number → px。
  // 与 itemStyle 合并写入卡片 inline style（itemStyle 在后，优先级更高）。
  const cardStyleStr = $derived.by<string | undefined>(() => {
    const parts: string[] = [];
    if (picWidth !== undefined) parts.push(`inline-size: ${typeof picWidth === 'number' ? `${picWidth}px` : picWidth}`);
    if (picHeight !== undefined) parts.push(`block-size: ${typeof picHeight === 'number' ? `${picHeight}px` : picHeight}`);
    if (itemStyleStr) parts.push(itemStyleStr);
    return parts.length > 0 ? parts.join('; ') : undefined;
  });

  // ——— 裁剪流程 ———
  // 归一化 crop 配置：true → 默认对象；对象 → 原样。
  const cropConfig = $derived<UploadCropProps>(
    crop === true ? {} : crop && typeof crop === 'object' ? crop : {},
  );

  // 裁切弹窗态：一次只裁一张。cropOpen 控制 Modal，cropSrc 为当前图 objectURL，
  // cropResolve 在确认/取消/失败时 settle 当前图的 Promise（返回 File 或 null=跳过）。
  let cropOpen = $state(false);
  let cropSrc = $state<string | undefined>(undefined);
  let cropperRef = $state<{ getCropperCanvas: () => HTMLCanvasElement } | null>(null);
  let cropConfirming = $state(false);
  let cropCurrentFile: File | null = null;
  let cropResolve: ((file: File | null) => void) | null = null;

  const isImageFile = (f: File) => f.type.startsWith('image/');

  // 只挑出已定义的可选值透传给 Modal/Cropper（exactOptionalPropertyTypes 下不能显式传 undefined）。
  const cropModalTextProps = $derived({
    ...(cropConfig.modalOkText !== undefined ? { okText: cropConfig.modalOkText } : {}),
    ...(cropConfig.modalCancelText !== undefined ? { cancelText: cropConfig.modalCancelText } : {}),
  });
  const cropperNumProps = $derived({
    ...(cropConfig.aspectRatio !== undefined ? { aspectRatio: cropConfig.aspectRatio } : {}),
    ...(cropConfig.minZoom !== undefined ? { minZoom: cropConfig.minZoom } : {}),
    ...(cropConfig.maxZoom !== undefined ? { maxZoom: cropConfig.maxZoom } : {}),
    ...(cropConfig.zoomStep !== undefined ? { zoomStep: cropConfig.zoomStep } : {}),
  });

  // 顺序处理选中文件：图片走裁切弹窗（beforeCrop 可跳过），非图片直接透传。
  // 全部处理完后一次性把结果（裁切后/原始 File）喂回上传管线。
  async function runCropPipeline(files: File[]) {
    const out: File[] = [];
    for (const file of files) {
      if (!mounted) return;
      if (!isImageFile(file)) {
        out.push(file);
        continue;
      }
      // beforeCrop 返回 false → 跳过裁切直接上传原文件。
      if (beforeCrop) {
        let skip = false;
        try {
          skip = (await beforeCrop(file)) === false;
        } catch {
          skip = false;
        }
        if (!mounted) return;
        if (skip) {
          out.push(file);
          continue;
        }
      }
      try {
        const cropped = await cropOne(file);
        if (!mounted) return;
        // 取消裁切 → 丢弃该文件（不上传）。
        if (cropped) out.push(cropped);
      } catch (err) {
        onCropError?.(err);
        // 裁切失败：回退为原文件上传，避免静默丢弃。
        out.push(file);
      }
    }
    if (!mounted) return;
    if (out.length > 0) addFilesInternal(out);
  }

  // 打开裁切弹窗处理单张图片，返回裁切后 File（取消返回 null）。
  function cropOne(file: File): Promise<File | null> {
    return new Promise<File | null>((resolve) => {
      cropCurrentFile = file;
      cropResolve = resolve;
      cropSrc = URL.createObjectURL(file);
      cropOpen = true;
    });
  }

  // 确认裁切：取 canvas → toBlob → 构造新 File（保留原名/type）。
  function confirmCrop() {
    const canvas = cropperRef?.getCropperCanvas();
    const original = cropCurrentFile;
    if (!canvas || !original) {
      settleCrop(null);
      return;
    }
    cropConfirming = true;
    const type = original.type || 'image/png';
    const quality = cropConfig.quality ?? 0.92;
    try {
      canvas.toBlob(
        (blob) => {
          cropConfirming = false;
          if (!blob) {
            onCropError?.(new Error('Cropper toBlob returned null'));
            settleCrop(original);
            return;
          }
          const cropped = new File([blob], original.name, {
            type,
            lastModified: Date.now(),
          });
          settleCrop(cropped);
        },
        type,
        quality,
      );
    } catch (err) {
      cropConfirming = false;
      onCropError?.(err);
      settleCrop(original);
    }
  }

  function cancelCrop() {
    settleCrop(null);
  }

  // 收尾：关闭弹窗、revoke src、settle Promise。
  function settleCrop(result: File | null) {
    cropOpen = false;
    if (cropSrc) {
      URL.revokeObjectURL(cropSrc);
      cropSrc = undefined;
    }
    const resolve = cropResolve;
    cropResolve = null;
    cropCurrentFile = null;
    resolve?.(result);
  }
</script>

<div
  class="cd-upload cd-upload--{size} cd-upload--{status}"
  class:cd-upload--disabled={disabled}
  data-status={status !== 'default' ? status : undefined}
>
  <input
    bind:this={inputEl}
    class="cd-upload__input"
    type="file"
    {accept}
    {multiple}
    {disabled}
    tabindex="-1"
    aria-hidden="true"
    onchange={handleInputChange}
  />

  {#if showReplace}
    <!-- showReplace 专用隐藏 input：替换单个已上传文件（单选，不带 multiple/directory）。 -->
    <input
      bind:this={replaceInputEl}
      class="cd-upload__input"
      type="file"
      {accept}
      {disabled}
      tabindex="-1"
      aria-hidden="true"
      onchange={handleReplaceChange}
    />
  {/if}

  {#snippet triggerArea()}
    <div
      class="cd-upload__trigger-wrap"
      class:cd-upload__trigger-wrap--row={promptRow}
      class:cd-upload__trigger-wrap--row-reverse={promptPosition === 'left'}
    >
      {#if drag}
        <div
          class="cd-upload__dragger"
          class:cd-upload__dragger--legal={dragOver}
          role="button"
          tabindex={disabled ? -1 : 0}
          aria-disabled={disabled || undefined}
          ondragover={(e) => e.preventDefault()}
          ondragenter={handleDragEnter}
          ondragleave={handleDragLeave}
          ondrop={handleDrop}
          onclick={openPicker}
          onkeydown={handleDragKeydown}
        >
          {#if children}
            {@render children()}
          {:else}
            <!-- dragIcon 未传时渲染默认云上传图标（对齐 Semi drag-area 默认图标）。 -->
            <span class="cd-upload__dragger-icon">
              {#if dragIcon}{@render dragIcon()}{:else}<Icon svg={DEFAULT_DRAG_ICON_SVG} size="large" />{/if}
            </span>
            {#if dragMainText}
              <span class="cd-upload__dragger-main">
                {#if typeof dragMainText === 'string'}{dragMainText}{:else}{@render dragMainText()}{/if}
              </span>
            {:else}
              <span class="cd-upload__dragger-text">{loc().t('Upload.draggerText')}</span>
            {/if}
            {#if dragSubText}
              <span class="cd-upload__dragger-sub">
                {#if typeof dragSubText === 'string'}{dragSubText}{:else}{@render dragSubText()}{/if}
              </span>
            {/if}
            <!-- 合法拖入提示（对标 Semi drag-area-tips-legal）：仅在 dragOver 高亮态显示。 -->
            {#if dragOver}
              <span class="cd-upload__dragger-tips">{loc().t('Upload.legalTips')}</span>
            {/if}
          {/if}
        </div>
      {:else}
        <!-- children 存在时触发器退化为无样式裸容器（对齐 Semi：children 模式触发器透明，
             外观由 children 自己决定，如 Avatar 头像），避免默认按钮灰底/边框漏在 children 背后。 -->
        <button
          type="button"
          class="cd-upload__trigger"
          class:cd-upload__trigger--bare={children}
          {disabled}
          onclick={openPicker}
        >
          {#if children}
            {@render children()}
          {:else}
            {loc().t('Upload.trigger')}
          {/if}
        </button>
      {/if}

      {#if prompt}
        <div class="cd-upload__prompt">
          {#if typeof prompt === 'string'}{prompt}{:else}{@render prompt()}{/if}
        </div>
      {/if}
    </div>
  {/snippet}

  {#if hotSpotLocation !== 'none' && hotSpotLocation !== 'end'}
    {@render triggerArea()}
  {/if}

  {#if showClear && current.length > 0}
    <button
      type="button"
      class="cd-upload__clear-btn"
      {disabled}
      onclick={clearAll}
    >{clearText}</button>
  {/if}

  {#snippet fileName(item: UploadFileItem)}
    {#if tooltipObj?.renderTooltip}
      <!-- renderTooltip：完全接管浮层（对标 Semi (content, children) => ReactNode）。
           不再套内置 Tooltip/Popover；把文案（content）与文件名节点（children）交给用户组织。 -->
      {#snippet nameNode()}
        <span class="cd-upload__item-name">{item.name}</span>
      {/snippet}
      {@render tooltipObj.renderTooltip({ content: item.name, children: nameNode })}
    {:else if tooltipObj?.type === 'tooltip'}
      <Tooltip content={item.name} {...(tooltipObj.opts ?? {})}>
        <span class="cd-upload__item-name">{item.name}</span>
      </Tooltip>
    {:else if tooltipObj?.type === 'popover'}
      <Popover content={item.name} {...(tooltipObj.opts ?? {})}>
        <span class="cd-upload__item-name">{item.name}</span>
      </Popover>
    {:else}
      <span class="cd-upload__item-name" title={useTitleAttr ? item.name : undefined}>{item.name}</span>
    {/if}
  {/snippet}

  {#if showUploadList && listType === 'text' && current.length > 0}
    {#if titleSnippet}
      <!-- fileListTitle 为 Snippet：完全自定义标题区（含清空按钮）。 -->
      <div class="cd-upload__list-title cd-upload__list-title--custom">
        {@render titleSnippet({ fileList: current, onClear: clearAll, clearText })}
      </div>
    {:else if titleText}
      <div class="cd-upload__list-title">
        <span class="cd-upload__list-title-text">{titleText}</span>
        {#if showClear}
          <button
            type="button"
            class="cd-upload__list-title-clear"
            {disabled}
            onclick={clearAll}
          >{clearText}</button>
        {/if}
      </div>
    {/if}
    <ul class="cd-upload__list">
      {#each current as item (item.uid)}
        {#if renderFileItem}
          <li class="cd-upload__item cd-upload__item--custom" style={itemStyleStr}>
            {@render renderFileItem({
              fileItem: withOps(item),
              remove: () => remove(item.uid),
              retry: () => retryItem(item),
              preview: () => onPreviewClick?.(item),
            })}
          </li>
        {:else}
        {@const thumbUrl = itemThumbUrl(item)}
        <li class="cd-upload__item" class:cd-upload__item--error={item.status === 'uploadFail' || item.status === 'validateFail'} style={itemStyleStr}>
          <!-- 预览盒（对标 Semi fileCard file-card-preview）：图片→缩略图，非图片→占位文件图标。 -->
          <div
            class="cd-upload__item-preview"
            class:cd-upload__item-preview--placeholder={thumbUrl === undefined}
          >
            {#if thumbUrl !== undefined}
              <img class="cd-upload__item-preview-img" src={thumbUrl} alt={item.name} />
            {:else}
              <Icon svg={DEFAULT_FILE_ICON_SVG} size="small" />
            {/if}
          </div>
          <div class="cd-upload__item-body">
          <div class="cd-upload__item-main">
            <!-- 失败态内联错误图标（对标 Semi fileCard file-card-icon-error）。 -->
            {#if item.status === 'uploadFail' || item.status === 'validateFail'}
              <span class="cd-upload__item-icon cd-upload__item-icon--error">
                <Icon svg={DEFAULT_ERROR_ICON_SVG} size="small" />
              </span>
            {/if}
            {@render fileName(item)}
            <span class="cd-upload__item-size">{formatSize(item.size)}</span>
            {#if item.status !== 'uploading'}
              <span class="cd-upload__item-status">{item.validateMessage ?? item.error ?? item.status}</span>
            {/if}
            {#if renderFileOperation}
              <!-- renderFileOperation：自定义列表项操作区（替换默认重试/移除）。 -->
              <span class="cd-upload__item-operation">
                {@render renderFileOperation({
                  fileItem: withOps(item),
                  remove: () => remove(item.uid),
                  retry: () => retryItem(item),
                  preview: () => onPreviewClick?.(item),
                })}
              </span>
            {:else}
              {#if (item.showReplace ?? showReplace) && item.status === 'success'}
                <!-- showReplace：已上传项显示替换按钮（项级 item.showReplace 优先于组件级）。 -->
                <button
                  type="button"
                  class="cd-upload__replace-btn"
                  {disabled}
                  onclick={() => openReplace(item.uid)}
                >{loc().t('Upload.replace')}</button>
              {/if}
              {#if item.status === 'uploadFail' && (item.showRetry ?? showRetry) !== false}
                <!-- 重试仅对 uploadFail（网络失败）显示；validateFail（校验失败）不可重试（对齐 Semi）。 -->
                <button
                  type="button"
                  class="cd-upload__retry-btn"
                  {disabled}
                  onclick={() => retryItem(item)}
                >{loc().t('Upload.retry')}</button>
              {/if}
              <button
                type="button"
                class="cd-upload__item-remove"
                aria-label={loc().t('Upload.remove')}
                {disabled}
                onclick={() => remove(item.uid)}
              >
                &times;
              </button>
            {/if}
          </div>
          {#if item.status === 'uploading'}
            <Progress
              percent={item.percent ?? 0}
              size="small"
              ariaLabel={loc().t('Upload.uploadingProgress', { name: item.name })}
            />
          {/if}
          </div>
        </li>
        {/if}
      {/each}
    </ul>
  {/if}

  {#if showUploadList && isImageList && current.length > 0}
    <ul
      class="cd-upload__grid"
      class:cd-upload__grid--card={listType === 'picture-card'}
    >
      {#each current as item (item.uid)}
        {@const url = previewUrl(item)}
        <li
          class="cd-upload__card"
          class:cd-upload__card--error={item.status === 'uploadFail' || item.status === 'validateFail'}
          class:cd-upload__card--uploading={item.status === 'uploading'}
          style={cardStyleStr}
        >
          {#if renderThumbnail}
            <!-- renderThumbnail：接管整个缩略图区域（含图片本身）。 -->
            {@render renderThumbnail({ fileItem: item })}
          {:else if previewFile}
            <!-- previewFile：替换默认缩略图内容（默认操作/信息浮层保留）。 -->
            <div class="cd-upload__thumb cd-upload__thumb--custom">
              {@render previewFile({ fileItem: item })}
            </div>
          {:else if url}
            {#if onPreviewClick}
              <button
                type="button"
                class="cd-upload__thumb-btn"
                aria-label={item.name}
                onclick={() => onPreviewClick(item)}
              >
                <img class="cd-upload__thumb" src={url} alt="" aria-hidden="true" />
              </button>
            {:else}
              <img class="cd-upload__thumb" src={url} alt={item.name} />
            {/if}
          {:else}
            <span class="cd-upload__thumb cd-upload__thumb--placeholder" aria-hidden="true"></span>
          {/if}
          {#if item.status === 'uploading'}
            <div class="cd-upload__card-progress">
              <Progress
                percent={item.percent ?? 0}
                size="small"
                ariaLabel={loc().t('Upload.uploadingProgress', { name: item.name })}
              />
            </div>
          {/if}
          {#if item.status === 'uploadFail' || item.status === 'validateFail'}
            <!-- 失败状态角标（对齐 Semi picture-file-card-icon-error）；网络失败与校验失败均显示。 -->
            <span class="cd-upload__card-error-icon" aria-hidden="true">!</span>
          {/if}
          {#if listType === 'picture-card' && showPicInfo}
            <!-- 图片信息浮层（对齐 Semi picture-file-card-pic-info），常显（非仅 hover）。 -->
            <div class="cd-upload__pic-info">
              {#if renderPicInfo}
                {@render renderPicInfo({ fileItem: item })}
              {:else}
                <span class="cd-upload__pic-info-name">{item.name}</span>
              {/if}
            </div>
          {/if}
          <div class="cd-upload__card-overlay">
            <span class="cd-upload__card-name">{item.name}</span>
            {#if (item.showReplace ?? showReplace) && item.status === 'success'}
              <!-- showReplace（picture-card）：已上传项显示替换按钮（项级优先）。 -->
              <button
                type="button"
                class="cd-upload__card-replace"
                aria-label={loc().t('Upload.replace')}
                {disabled}
                onclick={() => openReplace(item.uid)}
              >&#8635;</button>
            {/if}
            {#if renderPicClose}
              <!-- renderPicClose：自定义照片墙关闭（移除）按钮。 -->
              {@render renderPicClose({
                className: 'cd-upload__card-remove',
                remove: () => remove(item.uid),
              })}
            {:else}
              <button
                type="button"
                class="cd-upload__card-remove"
                aria-label={loc().t('Upload.remove')}
                {disabled}
                onclick={() => remove(item.uid)}
              >
                &times;
              </button>
            {/if}
          </div>
          {#if renderPicPreviewIcon}
            <!-- renderPicPreviewIcon：照片墙 hover 预览图标（picture-card），常配合 onPreviewClick。 -->
            <div class="cd-upload__pic-preview-icon">
              {@render renderPicPreviewIcon({
                fileItem: withOps(item),
                remove: () => remove(item.uid),
                retry: () => retryItem(item),
                preview: () => onPreviewClick?.(item),
              })}
            </div>
          {/if}
          {#if item.status === 'uploadFail' && (item.showRetry ?? showRetry) !== false && item.file}
            <!-- 失败重试按钮（hover 时可见，对齐 Semi picture-file-card-retry）；仅网络失败可重试，项级 showRetry 优先。 -->
            <button
              type="button"
              class="cd-upload__card-retry"
              aria-label={loc().t('Upload.retry')}
              {disabled}
              onclick={() => retryItem(item)}
            >
              &#8635;
            </button>
          {/if}
        </li>
      {/each}
    </ul>
  {/if}

  {#if hotSpotLocation === 'end'}
    {@render triggerArea()}
  {/if}
</div>

{#if crop}
  <Modal
    open={cropOpen}
    title={cropConfig.modalTitle ?? loc().t('Upload.cropTitle')}
    confirmLoading={cropConfirming}
    onOk={confirmCrop}
    onCancel={cancelCrop}
    onOpenChange={(o) => {
      // 点遮罩/Esc 关闭时也视为取消。
      if (!o && cropOpen) cancelCrop();
    }}
    {...cropModalTextProps}
    {...cropModalProps}
  >
    {#if cropSrc}
      <div class="cd-upload__crop-body">
        <Cropper
          bind:this={cropperRef}
          src={cropSrc}
          shape={cropConfig.shape ?? 'rect'}
          fill={cropConfig.fill ?? '#fff'}
          style="width: 100%; height: 320px;"
          {...cropperNumProps}
        />
      </div>
    {/if}
  </Modal>
{/if}

<style>
  .cd-upload {
    display: flex;
    flex-direction: column;
    gap: var(--cd-spacing-base-tight);
    color: var(--cd-color-upload-text);
  }
  .cd-upload__input {
    position: absolute;
    inline-size: 1px;
    block-size: 1px;
    padding: 0;
    margin: 0;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
    border: 0;
  }
  .cd-upload__trigger-wrap {
    display: flex;
    flex-direction: column;
    gap: var(--cd-spacing-tight);
  }
  .cd-upload__trigger-wrap--row {
    flex-direction: row;
    align-items: center;
  }
  .cd-upload__trigger-wrap--row-reverse {
    flex-direction: row-reverse;
  }
  .cd-upload__prompt {
    color: var(--cd-color-upload-assist-text);
    font-size: var(--cd-font-size-small);
  }
  .cd-upload__trigger {
    align-self: flex-start;
    display: inline-flex;
    align-items: center;
    gap: var(--cd-spacing-tight);
    height: var(--cd-button-height-default);
    padding-inline: var(--cd-button-padding-x);
    background: var(--cd-color-upload-pic-add-bg);
    color: var(--cd-color-upload-text);
    border: 1px solid var(--cd-color-upload-border);
    border-radius: var(--cd-button-radius);
    font-size: var(--cd-button-font-size);
    cursor: pointer;
  }
  /* 裸变体：children 模式下清空默认按钮外观，交给 children 决定（如 Avatar 头像）。 */
  .cd-upload__trigger--bare {
    height: auto;
    padding: 0;
    background: none;
    border: none;
    border-radius: 0;
    color: inherit;
    font-size: inherit;
  }
  .cd-upload__trigger--bare:hover:not(:disabled),
  .cd-upload__trigger--bare:active:not(:disabled) {
    background: none;
  }
  /* 添加按钮 hover/active 背景（对齐 Semi picture-add:hover / :active）。 */
  .cd-upload__trigger:not(.cd-upload__trigger--bare):hover:not(:disabled) {
    background: var(--cd-color-upload-pic-add-bg-hover);
  }
  .cd-upload__trigger:not(.cd-upload__trigger--bare):active:not(:disabled) {
    background: var(--cd-color-upload-pic-add-bg-active);
  }
  .cd-upload__trigger:focus-visible {
    outline: none;
    box-shadow: var(--cd-focus-ring);
  }
  /* 组件级 size：触发按钮高度/字号档（区别于 file.size 体积）。 */
  .cd-upload--small .cd-upload__trigger {
    height: var(--cd-button-height-small);
    font-size: var(--cd-font-size-small);
  }
  .cd-upload--large .cd-upload__trigger {
    height: var(--cd-button-height-large);
    font-size: var(--cd-font-size-header-6);
  }
  .cd-upload__trigger:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
  .cd-upload__dragger {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: var(--cd-spacing-upload-drag-area-padding);
    background: var(--cd-color-upload-drag-area-bg);
    border: var(--cd-width-upload-drag-area-border) dashed var(--cd-color-upload-border);
    border-radius: var(--cd-radius-upload-drag-area);
    color: var(--cd-color-upload-assist-text);
    cursor: pointer;
    transition:
      border-color var(--cd-motion-duration-fast) var(--cd-motion-ease-standard),
      background-color var(--cd-motion-duration-fast) var(--cd-motion-ease-standard);
  }
  .cd-upload__dragger:hover,
  .cd-upload__dragger:focus-visible {
    /* 对齐 Semi drag-area hover：背景 + 描边同时变化 */
    border-color: var(--cd-color-upload-drag-area-border-hover);
    background: var(--cd-color-upload-drag-area-bg-hover);
  }
  .cd-upload__dragger:focus-visible {
    outline: none;
    box-shadow: var(--cd-focus-ring);
  }
  /* 合法拖入高亮态（对齐 Semi drag-area-legal）：背景/描边切主色，与 hover 态一致。 */
  .cd-upload__dragger--legal {
    border-color: var(--cd-color-upload-drag-area-border-hover);
    background: var(--cd-color-upload-drag-area-bg-hover);
  }
  /* legal 态隐藏副文本（对齐 Semi .drag-area-legal .drag-area-sub-text { display:none }）。 */
  .cd-upload__dragger--legal .cd-upload__dragger-sub {
    display: none;
  }
  /* 合法拖入提示（对齐 Semi drag-area-tips-legal）：主色 + 提示字重 + 小字号。 */
  .cd-upload__dragger-tips {
    font-size: var(--cd-font-size-small);
    font-weight: var(--cd-font-upload-drag-area-tips-fontweight);
    color: var(--cd-color-upload-drag-area-tips-text);
  }
  /* 拖拽区图标色（对齐 Semi drag-area-icon）。 */
  .cd-upload__dragger-icon {
    display: inline-flex;
    color: var(--cd-color-upload-drag-area-icon);
  }
  /* disabled：拖拽区文字/图标统一置灰（对齐 Semi drag-area disabled-text），
     不加 opacity（Semi 用专用 disabled-text token 而非透明度）。 */
  .cd-upload--disabled .cd-upload__dragger {
    cursor: not-allowed;
    color: var(--cd-color-upload-drag-area-disabled-text);
  }
  .cd-upload--disabled .cd-upload__dragger:hover,
  .cd-upload--disabled .cd-upload__dragger:focus-visible {
    /* disabled 时 hover 不变背景/描边（对齐 Semi disabled drag-area:hover 保持默认背景）。 */
    background: var(--cd-color-upload-drag-area-bg);
    border-color: var(--cd-color-upload-border);
  }
  .cd-upload--disabled .cd-upload__dragger-main,
  .cd-upload--disabled .cd-upload__dragger-sub,
  .cd-upload--disabled .cd-upload__dragger-icon {
    color: var(--cd-color-upload-drag-area-disabled-text);
  }
  /* 组件级 size：拖拽区内边距/字号档。 */
  .cd-upload--small .cd-upload__dragger {
    padding-block: var(--cd-spacing-base);
    font-size: var(--cd-font-size-small);
  }
  .cd-upload--large .cd-upload__dragger {
    padding-block: var(--cd-spacing-extra-loose, var(--cd-spacing-loose));
    font-size: var(--cd-font-size-header-6);
  }
  /* 组件级 status：校验态影响上传区/卡片边框色（区别于 file.status 进度态）。 */
  .cd-upload--warning .cd-upload__dragger {
    border-color: var(--cd-color-warning);
  }
  .cd-upload--error .cd-upload__dragger {
    border-color: var(--cd-color-danger);
  }
  .cd-upload--warning .cd-upload__trigger {
    border-color: var(--cd-color-warning);
  }
  .cd-upload--error .cd-upload__trigger {
    border-color: var(--cd-color-danger);
  }
  .cd-upload--warning .cd-upload__card,
  .cd-upload--error .cd-upload__card {
    border-color: var(--cd-color-warning);
  }
  .cd-upload--error .cd-upload__card {
    border-color: var(--cd-color-danger);
  }
  .cd-upload__list-title {
    display: flex;
    align-items: center;
    gap: var(--cd-spacing-tight);
    font-size: var(--cd-font-size-small);
    color: var(--cd-color-upload-assist-text);
    font-weight: 500;
    margin-block-end: var(--cd-spacing-upload-title-marginbottom);
  }
  .cd-upload__list-title-text {
    flex: 1 1 auto;
    min-inline-size: 0;
  }
  /* 标题区清空按钮（fileListTitle 为 string 且 showClear 时）：链接式次级操作。 */
  .cd-upload__list-title-clear {
    flex: 0 0 auto;
    padding: 0;
    border: none;
    background: transparent;
    color: var(--cd-color-upload-clear-text);
    cursor: pointer;
    font-size: var(--cd-font-size-small);
    font-weight: 400;
  }
  .cd-upload__list-title-clear:hover {
    color: var(--cd-color-danger);
  }
  .cd-upload__list-title-clear:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
  .cd-upload__list-title-clear:focus-visible {
    outline: none;
    box-shadow: var(--cd-focus-ring);
  }
  .cd-upload__list {
    display: flex;
    flex-direction: column;
    gap: var(--cd-spacing-extra-tight);
    margin: 0;
    padding: 0;
    list-style: none;
  }
  .cd-upload__item {
    display: flex;
    /* 横向：左预览盒 + 右信息列（对齐 Semi file-card 横向布局）。 */
    flex-direction: row;
    align-items: center;
    padding-block: var(--cd-spacing-extra-tight);
    padding-inline: var(--cd-spacing-tight);
    /* 默认卡片背景（对齐 Semi file-card bg，与 hover/fail 态成组）。 */
    background: var(--cd-color-upload-card-bg);
    border-radius: var(--cd-radius-upload-file-card);
    transition: background-color var(--cd-motion-duration-fast) var(--cd-motion-ease-standard);
  }
  /* 预览盒（对齐 Semi file-card-preview）：固定尺寸方形、居中、圆角。 */
  .cd-upload__item-preview {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    inline-size: var(--cd-width-upload-file-card-preview);
    block-size: var(--cd-height-upload-file-card-preview);
    margin: var(--cd-spacing-upload-file-card-preview-margin);
    border-radius: var(--cd-radius-upload-file-card-preview);
    color: var(--cd-color-upload-preview-icon);
    overflow: hidden;
  }
  /* 非图片占位（对齐 Semi file-card-preview-placeholder）。 */
  .cd-upload__item-preview--placeholder {
    background: var(--cd-color-upload-file-card-preview-placeholder-bg);
    color: var(--cd-color-upload-file-card-preview-placeholder-text);
  }
  .cd-upload__item-preview-img {
    inline-size: var(--cd-width-upload-file-card-preview-img);
    block-size: var(--cd-width-upload-file-card-preview-img);
    object-fit: cover;
  }
  /* 信息列：纵向承载 item-main 行 + 进度条（原 item 的 column 布局移到此）。 */
  .cd-upload__item-body {
    flex: 1 1 auto;
    min-inline-size: 0;
    display: flex;
    flex-direction: column;
    gap: var(--cd-spacing-extra-tight);
  }
  .cd-upload__item-main {
    display: flex;
    align-items: center;
    gap: var(--cd-spacing-tight);
  }
  /* 内联错误图标（对齐 Semi file-card-icon-error）：固定宽 + 右边距 + 危险色。 */
  .cd-upload__item-icon {
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    inline-size: var(--cd-width-upload-file-card-icon);
    margin-inline-end: var(--cd-spacing-upload-file-card-icon-marginright);
  }
  .cd-upload__item-icon--error {
    color: var(--cd-color-upload-file-card-fail-info-text);
  }
  .cd-upload__item:hover {
    background: var(--cd-color-upload-card-bg-hover);
  }
  .cd-upload__item--error {
    color: var(--cd-color-upload-file-card-fail-info-text);
    /* 失败态卡片红底（对齐 Semi file-card-fail bg）。 */
    background: var(--cd-color-upload-card-fail-bg);
  }
  .cd-upload__item--error:hover {
    background: var(--cd-color-upload-card-fail-bg-hover);
  }
  .cd-upload__item-name {
    flex: 1 1 auto;
    min-inline-size: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    /* 文件名字重（对齐 Semi file-card-info-name）。 */
    font-weight: var(--cd-font-upload-file-card-info-name-fontweight);
  }
  .cd-upload__item-size,
  .cd-upload__item-status {
    flex: 0 0 auto;
    color: var(--cd-color-upload-assist-text);
    font-size: var(--cd-font-size-small);
  }
  .cd-upload__item-size {
    /* 文件尺寸字重（对齐 Semi file-card-info-size）。 */
    font-weight: var(--cd-font-upload-file-card-info-size-fontweight);
    margin-inline-start: var(--cd-spacing-upload-file-card-info-size-marginleft);
  }
  .cd-upload__item--error .cd-upload__item-status {
    /* 失败提示文本色（对齐 Semi file-card-fail info-validate-message）。 */
    color: var(--cd-color-upload-file-card-fail-info-text);
  }
  .cd-upload__item-remove {
    flex: 0 0 auto;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    border: none;
    background: transparent;
    color: var(--cd-color-upload-assist-text);
    cursor: pointer;
    border-radius: var(--cd-border-radius-small);
    font-size: var(--cd-font-size-header-6);
    line-height: 1;
  }
  .cd-upload__item-remove:hover {
    color: var(--cd-color-upload-text);
  }
  .cd-upload__item-remove:focus-visible {
    outline: none;
    box-shadow: var(--cd-focus-ring);
  }
  .cd-upload__item-remove:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
  .cd-upload__retry-btn {
    flex: 0 0 auto;
    display: inline-flex;
    align-items: center;
    padding: 0 var(--cd-spacing-extra-tight);
    /* 重试按钮左边距（对齐 Semi file-card-info-retry marginLeft）。 */
    margin-inline-start: var(--cd-spacing-upload-file-card-info-retry-marginleft);
    border: none;
    background: transparent;
    color: var(--cd-color-upload-retry-text);
    cursor: pointer;
    font-size: var(--cd-font-size-small);
    border-radius: var(--cd-border-radius-small);
  }
  .cd-upload__retry-btn:hover {
    text-decoration: underline;
  }
  .cd-upload__retry-btn:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
  /* 替换按钮（text 列表）：复用重试按钮观感（链接式次级操作）。 */
  .cd-upload__replace-btn {
    flex: 0 0 auto;
    display: inline-flex;
    align-items: center;
    padding: 0 var(--cd-spacing-extra-tight);
    margin-inline-start: var(--cd-spacing-upload-file-card-info-retry-marginleft);
    border: none;
    background: transparent;
    color: var(--cd-color-upload-retry-text);
    cursor: pointer;
    font-size: var(--cd-font-size-small);
    border-radius: var(--cd-border-radius-small);
  }
  .cd-upload__replace-btn:hover {
    text-decoration: underline;
  }
  .cd-upload__replace-btn:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
  .cd-upload__replace-btn:focus-visible {
    outline: none;
    box-shadow: var(--cd-focus-ring);
  }
  .cd-upload__clear-btn {
    align-self: flex-end;
    display: inline-flex;
    align-items: center;
    gap: var(--cd-spacing-extra-tight);
    padding: var(--cd-spacing-extra-tight) var(--cd-spacing-tight);
    border: none;
    background: transparent;
    color: var(--cd-color-upload-clear-text);
    cursor: pointer;
    font-size: var(--cd-font-size-small);
    border-radius: var(--cd-border-radius-small);
  }
  .cd-upload__clear-btn:hover {
    color: var(--cd-color-danger);
    background: var(--cd-color-upload-card-bg-hover);
  }
  .cd-upload__clear-btn:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
  .cd-upload__dragger-main {
    display: block;
    font-size: var(--cd-font-size-regular);
    color: var(--cd-color-upload-drag-area-main-text-default);
    margin-block-end: var(--cd-spacing-upload-drag-area-main-text-marginbottom);
  }
  /* 主/副文本 hover/active 态（对齐 Semi drag-area-main-text / -sub-text）。
     文字挂在拖拽区内，故用拖拽区 :hover/:active 驱动其子文本换色。 */
  .cd-upload__dragger:hover .cd-upload__dragger-main {
    color: var(--cd-color-upload-drag-area-main-text-hover);
  }
  .cd-upload__dragger:active .cd-upload__dragger-main {
    color: var(--cd-color-upload-drag-area-main-text-active);
  }
  .cd-upload__dragger-sub {
    display: block;
    font-size: var(--cd-font-size-small);
    color: var(--cd-color-upload-drag-area-sub-text-default);
  }
  .cd-upload__dragger:hover .cd-upload__dragger-sub {
    color: var(--cd-color-upload-drag-area-sub-text-hover);
  }
  .cd-upload__dragger:active .cd-upload__dragger-sub {
    color: var(--cd-color-upload-drag-area-sub-text-active);
  }

  /* --- image / picture-card 缩略图网格 --- */
  .cd-upload__grid {
    display: flex;
    flex-wrap: wrap;
    gap: var(--cd-spacing-upload-picture-file-card-gap);
    /* 卡片网格下边距（对齐 Semi file-list-main margin-bottom）。 */
    margin: 0 0 var(--cd-spacing-upload-picture-file-card-marginbottom);
    padding: 0;
    list-style: none;
  }
  .cd-upload__card {
    position: relative;
    inline-size: var(--cd-width-upload-file-pic-card);
    block-size: var(--cd-height-upload-file-pic-card);
    border: 1px solid var(--cd-color-upload-border);
    border-radius: var(--cd-radius-upload-picture-file-card-img);
    overflow: hidden;
    background: var(--cd-color-upload-pic-add-bg);
  }
  .cd-upload__card--error {
    border-color: var(--cd-color-upload-picture-file-card-error-border);
  }
  .cd-upload__thumb-btn {
    display: block;
    inline-size: 100%;
    block-size: 100%;
    padding: 0;
    border: none;
    background: transparent;
    cursor: pointer;
  }
  .cd-upload__thumb-btn:focus-visible {
    outline: none;
    box-shadow: var(--cd-focus-ring);
  }
  .cd-upload__thumb {
    inline-size: 100%;
    block-size: 100%;
    object-fit: cover;
    display: block;
  }
  .cd-upload__thumb--placeholder {
    background: var(--cd-color-upload-file-card-preview-placeholder-bg);
    /* 占位图前景色（对齐 Semi file-card-preview-placeholder text；成对消费 bg/text）。 */
    color: var(--cd-color-upload-file-card-preview-placeholder-text);
  }
  /* previewFile 自定义缩略图容器：撑满卡片，内容居中。 */
  .cd-upload__thumb--custom {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  /* renderFileOperation 自定义操作区：靠右排布，与默认操作区占位一致。 */
  .cd-upload__item-operation {
    flex: 0 0 auto;
    display: inline-flex;
    align-items: center;
    gap: var(--cd-spacing-extra-tight);
    margin-inline-start: auto;
  }
  /* renderPicPreviewIcon 预览图标浮层（picture-card）：hover/focus 时居中显现（对齐 Semi preview-icon）。 */
  .cd-upload__pic-preview-icon {
    position: absolute;
    inset-block-start: 50%;
    inset-inline-start: 50%;
    transform: translate(-50%, -50%);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    /* 预览图标色（对齐 Semi file-card-preview color）。 */
    color: var(--cd-color-upload-preview-icon);
    opacity: 0;
    pointer-events: none;
    transition: opacity var(--cd-motion-duration-fast) var(--cd-motion-ease-standard);
    z-index: 2;
  }
  .cd-upload__card:hover .cd-upload__pic-preview-icon,
  .cd-upload__card:focus-within .cd-upload__pic-preview-icon {
    opacity: 1;
    pointer-events: auto;
  }
  /* renderFileItem 自定义列表项：清空默认卡片内边距/背景，交由使用方渲染。 */
  .cd-upload__item--custom {
    padding: 0;
    background: transparent;
  }
  .cd-upload__item--custom:hover {
    background: transparent;
  }
  /* showPicInfo 信息浮层（picture-card）：底部渐变条承托文件名。 */
  .cd-upload__pic-info {
    position: absolute;
    inset-block-end: 0;
    inset-inline: 0;
    padding: var(--cd-spacing-extra-tight) var(--cd-spacing-tight);
    background: var(--cd-color-upload-picture-file-card-hover-bg);
    color: var(--cd-color-upload-picture-file-card-pic-info-text);
    font-size: var(--cd-font-upload-picture-file-card-pic-info-fontsize);
    pointer-events: none;
    z-index: 1;
  }
  .cd-upload__pic-info-name {
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  /* 裁切弹窗内容容器：给 Cropper 一个明确的布局盒。 */
  .cd-upload__crop-body {
    inline-size: 100%;
  }
  .cd-upload__card-progress {
    position: absolute;
    inset-inline: var(--cd-spacing-extra-tight);
    inset-block-end: var(--cd-spacing-extra-tight);
  }
  /* hover 遮罩（对齐 Semi picture-file-card::before hover-bg）：覆盖整卡的半透明层，
     hover/focus 时可见，承托关闭/重试等操作。 */
  .cd-upload__card::before {
    content: '';
    position: absolute;
    inset: 0;
    background: var(--cd-color-upload-picture-file-card-hover-bg);
    opacity: 0;
    pointer-events: none;
    transition: opacity var(--cd-motion-duration-fast) var(--cd-motion-ease-standard);
  }
  .cd-upload__card:hover::before,
  .cd-upload__card:focus-within::before,
  .cd-upload__card--uploading::before {
    opacity: 1;
  }
  .cd-upload__card-overlay {
    position: absolute;
    inset-block-start: 0;
    inset-inline: 0;
    display: flex;
    align-items: center;
    gap: var(--cd-spacing-extra-tight);
    padding: var(--cd-spacing-extra-tight);
    opacity: 0;
    transition: opacity var(--cd-motion-duration-fast) var(--cd-motion-ease-standard);
  }
  .cd-upload__card:hover .cd-upload__card-overlay,
  .cd-upload__card:focus-within .cd-upload__card-overlay {
    opacity: 1;
  }
  .cd-upload__card-name {
    flex: 1 1 auto;
    min-inline-size: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: var(--cd-color-upload-picture-file-card-pic-info-text);
    /* 图片信息文字字号/字重（对齐 Semi picture-file-card-pic-info）。 */
    font-size: var(--cd-font-upload-picture-file-card-pic-info-fontsize);
    font-weight: var(--cd-font-upload-picture-file-card-pic-info-fontweight);
  }
  .cd-upload__card-remove {
    flex: 0 0 auto;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    inline-size: var(--cd-width-upload-picture-file-card-close);
    block-size: var(--cd-width-upload-picture-file-card-close);
    border: none;
    /* 移除图标背景（对齐 Semi pic-remove-bg overlay 底）。 */
    background: var(--cd-color-upload-pic-remove-bg);
    color: var(--cd-color-upload-picture-file-card-close-icon);
    cursor: pointer;
    border-radius: var(--cd-radius-upload-picture-file-card-close);
    font-size: var(--cd-font-size-header-6);
    line-height: 1;
  }
  .cd-upload__card-remove:focus-visible {
    outline: none;
    box-shadow: var(--cd-focus-ring);
  }
  .cd-upload__card-remove:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
  /* 照片墙替换按钮：与关闭按钮同观感，位于 overlay 内（关闭按钮之前）。 */
  .cd-upload__card-replace {
    flex: 0 0 auto;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    inline-size: var(--cd-width-upload-picture-file-card-close);
    block-size: var(--cd-width-upload-picture-file-card-close);
    border: none;
    background: var(--cd-color-upload-pic-remove-bg);
    /* 替换按钮文本色（对齐 Semi picture-file-card-replace color）。 */
    color: var(--cd-color-upload-replace-text);
    cursor: pointer;
    border-radius: var(--cd-radius-upload-picture-file-card-close);
    font-size: var(--cd-font-size-small);
    line-height: 1;
  }
  .cd-upload__card-replace:focus-visible {
    outline: none;
    box-shadow: var(--cd-focus-ring);
  }
  .cd-upload__card-replace:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
  /* 失败角标（对齐 Semi picture-file-card-icon-error）：定位到卡片右下。 */
  .cd-upload__card-error-icon {
    position: absolute;
    inset-block-end: var(--cd-spacing-upload-picture-file-card-loading-error-bottom);
    inset-inline-end: var(--cd-spacing-upload-picture-file-card-loading-error-right);
    inline-size: var(--cd-width-upload-picture-file-card-loading-icon);
    block-size: var(--cd-width-upload-picture-file-card-loading-icon);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: var(--cd-color-upload-picture-file-card-loading-error-icon);
    font-weight: var(--cd-font-weight-bold);
    line-height: 1;
    z-index: 2;
  }
  /* 图片卡失败重试按钮（对齐 Semi picture-file-card-retry）：hover/focus 时居中显现。 */
  .cd-upload__card-retry {
    position: absolute;
    inset-block-start: 50%;
    inset-inline-start: 50%;
    transform: translate(-50%, -50%);
    inline-size: var(--cd-width-upload-file-card-retry);
    block-size: var(--cd-width-upload-file-card-retry);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    border: none;
    background: var(--cd-color-upload-file-card-retry-bg);
    color: var(--cd-color-upload-file-card-retry-text);
    border-radius: var(--cd-radius-upload-file-card-retry);
    font-size: var(--cd-width-upload-file-card-retry-icon);
    line-height: var(--cd-height-upload-file-card-retry-icon);
    cursor: pointer;
    opacity: 0;
    transition: opacity var(--cd-motion-duration-fast) var(--cd-motion-ease-standard);
    z-index: 3;
  }
  .cd-upload__card:hover .cd-upload__card-retry,
  .cd-upload__card:focus-within .cd-upload__card-retry {
    opacity: 1;
  }
  .cd-upload__card-retry:focus-visible {
    outline: none;
    box-shadow: var(--cd-focus-ring);
  }
  .cd-upload__card-retry:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
  @media (prefers-reduced-motion: reduce) {
    .cd-upload__card-overlay,
    .cd-upload__card::before,
    .cd-upload__card-retry,
    .cd-upload__pic-preview-icon,
    .cd-upload__item,
    .cd-upload__dragger {
      transition: none;
    }
  }
</style>
