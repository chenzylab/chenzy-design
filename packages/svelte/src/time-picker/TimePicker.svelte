<!--
  TimePicker — see specs/components/input/TimePicker.spec.md
  单选 type='time'，HH:mm:ss 三列滚动选择 (+ 12h 制 AM/PM 列)。受控/非受控。
  type='timeRange' (或 range)：选起止两个时间，值为 [start, end] (双面板)。
  value/defaultValue 支持 Date | string (如 '12:30:45')，字符串经 core parseTimeString 解析。
  format 字符串 (如 'HH:mm' / 'hh:mm A')：经 core parseFormatSpec 决定显示哪些列 + 12h，
    显示经 core formatTime 序列化 (有 format 时)，否则走 Intl.DateTimeFormat (不手拼时间串)。
  scrollIntoView 命令式调用 (非响应式 attachment)。
  列项/禁用集生成 + 格式解析/序列化走 @chenzy-design/core 纯函数 (红线 #2)。
-->
<script lang="ts">
  import { tick, type Snippet } from 'svelte';
  import {
    useId,
    useDismiss,
    buildHourOptions,
    buildMinuteOptions,
    buildSecondOptions,
    applyHideDisabled,
    to12Hour,
    meridiemOf,
    from12Hour,
    parseFormatSpec,
    formatTime,
    parseTimeString,
    type Meridiem,
    type TimeOption,
  } from '@chenzy-design/core';
  import { useLocale } from '../locale-provider/index.js';

  type Size = 'small' | 'default' | 'large';
  type Status = 'default' | 'warning' | 'error';

  /** 单选入参：Date 或时间字符串 (如 '12:30:45')。 */
  type TimeInput = Date | string | null;

  interface Props {
    /** 单选时 Date|string；范围时 [start, end] (各自 Date|string)。 */
    value?: TimeInput | [TimeInput, TimeInput] | null;
    defaultValue?: TimeInput | [TimeInput, TimeInput] | null;
    /** 'time' 单选 (默认) / 'timeRange' 范围选择 (等价 range=true)。 */
    type?: 'time' | 'timeRange';
    /** range=true 等价 type='timeRange'。 */
    range?: boolean;
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
    use12Hours?: boolean;
    /** 格式串 (如 'HH:mm' / 'hh:mm A' / 'HH:mm:ss')：决定显示列与 12h，并作为展示/字符串值序列化格式。 */
    format?: string;
    disabledHours?: () => number[];
    disabledMinutes?: (hour: number) => number[];
    disabledSeconds?: (hour: number, minute: number) => number[];
    hideDisabledOptions?: boolean;
    locale?: string;
    /** 单选回调 Date|null；范围回调 [Date|null, Date|null]。 */
    onChange?: (v: (Date | null) | [Date | null, Date | null]) => void;
    onOpenChange?: (open: boolean) => void;
    ariaLabel?: string;
    /** 浮层溢出自动调整（默认 true）。 */
    autoAdjustOverflow?: boolean;
    /** 挂载时自动聚焦触发器。 */
    autoFocus?: boolean;
    /** 自定义清除按钮图标。 */
    clearIcon?: Snippet;
    /** 是否显示清除按钮（clearable 别名）。 */
    showClear?: boolean;
    /** 浮层 className。 */
    dropdownClassName?: string;
    /** 浮层溢出冗余。 */
    dropdownMargin?: number | { x?: number; y?: number };
    /** 浮层内联样式。 */
    dropdownStyle?: string | Record<string, string>;
    /** 打开面板时自动聚焦第一列（默认 true）。 */
    focusOnOpen?: boolean;
    /** 浮层挂载容器。 */
    getPopupContainer?: () => HTMLElement;
    /** 面板展开动画（默认 true）。 */
    motion?: boolean;
    /** 面板顶部自定义内容。 */
    panelHeader?: string | Snippet;
    /** 浮层弹出位置（默认 'bottomLeft'）。 */
    position?: string;
    /** 触发器前缀内容。 */
    prefix?: string | Snippet;
    /** 范围模式分隔符（默认 '~'）。 */
    rangeSeparator?: string;
    /** 滚动列 item 属性透传。 */
    scrollItemProps?: Record<string, unknown>;
    /** 阻止浮层点击事件冒泡（默认 true）。 */
    stopPropagation?: boolean;
    /** 浮层 z-index（默认 1030）。 */
    zIndex?: number;
    /** 触发器失焦。 */
    onBlur?: (e: FocusEvent) => void;
    /** 触发器聚焦。 */
    onFocus?: (e: FocusEvent) => void;
    /** onChange 参数 dateFirst 模式。 */
    onChangeWithDateFirst?: boolean;
    /** 点击外部触发。 */
    onClickOutSide?: (e: MouseEvent) => void;
    /** 范围模式禁用函数。 */
    disabledTime?: (date: Date) => { disabledHours?: () => number[]; disabledMinutes?: (h: number) => number[]; disabledSeconds?: (h: number, m: number) => number[] };
    /** 面板底部自定义内容（在"此刻"/"确定"按钮上方插入）。 */
    panelFooter?: string | Snippet;
    /** 输入框样式（透传到触发器 button）。 */
    inputStyle?: string | Record<string, string>;
    /** 输入框 readonly 属性（仅允许通过面板选择，不可键盘输入触发器文本）。 */
    inputReadOnly?: boolean;
    /** 完全自定义触发器渲染（替换默认 input + 图标区域）。 */
    triggerRender?: Snippet<[{ value: Date | null; placeholder: string; open: boolean; disabled: boolean }]>;
    /** 无边框模式。 */
    borderless?: boolean;
    /** focus 时阻止滚动（传给 focus({ preventScroll }) 调用）。 */
    preventScroll?: boolean;
  }

  let {
    value,
    defaultValue = null,
    type = 'time',
    range = false,
    open,
    defaultOpen = false,
    placeholder,
    size = 'default',
    status = 'default',
    disabled = false,
    clearable = true,
    hourStep = 1,
    minuteStep = 1,
    secondStep = 1,
    showSecond = true,
    use12Hours = false,
    format,
    disabledHours,
    disabledMinutes,
    disabledSeconds,
    hideDisabledOptions = false,
    locale = 'zh-CN',
    onChange,
    onOpenChange,
    ariaLabel,
    autoAdjustOverflow = true,
    autoFocus = false,
    clearIcon,
    showClear,
    dropdownClassName,
    dropdownMargin,
    dropdownStyle,
    focusOnOpen = true,
    getPopupContainer,
    motion = true,
    panelHeader,
    position = 'bottomLeft',
    prefix,
    rangeSeparator = '~',
    scrollItemProps,
    stopPropagation = true,
    zIndex = 1030,
    onBlur,
    onFocus,
    onChangeWithDateFirst = false,
    onClickOutSide,
    disabledTime,
    panelFooter,
    inputStyle,
    inputReadOnly = false,
    triggerRender,
    borderless = false,
    preventScroll = false,
  }: Props = $props();

  const isRange = $derived(range || type === 'timeRange');

  // showClear 是 clearable 别名
  const effClearable = $derived(clearable ?? showClear ?? true);

  // --- format 串解析 (红线 #2 经 core 纯函数)：决定列与 12h；无 format 时回退 props ---
  const formatSpec = $derived(format ? parseFormatSpec(format) : null);
  const effShowSecond = $derived(formatSpec ? formatSpec.showSecond : showSecond);
  const effUse12Hours = $derived(formatSpec ? formatSpec.use12Hours : use12Hours);

  // --- 字符串/Date 入参归一化为 Date|null (字符串经 core parseTimeString) ---
  function toDate(input: TimeInput): Date | null {
    if (input == null) return null;
    if (input instanceof Date) return input;
    const parts = parseTimeString(input);
    if (!parts) return null;
    const d = new Date();
    d.setHours(parts.hour, parts.minute, parts.second, 0);
    return d;
  }

  const loc = useLocale();

  const baseId = useId('cd-time-picker-panel');

  // --- 受控 value (红线 #1): 不无条件回写 value，仅 onChange ---
  // 内部统一用 [start, end] 元组表示 (单选只用 [0])，避免双分支。
  type Pair = [Date | null, Date | null];

  function toPair(input: Props['value']): Pair {
    if (Array.isArray(input)) return [toDate(input[0] ?? null), toDate(input[1] ?? null)];
    return [toDate((input ?? null) as TimeInput), null];
  }

  const isValueControlled = $derived(value !== undefined);
  // eslint-disable-next-line svelte/no-state-referencing-locally -- 仅捕获初始 defaultValue (非受控初值)
  let innerValue = $state<Pair>(getInitialPair());

  function getInitialPair(): Pair {
    return toPair(defaultValue);
  }
  const currentPair = $derived<Pair>(isValueControlled ? toPair(value) : innerValue);

  // 单选视图：始终读 [0]
  const current = $derived<Date | null>(currentPair[0]);

  // 范围当前正在编辑的一端 (0=start, 1=end)；打开时重置为 start
  let activeIndex = $state<0 | 1>(0);
  const activeDate = $derived<Date | null>(isRange ? currentPair[activeIndex] : currentPair[0]);

  function emit(next: Pair) {
    if (!isValueControlled) innerValue = next;
    onChange?.(isRange ? next : next[0]);
  }

  // 单选 setValue：写 [0]
  function setValue(next: Date | null) {
    emit([next, currentPair[1]]);
  }

  // 范围 setValue：写当前 activeIndex 端
  function setRangeValue(next: Date | null) {
    const pair: Pair = [...currentPair];
    pair[activeIndex] = next;
    emit(pair);
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

  // --- 选中的 h/m/s 派生 (24h 内部表示)；从当前编辑端 activeDate 读取 ---
  const selectedHour = $derived(activeDate ? activeDate.getHours() : 0);
  const selectedMinute = $derived(activeDate ? activeDate.getMinutes() : 0);
  const selectedSecond = $derived(activeDate ? activeDate.getSeconds() : 0);

  // --- 12h 制派生：当前 meridiem + 小时列显示值 (红线 #2 经 core 纯函数) ---
  const selectedMeridiem = $derived<Meridiem>(meridiemOf(selectedHour));
  const selectedHourDisplay = $derived(effUse12Hours ? to12Hour(selectedHour) : selectedHour);

  // --- 列项 + 禁用集生成 (红线 #2: 派生纯函数) ---
  const hours = $derived(
    applyHideDisabled(
      buildHourOptions(hourStep, effUse12Hours, selectedMeridiem, disabledHours),
      hideDisabledOptions,
    ),
  );
  const minutes = $derived(
    applyHideDisabled(
      buildMinuteOptions(minuteStep, selectedHour, disabledMinutes),
      hideDisabledOptions,
    ),
  );
  const seconds = $derived(
    applyHideDisabled(
      buildSecondOptions(secondStep, selectedHour, selectedMinute, disabledSeconds),
      hideDisabledOptions,
    ),
  );

  function pad2(n: number): string {
    return n < 10 ? `0${n}` : `${n}`;
  }

  // --- Intl 本地化展示 (无 format 时；不手拼时间串)；12h 制由 hour12 驱动 AM/PM ---
  const triggerFormat = $derived(
    new Intl.DateTimeFormat(locale, {
      hour: '2-digit',
      minute: '2-digit',
      second: effShowSecond ? '2-digit' : undefined,
      hour12: effUse12Hours,
    }),
  );

  // 单个 Date 的展示串：有 format 走 core formatTime (红线 #2)，否则 Intl 本地化
  function displayOne(d: Date): string {
    if (format) {
      return formatTime({ hour: d.getHours(), minute: d.getMinutes(), second: d.getSeconds() }, format);
    }
    return triggerFormat.format(d);
  }

  const placeholderText = $derived(placeholder ?? loc().t('TimePicker.placeholder'));

  const displayText = $derived.by(() => {
    if (isRange) {
      const [s, e] = currentPair;
      if (!s && !e) return placeholderText;
      const sep = ' ~ ';
      return `${s ? displayOne(s) : ''}${sep}${e ? displayOne(e) : ''}`;
    }
    return current ? displayOne(current) : placeholderText;
  });

  const hasValue = $derived(isRange ? currentPair[0] !== null || currentPair[1] !== null : current !== null);
  const showClearBtn = $derived(effClearable && !disabled && hasValue);

  // 合成 Date: 基于当前编辑端或今天，写入 h/m/s；按模式写单选/范围端
  function commit(h: number, m: number, s: number) {
    const base = activeDate ? new Date(activeDate) : new Date();
    base.setHours(h, m, s, 0);
    if (isRange) setRangeValue(base);
    else setValue(base);
  }

  // 12h 制下小时列的值是显示小时 (1-12)，按当前 meridiem 转回 24h 内部表示
  function pickHour(h: number) {
    const hour24 = effUse12Hours ? from12Hour(h, selectedMeridiem) : h;
    commit(hour24, selectedMinute, selectedSecond);
  }
  function pickMinute(m: number) {
    commit(selectedHour, m, selectedSecond);
  }
  function pickSecond(s: number) {
    commit(selectedHour, selectedMinute, s);
  }
  // 切换 AM/PM：保持当前显示小时，重算 24h 表示
  function pickMeridiem(m: Meridiem) {
    if (m === selectedMeridiem) return;
    commit(from12Hour(selectedHourDisplay, m), selectedMinute, selectedSecond);
  }

  function setNow() {
    const now = new Date();
    commit(now.getHours(), now.getMinutes(), now.getSeconds());
  }

  function confirm() {
    // 范围：在 start 端确认后切到 end 端继续选；end 端确认后关闭
    if (isRange && activeIndex === 0) {
      activeIndex = 1;
      return;
    }
    setOpen(false);
  }

  function clear(e: MouseEvent) {
    e.stopPropagation();
    if (disabled) return;
    if (isRange) emit([null, null]);
    else setValue(null);
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
  let meridiemCol = $state<HTMLUListElement | null>(null);

  function scrollColToSelected(col: HTMLUListElement | null) {
    if (!col) return;
    const target = col.querySelector<HTMLElement>('[aria-selected="true"]');
    target?.scrollIntoView({ block: 'center' });
  }

  // --- 列内 roving 键盘导航（a11y §6 / WAI-ARIA APG listbox）---
  // 每列单一 Tab 停靠点：选中项（或首个可选项）tabindex=0，其余 -1。
  // 列间用 Tab/Shift+Tab（原生焦点序，停靠点即为各列入口）。

  // 列内可聚焦（非 disabled）选项，按 DOM 顺序漫游。
  function colOptions(col: HTMLUListElement | null): HTMLElement[] {
    if (!col) return [];
    return [...col.querySelectorAll<HTMLElement>('[role="option"]')].filter(
      (el) => el.getAttribute('aria-disabled') !== 'true',
    );
  }

  // 纯派生 tabindex：列内选中项（无选中时首个可选项）为停靠点 0，其余 -1（红线 #2：render 期只读）。
  // selected 为该列当前选中值的 option（传 isSelected 布尔），col 标识用于「无选中回退首项」。
  function colItemTabindex(isSelectedOpt: boolean, isFirst: boolean, anySelected: boolean): 0 | -1 {
    if (anySelected) return isSelectedOpt ? 0 : -1;
    return isFirst ? 0 : -1;
  }

  // 各列是否存在可聚焦的选中项（决定 roving 停靠点是选中项还是回退首项；红线 #2：纯派生）。
  const hourSelected = $derived(hours.some((h) => h.value === selectedHourDisplay && !h.disabled));
  const minuteSelected = $derived(minutes.some((m) => m.value === selectedMinute && !m.disabled));

  // 列内 keydown：↑↓ 漫游（循环）、Home/End 跳首末、Enter/Space 选中。
  function onColKeydown(e: KeyboardEvent, col: HTMLUListElement | null, pick: (v: number) => void, value: number) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      pick(value);
      return;
    }
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp' && e.key !== 'Home' && e.key !== 'End') return;
    const opts = colOptions(col);
    if (opts.length === 0) return;
    const cur = opts.findIndex((el) => el === document.activeElement);
    e.preventDefault();
    let next = cur;
    if (e.key === 'ArrowDown') next = cur < 0 ? 0 : (cur + 1) % opts.length;
    else if (e.key === 'ArrowUp') next = cur < 0 ? opts.length - 1 : (cur - 1 + opts.length) % opts.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = opts.length - 1;
    const target = opts[next];
    if (!target) return;
    // 收敛 roving 停靠点到目标项（命令式写 DOM，非 render 期；红线 #2）。
    for (const el of opts) el.tabIndex = el === target ? 0 : -1;
    target.focus();
  }

  // meridiem 列（值为 'am'/'pm' 字符串）的 keydown：导航同 onColKeydown，激活走 pickMeridiem。
  function onMeridiemKeydown(e: KeyboardEvent, mer: Meridiem) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      pickMeridiem(mer);
      return;
    }
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp' && e.key !== 'Home' && e.key !== 'End') return;
    const opts = colOptions(meridiemCol);
    if (opts.length === 0) return;
    const cur = opts.findIndex((el) => el === document.activeElement);
    e.preventDefault();
    let next = cur;
    if (e.key === 'ArrowDown') next = cur < 0 ? 0 : (cur + 1) % opts.length;
    else if (e.key === 'ArrowUp') next = cur < 0 ? opts.length - 1 : (cur - 1 + opts.length) % opts.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = opts.length - 1;
    const target = opts[next];
    if (!target) return;
    for (const el of opts) el.tabIndex = el === target ? 0 : -1;
    target.focus();
  }

  // 打开后把焦点送进当前小时列的选中项（APG：打开浮层并聚焦当前小时列）。
  $effect(() => {
    if (!isOpen) return;
    void activeIndex;
    void tick().then(() => {
      const target =
        hourCol?.querySelector<HTMLElement>('[aria-selected="true"]') ??
        colOptions(hourCol)[0] ??
        null;
      target?.focus({ preventScroll });
    });
  });

  // 打开时重置范围编辑端为 start
  $effect(() => {
    if (isOpen) activeIndex = 0;
  });

  // 打开 / 切换编辑端时把列各自滚到选中项 (命令式，不放响应式 attachment)
  $effect(() => {
    if (!isOpen) return;
    void activeIndex; // 切端时重滚
    void tick().then(() => {
      scrollColToSelected(hourCol);
      scrollColToSelected(minuteCol);
      if (effShowSecond) scrollColToSelected(secondCol);
    });
  });

  // --- useDismiss (红线 #3): 绑定放进 $effect，open 时绑、cleanup 解绑 ---
  let rootEl = $state<HTMLDivElement | null>(null);
  let triggerEl = $state<HTMLButtonElement | null>(null);

  $effect(() => {
    if (!isOpen || !rootEl) return;
    return useDismiss(rootEl, {
      onDismiss: () => setOpen(false),
      escape: true,
      outsideClick: true,
    });
  });

  // autoFocus: 挂载时自动聚焦触发器
  $effect(() => {
    if (autoFocus && triggerEl) {
      triggerEl.focus({ preventScroll: true });
    }
  });

  // onClickOutSide: 监听 document mousedown，点击不在 rootEl 内时触发
  $effect(() => {
    if (!onClickOutSide) return;
    function handler(e: MouseEvent) {
      if (rootEl && !rootEl.contains(e.target as Node)) {
        onClickOutSide!(e);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  });

  function isSnippet(v: unknown): v is Snippet {
    return typeof v === 'function';
  }

  const inputStyleStr = $derived.by(() => {
    if (!inputStyle) return undefined;
    if (typeof inputStyle === 'string') return inputStyle;
    return Object.entries(inputStyle)
      .map(([k, v]) => `${k}:${v}`)
      .join(';');
  });

  const cls = $derived(
    [
      'cd-time-picker',
      `cd-time-picker--${size}`,
      `cd-time-picker--${status}`,
      disabled && 'cd-time-picker--disabled',
      isOpen && 'cd-time-picker--open',
      !motion && 'cd-time-picker--no-motion',
      borderless && 'cd-time-picker--borderless',
    ]
      .filter(Boolean)
      .join(' '),
  );
</script>

<div class={cls} bind:this={rootEl} aria-invalid={status === 'error' || undefined} data-position={position}>
  {#if triggerRender}
    <!-- 自定义触发器：完全替换默认 input + 图标区域 -->
    <div class="cd-time-picker__control" onclick={toggleOpen} onkeydown={onTriggerKeydown} role="button" tabindex={disabled ? -1 : 0} aria-haspopup="dialog" aria-expanded={isOpen}>
      {@render triggerRender({ value: current, placeholder: placeholderText, open: isOpen, disabled })}
    </div>
  {:else}
    <div class="cd-time-picker__control">
      <button
        type="button"
        class="cd-time-picker__trigger"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-controls={baseId}
        aria-label={ariaLabel}
        {disabled}
        data-readonly={inputReadOnly || undefined}
        style={inputStyleStr}
        bind:this={triggerEl}
        onclick={toggleOpen}
        onkeydown={onTriggerKeydown}
        onfocus={onFocus}
        onblur={onBlur}
      >
        {#if prefix}
          <span class="cd-time-picker__prefix">
            {#if typeof prefix === 'string'}
              {prefix}
            {:else}
              {@render prefix()}
            {/if}
          </span>
        {/if}
        <span class="cd-time-picker__value" class:cd-time-picker__value--placeholder={current === null}>
          {displayText}
        </span>
      </button>

      {#if showClearBtn}
        <button type="button" class="cd-time-picker__clear" aria-label={loc().t('TimePicker.clear')} onclick={clear}>
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

      <span class="cd-time-picker__icon" aria-hidden="true">
        <svg viewBox="0 0 16 16" width="14" height="14" focusable="false">
          <path
            fill="currentColor"
            d="M8 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13Zm0 12a5.5 5.5 0 1 1 0-11 5.5 5.5 0 0 1 0 11ZM8.5 4.5h-1v4l3 1.8.5-.85L8.5 8V4.5Z"
          />
        </svg>
      </span>
    </div>
  {/if}

  {#if isOpen}
    <div
      class="cd-time-picker__panel"
      id={baseId}
      role="dialog"
      aria-label={loc().t('TimePicker.triggerLabel')}
      tabindex="-1"
    >
      {#if panelHeader}
        <div class="cd-time-picker__panel-header">
          {#if typeof panelHeader === 'string'}
            {panelHeader}
          {:else}
            {@render panelHeader()}
          {/if}
        </div>
      {/if}
      {#if isRange}
        <div class="cd-time-picker__range-tabs" role="tablist" aria-label={loc().t('TimePicker.triggerLabel')}>
          <button
            type="button"
            role="tab"
            class="cd-time-picker__range-tab"
            class:cd-time-picker__range-tab--active={activeIndex === 0}
            aria-selected={activeIndex === 0}
            onclick={() => (activeIndex = 0)}
          >
            {loc().t('TimePicker.rangeStart')}
            <span class="cd-time-picker__range-preview">{currentPair[0] ? displayOne(currentPair[0]) : '--'}</span>
          </button>
          <button
            type="button"
            role="tab"
            class="cd-time-picker__range-tab"
            class:cd-time-picker__range-tab--active={activeIndex === 1}
            aria-selected={activeIndex === 1}
            onclick={() => (activeIndex = 1)}
          >
            {loc().t('TimePicker.rangeEnd')}
            <span class="cd-time-picker__range-preview">{currentPair[1] ? displayOne(currentPair[1]) : '--'}</span>
          </button>
        </div>
      {/if}

      <div class="cd-time-picker__columns">
        <ul class="cd-time-picker__col" role="listbox" aria-label={loc().t('TimePicker.hour')} bind:this={hourCol}>
          {#each hours as h, hi (h.value)}
            <li
              class="cd-time-picker__item"
              class:cd-time-picker__item--selected={h.value === selectedHourDisplay}
              class:cd-time-picker__item--disabled={h.disabled}
              role="option"
              aria-selected={h.value === selectedHourDisplay}
              aria-disabled={h.disabled || undefined}
              tabindex={h.disabled ? -1 : colItemTabindex(h.value === selectedHourDisplay, hi === 0, hourSelected)}
              onclick={() => !h.disabled && pickHour(h.value)}
              onkeydown={(e) => !h.disabled && onColKeydown(e, hourCol, pickHour, h.value)}
            >
              {pad2(h.value)}
            </li>
          {/each}
        </ul>

        <ul class="cd-time-picker__col" role="listbox" aria-label={loc().t('TimePicker.minute')} bind:this={minuteCol}>
          {#each minutes as m, mi (m.value)}
            <li
              class="cd-time-picker__item"
              class:cd-time-picker__item--selected={m.value === selectedMinute}
              class:cd-time-picker__item--disabled={m.disabled}
              role="option"
              aria-selected={m.value === selectedMinute}
              aria-disabled={m.disabled || undefined}
              tabindex={m.disabled ? -1 : colItemTabindex(m.value === selectedMinute, mi === 0, minuteSelected)}
              onclick={() => !m.disabled && pickMinute(m.value)}
              onkeydown={(e) => !m.disabled && onColKeydown(e, minuteCol, pickMinute, m.value)}
            >
              {pad2(m.value)}
            </li>
          {/each}
        </ul>

        {#if effShowSecond}
          {@const secondSelected = seconds.some((s) => s.value === selectedSecond && !s.disabled)}
          <ul class="cd-time-picker__col" role="listbox" aria-label={loc().t('TimePicker.second')} bind:this={secondCol}>
            {#each seconds as s, si (s.value)}
              <li
                class="cd-time-picker__item"
                class:cd-time-picker__item--selected={s.value === selectedSecond}
                class:cd-time-picker__item--disabled={s.disabled}
                role="option"
                aria-selected={s.value === selectedSecond}
                aria-disabled={s.disabled || undefined}
                tabindex={s.disabled ? -1 : colItemTabindex(s.value === selectedSecond, si === 0, secondSelected)}
                onclick={() => !s.disabled && pickSecond(s.value)}
                onkeydown={(e) => !s.disabled && onColKeydown(e, secondCol, pickSecond, s.value)}
              >
                {pad2(s.value)}
              </li>
            {/each}
          </ul>
        {/if}

        {#if effUse12Hours}
          <ul class="cd-time-picker__col" role="listbox" aria-label={loc().t('TimePicker.triggerLabel')} bind:this={meridiemCol}>
            {#each ['am', 'pm'] as const as mer, meri (mer)}
              <li
                class="cd-time-picker__item"
                class:cd-time-picker__item--selected={mer === selectedMeridiem}
                role="option"
                aria-selected={mer === selectedMeridiem}
                tabindex={colItemTabindex(mer === selectedMeridiem, meri === 0, true)}
                onclick={() => pickMeridiem(mer)}
                onkeydown={(e) => onMeridiemKeydown(e, mer)}
              >
                {loc().t(`TimePicker.${mer}`)}
              </li>
            {/each}
          </ul>
        {/if}
      </div>

      {#if panelFooter !== undefined}
        <div class="cd-time-picker__panel-footer-extra">
          {#if isSnippet(panelFooter)}{@render panelFooter()}{:else}{panelFooter}{/if}
        </div>
      {/if}
      <div class="cd-time-picker__footer">
        <button type="button" class="cd-time-picker__now" onclick={setNow}>{loc().t('TimePicker.now')}</button>
        <button type="button" class="cd-time-picker__ok" onclick={confirm}>{loc().t('TimePicker.confirm')}</button>
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
    gap: var(--cd-spacing-tight);
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
    font-size: var(--cd-font-size-small);
  }
  .cd-time-picker--large .cd-time-picker__trigger {
    block-size: var(--cd-input-height-large);
    font-size: var(--cd-font-size-header-6);
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
  /* 无边框模式 */
  .cd-time-picker--borderless .cd-time-picker__trigger {
    border-color: transparent;
    background: transparent;
  }
  .cd-time-picker--borderless .cd-time-picker__trigger:focus-visible {
    border-color: var(--cd-input-border-active);
    background: var(--cd-input-color-bg);
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
    border-radius: var(--cd-border-radius-small);
  }
  .cd-time-picker__clear:hover {
    color: var(--cd-color-text-0);
  }
  .cd-time-picker__panel {
    position: absolute;
    inset-block-start: calc(100% + var(--cd-spacing-extra-tight));
    inset-inline-start: 0;
    z-index: var(--cd-date-picker-panel-z);
    background: var(--cd-date-picker-panel-bg);
    border-radius: var(--cd-date-picker-panel-radius);
    box-shadow: var(--cd-date-picker-panel-shadow);
  }
  .cd-time-picker__panel:focus-visible {
    outline: none;
  }
  .cd-time-picker__panel-header {
    padding: var(--cd-spacing-tight) var(--cd-spacing-tight);
    border-block-end: 1px solid var(--cd-color-border);
    color: var(--cd-color-text-0);
    font-size: var(--cd-font-size-small);
  }
  .cd-time-picker__prefix {
    flex: 0 0 auto;
    color: var(--cd-color-text-2);
  }
  .cd-time-picker--no-motion .cd-time-picker__panel {
    transition: none;
  }
  .cd-time-picker__range-tabs {
    display: flex;
    border-block-end: 1px solid var(--cd-color-border);
  }
  .cd-time-picker__range-tab {
    flex: 1 1 0;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 2px;
    border: none;
    background: transparent;
    font: inherit;
    cursor: pointer;
    padding: var(--cd-spacing-tight);
    color: var(--cd-color-text-2);
    border-block-end: 2px solid transparent;
  }
  .cd-time-picker__range-tab--active {
    color: var(--cd-color-primary);
    border-block-end-color: var(--cd-color-primary);
  }
  .cd-time-picker__range-tab:focus-visible {
    outline: none;
    box-shadow: var(--cd-focus-ring);
  }
  .cd-time-picker__range-preview {
    font-size: var(--cd-font-size-small);
    color: var(--cd-color-text-0);
    font-variant-numeric: tabular-nums;
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
  .cd-time-picker__item--disabled,
  .cd-time-picker__item--disabled:hover {
    color: var(--cd-color-text-3);
    background: transparent;
    cursor: not-allowed;
  }
  .cd-time-picker__panel-footer-extra {
    padding: var(--cd-spacing-tight);
    border-block-start: 1px solid var(--cd-color-border);
  }
  .cd-time-picker__footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--cd-spacing-tight);
    padding: var(--cd-spacing-tight);
    border-block-start: 1px solid var(--cd-color-border);
  }
  .cd-time-picker__now,
  .cd-time-picker__ok {
    border: none;
    background: transparent;
    font: inherit;
    cursor: pointer;
    border-radius: var(--cd-border-radius-small);
    padding-inline: var(--cd-spacing-tight);
    padding-block: var(--cd-spacing-extra-tight);
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
