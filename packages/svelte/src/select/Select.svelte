<!--
  Select — see specs/components/input/Select.spec.md
  单选 / 多选 / 本地过滤 / 键盘导航 / 浮层。Token-driven, a11y-correct.
  TODO(延后): 虚拟化、分组 GroupData、远程 remote/loading 防抖、allowCreate、maxTagCount 折叠。
-->
<script lang="ts">
  import { useId, useDismiss } from '@chenzy-design/core';

  type OptionValue = string | number;
  type OptionData = { label: string; value: OptionValue; disabled?: boolean };
  type Size = 'small' | 'default' | 'large';
  type Status = 'default' | 'warning' | 'error';

  interface Props {
    value?: OptionValue | OptionValue[];
    defaultValue?: OptionValue | OptionValue[];
    options?: OptionData[];
    multiple?: boolean;
    filter?: boolean;
    open?: boolean;
    defaultOpen?: boolean;
    size?: Size;
    status?: Status;
    placeholder?: string;
    disabled?: boolean;
    clearable?: boolean;
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
    placeholder = '请选择',
    disabled = false,
    clearable = false,
    onChange,
    onOpenChange,
  }: Props = $props();

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

  const filteredOptions = $derived.by(() => {
    if (!filter || query.trim() === '') return options;
    const q = query.toLowerCase();
    return options.filter((o) => o.label.toLowerCase().includes(q));
  });

  // --- roving 高亮 (红线 #2): activeIndex 为本地 $state，不依赖挂载 registry ---
  let activeIndex = $state(-1);

  const activeOptionId = $derived(
    activeIndex >= 0 && activeIndex < filteredOptions.length
      ? `${listId}-opt-${activeIndex}`
      : undefined,
  );

  const selectedOptions = $derived(
    options.filter((o) => selectedValues.includes(o.value)),
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

  function onSearchInput(e: Event & { currentTarget: HTMLInputElement }) {
    query = e.currentTarget.value;
    if (!isOpen) setOpen(true);
    activeIndex = -1;
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
        {#each selectedOptions as opt (opt.value)}
          <span class="cd-select__tag">
            <span class="cd-select__tag-label">{opt.label}</span>
            <button
              type="button"
              class="cd-select__tag-close"
              aria-label={`移除 ${opt.label}`}
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
        {#if filter}
          <input
            class="cd-select__search"
            type="text"
            value={query}
            aria-label="搜索选项"
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
          placeholder={hasSelection ? singleLabel : placeholder}
          aria-label="搜索选项"
          oninput={onSearchInput}
          onkeydown={onTriggerKeydown}
          onclick={(e) => e.stopPropagation()}
        />
      {:else if hasSelection}
        <span class="cd-select__value">{singleLabel}</span>
      {:else}
        <span class="cd-select__placeholder">{placeholder}</span>
      {/if}
    </div>

    {#if showClear}
      <button
        type="button"
        class="cd-select__clear"
        aria-label="清除"
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
      role="listbox"
      id={listId}
      aria-multiselectable={multiple}
    >
      {#if filteredOptions.length === 0}
        <div class="cd-select__empty">无匹配项</div>
      {:else}
        {#each filteredOptions as opt, i (opt.value)}
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
        {/each}
      {/if}
    </div>
  {/if}
</div>

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
  .cd-select__dropdown {
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
  @media (prefers-reduced-motion: reduce) {
    .cd-select__trigger,
    .cd-select__arrow {
      transition: none;
    }
  }
</style>
