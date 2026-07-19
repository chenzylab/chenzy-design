<!--
  JsonViewer — see specs/components/show/JsonViewer.spec.md
  底层：Semi 自研内核 `@douyinfe/semi-json-viewer-core`（框架无关）。Svelte 层只写
  渲染壳 + 生命周期驱动，逻辑全在内核。

  红线 · 非受控（对齐 Semi）：`value` 仅作初始内容建实例，不在 onChange 里回写 value。
  红线 · 动态 import（spec §9 硬要求，内核 ~203kb）：内核不静态进主 bundle，
    在 $effect 挂载时 `await import(...)` 异步 new，加载中显示 loading 态。
  红线 · cleanup：$effect cleanup 中 `dispose()` 销毁内核实例、置空引用，防泄漏。

  搜索/替换 UI：内核的 SearchWidget 仅提供检索/替换/导航 API，不渲染任何 UI；
    故工具条 DOM 由本壳自渲染（对齐 Semi 交互），经 ref 调内核方法。文案/aria 走 i18n。
  customRenderRule（仅只读）：监听内核 `customRender` 事件拿 customRenderMap，
    透传给上层 onCustomRender 回调（Svelte 侧可据此渲染内容）。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import type {
    JsonViewer as JsonViewerKernel,
    JsonViewerOptions,
    FindMatch,
  } from '@douyinfe/semi-json-viewer-core';
  import {
    IconSearch,
    IconCaseSensitive,
    IconWholeWord,
    IconRegExp,
    IconChevronLeft,
    IconChevronRight,
    IconClose,
  } from '@chenzy-design/icons';
  import { useLocale } from '../locale-provider/index.js';

  /** 搜索工具条暴露给 renderSearchButton 的受控句柄。 */
  export interface SearchControls {
    search: (text: string) => void;
    prev: () => void;
    next: () => void;
    open: () => void;
    close: () => void;
  }

  interface Props {
    /** 展示内容（JSON 字符串）。非受控：仅初始建实例，后续变化不重建（对齐 Semi）。 */
    value?: string;
    /** 高度（number 记为 px）。默认 400（对齐 Semi）。 */
    height?: number | string;
    /** 宽度（number 记为 px）。默认 400（对齐 Semi）。 */
    width?: number | string;
    /** 是否显示搜索入口（默认 true，对齐 Semi）。 */
    showSearch?: boolean;
    /** 自定义渲染搜索按钮（对齐 Semi ≥2.95）。传入默认按钮 snippet 与控制句柄。 */
    renderSearchButton?: Snippet<[Snippet, SearchControls]>;
    /** 编辑器配置（lineHeight/autoWrap/readOnly/customRenderRule/formatOptions）。 */
    options?: JsonViewerOptions;
    /** 内容变化回调（非受控：不回写 value）。 */
    onChange?: (value: string) => void;
    /** 只读模式下命中 customRenderRule 时透出 customRenderMap（Svelte 侧据此渲染）。 */
    onCustomRender?: (customRenderMap: Map<HTMLElement, unknown>) => void;
    class?: string;
    style?: string;
  }

  let {
    value = '',
    height = 400,
    width = 400,
    showSearch = true,
    renderSearchButton,
    options,
    onChange,
    onCustomRender,
    class: className,
    style,
  }: Props = $props();

  const loc = useLocale();

  // 内核挂载点：内核往此容器注入编辑器 DOM。
  let editorEl = $state<HTMLElement | null>(null);
  // 内核实例（$effect 命令式创建 + cleanup dispose）。非响应依赖，用普通变量持有。
  let kernel: JsonViewerKernel | null = null;
  // 加载态：动态 import 内核期间为 true。
  let loading = $state(true);
  // 加载失败态。
  let loadError = $state(false);

  // 搜索工具条 UI 状态（本壳自管，内核不提供 UI）。
  let searchOpen = $state(false);
  let searchText = $state('');
  let replaceText = $state('');
  let caseSensitive = $state(false);
  let wholeWord = $state(false);
  let useRegex = $state(false);
  let searchInputEl = $state<HTMLInputElement | null>(null);

  const readOnly = $derived(options?.readOnly ?? false);

  // 尺寸归一：number → px。
  function toSize(v: number | string | undefined): string | undefined {
    if (v == null) return undefined;
    return typeof v === 'number' ? `${v}px` : v;
  }

  const heightCss = $derived(toSize(height));
  const widthCss = $derived(toSize(width));

  // 内核生命周期：editorEl 就绪时动态 import 并 new，cleanup dispose。
  // 依赖仅 editorEl —— value/options 是非受控初始值，变化不重建（对齐 Semi）。
  $effect(() => {
    const el = editorEl;
    if (!el) return;

    let disposed = false;
    let instance: JsonViewerKernel | null = null;
    loading = true;
    loadError = false;

    import('@douyinfe/semi-json-viewer-core')
      .then(({ JsonViewer }) => {
        if (disposed) return;
        instance = new JsonViewer(el, value, {
          prefixCls: 'cd-json-viewer',
          ...options,
        });
        // customRender 事件 → 透出 customRenderMap（仅只读 + customRenderRule 命中时触发）。
        instance.emitter.on('customRender', (e) => {
          onCustomRender?.(e.customRenderMap);
        });
        // contentChanged 事件 → onChange（非受控：不回写 value）。
        instance.emitter.on('contentChanged', () => {
          const v = instance?.getModel().getValue() ?? '';
          onChange?.(v);
          // 搜索框打开时内容变化 → 重新检索（对齐 Semi foundation）。
          if (searchOpen && searchText) runSearch();
        });
        instance.layout();
        kernel = instance;
        loading = false;
      })
      .catch(() => {
        if (disposed) return;
        loadError = true;
        loading = false;
      });

    return () => {
      disposed = true;
      instance?.dispose();
      instance = null;
      kernel = null;
    };
  });

  // —— 搜索/替换：委托内核 SearchWidget ——
  function runSearch() {
    kernel?.getSearchWidget().search(searchText, caseSensitive, wholeWord, useRegex);
  }

  function openSearch() {
    searchOpen = true;
    // 下一帧聚焦输入框。
    queueMicrotask(() => searchInputEl?.focus());
  }
  function closeSearch() {
    searchOpen = false;
  }

  // 搜索选项切换后立即重检索。
  function toggleCase() {
    caseSensitive = !caseSensitive;
    runSearch();
  }
  function toggleWord() {
    wholeWord = !wholeWord;
    runSearch();
  }
  function toggleRegex() {
    useRegex = !useRegex;
    runSearch();
  }

  // —— ref 暴露方法（对齐 Semi） ——
  export function getValue(): string {
    return kernel?.getModel().getValue() ?? '';
  }
  export function format(): void {
    kernel?.format();
  }
  export function search(
    text: string,
    cs?: boolean,
    ww?: boolean,
    rx?: boolean,
  ): void {
    kernel?.getSearchWidget().search(text, cs ?? caseSensitive, ww ?? wholeWord, rx ?? useRegex);
  }
  export function getSearchResults(): FindMatch[] {
    return kernel?.getSearchWidget().searchResults ?? [];
  }
  export function prevSearch(step = 1): void {
    kernel?.getSearchWidget().navigateResults(-step);
  }
  export function nextSearch(step = 1): void {
    kernel?.getSearchWidget().navigateResults(step);
  }
  export function replace(text: string): void {
    if (readOnly) return;
    kernel?.getSearchWidget().replace(text);
  }
  export function replaceAll(text: string): void {
    if (readOnly) return;
    kernel?.getSearchWidget().replaceAll(text);
  }

  // 提供给 renderSearchButton 的控制句柄。
  const searchControls: SearchControls = {
    search: (text: string) => {
      searchText = text;
      runSearch();
    },
    prev: () => prevSearch(),
    next: () => nextSearch(),
    open: openSearch,
    close: closeSearch,
  };
