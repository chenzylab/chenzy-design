/**
 * createUpload — framework-agnostic state machine for the Upload component.
 * Ported 逐行 from Semi semi-foundation/upload/foundation.ts (UploadFoundation).
 * See specs/components/input/Upload.spec.md §3.
 *
 * 纯状态机：文件项 CRUD、校验管线（accept/size/beforeUpload/transformFile）、
 * XHR 调度、拖拽/粘贴事件语义。所有 DOM I/O（XHR 本体、objectURL、剪贴板读取、
 * document 事件绑定）经 adapter 注入；本模块只算不碰 DOM。
 * state 由渲染层持有（Svelte runes），经 getState/setState 桥接，与 cropper.ts 同构。
 */

import { getFileSize, checkFileFormat, isImageFile, mapFileTree, type DirEntryLike } from './utils.js';
import {
  FILE_STATUS_SUCCESS,
  FILE_STATUS_UPLOAD_FAIL,
  FILE_STATUS_VALID_FAIL,
  FILE_STATUS_WAIT_UPLOAD,
  DRAG_AREA_DEFAULT,
  DRAG_AREA_LEGAL,
  TRIGGER_AUTO,
  PROGRESS_COEFFICIENT,
} from './constants.js';

export type FileItemStatus =
  | 'success'
  | 'uploadFail'
  | 'validateFail'
  | 'validating'
  | 'uploading'
  | 'wait';

/** A File carrying upload-machine bookkeeping fields (Semi CustomFile). */
export interface CustomFile extends File {
  uid?: string;
  _sizeInvalid?: boolean;
  status?: string;
}

/** One row in the managed file list (Semi BaseFileItem; `size` is Semi's formatted display string). */
export interface BaseFileItem {
  showReplace?: boolean;
  showRetry?: boolean;
  response?: unknown;
  event?: Event;
  status: FileItemStatus;
  name: string;
  size: string;
  uid: string;
  url?: string;
  fileInstance?: File;
  percent?: number;
  preview?: boolean;
  validateMessage?: unknown;
  relativePath?: string;
  [key: string]: unknown;
}

export interface BeforeUploadObjectResult {
  shouldUpload?: boolean;
  status?: string;
  autoRemove?: boolean;
  validateMessage?: unknown;
  fileInstance?: CustomFile;
}

export interface AfterUploadResult {
  autoRemove?: boolean;
  status?: string;
  validateMessage?: unknown;
  name?: string;
  url?: string;
}

export interface XhrError extends Error {
  status: number;
  method: string;
  url: string;
}

/** adapter：渲染层注入的 DOM/XHR I/O + 变更通知。core 只调、不持有 DOM 引用。 */
export interface UploadAdapter {
  notifyFileSelect: (files: CustomFile[]) => void;
  notifyError: (error: XhrError, fileInstance: CustomFile, fileList: BaseFileItem[], xhr?: XMLHttpRequest) => void;
  notifySuccess: (body: unknown, fileInstance: CustomFile, newFileList: BaseFileItem[]) => void;
  notifyProgress: (percent: number, fileInstance: CustomFile, newFileList: BaseFileItem[]) => void;
  notifyRemove: (file: File | undefined, newFileList: BaseFileItem[], fileItem: BaseFileItem) => void;
  notifySizeError: (file: CustomFile, fileList: BaseFileItem[]) => void;
  notifyExceed: (files: File[]) => void;
  notifyBeforeUpload: (props: {
    file: BaseFileItem;
    fileList: BaseFileItem[];
  }) => boolean | BeforeUploadObjectResult | Promise<boolean | BeforeUploadObjectResult>;
  notifyAfterUpload: (props: {
    response: unknown;
    file: BaseFileItem;
    fileList: BaseFileItem[];
  }) => AfterUploadResult | void;
  notifyBeforeRemove: (file: BaseFileItem, fileList: BaseFileItem[]) => boolean | Promise<boolean>;
  notifyBeforeClear: (fileList: BaseFileItem[]) => boolean | Promise<boolean>;
  notifyChange: (props: { currentFile?: BaseFileItem | undefined; fileList: BaseFileItem[] }) => void;
  notifyClear: () => void;
  notifyPreviewClick: (file: BaseFileItem) => void;
  notifyDrop: (e: unknown, files: File[], fileList: BaseFileItem[]) => void;
  notifyAcceptInvalid: (invalidFiles: File[]) => void;
  notifyPastingError: (error: unknown) => void;
  notifyRetry: (fileItem: BaseFileItem) => void;
  /** 创建/释放 objectURL；渲染层负责实际 DOM API 调用与簿记。 */
  createObjectUrl: (file: File, uid: string) => string;
  releaseObjectUrl: (uid: string) => void;
  releaseAllObjectUrls: () => void;
  /** 发起真实 XHR/customRequest；渲染层实现，回调对接 handle* 系列方法。 */
  post: (file: BaseFileItem, hooks: {
    onProgress: (e: { loaded: number; total: number }) => void;
    onError: (e?: unknown) => void;
    onSuccess: (body: unknown, e?: unknown) => void;
  }) => void;
}

