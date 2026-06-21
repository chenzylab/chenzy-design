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
    computeUploadPercent,
    isUploadOk,
    createUploadQueue,
    resolveBeforeUpload,
    validateFileSize,
    type BeforeUploadResult,
  } from '@chenzy-design/core';
  import { useLocale } from '../locale-provider/index.js';
  import { Progress } from '../progress/index.js';
  import type { UploadFileItem } from './types.js';

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
  }: Props = $props();

  const loc = useLocale();

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
    };
  });

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
          patchItem(item.uid, { percent: computeUploadPercent(e.loaded, e.total) });
        }
      };
      xhr.onload = () => {
        xhrMap.delete(item.uid);
        if (isUploadOk(xhr.status)) {
          patchItem(item.uid, { status: 'success', percent: 100 });
          onSuccess?.(xhr.responseText, item);
        } else {
          patchItem(item.uid, { status: 'error' });
          onError?.(item);
        }
        done();
      };
      xhr.onerror = () => {
        xhrMap.delete(item.uid);
        patchItem(item.uid, { status: 'error' });
        onError?.(item);
        done();
      };
      // abort（remove/卸载）也要释放槽位，否则队列卡死。
      xhr.onabort = () => {
        xhrMap.delete(item.uid);
        done();
      };

      const form = new FormData();
      form.append(uploadName, file, item.name);
      if (uploadData) {
        for (const [k, v] of Object.entries(uploadData)) form.append(k, v);
      }
      xhr.open('POST', action);
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
      item.error = loc().t(sizeError === 'max' ? 'Upload.sizeError' : 'Upload.minSizeError', {
        size: formatSize(limitKB * 1024),
      });
    }
    return item;
  }

  function addFiles(fileList: FileList | File[]) {
    if (disabled) return;
    const files = Array.from(fileList);
    if (files.length === 0) return;

    let accepted = files;
    if (limit !== undefined) {
      const room = limit - current.length;
      if (room <= 0) {
        onExceed?.(files);
        return;
      }
      if (files.length > room) {
        onExceed?.(files.slice(room));
        accepted = files.slice(0, room);
      }
    }

    const newItems = accepted.map(buildItem);
    commit([...current, ...newItems]);

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
    commit(current.filter((item) => item.uid !== uid));
  }

  function openPicker() {
    if (disabled) return;
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
    if (dt?.files && dt.files.length > 0) addFiles(dt.files);
  }

  function handleDragKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openPicker();
    }
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
        <span class="cd-upload__dragger-text">{loc().t('Upload.draggerText')}</span>
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

  {#if listType === 'text' && current.length > 0}
    <ul class="cd-upload__list">
      {#each current as item (item.uid)}
        <li class="cd-upload__item" class:cd-upload__item--error={item.status === 'error'}>
          <div class="cd-upload__item-main">
            <span class="cd-upload__item-name">{item.name}</span>
            <span class="cd-upload__item-size">{formatSize(item.size)}</span>
            {#if item.status !== 'uploading'}
              <span class="cd-upload__item-status">{item.error ?? item.status}</span>
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
            <Progress percent={item.percent ?? 0} size="small" />
          {/if}
        </li>
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
          {#if url}
            <img class="cd-upload__thumb" src={url} alt={item.name} />
          {:else}
            <span class="cd-upload__thumb cd-upload__thumb--placeholder" aria-hidden="true"></span>
          {/if}
          {#if item.status === 'uploading'}
            <div class="cd-upload__card-progress">
              <Progress percent={item.percent ?? 0} size="small" />
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
        </li>
      {/each}
    </ul>
  {/if}
</div>

<style>
  .cd-upload {
    display: flex;
    flex-direction: column;
    gap: var(--cd-spacing-3);
    color: var(--cd-color-text-0);
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
  .cd-upload__trigger {
    align-self: flex-start;
    display: inline-flex;
    align-items: center;
    gap: var(--cd-spacing-2);
    height: var(--cd-button-height-default);
    padding-inline: var(--cd-button-padding-x);
    background: var(--cd-color-fill-0);
    color: var(--cd-color-text-0);
    border: 1px solid var(--cd-color-border);
    border-radius: var(--cd-button-radius);
    font-size: var(--cd-button-font-size);
    cursor: pointer;
  }
  .cd-upload__trigger:focus-visible {
    outline: none;
    box-shadow: var(--cd-focus-ring);
  }
  /* 组件级 size：触发按钮高度/字号档（区别于 file.size 体积）。 */
  .cd-upload--small .cd-upload__trigger {
    height: var(--cd-button-height-small);
    font-size: var(--cd-font-size-1);
  }
  .cd-upload--large .cd-upload__trigger {
    height: var(--cd-button-height-large);
    font-size: var(--cd-font-size-3);
  }
  .cd-upload__trigger:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
  .cd-upload__dragger {
    display: flex;
    align-items: center;
    justify-content: center;
    padding-block: var(--cd-spacing-6);
    padding-inline: var(--cd-spacing-4);
    background: var(--cd-upload-dragger-bg);
    border: 1px dashed var(--cd-upload-dragger-border);
    border-radius: var(--cd-upload-dragger-radius);
    color: var(--cd-color-text-2);
    cursor: pointer;
    transition: border-color var(--cd-motion-duration-fast) var(--cd-motion-ease-standard);
  }
  .cd-upload__dragger:hover,
  .cd-upload__dragger:focus-visible {
    border-color: var(--cd-upload-dragger-border-active);
  }
  .cd-upload__dragger:focus-visible {
    outline: none;
    box-shadow: var(--cd-focus-ring);
  }
  .cd-upload--disabled .cd-upload__dragger {
    cursor: not-allowed;
    opacity: 0.5;
  }
  /* 组件级 size：拖拽区内边距/字号档。 */
  .cd-upload--small .cd-upload__dragger {
    padding-block: var(--cd-spacing-4);
    font-size: var(--cd-font-size-1);
  }
  .cd-upload--large .cd-upload__dragger {
    padding-block: var(--cd-spacing-8, var(--cd-spacing-6));
    font-size: var(--cd-font-size-3);
  }
  /* 组件级 status：校验态影响上传区/卡片边框色（区别于 file.status 进度态）。 */
  .cd-upload--warning .cd-upload__dragger {
    border-color: var(--cd-upload-border-warning, var(--cd-color-warning));
  }
  .cd-upload--error .cd-upload__dragger {
    border-color: var(--cd-upload-border-error, var(--cd-color-danger));
  }
  .cd-upload--warning .cd-upload__trigger {
    border-color: var(--cd-upload-border-warning, var(--cd-color-warning));
  }
  .cd-upload--error .cd-upload__trigger {
    border-color: var(--cd-upload-border-error, var(--cd-color-danger));
  }
  .cd-upload--warning .cd-upload__card,
  .cd-upload--error .cd-upload__card {
    border-color: var(--cd-upload-border-warning, var(--cd-color-warning));
  }
  .cd-upload--error .cd-upload__card {
    border-color: var(--cd-upload-border-error, var(--cd-color-danger));
  }
  .cd-upload__list {
    display: flex;
    flex-direction: column;
    gap: var(--cd-spacing-1);
    margin: 0;
    padding: 0;
    list-style: none;
  }
  .cd-upload__item {
    display: flex;
    flex-direction: column;
    gap: var(--cd-spacing-1);
    padding-block: var(--cd-spacing-1);
    padding-inline: var(--cd-spacing-2);
    border-radius: var(--cd-radius-1);
  }
  .cd-upload__item-main {
    display: flex;
    align-items: center;
    gap: var(--cd-spacing-2);
  }
  .cd-upload__item:hover {
    background: var(--cd-upload-item-bg-hover);
  }
  .cd-upload__item--error {
    color: var(--cd-upload-item-color-error);
  }
  .cd-upload__item-name {
    flex: 1 1 auto;
    min-inline-size: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .cd-upload__item-size,
  .cd-upload__item-status {
    flex: 0 0 auto;
    color: var(--cd-color-text-2);
    font-size: var(--cd-font-size-1);
  }
  .cd-upload__item--error .cd-upload__item-status {
    color: var(--cd-upload-item-color-error);
  }
  .cd-upload__item-remove {
    flex: 0 0 auto;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    border: none;
    background: transparent;
    color: var(--cd-color-text-2);
    cursor: pointer;
    border-radius: var(--cd-radius-1);
    font-size: var(--cd-font-size-3);
    line-height: 1;
  }
  .cd-upload__item-remove:hover {
    color: var(--cd-color-text-0);
  }
  .cd-upload__item-remove:focus-visible {
    outline: none;
    box-shadow: var(--cd-focus-ring);
  }
  .cd-upload__item-remove:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }

  /* --- image / picture-card 缩略图网格 --- */
  .cd-upload__grid {
    display: flex;
    flex-wrap: wrap;
    gap: var(--cd-spacing-2);
    margin: 0;
    padding: 0;
    list-style: none;
  }
  .cd-upload__card {
    position: relative;
    inline-size: 96px;
    block-size: 96px;
    border: 1px solid var(--cd-color-border);
    border-radius: var(--cd-radius-2);
    overflow: hidden;
    background: var(--cd-color-fill-0);
  }
  .cd-upload__card--error {
    border-color: var(--cd-upload-item-color-error, var(--cd-color-danger));
  }
  .cd-upload__thumb {
    inline-size: 100%;
    block-size: 100%;
    object-fit: cover;
    display: block;
  }
  .cd-upload__thumb--placeholder {
    background: var(--cd-color-fill-1);
  }
  .cd-upload__card-progress {
    position: absolute;
    inset-inline: var(--cd-spacing-1);
    inset-block-end: var(--cd-spacing-1);
  }
  .cd-upload__card-overlay {
    position: absolute;
    inset-block-start: 0;
    inset-inline: 0;
    display: flex;
    align-items: center;
    gap: var(--cd-spacing-1);
    padding: var(--cd-spacing-1);
    background: linear-gradient(to bottom, rgba(0, 0, 0, 0.55), transparent);
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
    color: #fff;
    font-size: var(--cd-font-size-1);
  }
  .cd-upload__card-remove {
    flex: 0 0 auto;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    inline-size: 1.25rem;
    block-size: 1.25rem;
    border: none;
    background: transparent;
    color: #fff;
    cursor: pointer;
    font-size: var(--cd-font-size-3);
    line-height: 1;
  }
  .cd-upload__card-remove:focus-visible {
    outline: none;
    box-shadow: var(--cd-focus-ring);
  }
  @media (prefers-reduced-motion: reduce) {
    .cd-upload__card-overlay {
      transition: none;
    }
    .cd-upload__dragger {
      transition: none;
    }
  }
</style>
