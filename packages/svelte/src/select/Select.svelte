<!--
  Select — see specs/components/input/Select.spec.md
  单选 / 多选 / 本地过滤 / 键盘导航 / 浮层。Token-driven, a11y-correct.
  下拉 portal 到 body + position:fixed（脱离 overflow:hidden 裁剪），matchWidth 跟随触发器宽度，flip 避让。
  maxTagCount：多选 tag 超出折叠为 +N。allowCreate：filter 无匹配时可创建新选项。
  分组：options 含 { label, options:[] } 时按组渲染组标题；逻辑/键盘/filter 基于扁平序列。
  remote：提供 onSearch 时输入防抖回调（searchDebounce ms），由外部更新 options；loading 显示 spinner。
  TODO(延后): 虚拟化。
-->
<script lang="ts">
  import { useId, useDismiss } from '@chenzy-design/core';
  import { useLocale } from '../locale-provider/index.js';
  import { floating } from '../_floating/use-floating.js';

  type OptionValue = string | number;
  type OptionData = { label: string; value: OptionValue; disabled?: boolean };
  /** 选项分组：含 options 即为分组项 */
  type OptionGroup = { label: string; options: OptionData[] };
  type OptionOrGroup = OptionData | OptionGroup;
  type Size = 'small' | 'default' | 'large';
  type Status = 'default' | 'warning' | 'error';

  function isGroup(o: OptionOrGroup): o is OptionGroup {
    return Array.isArray((o as OptionGroup).options);
  }

  interface Props {
    value?: OptionValue | OptionValue[];
    defaultValue?: OptionValue | OptionValue[];
    /** 选项；可含分组项 { label, options: [] } */
    options?: OptionOrGroup[];
    multiple?: boolean;
    filter?: boolean;
    open?: boolean;
    defaultOpen?: boolean;
    size?: Size;
    status?: Status;
    placeholder?: string;
    disabled?: boolean;
    clearable?: boolean;
    /** 多选 tag 最大显示数，超出折叠为 +N（0=不折叠） */
    maxTagCount?: number;
    /** filter 无匹配时允许创建新选项（值=输入文本） */
    allowCreate?: boolean;
    /** 远程搜索：输入防抖后回调（由外部更新 options，不再本地过滤） */
    onSearch?: (query: string) => void;
    /** 远程加载中（显示 spinner） */
    loading?: boolean;
    /** onSearch 防抖毫秒（默认 300） */
    searchDebounce?: number;
    onChange?: (v: OptionValue | OptionValue[]) => void;
    onOpenChange?: (open: boolean) => void;
  }

  let {
    value = $bindable(),
    defaultValue,
    options = [],
    multiple = false,
    filter = false,
    open = $bindable(),
    defaultOpen = false,
    size = 'default',
    status = 'default',
    placeholder,
    disabled = false,
    clearable = false,
    maxTagCount = 0,
    allowCreate = false,
    onSearch,
    loading = false,
    searchDebounce = 300,
    onChange,
    onOpenChange,
  }: Props = $props();

  const loc = useLocale();

  const listId = useId('cd-select-list');

  // --- 受控值 (红线 #1): 不无条件回写 value，仅 onChange ---
  const isValueControlled = $derived(value !== undefined);
  let innerValue = $state<OptionValue | OptionValue[] | undefined>(getInitialValue());
  const currentValue = $derived(isValueControlled ? value : innerValue);

  function getInitialValue(): OptionValue | OptionValue[] | undefined {
    return defaultValue;
  }

  const selectedValues = $derived<OptionValue[]>(
    normalizeSelected(currentValue),
  );

  function normalizeSelected(v: OptionValue | OptionValue[] | undefined): OptionValue[] {
    if (v === undefined) return [];
    return Array.isArray(v) ? v : [v];
  }

  function setValue(next: OptionValue | OptionValue[]) {
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
    if (!next) {
      activeIndex = -1;
      query = '';
    }
  }

  // --- 本地过滤搜索 ---
  let query = $state('');

  // 是否含分组：决定渲染走分组结构还是扁平。
  const hasGroups = $derived(options.some(isGroup));
  // 扁平选项序列（拍平分组）——逻辑/键盘/filter/回显统一基于它。
  const flatBase = $derived<OptionData[]>(
    options.flatMap((o) => (isGroup(o) ? o.options : [o])),
  );

  // allowCreate：本地已创建选项，合并进选项集供回显与列表（不写回 options prop）。
  let createdOptions = $state<OptionData[]>([]);
  const mergedOptions = $derived<OptionData[]>(
    createdOptions.length === 0 ? flatBase : [...flatBase, ...createdOptions],
  );

  // remote 模式：外部已按 query 更新 options，本地不再过滤。
  const isRemote = $derived(onSearch !== undefined);

  const filteredOptions = $derived.by(() => {
    if (isRemote) return mergedOptions;
    if (!filter || query.trim() === '') return mergedOptions;
    const q = query.toLowerCase();
    return mergedOptions.filter((o) => o.label.toLowerCase().includes(q));
  });

  // 分组渲染视图：每组过滤后的选项 + 全局扁平索引（用于 activeIndex 匹配）。
  // 仅在 hasGroups 时使用；createdOptions 归入末尾「（新建）」无组段。
  const groupedView = $derived.by<{ label: string | null; items: { opt: OptionData; flatIndex: number }[] }[]>(() => {
    if (!hasGroups) return [];
    const out: { label: string | null; items: { opt: OptionData; flatIndex: number }[] }[] = [];
    const indexOf = (opt: OptionData) => filteredOptions.indexOf(opt);
    for (const o of options) {
      if (isGroup(o)) {
        const items = o.options
          .filter((opt) => filteredOptions.includes(opt))
          .map((opt) => ({ opt, flatIndex: indexOf(opt) }));
        if (items.length > 0) out.push({ label: o.label, items });
      } else if (filteredOptions.includes(o)) {
        out.push({ label: null, items: [{ opt: o, flatIndex: indexOf(o) }] });
      }
    }
    // 已创建选项（无组）
    const created = createdOptions
      .filter((opt) => filteredOptions.includes(opt))
      .map((opt) => ({ opt, flatIndex: indexOf(opt) }));
    if (created.length > 0) out.push({ label: null, items: created });
    return out;
  });

  // 当前输入是否可创建新选项：allowCreate + filter 有输入 + 无 label 完全匹配。
  const canCreate = $derived(
    allowCreate &&
      filter &&
      query.trim() !== '' &&
      !mergedOptions.some((o) => o.label.toLowerCase() === query.trim().toLowerCase()),
  );

  function createOption() {
    const label = query.trim();
    if (!label) return;
    const opt: OptionData = { label, value: label };
    createdOptions = [...createdOptions, opt];
    selectOption(opt);
    query = '';
  }

  // --- roving 高亮 (红线 #2): activeIndex 为本地 $state，不依赖挂载 registry ---
  let activeIndex = $state(-1);

  const activeOptionId = $derived(
    activeIndex >= 0 && activeIndex < filteredOptions.length
      ? `${listId}-opt-${activeIndex}`
      : undefined,
  );

  const selectedOptions = $derived(
    mergedOptions.filter((o) => selectedValues.includes(o.value)),
  );
  // maxTagCount 折叠：显示前 N 个 tag + 隐藏数
  const visibleTags = $derived(
    maxTagCount > 0 ? selectedOptions.slice(0, maxTagCount) : selectedOptions,
  );
  const hiddenTagCount = $derived(
    maxTagCount > 0 ? Math.max(0, selectedOptions.length - maxTagCount) : 0,
  );

  const singleLabel = $derived(
    !multiple && selectedOptions.length > 0 ? selectedOptions[0]!.label : '',
  );

  const hasSelection = $derived(selectedValues.length > 0);
  const showClear = $derived(clearable && !disabled && hasSelection);

  function isSelected(v: OptionValue): boolean {
    return selectedValues.includes(v);
  }

  function selectOption(opt: OptionData) {
    if (opt.disabled || disabled) return;
    if (multiple) {
      const set = selectedValues.slice();
      const idx = set.indexOf(opt.value);
      if (idx === -1) set.push(opt.value);
      else set.splice(idx, 1);
      setValue(set);
      // 多选不关闭
    } else {
      setValue(opt.value);
      setOpen(false);
    }
  }

  function removeTag(v: OptionValue) {
    if (disabled) return;
    const set = selectedValues.filter((x) => x !== v);
    setValue(set);
  }

  function clearAll(e: MouseEvent) {
    e.stopPropagation();
    if (disabled) return;
    setValue(multiple ? [] : '');
  }

  function toggleOpen() {
    if (disabled) return;
    setOpen(!isOpen);
  }

  function moveActive(delta: number) {
    const len = filteredOptions.length;
    if (len === 0) return;
    let next = activeIndex;
    for (let i = 0; i < len; i += 1) {
      next = (next + delta + len) % len;
      if (!filteredOptions[next]?.disabled) {
        activeIndex = next;
        return;
      }
    }
  }

  function onTriggerKeydown(e: KeyboardEvent) {
    if (disabled) return;
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (!isOpen) setOpen(true);
        else moveActive(1);
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (!isOpen) setOpen(true);
        else moveActive(-1);
        break;
      case 'Enter':
        e.preventDefault();
        if (!isOpen) {
          setOpen(true);
        } else if (activeIndex >= 0) {
          const opt = filteredOptions[activeIndex];
          if (opt) selectOption(opt);
        } else if (canCreate) {
          createOption();
        }
        break;
      case ' ':
        // filter 输入时空格应输入到搜索框，不拦截
        if (!filter) {
          e.preventDefault();
          if (!isOpen) setOpen(true);
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

  function onSearchInput(e: Event & { currentTarget: HTMLInputElement }) {
    query = e.currentTarget.value;
    if (!isOpen) setOpen(true);
    activeIndex = -1;
    if (isRemote) scheduleSearch(query);
  }

  // --- DOM 引用：触发根 + portal 下拉（定位由 use:floating action 接管）---
  let rootEl = $state<HTMLDivElement | null>(null);
  let dropdownEl = $state<HTMLDivElement | null>(null);

  // --- useDismiss (红线 #3): dropdown portal 出 root 子树后列入 extraTargets ---
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

  const cls = $derived(
    [
      'cd-select',
      `cd-select--${size}`,
      `cd-select--${status}`,
      disabled && 'cd-select--disabled',
      isOpen && 'cd-select--open',
      multiple && 'cd-select--multiple',
    ]
      .filter(Boolean)
      .join(' '),
  );
</script>

<div class={cls} bind:this={rootEl}>
  <div
    class="cd-select__trigger"
    role="combobox"
    aria-expanded={isOpen}
    aria-haspopup="listbox"
    aria-controls={listId}
    aria-activedescendant={activeOptionId}
    aria-disabled={disabled || undefined}
    aria-invalid={status === 'error' || undefined}
    tabindex={disabled ? -1 : 0}
    onclick={toggleOpen}
    onkeydown={onTriggerKeydown}
  >
    <div class="cd-select__content">
      {#if multiple && selectedOptions.length > 0}
        {#each visibleTags as opt (opt.value)}
          <span class="cd-select__tag">
            <span class="cd-select__tag-label">{opt.label}</span>
            <button
              type="button"
              class="cd-select__tag-close"
              aria-label={loc().t('Select.removeItem', { label: opt.label })}
              onclick={(e) => {
                e.stopPropagation();
                removeTag(opt.value);
              }}
            >
              <svg viewBox="0 0 16 16" width="10" height="10" aria-hidden="true" focusable="false">
                <path
                  fill="currentColor"
                  d="M9.1 8l3.2-3.2-1.1-1.1L8 6.9 4.8 3.7 3.7 4.8 6.9 8l-3.2 3.2 1.1 1.1L8 9.1l3.2 3.2 1.1-1.1L9.1 8Z"
                />
              </svg>
            </button>
          </span>
        {/each}
        {#if hiddenTagCount > 0}
          <span class="cd-select__tag cd-select__tag--rest">+{hiddenTagCount}</span>
        {/if}
        {#if filter}
          <input
            class="cd-select__search"
            type="text"
            value={query}
            aria-label={loc().t('Select.searchPlaceholder')}
            oninput={onSearchInput}
            onkeydown={onTriggerKeydown}
            onclick={(e) => e.stopPropagation()}
          />
        {/if}
      {:else if filter}
        <input
          class="cd-select__search"
          type="text"
          value={query}
          placeholder={hasSelection ? singleLabel : (placeholder ?? loc().t('Select.placeholder'))}
          aria-label={loc().t('Select.searchPlaceholder')}
          oninput={onSearchInput}
          onkeydown={onTriggerKeydown}
          onclick={(e) => e.stopPropagation()}
        />
      {:else if hasSelection}
        <span class="cd-select__value">{singleLabel}</span>
      {:else}
        <span class="cd-select__placeholder">{placeholder ?? loc().t('Select.placeholder')}</span>
      {/if}
    </div>

    {#if showClear}
      <button
        type="button"
        class="cd-select__clear"
        aria-label={loc().t('Select.clear')}
        onclick={clearAll}
      >
        <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" focusable="false">
          <path
            fill="currentColor"
            d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1Zm2.5 9.1-1.4 1.4L8 9.4 6.5 11l-1.4-1.4L6.6 8 5.1 6.5 6.5 5.1 8 6.6 9.5 5.1l1.4 1.4L9.4 8l1.1 1.1Z"
          />
        </svg>
      </button>
    {/if}

    <span class="cd-select__arrow" aria-hidden="true">
      <svg viewBox="0 0 16 16" width="12" height="12" focusable="false">
        <path fill="currentColor" d="M3.5 6 8 10.5 12.5 6l-1-1L8 8.5 4.5 5l-1 1Z" />
      </svg>
    </span>
  </div>

  {#if isOpen}
    <div
      class="cd-select__dropdown"
      bind:this={dropdownEl}
      use:floating={{ trigger: rootEl, placement: 'bottomStart', autoAdjust: true, offset: 4, matchWidth: true }}
      role="listbox"
      id={listId}
      aria-multiselectable={multiple}
      aria-busy={loading || undefined}
    >
      {#if loading}
        <div class="cd-select__loading">
          <span class="cd-select__spinner" aria-hidden="true"></span>
          <span>{loc().t('Select.loading')}</span>
        </div>
      {/if}
      {#if canCreate}
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <div
          class="cd-select__option cd-select__option--create"
          role="option"
          aria-selected={false}
          tabindex="-1"
          onclick={createOption}
        >
          <span class="cd-select__option-label">{loc().t('Select.create', { label: query.trim() })}</span>
        </div>
      {/if}
      {#if filteredOptions.length === 0 && !canCreate && !loading}
        <div class="cd-select__empty">{loc().t('Select.emptyText')}</div>
      {:else if hasGroups}
        {#each groupedView as group, gi (group.label ?? `g-${gi}`)}
          {#if group.label !== null}
            <div class="cd-select__group-label" role="presentation">{group.label}</div>
          {/if}
          {#each group.items as it (it.opt.value)}
            {@render optionRow(it.opt, it.flatIndex)}
          {/each}
        {/each}
      {:else}
        {#each filteredOptions as opt, i (opt.value)}
          {@render optionRow(opt, i)}
        {/each}
      {/if}
    </div>
  {/if}
</div>

{#snippet optionRow(opt: OptionData, i: number)}
  <!-- 选项通过 combobox 的 roving + aria-activedescendant 键盘操作，无需自身键事件 -->
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <div
    class="cd-select__option"
    class:cd-select__option--active={i === activeIndex}
    class:cd-select__option--selected={isSelected(opt.value)}
    id={`${listId}-opt-${i}`}
    role="option"
    aria-selected={isSelected(opt.value)}
    aria-disabled={opt.disabled || undefined}
    tabindex="-1"
    onpointerenter={() => {
      if (!opt.disabled) activeIndex = i;
    }}
    onclick={() => selectOption(opt)}
  >
    {#if multiple}
      <span class="cd-select__check" aria-hidden="true">
        {#if isSelected(opt.value)}
          <svg viewBox="0 0 16 16" width="12" height="12" focusable="false">
            <path
              fill="currentColor"
              d="M6.2 11.2 2.9 7.9l1.1-1.1 2.2 2.2 5-5L12.3 5l-6.1 6.2Z"
            />
          </svg>
        {/if}
      </span>
    {/if}
    <span class="cd-select__option-label">{opt.label}</span>
  </div>
{/snippet}

<style>
  .cd-select {
    position: relative;
    display: inline-flex;
    inline-size: 100%;
    font-size: var(--cd-select-font-size);
  }
  .cd-select__trigger {
    display: flex;
    align-items: center;
    gap: var(--cd-spacing-2);
    inline-size: 100%;
    min-block-size: var(--cd-select-height-default);
    padding-inline: var(--cd-select-padding-x);
    background: var(--cd-select-bg);
    border: 1px solid var(--cd-select-border);
    border-radius: var(--cd-select-radius);
    cursor: pointer;
    transition: border-color var(--cd-motion-duration-fast) var(--cd-motion-ease-standard);
  }
  .cd-select--small .cd-select__trigger {
    min-block-size: var(--cd-select-height-small);
  }
  .cd-select--large .cd-select__trigger {
    min-block-size: var(--cd-select-height-large);
  }
  .cd-select__trigger:focus-visible {
    outline: none;
    border-color: var(--cd-select-border-active);
    box-shadow: var(--cd-focus-ring);
  }
  .cd-select--open .cd-select__trigger {
    border-color: var(--cd-select-border-active);
  }
  .cd-select--error .cd-select__trigger {
    border-color: var(--cd-select-border-error);
  }
  .cd-select--disabled .cd-select__trigger {
    background: var(--cd-color-fill-0);
    color: var(--cd-color-text-3);
    cursor: not-allowed;
  }
  .cd-select__content {
    display: flex;
    flex: 1 1 auto;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--cd-spacing-1);
    min-inline-size: 0;
  }
  .cd-select__placeholder {
    color: var(--cd-input-color-placeholder);
  }
  .cd-select__value {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  .cd-select__search {
    flex: 1 1 auto;
    min-inline-size: 2rem;
    margin: 0;
    padding: 0;
    border: none;
    background: transparent;
    color: inherit;
    font: inherit;
    outline: none;
  }
  .cd-select__search::placeholder {
    color: var(--cd-input-color-placeholder);
  }
  .cd-select__tag {
    display: inline-flex;
    align-items: center;
    gap: var(--cd-spacing-1);
    padding-inline: var(--cd-spacing-2);
    background: var(--cd-color-fill-1);
    border-radius: var(--cd-radius-1);
    font-size: var(--cd-font-size-1);
  }
  .cd-select__tag--rest {
    color: var(--cd-color-text-2);
  }
  .cd-select__option--create {
    color: var(--cd-color-primary);
  }
  .cd-select__tag-close {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    border: none;
    background: transparent;
    color: var(--cd-color-text-2);
    cursor: pointer;
  }
  .cd-select__tag-close:hover {
    color: var(--cd-color-text-0);
  }
  .cd-select__clear,
  .cd-select__arrow {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 auto;
    color: var(--cd-color-text-2);
  }
  .cd-select__clear {
    padding: 0;
    border: none;
    background: transparent;
    cursor: pointer;
  }
  .cd-select__clear:hover {
    color: var(--cd-color-text-0);
  }
  .cd-select__arrow {
    transition: transform var(--cd-motion-duration-fast) var(--cd-motion-ease-standard);
  }
  .cd-select--open .cd-select__arrow {
    transform: rotate(180deg);
  }
  /* 下拉 portal 到 body，由 JS 写 position:fixed + transform + matchWidth */
  .cd-select__dropdown {
    z-index: var(--cd-select-dropdown-z);
    max-block-size: 16rem;
    overflow-y: auto;
    padding-block: var(--cd-spacing-1);
    background: var(--cd-select-dropdown-bg);
    border-radius: var(--cd-select-dropdown-radius);
    box-shadow: var(--cd-select-dropdown-shadow);
  }
  .cd-select__group-label {
    padding: var(--cd-spacing-1) var(--cd-select-option-padding, var(--cd-spacing-2));
    color: var(--cd-color-text-3);
    font-size: var(--cd-font-size-1);
    font-weight: var(--cd-font-weight-medium, 500);
    user-select: none;
  }
  .cd-select__option {
    display: flex;
    align-items: center;
    gap: var(--cd-spacing-2);
    padding: var(--cd-select-option-padding);
    cursor: pointer;
  }
  .cd-select__option--active {
    background: var(--cd-select-option-bg-hover);
  }
  .cd-select__option--selected {
    color: var(--cd-select-option-color-selected);
    background: var(--cd-select-option-bg-active);
  }
  .cd-select__option[aria-disabled='true'] {
    color: var(--cd-color-text-3);
    cursor: not-allowed;
  }
  .cd-select__check {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    inline-size: 1rem;
    flex: 0 0 auto;
    color: var(--cd-select-option-color-selected);
  }
  .cd-select__empty {
    padding: var(--cd-select-option-padding);
    color: var(--cd-color-text-3);
    text-align: center;
  }
  .cd-select__loading {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--cd-spacing-2);
    padding: var(--cd-select-option-padding);
    color: var(--cd-color-text-3);
  }
  .cd-select__spinner {
    inline-size: 1em;
    block-size: 1em;
    border: 2px solid var(--cd-color-border);
    border-block-start-color: var(--cd-color-primary);
    border-radius: var(--cd-radius-full);
    animation: cd-select-spin 0.7s linear infinite;
  }
  @keyframes cd-select-spin {
    to {
      transform: rotate(360deg);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .cd-select__spinner {
      animation: none;
    }
    .cd-select__trigger,
    .cd-select__arrow {
      transition: none;
    }
  }
</style>
