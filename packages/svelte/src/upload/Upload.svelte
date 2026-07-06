<!--
  Upload — see specs/components/input/Upload.spec.md
  Basic subset: file selection (click + drag) + file list (name/size/status/remove).
  Controlled / uncontrolled `value`. 真实上传：有 action 且无 customRequest 时，
  选文件后自动 XHR 上传（uploading→进度→success/error），customRequest 优先；
  XHR 句柄存 Map，remove/卸载时 abort。uploading 时渲染 Progress（line）。
  listType=image/picture-card：缩略图预览（item.url 优先，否则 file → objectURL，移除/卸载 revoke）。
  concurrency 并发上限（0=不限，超出排队、完成补位，core createUploadQueue 调度）；
  beforeUpload 异步校验/转换（false/reject 跳过该文件，返回 File 替换，true 正常上传）。
  directory：input 命令式加 webkitdirectory，可递归选择整个目录（保留 relativePath）。
  minSize/maxSize：core validateFileSize 纯函数校验（单位 KB），超限标 error + i18n 提示。
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
  import type { CropperShape } from '../cropper/index.js';
  import type { UploadFileItem } from './types.js';

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
     * 注意：区别于每个文件项的 file.status（ready/uploading/error 上传进度态）。
     */
    status?: 'default' | 'warning' | 'error';
    listType?: 'text' | 'image' | 'picture-card' | 'none';
    drag?: boolean;
    /** 上传地址；提供且无 customRequest 时选文件后自动 XHR 上传 */
    action?: string;
    /** 表单字段名，默认 'file' */
    uploadName?: string;
    /** 额外请求头 */
    headers?: Record<string, string>;
    /** 随文件一起提交的额外字段 */
    uploadData?: Record<string, string>;
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
    children?: Snippet;
    /** 上传失败是否显示重试按钮。默认 true */
    showRetry?: boolean;
    /** 是否允许替换已有文件（单文件模式下显示"替换"而不是"添加"）。默认 false */
    showReplace?: boolean;
    /** 是否显示批量清除按钮。默认 false */
    showClear?: boolean;
    /** 清除按钮点击回调 */
    onClear?: () => void;
    /** 文件列表标题文字；false 则不渲染。默认 undefined（不渲染） */
    fileListTitle?: string | false;
    /** 文件名超长是否展示 Tooltip（简单实现：title 属性）。true=展示 title；false=不展示。默认 true */
    showTooltip?: boolean;
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
    renderFileItem?: Snippet<[{ fileItem: UploadFileItem; remove: () => void; retry: () => void; preview: () => void }]>;
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
    children,
    showRetry = true,
    showReplace = false,
    showClear = false,
    onClear,
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
    if (item.url) return item.url;
    if (!item.file) return undefined;
    let u = objectUrls.get(item.uid);
    if (u === undefined) {
      u = URL.createObjectURL(item.file);
      objectUrls.set(item.uid, u);
    }
    return u;
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

  // directory 是非标准 input 属性（webkitdirectory），Svelte 模板不直接支持，
  // 故命令式 toggle（红线 #3）。directory 变化时同步增删。
  $effect(() => {
    if (!inputEl) return;
    inputEl.toggleAttribute('webkitdirectory', directory);
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
        }
      };
      xhr.onload = () => {
        xhrMap.delete(item.uid);
        announcedBucket.delete(item.uid);
        if (isUploadOk(xhr.status)) {
          patchItem(item.uid, { status: 'success', percent: 100 });
          // 完成必播（polite，不抢断）。
          announcer.announce(loc().t('Upload.announceSuccess', { name: item.name }));
          onSuccess?.(xhr.responseText, item);
        } else {
          patchItem(item.uid, { status: 'error' });
          // 失败必播（assertive，立即打断）。
          announcer.announce(loc().t('Upload.announceError', { name: item.name }), 'assertive');
          onError?.(item);
        }
        done();
      };
      xhr.onerror = () => {
        xhrMap.delete(item.uid);
        announcedBucket.delete(item.uid);
        patchItem(item.uid, { status: 'error' });
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

      const form = new FormData();
      form.append(uploadName, file, item.name);
      if (uploadData) {
        for (const [k, v] of Object.entries(uploadData)) form.append(k, v);
      }
      xhr.open('POST', action);
      if (withCredentials) xhr.withCredentials = true;
      if (headers) {
        for (const [k, v] of Object.entries(headers)) xhr.setRequestHeader(k, v);
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
      status: sizeError ? 'error' : 'ready',
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

  function addFilesInternal(fileList: FileList | File[]) {
    if (disabled) return;
    const allFiles = Array.from(fileList);
    if (allFiles.length === 0) return;

    // accept 校验
    const { accepted: afterAccept, rejected } = filterByAccept(allFiles);
    if (rejected.length > 0) onAcceptInvalid?.(rejected);
    if (afterAccept.length === 0) return;

    let accepted = afterAccept;
    if (limit !== undefined) {
      const room = limit - current.length;
      if (room <= 0) {
        onExceed?.(accepted);
        return;
      }
      if (accepted.length > room) {
        onExceed?.(accepted.slice(room));
        accepted = accepted.slice(0, room);
      }
    }

    const newItems = accepted.map(buildItem);
    commit([...current, ...newItems]);

    // onSizeError 回调：大小校验失败项通知外部
    for (const item of newItems) {
      if (item.status === 'error' && item.file) {
        const result = validateFileSize(item.file.size, { minSize, maxSize });
        if (result) onSizeError?.(item, result);
      }
    }

    // beforeUpload 通过的项才进队列受 concurrency 调度。
    // customRequest 完全接管；否则有 action 时自动 XHR 上传。仅处理无尺寸错误的项。
    for (const item of newItems) {
      if (item.status === 'error' || !item.file) continue;
      dispatch(item, item.file, accepted);
    }
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
        // 跳过该文件：从列表移除（受控仅 onChange，不回写）。
        remove(item.uid);
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

    // 入队受 concurrency 调度：customRequest 返回 Promise 时队列会 await 其完成
    // 来释放槽位（同步返回则立即释放，由其自管生命周期）；否则由队列 await XHR。
    queue.add(() => {
      if (!mounted) return;
      if (!current.some((it) => it.uid === item.uid)) return;
      if (customRequest) {
        return customRequest({ ...item, file });
      }
      if (action) return uploadItem(item, file);
    });
  }

  function remove(uid: string) {
    if (disabled) return;
    const xhr = xhrMap.get(uid);
    if (xhr) {
      xhr.abort();
      xhrMap.delete(uid);
    }
    revokeUrl(uid);
    announcedBucket.delete(uid);
    commit(current.filter((item) => item.uid !== uid));
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
      return { ...rest, status: 'ready' };
    }));
    dispatch(item, item.file, [item.file]);
  }

  /** 清除所有文件：中止进行中的上传，释放 objectURL，清空列表。 */
  function clearAll() {
    if (disabled) return;
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

  function handleInputChange(e: Event & { currentTarget: HTMLInputElement }) {
    const fl = e.currentTarget.files;
    if (fl) addFiles(fl);
    // Reset so selecting the same file again re-fires change.
    e.currentTarget.value = '';
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
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

  {#snippet triggerArea()}
    <div
      class="cd-upload__trigger-wrap"
      class:cd-upload__trigger-wrap--row={promptRow}
      class:cd-upload__trigger-wrap--row-reverse={promptPosition === 'left'}
    >
      {#if drag}
        <div
          class="cd-upload__dragger"
          role="button"
          tabindex={disabled ? -1 : 0}
          aria-disabled={disabled || undefined}
          ondragover={(e) => e.preventDefault()}
          ondrop={handleDrop}
          onclick={openPicker}
          onkeydown={handleDragKeydown}
        >
          {#if children}
            {@render children()}
          {:else}
            {#if dragIcon}<span class="cd-upload__dragger-icon">{@render dragIcon()}</span>{/if}
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
          {/if}
        </div>
      {:else}
        <button type="button" class="cd-upload__trigger" {disabled} onclick={openPicker}>
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
    >清除全部</button>
  {/if}

  {#if listType === 'text' && current.length > 0}
    {#if fileListTitle !== false && fileListTitle}
      <div class="cd-upload__list-title">{fileListTitle}</div>
    {/if}
    <ul class="cd-upload__list">
      {#each current as item (item.uid)}
        {#if renderFileItem}
          <li class="cd-upload__item cd-upload__item--custom">
            {@render renderFileItem({
              fileItem: item,
              remove: () => remove(item.uid),
              retry: () => retryItem(item),
              preview: () => onPreviewClick?.(item),
            })}
          </li>
        {:else}
        <li class="cd-upload__item" class:cd-upload__item--error={item.status === 'error'}>
          <div class="cd-upload__item-main">
            <span
              class="cd-upload__item-name"
              title={showTooltip !== false ? item.name : undefined}
            >{item.name}</span>
            <span class="cd-upload__item-size">{formatSize(item.size)}</span>
            {#if item.status !== 'uploading'}
              <span class="cd-upload__item-status">{item.error ?? item.status}</span>
            {/if}
            {#if item.status === 'error' && showRetry !== false}
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
          </div>
          {#if item.status === 'uploading'}
            <Progress
              percent={item.percent ?? 0}
              size="small"
              ariaLabel={loc().t('Upload.uploadingProgress', { name: item.name })}
            />
          {/if}
        </li>
        {/if}
      {/each}
    </ul>
  {/if}

  {#if isImageList && current.length > 0}
    <ul
      class="cd-upload__grid"
      class:cd-upload__grid--card={listType === 'picture-card'}
    >
      {#each current as item (item.uid)}
        {@const url = previewUrl(item)}
        <li
          class="cd-upload__card"
          class:cd-upload__card--error={item.status === 'error'}
          class:cd-upload__card--uploading={item.status === 'uploading'}
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
          {#if item.status === 'error'}
            <!-- 失败状态角标（对齐 Semi picture-file-card-icon-error）。 -->
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
            <button
              type="button"
              class="cd-upload__card-remove"
              aria-label={loc().t('Upload.remove')}
              {disabled}
              onclick={() => remove(item.uid)}
            >
              &times;
            </button>
          </div>
          {#if item.status === 'error' && showRetry !== false && item.file}
            <!-- 失败重试按钮（hover 时可见，对齐 Semi picture-file-card-retry）。 -->
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
  /* 添加按钮 hover/active 背景（对齐 Semi picture-add:hover / :active）。 */
  .cd-upload__trigger:hover:not(:disabled) {
    background: var(--cd-color-upload-pic-add-bg-hover);
  }
  .cd-upload__trigger:active:not(:disabled) {
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
    border-color: var(--cd-upload-border-warning);
  }
  .cd-upload--error .cd-upload__dragger {
    border-color: var(--cd-upload-border-error);
  }
  .cd-upload--warning .cd-upload__trigger {
    border-color: var(--cd-upload-border-warning);
  }
  .cd-upload--error .cd-upload__trigger {
    border-color: var(--cd-upload-border-error);
  }
  .cd-upload--warning .cd-upload__card,
  .cd-upload--error .cd-upload__card {
    border-color: var(--cd-upload-border-warning);
  }
  .cd-upload--error .cd-upload__card {
    border-color: var(--cd-upload-border-error);
  }
  .cd-upload__list-title {
    font-size: var(--cd-font-size-small);
    color: var(--cd-color-upload-assist-text);
    font-weight: 500;
    margin-block-end: var(--cd-spacing-upload-title-marginbottom);
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
    flex-direction: column;
    gap: var(--cd-spacing-extra-tight);
    padding-block: var(--cd-spacing-extra-tight);
    padding-inline: var(--cd-spacing-tight);
    /* 默认卡片背景（对齐 Semi file-card bg，与 hover/fail 态成组）。 */
    background: var(--cd-color-upload-card-bg);
    border-radius: var(--cd-radius-upload-file-card);
    transition: background-color var(--cd-motion-duration-fast) var(--cd-motion-ease-standard);
  }
  .cd-upload__item-main {
    display: flex;
    align-items: center;
    gap: var(--cd-spacing-tight);
  }
  .cd-upload__item:hover {
    background: var(--cd-color-upload-card-bg-hover);
  }
  .cd-upload__item--error {
    color: var(--cd-upload-item-color-error);
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
    margin: 0;
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
  }
  /* previewFile 自定义缩略图容器：撑满卡片，内容居中。 */
  .cd-upload__thumb--custom {
    display: flex;
    align-items: center;
    justify-content: center;
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
    .cd-upload__item,
    .cd-upload__dragger {
      transition: none;
    }
  }
</style>
