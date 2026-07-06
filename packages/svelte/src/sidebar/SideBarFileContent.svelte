<!--
  SideBarFileContent — 富文本查看/编辑折叠列表（P5）。对齐 Semi sideBar/widget/file.js FileContent：
  Collapse 折叠列表（clickHeaderToExpand=false，头部展开按钮触发全屏），每项一个 SideBarFileItem
  富文本编辑器。列表项默认只读查看（editable=false，对齐 Semi）；每项可经 FileItemProps.editable
  单独开编辑。受控 activeKey（红线 #1）：不回写，仅经 onChange 通知；Collapse 内部兜底非受控。
  a11y：折叠头 aria-expanded 由 Collapse.Panel 提供；展开按钮 aria-label 走 i18n（SideBar.expand）。
  §9.3：files 遍历为纯派生，无自循环；每项 editor 生命周期封装在 SideBarFileItem 的 $effect 内。
-->
<script lang="ts">
  import { Collapse } from '../collapse/index.js';
  import { useLocale } from '../locale-provider/index.js';
  import SideBarFileItem from './SideBarFileItem.svelte';
  import type { SideBarImageUploadOptions } from './file-extensions.js';

  /** 单个富文本文件项。对齐 Semi FileItemProps。 */
  export interface FileItemProps {
    /** 唯一标识（折叠面板 key）。 */
    key: string;
    /** 折叠头显示名。 */
    name?: string;
    /** 富文本内容（HTML）。 */
    content?: string;
    /** 是否可编辑（默认 false=只读查看，对齐 Semi 列表项）。 */
    editable?: boolean;
    /** 内容变更回调（editor.getHTML()）。 */
    onContentChange?: (html: string) => void;
    /** 追加到默认扩展集末尾的自定义 tiptap 扩展。 */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    extensions?: any[];
    /** 图片上传配置（透传 ImageUploadNode / 内嵌 Upload）。 */
    imgUploadProps?: SideBarImageUploadOptions;
    /** 项自定义类名。 */
    className?: string;
    /** 项自定义内联样式。 */
    style?: string;
  }

  interface Props {
    /** 富文本文件项列表。 */
    files?: FileItemProps[];
    /** 受控展开项 key（受控，不回写；仅经 onChange 通知）。 */
    activeKey?: string | string[];
    /** 展开态变化回调（Collapse onChange）。 */
    onChange?: (keys: string[]) => void;
    /** 点击某项展开（全屏）按钮回调，对齐 Semi onExpand(e, file, mode)。mode 固定 'file'。 */
    onExpand?: (e: MouseEvent, file: FileItemProps, mode: string) => void;
    /** 根自定义类名。 */
    class?: string;
    /** 根自定义内联样式。 */
    style?: string;
  }

  let {
    files = [],
    activeKey,
    onChange,
    onExpand,
    class: className,
    style,
  }: Props = $props();

  const loc = useLocale();
  const expandLabel = $derived(loc().t('SideBar.expand'));

  function handleExpand(e: MouseEvent, file: FileItemProps): void {
    onExpand?.(e, file, 'file');
  }

  const rootCls = $derived(
    ['cd-sidebar-file-content', className].filter(Boolean).join(' '),
  );
</script>

<div class={rootCls} {style}>
  <Collapse
    {...activeKey !== undefined ? { activeKey } : {}}
    {...onChange !== undefined ? { onChange } : {}}
  >
    {#each files as file (file.key)}
      {#snippet expandBtn()}
        <button
          type="button"
          class="cd-sidebar-file-content__expand"
          aria-label={expandLabel}
          title={expandLabel}
          onclick={(e) => handleExpand(e, file)}
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path
              d="M9.5 2.5h4v4M6.5 13.5h-4v-4M13.5 2.5l-5 5M2.5 13.5l5-5"
              stroke="currentColor"
              stroke-width="1.4"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
      {/snippet}
      <Collapse.Panel itemKey={file.key} extra={expandBtn}>
        {#snippet head()}
          <span class="cd-sidebar-file-content__head">
            <span class="cd-sidebar-file-content__head-icon" aria-hidden="true">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path
                  d="M4 1.5h5l3 3v10h-8v-13ZM9 1.5V4.5h3"
                  stroke="currentColor"
                  stroke-width="1.3"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </span>
            <span class="cd-sidebar-file-content__head-text">{file.name ?? file.key}</span>
          </span>
        {/snippet}
        <div class="cd-sidebar-file-content__body">
          <SideBarFileItem
            content={file.content ?? ''}
            editable={file.editable ?? false}
            {...file.onContentChange !== undefined ? { onContentChange: file.onContentChange } : {}}
            {...file.extensions !== undefined ? { extensions: file.extensions } : {}}
            {...file.imgUploadProps !== undefined ? { imgUploadProps: file.imgUploadProps } : {}}
            {...file.className !== undefined ? { class: file.className } : {}}
            {...file.style !== undefined ? { style: file.style } : {}}
          />
        </div>
      </Collapse.Panel>
    {/each}
  </Collapse>
</div>

<style>
  .cd-sidebar-file-content__head {
    display: inline-flex;
    align-items: center;
    gap: var(--cd-sidebar-code-head-gap);
    min-inline-size: 0;
  }
  .cd-sidebar-file-content__head-icon {
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    color: var(--cd-sidebar-code-head-icon-color);
  }
  .cd-sidebar-file-content__head-text {
    overflow: hidden;
    color: var(--cd-sidebar-code-head-color);
    font-size: var(--cd-sidebar-code-head-size);
    font-weight: var(--cd-sidebar-code-head-weight);
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  .cd-sidebar-file-content__expand {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    inline-size: 24px;
    block-size: 24px;
    padding: 0;
    border: none;
    border-radius: var(--cd-sidebar-close-radius);
    background: transparent;
    color: var(--cd-sidebar-code-expand-color);
    cursor: pointer;
    transition:
      background-color var(--cd-motion-duration-fast, 0.1s) var(--cd-motion-ease-standard, ease),
      color var(--cd-motion-duration-fast, 0.1s) var(--cd-motion-ease-standard, ease);
  }
  .cd-sidebar-file-content__expand:hover {
    background: var(--cd-sidebar-code-expand-hover-bg);
    color: var(--cd-sidebar-code-head-color);
  }
  .cd-sidebar-file-content__expand:focus-visible {
    outline: none;
    box-shadow: var(--cd-focus-ring);
  }
  .cd-sidebar-file-content__body {
    padding: var(--cd-sidebar-code-body-padding);
  }
</style>
