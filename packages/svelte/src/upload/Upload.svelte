<!--
  Upload — see specs/components/input/Upload.spec.md
  Basic subset: file selection (click + drag) + file list (name/size/status/remove).
  Controlled / uncontrolled `value`. This round does NOT do real network upload:
  picked files become status='ready' (or are handed to customRequest).
  TODO: real XHR upload/progress/concurrency, action URL, async beforeUpload,
  directory, image preview, minSize.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { useId } from '@chenzy-design/core';
  import { useLocale } from '../locale-provider/index.js';
  import type { UploadFileItem } from './types.js';

  interface Props {
    value?: UploadFileItem[];
    defaultValue?: UploadFileItem[];
    accept?: string;
    multiple?: boolean;
    limit?: number;
    /** Max size per file, in KB. */
    maxSize?: number;
    disabled?: boolean;
    listType?: 'text' | 'none';
    drag?: boolean;
    customRequest?: (item: UploadFileItem) => void;
    onChange?: (list: UploadFileItem[]) => void;
    onExceed?: (files: File[]) => void;
    children?: Snippet;
  }

  let {
    value,
    defaultValue = [],
    accept,
    multiple = false,
    limit,
    maxSize,
    disabled = false,
    listType = 'text',
    drag = false,
    customRequest,
    onChange,
    onExceed,
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
    const exceededSize = maxSize !== undefined && file.size > maxSize * 1024;
    const item: UploadFileItem = {
      uid: useId('cd-upload'),
      name: file.name,
      size: file.size,
      status: exceededSize ? 'error' : 'ready',
      file,
    };
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

    if (customRequest) {
      for (const item of newItems) customRequest(item);
    }
  }

  function remove(uid: string) {
    if (disabled) return;
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

<div class="cd-upload" class:cd-upload--disabled={disabled}>
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
          <span class="cd-upload__item-name">{item.name}</span>
          <span class="cd-upload__item-size">{formatSize(item.size)}</span>
          <span class="cd-upload__item-status">{item.status}</span>
          <button
            type="button"
            class="cd-upload__item-remove"
            aria-label={loc().t('Upload.remove')}
            {disabled}
            onclick={() => remove(item.uid)}
          >
            &times;
          </button>
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
    align-items: center;
    gap: var(--cd-spacing-2);
    padding-block: var(--cd-spacing-1);
    padding-inline: var(--cd-spacing-2);
    border-radius: var(--cd-radius-1);
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
  @media (prefers-reduced-motion: reduce) {
    .cd-upload__dragger {
      transition: none;
    }
  }
</style>