/** core 需消费的 props（默认值语义对齐 Semi defaultProps）。 */
export interface UploadFoundationProps {
  disabled: boolean;
  accept?: string | undefined;
  limit?: number | undefined;
  maxSize?: number | undefined;
  minSize?: number | undefined;
  directory: boolean;
  uploadTrigger: 'auto' | 'custom';
  transformFile?: ((file: File) => File | Promise<File>) | undefined;
  beforeUpload?: boolean | undefined;
  afterUpload?: boolean | undefined;
  addOnPasting: boolean;
}

export interface UploadFoundationState {
  fileList: BaseFileItem[];
  /** picture/list 替换流程记录的目标 index（对齐 Semi state.replaceIdx）。 */
  replaceIdx: number;
}

const byteKB = 1024;

function getFileIndex(file: { uid?: string }, fileList: BaseFileItem[]): number {
  return fileList.findIndex((item) => item.uid === file.uid);
}

export function createUpload(options: {
  adapter: UploadAdapter;
  getProps: () => UploadFoundationProps;
  getState: () => UploadFoundationState;
  setState: (patch: Partial<UploadFoundationState>) => void;
}) {
  const { adapter, getProps, getState, setState } = options;

  let dragEnterTarget: EventTarget | null = null;

  function checkFileSize(file: File): boolean {
    const { maxSize, minSize } = getProps();
    const size = file.size;
    if (maxSize !== undefined && size > maxSize * byteKB) return true;
    if (minSize !== undefined && size < minSize * byteKB) return true;
    return false;
  }

  function buildFileItem(fileInstance: CustomFile, uploadTrigger: string): BaseFileItem {
    const sizeInvalid = fileInstance._sizeInvalid;
    const status = fileInstance.status;
    const item: BaseFileItem = {
      status: (status ?? (uploadTrigger === TRIGGER_AUTO ? 'uploading' : FILE_STATUS_WAIT_UPLOAD)) as FileItemStatus,
      name: fileInstance.name,
      size: getFileSize(fileInstance.size),
      uid: fileInstance.uid!,
      percent: 0,
      fileInstance,
      url: adapter.createObjectUrl(fileInstance, fileInstance.uid!),
    };
    if (sizeInvalid) {
      item.status = FILE_STATUS_VALID_FAIL;
      item._sizeInvalid = true;
    }
    if (isImageFile(fileInstance)) item.preview = true;
    const relativePath = (fileInstance as File & { webkitRelativePath?: string }).webkitRelativePath;
    if (relativePath) item.relativePath = relativePath;
    return item;
  }

  /** 1.选择 2.transform+uid 3.limit裁剪 4.size校验 5.auto即传（对齐 Semi handleChange 步骤注释）。 */
  function handleChange(currentFileList: FileList | File[]): void {
    const invalidFiles: File[] = [];
    const { limit, transformFile, accept } = getProps();
    const { fileList } = getState();

    let files: CustomFile[] = Array.from(currentFileList);
    if (accept !== undefined) {
      files = files.filter((item) => {
        const ok = checkFileFormat(accept, item);
        if (!ok) invalidFiles.push(item);
        return ok;
      });
      if (invalidFiles.length > 0) adapter.notifyAcceptInvalid(invalidFiles);
      if (files.length === 0) return;
    }

    files = files.map((file) => {
      if (transformFile) {
        const out = transformFile(file);
        if (out instanceof File) file = out as CustomFile;
      }
      if (!file.uid) file.uid = crypto.randomUUID();
      if (checkFileSize(file)) {
        file._sizeInvalid = true;
        file.status = FILE_STATUS_VALID_FAIL;
        adapter.notifySizeError(file, fileList);
      }
      return file;
    });

    const total = fileList.length + files.length;
    if (limit !== undefined && total > limit) {
      adapter.notifyExceed(files);
      if (limit === 1) {
        files = files.slice(-1);
        adapter.notifyFileSelect(files);
        replaceFileList(files);
        return;
      }
      const restNum = limit - fileList.length;
      files = files.slice(0, Math.max(0, restNum));
    }
    if (files.length === 0) return;

    adapter.notifyFileSelect(files);
    addFilesToList(files);
  }

  function replaceFileList(files: CustomFile[]): void {
    const { uploadTrigger } = getProps();
    const currentFiles = files.map((item) => buildFileItem(item, uploadTrigger));
    setState({ fileList: currentFiles });
    adapter.notifyChange({ fileList: currentFiles, currentFile: currentFiles[0] });
    if (uploadTrigger === TRIGGER_AUTO) startUpload(currentFiles);
  }

  function addFilesToList(files: CustomFile[]): void {
    const { fileList } = getState();
    const next = fileList.slice();
    const { uploadTrigger } = getProps();
    const currentFiles = files.map((item) => buildFileItem(item, uploadTrigger));
    let lastNew: BaseFileItem | undefined;
    for (const file of currentFiles) {
      const idx = getFileIndex(file, next);
      if (idx !== -1) {
        next[idx] = file;
      } else {
        next.push(file);
        lastNew = file;
      }
    }
    setState({ fileList: next });
    if (lastNew) adapter.notifyChange({ fileList: next, currentFile: lastNew });
    if (uploadTrigger === TRIGGER_AUTO) startUpload(currentFiles);
  }

  /** 命令式插入到指定位置（对齐 Semi insertFileToList）。index 缺省追加到末尾。 */
  function insertFileToList(files: File[], index?: number): void {
    const { limit, accept, uploadTrigger, transformFile } = getProps();
    const { fileList } = getState();

    const unAccept: File[] = [];
    let current: CustomFile[] = Array.from(files);
    if (accept !== undefined) {
      current = current.filter((item) => {
        const ok = checkFileFormat(accept, item);
        if (!ok) unAccept.push(item);
        return ok;
      });
      if (unAccept.length > 0) adapter.notifyAcceptInvalid(unAccept);
      if (current.length === 0) return;
    }
    current = current.map((file) => {
      if (!file.uid) file.uid = crypto.randomUUID();
      if (checkFileSize(file)) {
        file._sizeInvalid = true;
        file.status = FILE_STATUS_VALID_FAIL;
        adapter.notifySizeError(file, fileList);
      }
      if (transformFile) {
        const out = transformFile(file);
        if (out instanceof File) file = out as CustomFile;
      }
      return file;
    });

    const total = fileList.length + current.length;
    if (limit !== undefined && total > limit) {
      if (limit === 1) {
        current = current.slice(-1);
        adapter.notifyFileSelect(current);
        replaceFileList(current);
        return;
      }
      const restNum = limit - fileList.length;
      current = current.slice(0, Math.max(0, restNum));
      adapter.notifyExceed(current);
    }
    if (current.length === 0) return;

    const fileItems = current.map((file) => buildFileItem(file, uploadTrigger));
    const next = fileList.slice();
    if (index !== undefined) {
      next.splice(index, 0, ...fileItems);
    } else {
      next.push(...fileItems);
    }

    adapter.notifyFileSelect(current);
    setState({ fileList: next });
    adapter.notifyChange({ fileList: next, currentFile: undefined });
    if (uploadTrigger === TRIGGER_AUTO) startUpload(fileItems);
  }

  /** 单文件替换（对齐 Semi handleReplaceChange）；replaceIdx 由渲染层先行 setState 记录。 */
  function handleReplaceChange(currentFileList: FileList | File[]): void {
    if (currentFileList.length === 0) return;
    const { transformFile, uploadTrigger, accept } = getProps();
    const { replaceIdx, fileList } = getState();
    let newFile: CustomFile = Array.from(currentFileList).at(-1)!;
    if (accept !== undefined && !checkFileFormat(accept, newFile)) {
      adapter.notifyAcceptInvalid([newFile]);
      return;
    }
    if (transformFile) {
      const out = transformFile(newFile);
      if (out instanceof File) newFile = out as CustomFile;
    }
    if (!newFile.uid) newFile.uid = crypto.randomUUID();
    if (checkFileSize(newFile)) {
      newFile._sizeInvalid = true;
      newFile.status = FILE_STATUS_VALID_FAIL;
      adapter.notifySizeError(newFile, fileList);
    }
    adapter.notifyFileSelect([newFile]);
    const newItem = buildFileItem(newFile, uploadTrigger);
    const next = [...fileList];
    const old = next[replaceIdx];
    if (old?.uid) adapter.releaseObjectUrl(old.uid);
    next.splice(replaceIdx, 1, newItem);
    setState({ fileList: next });
    adapter.notifyChange({ currentFile: newItem, fileList: next });
    if (!newItem._sizeInvalid && uploadTrigger === TRIGGER_AUTO) upload(newItem);
  }

  function manualUpload(): void {
    const { fileList } = getState();
    startUpload(fileList.filter((item) => item.status === FILE_STATUS_WAIT_UPLOAD));
  }

  function startUpload(fileList: BaseFileItem[]): void {
    for (const file of fileList) {
      if (!file._sizeInvalid) upload(file);
    }
  }

  function upload(file: BaseFileItem): void {
    const { beforeUpload } = getProps();
    if (!beforeUpload) {
      post(file);
      return;
    }
    const { fileList } = getState();
    const result = adapter.notifyBeforeUpload({ file, fileList });
    if (result === true) {
      post(file);
    } else if (result === false) {
      handleBeforeUploadResult({ shouldUpload: false, status: FILE_STATUS_VALID_FAIL }, file);
    } else if (result && typeof (result as Promise<unknown>).then === 'function') {
      (result as Promise<boolean | BeforeUploadObjectResult>).then(
        (resolved) => {
          let next: Partial<BeforeUploadObjectResult> = { shouldUpload: true };
          if (resolved && typeof resolved === 'object') next = { ...next, ...resolved };
          handleBeforeUploadResult(next, file);
        },
        (rejected) => {
          let next: Partial<BeforeUploadObjectResult> = {
            shouldUpload: false,
            status: FILE_STATUS_VALID_FAIL,
          };
          if (rejected && typeof rejected === 'object') next = { ...next, ...rejected };
          handleBeforeUploadResult(next, file);
        },
      );
    } else if (typeof result === 'object') {
      handleBeforeUploadResult(result as BeforeUploadObjectResult, file);
    }
  }

  function handleBeforeUploadResult(result: Partial<BeforeUploadObjectResult>, file: BaseFileItem): void {
    const { shouldUpload, status, autoRemove, validateMessage, fileInstance } = result;
    let next = getState().fileList.slice();
    if (autoRemove) {
      adapter.releaseObjectUrl(file.uid);
      next = next.filter((item) => item.uid !== file.uid);
    } else {
      const idx = getFileIndex(file, next);
      if (idx < 0) return;
      if (status) next[idx]!.status = status as FileItemStatus;
      if (validateMessage) next[idx]!.validateMessage = validateMessage;
      if (fileInstance) {
        fileInstance.uid = file.uid;
        next[idx]!.fileInstance = fileInstance;
        next[idx]!.size = getFileSize(fileInstance.size);
        next[idx]!.name = fileInstance.name;
        adapter.releaseObjectUrl(file.uid);
        next[idx]!.url = adapter.createObjectUrl(fileInstance, file.uid);
      }
      next[idx]!.shouldUpload = shouldUpload;
    }
    setState({ fileList: next });
    adapter.notifyChange({ fileList: next, currentFile: file });
    if (shouldUpload) post(file);
  }

  function post(file: BaseFileItem): void {
    adapter.post(file, {
      onProgress: (e) => handleProgress(e, file),
      onError: () => handleError(file),
      onSuccess: (body) => handleSuccess(file, body),
    });
  }

  function handleProgress(e: { loaded: number; total: number }, file: BaseFileItem): void {
    const { fileList } = getState();
    const next = fileList.slice();
    let percent = 0;
    if (e.total > 0) {
      percent = Number(((e.loaded / e.total) * 100 * PROGRESS_COEFFICIENT).toFixed(0)) || 0;
    }
    const idx = getFileIndex(file, next);
    if (idx < 0) return;
    next[idx]!.percent = percent;
    next[idx]!.status = 'uploading';
    setState({ fileList: next });
    adapter.notifyProgress(percent, file.fileInstance ?? (file as unknown as File), next);
    adapter.notifyChange({ fileList: next, currentFile: next[idx] });
  }

  function handleSuccess(file: BaseFileItem, body: unknown): void {
    const { fileList } = getState();
    const idx = getFileIndex(file, fileList);
    if (idx < 0) return;
    const next = fileList.slice();
    next[idx]!.status = FILE_STATUS_SUCCESS;
    next[idx]!.percent = 100;
    next[idx]!.response = body;

    const { afterUpload } = getProps();
    if (afterUpload) {
      const result = adapter.notifyAfterUpload({ response: body, file: next[idx]!, fileList: next }) ?? {};
      if (result.status) next[idx]!.status = result.status as FileItemStatus;
      if (result.validateMessage) next[idx]!.validateMessage = result.validateMessage;
      if (result.name) next[idx]!.name = result.name;
      if (result.url) {
        adapter.releaseObjectUrl(next[idx]!.uid);
        next[idx]!.url = result.url;
      }
      if (result.autoRemove) {
        adapter.releaseObjectUrl(next[idx]!.uid);
        next.splice(idx, 1);
      }
    }
    setState({ fileList: next });
    adapter.notifyProgress(100, file.fileInstance ?? (file as unknown as File), next);
    adapter.notifySuccess(body, file.fileInstance ?? (file as unknown as File), next);
    adapter.notifyChange({ fileList: next, currentFile: next[idx] });
  }

  function handleError(file: BaseFileItem, xhrError?: XhrError, xhr?: XMLHttpRequest): void {
    const { fileList } = getState();
    const idx = getFileIndex(file, fileList);
    if (idx < 0) return;
    const next = fileList.slice();
    next[idx]!.status = FILE_STATUS_UPLOAD_FAIL;
    if (xhrError) next[idx]!.response = xhrError;
    setState({ fileList: next });
    if (xhrError) adapter.notifyError(xhrError, file.fileInstance ?? (file as unknown as File), next, xhr);
    adapter.notifyChange({ currentFile: next[idx], fileList: next });
  }

  function retry(fileItem: BaseFileItem): void {
    adapter.notifyRetry(fileItem);
    post(fileItem);
  }

  function handleRemove(file: BaseFileItem): void {
    const { disabled } = getProps();
    if (disabled) return;
    const { fileList } = getState();
    Promise.resolve(adapter.notifyBeforeRemove(file, fileList)).then((res) => {
      if (res === false) return;
      const idx = getFileIndex(file, getState().fileList);
      if (idx < 0) return;
      const next = getState().fileList.slice();
      next.splice(idx, 1);
      adapter.releaseObjectUrl(file.uid);
      setState({ fileList: next });
      adapter.notifyRemove(file.fileInstance, next, file);
      adapter.notifyChange({ fileList: next, currentFile: file });
    });
  }

  function handleClear(): void {
    const { disabled } = getProps();
    if (disabled) return;
    const { fileList } = getState();
    Promise.resolve(adapter.notifyBeforeClear(fileList))
      .then((res) => {
        if (res === false) return;
        adapter.releaseAllObjectUrls();
        setState({ fileList: [] });
        adapter.notifyClear();
        adapter.notifyChange({ fileList: [], currentFile: undefined });
      })
      .catch(() => {
        /* user rejected clear; no-op (对齐 Semi) */
      });
  }

  function handlePreviewClick(fileItem: BaseFileItem): void {
    adapter.notifyPreviewClick(fileItem);
  }

  // ——— 拖拽（对齐 Semi handleDragEnter/handleDrop/handleDragLeave） ———
  function handleDragEnter(e: { currentTarget: EventTarget; preventDefault: () => void; stopPropagation: () => void }): 'default' | 'legal' {
    e.preventDefault();
    e.stopPropagation();
    dragEnterTarget = e.currentTarget;
    const { disabled } = getProps();
    return disabled ? DRAG_AREA_DEFAULT : DRAG_AREA_LEGAL;
  }

  function handleDragLeave(e: { target: EventTarget; preventDefault: () => void; stopPropagation: () => void }): boolean {
    e.preventDefault();
    e.stopPropagation();
    return dragEnterTarget === e.target;
  }

  async function handleDirectoryDrop(items: Array<{ webkitGetAsEntry: () => DirEntryLike | null }>): Promise<File[]> {
    return mapFileTree(items);
  }

  function retryItem(item: BaseFileItem): void {
    retry(item);
  }

  return {
    // 文件选择/构造
    buildFileItem,
    handleChange,
    handleReplaceChange,
    insertFileToList,
    replaceFileList,
    // 上传调度
    manualUpload,
    startUpload,
    upload,
    post,
    handleProgress,
    handleSuccess,
    handleError,
    retry,
    retryItem,
    // 增删
    handleRemove,
    handleClear,
    handlePreviewClick,
    // 拖拽
    handleDragEnter,
    handleDragLeave,
    handleDirectoryDrop,
    // 校验（渲染层可直接复用做 UI 判定）
    checkFileSize,
    checkFileFormat,
  };
}

export type UploadFoundation = ReturnType<typeof createUpload>;
