<!--
  TimePicker — see specs/components/input/TimePicker.spec.md
  基础子集: 单选 type='time'，HH:mm:ss 三列滚动选择。受控/非受控。
  显示走 Intl.DateTimeFormat (不手拼时间串)。scrollIntoView 命令式调用 (非响应式 attachment)。
  TODO(延后): timeRange、use12Hours、disabledHours/Minutes/Seconds、hideDisabledOptions、字符串入参。
-->
<script lang="ts">
  import { tick } from 'svelte';
  import { useId, useDismiss } from '@chenzy-design/core';

  type Size = 'small' | 'default' | 'large';
  type Status = 'default' | 'warning' | 'error';

  interface Props {
    value?: Date | null;
    defaultValue?: Date | null;
    open?: boolean;
    defaultOpen?: boolean;
    placeholder?: string;
    size?: Size;
    status?: Status;
    disabled?: boolean;
    clearable?: boolean;
    hourStep?: number;
    minuteStep?: number;
    secondStep?: number;
    showSecond?: boolean;
    locale?: string;
    onChange?: (v: Date | null) => void;
    onOpenChange?: (open: boolean) => void;
    ariaLabel?: string;
  }

  let {
    value,
    defaultValue = null,
    open,
    defaultOpen = false,
    placeholder = '请选择时间',
    size = 'default',
    status = 'default',
    disabled = false,
    clearable = true,
    hourStep = 1,
    minuteStep = 1,
    secondStep = 1,
    showSecond = true,
    locale = 'zh-CN',
    onChange,
    onOpenChange,
    ariaLabel,
  }: Props = $props();

  const baseId = useId('cd-time-picker-panel');

  // --- 受控 value (红线 #1): 不无条件回写 value，仅 onChange ---
  const isValueControlled = $derived(value !== undefined);
  let innerValue = $state<Date | null>(getInitialValue());
  const current = $derived<Date | null>(isValueControlled ? (value ?? null) : innerValue);

  function getInitialValue(): Date | null {
    return defaultValue ?? null;
  }

  function setValue(next: Date | null) {
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
  }

  function toggleOpen() {
    if (disabled) return;
    setOpen(!isOpen);
  }

  // --- 选中的 h/m/s 派生初值；从 current 读取 ---
  const selectedHour = $derived(current ? current.getHours() : 0);
  const selectedMinute = $derived(current ? current.getMinutes() : 0);
  const selectedSecond = $derived(current ? current.getSeconds() : 0);

  function buildRange(max: number, step: number): number[] {
    const safeStep = step > 0 ? step : 1;
    const out: number[] = [];
    for (let i = 0; i < max; i += safeStep) out.push(i);
    return out;
  }

  const hours = $derived(buildRange(24, hourStep));
  const minutes = $derived(buildRange(60, minuteStep));
  const seconds = $derived(buildRange(60, secondStep));

  function pad2(n: number): string {
    return n < 10 ? `0${n}` : `${n}`;
  }

  // --- Intl 本地化展示 (不手拼时间串) ---
  const triggerFormat = $derived(
    new Intl.DateTimeFormat(locale, {
      hour: '2-digit',
      minute: '2-digit',
      second: showSecond ? '2-digit' : undefined,
      hour12: false,
    }),
  );

  const displayText = $derived(current ? triggerFormat.format(current) : placeholder);

  const showClear = $derived(clearable && !disabled && current !== null);

  // 合成 Date: 基于 current 或今天，写入 h/m/s
  function commit(h: number, m: number, s: number) {
    const base = current ? new Date(current) : new Date();
    base.setHours(h, m, s, 0);
    setValue(base);
  }

  function pickHour(h: number) {
    commit(h, selectedMinute, selectedSecond);
  }
  function pickMinute(m: number) {
    commit(selectedHour, m, selectedSecond);
  }
  function pickSecond(s: number) {
    commit(selectedHour, selectedMinute, s);
  }

  function setNow() {
    const now = new Date();
    commit(now.getHours(), now.getMinutes(), now.getSeconds());
  }

  function confirm() {
    setOpen(false);
  }

  function clear(e: MouseEvent) {
    e.stopPropagation();
    if (disabled) return;
    setValue(null);
  }

  function onTriggerKeydown(e: KeyboardEvent) {
    if (disabled) return;
    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        setOpen(true);
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (!isOpen) setOpen(true);
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

  // --- 列容器引用 (红线 #3: 普通 bind:this，scrollIntoView 命令式调用) ---
  let hourCol = $state<HTMLUListElement | null>(null);
  let minuteCol = $state<HTMLUListElement | null>(null);
  let secondCol = $state<HTMLUListElement | null>(null);

  function scrollColToSelected(col: HTMLUListElement | null) {
    if (!col) return;
    const target = col.querySelector<HTMLElement>('[aria-selected="true"]');
    target?.scrollIntoView({ block: 'center' });
  }

  // 打开时把三列各自滚到选中项 (命令式，不放响应式 attachment)
  $effect(() => {
    if (!isOpen) return;
    void tick().then(() => {
      scrollColToSelected(hourCol);
      scrollColToSelected(minuteCol);
      if (showSecond) scrollColToSelected(secondCol);
    });
  });

  // --- useDismiss (红线 #3): 绑定放进 $effect，open 时绑、cleanup 解绑 ---
  let rootEl = $state<HTMLDivElement | null>(null);

  $effect(() => {
    if (!isOpen || !rootEl) return;
    return useDismiss(rootEl, {
      onDismiss: () => setOpen(false),
      escape: true,
      outsideClick: true,
    });
  });

  const cls = $derived(
    [
      'cd-time-picker',
      `cd-time-picker--${size}`,
      `cd-time-picker--${status}`,
      disabled && 'cd-time-picker--disabled',
      isOpen && 'cd-time-picker--open',
    ]
      .filter(Boolean)
      .join(' '),
  );
</script>

<div class={cls} bind:this={rootEl} aria-invalid={status === 'error' || undefined}>
  <div class="cd-time-picker__control">
    <button
      type="button"
      class="cd-time-picker__trigger"
      aria-haspopup="dialog"
      aria-expanded={isOpen}
      aria-controls={baseId}
      aria-label={ariaLabel}
      {disabled}
      onclick={toggleOpen}
      onkeydown={onTriggerKeydown}
    >
      <span class="cd-time-picker__value" class:cd-time-picker__value--placeholder={current === null}>
        {displayText}
      </span>
    </button>

    {#if showClear}
      <button type="button" class="cd-time-picker__clear" aria-label="清除" onclick={clear}>
        <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" focusable="false">
          <path
            fill="currentColor"
            d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1Zm2.5 9.1-1.4 1.4L8 9.4 6.5 11l-1.4-1.4L6.6 8 5.1 6.5 6.5 5.1 8 6.6 9.5 5.1l1.4 1.4L9.4 8l1.1 1.1Z"
          />
        </svg>
      </button>
    {/if}

    <span class="cd-time-picker__icon" aria-hidden="true">
      <svg viewBox="0 0 16 16" width="14" height="14" focusable="false">
        <path
          fill="currentColor"
          d="M8 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13Zm0 12a5.5 5.5 0 1 1 0-11 5.5 5.5 0 0 1 0 11ZM8.5 4.5h-1v4l3 1.8.5-.85L8.5 8V4.5Z"
        />
      </svg>
    </span>
  </div>

  {#if isOpen}
    <div
      class="cd-time-picker__panel"
      id={baseId}
      role="dialog"
      aria-label="选择时间"
      tabindex="-1"
    >
      <div class="cd-time-picker__columns">
        <ul class="cd-time-picker__col" role="listbox" aria-label="时" bind:this={hourCol}>
          {#each hours as h (h)}
            <li
              class="cd-time-picker__item"
              class:cd-time-picker__item--selected={h === selectedHour}
              role="option"
              aria-selected={h === selectedHour}
              tabindex="-1"
              onclick={() => pickHour(h)}
              onkeydown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  pickHour(h);
                }
              }}
            >
              {pad2(h)}
            </li>
          {/each}
        </ul>

        <ul class="cd-time-picker__col" role="listbox" aria-label="分" bind:this={minuteCol}>
          {#each minutes as m (m)}
            <li
              class="cd-time-picker__item"
              class:cd-time-picker__item--selected={m === selectedMinute}
              role="option"
              aria-selected={m === selectedMinute}
              tabindex="-1"
              onclick={() => pickMinute(m)}
              onkeydown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  pickMinute(m);
                }
              }}
            >
              {pad2(m)}
            </li>
          {/each}
        </ul>

        {#if showSecond}
          <ul class="cd-time-picker__col" role="listbox" aria-label="秒" bind:this={secondCol}>
            {#each seconds as s (s)}
              <li
                class="cd-time-picker__item"
                class:cd-time-picker__item--selected={s === selectedSecond}
                role="option"
                aria-selected={s === selectedSecond}
                tabindex="-1"
                onclick={() => pickSecond(s)}
                onkeydown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    pickSecond(s);
                  }
                }}
              >
                {pad2(s)}
              </li>
            {/each}
          </ul>
        {/if}
      </div>

      <div class="cd-time-picker__footer">
        <button type="button" class="cd-time-picker__now" onclick={setNow}>此刻</button>
        <button type="button" class="cd-time-picker__ok" onclick={confirm}>确定</button>
      </div>
    </div>
  {/if}
