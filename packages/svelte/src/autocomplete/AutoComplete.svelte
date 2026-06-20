<!--
  AutoComplete — see specs/components/input/AutoComplete.spec.md
  输入联想 + 本地过滤 + 键盘选择。Token-driven, a11y-correct (combobox + listbox)。
  remote：提供 onSearch 时输入防抖回调（searchDebounce ms），由外部更新 data；loading 显示 spinner。
  remote 模式本地不再过滤（外部已按 query 准备 data）。maxCount：建议项最多渲染条数（0=不限）。
  TODO(延后): insetLabel、triggerRender=focus、分组。
-->
<script lang="ts">
  import { useId, useDismiss } from '@chenzy-design/core';
  import { useLocale } from '../locale-provider/index.js';

  type ItemValue = string | number;
  type Item = ItemValue | { value: ItemValue; label?: string; disabled?: boolean };
  type NormalizedItem = { value: ItemValue; label: string; disabled: boolean };
  type Size = 'small' | 'default' | 'large';
  type Status = 'default' | 'warning' | 'error';

  interface Props {
    value?: string;
    defaultValue?: string;
    data?: Item[];
    open?: boolean;
    defaultOpen?: boolean;
    placeholder?: string;
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
    onSelect?: (value: ItemValue) => void;
    onOpenChange?: (open: boolean) => void;
  }

  let {
    value = $bindable(),
    defaultValue = '',
    data = [],
    open = $bindable(),
    defaultOpen = false,
    placeholder = '',
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
    onOpenChange,
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
  const isRemote = $derived(onSearch !== undefined);

  const options = $derived.by<NormalizedItem[]>(() => {
    const all = data.map(normalize);
    const matched =
      isRemote || !filter || currentValue === ''
        ? all
        : (() => {
            const q = currentValue.toLowerCase();
            return all.filter(
              (o) =>
                o.label.toLowerCase().includes(q) ||
                String(o.value).toLowerCase().includes(q),
            );
          })();
    return maxCount > 0 ? matched.slice(0, maxCount) : matched;
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
  const showClear = $derived(clearable && !disabled && currentValue.length > 0);

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
    if (isRemote) scheduleSearch(next);
  }

  function commit(opt: NormalizedItem) {
    if (opt.disabled || disabled) return;
    setValue(opt.label);
    onSelect?.(opt.value);
    setOpen(false);
  }

  function clearAll() {
    if (disabled) return;
    setValue('');
    setOpen(false);
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

  const cls = $derived(
    [
      'cd-autocomplete',
      `cd-autocomplete--${size}`,
      `cd-autocomplete--${status}`,
      disabled && 'cd-autocomplete--disabled',
      isOpen && 'cd-autocomplete--open',
    ]
      .filter(Boolean)
      .join(' '),
  );
</script>

<div class={cls} bind:this={rootEl}>
  <div class="cd-autocomplete__control">
    <input
      class="cd-autocomplete__input"
      type="text"
      role="combobox"
      value={currentValue}
      {placeholder}
      {disabled}
      aria-expanded={showDropdown}
      aria-controls={listId}
      aria-autocomplete="list"
      aria-activedescendant={activeOptionId}
      aria-invalid={status === 'error' || undefined}
      oninput={handleInput}
      onkeydown={handleKeydown}
    />

    {#if showClear}
      <button type="button" class="cd-autocomplete__clear" aria-label={loc().t('AutoComplete.clear')} onclick={clearAll}>
        <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" focusable="false">
          <path
            fill="currentColor"
            d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1Zm2.5 9.1-1.4 1.4L8 9.4 6.5 11l-1.4-1.4L6.6 8 5.1 6.5 6.5 5.1 8 6.6 9.5 5.1l1.4 1.4L9.4 8l1.1 1.1Z"
          />
        </svg>
      </button>
    {/if}
  </div>

  {#if showDropdown}
    <div class="cd-autocomplete__dropdown" role="listbox" id={listId} aria-busy={loading || undefined}>
      {#if loading}
        <div class="cd-autocomplete__loading">
          <span class="cd-autocomplete__spinner" aria-hidden="true"></span>
          <span>{loc().t('AutoComplete.loading')}</span>
        </div>
      {/if}
      {#if options.length === 0 && !loading}
        <div class="cd-autocomplete__empty">{loc().t('AutoComplete.emptyText')}</div>
      {/if}
      {#each options as opt, i (opt.value)}
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
          {opt.label}
        </div>
      {/each}
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
  .cd-autocomplete__control {
    display: flex;
    align-items: center;
    gap: var(--cd-spacing-2);
    inline-size: 100%;
    block-size: var(--cd-input-height-default);
    padding-inline: var(--cd-input-padding-x);
    background: var(--cd-input-color-bg);
    border: 1px solid var(--cd-input-border);
    border-radius: var(--cd-input-radius);
    transition: border-color var(--cd-motion-duration-fast) var(--cd-motion-ease-standard);
  }
  .cd-autocomplete--small .cd-autocomplete__control {
    block-size: var(--cd-input-height-small);
  }
  .cd-autocomplete--large .cd-autocomplete__control {
    block-size: var(--cd-input-height-large);
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
    color: var(--cd-color-text-3);
    cursor: not-allowed;
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
  .cd-autocomplete__dropdown {
    position: absolute;
    inset-block-start: calc(100% + var(--cd-spacing-1));
    inset-inline: 0;
    z-index: var(--cd-select-dropdown-z);
    max-block-size: 16rem;
    overflow-y: auto;
    padding-block: var(--cd-spacing-1);
    background: var(--cd-select-dropdown-bg);
    border-radius: var(--cd-select-dropdown-radius);
    box-shadow: var(--cd-select-dropdown-shadow);
  }
  .cd-autocomplete__option {
    padding: var(--cd-select-option-padding);
    cursor: pointer;
  }
  .cd-autocomplete__option--active {
    background: var(--cd-select-option-bg-hover);
  }
  .cd-autocomplete__option[aria-disabled='true'] {
    color: var(--cd-color-text-3);
    cursor: not-allowed;
  }
  .cd-autocomplete__empty {
    padding: var(--cd-select-option-padding);
    color: var(--cd-color-text-3);
    text-align: center;
  }
  .cd-autocomplete__loading {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--cd-spacing-2);
    padding: var(--cd-select-option-padding);
    color: var(--cd-color-text-3);
  }
  .cd-autocomplete__spinner {
    inline-size: 1em;
    block-size: 1em;
    border: 2px solid var(--cd-color-border);
    border-block-start-color: var(--cd-color-primary);
    border-radius: var(--cd-radius-full);
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
