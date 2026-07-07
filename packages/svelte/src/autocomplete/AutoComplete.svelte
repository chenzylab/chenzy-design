<!--
  AutoComplete — see specs/components/input/AutoComplete.spec.md
  输入联想 + 本地过滤 + 键盘选择。Token-driven, a11y-correct (combobox + listbox)。
  remote：提供 onSearch 时输入防抖回调（searchDebounce ms），由外部更新 data；loading 显示 spinner。
  remote 模式本地不再过滤（外部已按 query 准备 data）。maxCount：建议项最多渲染条数（0=不限）。
  insetLabel：输入框内嵌前缀标签（string | Snippet）。openOnFocus：聚焦即展开建议列表。
  分组：data 支持 { label, options }[]，逻辑/键盘/maxCount 基于扁平序列（红线 #2 派生纯函数）。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { useId, useDismiss } from '@chenzy-design/core';
  import { useLocale } from '../locale-provider/index.js';

  type ItemValue = string | number;
  type Item = ItemValue | { value: ItemValue; label?: string; disabled?: boolean };
  /** 分组项：含 options 即为分组 */
  type ItemGroup = { label: string; options: Item[] };
  type ItemOrGroup = Item | ItemGroup;
  type NormalizedItem = { value: ItemValue; label: string; disabled: boolean };
  type Size = 'small' | 'default' | 'large';
  type Status = 'default' | 'warning' | 'error';
  type Position = 'bottomLeft' | 'bottomRight' | 'topLeft' | 'topRight';

  function isGroup(o: ItemOrGroup): o is ItemGroup {
    return typeof o === 'object' && o !== null && Array.isArray((o as ItemGroup).options);
  }

  interface Props {
    value?: string;
    defaultValue?: string;
    /** 候选数据；可含分组项 { label, options: [] } */
    data?: ItemOrGroup[];
    open?: boolean;
    defaultOpen?: boolean;
    placeholder?: string;
    /** combobox 输入框可访问名；缺省回退到 placeholder 或 locale 默认 */
    ariaLabel?: string;
    /** 关联外部 label 的 id（优先于 ariaLabel） */
    ariaLabelledby?: string;
    /** 输入框内嵌前缀标签 */
    insetLabel?: string | Snippet;
    /** 聚焦即展开建议列表（默认 false，仅输入时展开） */
    openOnFocus?: boolean;
    size?: Size;
    status?: Status;
    disabled?: boolean;
    filter?: boolean;
    defaultActiveFirstOption?: boolean;
    clearable?: boolean;
    /** 远程搜索：输入防抖后回调（由外部更新 data，本地不再过滤） */
    onSearch?: (query: string) => void;
    /** 远程加载中（显示 spinner） */
    loading?: boolean;
    /** onSearch 防抖毫秒（默认 300） */
    searchDebounce?: number;
    /** 建议项最多渲染条数（0=不限制） */
    maxCount?: number;
    onChange?: (v: string) => void;
    /** onSelectWithObject 为 true 时入参为完整对象，否则为 value */
    onSelect?: (value: ItemValue | NormalizedItem) => void;
    /** 为 true 时 onSelect 回调入参从 value 变为完整候选对象 { value, label, disabled } */
    onSelectWithObject?: boolean;
    onOpenChange?: (open: boolean) => void;
    /** 浮层宽度与触发器同宽（默认 true） */
    dropdownMatchSelectWidth?: boolean;
    /** 浮层挂载容器 */
    getPopupContainer?: () => HTMLElement;
    /** 浮层 className */
    dropdownClassName?: string;
    /** 浮层样式 */
    dropdownStyle?: string | Record<string, string>;
    /** 完全自定义触发器 */
    triggerRender?: Snippet<[{ value: string; placeholder: string; disabled: boolean }]>;
    /** 自定义候选项渲染 */
    renderItem?: Snippet<[{ item: NormalizedItem; isSelected: boolean }]>;
    /** 自定义已选项显示 */
    renderSelectedItem?: Snippet<[{ item: NormalizedItem }]>;
    /** 无候选时展示内容 */
    emptyContent?: Snippet | string;
    /** 输入框前缀 */
    prefix?: Snippet | string;
    /** 输入框后缀 */
    suffix?: Snippet | string;
    /** 显示清除按钮（clearable 的别名，showClear 优先） */
    showClear?: boolean;
    /** 自定义清除图标 */
    clearIcon?: Snippet;
    onBlur?: (e: FocusEvent) => void;
    onFocus?: (e: FocusEvent) => void;
    onClear?: () => void;
    /** 显式远程模式（关闭本地过滤），不依赖 onSearch 是否存在 */
    remote?: boolean;
    /** 挂载自动聚焦 */
    autoFocus?: boolean;
    /** 浮层位置 */
    position?: Position;
    /** 透传键盘原始事件（在内部键盘逻辑之前调用） */
    onKeyDown?: (e: KeyboardEvent) => void;
    /** 根节点自定义 class */
    class?: string;
    /** 根节点自定义 style */
    style?: string;
    /** 浮层最大高度（number→px，string 原样），覆盖默认 16rem */
    maxHeight?: number | string;
    /** 浮层 z-index，覆盖默认 token */
    zIndex?: number;
  }

  let {
    value = $bindable(),
    defaultValue = '',
    data = [],
    open = $bindable(),
    defaultOpen = false,
    placeholder = '',
    ariaLabel,
    ariaLabelledby,
    insetLabel,
    openOnFocus = false,
    size = 'default',
    status = 'default',
    disabled = false,
    filter = true,
    defaultActiveFirstOption = true,
    clearable = false,
    onSearch,
    loading = false,
    searchDebounce = 300,
    maxCount = 0,
    onChange,
    onSelect,
    onSelectWithObject = false,
    onOpenChange,
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
    showClear,
    clearIcon,
    onBlur,
    onFocus,
    onClear,
    remote = false,
    autoFocus = false,
    position = 'bottomLeft',
    onKeyDown,
    class: className = '',
    style = '',
    maxHeight,
    zIndex,
  }: Props = $props();

  const loc = useLocale();

  const listId = useId('cd-autocomplete-list');

  // --- 受控值 (红线 #1): 不无条件回写 value，仅 onChange ---
  const isValueControlled = $derived(value !== undefined);
  let innerValue = $state(getInitialValue());
  const currentValue = $derived(isValueControlled ? (value ?? '') : innerValue);

  function getInitialValue(): string {
    return defaultValue;
  }

  function setValue(next: string) {
    if (!isValueControlled) innerValue = next;
    onChange?.(next);
  }

  // --- 受控 open (红线 #1): 不无条件回写 open，仅 onOpenChange ---
  const isOpenControlled = $derived(open !== undefined);
  let innerOpen = $state(getInitialOpen());
  const isOpen = $derived(isOpenControlled ? !!open : innerOpen);

  function getInitialOpen(): boolean {
    return defaultOpen;
  }

  function setOpen(next: boolean) {
    if (next === isOpen) return;
    if (!isOpenControlled) innerOpen = next;
    onOpenChange?.(next);
    if (!next) activeIndex = -1;
  }

  function normalize(it: Item): NormalizedItem {
    if (typeof it === 'string' || typeof it === 'number') {
      return { value: it, label: String(it), disabled: false };
    }
    return { value: it.value, label: it.label ?? String(it.value), disabled: it.disabled ?? false };
  }

  // remote 模式：外部已按 query 更新 data，本地不再过滤。
  // remote prop 显式开启时也禁用本地过滤，无需 onSearch。
  const isRemote = $derived(remote || onSearch !== undefined);

  // 是否含分组：决定渲染走分组结构还是扁平。
  const hasGroups = $derived(data.some(isGroup));

  // 过滤纯函数：复用于扁平序列与分组视图，保证两者一致。
  function matchOption(o: NormalizedItem): boolean {
    if (isRemote || !filter || currentValue === '') return true;
    const q = currentValue.toLowerCase();
    return (
      o.label.toLowerCase().includes(q) || String(o.value).toLowerCase().includes(q)
    );
  }

  // 候选条目：归一化 + 记录所属组（groupKey：组序号，无组为 -1），用于分组视图重组。
  type FlatItem = NormalizedItem & { groupKey: number };

  // 扁平候选序列（拍平分组并过滤/截断）——逻辑/键盘/maxCount/高亮统一基于它（红线 #2）。
  const options = $derived.by<FlatItem[]>(() => {
    const all: FlatItem[] = [];
    data.forEach((o, gi) => {
      if (isGroup(o)) {
        for (const child of o.options) all.push({ ...normalize(child), groupKey: gi });
      } else {
        all.push({ ...normalize(o), groupKey: -1 });
      }
    });
    const matched = all.filter(matchOption);
    return maxCount > 0 ? matched.slice(0, maxCount) : matched;
  });

  // 分组渲染视图：按原始组顺序聚合过滤后的候选 + 全局扁平索引（与 activeIndex 对齐）。
  // 仅 hasGroups 时使用；纯派生，无副作用（红线 #2）。
  const groupedView = $derived.by<{ key: number; label: string | null; items: { opt: FlatItem; flatIndex: number }[] }[]>(() => {
    if (!hasGroups) return [];
    const out: { key: number; label: string | null; items: { opt: FlatItem; flatIndex: number }[] }[] = [];
    options.forEach((opt, flatIndex) => {
      const label = opt.groupKey >= 0 ? (data[opt.groupKey] as ItemGroup).label : null;
      const last = out[out.length - 1];
      // 连续同组合并为同一段，保留原始相邻关系。
      if (last && last.key === opt.groupKey) {
        last.items.push({ opt, flatIndex });
      } else {
        out.push({ key: opt.groupKey, label, items: [{ opt, flatIndex }] });
      }
    });
    return out;
  });

  // --- roving 高亮 (红线 #2): activeIndex 本地 $state，不依赖挂载 registry ---
  let activeIndex = $state(-1);

  const activeOptionId = $derived(
    activeIndex >= 0 && activeIndex < options.length
      ? `${listId}-opt-${activeIndex}`
      : undefined,
  );

  // remote 模式下即便暂无候选也展开（显示 spinner / 空文案）；本地模式无候选则不展开。
  const showDropdown = $derived(isOpen && (options.length > 0 || isRemote));

  // showClear 优先，clearable 兜底；两者任一为 true 时显示清除按钮。
  const effectiveClearable = $derived(showClear ?? clearable);
  const showClearBtn = $derived(effectiveClearable && !disabled && currentValue.length > 0);

  // 已选项：options 里找到与 currentValue 匹配的 label 对应项。
  const selectedItem = $derived(
    options.find((o) => o.label === currentValue) ?? null,
  );

  function openWithOptions() {
    if (!isRemote && options.length === 0) {
      setOpen(false);
      return;
    }
    setOpen(true);
    if (defaultActiveFirstOption) activeIndex = firstEnabledIndex();
  }

  function firstEnabledIndex(): number {
    return options.findIndex((o) => !o.disabled);
  }

  // --- remote 搜索防抖（命令式定时器 + cleanup，红线 #3）---
  let searchTimer: ReturnType<typeof setTimeout> | undefined;
  function scheduleSearch(q: string) {
    if (searchTimer !== undefined) clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      searchTimer = undefined;
      onSearch?.(q);
    }, Math.max(0, searchDebounce));
  }
  // 卸载兜底清理。
  $effect(() => () => {
    if (searchTimer !== undefined) clearTimeout(searchTimer);
  });

  function handleInput(e: Event & { currentTarget: HTMLInputElement }) {
    const next = e.currentTarget.value;
    setValue(next);
    // 输入即打开浮层。openWithOptions 读取 derived options，
    // 它在本次更新已随 currentValue 变化；调用在事件处理器内，非 render 期。
    openWithOptions();
    // remote：防抖回调外部更新 data（受控值红线 #1：仅 onSearch，不回写）。
    if (onSearch) scheduleSearch(next);
  }

  function handleFocus(e: FocusEvent) {
    if (!disabled && openOnFocus) openWithOptions();
    onFocus?.(e);
  }

  function handleBlur(e: FocusEvent) {
    onBlur?.(e);
  }

  function commit(opt: NormalizedItem) {
    if (opt.disabled || disabled) return;
    setValue(opt.label);
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

  // --- useDismiss (红线 #3): 绑定放进 $effect，open 时绑、cleanup 解绑 ---
  let rootEl = $state<HTMLDivElement | null>(null);

  $effect(() => {
    if (!isOpen || !rootEl) return;
    const cleanup = useDismiss(rootEl, {
      onDismiss: () => setOpen(false),
      escape: true,
      outsideClick: true,
    });
    return cleanup;
  });

  // 浮层样式：dropdownMatchSelectWidth 时宽度与触发器同宽（inline-size: 100%）。
  const dropdownStyleStr = $derived.by(() => {
    const base = dropdownMatchSelectWidth ? 'inline-size: 100%' : '';
    if (!dropdownStyle) return base;
    if (typeof dropdownStyle === 'string') return base ? `${base}; ${dropdownStyle}` : dropdownStyle;
    const obj = Object.entries(dropdownStyle).map(([k, v]) => `${k}: ${v}`).join('; ');
    return base ? `${base}; ${obj}` : obj;
  });

  // 浮层位置映射到 CSS 定位。
  const dropdownPositionStyle = $derived.by(() => {
    switch (position) {
      case 'bottomRight':
        return 'inset-block-start: calc(100% + var(--cd-spacing-extra-tight)); inset-inline-end: 0; inset-inline-start: auto';
      case 'topLeft':
        return 'inset-block-end: calc(100% + var(--cd-spacing-extra-tight)); inset-block-start: auto; inset-inline-start: 0';
      case 'topRight':
        return 'inset-block-end: calc(100% + var(--cd-spacing-extra-tight)); inset-block-start: auto; inset-inline-end: 0; inset-inline-start: auto';
      default: // bottomLeft
        return '';
    }
  });

  const cls = $derived(
    [
      'cd-autocomplete',
      `cd-autocomplete--${size}`,
      `cd-autocomplete--${status}`,
      disabled && 'cd-autocomplete--disabled',
      isOpen && 'cd-autocomplete--open',
      className,
    ]
      .filter(Boolean)
      .join(' '),
  );

  // 浮层最大高度：number→px，string 原样，内联下发覆盖 CSS 默认（fallback 保留）。
  const maxHeightStyle = $derived.by(() => {
    if (maxHeight === undefined) return '';
    const v = typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight;
    return `max-block-size: ${v}`;
  });

  // 浮层 z-index：传入时内联覆盖默认 token。
  const zIndexStyle = $derived(zIndex === undefined ? '' : `z-index: ${zIndex}`);

  // combobox 输入框可访问名：ariaLabelledby > ariaLabel > placeholder(非空) > locale 默认
  const inputAriaLabel = $derived(
    ariaLabelledby ? undefined : (ariaLabel || placeholder || loc().t('AutoComplete.ariaLabel')),
  );
</script>

{#snippet optionRow(opt: NormalizedItem, i: number)}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <div
    class="cd-autocomplete__option"
    class:cd-autocomplete__option--active={i === activeIndex}
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
      {@render renderItem({ item: opt, isSelected: opt.label === currentValue })}
    {:else}
      {opt.label}
    {/if}
  </div>
{/snippet}

<div class={cls} style={style || undefined} bind:this={rootEl}>
  {#if triggerRender}
    {@render triggerRender({ value: currentValue, placeholder, disabled })}
  {:else}
    <div class="cd-autocomplete__control">
      {#if prefix}
        <span class="cd-autocomplete__prefix">
          {#if typeof prefix === 'string'}{prefix}{:else}{@render prefix()}{/if}
        </span>
      {/if}
      {#if insetLabel}
        <span class="cd-autocomplete__inset-label">
          {#if typeof insetLabel === 'string'}{insetLabel}{:else}{@render insetLabel()}{/if}
        </span>
      {/if}
      <input
        class="cd-autocomplete__input"
        bind:this={inputEl}
        type="text"
        role="combobox"
        value={currentValue}
        {placeholder}
        {disabled}
        aria-label={inputAriaLabel}
        aria-labelledby={ariaLabelledby}
        aria-expanded={showDropdown}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={activeOptionId}
        aria-invalid={status === 'error' || undefined}
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
            <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" focusable="false">
              <path
                fill="currentColor"
                d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1Zm2.5 9.1-1.4 1.4L8 9.4 6.5 11l-1.4-1.4L6.6 8 5.1 6.5 6.5 5.1 8 6.6 9.5 5.1l1.4 1.4L9.4 8l1.1 1.1Z"
              />
            </svg>
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

  {#if showDropdown}
    <div
      class={['cd-autocomplete__dropdown', dropdownClassName].filter(Boolean).join(' ')}
      role="listbox"
      id={listId}
      aria-busy={loading || undefined}
      style={[dropdownPositionStyle, dropdownStyleStr, maxHeightStyle, zIndexStyle].filter(Boolean).join('; ')}
    >
      {#if loading}
        <div class="cd-autocomplete__loading">
          <span class="cd-autocomplete__spinner" aria-hidden="true"></span>
          <span>{loc().t('AutoComplete.loading')}</span>
        </div>
      {/if}
      {#if options.length === 0 && !loading}
        <div class="cd-autocomplete__empty">
          {#if emptyContent}
            {#if typeof emptyContent === 'string'}{emptyContent}{:else}{@render emptyContent()}{/if}
          {:else}
            {loc().t('AutoComplete.emptyText')}
          {/if}
        </div>
      {:else if hasGroups}
        {#each groupedView as group, gi (group.label === null ? `g-${gi}` : `${group.key}-${group.label}`)}
          {#if group.label !== null}
            <div class="cd-autocomplete__group-label" role="presentation">{group.label}</div>
          {/if}
          {#each group.items as it (it.opt.value)}
            {@render optionRow(it.opt, it.flatIndex)}
          {/each}
        {/each}
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
    font-size: var(--cd-autocomplete-font-size);
  }
  .cd-autocomplete__control {
    display: flex;
    align-items: center;
    gap: var(--cd-spacing-tight);
    inline-size: 100%;
    block-size: var(--cd-autocomplete-control-height-default);
    padding-inline: var(--cd-autocomplete-control-padding-x);
    background: var(--cd-autocomplete-control-bg);
    border: 1px solid var(--cd-autocomplete-control-border);
    border-radius: var(--cd-autocomplete-control-radius);
    transition: border-color var(--cd-motion-duration-fast) var(--cd-motion-ease-standard);
  }
  .cd-autocomplete--small .cd-autocomplete__control {
    block-size: var(--cd-autocomplete-control-height-small);
  }
  .cd-autocomplete--large .cd-autocomplete__control {
    block-size: var(--cd-autocomplete-control-height-large);
  }
  .cd-autocomplete__control:focus-within {
    border-color: var(--cd-autocomplete-control-border-active);
    box-shadow: var(--cd-focus-ring);
  }
  .cd-autocomplete--warning .cd-autocomplete__control {
    border-color: var(--cd-autocomplete-control-border-warning);
  }
  .cd-autocomplete--error .cd-autocomplete__control {
    border-color: var(--cd-autocomplete-control-border-error);
  }
  .cd-autocomplete--disabled .cd-autocomplete__control {
    background: var(--cd-autocomplete-control-disabled-bg);
    color: var(--cd-autocomplete-control-disabled-text);
    cursor: not-allowed;
  }
  .cd-autocomplete__inset-label {
    display: inline-flex;
    align-items: center;
    flex: 0 0 auto;
    color: var(--cd-autocomplete-affix-text);
    user-select: none;
    white-space: nowrap;
  }
  .cd-autocomplete__prefix,
  .cd-autocomplete__suffix {
    display: inline-flex;
    align-items: center;
    flex: 0 0 auto;
    color: var(--cd-autocomplete-affix-text);
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
    color: var(--cd-autocomplete-placeholder-text);
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
    color: var(--cd-autocomplete-clear-text);
    cursor: pointer;
  }
  .cd-autocomplete__clear:hover {
    color: var(--cd-autocomplete-clear-text-hover);
  }
  .cd-autocomplete__selected {
    display: inline-flex;
    align-items: center;
    flex: 0 0 auto;
  }
  .cd-autocomplete__dropdown {
    position: absolute;
    inset-block-start: calc(100% + var(--cd-spacing-extra-tight));
    inset-inline: 0;
    z-index: var(--cd-autocomplete-dropdown-z);
    max-block-size: 16rem;
    overflow-y: auto;
    padding-block: var(--cd-spacing-extra-tight);
    background: var(--cd-autocomplete-dropdown-bg);
    border-radius: var(--cd-autocomplete-dropdown-radius);
    box-shadow: var(--cd-autocomplete-dropdown-shadow);
  }
  .cd-autocomplete__option {
    padding: var(--cd-autocomplete-option-padding);
    cursor: pointer;
  }
  .cd-autocomplete__option--active {
    background: var(--cd-autocomplete-option-bg-hover);
  }
  .cd-autocomplete__option[aria-disabled='true'] {
    color: var(--cd-autocomplete-option-disabled-text);
    cursor: not-allowed;
  }
  .cd-autocomplete__group-label {
    padding: var(--cd-spacing-extra-tight) var(--cd-autocomplete-option-padding, var(--cd-spacing-tight));
    color: var(--cd-autocomplete-group-label-text);
    font-size: var(--cd-font-size-small);
    font-weight: var(--cd-font-weight-medium, 500);
    user-select: none;
  }
  .cd-autocomplete__empty {
    padding: var(--cd-autocomplete-option-padding);
    color: var(--cd-autocomplete-empty-text);
    text-align: center;
  }
  .cd-autocomplete__loading {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--cd-spacing-tight);
    padding: var(--cd-autocomplete-option-padding);
    color: var(--cd-autocomplete-empty-text);
  }
  .cd-autocomplete__spinner {
    inline-size: 1em;
    block-size: 1em;
    border: 2px solid var(--cd-autocomplete-spinner-track);
    border-block-start-color: var(--cd-autocomplete-spinner-indicator);
    border-radius: var(--cd-border-radius-full);
    animation: cd-autocomplete-spin 0.7s linear infinite;
  }
  @keyframes cd-autocomplete-spin {
    to {
      transform: rotate(360deg);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .cd-autocomplete__control {
      transition: none;
    }
    .cd-autocomplete__spinner {
      animation: none;
    }
  }
</style>