</script>

{#snippet defaultSearchButton()}
  <button
    type="button"
    class="cd-json-viewer__search-trigger"
    aria-label={loc().t('JsonViewer.searchTrigger')}
    aria-expanded={searchOpen}
    onclick={openSearch}
  >
    <IconSearch aria-hidden="true" />
  </button>
{/snippet}

<div
  class={['cd-json-viewer', className].filter(Boolean).join(' ')}
  style="{heightCss ? `--cd-json-viewer-height:${heightCss};` : ''}{widthCss
    ? `--cd-json-viewer-width:${widthCss};`
    : ''}{style ?? ''}"
>
  {#if showSearch}
    <div class="cd-json-viewer__toolbar-slot">
      {#if renderSearchButton}
        {@render renderSearchButton(defaultSearchButton, searchControls)}
      {:else}
        {@render defaultSearchButton()}
      {/if}
    </div>
  {/if}

  {#if searchOpen}
    <div class="cd-json-viewer__search-bar" role="search">
      <div class="cd-json-viewer__search-row">
        <input
          bind:this={searchInputEl}
          class="cd-json-viewer__search-input"
          type="text"
          bind:value={searchText}
          placeholder={loc().t('JsonViewer.search')}
          aria-label={loc().t('JsonViewer.search')}
          oninput={runSearch}
        />
        <button
          type="button"
          class="cd-json-viewer__toolbar-btn"
          class:cd-json-viewer__toolbar-btn--active={caseSensitive}
          aria-label={loc().t('JsonViewer.caseSensitive')}
          aria-pressed={caseSensitive}
          onclick={toggleCase}><IconCaseSensitive aria-hidden="true" /></button
        >
        <button
          type="button"
          class="cd-json-viewer__toolbar-btn"
          class:cd-json-viewer__toolbar-btn--active={wholeWord}
          aria-label={loc().t('JsonViewer.wholeWord')}
          aria-pressed={wholeWord}
          onclick={toggleWord}><IconWholeWord aria-hidden="true" /></button
        >
        <button
          type="button"
          class="cd-json-viewer__toolbar-btn"
          class:cd-json-viewer__toolbar-btn--active={useRegex}
          aria-label={loc().t('JsonViewer.regex')}
          aria-pressed={useRegex}
          onclick={toggleRegex}><IconRegExp aria-hidden="true" /></button
        >
        <button
          type="button"
          class="cd-json-viewer__toolbar-btn"
          aria-label={loc().t('JsonViewer.prev')}
          onclick={() => prevSearch()}><IconChevronLeft aria-hidden="true" /></button
        >
        <button
          type="button"
          class="cd-json-viewer__toolbar-btn"
          aria-label={loc().t('JsonViewer.next')}
          onclick={() => nextSearch()}><IconChevronRight aria-hidden="true" /></button
        >
        <button
          type="button"
          class="cd-json-viewer__toolbar-btn"
          aria-label={loc().t('JsonViewer.closeSearch')}
          onclick={closeSearch}><IconClose aria-hidden="true" /></button
        >
      </div>

      {#if !readOnly}
        <div class="cd-json-viewer__search-row">
          <input
            class="cd-json-viewer__search-input"
            type="text"
            bind:value={replaceText}
            placeholder={loc().t('JsonViewer.replaceInput')}
            aria-label={loc().t('JsonViewer.replaceInput')}
          />
          <button
            type="button"
            class="cd-json-viewer__toolbar-btn"
            aria-label={loc().t('JsonViewer.replace')}
            onclick={() => replace(replaceText)}>{loc().t('JsonViewer.replace')}</button
          >
          <button
            type="button"
            class="cd-json-viewer__toolbar-btn"
            aria-label={loc().t('JsonViewer.replaceAll')}
            onclick={() => replaceAll(replaceText)}
            >{loc().t('JsonViewer.replaceAll')}</button
          >
        </div>
      {/if}
    </div>
  {/if}

  <div
    bind:this={editorEl}
    class="cd-json-viewer__editor"
    role="textbox"
    aria-multiline="true"
    aria-label={loc().t('JsonViewer.editor')}
    aria-readonly={readOnly ? 'true' : undefined}
    tabindex="0"
    data-loading={loading ? 'true' : undefined}
    data-error={loadError ? 'true' : undefined}
  ></div>
</div>

<style>
  .cd-json-viewer {
    position: relative;
    inline-size: var(--cd-json-viewer-width, 100%);
    background: var(--cd-color-json-viewer-bg);
    color: var(--cd-color-json-viewer-text);
    border: 1px solid var(--cd-color-json-viewer-border);
    border-radius: var(--cd-radius-json-viewer);
    font-family: var(--cd-font-json-viewer-fontfamily);
    font-size: var(--cd-font-json-viewer-fontsize);
    overflow: hidden;
  }

  .cd-json-viewer__editor {
    block-size: var(--cd-json-viewer-height, 300px);
    overflow: auto;
  }

  .cd-json-viewer__editor[data-loading='true'],
  .cd-json-viewer__editor[data-error='true'] {
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--cd-color-json-viewer-line-number);
  }

  .cd-json-viewer__editor[data-error='true'] {
    color: var(--cd-color-json-viewer-error);
  }

  /* —— 搜索入口按钮 —— */
  .cd-json-viewer__toolbar-slot {
    position: absolute;
    inset-block-start: var(--cd-spacing-json-viewer-toolbar-padding);
    inset-inline-end: var(--cd-spacing-json-viewer-toolbar-padding);
    z-index: 1;
  }

  .cd-json-viewer__search-trigger {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    inline-size: 24px;
    block-size: 24px;
    padding: 0;
    color: var(--cd-color-json-viewer-line-number);
    background: transparent;
    border: none;
    border-radius: var(--cd-radius-json-viewer-toolbar);
    cursor: pointer;
  }

  .cd-json-viewer__search-trigger:hover {
    background: var(--cd-color-json-viewer-toolbar-btn-hover);
    color: var(--cd-color-json-viewer-text);
  }

  /* —— 搜索/替换工具条 —— */
  .cd-json-viewer__search-bar {
    position: absolute;
    inset-block-start: var(--cd-spacing-json-viewer-toolbar-padding);
    inset-inline-end: var(--cd-spacing-json-viewer-toolbar-padding);
    z-index: 2;
    display: flex;
    flex-direction: column;
    gap: var(--cd-spacing-json-viewer-toolbar-gap);
    padding: var(--cd-spacing-json-viewer-toolbar-padding);
    background: var(--cd-color-json-viewer-toolbar-bg);
    border: 1px solid var(--cd-color-json-viewer-toolbar-border);
    border-radius: var(--cd-radius-json-viewer-toolbar);
    box-shadow: var(--cd-color-json-viewer-toolbar-shadow);
  }

  .cd-json-viewer__search-row {
    display: flex;
    align-items: center;
    gap: var(--cd-spacing-json-viewer-toolbar-gap);
  }

  .cd-json-viewer__search-input {
    inline-size: 160px;
    padding: 2px 6px;
    color: var(--cd-color-json-viewer-text);
    background: var(--cd-color-json-viewer-bg);
    border: 1px solid var(--cd-color-json-viewer-toolbar-border);
    border-radius: var(--cd-radius-json-viewer-toolbar);
    font-family: inherit;
    font-size: var(--cd-font-json-viewer-fontsize);
  }

  .cd-json-viewer__toolbar-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-inline-size: 24px;
    block-size: 24px;
    padding: 0 6px;
    color: var(--cd-color-json-viewer-text);
    background: transparent;
    border: none;
    border-radius: var(--cd-radius-json-viewer-toolbar);
    font-family: inherit;
    font-size: var(--cd-font-json-viewer-fontsize);
    cursor: pointer;
  }

  .cd-json-viewer__toolbar-btn:hover {
    background: var(--cd-color-json-viewer-toolbar-btn-hover);
  }

  .cd-json-viewer__toolbar-btn--active {
    background: var(--cd-color-json-viewer-toolbar-btn-active);
  }

  /* —— 内核输出内容的 token 着色（核对 prefixCls='cd-json-viewer' 生成 class） —— */
  .cd-json-viewer :global(.cd-json-viewer-string-key) {
    color: var(--cd-color-json-viewer-key);
  }
  .cd-json-viewer :global(.cd-json-viewer-string-value) {
    color: var(--cd-color-json-viewer-string);
  }
  .cd-json-viewer :global(.cd-json-viewer-number) {
    color: var(--cd-color-json-viewer-number);
  }
  .cd-json-viewer :global(.cd-json-viewer-keyword) {
    color: var(--cd-color-json-viewer-keyword);
  }
  .cd-json-viewer :global(.cd-json-viewer-delimiter-colon),
  .cd-json-viewer :global(.cd-json-viewer-delimiter-comma) {
    color: var(--cd-color-json-viewer-punctuation);
  }
  /* 彩虹括号（对齐 Semi delimiter-bracket/array 0/1/2 = blue-7/green-7/orange-7 循环） */
  .cd-json-viewer :global(.cd-json-viewer-delimiter-bracket-0),
  .cd-json-viewer :global(.cd-json-viewer-delimiter-array-0) {
    color: var(--cd-color-json-viewer-bracket-0);
  }
  .cd-json-viewer :global(.cd-json-viewer-delimiter-bracket-1),
  .cd-json-viewer :global(.cd-json-viewer-delimiter-array-1) {
    color: var(--cd-color-json-viewer-bracket-1);
  }
  .cd-json-viewer :global(.cd-json-viewer-delimiter-bracket-2),
  .cd-json-viewer :global(.cd-json-viewer-delimiter-array-2) {
    color: var(--cd-color-json-viewer-bracket-2);
  }
  .cd-json-viewer :global(.cd-json-viewer-comment-block),
  .cd-json-viewer :global(.cd-json-viewer-comment-line) {
    color: var(--cd-color-json-viewer-comment);
  }
  /* 折叠图标（对齐 Semi folding-icon，opacity 0.7 transition） */
  .cd-json-viewer :global(.cd-json-viewer-folding-icon) {
    color: var(--cd-color-json-viewer-folding-icon);
    opacity: 0.7;
    transition: opacity 0.8s;
  }
  .cd-json-viewer :global(.cd-json-viewer-line-number) {
    color: var(--cd-color-json-viewer-line-number);
  }
  .cd-json-viewer :global(.cd-json-viewer-line-number-container) {
    background: var(--cd-color-json-viewer-line-number-bg);
  }
  .cd-json-viewer :global(.cd-json-viewer-search-result) {
    background: var(--cd-color-json-viewer-search-highlight);
  }
  .cd-json-viewer :global(.cd-json-viewer-current-search-result) {
    background: var(--cd-color-json-viewer-search-current);
  }
  /* 语法错误：波浪下划线（对齐 Semi error：text-decoration underline wavy danger 1px） */
  .cd-json-viewer :global(.cd-json-viewer-error) {
    text-decoration: underline wavy var(--cd-color-json-viewer-error);
    text-decoration-thickness: 1px;
  }
  /* 容器纵向内边距（对齐 Semi paddingY 12px / paddingX 0） */
  .cd-json-viewer :global(.cd-json-viewer-view-line) {
    color: #237893;
  }
</style>
