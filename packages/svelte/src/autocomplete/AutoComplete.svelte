<!--
  AutoComplete — 严格对齐 Semi Design（semi-ui/autoComplete）。
  输入联想 + 键盘选择。Token-driven, a11y-correct (combobox + listbox)。

  对齐 Semi 要点：
  - 组件本身不做本地过滤：data 由用户按 query 准备（远程或本地皆同）。是否远程由 onSearch 存在决定。
  - 下拉列表根 class = cd-autocomplete-option-list（对齐 Semi semi-autocomplete-option-list）。
  - 选项包 cd-autocomplete-option-text 层，字符串候选经 <Highlight> 高亮命中的输入词
    （高亮 tag = cd-autocomplete-option-keyword，对齐 Semi option.tsx renderOptionContent）。
  - loading 复用本库 <Spin>，外层 cd-autocomplete-loading-wrapper（对齐 Semi renderLoading）。
  - defaultActiveFirstOption 默认 false、maxHeight 默认 300、zIndex 默认走 token（对齐 Semi defaultProps）。

  暂缓（本轮保留自绘）：
  - 触发器未复用本库 <Input>：本库 Input 尚无 combobox 相关 aria 透传能力
    （role=combobox / aria-expanded / aria-controls / aria-activedescendant / aria-autocomplete
    无法设到其原生 input 上），而这些是 autoComplete a11y 契约（测试与 a11y.spec 强约束）。
    直接给 Input 加这些属于跨组件改动，故本轮保留自绘 combobox 输入框，待 Input 补 aria 透传后复用。
  - 下拉浮层用 use:floating（与本库 Select 同架构）承载，未包 <Popover>：Popover 的 .cd-popover 卡片
    结构/内边距面向气泡卡而非选项列表，Select 亦直接用 use:floating；保持二者一致的 -option-list 结构。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { useId, useDismiss } from '@chenzy-design/core';
  import { IconClear } from '@chenzy-design/icons';
  import { useLocale } from '../locale-provider/index.js';
  import { floating } from '../_floating/use-floating.js';
  import Spin from '../spin/Spin.svelte';
  import Highlight from '../highlight/Highlight.svelte';

  type ItemValue = string | number;
  type Item = ItemValue | { value: ItemValue; label?: string; disabled?: boolean };
  type NormalizedItem = { value: ItemValue; label: string; disabled: boolean };
  type Size = 'small' | 'large' | 'default';
  type ValidateStatus = 'default' | 'warning' | 'error';
  type Position = 'bottomLeft' | 'bottomRight' | 'topLeft' | 'topRight';

  interface Props {
    /** 受控输入值（string | number）。 */
    value?: ItemValue;
    /** 非受控初始值。 */
    defaultValue?: ItemValue;
    /** 候选数据（对齐 Semi data，由用户按 query 准备，组件不做本地过滤）。 */
    data?: Item[];
    /** 非受控初始展开。 */
    defaultOpen?: boolean;
    placeholder?: string;
    /** combobox 输入框可访问名；缺省回退到 placeholder 或 locale 默认。 */
    ariaLabel?: string;
    /** 关联外部 label 的 id（优先于 ariaLabel）。 */
    ariaLabelledby?: string;
    /** 输入框内嵌前缀标签。 */
    insetLabel?: string | Snippet;
    /** 内嵌标签 id（关联到 combobox 可访问名，对齐 Semi insetLabelId）。 */
    insetLabelId?: string;
    size?: Size;
    /** 校验状态（对齐 Semi validateStatus）。 */
    validateStatus?: ValidateStatus;
    disabled?: boolean;
    /** 打开浮层时默认高亮首个可用选项（对齐 Semi 默认 false）。 */
    defaultActiveFirstOption?: boolean;
    /** 远程搜索：输入回调（由外部更新 data）。提供即视为远程模式。 */
    onSearch?: (query: string) => void;
    /** 远程加载中（显示 Spin）。 */
    loading?: boolean;
    /** 值变化回调（对齐 Semi (value: string|number)）。 */
    onChange?: (value: ItemValue) => void;
    /** 选中候选项回调；onSelectWithObject=true 时入参为完整对象，否则为 value。 */
    onSelect?: (value: ItemValue | NormalizedItem) => void;
    /** 为 true 时 onSelect 回调入参从 value 变为完整候选对象 { value, label, disabled }（对齐 Semi）。 */
    onSelectWithObject?: boolean;
    /** 浮层显隐切换回调（对齐 Semi onDropdownVisibleChange）。 */
    onDropdownVisibleChange?: (visible: boolean) => void;
    /** 浮层宽度与触发器同宽（默认 true）。 */
    dropdownMatchSelectWidth?: boolean;
    /** 浮层挂载容器。 */
    getPopupContainer?: () => HTMLElement;
    /** 浮层 className。 */
    dropdownClassName?: string;
    /** 浮层样式。 */
    dropdownStyle?: string | Record<string, string>;
    /** 完全自定义触发器。 */
    triggerRender?: Snippet<[{ value: string; placeholder: string; disabled: boolean }]>;
    /** 自定义候选项渲染。 */
    renderItem?: Snippet<[{ item: NormalizedItem; isSelected: boolean }]>;
    /** 自定义已选项显示（仅 string，对齐 Semi renderSelectedItem）。 */
    renderSelectedItem?: Snippet<[{ item: NormalizedItem }]>;
    /** 无候选时展示内容。 */
    emptyContent?: Snippet | string;
    /** 输入框前缀。 */
    prefix?: Snippet | string;
    /** 输入框后缀。 */
    suffix?: Snippet | string;
    /** 显示清除按钮（对齐 Semi showClear）。 */
    showClear?: boolean;
    /** 自定义清除图标。 */
    clearIcon?: Snippet;
    onBlur?: (e: FocusEvent) => void;
    onFocus?: (e: FocusEvent) => void;
    onClear?: () => void;
    /** 挂载自动聚焦。 */
    autoFocus?: boolean;
    /** 浮层位置。 */
    position?: Position;
    /** 透传键盘原始事件（在内部键盘逻辑之前调用）。 */
    onKeyDown?: (e: KeyboardEvent) => void;
    /** 根节点自定义 class。 */
    class?: string;
    /** 根节点自定义 style。 */
    style?: string;
    /** 浮层最大高度（number→px，string 原样），默认 300（对齐 Semi）。 */
    maxHeight?: number | string;
    /** 浮层 z-index，覆盖默认 token。 */
    zIndex?: number;
  }

  let {
    value,
    defaultValue = '',
    data = [],
    defaultOpen = false,
    placeholder = '',
    ariaLabel,
    ariaLabelledby,
    insetLabel,
    insetLabelId,
    size = 'default',
    validateStatus = 'default',
    disabled = false,
    defaultActiveFirstOption = false,
    onSearch,
    loading = false,
    onChange,
    onSelect,
    onSelectWithObject = false,
    onDropdownVisibleChange,
    dropdownMatchSelectWidth = true,
    getPopupContainer,
    dropdownClassName,
    dropdownStyle,
    triggerRender,
    renderItem,
    renderSelectedItem,
    emptyContent,
    prefix,
    suffix,
    showClear = false,
    clearIcon,
    onBlur,
    onFocus,
    onClear,
    autoFocus = false,
    position = 'bottomLeft',
    onKeyDown,
    class: className = '',
    style = '',
    maxHeight = 300,
    zIndex,
  }: Props = $props();

  const loc = useLocale();

  const listId = useId('cd-autocomplete-list');

  // --- 受控值 (红线 #1): 不无条件回写 value，仅 onChange ---
  const isValueControlled = $derived(value !== undefined);
  let innerValue = $state<ItemValue>(getInitialValue());
  const currentValue = $derived<ItemValue>(isValueControlled ? (value ?? '') : innerValue);

  function getInitialValue(): ItemValue {
    return defaultValue;
  }
  // 输入框回显文本（number 值转字符串）。
  const displayValue = $derived(String(currentValue ?? ''));

  function setValue(next: ItemValue) {
    if (!isValueControlled) innerValue = next;
    onChange?.(next);
  }

  // --- 非受控 open (对齐 Semi：无受控 open，仅 defaultOpen + onDropdownVisibleChange) ---
  let innerOpen = $state(getInitialOpen());
  const isOpen = $derived(innerOpen);

  function getInitialOpen(): boolean {
    return defaultOpen;
  }

  function setOpen(next: boolean) {
    if (next === isOpen) return;
    innerOpen = next;
    onDropdownVisibleChange?.(next);
    if (!next) activeIndex = -1;
  }

  function normalize(it: Item): NormalizedItem {
    if (typeof it === 'string' || typeof it === 'number') {
      return { value: it, label: String(it), disabled: false };
    }
    return { value: it.value, label: it.label ?? String(it.value), disabled: it.disabled ?? false };
  }

  // 候选序列：仅归一化，不做本地过滤（对齐 Semi：data 由用户按 query 准备）。
  const options = $derived<NormalizedItem[]>(data.map(normalize));

  // --- roving 高亮 (红线 #2): activeIndex 本地 $state ---
  let activeIndex = $state(-1);

  const activeOptionId = $derived(
    activeIndex >= 0 && activeIndex < options.length
      ? `${listId}-opt-${activeIndex}`
      : undefined,
  );

  // 展开且（有候选 或 加载中）时才展示浮层。
  const showDropdown = $derived(isOpen && (options.length > 0 || loading));

  const showClearBtn = $derived(showClear && !disabled && displayValue.length > 0);

  // 已选项：options 里找到与 currentValue 匹配的项（用于 renderSelectedItem）。
  const selectedItem = $derived(options.find((o) => o.label === displayValue) ?? null);

  function firstEnabledIndex(): number {
    return options.findIndex((o) => !o.disabled);
  }

  function openWithOptions() {
    setOpen(true);
    if (defaultActiveFirstOption) activeIndex = firstEnabledIndex();
  }

  function handleInput(e: Event & { currentTarget: HTMLInputElement }) {
    const next = e.currentTarget.value;
    setValue(next);
    openWithOptions();
    // 远程：外部按 query 更新 data（受控红线 #1：仅回调，不回写）。
    onSearch?.(next);
  }

  function handleFocus(e: FocusEvent) {
    onFocus?.(e);
  }

  function handleBlur(e: FocusEvent) {
    onBlur?.(e);
  }

  function commit(opt: NormalizedItem) {
    if (opt.disabled || disabled) return;
    setValue(opt.value);
    onSelect?.(onSelectWithObject ? opt : opt.value);
    setOpen(false);
  }

  function clearAll() {
    if (disabled) return;
    setValue('');
    setOpen(false);
    onClear?.();
  }

  function moveActive(delta: number) {
    const len = options.length;
    if (len === 0) return;
    let next = activeIndex;
    for (let i = 0; i < len; i += 1) {
      next = (next + delta + len) % len;
      if (!options[next]?.disabled) {
        activeIndex = next;
        return;
      }
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    onKeyDown?.(e);
    if (disabled) return;
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (!isOpen) openWithOptions();
        else moveActive(1);
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (!isOpen) openWithOptions();
        else moveActive(-1);
        break;
      case 'Enter':
        if (isOpen && activeIndex >= 0) {
          e.preventDefault();
          const opt = options[activeIndex];
          if (opt) commit(opt);
        }
        break;
      case 'Escape':
        if (isOpen) {
          e.preventDefault();
          setOpen(false);
        }
        break;
      default:
        break;
    }
  }

  // autoFocus：命令式聚焦一次（红线 #3，SSR 安全）。
  let inputEl = $state<HTMLInputElement | null>(null);
  $effect(() => {
    if (autoFocus && inputEl && !disabled) {
      inputEl.focus();
    }
  });

  // --- useDismiss (红线 #3): open 时绑、cleanup 解绑 ---
  let rootEl = $state<HTMLDivElement | null>(null);
  // 浮层经 use:floating portal 到 body，列入 extraTargets 避免误判 outsideClick。
  let dropdownEl = $state<HTMLDivElement | null>(null);

  $effect(() => {
    if (!isOpen || !rootEl) return;
    const cleanup = useDismiss(rootEl, {
      onDismiss: () => setOpen(false),
      escape: true,
      outsideClick: true,
      extraTargets: [dropdownEl],
    });
    return cleanup;
  });

  const dropdownStyleStr = $derived.by(() => {
    if (!dropdownStyle) return '';
    if (typeof dropdownStyle === 'string') return dropdownStyle;
    return Object.entries(dropdownStyle).map(([k, v]) => `${k}: ${v}`).join('; ');
  });

  const dropdownPlacement = $derived(
    (
      {
        bottomLeft: 'bottomStart',
        bottomRight: 'bottomEnd',
        topLeft: 'topStart',
        topRight: 'topEnd',
      } as const
    )[position],
  );

  const cls = $derived(
    [
      'cd-autocomplete',
      `cd-autocomplete--${size}`,
      `cd-autocomplete--${validateStatus}`,
      disabled && 'cd-autocomplete--disabled',
      isOpen && 'cd-autocomplete--open',
      className,
    ]
      .filter(Boolean)
      .join(' '),
  );

  // 浮层最大高度：number→px，string 原样（对齐 Semi maxHeight 默认 300）。
  const maxHeightStyle = $derived.by(() => {
    const v = typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight;
    return `max-block-size: ${v}`;
  });

  const zIndexStyle = $derived(zIndex === undefined ? '' : `z-index: ${zIndex}`);

  // combobox 输入框可访问名：ariaLabelledby > ariaLabel > placeholder(非空) > locale 默认
  const inputAriaLabel = $derived(
    ariaLabelledby ? undefined : (ariaLabel || placeholder || loc().t('AutoComplete.ariaLabel')),
  );

  // insetLabel 存在且有 id 时，纳入 combobox 的 aria-labelledby。
  const resolvedLabelledby = $derived(
    [ariaLabelledby, insetLabel !== undefined && insetLabelId ? insetLabelId : undefined]
      .filter(Boolean)
      .join(' ') || undefined,
  );
