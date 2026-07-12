<!--
  SideBarCodeContent — 代码/JSON 预览折叠列表（P4）。see specs/components/show/SideBar.spec.md §4/§9。
  对齐 Semi sideBar/widget/code：Collapse 折叠列表，每项一个 CodeItem。
  CodeItem 按 isJson 分流：true → JsonViewer（value=content，JSON 语义渲染，内核动态 import）；
  false → CodeHighlight（language 语法高亮）。透传 jsonViewerProps / codeHighlightProps。
  CollapseHeader 显示图标 + name + 展开（全屏）按钮，点击展开按钮走 onExpand(e, code, mode)，
  不触发折叠（extra 槽位 stopPropagation 已在 Collapse.Panel 处理）。
  受控 activeKey（红线 #1）：不回写，仅经 onChange 通知；Collapse 内部兜底非受控态。
  a11y：折叠头 aria-expanded 由 Collapse.Panel 提供；展开按钮 aria-label 走 i18n（SideBar.expand）。
  §9.3：render 期不读 effect 写入的 $state；codes 遍历为纯派生，无自循环。
-->
<script lang="ts">
  import type { ComponentProps } from 'svelte';
  import { Collapse } from '../collapse/index.js';
  import CodeHighlight from '../code-highlight/CodeHighlight.svelte';
  import JsonViewer from '../json-viewer/JsonViewer.svelte';
  import { useLocale } from '../locale-provider/index.js';

  /** JsonViewer 组件 props 子集（透传，非受控 value）。 */
  type JsonViewerProps = Partial<ComponentProps<typeof JsonViewer>>;
  /** CodeHighlight 组件 props 子集（透传）。 */
  type CodeHighlightProps = Partial<ComponentProps<typeof CodeHighlight>>;

  /** 单个代码/JSON 预览项。对齐 Semi CodeItemProps。 */
  export interface CodeItemProps {
    /** 折叠头显示名。 */
    name?: string;
    /** 唯一标识（折叠面板 key）。 */
    key: string;
    /** 是否按 JSON 渲染（true → JsonViewer；false → CodeHighlight）。 */
    isJson?: boolean;
    /** CodeHighlight 语言 id（isJson=false 时生效）。 */
    language?: string;
    /** 预览内容（CodeHighlight 的 code / JsonViewer 的 value）。 */
    content?: string;
    /** 透传给 JsonViewer 的额外 props（isJson=true 时）。 */
    jsonViewerProps?: JsonViewerProps;
    /** 透传给 CodeHighlight 的额外 props（isJson=false 时）。 */
    codeHighlightProps?: CodeHighlightProps;
  }

  interface Props {
    /** 代码/JSON 预览项列表。 */
    codes?: CodeItemProps[];
    /** 受控展开项 key（受控，不回写；仅经 onChange 通知）。 */
    activeKey?: string | string[];
    /** 展开态变化回调（Collapse onChange）。 */
    onChange?: (keys: string[]) => void;
    /** 点击某项展开（全屏）按钮回调，对齐 Semi onExpand(e, code, mode)。mode 固定 'code'。 */
    onExpand?: (e: MouseEvent, code: CodeItemProps, mode: string) => void;
    /** 根自定义类名。 */
    class?: string;
    /** 根自定义内联样式。 */
    style?: string;
  }

  let {
    codes = [],
    activeKey,
    onChange,
    onExpand,
    class: className,
    style,
  }: Props = $props();

  const loc = useLocale();
  const expandLabel = $derived(loc().t('SideBar.expand'));

  function handleExpand(e: MouseEvent, code: CodeItemProps): void {
    // 展开按钮在 head 内：阻止冒泡到 Collapse 头部，避免误触折叠（对齐 Semi FAQ 建议）。
    e.stopPropagation();
    onExpand?.(e, code, 'code');
  }

  // 新 Collapse onChange 为 (activeKey, e)；本组件对外仅暴露 key 列表。
  function handleChange(keys: string[]): void {
    onChange?.(keys);
  }

  const rootCls = $derived(
    ['cd-sidebar-code-content', className].filter(Boolean).join(' '),
  );
</script>

<div class={rootCls} {style}>
  <Collapse
    keepDOM
    {...activeKey !== undefined ? { activeKey } : {}}
    {...onChange !== undefined ? { onChange: handleChange } : {}}
  >
    {#each codes as code (code.key)}
      <Collapse.Panel itemKey={code.key}>
        {#snippet head()}
          <span class="cd-sidebar-code-content__head">
            <span class="cd-sidebar-code-content__head-icon" aria-hidden="true">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path
                  d="M6 4L2.5 8 6 12M10 4l3.5 4-3.5 4"
                  stroke="currentColor"
                  stroke-width="1.4"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </span>
            <span class="cd-sidebar-code-content__head-text">{code.name ?? code.key}</span>
            <!-- 展开（全屏）按钮：在 head 内自渲染，stopPropagation 不触发折叠（对齐 Semi FAQ）。 -->
            <button
              type="button"
              class="cd-sidebar-code-content__expand"
              aria-label={expandLabel}
              title={expandLabel}
              onclick={(e) => handleExpand(e, code)}
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
          </span>
        {/snippet}
        <div class="cd-sidebar-code-content__body">
          {#if code.isJson}
            <JsonViewer
              value={code.content ?? ''}
              width="100%"
              showSearch={false}
              {...code.jsonViewerProps}
            />
          {:else}
            <CodeHighlight
              code={code.content ?? ''}
              language={code.language ?? 'markup'}
              {...code.codeHighlightProps}
            />
          {/if}
        </div>
      </Collapse.Panel>
    {/each}
  </Collapse>
</div>

<style>
  .cd-sidebar-code-content__head {
    display: flex;
    flex: 1 1 auto;
    align-items: center;
    gap: var(--cd-sidebar-code-head-gap);
    min-inline-size: 0;
  }
  /* 展开按钮推到 head 右端（原 extra 靠右语义），紧邻折叠箭头前。 */
  .cd-sidebar-code-content__expand {
    margin-inline-start: auto;
  }
  .cd-sidebar-code-content__head-icon {
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    color: var(--cd-sidebar-code-head-icon-color);
  }
  .cd-sidebar-code-content__head-text {
    overflow: hidden;
    color: var(--cd-sidebar-code-head-color);
    font-size: var(--cd-sidebar-code-head-size);
    font-weight: var(--cd-sidebar-code-head-weight);
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  .cd-sidebar-code-content__expand {
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
  .cd-sidebar-code-content__expand:hover {
    background: var(--cd-sidebar-code-expand-hover-bg);
    color: var(--cd-sidebar-code-head-color);
  }
  .cd-sidebar-code-content__expand:focus-visible {
    outline: none;
    box-shadow: var(--cd-focus-ring);
  }
  .cd-sidebar-code-content__body {
    padding: var(--cd-sidebar-code-body-padding);
  }
</style>