</div>

<style>
  .cd-time-picker {
    position: relative;
    display: inline-flex;
    inline-size: 100%;
    font-size: var(--cd-input-font-size);
  }
  .cd-time-picker__control {
    position: relative;
    inline-size: 100%;
  }
  .cd-time-picker__trigger {
    display: flex;
    align-items: center;
    gap: var(--cd-spacing-2);
    inline-size: 100%;
    block-size: var(--cd-input-height-default);
    padding-inline-start: var(--cd-input-padding-x);
    padding-inline-end: calc(var(--cd-input-padding-x) + 1.25rem);
    background: var(--cd-input-color-bg);
    color: var(--cd-input-color-text);
    border: 1px solid var(--cd-input-border);
    border-radius: var(--cd-input-radius);
    font: inherit;
    text-align: start;
    cursor: pointer;
    transition: border-color var(--cd-motion-duration-fast) var(--cd-motion-ease-standard);
  }
  .cd-time-picker--small .cd-time-picker__trigger {
    block-size: var(--cd-input-height-small);
    font-size: var(--cd-font-size-1);
  }
  .cd-time-picker--large .cd-time-picker__trigger {
    block-size: var(--cd-input-height-large);
    font-size: var(--cd-font-size-3);
  }
  .cd-time-picker__trigger:focus-visible {
    outline: none;
    border-color: var(--cd-input-border-active);
    box-shadow: var(--cd-focus-ring);
  }
  .cd-time-picker--open .cd-time-picker__trigger {
    border-color: var(--cd-input-border-active);
  }
  .cd-time-picker--warning .cd-time-picker__trigger {
    border-color: var(--cd-input-border-warning);
  }
  .cd-time-picker--error .cd-time-picker__trigger {
    border-color: var(--cd-input-border-error);
  }
  .cd-time-picker--disabled .cd-time-picker__trigger {
    background: var(--cd-color-fill-0);
    color: var(--cd-color-text-3);
    cursor: not-allowed;
  }
  .cd-time-picker__value {
    flex: 1 1 auto;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  .cd-time-picker__value--placeholder {
    color: var(--cd-input-color-placeholder);
  }
  .cd-time-picker__clear,
  .cd-time-picker__icon {
    position: absolute;
    inset-block-start: 50%;
    inset-inline-end: var(--cd-input-padding-x);
    transform: translateY(-50%);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: var(--cd-color-text-2);
    pointer-events: none;
  }
  .cd-time-picker__clear {
    padding: 0;
    border: none;
    background: var(--cd-input-color-bg);
    cursor: pointer;
    opacity: 0;
    pointer-events: auto;
    transition: opacity var(--cd-motion-duration-fast) var(--cd-motion-ease-standard);
  }
  .cd-time-picker__control:hover .cd-time-picker__clear,
  .cd-time-picker__clear:focus-visible {
    opacity: 1;
  }
  .cd-time-picker__clear:focus-visible {
    outline: none;
    box-shadow: var(--cd-focus-ring);
    border-radius: var(--cd-radius-1);
  }
  .cd-time-picker__clear:hover {
    color: var(--cd-color-text-0);
  }
  .cd-time-picker__panel {
    position: absolute;
    inset-block-start: calc(100% + var(--cd-spacing-1));
    inset-inline-start: 0;
    z-index: var(--cd-date-picker-panel-z);
    background: var(--cd-date-picker-panel-bg);
    border-radius: var(--cd-date-picker-panel-radius);
    box-shadow: var(--cd-date-picker-panel-shadow);
  }
  .cd-time-picker__panel:focus-visible {
    outline: none;
  }
  .cd-time-picker__columns {
    display: flex;
  }
  .cd-time-picker__col {
    inline-size: var(--cd-time-picker-time-col-width);
    block-size: calc(var(--cd-time-picker-time-item-height) * 7);
    margin: 0;
    padding: 0;
    overflow-y: auto;
    list-style: none;
    scrollbar-width: thin;
  }
  .cd-time-picker__col + .cd-time-picker__col {
    border-inline-start: 1px solid var(--cd-color-border);
  }
  .cd-time-picker__item {
    display: flex;
    align-items: center;
    justify-content: center;
    block-size: var(--cd-time-picker-time-item-height);
    color: var(--cd-color-text-0);
    cursor: pointer;
    transition: background var(--cd-motion-duration-fast) var(--cd-motion-ease-standard);
  }
  .cd-time-picker__item:hover {
    background: var(--cd-date-picker-cell-bg-hover);
  }
  .cd-time-picker__item:focus-visible {
    outline: none;
    box-shadow: var(--cd-focus-ring);
  }
  .cd-time-picker__item--selected,
  .cd-time-picker__item--selected:hover {
    background: var(--cd-date-picker-cell-bg-selected);
    color: var(--cd-date-picker-cell-color-selected);
  }
  .cd-time-picker__footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--cd-spacing-2);
    padding: var(--cd-spacing-2);
    border-block-start: 1px solid var(--cd-color-border);
  }
  .cd-time-picker__now,
  .cd-time-picker__ok {
    border: none;
    background: transparent;
    font: inherit;
    cursor: pointer;
    border-radius: var(--cd-radius-1);
    padding-inline: var(--cd-spacing-2);
    padding-block: var(--cd-spacing-1);
  }
  .cd-time-picker__now {
    color: var(--cd-color-primary);
  }
  .cd-time-picker__now:hover {
    text-decoration: underline;
  }
  .cd-time-picker__ok {
    color: var(--cd-color-white, #fff);
    background: var(--cd-color-primary);
  }
  .cd-time-picker__ok:hover {
    background: var(--cd-color-primary-hover, var(--cd-color-primary));
  }
  .cd-time-picker__now:focus-visible,
  .cd-time-picker__ok:focus-visible {
    outline: none;
    box-shadow: var(--cd-focus-ring);
  }
  @media (prefers-reduced-motion: reduce) {
    .cd-time-picker__trigger,
    .cd-time-picker__clear,
    .cd-time-picker__item {
      transition: none;
    }
  }
</style>