</script>

{#snippet optionRow(opt: NormalizedItem, i: number)}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <div
    class="cd-autocomplete-option"
    class:cd-autocomplete-option-focused={i === activeIndex}
    class:cd-autocomplete-option-selected={opt.label === displayValue}
    class:cd-autocomplete-option-disabled={opt.disabled}
    id={`${listId}-opt-${i}`}
    role="option"
    aria-selected={i === activeIndex}
    aria-disabled={opt.disabled || undefined}
    tabindex="-1"
    onpointerenter={() => {
      if (!opt.disabled) activeIndex = i;
    }}
    onclick={() => commit(opt)}
  >
    {#if renderItem}
      {@render renderItem({ item: opt, isSelected: opt.label === displayValue })}
    {:else}
      <div class="cd-autocomplete-option-text">
        {#if displayValue}
          <Highlight
            sourceString={opt.label}
            searchWords={[displayValue]}
            highlightClassName="cd-autocomplete-option-keyword"
          />
        {:else}
          {opt.label}
        {/if}
      </div>
    {/if}
  </div>
{/snippet}

<div class={cls} style={style || undefined} bind:this={rootEl}>
  {#if triggerRender}
    {@render triggerRender({ value: displayValue, placeholder, disabled })}
  {:else}
    <div class="cd-autocomplete__control">
      {#if prefix}
        <span class="cd-autocomplete__prefix">
          {#if typeof prefix === 'string'}{prefix}{:else}{@render prefix()}{/if}
        </span>
      {/if}
      {#if insetLabel}
        <span class="cd-autocomplete__inset-label" id={insetLabelId}>
          {#if typeof insetLabel === 'string'}{insetLabel}{:else}{@render insetLabel()}{/if}
        </span>
      {/if}
      <input
        class="cd-autocomplete__input"
        bind:this={inputEl}
        type="text"
        role="combobox"
        value={displayValue}
        {placeholder}
        {disabled}
        aria-label={inputAriaLabel}
        aria-labelledby={resolvedLabelledby}
        aria-expanded={showDropdown}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={activeOptionId}
        aria-invalid={validateStatus === 'error' || undefined}
        oninput={handleInput}
        onkeydown={handleKeydown}
        onfocus={handleFocus}
        onblur={handleBlur}
      />

      {#if renderSelectedItem && selectedItem}
        <span class="cd-autocomplete__selected">
          {@render renderSelectedItem({ item: selectedItem })}
        </span>
      {/if}

      {#if showClearBtn}
        <button type="button" class="cd-autocomplete__clear" aria-label={loc().t('AutoComplete.clear')} onclick={clearAll}>
          {#if clearIcon}
            {@render clearIcon()}
          {:else}
            <IconClear aria-hidden="true" />
          {/if}
        </button>
      {/if}

      {#if suffix}
        <span class="cd-autocomplete__suffix">
          {#if typeof suffix === 'string'}{suffix}{:else}{@render suffix()}{/if}
        </span>
      {/if}
    </div>
  {/if}

  {#if showDropdown && rootEl}
    <div
      bind:this={dropdownEl}
      class={['cd-autocomplete-option-list', dropdownClassName].filter(Boolean).join(' ')}
      role="listbox"
      id={listId}
      aria-busy={loading || undefined}
      use:floating={{ trigger: rootEl, placement: dropdownPlacement, offset: 4, autoAdjust: true, padding: 8, matchWidth: dropdownMatchSelectWidth, open: showDropdown, getContainer: getPopupContainer }}
      style={[dropdownStyleStr, maxHeightStyle, zIndexStyle].filter(Boolean).join('; ')}
    >
      {#if loading}
        <div class="cd-autocomplete-loading-wrapper">
          <Spin size="small" />
        </div>
      {:else if options.length === 0}
        <div class="cd-autocomplete-option cd-autocomplete-option-empty">
          {#if emptyContent}
            {#if typeof emptyContent === 'string'}{emptyContent}{:else}{@render emptyContent()}{/if}
          {:else}
            {loc().t('AutoComplete.emptyText')}
          {/if}
        </div>
      {:else}
        {#each options as opt, i (opt.value)}
          {@render optionRow(opt, i)}
        {/each}
      {/if}
    </div>
  {/if}
</div>

<style>
  .cd-autocomplete {
    position: relative;
    display: inline-flex;
    inline-size: 100%;
    font-size: var(--cd-input-font-size);
  }
  /* 触发器输入框（暂缓复用 Input，自绘但外观复用 Input token） */
  .cd-autocomplete__control {
    display: flex;
    align-items: center;
    gap: var(--cd-spacing-tight);
    inline-size: 100%;
    block-size: var(--cd-height-input-default);
    padding-inline: var(--cd-input-padding-x);
    background: var(--cd-input-color-bg);
    border: 1px solid var(--cd-input-border);
    border-radius: var(--cd-input-radius);
    transition: border-color var(--cd-motion-duration-fast) var(--cd-motion-ease-standard);
  }
  .cd-autocomplete--small .cd-autocomplete__control {
    block-size: var(--cd-height-input-small);
  }
  .cd-autocomplete--large .cd-autocomplete__control {
    block-size: var(--cd-height-input-large);
  }
  .cd-autocomplete__control:focus-within {
    border-color: var(--cd-input-border-active);
    box-shadow: var(--cd-focus-ring);
  }
  .cd-autocomplete--warning .cd-autocomplete__control {
    border-color: var(--cd-input-border-warning);
  }
  .cd-autocomplete--error .cd-autocomplete__control {
    border-color: var(--cd-input-border-error);
  }
  .cd-autocomplete--disabled .cd-autocomplete__control {
    background: var(--cd-color-fill-0);
    color: var(--cd-color-disabled-text);
    cursor: not-allowed;
  }
  .cd-autocomplete__inset-label {
    display: inline-flex;
    align-items: center;
    flex: 0 0 auto;
    color: var(--cd-color-text-2);
    font-weight: var(--cd-autocomplete-inset-label-font-weight);
    user-select: none;
    white-space: nowrap;
  }
  .cd-autocomplete__prefix,
  .cd-autocomplete__suffix {
    display: inline-flex;
    align-items: center;
    flex: 0 0 auto;
    color: var(--cd-color-text-2);
    user-select: none;
    white-space: nowrap;
  }
  .cd-autocomplete__input {
    flex: 1 1 auto;
    inline-size: 100%;
    min-inline-size: 0;
    block-size: 100%;
    margin: 0;
    padding: 0;
    border: none;
    background: transparent;
    color: inherit;
    font: inherit;
    outline: none;
  }
  .cd-autocomplete__input::placeholder {
    color: var(--cd-input-color-placeholder);
  }
  .cd-autocomplete__input:disabled {
    cursor: not-allowed;
  }
  .cd-autocomplete__clear {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 auto;
    padding: 0;
    border: none;
    background: transparent;
    color: var(--cd-color-text-2);
    cursor: pointer;
  }
  .cd-autocomplete__clear:hover {
    color: var(--cd-color-text-0);
  }
  .cd-autocomplete__selected {
    display: inline-flex;
    align-items: center;
    flex: 0 0 auto;
  }

  /* --- 下拉列表：对齐 Semi .semi-autocomplete-option-list --- */
  .cd-autocomplete-option-list {
    /* 定位由 use:floating 接管；此处只定义外观 + 滚动。 */
    z-index: var(--cd-z-popover);
    overflow-x: hidden;
    overflow-y: auto;
    padding-block: var(--cd-spacing-extra-tight);
    background: var(--cd-color-bg-3);
    border-radius: var(--cd-border-radius-medium);
    box-shadow: var(--cd-shadow-elevated);
  }
  /* 选项：对齐 Semi .semi-autocomplete-option */
  .cd-autocomplete-option {
    display: flex;
    flex-wrap: nowrap;
    align-items: center;
    position: relative;
    box-sizing: border-box;
    word-break: break-all;
    padding-inline-start: var(--cd-autocomplete-option-padding-left);
    padding-inline-end: var(--cd-autocomplete-option-padding-right);
    padding-block-start: var(--cd-autocomplete-option-padding-top);
    padding-block-end: var(--cd-autocomplete-option-padding-bottom);
    color: var(--cd-autocomplete-option-main-text);
    background-color: var(--cd-autocomplete-option-bg-default);
    border-radius: var(--cd-autocomplete-option-radius);
    cursor: pointer;
  }
  .cd-autocomplete-option:first-of-type {
    margin-block-start: var(--cd-autocomplete-option-first-margin-top);
  }
  .cd-autocomplete-option:last-of-type {
    margin-block-end: var(--cd-autocomplete-option-last-margin-bottom);
  }
  .cd-autocomplete-option:active {
    background-color: var(--cd-autocomplete-option-bg-active);
  }
  /* focused（键盘高亮 / 悬停）对齐 Semi .semi-autocomplete-option-focused */
  .cd-autocomplete-option-focused {
    background-color: var(--cd-autocomplete-option-bg-hover);
  }
  /* selected 对齐 Semi .semi-autocomplete-option-selected（加粗） */
  .cd-autocomplete-option-selected {
    font-weight: var(--cd-font-weight-bold);
  }
  .cd-autocomplete-option-disabled {
    color: var(--cd-autocomplete-option-disabled-text);
    cursor: not-allowed;
  }
  /* option-text 层对齐 Semi .semi-autocomplete-option-text */
  .cd-autocomplete-option-text {
    display: flex;
    flex-wrap: wrap;
    white-space: pre;
  }
  /* 关键词高亮对齐 Semi .semi-autocomplete-option-keyword（primary 色 + 600 字重） */
  :global(.cd-autocomplete-option-keyword) {
    color: var(--cd-autocomplete-option-keyword-text);
    background-color: inherit;
    font-weight: var(--cd-autocomplete-keyword-font-weight);
  }
  /* 空态：对齐 Semi .semi-autocomplete-option-empty（居中 + disabled 文字） */
  .cd-autocomplete-option-empty {
    justify-content: center;
    color: var(--cd-autocomplete-option-disabled-text);
    cursor: not-allowed;
  }
  /* 加载区：对齐 Semi .semi-autocomplete-loading-wrapper（复用 Spin） */
  .cd-autocomplete-loading-wrapper {
    display: flex;
    justify-content: center;
    padding-block-start: var(--cd-autocomplete-loading-wrapper-padding-top);
    padding-block-end: var(--cd-autocomplete-loading-wrapper-padding-bottom);
    cursor: not-allowed;
  }
  @media (prefers-reduced-motion: reduce) {
    .cd-autocomplete__control {
      transition: none;
    }
  }
</style>
