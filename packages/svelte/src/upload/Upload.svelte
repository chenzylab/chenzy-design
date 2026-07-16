<!--
  Upload — 严格对齐 Semi Design（破坏性重写，无向后兼容）。
  受控 prop：fileList / defaultFileList（对齐 Semi）。文件卡片渲染拆到 FileCard.svelte
  （renderPic/renderFile 双分支）。class 命名走 Semi 连字符体系 cd-upload-*。
  真实上传：有 action 且无 customRequest 时选文件后自动 XHR 上传；customRequest 优先。
  listType=picture：照片墙缩略图网格；list：文本卡片列表；none：不渲染列表。
  crop：image/* 文件先进裁切弹窗（Modal + Cropper）。directory：input 加 webkitdirectory。
  minSize/maxSize：core validateFileSize 校验（KB）；beforeUpload 支持返回富对象控制上传。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import {
    useId,
    useLiveAnnouncer,
    computeUploadPercent,
    isUploadOk,
    validateFileSize,
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
    /** 表单字段名（对齐 Semi name），默认 'file'。 */
    name?: string;
    /** 同 name，避免 Form.Upload 中 props 冲突（对齐 Semi fileName）。优先于 name。 */
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
    customRequest?: (item: UploadFileItem) => void | Promise<void>;
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
    name = 'file',
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

  // 表单字段名：fileName 优先于 name（对齐 Semi 在 FormData 中 fileName || name）。
  const fieldName = $derived(fileName ?? name);

  const isControlled = $derived(fileList !== undefined);
  // 非受控初始值（仅取初始 defaultFileList，后续由内部状态管理）。
  function getInitial(): UploadFileItem[] {
    return [...defaultFileList];
  }
  let inner = $state<UploadFileItem[]>(getInitial());
  const current = $derived(isControlled ? (fileList ?? []) : inner);

  let inputEl: HTMLInputElement | null = null;

  let dragOver = $state(false);
  let dragEnterTarget: EventTarget | null = null;

  const xhrMap = new Map<string, XMLHttpRequest>();
  let mounted = true;

  const objectUrls = new Map<string, string>();
  const isPicture = $derived(listType === 'picture');

  function previewUrl(item: UploadFileItem): string | undefined {
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
  // list 文本卡片预览：仅图片项返回缩略图地址，否则 undefined → 占位。
  function itemThumbUrl(item: UploadFileItem): string | undefined {
    if (item.preview === false) return undefined;
    const isImage = item.file ? item.file.type.startsWith('image/') : Boolean(item.url);
    if (!isImage) return undefined;
    return previewUrl(item);
  }
  function itemPreviewEnabled(item: UploadFileItem): boolean {
    if (item.preview === false) return false;
    return item.file ? item.file.type.startsWith('image/') : Boolean(item.url);
  }
  function revokeUrl(uid: string) {
    const u = objectUrls.get(uid);
    if (u !== undefined) {
      URL.revokeObjectURL(u);
      objectUrls.delete(uid);
    }
  }

  function patchItem(uid: string, patch: Partial<UploadFileItem>) {
    commit(current.map((it) => (it.uid === uid ? { ...it, ...patch } : it)));
  }

  // afterUpload（对齐 Semi notifyAfterUpload）：成功后据返回值改该项或自动移除。
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
    if (result.validateMessage !== undefined) patch.validateMessage = result.validateMessage;
    if (result.name !== undefined) patch.name = result.name;
    if (result.url !== undefined) {
      revokeUrl(uid);
      patch.url = result.url;
    }
    if (Object.keys(patch).length > 0) patchItem(uid, patch);
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

  // 粘贴监听（addOnPasting）。
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
        onPastingError?.(error);
      }
    }
    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  });

  function announceProgress(item: UploadFileItem, percent: number) {
    const bucket = Math.floor(percent / 25);
    if (bucket <= 0 || bucket >= 4) return;
    if (announcedBucket.get(item.uid) === bucket) return;
    announcedBucket.set(item.uid, bucket);
    announcer.announce(loc().t('Upload.announceUploading', { name: item.name, percent }));
  }

  // XHR 上传单个文件项。
  function uploadItem(item: UploadFileItem, file: File): Promise<void> {
    return new Promise<void>((resolve) => {
      if (customRequest) {
        void customRequest({ ...item, file });
        resolve();
        return;
      }
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
          onProgress?.(percent, { ...item, percent }, current);
        }
      };
      xhr.onload = () => {
        xhrMap.delete(item.uid);
        announcedBucket.delete(item.uid);
        if (isUploadOk(xhr.status)) {
          let response: unknown = xhr.responseText;
          try {
            response = JSON.parse(xhr.responseText);
          } catch {
            response = xhr.responseText;
          }
          patchItem(item.uid, { status: 'success', percent: 100, response });
          applyAfterUpload(item.uid, xhr.responseText);
          announcer.announce(loc().t('Upload.announceSuccess', { name: item.name }));
          onSuccess?.(response, item, current);
        } else {
          patchItem(item.uid, { status: 'uploadFail' });
          announcer.announce(loc().t('Upload.announceError', { name: item.name }), 'assertive');
          onError?.(new Error('Upload failed'), item, current, xhr);
        }
        done();
      };
      xhr.onerror = (e) => {
        xhrMap.delete(item.uid);
        announcedBucket.delete(item.uid);
        patchItem(item.uid, { status: 'uploadFail', event: e as Event });
        announcer.announce(loc().t('Upload.announceError', { name: item.name }), 'assertive');
        onError?.(new Error('Upload failed'), item, current, xhr);
        done();
      };
      xhr.onabort = () => {
        xhrMap.delete(item.uid);
        announcedBucket.delete(item.uid);
        done();
      };
      xhr.ontimeout = () => {
        xhrMap.delete(item.uid);
        announcedBucket.delete(item.uid);
        patchItem(item.uid, { status: 'uploadFail', error: loc().t('Upload.timeoutError') });
        announcer.announce(loc().t('Upload.timeoutError', { name: item.name }), 'assertive');
        onError?.(new Error(loc().t('Upload.timeoutError') ?? 'Upload timed out'), item, current, xhr);
        done();
      };

      const form = new FormData();
      form.append(fieldName, file, item.name);
      const resolvedData = typeof data === 'function' ? data(file) : data;
      if (resolvedData) {
        for (const [k, v] of Object.entries(resolvedData)) form.append(k, v);
      }
      xhr.open('POST', action);
      if (timeout > 0) xhr.timeout = timeout;
      if (withCredentials) xhr.withCredentials = true;
      const resolvedHeaders = typeof headers === 'function' ? headers(file) : headers;
      if (resolvedHeaders) {
        for (const [k, v] of Object.entries(resolvedHeaders)) xhr.setRequestHeader(k, v);
      }
      xhr.send(form);
    });
  }

  function commit(next: UploadFileItem[], currentFile?: UploadFileItem) {
    if (!isControlled) inner = next;
    onChange?.({
      fileList: next,
      currentFile: currentFile ?? next[next.length - 1] ?? ({} as UploadFileItem),
    });
  }

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
    const sizeError = validateFileSize(file.size, { minSize, maxSize });
    const relativePath = (file as File & { webkitRelativePath?: string }).webkitRelativePath;
    const item: UploadFileItem = {
      uid: useId('cd-upload'),
      name: file.name,
      size: file.size,
      status: sizeError ? 'validateFail' : 'wait',
      file,
    };
    if (relativePath) item.relativePath = relativePath;
    if (sizeError) {
      const limitKB = sizeError === 'max' ? maxSize! : minSize!;
      item.error =
        validateMessage ??
        loc().t(sizeError === 'max' ? 'Upload.sizeError' : 'Upload.minSizeError', {
          size: formatKB(limitKB),
        });
    }
    return item;
  }

  function formatKB(kb: number): string {
    if (kb >= 1024) return `${(kb / 1024).toFixed(1)}MB`;
    return `${kb}KB`;
  }

  export function addFiles(fileListInput: FileList | File[]) {
    if (disabled) return;
    const allFiles = Array.from(fileListInput);
    if (allFiles.length === 0) return;
    if (crop) {
      void runCropPipeline(allFiles);
      return;
    }
    addFilesInternal(allFiles);
  }

  function filterSelected(files: File[], insertLen = 0): { accepted: File[]; replaceOne: boolean } {
    const { accepted: afterAccept, rejected } = filterByAccept(files);
    if (rejected.length > 0) onAcceptInvalid?.(rejected);
    if (afterAccept.length === 0) return { accepted: [], replaceOne: false };

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

  function dispatchNewItems(newItems: UploadFileItem[], accepted: File[]) {
    for (const item of newItems) {
      if (item.status === 'validateFail' && item.file) {
        const result = validateFileSize(item.file.size, { minSize, maxSize });
        if (result) onSizeError?.(item, current);
      }
    }
    for (const item of newItems) {
      if (item.status === 'validateFail' || !item.file) continue;
      void dispatch(item, item.file, accepted);
    }
  }

  function addFilesInternal(fileListInput: FileList | File[]) {
    if (disabled) return;
    const allFiles = Array.from(fileListInput);
    if (allFiles.length === 0) return;

    const { accepted, replaceOne } = filterSelected(allFiles);
    if (accepted.length === 0) return;

    onFileChange?.(accepted);

    const newItems = accepted.map(buildItem);
    if (replaceOne) {
      for (const it of current) removeInternalResources(it.uid);
      commit(newItems, newItems[0]);
    } else {
      commit([...current, ...newItems], newItems[0]);
    }

    dispatchNewItems(newItems, accepted);
  }

  // 命令式插入（对齐 Semi insert）。
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
      commit(newItems, newItems[0]);
    } else {
      const at = index === undefined ? current.length : Math.max(0, Math.min(index, current.length));
      const next = [...current];
      next.splice(at, 0, ...newItems);
      commit(next, newItems[0]);
    }

    dispatchNewItems(newItems, accepted);
  }

  const pendingFiles = new Map<string, File>();

  // beforeUpload 支持返回富对象（对齐 Semi BeforeUploadObjectResult）。
  async function dispatch(item: UploadFileItem, original: File, _fileListForHook: File[]) {
    let file = original;
    if (beforeUpload) {
      let result: boolean | BeforeUploadObjectResult;
      // 中间态 validating（对齐 Semi）。
      patchItem(item.uid, { status: 'validating' });
      try {
        result = await beforeUpload({ file: item, fileList: current });
      } catch (err) {
        // reject 支持传富对象（对齐 Semi）。
        if (err && typeof err === 'object') {
          result = err as BeforeUploadObjectResult;
          if (result.shouldUpload === undefined) result.shouldUpload = false;
        } else {
          result = false;
        }
      }
      if (!mounted) return;
      if (!current.some((it) => it.uid === item.uid)) return;

      if (result === false) {
        // 拒绝：标 validateFail（不移除，对齐 Semi 默认 shouldUpload=false 且无 autoRemove）。
        patchItem(item.uid, { status: 'validateFail' });
        return;
      }
      if (result !== true && typeof result === 'object') {
        const obj = result;
        if (obj.autoRemove) {
          removeInternal(item.uid);
          return;
        }
        const patch: Partial<UploadFileItem> = {};
        if (obj.status) patch.status = obj.status;
        if (obj.validateMessage !== undefined) patch.validateMessage = obj.validateMessage;
        if (obj.fileInstance) {
          file = obj.fileInstance;
          patch.name = file.name;
          patch.size = file.size;
          patch.file = file;
        }
        const shouldUpload = obj.shouldUpload !== false;
        if (!shouldUpload) {
          if (!patch.status) patch.status = 'validateFail';
          patchItem(item.uid, patch);
          return;
        }
        if (Object.keys(patch).length > 0) patchItem(item.uid, patch);
      }
    }
    if (!mounted) return;

    if (transformFile) {
      file = await transformFile(file);
      if (!mounted) return;
      patchItem(item.uid, { name: file.name, size: file.size, file });
    }

    if (uploadTrigger === 'custom') {
      patchItem(item.uid, { status: 'wait' });
      pendingFiles.set(item.uid, file);
      return;
    }

    void uploadItem(item, file);
  }

  export function upload() {
    if (disabled) return;
    for (const it of current) {
      if (it.status !== 'wait') continue;
      const file = pendingFiles.get(it.uid) ?? it.file;
      if (!file) continue;
      pendingFiles.delete(it.uid);
      void uploadItem(it, file);
    }
  }

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

  function removeInternal(uid: string) {
    removeInternalResources(uid);
    commit(current.filter((item) => item.uid !== uid));
  }

  async function remove(uid: string) {
    if (disabled) return;
    const item = current.find((it) => it.uid === uid);
    if (!item) return;
    if (beforeRemove) {
      let allow: boolean;
      try {
        allow = await beforeRemove(item, current);
      } catch {
        allow = false;
      }
      if (allow === false) return;
      if (!mounted) return;
      if (!current.some((it) => it.uid === uid)) return;
    }
    const nextList = current.filter((it) => it.uid !== uid);
    removeInternalResources(uid);
    commit(nextList, item);
    onRemove?.(item.file, nextList, item);
  }

  function retryItem(item: UploadFileItem) {
    onRetry?.(item);
    if (!item.file) return;
    commit(
      current.map((it) => {
        if (it.uid !== item.uid) return it;
        const { percent: _p, error: _e, ...rest } = it;
        return { ...rest, status: 'wait' };
      }),
    );
    void dispatch(item, item.file, [item.file]);
  }

  async function clearAll() {
    if (disabled) return;
    if (beforeClear) {
      let allow: boolean;
      try {
        allow = await beforeClear(current);
      } catch {
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

  export function openFileDialog() {
    openPicker();
  }

  function handleInputChange(e: Event & { currentTarget: HTMLInputElement }) {
    const fl = e.currentTarget.files;
    if (fl) addFiles(fl);
    e.currentTarget.value = '';
  }

  // ——— showReplace：替换已上传文件 ———
  let replaceInputEl = $state<HTMLInputElement | null>(null);
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
    if (crop && file.type.startsWith('image/')) {
      void runReplacePipeline(target, file);
      return;
    }
    doReplace(target, file);
  }

  function doReplace(target: string, file: File) {
    const { accepted, rejected } = filterByAccept([file]);
    if (rejected.length > 0) onAcceptInvalid?.(rejected);
    if (accepted.length === 0) return;
    const chosen = accepted[0]!;
    removeInternalResources(target);
    const built = buildItem(chosen);
    const replaced: UploadFileItem = { ...built, uid: target };
    commit(current.map((it) => (it.uid === target ? replaced : it)), replaced);
    onFileChange?.([chosen]);
    dispatchNewItems([replaced], [chosen]);
  }

  async function runReplacePipeline(target: string, file: File) {
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
    doReplace(target, out);
  }

  function handleDragEnter(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    dragEnterTarget = e.currentTarget;
    if (!disabled) dragOver = true;
  }

  function handleDragLeave(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (dragEnterTarget === e.target) dragOver = false;
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    dragOver = false;
    if (disabled) return;
    const dt = e.dataTransfer;
    if (dt?.files && dt.files.length > 0) {
      const files = Array.from(dt.files);
      onDrop?.(e, files, current);
      const { accepted } = filterByAccept(files);
      if (accepted.length > 0) addFiles(accepted);
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
  const showListTitle = $derived(limit !== 1 && current.length > 0);

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

  const isImageFile = (f: File) => f.type.startsWith('image/');

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

  async function runCropPipeline(files: File[]) {
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
    if (out.length > 0) addFilesInternal(out);
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
      onRemove: () => remove(item.uid),
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
      onRemove: () => remove(item.uid),
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
            {:else}{loc().t('Upload.draggerText')}{/if}
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
    visible={cropOpen}
    title={cropConfig.modalTitle ?? loc().t('Upload.cropTitle')}
    confirmLoading={cropConfirming}
    onOk={confirmCrop}
    onCancel={cancelCrop}
    onVisibleChange={(o) => {
      if (!o && cropOpen) cancelCrop();
    }}
    {...cropModalTextProps}
    {...cropModalProps}
  >
    {#if cropSrc}
      <div class="cd-upload-crop-body">
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

  /* list 卡片纵向堆叠（Semi file-list-main flex-wrap 下逐个换行）。 */
  .cd-upload-file-list:not(.cd-upload-picture-file-list) .cd-upload-file-list-main {
    flex-direction: column;
    gap: var(--cd-spacing-extra-tight);
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

  /* ============ 校验态 / disabled（对齐 Semi） ============ */
  .cd-upload-warning .cd-upload-drag-area,
  .cd-upload-warning .cd-upload-add,
  .cd-upload-warning .cd-upload-picture-add {
    border-color: var(--cd-color-warning);
  }
  .cd-upload-error .cd-upload-drag-area,
  .cd-upload-error .cd-upload-add,
  .cd-upload-error .cd-upload-picture-add {
    border-color: var(--cd-color-danger);
  }
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
  }
</style>
