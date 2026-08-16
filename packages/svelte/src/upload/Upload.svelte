<!--
  Upload — 严格对齐 Semi Design（破坏性重写，无向后兼容）。
  状态机下沉：文件项 CRUD、校验管线（accept/size/beforeUpload/transformFile）、进度/成功/失败
  流转、拖拽语义全部委托 core `createUpload()`（packages/core/src/upload/foundation.ts，逐行移植
  Semi UploadFoundation）。Svelte 层只做：state 持有（runes）、DOM 事件桥接、真实 XHR/customRequest
  I/O、objectURL 创建/释放、粘贴剪贴板读取、裁切/替换弹层编排——这些是 DOM/框架专属、Semi 原版也放在
  React 组件层（index.tsx）而非 foundation 的部分。adapter 的 notifyXxx 是纯回调转发（对齐 Semi
  index.tsx `get adapter()`：`notifyError: (...) => this.props.onError(...)` 这类一一对应写法）。
  受控 prop：fileList / defaultFileList（对齐 Semi）。文件卡片渲染拆到 FileCard.svelte
  （renderPic/renderFile 双分支）。class 命名走 Semi 连字符体系 cd-upload-*。
  真实上传：有 action 且无 customRequest 时选文件后自动 XHR 上传；customRequest 优先。
  listType=picture：照片墙缩略图网格；list：文本卡片列表；none：不渲染列表。
  crop：image/* 文件先进裁切弹窗（Modal + Cropper）。directory：input 加 webkitdirectory。
  minSize/maxSize：core checkFileSize 校验（KB）；beforeUpload 支持返回富对象控制上传。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import {
    useLiveAnnouncer,
    createUpload,
    validateFileSize,
    type BaseFileItem,
    type CustomFile,
    type UploadAdapter,
    type XhrError,
  } from '@chenzy-design/core';
  import { useLocale } from '../locale-provider/index.js';
  import { Modal } from '../modal/index.js';
  import { Cropper } from '../cropper/index.js';
  import FileCard from './FileCard.svelte';
  import { IconUpload } from '@chenzy-design/icons';
  import type { CropperShape } from '../cropper/index.js';
  import type {
    UploadFileItem,
    UploadListType,
    UploadValidateStatus,
    UploadPromptPosition,
    UploadDataOrFn,
    UploadShowTooltip,
    UploadFileListTitle,
    BeforeUploadObjectResult,
    BeforeUploadProps,
    AfterUploadProps,
    AfterUploadResult,
    CustomRequestArgs,
    RenderFileItemProps,
    RenderPictureCloseProps,
  } from './types.js';

  /**
   * 裁剪配置（对标 Semi CropProps）。crop=true 时用默认配置；传对象覆盖。
   */
  export interface UploadCropProps {
    aspectRatio?: number;
    shape?: CropperShape;
    minZoom?: number;
    maxZoom?: number;
    zoomStep?: number;
    quality?: number;
    fill?: string;
    modalTitle?: string;
    modalOkText?: string;
    modalCancelText?: string;
  }

  interface Props {
    /** 受控文件列表（对齐 Semi fileList）；提供则受控。 */
    fileList?: UploadFileItem[];
    /** 非受控初始文件列表（对齐 Semi defaultFileList）。 */
    defaultFileList?: UploadFileItem[];
    accept?: string;
    multiple?: boolean;
    /** 上传整个目录（对齐 Semi directory；input 加 webkitdirectory）。 */
    directory?: boolean;
    limit?: number;
    /** 单文件最大体积，单位 KB（对齐 Semi maxSize）。 */
    maxSize?: number;
    /** 单文件最小体积，单位 KB（对齐 Semi minSize）。 */
    minSize?: number;
    disabled?: boolean;
    /** 组件级校验态（对齐 Semi validateStatus）。 */
    validateStatus?: UploadValidateStatus;
    /** 文件列表展示类型（对齐 Semi listType）：list（默认）/picture/none。 */
    listType?: UploadListType;
    /** 拖拽上传（对齐 Semi draggable）。 */
    draggable?: boolean;
    /** 上传地址（对齐 Semi action）；提供且无 customRequest 时自动 XHR 上传。 */
    action?: string;
    /** 表单字段名（对齐 Semi name）。回退链 name || fileName || fileInstance.name。 */
    name?: string;
    /** 同 name，避免 Form.Upload 中 props.name 冲突（对齐 Semi fileName）。name 未传时回退到此。 */
    fileName?: string;
    /** 额外请求头（对齐 Semi headers）。静态对象或按当前 file 求值的函数。 */
    headers?: UploadDataOrFn;
    /** 随文件一起提交的额外字段（对齐 Semi data）。静态对象或按当前 file 求值的函数。 */
    data?: UploadDataOrFn;
    /**
     * 上传前钩子（对齐 Semi beforeUpload）：入参 { file, fileList }。
     * 返回 false 拒绝该文件；true/undefined 正常上传；返回富对象 BeforeUploadObjectResult
     * 精细控制（shouldUpload/autoRemove/status/validateMessage/fileInstance）。支持异步。
     */
    beforeUpload?: (
      props: BeforeUploadProps,
    ) => boolean | BeforeUploadObjectResult | Promise<boolean | BeforeUploadObjectResult>;
    /** 自定义上传实现（对齐 Semi customRequest，优先于 action）。 */
    customRequest?: (args: CustomRequestArgs) => void | Promise<void>;
    /** 上传成功后钩子（对齐 Semi afterUpload），同步返回。 */
    afterUpload?: (props: AfterUploadProps) => AfterUploadResult | void;
    onChange?: (props: { fileList: UploadFileItem[]; currentFile: UploadFileItem }) => void;
    onExceed?: (files: File[]) => void;
    /** 上传成功（对齐 Semi onSuccess(responseBody, file, fileList)）。 */
    onSuccess?: (responseBody: unknown, file: UploadFileItem, fileList: UploadFileItem[]) => void;
    /** 上传失败（对齐 Semi onError(error, file, fileList, xhr)）。 */
    onError?: (error: Error, file: UploadFileItem, fileList: UploadFileItem[], xhr?: XMLHttpRequest) => void;
    /** 上传进度（对齐 Semi onProgress(percent, file, fileList)）。 */
    onProgress?: (percent: number, file: UploadFileItem, fileList: UploadFileItem[]) => void;
    children?: Snippet;
    /** 上传失败是否显示重试按钮（对齐 Semi showRetry）。默认 true。 */
    showRetry?: boolean;
    /** success 项显示替换按钮（对齐 Semi showReplace）。默认 false。 */
    showReplace?: boolean;
    /** 是否渲染文件列表（对齐 Semi showUploadList）。默认 true。 */
    showUploadList?: boolean;
    /** 是否显示批量清除按钮（对齐 Semi showClear）。默认 true。 */
    showClear?: boolean;
    onClear?: () => void;
    /** 批量清除前钩子（对齐 Semi beforeClear）。 */
    beforeClear?: (fileList: UploadFileItem[]) => boolean | Promise<boolean>;
    /** 文件列表标题（对齐 Semi fileListTitle）。 */
    fileListTitle?: UploadFileListTitle;
    /** 文件名超长提示（对齐 Semi showTooltip）。默认 true。 */
    showTooltip?: UploadShowTooltip;
    /** 上传区提示内容（对齐 Semi prompt）。 */
    prompt?: string | Snippet;
    /** 提示位置（对齐 Semi promptPosition）。默认 'right'。 */
    promptPosition?: UploadPromptPosition;
    onDrop?: (e: DragEvent, files: File[], fileList: UploadFileItem[]) => void;
    onOpenFileDialog?: () => void;
    onPreviewClick?: (fileItem: UploadFileItem) => void;
    onAcceptInvalid?: (files: File[]) => void;
    onRetry?: (fileItem: UploadFileItem) => void;
    onSizeError?: (file: UploadFileItem, fileList: UploadFileItem[]) => void;
    /** 校验失败统一文案（对齐 Semi validateMessage）。 */
    validateMessage?: string;
    withCredentials?: boolean;
    transformFile?: (file: File) => File | Promise<File>;
    dragIcon?: Snippet;
    dragMainText?: string | Snippet;
    dragSubText?: string | Snippet;
    addOnPasting?: boolean;
    onPastingError?: (error: unknown) => void;
    /** 触发热点位置（对齐 Semi hotSpotLocation）。默认 'end'。 */
    hotSpotLocation?: 'start' | 'end';
    /** 选中原始 File 列表变化回调（对齐 Semi onFileChange）。 */
    onFileChange?: (files: File[]) => void;
    /** 移除前钩子（对齐 Semi beforeRemove）。 */
    beforeRemove?: (file: UploadFileItem, fileList: UploadFileItem[]) => boolean | Promise<boolean>;
    /** 移除后回调（对齐 Semi onRemove(currentFile, fileList, currentFileItem)）。 */
    onRemove?: (currentFile: File | undefined, fileList: UploadFileItem[], currentFileItem: UploadFileItem) => void;
    /** 单文件上传超时（毫秒）。 */
    timeout?: number;
    /** 上传触发时机（对齐 Semi uploadTrigger）。默认 'auto'。 */
    uploadTrigger?: 'auto' | 'custom';
    /** 每项卡片自定义 style（对齐 Semi itemStyle）。 */
    itemStyle?: string | Record<string, string | number>;
    /** 照片墙缩略图宽度（对齐 Semi picWidth）。 */
    picWidth?: number | string;
    /** 照片墙缩略图高度（对齐 Semi picHeight）。 */
    picHeight?: number | string;
    capture?: boolean | 'user' | 'environment';

    // ——— 裁剪集成（对标 Semi crop 家族）———
    crop?: boolean | UploadCropProps;
    /** 裁切前钩子（对齐 Semi beforeCrop(file, fileList)）。 */
    beforeCrop?: (file: File, fileList: File[]) => boolean | Promise<boolean>;
    onCropError?: (err: unknown) => void;
    cropModalProps?: Record<string, unknown>;

    // ——— render 家族（对齐 Semi，用 Svelte Snippet，入参 RenderFileItemProps）———
    renderFileItem?: Snippet<[RenderFileItemProps]>;
    previewFile?: Snippet<[RenderFileItemProps]>;
    renderThumbnail?: Snippet<[RenderFileItemProps]>;
    showPicInfo?: boolean;
    renderPicInfo?: Snippet<[RenderFileItemProps]>;
    renderPicPreviewIcon?: Snippet<[RenderFileItemProps]>;
    renderPicClose?: Snippet<[RenderPictureCloseProps]>;
    renderFileOperation?: Snippet<[RenderFileItemProps]>;
    /** 根容器额外 class（对齐 Semi className）。 */
    class?: string;
    /** 根容器 style（对齐 Semi style）。 */
    style?: string;
  }

  let {
    fileList,
    defaultFileList = [],
    accept,
    multiple = false,
    directory = false,
    limit,
    maxSize,
    minSize,
    disabled = false,
    validateStatus = 'default',
    listType = 'list',
    draggable = false,
    action,
    name,
    fileName,
    headers,
    data,
    beforeUpload,
    customRequest,
    afterUpload,
    onChange,
    onExceed,
    onSuccess,
    onError,
    onProgress,
    children,
    showRetry = true,
    showReplace = false,
    showUploadList = true,
    showClear = true,
    onClear,
    beforeClear,
    fileListTitle,
    showTooltip = true,
    prompt,
    promptPosition = 'right',
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
    hotSpotLocation = 'end',
    onFileChange,
    beforeRemove,
    onRemove,
    timeout = 0,
    uploadTrigger = 'auto',
    itemStyle,
    picWidth,
    picHeight,
    capture,
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
    class: className,
    style: styleProp,
  }: Props = $props();

  const loc = useLocale();
  const announcer = useLiveAnnouncer();
  const announcedBucket = new Map<string, number>();

  // 表单字段名回退链（对齐 Semi post() 源码：option.name || option.fileName || fileInstance.name。
  // 注：Semi 官方 API 表描述 fileName「避免 Form.Upload 中 props.name 冲突」，实践中 Form 场景
  // name 通常不传，回退链天然落到 fileName；源码字面优先级是 name 先于 fileName。）
  function fieldNameFor(fileInstance: File): string {
    return name || fileName || fileInstance.name;
  }

  const isControlled = $derived(fileList !== undefined);
  // 非受控初始值（仅取初始 defaultFileList，后续由内部状态管理）。
  function getInitial(): UploadFileItem[] {
    return [...defaultFileList];
  }
  let inner = $state<UploadFileItem[]>(getInitial());
  const current = $derived(isControlled ? (fileList ?? []) : inner);

  let inputEl: HTMLInputElement | null = null;

  let dragOver = $state(false);

  const xhrMap = new Map<string, XMLHttpRequest>();
  let mounted = true;

  const objectUrls = new Map<string, string>();
  const isPicture = $derived(listType === 'picture');

  // replaceIdx：picture/list 替换流程记录的目标 index（对齐 Semi state.replaceIdx），
  // core 状态机在 handleReplaceChange 里读取。
  let replaceIdx = -1;

  // ——— core 状态机桥接：UploadFileItem（渲染层字段）与 BaseFileItem（core/Semi 字段）同构，
  // 全字段名已对齐 Semi（fileInstance/size:string/validateMessage 等），无需转换层。———
  function toItems(list: UploadFileItem[]): BaseFileItem[] {
    return list as unknown as BaseFileItem[];
  }
  function fromItems(list: BaseFileItem[]): UploadFileItem[] {
    return list as unknown as UploadFileItem[];
  }

  function commit(next: BaseFileItem[], currentFile?: BaseFileItem) {
    const patched = applyPendingSizeMessages(next);
    const nextItems = fromItems(patched);
    if (!isControlled) inner = nextItems;
    onChange?.({
      fileList: nextItems,
      currentFile: (currentFile as UploadFileItem | undefined) ?? nextItems[nextItems.length - 1] ?? ({} as UploadFileItem),
    });
  }

  function previewUrl(item: UploadFileItem): string | undefined {
    if (item.preview === false) return undefined;
    if (item.url) return item.url;
    if (!item.fileInstance) return undefined;
    let u = objectUrls.get(item.uid);
    if (u === undefined) {
      u = URL.createObjectURL(item.fileInstance);
      objectUrls.set(item.uid, u);
    }
    return u;
  }
  // list 文本卡片预览：仅图片项返回缩略图地址，否则 undefined → 占位。
  function itemThumbUrl(item: UploadFileItem): string | undefined {
    if (item.preview === false) return undefined;
    const isImage = item.fileInstance ? item.fileInstance.type.startsWith('image/') : Boolean(item.url);
    if (!isImage) return undefined;
    return previewUrl(item);
  }
  function itemPreviewEnabled(item: UploadFileItem): boolean {
    if (item.preview === false) return false;
    return item.fileInstance ? item.fileInstance.type.startsWith('image/') : Boolean(item.url);
  }
  function revokeUrl(uid: string) {
    const u = objectUrls.get(uid);
    if (u !== undefined) {
      URL.revokeObjectURL(u);
      objectUrls.delete(uid);
    }
  }

  // directory/capture 是非标准 input 属性，命令式 toggle。
  $effect(() => {
    if (!inputEl) return;
    inputEl.toggleAttribute('webkitdirectory', directory);
    if (capture === undefined || capture === false) {
      inputEl.removeAttribute('capture');
    } else {
      inputEl.setAttribute('capture', capture === true ? '' : capture);
    }
  });

  // 卸载：中止上传 + 释放 objectURL + 收尾裁切。
  $effect(() => {
    return () => {
      mounted = false;
      for (const xhr of xhrMap.values()) xhr.abort();
      xhrMap.clear();
      for (const u of objectUrls.values()) URL.revokeObjectURL(u);
      objectUrls.clear();
      announcedBucket.clear();
      if (cropSrc) URL.revokeObjectURL(cropSrc);
      cropResolve?.(null);
      cropResolve = null;
    };
  });

  // 粘贴监听（addOnPasting）。crop 开启时先走裁切管线，否则直接进 core handleChange。
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
        if (files.length > 0) dispatchSelected(files);
      } catch (error) {
        onPastingError?.(error);
      }
    }
    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  });

  function announceProgress(item: BaseFileItem, percent: number) {
    const bucket = Math.floor(percent / 25);
    if (bucket <= 0 || bucket >= 4) return;
    if (announcedBucket.get(item.uid) === bucket) return;
    announcedBucket.set(item.uid, bucket);
    announcer.announce(loc().t('Upload.announceUploading', { name: item.name, percent }));
  }

  function formatKB(kb: number): string {
    if (kb >= 1024) return `${(kb / 1024).toFixed(1)}MB`;
    return `${kb}KB`;
  }

  // 校验失败本地化文案：checkFileSize 只判定 true/false（对齐 Semi），min/max 具体原因与
  // i18n 文案是本仓库既有能力，在此处按 uid 暂存，notifyChange 首次看到该 uid 时写入
  // validateMessage（buildFileItem 在 notifySizeError 之后才创建 item，需要延迟落地）。
  const pendingSizeMessages = new Map<string, string>();
  function stashSizeMessage(file: CustomFile) {
    if (!file.uid) return;
    const reason = validateFileSize(file.size, { minSize, maxSize });
    if (!reason) return;
    const limitKB = reason === 'max' ? maxSize! : minSize!;
    pendingSizeMessages.set(
      file.uid,
      validateMessage ?? loc().t(reason === 'max' ? 'Upload.sizeError' : 'Upload.minSizeError', { size: formatKB(limitKB) }),
    );
  }
  function applyPendingSizeMessages(list: BaseFileItem[]): BaseFileItem[] {
    if (pendingSizeMessages.size === 0) return list;
    let changed = false;
    const next = list.map((item) => {
      const msg = pendingSizeMessages.get(item.uid);
      if (msg === undefined || item.validateMessage !== undefined) return item;
      changed = true;
      pendingSizeMessages.delete(item.uid);
      return { ...item, validateMessage: msg };
    });
    return changed ? next : list;
  }

  // ——— core adapter：notifyXxx 是纯回调转发（对齐 Semi index.tsx get adapter()）；
  // post/createObjectUrl/releaseObjectUrl 是渲染层独有的 DOM I/O，core 只调不碰。———
  const adapter: UploadAdapter = {
    notifyFileSelect: (files) => onFileChange?.(files),
    notifyError: (error, fileInstance, list, xhr) => {
      announcer.announce(loc().t('Upload.announceError', { name: fileInstance.name }), 'assertive');
      onError?.(error, fileInstance as unknown as UploadFileItem, fromItems(list), xhr);
    },
    notifySuccess: (body, fileInstance, list) => {
      announcer.announce(loc().t('Upload.announceSuccess', { name: fileInstance.name }));
      onSuccess?.(body, fileInstance as unknown as UploadFileItem, fromItems(list));
    },
    notifyProgress: (percent, fileInstance, list) => {
      const item = list.find((it) => it.uid === (fileInstance as CustomFile).uid);
      if (item) announceProgress(item, percent);
      onProgress?.(percent, fileInstance as unknown as UploadFileItem, fromItems(list));
    },
    notifyRemove: (file, list, fileItem) => onRemove?.(file, fromItems(list), fileItem as unknown as UploadFileItem),
    notifySizeError: (file, list) => {
      stashSizeMessage(file);
      onSizeError?.(file as unknown as UploadFileItem, fromItems(list));
    },
    notifyExceed: (files) => onExceed?.(files),
    notifyBeforeUpload: ({ file, fileList: list }) =>
      beforeUpload ? beforeUpload({ file: file as unknown as UploadFileItem, fileList: fromItems(list) }) : true,
    notifyAfterUpload: ({ response, file, fileList: list }) =>
      afterUpload?.({ response, file: file as unknown as UploadFileItem, fileList: fromItems(list) }) as
        | AfterUploadResult
        | undefined,
    notifyBeforeRemove: (file, list) => (beforeRemove ? beforeRemove(file as unknown as UploadFileItem, fromItems(list)) : true),
    notifyBeforeClear: (list) => (beforeClear ? beforeClear(fromItems(list)) : true),
    notifyChange: ({ currentFile, fileList: list }) => commit(list, currentFile),
    notifyClear: () => onClear?.(),
    notifyPreviewClick: (file) => onPreviewClick?.(file as unknown as UploadFileItem),
    notifyDrop: (e, files, list) => onDrop?.(e as DragEvent, files, fromItems(list)),
    notifyAcceptInvalid: (files) => onAcceptInvalid?.(files),
    notifyPastingError: (error) => onPastingError?.(error),
    notifyRetry: (fileItem) => onRetry?.(fileItem as unknown as UploadFileItem),
    createObjectUrl: (file, uid) => {
      const u = URL.createObjectURL(file);
      objectUrls.set(uid, u);
      return u;
    },
    releaseObjectUrl: revokeUrl,
    releaseAllObjectUrls: () => {
      for (const u of objectUrls.values()) URL.revokeObjectURL(u);
      objectUrls.clear();
    },
    post: (file, hooks) => postFile(file, hooks),
  };

  const core = createUpload({
    adapter,
    getProps: () => ({
      disabled,
      accept,
      limit,
      maxSize,
      minSize,
      directory,
      uploadTrigger,
      transformFile,
      beforeUpload: Boolean(beforeUpload),
      afterUpload: Boolean(afterUpload),
      addOnPasting,
    }),
    getState: () => ({ fileList: toItems(current), replaceIdx }),
    setState: (patch) => {
      if (patch.fileList !== undefined) {
        const nextItems = fromItems(patch.fileList);
        if (!isControlled) inner = nextItems;
      }
      if (patch.replaceIdx !== undefined) replaceIdx = patch.replaceIdx;
    },
  });

  // 真实 XHR / customRequest 上传单个文件项（DOM I/O，Semi 原版也在 React 层之外的浏览器
  // API 边界；本仓库 foundation.post 只算调度，实际网络请求经 adapter.post 回到此处）。
  function postFile(
    file: BaseFileItem,
    hooks: {
      onProgress: (e: { loaded: number; total: number }) => void;
      onError: (e?: unknown) => void;
      onSuccess: (body: unknown, e?: unknown) => void;
    },
  ): void {
    const fileInstance = file.fileInstance;
    if (!fileInstance) return;
    if (customRequest) {
      const resolvedData = (typeof data === 'function' ? data(fileInstance) : data) ?? {};
      void customRequest({
        fileName: fieldNameFor(fileInstance),
        data: resolvedData,
        file: file as unknown as UploadFileItem,
        fileInstance,
        onProgress: (e) => {
          if (e) hooks.onProgress({ loaded: e.loaded, total: e.total });
        },
        onError: (userXhr, e) => {
          const err: XhrError = Object.assign(new Error('Upload failed'), {
            status: userXhr?.status ?? 0,
            method: 'POST',
            url: action ?? '',
          });
          hooks.onError(err);
        },
        onSuccess: (response) => hooks.onSuccess(response),
        withCredentials,
        action: action ?? '',
      });
      return;
    }
    if (!action) return;

    const xhr = new XMLHttpRequest();
    xhrMap.set(file.uid, xhr);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) hooks.onProgress({ loaded: e.loaded, total: e.total });
    };
    xhr.onload = () => {
      xhrMap.delete(file.uid);
      announcedBucket.delete(file.uid);
      if (xhr.status >= 200 && xhr.status < 300) {
        let response: unknown = xhr.responseText;
        try {
          response = JSON.parse(xhr.responseText);
        } catch {
          response = xhr.responseText;
        }
        hooks.onSuccess(response);
      } else {
        const err: XhrError = Object.assign(new Error('Upload failed'), {
          status: xhr.status,
          method: 'POST',
          url: action,
        });
        hooks.onError(err);
      }
    };
    xhr.onerror = () => {
      xhrMap.delete(file.uid);
      announcedBucket.delete(file.uid);
      const err: XhrError = Object.assign(new Error('Upload failed'), { status: xhr.status, method: 'POST', url: action });
      hooks.onError(err);
    };
    xhr.onabort = () => {
      xhrMap.delete(file.uid);
      announcedBucket.delete(file.uid);
    };
    xhr.ontimeout = () => {
      xhrMap.delete(file.uid);
      announcedBucket.delete(file.uid);
      const err: XhrError = Object.assign(new Error(loc().t('Upload.timeoutError') ?? 'Upload timed out'), {
        status: xhr.status,
        method: 'POST',
        url: action,
      });
      hooks.onError(err);
    };

    const form = new FormData();
    form.append(fieldNameFor(fileInstance), fileInstance, file.name);
    const resolvedData = typeof data === 'function' ? data(fileInstance) : data;
    if (resolvedData) {
      for (const [k, v] of Object.entries(resolvedData)) form.append(k, v);
    }
    xhr.open('POST', action);
    if (timeout > 0) xhr.timeout = timeout;
    if (withCredentials) xhr.withCredentials = true;
    const resolvedHeaders = typeof headers === 'function' ? headers(fileInstance) : headers;
    if (resolvedHeaders) {
      for (const [k, v] of Object.entries(resolvedHeaders)) xhr.setRequestHeader(k, v);
    }
    xhr.send(form);
  }

  // ——— 文件选择入口：crop 拦截在 core.handleChange 之前（对齐 Semi handleCropFiles 在
  // foundation.handleChange 之前拦截），非裁切文件/裁切完成后交给 core 状态机。———
  const isImageFile = (f: File) => f.type.startsWith('image/');

  function dispatchSelected(files: File[]): void {
    if (disabled) return;
    if (crop) {
      void runCropPipeline(files);
      return;
    }
    core.handleChange(files);
  }

  function handleInputChange(e: Event & { currentTarget: HTMLInputElement }) {
    const fl = e.currentTarget.files;
    if (fl) dispatchSelected(Array.from(fl));
    e.currentTarget.value = '';
  }

  // 命令式插入（对齐 Semi insert）：crop 同样先拦截。
  export function insert(files: File[], index?: number) {
    if (disabled) return;
    if (crop) {
      void runCropPipeline(files, index);
      return;
    }
    core.insertFileToList(files, index);
  }

  export function upload() {
    core.manualUpload();
  }

  export function openFileDialog() {
    openPicker();
  }

  function openPicker() {
    if (disabled) return;
    onOpenFileDialog?.();
    inputEl?.click();
  }

  function removeByUid(uid: string) {
    if (disabled) return;
    const item = toItems(current).find((it) => it.uid === uid);
    if (!item) return;
    const xhr = xhrMap.get(uid);
    if (xhr) {
      xhr.abort();
      xhrMap.delete(uid);
    }
    announcedBucket.delete(uid);
    core.handleRemove(item);
  }

  /** 命令式移除指定文件项（对齐 Semi ref.remove，入参为完整文件项对象）。 */
  export function remove(fileItem: UploadFileItem) {
    removeByUid(fileItem.uid);
  }

  function retryItem(item: UploadFileItem) {
    core.retryItem(item as unknown as BaseFileItem);
  }

  function clearAll() {
    if (disabled) return;
    for (const xhr of xhrMap.values()) xhr.abort();
    xhrMap.clear();
    announcedBucket.clear();
    core.handleClear();
  }

  /** 命令式清空文件列表（对齐 Semi ref.clear），走 beforeClear 钩子。 */
  export function clear() {
    clearAll();
  }

  // ——— showReplace：替换已上传文件 ———
  let replaceInputEl = $state<HTMLInputElement | null>(null);
  let replaceTargetUid: string | null = null;

  function openReplace(uid: string) {
    if (disabled) return;
    replaceTargetUid = uid;
    replaceIdx = toItems(current).findIndex((it) => it.uid === uid);
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
    if (crop && isImageFile(file)) {
      void runReplacePipeline(file);
      return;
    }
    core.handleReplaceChange([file]);
  }

  function handleDragEnter(e: DragEvent) {
    const result = core.handleDragEnter({
      currentTarget: e.currentTarget!,
      preventDefault: () => e.preventDefault(),
      stopPropagation: () => e.stopPropagation(),
    });
    dragOver = result === 'legal';
  }

  function handleDragLeave(e: DragEvent) {
    const shouldClose = core.handleDragLeave({
      target: e.target!,
      preventDefault: () => e.preventDefault(),
      stopPropagation: () => e.stopPropagation(),
    });
    if (shouldClose) dragOver = false;
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    dragOver = false;
    if (disabled) return;
    const dt = e.dataTransfer;
    if (dt?.files && dt.files.length > 0) {
      const files = Array.from(dt.files);
      onDrop?.(e, files, current);
      dispatchSelected(files);
    }
  }

  function handleDragKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openPicker();
    }
  }

  const clearText = $derived(loc().t('Upload.clear'));
  const titleSnippet = $derived(
    typeof fileListTitle === 'function'
      ? (fileListTitle as Snippet<[{ fileList: UploadFileItem[]; onClear: () => void; clearText: string }]>)
      : undefined,
  );
  const titleText = $derived(typeof fileListTitle === 'string' ? fileListTitle : undefined);

  // itemStyle → 字符串。
  const itemStyleStr = $derived.by<string | undefined>(() => {
    if (itemStyle === undefined) return undefined;
    if (typeof itemStyle === 'string') return itemStyle;
    const parts = Object.entries(itemStyle).map(
      ([k, v]) => `${k}: ${typeof v === 'number' ? `${v}px` : v}`,
    );
    return parts.length > 0 ? parts.join('; ') : undefined;
  });

  // 卡片 style：picWidth/picHeight（number→px）+ itemStyle。
  const cardStyleStr = $derived.by<string | undefined>(() => {
    const parts: string[] = [];
    if (picHeight !== undefined) parts.push(`height: ${typeof picHeight === 'number' ? `${picHeight}px` : picHeight}`);
    if (picWidth !== undefined) parts.push(`width: ${typeof picWidth === 'number' ? `${picWidth}px` : picWidth}`);
    if (itemStyleStr) parts.push(itemStyleStr);
    return parts.length > 0 ? parts.join('; ') : undefined;
  });

  const addTileStyle = $derived.by<string | undefined>(() => {
    const parts: string[] = [];
    if (picHeight !== undefined) parts.push(`height: ${typeof picHeight === 'number' ? `${picHeight}px` : picHeight}`);
    if (picWidth !== undefined) parts.push(`width: ${typeof picWidth === 'number' ? `${picWidth}px` : picWidth}`);
    return parts.length > 0 ? parts.join('; ') : undefined;
  });

  // 图片墙添加瓦片是否显示（对齐 Semi showAddTriggerInList）。
  const showAddTrigger = $derived(limit ? limit > current.length : true);
  // fileListTitle===false 时不渲染标题区（对齐 Semi fileListTitle 的 ReactNode|函数 二态设计：
  // false 属于本库扩展的"显式隐藏"语义，无 Semi 源头，但既然声明了该分支就要让它真生效）。
  const showListTitle = $derived(fileListTitle !== false && limit !== 1 && current.length > 0);

  // ——— 裁剪流程 ———
  const cropConfig = $derived<UploadCropProps>(
    crop === true ? {} : crop && typeof crop === 'object' ? crop : {},
  );

  let cropOpen = $state(false);
  let cropSrc = $state<string | undefined>(undefined);
  let cropperRef = $state<{ getCropperCanvas: () => HTMLCanvasElement } | null>(null);
  let cropConfirming = $state(false);
  let cropCurrentFile: File | null = null;
  let cropResolve: ((file: File | null) => void) | null = null;

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

  async function runCropPipeline(files: File[], insertIndex?: number): Promise<void> {
    const out: File[] = [];
    for (const file of files) {
      if (!mounted) return;
      if (!isImageFile(file)) {
        out.push(file);
        continue;
      }
      if (beforeCrop) {
        let skip = false;
        try {
          skip = (await beforeCrop(file, files)) === false;
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
        if (cropped) out.push(cropped);
      } catch (err) {
        onCropError?.(err);
        out.push(file);
      }
    }
    if (!mounted) return;
    if (out.length > 0) core.insertFileToList(out, insertIndex);
  }

  async function runReplacePipeline(file: File): Promise<void> {
    let out: File | null = file;
    let skip = false;
    if (beforeCrop) {
      try {
        skip = (await beforeCrop(file, [file])) === false;
      } catch {
        skip = false;
      }
      if (!mounted) return;
    }
    if (!skip) {
      try {
        out = await cropOne(file);
      } catch (err) {
        onCropError?.(err);
        out = file;
      }
    }
    if (!mounted || !out) return;
    core.handleReplaceChange([out]);
  }

  function cropOne(file: File): Promise<File | null> {
    return new Promise<File | null>((resolve) => {
      cropCurrentFile = file;
      cropResolve = resolve;
      cropSrc = URL.createObjectURL(file);
      cropOpen = true;
    });
  }

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
          const cropped = new File([blob], original.name, { type, lastModified: Date.now() });
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

  // 组装单项传给 FileCard 的公共 props。url/style 仅在有值时带上（exactOptionalPropertyTypes）。
  function cardProps(item: UploadFileItem, index: number, url: string | undefined, style: string | undefined) {
    return {
      item,
      index,
      listType,
      disabled,
      showRetry,
      showReplace,
      showPicInfo,
      preview: itemPreviewEnabled(item),
      showTooltip,
      ...(url !== undefined ? { url } : {}),
      ...(style !== undefined ? { style } : {}),
      ...(picWidth !== undefined ? { picWidth } : {}),
      ...(picHeight !== undefined ? { picHeight } : {}),
      onRemove: () => removeByUid(item.uid),
      onRetry: () => retryItem(item),
      onReplace: () => openReplace(item.uid),
      ...(onPreviewClick ? { onPreviewClick: () => onPreviewClick(item) } : {}),
    };
  }

  function renderProps(item: UploadFileItem, index: number): RenderFileItemProps {
    return {
      ...item,
      index,
      listType,
      disabled,
      showRetry,
      showReplace,
      showPicInfo,
      onRemove: () => removeByUid(item.uid),
      onRetry: () => retryItem(item),
      onReplace: () => openReplace(item.uid),
      ...(onPreviewClick ? { onPreviewClick: () => onPreviewClick(item) } : {}),
    };
  }
</script>

<div
  class={['cd-upload', isPicture && 'cd-upload-picture', disabled && 'cd-upload-disabled', validateStatus === 'default' && 'cd-upload-default', validateStatus === 'error' && 'cd-upload-error', validateStatus === 'warning' && 'cd-upload-warning', validateStatus === 'success' && 'cd-upload-success', className]
    .filter(Boolean)
    .join(' ')}
  style={styleProp}
  {...{ 'x-prompt-pos': promptPosition }}
>
  <input
    bind:this={inputEl}
    class="cd-upload-hidden-input"
    type="file"
    {accept}
    {multiple}
    {disabled}
    tabindex="-1"
    autocomplete="off"
    aria-hidden="true"
    onchange={handleInputChange}
  />
  <input
    bind:this={replaceInputEl}
    class="cd-upload-hidden-input-replace"
    type="file"
    {accept}
    {disabled}
    tabindex="-1"
    autocomplete="off"
    aria-hidden="true"
    onchange={handleReplaceChange}
  />

  <!-- ============ 添加区（对齐 Semi renderAddContent / renderDragArea） ============ -->
  {#snippet dragArea()}
    <div
      class={['cd-upload-drag-area', dragOver && 'cd-upload-drag-area-legal', children && 'cd-upload-drag-area-custom']
        .filter(Boolean)
        .join(' ')}
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
        <div class="cd-upload-drag-area-icon">
          {#if dragIcon}{@render dragIcon()}{:else}<IconUpload size="extra-large" />{/if}
        </div>
        <div class="cd-upload-drag-area-text">
          <div class="cd-upload-drag-area-main-text">
            {#if dragMainText}
              {#if typeof dragMainText === 'string'}{dragMainText}{:else}{@render dragMainText()}{/if}
            {:else}{loc().t('Upload.mainText')}{/if}
          </div>
          {#if dragSubText}
            <div class="cd-upload-drag-area-sub-text">
              {#if typeof dragSubText === 'string'}{dragSubText}{:else}{@render dragSubText()}{/if}
            </div>
          {/if}
          <div class="cd-upload-drag-area-tips">
            {#if dragOver}
              <span class="cd-upload-drag-area-tips-legal">{loc().t('Upload.legalTips')}</span>
            {/if}
          </div>
        </div>
      {/if}
    </div>
  {/snippet}

  {#snippet addContent()}
    {#if draggable}
      {@render dragArea()}
    {:else}
      <div
        role="button"
        tabindex="0"
        aria-disabled={disabled || undefined}
        class="cd-upload-add"
        onclick={openPicker}
        onkeydown={handleDragKeydown}
      >
        {#if children}
          {@render children()}
        {:else}
          {loc().t('Upload.trigger')}
        {/if}
      </div>
    {/if}
  {/snippet}

  <!-- picture 添加瓦片（对齐 Semi picture renderFileListPic 的 addContent）。 -->
  {#snippet pictureAddContent()}
    <div
      role="button"
      tabindex="0"
      class={['cd-upload-add', 'cd-upload-picture-add', disabled && 'cd-upload-picture-add-disabled', draggable && dragOver && 'cd-upload-drag-area-legal']
        .filter(Boolean)
        .join(' ')}
      style={addTileStyle}
      onclick={openPicker}
      onkeydown={handleDragKeydown}
      ondragover={draggable ? (e) => e.preventDefault() : undefined}
      ondragenter={draggable ? handleDragEnter : undefined}
      ondragleave={draggable ? handleDragLeave : undefined}
      ondrop={draggable ? handleDrop : undefined}
    >
      {@render children?.()}
    </div>
  {/snippet}

  <!-- 非 picture：添加区在文件列表前渲染（对齐 Semi render() 顺序）。 -->
  {#if !isPicture}
    {@render addContent()}
  {/if}

  {#if prompt}
    <div class="cd-upload-prompt">
      {#if typeof prompt === 'string'}{prompt}{:else}{@render prompt()}{/if}
    </div>
  {/if}

  {#if validateMessage && current.length === 0}
    <div class="cd-upload-validate-message">{validateMessage}</div>
  {/if}

  <!-- ============ 文件列表（对齐 Semi renderFileList） ============ -->
  {#if listType === 'list' && showUploadList && current.length > 0}
    <div class="cd-upload-file-list">
      {#if showListTitle}
        <div class="cd-upload-file-list-title">
          {#if titleSnippet}
            {@render titleSnippet({ fileList: current, onClear: clearAll, clearText })}
          {:else}
            <span class="cd-upload-file-list-title-choosen">{titleText ?? loc().t('Upload.selectedFiles')}</span>
            {#if showClear && !disabled}
              <span role="button" tabindex="0" class="cd-upload-file-list-title-clear" onclick={clearAll} onkeydown={null}>{clearText}</span>
            {/if}
          {/if}
        </div>
      {/if}
      <div class="cd-upload-file-list-main" role="list" aria-label="file list">
        {#each current as item, index (item.uid)}
          {#if renderFileItem}
            {@render renderFileItem(renderProps(item, index))}
          {:else}
            <FileCard
              {...cardProps(item, index, itemThumbUrl(item), itemStyleStr)}
              {...(previewFile ? { previewFile } : {})}
              {...(renderFileOperation ? { renderFileOperation } : {})}
            />
          {/if}
        {/each}
      </div>
    </div>
  {/if}

  {#if isPicture && ((showUploadList && current.length > 0) || (!current.length && showAddTrigger))}
    {#if !showUploadList || !current.length}
      <!-- 空列表：仅渲染添加瓦片（对齐 Semi renderFileListPic 空态返回 addContent）。 -->
      {#if showAddTrigger}
        {@render pictureAddContent()}
      {/if}
    {:else}
      <div class="cd-upload-file-list cd-upload-picture-file-list">
        <div class="cd-upload-file-list-main" role="list" aria-label="picture list">
          {#if showAddTrigger && hotSpotLocation === 'start'}
            {@render pictureAddContent()}
          {/if}
          {#each current as item, index (item.uid)}
            {#if renderFileItem}
              {@render renderFileItem(renderProps(item, index))}
            {:else}
              <FileCard
                {...cardProps(item, index, previewUrl(item), cardStyleStr)}
                {...(renderThumbnail ? { renderThumbnail } : {})}
                {...(previewFile ? { previewFile } : {})}
                {...(renderPicInfo ? { renderPicInfo } : {})}
                {...(renderPicPreviewIcon ? { renderPicPreviewIcon } : {})}
                {...(renderPicClose ? { renderPicClose } : {})}
              />
            {/if}
          {/each}
          {#if showAddTrigger && hotSpotLocation !== 'start'}
            {@render pictureAddContent()}
          {/if}
        </div>
      </div>
    {/if}
  {/if}
</div>

{#if crop}
  <Modal
    width={600}
    height={500}
    visible={cropOpen}
    title={cropConfig.modalTitle ?? loc().t('Upload.cropTitle')}
    confirmLoading={cropConfirming}
    onOk={confirmCrop}
    onCancel={cancelCrop}
    onVisibleChange={(o) => {
      if (!o && cropOpen) cancelCrop();
    }}
    {...cropModalTextProps}
    bodyStyle="height: 400px;"
    {...cropModalProps}
  >
    {#if cropSrc}
      <div class="cd-upload-crop-body">
        <Cropper
          bind:this={cropperRef}
          src={cropSrc}
          shape={cropConfig.shape ?? 'rect'}
          style="width: 100%; height: 100%;"
          {...(cropConfig.fill !== undefined ? { fill: cropConfig.fill } : {})}
          {...cropperNumProps}
        />
      </div>
    {/if}
  </Modal>
{/if}

<style>
  /* ============ 根容器（对齐 Semi upload.scss .semi-upload） ============ */
  .cd-upload {
    display: flex;
    flex-wrap: wrap;
    color: var(--cd-color-upload-text);
  }
  .cd-upload-hidden-input,
  .cd-upload-hidden-input-replace {
    display: none;
  }
  .cd-upload-add {
    display: flex;
    align-items: center;
  }
  /* prompt-pos（对齐 Semi x-prompt-pos） */
  .cd-upload[x-prompt-pos='right'] .cd-upload-add,
  .cd-upload[x-prompt-pos='right'] .cd-upload-prompt {
    display: inline-flex;
  }
  .cd-upload[x-prompt-pos='bottom'] .cd-upload-add {
    display: flex;
  }
  .cd-upload[x-prompt-pos='bottom'] .cd-upload-prompt {
    display: flex;
    flex-basis: 100%;
  }
  .cd-upload[x-prompt-pos='bottom'] .cd-upload-file-list {
    flex-basis: 100%;
  }
  .cd-upload[x-prompt-pos='left'] .cd-upload-add,
  .cd-upload[x-prompt-pos='left'] .cd-upload-prompt {
    display: inline-flex;
  }
  .cd-upload[x-prompt-pos='left'] .cd-upload-prompt {
    order: -1;
  }
  .cd-upload[x-prompt-pos='left'] .cd-upload-file-list {
    order: 2;
  }
  .cd-upload-prompt {
    color: var(--cd-color-upload-assist-text);
  }

  /* ============ 文件列表（对齐 Semi file-list 段） ============ */
  .cd-upload-file-list {
    flex-basis: 100%;
    flex-shrink: 0;
    display: block;
    margin-block: var(--cd-spacing-tight);
  }
  .cd-upload-file-list-main {
    display: flex;
    flex-wrap: wrap;
    flex-shrink: 0;
    gap: var(--cd-spacing-upload-picture-file-card-gap);
    margin-block-end: var(--cd-spacing-upload-picture-file-card-marginbottom);
  }
  .cd-upload-file-list-title {
    font-size: var(--cd-font-size-small);
    line-height: var(--cd-line-height-small);
    color: var(--cd-color-upload-assist-text);
    margin-block-end: var(--cd-spacing-upload-title-marginbottom);
  }
  .cd-upload-file-list-title-choosen {
    margin-inline-end: var(--cd-spacing-upload-title-choosen-marginright);
  }
  .cd-upload-file-list-title-clear {
    cursor: pointer;
    color: var(--cd-color-upload-clear-text);
  }

  /* ============ 拖拽区（对齐 Semi drag-area 段） ============ */
  .cd-upload-drag-area {
    border-radius: var(--cd-radius-upload-drag-area);
    border: var(--cd-width-upload-drag-area-border) dashed var(--cd-color-upload-border);
    width: 100%;
    padding: var(--cd-spacing-upload-drag-area-padding);
    background-color: var(--cd-color-upload-drag-area-bg);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    cursor: pointer;
    box-sizing: border-box;
  }
  .cd-upload-drag-area:hover {
    background-color: var(--cd-color-upload-drag-area-bg-hover);
    border-color: var(--cd-color-upload-drag-area-border-hover);
  }
  .cd-upload-drag-area:focus-visible {
    outline: none;
    box-shadow: var(--cd-focus-ring);
  }
  .cd-upload-drag-area-custom {
    border: none;
    padding: 0;
    background-color: inherit;
  }
  .cd-upload-drag-area-custom:hover {
    background-color: inherit;
  }
  .cd-upload-drag-area-legal {
    background-color: var(--cd-color-upload-drag-area-bg-hover);
    border-color: var(--cd-color-upload-drag-area-border-hover);
  }
  .cd-upload-drag-area-legal .cd-upload-drag-area-sub-text {
    display: none;
  }
  .cd-upload-drag-area-icon {
    color: var(--cd-color-upload-drag-area-icon);
  }
  .cd-upload-drag-area-text {
    text-align: center;
  }
  .cd-upload-drag-area-main-text {
    cursor: pointer;
    font-size: var(--cd-font-size-regular);
    line-height: var(--cd-line-height-regular);
    margin-block-end: var(--cd-spacing-upload-drag-area-main-text-marginbottom);
    color: var(--cd-color-upload-drag-area-main-text-default);
  }
  .cd-upload-drag-area:hover .cd-upload-drag-area-main-text {
    color: var(--cd-color-upload-drag-area-main-text-hover);
  }
  .cd-upload-drag-area:active .cd-upload-drag-area-main-text {
    color: var(--cd-color-upload-drag-area-main-text-active);
  }
  .cd-upload-drag-area-sub-text {
    cursor: pointer;
    font-size: var(--cd-font-size-small);
    line-height: var(--cd-line-height-small);
    color: var(--cd-color-upload-drag-area-sub-text-default);
  }
  .cd-upload-drag-area:hover .cd-upload-drag-area-sub-text {
    color: var(--cd-color-upload-drag-area-sub-text-hover);
  }
  .cd-upload-drag-area:active .cd-upload-drag-area-sub-text {
    color: var(--cd-color-upload-drag-area-sub-text-active);
  }
  .cd-upload-drag-area-tips {
    font-size: var(--cd-font-size-small);
    line-height: var(--cd-line-height-small);
    font-weight: var(--cd-font-upload-drag-area-tips-fontweight);
  }
  .cd-upload-drag-area-tips-legal {
    color: var(--cd-color-upload-drag-area-tips-text);
  }

  /* ============ picture 添加瓦片（对齐 Semi picture-add 段） ============ */
  .cd-upload-picture {
    display: flex;
  }
  .cd-upload-picture[x-prompt-pos='bottom'] {
    flex-direction: column;
  }
  .cd-upload-picture[x-prompt-pos='bottom'] .cd-upload-prompt,
  .cd-upload-picture[x-prompt-pos='right'] .cd-upload-prompt {
    order: 1;
  }
  .cd-upload-picture-add {
    background-color: var(--cd-color-upload-pic-add-bg);
    height: var(--cd-height-upload-file-pic-card);
    width: var(--cd-width-upload-file-pic-card);
    box-sizing: border-box;
    display: inline-flex;
    justify-content: center;
    align-items: center;
    border: var(--cd-width-upload-picture-add-border) dashed var(--cd-color-upload-border);
    color: var(--cd-color-upload-icon);
    border-radius: var(--cd-radius-upload-picture-add);
    cursor: pointer;
  }
  .cd-upload-picture-add:hover {
    background-color: var(--cd-color-upload-pic-add-bg-hover);
  }
  .cd-upload-picture-add:active {
    background-color: var(--cd-color-upload-pic-add-bg-active);
  }
  .cd-upload-picture-add:focus-visible {
    outline: none;
    box-shadow: var(--cd-focus-ring);
  }
  .cd-upload-picture-add-disabled {
    cursor: not-allowed;
  }
  .cd-upload-picture-add-disabled:hover,
  .cd-upload-picture-add-disabled:active {
    background-color: var(--cd-color-upload-pic-add-bg);
  }
  .cd-upload-picture-file-list {
    flex-basis: inherit;
    margin-block: 0;
  }

  /* ============ disabled（对齐 Semi） ============ */
  /* 注：validateStatus 的 error/warning/success/default class 仍挂载在根节点（对齐 Semi
     DOM class hook），但 Semi upload.scss 对这些 class 无任何样式规则——纯 hook，无视觉
     效果。本库此前曾自造边框变色样式，已删除对齐 Semi（无源头样式不予保留）。 */
  .cd-upload-disabled {
    cursor: not-allowed;
  }
  .cd-upload-disabled .cd-upload-drag-area {
    border: none;
    cursor: not-allowed;
  }
  .cd-upload-disabled .cd-upload-drag-area:hover {
    background-color: var(--cd-color-upload-drag-area-bg);
  }
  .cd-upload-disabled .cd-upload-drag-area-main-text,
  .cd-upload-disabled .cd-upload-drag-area-sub-text,
  .cd-upload-disabled .cd-upload-drag-area-icon {
    cursor: not-allowed;
    color: var(--cd-color-upload-drag-area-disabled-text);
  }

  .cd-upload-validate-message {
    flex-basis: 100%;
    flex-shrink: 0;
    display: block;
    color: var(--cd-color-upload-file-card-fail-info-text);
  }
  .cd-upload-crop-body {
    inline-size: 100%;
    block-size: 100%;
  }

  /* —— RTL（对齐 Semi upload/rtl.scss 的 direction 覆盖作用域）——
     本库 RTL 触发机制是 global cd-rtl class（非 dir 属性，ConfigProvider 只挂 class）。
     本组件正向已全用逻辑属性（margin-inline 系/inset-inline 系），故镜像靠下面这条
     direction 覆盖触发浏览器原生逻辑属性重算，无需逐条手写。 */
  :global(.cd-rtl) .cd-upload {
    direction: rtl;
  }
</style>
