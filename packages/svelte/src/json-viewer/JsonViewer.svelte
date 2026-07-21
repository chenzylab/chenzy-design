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
  import Button from '../button/Button.svelte';
  import ButtonGroup from '../button/ButtonGroup.svelte';
  import Input from '../input/Input.svelte';

  /** 搜索工具条暴露给 renderSearchButton 的受控句柄（严格对齐 Semi SearchControls）。 */
  export interface SearchControls {
    /** 当前是否显示搜索栏。 */
    showSearchBar: boolean;
    /** 切换搜索栏显示/隐藏。 */
    onToggleSearchBar: () => void;
    /** 执行搜索。 */
    onSearch: (text: string, caseSensitive?: boolean, wholeWord?: boolean, regex?: boolean) => void;
    /** 跳转到上一个搜索结果。 */
    onPrevSearch: () => void;
    /** 跳转到下一个搜索结果。 */
    onNextSearch: () => void;
    /** 替换当前搜索结果。 */
    onReplace: (text: string) => void;
    /** 替换所有搜索结果。 */
    onReplaceAll: (text: string) => void;
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
  // 搜索输入框（Input 组件实例，有 focus 方法）。搜索后需重新聚焦，
  // 否则内核 search() 会把焦点抢到编辑器（对齐 Semi searchInputRef.focus()）。
  let searchInputRef = $state<{ focus: () => void } | null>(null);

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
    queueMicrotask(() => searchInputRef?.focus());
  }
  // 搜索后把焦点还给搜索框（内核 search() 会把焦点抢到编辑器，对齐 Semi）。
  function refocusSearch() {
    queueMicrotask(() => searchInputRef?.focus());
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

  // 提供给 renderSearchButton 的控制句柄（对齐 Semi SearchControls）。
  // showSearchBar 用 getter 暴露 live 的 searchOpen（$state），snippet 内读取即响应式。
  const searchControls: SearchControls = {
    get showSearchBar() {
      return searchOpen;
    },
    onToggleSearchBar: () => (searchOpen ? closeSearch() : openSearch()),
    onSearch: (text: string, caseSensitive?: boolean, wholeWord?: boolean, regex?: boolean) => {
      searchText = text;
      search(text, caseSensitive, wholeWord, regex);
    },
    onPrevSearch: () => prevSearch(),
    onNextSearch: () => nextSearch(),
    onReplace: (text: string) => replace(text),
    onReplaceAll: (text: string) => replaceAll(text),
  };
</script>

{#snippet searchTriggerIcon()}
  <IconSearch aria-hidden="true" />
{/snippet}
{#snippet iconPrev()}<IconChevronLeft aria-hidden="true" />{/snippet}
{#snippet iconNext()}<IconChevronRight aria-hidden="true" />{/snippet}
{#snippet iconClose()}<IconClose aria-hidden="true" />{/snippet}

{#snippet defaultSearchButton()}
  <!-- 对齐 Semi：搜索触发器是 Button(theme=light type=primary) 纯图标按钮
       （浅灰底方块 rgba(46,50,56,0.05) + 蓝图标 + 32×32），非自造裸 icon。 -->
  <Button
    class="cd-json-viewer-search-bar-trigger"
    theme="light"
    type="primary"
    icon={searchTriggerIcon}
    ariaLabel={loc().t('JsonViewer.searchTrigger')}
    aria-expanded={searchOpen}
    onclick={openSearch}
  />
{/snippet}

<div
  class={['cd-json-viewer', className].filter(Boolean).join(' ')}
  style="{heightCss ? `--cd-json-viewer-height:${heightCss};` : ''}{widthCss
    ? `--cd-json-viewer-width:${widthCss};`
    : ''}{style ?? ''}"
>
  {#if showSearch}
    <div class="cd-json-viewer-toolbar-slot">
      {#if renderSearchButton}
        {@render renderSearchButton(defaultSearchButton, searchControls)}
      {:else}
        {@render defaultSearchButton()}
      {/if}
    </div>
  {/if}

  {#if searchOpen}
    <!-- 搜索/替换浮层（DOM 结构严格对齐 Semi renderSearchBox：
         search-bar-container > search-bar(Input + ul.search-options + ButtonGroup + close Button)
                              + replace-bar(Input + replace Button + replaceAll Button)）。 -->
    <div class="cd-json-viewer-search-bar-container" role="search">
      <div class="cd-json-viewer-search-bar">
        <Input
          bind:this={searchInputRef}
          class="cd-json-viewer-search-bar-input"
          value={searchText}
          placeholder={loc().t('JsonViewer.search')}
          ariaLabel={loc().t('JsonViewer.search')}
          onChange={(v) => {
            searchText = v;
            runSearch();
            // 内核 search() 抢焦点 → 还给搜索框（对齐 Semi）。
            refocusSearch();
          }}
        />
        <ul class="cd-json-viewer-search-options">
          <li
            class="cd-json-viewer-search-options-item"
            class:cd-json-viewer-search-options-item-active={caseSensitive}
          >
            <IconCaseSensitive
              role="button"
              aria-label={loc().t('JsonViewer.caseSensitive')}
              aria-pressed={caseSensitive}
              onclick={toggleCase}
            />
          </li>
          <li
            class="cd-json-viewer-search-options-item"
            class:cd-json-viewer-search-options-item-active={useRegex}
          >
            <IconRegExp
              role="button"
              aria-label={loc().t('JsonViewer.regex')}
              aria-pressed={useRegex}
              onclick={toggleRegex}
            />
          </li>
          <li
            class="cd-json-viewer-search-options-item"
            class:cd-json-viewer-search-options-item-active={wholeWord}
          >
            <IconWholeWord
              role="button"
              aria-label={loc().t('JsonViewer.wholeWord')}
              aria-pressed={wholeWord}
              onclick={toggleWord}
            />
          </li>
        </ul>
        <ButtonGroup>
          <Button icon={iconPrev} ariaLabel={loc().t('JsonViewer.prev')} onclick={() => prevSearch()} />
          <Button icon={iconNext} ariaLabel={loc().t('JsonViewer.next')} onclick={() => nextSearch()} />
        </ButtonGroup>
        <Button
          icon={iconClose}
          size="small"
          theme="borderless"
          type="tertiary"
          ariaLabel={loc().t('JsonViewer.closeSearch')}
          onclick={closeSearch}
        />
      </div>

      {#if !readOnly}
        <div class="cd-json-viewer-replace-bar">
          <Input
            class="cd-json-viewer-replace-bar-input"
            value={replaceText}
            placeholder={loc().t('JsonViewer.replaceInput')}
            ariaLabel={loc().t('JsonViewer.replaceInput')}
            onChange={(v) => (replaceText = v)}
          />
          <Button onclick={() => replace(replaceText)}>{loc().t('JsonViewer.replace')}</Button>
          <Button onclick={() => replaceAll(replaceText)}>{loc().t('JsonViewer.replaceAll')}</Button>
        </div>
      {/if}
    </div>
  {/if}

  <div
    bind:this={editorEl}
    class="cd-json-viewer-editor"
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
  /* 外层容器（对齐 Semi 最外层 relative div）：只负责定位/边框/背景，
     承载搜索栏浮层（absolute）；height/padding 落在内核挂载层（-editor）。 */
  .cd-json-viewer {
    position: relative;
    box-sizing: border-box;
    inline-size: var(--cd-json-viewer-width, 100%);
    color: var(--cd-color-json-viewer-text);
    font-family: var(--cd-font-json-viewer-fontfamily);
    font-size: var(--cd-font-json-viewer-fontsize);
    /* 不设 overflow:hidden：对齐 Semi 最外层 relative div，让搜索栏浮层可溢出编辑器显示
       （458px 宽 + 两行的搜索栏否则被裁）。边框/背景/圆角/裁剪落在内核挂载层 -editor。 */
  }

  /* 内核挂载层（对齐 Semi .semi-json-viewer-background）：height=传入值 + padding:12px 0
     （border-box）→ 内核 json-viewer-container 填充剩余内容区（height - 24）。走 token 公式。 */
  .cd-json-viewer-editor {
    box-sizing: border-box;
    block-size: var(--cd-json-viewer-height, 400px);
    padding: var(--cd-spacing-json-viewer-paddingY) 0;
    /* 边框/背景/圆角落在内核挂载层（视觉容器），overflow:auto 兼作圆角裁剪；
       外层不裁，搜索栏浮层可溢出。 */
    background: var(--cd-color-json-viewer-bg);
    border: 1px solid var(--cd-color-json-viewer-border);
    border-radius: var(--cd-radius-json-viewer);
    overflow: auto;
  }

  .cd-json-viewer-editor[data-loading='true'],
  .cd-json-viewer-editor[data-error='true'] {
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--cd-color-json-viewer-line-number);
  }

  .cd-json-viewer-editor[data-error='true'] {
    color: var(--cd-color-json-viewer-error);
  }

  /* —— 搜索入口按钮 —— */
  .cd-json-viewer-toolbar-slot {
    position: absolute;
    inset-block-start: var(--cd-spacing-json-viewer-toolbar-padding);
    inset-inline-end: var(--cd-spacing-json-viewer-toolbar-padding);
    z-index: 1;
  }

  /* 搜索触发器改用 Button(theme=light type=primary)（对齐 Semi），
     样式由 Button 组件自带，此处不再自造裸按钮样式。 */

  /* —— 搜索/替换浮层（逐值对齐 Semi jsonViewer.scss） —— */
  /* search-bar-container：width 458 / padding 8 / gap 8 / border / radius small / bg-0 / flex column
     （Semi renderSearchBox inline style: absolute top:20 right:20）。 */
  .cd-json-viewer-search-bar-container {
    position: absolute;
    inset-block-start: 20px;
    inset-inline-end: 20px;
    z-index: 2;
    box-sizing: border-box;
    inline-size: 458px;
    max-inline-size: calc(100% - 40px);
    display: flex;
    flex-direction: column;
    gap: var(--cd-spacing-json-viewer-toolbar-padding);
    padding: var(--cd-spacing-json-viewer-toolbar-padding);
    background-color: var(--cd-color-json-viewer-toolbar-bg);
    border: 1px solid var(--cd-color-json-viewer-toolbar-border);
    border-radius: var(--cd-radius-json-viewer-toolbar);
  }

  .cd-json-viewer-search-bar,
  .cd-json-viewer-replace-bar {
    display: flex;
    align-items: flex-start;
    gap: var(--cd-spacing-json-viewer-toolbar-padding);
  }

  /* Semi: search-bar-input width 200!important / replace-bar-input width 261 */
  .cd-json-viewer-search-bar :global(.cd-json-viewer-search-bar-input) {
    inline-size: 200px;
    flex-shrink: 0;
  }
  .cd-json-viewer-replace-bar :global(.cd-json-viewer-replace-bar-input) {
    inline-size: 261px;
  }
  /* prev / next icon button 40px（Semi search-bar .semi-button:nth-of-type(1/2)） */
  .cd-json-viewer-search-bar :global(.cd-button-group) {
    flex-wrap: nowrap;
  }
  .cd-json-viewer-search-bar :global(.cd-button-group .cd-button) {
    inline-size: 40px;
  }

  /* search-options：ul flex center gap 8，无 list padding/margin */
  .cd-json-viewer-search-options {
    display: flex;
    align-items: center;
    justify-content: center;
    list-style: none;
    padding-inline-start: 0;
    margin-block: 0;
    gap: var(--cd-spacing-json-viewer-toolbar-padding);
  }
  /* search-options-item：min-width 32 / height 32 / flex center / radius / color text-2（走 token 公式） */
  .cd-json-viewer-search-options-item {
    min-inline-size: 32px;
    block-size: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    border-radius: var(--cd-radius-json-viewer-toolbar);
    color: var(--cd-color-json-viewer-search-options-item);
  }
  .cd-json-viewer-search-options-item:hover {
    background-color: var(--cd-color-json-viewer-search-options-item-hover);
  }
  .cd-json-viewer-search-options-item-active {
    color: var(--cd-color-json-viewer-search-options-item-active-text);
    background-color: var(--cd-color-json-viewer-search-options-item-active-bg);
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
