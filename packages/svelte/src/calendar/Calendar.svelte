<!--
  Calendar — see specs/components/show/Calendar.spec.md
  月/周/日视图日历：日格网格 + 事件展示与 +N 折叠，today/selected/outside/weekend/disabled 态。
  mode='month'(6×7) | 'week'(1×7) | 'day'(单日时间轴，纵向小时段)；selectionMode='single'(选中日) | 'range'(范围选择，起止+区间高亮+hover 预览)。
  day 模式：dayStartHour~dayEndHour 逐小时一行，带时间事件按起始小时入对应时段、全天/跨天延续事件入顶部「全天」区（纯派生 timelineForDay，纯 CSS 布局）。
  受控 value(锚点)/selectedDate/rangeValue 不回写，仅 onChange/onSelect/onRangeChange/onDateClick/onMoreClick 通知。
  复用 @chenzy-design/core 的纯日期/分组算法（getMonthGrid/getWeekGrid/getDayHours/addMonths/addWeeks/addDays/timelineForDay/gridFocusMove…），不重复实现。
  roving 键盘焦点：网格内仅活动格 tabindex=0，方向键(←→天/↑↓周/PageUp-Down月/Home-End周首末)移动焦点，跨月/周自动翻页并落焦，Enter/Space 选中（纯 gridFocusMove 派生 + 命令式 focus）。
  popup 弹层模式：渲染 trigger，日历门户浮出（复用 _floating），外部点击/Esc 关闭(useDismiss)并归还焦点。
  虚拟化：day 视图小时时间轴按阈值用 core fixedRange 视口渲染（滚动监听命令式 + cleanup，红线 #3）。
-->
<script lang="ts">
  import { untrack, tick, type Snippet } from 'svelte';
  import {
    getMonthGrid,
    getWeekGrid,
    getDayHours,
    weekdayOrder,
    isSameDay,
    startOfDay,
    addMonths,
    addWeeks,
    addDays,
    groupEventsByDays,
    timelineForDay,
    dayKey,
    isPastDay,
    gridFocusMove,
    fixedRange,
    useDismiss,
    useLiveAnnouncer,
    type GridFocusKey,
    type CalendarEvent,
    type Placement,
  } from '@chenzy-design/core';
  import { floating } from '../_floating/use-floating.js';
  import { useLocale } from '../locale-provider/index.js';

  type WeekStart = 0 | 1 | 2 | 3 | 4 | 5 | 6;
  type Mode = 'month' | 'week' | 'day';
  type SelectionMode = 'single' | 'range';
  type RangeValue = [Date, Date];

  interface Props {
    value?: Date;
    defaultValue?: Date;
    mode?: Mode;
    selectionMode?: SelectionMode;
    events?: CalendarEvent[];
    weekStartsOn?: WeekStart;
    maxEventsPerDay?: number;
    dayStartHour?: number;
    dayEndHour?: number;
    weekendDays?: number[];
    markWeekend?: boolean;
    disabledDate?: (date: Date) => boolean;
    selectedDate?: Date;
    defaultSelectedDate?: Date;
    rangeValue?: RangeValue | null;
    defaultRangeValue?: RangeValue | null;
    locale?: string;
    onChange?: (info: { value: Date }) => void;
    onSelect?: (info: { date: Date }) => void;
    onRangeChange?: (info: { range: RangeValue }) => void;
    onDateClick?: (info: { date: Date }) => void;
    onMoreClick?: (info: { date: Date; events: CalendarEvent[] }) => void;
    /** 点击/键盘激活事件块（spec §a11y：事件块 role=button + Enter/Space 触发）。 */
    onEventClick?: (info: { event: CalendarEvent; nativeEvent: Event }) => void;
    dateCell?: Snippet<
      [{ date: Date; events: CalendarEvent[]; isToday: boolean; isOutside: boolean; disabled: boolean }]
    >;
    event?: Snippet<[{ event: CalendarEvent }]>;
    ariaLabel?: string;
    // --- 弹层模式 (popup) ---
    /** 弹层模式：渲染 trigger，日历作为浮层弹出（复用 _floating 门户定位） */
    popup?: boolean;
    /** 受控展开态（popup 模式），受控时不回写仅 onOpenChange (红线 #1) */
    open?: boolean;
    /** 非受控初始展开态 */
    defaultOpen?: boolean;
    /** 展开态变化回调 */
    onOpenChange?: (info: { open: boolean }) => void;
    /** 浮层相对 trigger 的位置 */
    placement?: Placement;
    /** 浮层门户挂载容器（默认 document.body） */
    getContainer?: () => HTMLElement | null | undefined;
    /** trigger 自定义内容（popup 模式）；不传则渲染默认按钮显示标题 */
    trigger?: Snippet<[{ open: boolean; toggle: () => void }]>;
    // --- 虚拟化 (day 视图时间轴) ---
    /**
     * day 视图小时时间轴虚拟化：当行数 ≥ virtualizeThreshold 时仅渲染视口行。
     * 'auto'（默认）按阈值自动；true 强制；false 关闭。
     */
    virtualizeDay?: boolean | 'auto';
    /** 触发虚拟化的最少行数（virtualizeDay='auto' 时生效） */
    virtualizeThreshold?: number;
    /** day 视图时间轴视口高度（px，虚拟化时滚动容器高度） */
    timelineViewportHeight?: number;
  }

  let {
    value,
    defaultValue,
    mode = 'month',
    selectionMode = 'single',
    events = [],
    weekStartsOn = 0,
    maxEventsPerDay = 3,
    dayStartHour = 0,
    dayEndHour = 23,
    weekendDays = [0, 6],
    markWeekend = true,
    disabledDate,
    selectedDate,
    defaultSelectedDate,
    rangeValue,
    defaultRangeValue,
    locale = 'zh-CN',
    onChange,
    onSelect,
    onRangeChange,
    onDateClick,
    onMoreClick,
    onEventClick,
    dateCell,
    event,
    ariaLabel,
    popup = false,
    open,
    defaultOpen = false,
    onOpenChange,
    placement = 'bottomStart',
    getContainer,
    trigger,
    virtualizeDay = 'auto',
    virtualizeThreshold = 18,
    timelineViewportHeight = 360,
  }: Props = $props();

  const loc = useLocale();
  // 单例 live region（polite）：切月/年、移动焦点、选中日期时播报可读文本（红线 #3：命令式）。
  const announcer = useLiveAnnouncer();

  // 一次性常量：今天（render 用于派生 today/past 态，不放 $state 反复 new）
  const today = new Date();

  // --- 锚点 value：受控不回写 (红线 #1) ---
  function initValue(): Date {
    return defaultValue ?? new Date();
  }
  const isValueControlled = $derived(value !== undefined);
  let innerValue = $state<Date>(initValue());
  const currentValue = $derived(isValueControlled ? (value as Date) : innerValue);

  // --- 选中日 selectedDate：受控不回写 (红线 #1) ---
  function initSelected(): Date | null {
    return defaultSelectedDate ?? null;
  }
  const isSelectedControlled = $derived(selectedDate !== undefined);
  let innerSelected = $state<Date | null>(initSelected());
  const currentSelected = $derived(
    isSelectedControlled ? (selectedDate as Date) : innerSelected,
  );

  // --- 选中范围 rangeValue：受控不回写 (红线 #1) ---
  function normRange(r: RangeValue | null | undefined): RangeValue | null {
    if (!r) return null;
    const a = startOfDay(r[0]);
    const b = startOfDay(r[1]);
    return a.getTime() <= b.getTime() ? [a, b] : [b, a];
  }
  const isRangeControlled = $derived(rangeValue !== undefined);
  let innerRange = $state<RangeValue | null>(untrack(() => normRange(defaultRangeValue)));
  const currentRange = $derived(
    isRangeControlled ? normRange(rangeValue) : innerRange,
  );

  // --- range 选择状态机：'start'=待选起点；'end'=已选起点待选终点 ---
  let phase = $state<'start' | 'end'>('start');
  let pendingStart = $state<Date | null>(null);
  let previewEnd = $state<Date | null>(null);

  // --- 弹层展开态：受控不回写仅 onOpenChange (红线 #1) ---
  const isOpenControlled = $derived(open !== undefined);
  let innerOpen = $state(untrack(() => defaultOpen));
  const isOpen = $derived(isOpenControlled ? (open as boolean) : innerOpen);
  function setOpen(next: boolean) {
    if (next === isOpen) return;
    if (!isOpenControlled) innerOpen = next;
    onOpenChange?.({ open: next });
  }
  function toggleOpen() {
    setOpen(!isOpen);
  }

  // --- roving 焦点：被聚焦的日期（纯 $state，网格只有一个 tabindex=0 的格） ---
  // 初值跟随锚点；用户方向键移动时更新，跨月/周则锚点随动重渲染网格。
  let focusedDate = $state<Date | null>(null);
  // 标记下一次重渲染后需把 DOM 焦点落到 focusedDate 对应的格上
  let pendingFocus = $state(false);

  let rootEl = $state<HTMLElement | null>(null);
  let triggerEl = $state<HTMLElement | null>(null);
  let panelEl = $state<HTMLElement | null>(null);

  // --- 网格与分组：全部从 props/本地 $state 派生 (红线 #2) ---
  // day 模式不需要日格网格；给出空数组避免下游再分支
  const cells = $derived(
    mode === 'day'
      ? []
      : mode === 'week'
        ? getWeekGrid(currentValue, weekStartsOn)
        : getMonthGrid(currentValue, weekStartsOn),
  );
  const weeks = $derived(
    mode === 'week'
      ? [cells]
      : mode === 'day'
        ? []
        : Array.from({ length: 6 }, (_, i) => cells.slice(i * 7, (i + 1) * 7)),
  );
  const dayMap = $derived(
    groupEventsByDays(
      events,
      cells.map((c) => c.date),
      maxEventsPerDay,
    ),
  );

  // --- day 视图：单日时间轴（纯派生，红线 #2/#3） ---
  const hourSlots = $derived(
    mode === 'day' ? getDayHours(currentValue, dayStartHour, dayEndHour) : [],
  );
  const dayTimeline = $derived(
    mode === 'day'
      ? timelineForDay(events, currentValue, dayStartHour, dayEndHour)
      : { allDay: [], byHour: new Map<number, CalendarEvent[]>() },
  );

  // --- day 时间轴虚拟化（复用 core fixedRange，红线 #2 派生 / #3 滚动监听命令式）---
  const ROW_H = 40; // 与 --cd-calendar-hour-min-h 默认值对齐（固定行高视口渲染）
  const useVirtual = $derived(
    mode === 'day' &&
      (virtualizeDay === true ||
        (virtualizeDay === 'auto' && hourSlots.length >= virtualizeThreshold)),
  );
  let timelineScrollTop = $state(0);
  // 视口可见行区间（含 overscan），仅虚拟化时计算
  const visibleRange = $derived(
    useVirtual
      ? fixedRange(timelineScrollTop, timelineViewportHeight, ROW_H, hourSlots.length, 3)
      : { startIndex: 0, endIndex: hourSlots.length },
  );
  const visibleSlots = $derived(
    useVirtual ? hourSlots.slice(visibleRange.startIndex, visibleRange.endIndex) : hourSlots,
  );
  // 上/下空白撑高，保证滚动条与 hour 行绝对位置正确
  const padTop = $derived(useVirtual ? visibleRange.startIndex * ROW_H : 0);
  const totalHeight = $derived(useVirtual ? hourSlots.length * ROW_H : 0);

  // 命令式滚动监听 + cleanup（红线 #3）：只在虚拟化时绑定
  let timelineEl = $state<HTMLElement | null>(null);
  $effect(() => {
    if (!useVirtual || !timelineEl) return;
    const el = timelineEl;
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        timelineScrollTop = el.scrollTop;
      });
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    timelineScrollTop = el.scrollTop;
    return () => {
      if (frame) cancelAnimationFrame(frame);
      el.removeEventListener('scroll', onScroll);
    };
  });

  // --- Intl 格式化 ---
  const titleFormatter = $derived(
    new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'long' }),
  );
  const weekdayFormatter = $derived(new Intl.DateTimeFormat(locale, { weekday: 'short' }));
  // week 模式标题：本周首日 ~ 末日（同月则只展示一次月份）
  const rangeTitleFormatter = $derived(
    new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'long', day: 'numeric' }),
  );
  const dayTitleFormatter = $derived(new Intl.DateTimeFormat(locale, { day: 'numeric' }));
  const weekTitle = $derived.by(() => {
    const first = cells[0]?.date;
    const last = cells[cells.length - 1]?.date;
    if (!first || !last) return '';
    const startText = rangeTitleFormatter.format(first);
    const endText =
      first.getMonth() === last.getMonth() && first.getFullYear() === last.getFullYear()
        ? dayTitleFormatter.format(last)
        : rangeTitleFormatter.format(last);
    return `${startText} – ${endText}`;
  });
  // day 模式标题：完整日期（含星期）
  const dayTitleFullFormatter = $derived(
    new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    }),
  );
  // 时间轴每行的小时标签（如 09:00）
  const hourLabelFormatter = $derived(
    new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit', hour12: false }),
  );
  const title = $derived(
    mode === 'week'
      ? weekTitle
      : mode === 'day'
        ? dayTitleFullFormatter.format(currentValue)
        : titleFormatter.format(currentValue),
  );

  // 星期表头：用首周 7 格的 date 生成名称（顺序与 weekStartsOn 一致）
  const weekdayOrderList = $derived(weekdayOrder(weekStartsOn));
  const weekdayNames = $derived(
    cells.slice(0, 7).map((c) => weekdayFormatter.format(c.date)),
  );

  // --- roving 焦点目标（纯派生，红线 #2）---
  // 网格里唯一获得 tabindex=0 的「活动格」：优先用户已聚焦日期，否则选中日/今天/锚点。
  // 若 focusedDate 不在当前网格（跨月翻页后），仍以 focusedDate 为准——它就是要落焦的格。
  const activeDate = $derived.by<Date>(() => {
    if (focusedDate) return focusedDate;
    if (selectionMode === 'single' && currentSelected) return currentSelected;
    const inGridToday = cells.some((c) => isSameDay(c.date, today));
    if (inGridToday) return today;
    // 月视图回退到当月 1 号所在的格，周/日回退到锚点
    return mode === 'month' ? startOfDay(new Date(currentValue.getFullYear(), currentValue.getMonth(), 1)) : currentValue;
  });
  function isActiveCell(date: Date): boolean {
    return isSameDay(date, activeDate);
  }

  // --- 状态写入：仅非受控写 inner，受控只回调 (红线 #1) ---
  function setAnchor(next: Date) {
    if (!isValueControlled) innerValue = next;
    onChange?.({ value: next });
  }

  function step(delta: number): Date {
    if (mode === 'day') return addDays(currentValue, delta);
    if (mode === 'week') return addWeeks(currentValue, delta);
    return addMonths(currentValue, delta);
  }
  // 切月/年/今日：把焦点带到新锚点并 polite 播报其可读全文（formatter 仅依赖 locale，可安全用于任意日期）。
  function announceFocusDate(date: Date) {
    announcer.announce(dayTitleFullFormatter.format(date));
  }
  function goPrev() {
    const next = step(-1);
    setAnchor(next);
    announceFocusDate(next);
  }
  function goNext() {
    const next = step(1);
    setAnchor(next);
    announceFocusDate(next);
  }
  function goToday() {
    const next = new Date();
    setAnchor(next);
    announceFocusDate(next);
  }

  function setSelected(date: Date) {
    if (!isSelectedControlled) innerSelected = date;
    onSelect?.({ date });
    // 选中日期 polite 播报可读全文。
    announcer.announce(
      loc().t('Calendar.selectedDateAnnounce', { date: dayTitleFullFormatter.format(date) }),
    );
  }

  function setRange(next: RangeValue) {
    if (!isRangeControlled) innerRange = next;
    onRangeChange?.({ range: next });
  }

  function isDisabled(date: Date): boolean {
    return disabledDate?.(date) ?? false;
  }

  // range 选择：点第一天设起、第二天设止（排序后提交）
  function onRangeActivate(date: Date) {
    const day = startOfDay(date);
    if (phase === 'start') {
      pendingStart = day;
      previewEnd = day;
      phase = 'end';
      return;
    }
    const a = pendingStart ?? day;
    const next: RangeValue =
      a.getTime() <= day.getTime() ? [a, day] : [day, a];
    setRange(next);
    phase = 'start';
    pendingStart = null;
    previewEnd = null;
  }

  function onCellActivate(date: Date) {
    if (isDisabled(date)) return;
    onDateClick?.({ date });
    if (selectionMode === 'range') {
      onRangeActivate(date);
    } else {
      setSelected(date);
    }
  }

  function onCellHover(date: Date) {
    if (selectionMode === 'range' && phase === 'end' && !isDisabled(date)) {
      previewEnd = startOfDay(date);
    }
  }

  const NAV_KEYS = new Set<string>([
    'ArrowLeft',
    'ArrowRight',
    'ArrowUp',
    'ArrowDown',
    'PageUp',
    'PageDown',
    'Home',
    'End',
  ]);

  // 将 DOM 焦点落到 activeDate 对应的格（重渲染后调用，命令式 + 无监听需 cleanup）
  async function focusActiveCell() {
    await tick();
    const host = rootEl ?? panelEl;
    if (!host) return;
    const el = host.querySelector<HTMLElement>('.cd-calendar__cell--active');
    el?.focus();
  }

  // 网格级 roving 键盘导航（WAI-ARIA grid 模式，红线 #2 派生用纯 gridFocusMove）
  function onGridKeydown(e: KeyboardEvent) {
    const key = e.key;
    if (key === 'Enter' || key === ' ') {
      e.preventDefault();
      onCellActivate(activeDate);
      return;
    }
    // Shift+PageUp/Down：切年（gridFocusMove 不含年级，组件层 ±12 月）
    if (e.shiftKey && (key === 'PageUp' || key === 'PageDown')) {
      e.preventDefault();
      const nextYearDate = addMonths(activeDate, key === 'PageUp' ? -12 : 12);
      focusedDate = nextYearDate;
      const stillVisible = cells.some((c) => isSameDay(c.date, nextYearDate));
      if (!stillVisible) setAnchor(nextYearDate);
      pendingFocus = true;
      announceFocusDate(nextYearDate);
      return;
    }
    if (!NAV_KEYS.has(key)) return;
    e.preventDefault();
    const next = gridFocusMove(
      activeDate,
      key as GridFocusKey,
      mode === 'week' ? 'week' : 'month',
      weekStartsOn,
    );
    if (!next) return;
    focusedDate = next;
    // 跨出当前展示月/周：锚点随动，触发网格重渲染（受控锚点只回调，红线 #1）
    const stillVisible = cells.some((c) => isSameDay(c.date, next));
    if (!stillVisible) setAnchor(next);
    pendingFocus = true;
    announceFocusDate(next);
  }

  // 焦点落格：activeDate / 网格内容变化后，若有待定焦点则把 DOM 焦点移到活动格
  $effect(() => {
    // 依赖 activeDate + cells 确保翻页重渲染后再落焦
    void activeDate;
    void cells;
    if (pendingFocus) {
      pendingFocus = false;
      void focusActiveCell();
    }
  });

  // --- range 区间端点 / 区间内判定（纯派生，红线 #2） ---
  const rangeStart = $derived(phase === 'end' ? pendingStart : (currentRange?.[0] ?? null));
  const rangeEnd = $derived(phase === 'end' ? previewEnd : (currentRange?.[1] ?? null));
  const span = $derived.by<[number, number] | null>(() => {
    if (!rangeStart || !rangeEnd) return null;
    const ta = rangeStart.getTime();
    const tb = rangeEnd.getTime();
    return ta <= tb ? [ta, tb] : [tb, ta];
  });

  function isRangeEdge(date: Date): boolean {
    if (selectionMode !== 'range') return false;
    return isSameDay(date, rangeStart) || isSameDay(date, rangeEnd);
  }
  function isInRange(date: Date): boolean {
    if (selectionMode !== 'range' || !span) return false;
    const t = startOfDay(date).getTime();
    return t > span[0] && t < span[1];
  }

  function onMore(date: Date, total: CalendarEvent[]) {
    onMoreClick?.({ date, events: total });
  }

  // 事件块激活（点击或 Enter/Space）。阻止冒泡避免连带触发日格选择。
  function activateEvent(ev: CalendarEvent, e: Event) {
    e.stopPropagation();
    if (ev.disabled) return;
    onEventClick?.({ event: ev, nativeEvent: e });
  }
  function onEventKeydown(ev: CalendarEvent, e: KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      activateEvent(ev, e);
    }
  }

  // --- popup 外部点击 / Esc 关闭（红线 #3：open 时绑、cleanup 解绑）---
  $effect(() => {
    if (!popup || !isOpen || !triggerEl) return;
    return useDismiss(triggerEl, {
      onDismiss: (reason) => {
        setOpen(false);
        // 仅 Esc 归还焦点到 trigger（外部点击焦点应留在点击处）
        if (reason === 'esc') {
          const btn = triggerEl?.querySelector<HTMLElement>(
            '.cd-calendar-popup__trigger, [data-calendar-trigger]',
          );
          (btn ?? triggerEl)?.focus();
        }
      },
      escape: true,
      outsideClick: true,
      // 浮层门户到 body，点击浮层内部不算外部
      extraTargets: [panelEl],
    });
  });

  // popup 打开后把焦点落到活动格，关闭后归还 trigger（命令式）
  $effect(() => {
    if (!popup) return;
    if (isOpen) {
      pendingFocus = true;
      void focusActiveCell();
    }
  });

  function dayNumber(date: Date): number {
    return date.getDate();
  }

  function isWeekendDay(date: Date): boolean {
    return markWeekend && weekendDays.includes(date.getDay());
  }

  function isTodayDay(date: Date): boolean {
    return isSameDay(date, today);
  }

  function isSelectedDay(date: Date): boolean {
    if (selectionMode === 'range') return false;
    return isSameDay(date, currentSelected);
  }
</script>

{#snippet calendarBody()}
  <div class="cd-calendar__toolbar">
    <button
      type="button"
      class="cd-calendar__nav"
      aria-label={loc().t('Calendar.prev')}
      onclick={goPrev}
    >
      <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" focusable="false">
        <path
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M10 3L5 8l5 5"
        />
      </svg>
    </button>
    <button type="button" class="cd-calendar__today" onclick={goToday}>{loc().t('Calendar.today')}</button>
    <div class="cd-calendar__title">{title}</div>
    <button
      type="button"
      class="cd-calendar__nav"
      aria-label={loc().t('Calendar.next')}
      onclick={goNext}
    >
      <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" focusable="false">
        <path
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M6 3l5 5-5 5"
        />
      </svg>
    </button>
  </div>

  {#if mode === 'day'}
    <div class="cd-calendar__timeline" aria-label={ariaLabel ?? title}>
      {#if dayTimeline.allDay.length > 0}
        <div class="cd-calendar__allday">
          <div class="cd-calendar__allday-label">{loc().t('Calendar.allDay')}</div>
          <div class="cd-calendar__allday-events">
            {#each dayTimeline.allDay as ev (ev.key)}
              {#if event}
                {@render event({ event: ev })}
              {:else}
                <div
                  class="cd-calendar__event"
                  class:cd-calendar__event--disabled={ev.disabled}
                  style:--cd-calendar-event-accent={ev.color ?? 'var(--cd-calendar-event-default-bg)'}
                  role="button"
                  tabindex={ev.disabled ? -1 : 0}
                  aria-disabled={ev.disabled || undefined}
                  aria-label={ev.title}
                  title={ev.title}
                  onclick={(e) => activateEvent(ev, e)}
                  onkeydown={(e) => onEventKeydown(ev, e)}
                >
                  <span class="cd-calendar__event-bar" aria-hidden="true"></span>
                  <span class="cd-calendar__event-title">{ev.title}</span>
                </div>
              {/if}
            {/each}
          </div>
        </div>
      {/if}
      <div
        class="cd-calendar__hours"
        class:cd-calendar__hours--virtual={useVirtual}
        role="list"
        bind:this={timelineEl}
        style:max-block-size={useVirtual ? `${timelineViewportHeight}px` : undefined}
      >
        {#if useVirtual}
          <!-- 撑高占位 + 上空白 padding，仅渲染视口行（复用 core fixedRange）-->
          <div class="cd-calendar__hours-spacer" style:block-size={`${totalHeight}px`}>
            <div style:transform={`translateY(${padTop}px)`}>
              {#each visibleSlots as slot (slot.hour)}
                {@const hourEvents = dayTimeline.byHour.get(slot.hour) ?? []}
                <div class="cd-calendar__hour" role="listitem" style:min-block-size={`${ROW_H}px`}>
                  <div class="cd-calendar__hour-label" aria-hidden="true">
                    {hourLabelFormatter.format(slot.date)}
                  </div>
                  <div class="cd-calendar__hour-slot">
                    {#each hourEvents as ev (ev.key)}
                      {#if event}
                        {@render event({ event: ev })}
                      {:else}
                        <div
                          class="cd-calendar__event cd-calendar__event--timed"
                          class:cd-calendar__event--disabled={ev.disabled}
                          style:--cd-calendar-event-accent={ev.color ?? 'var(--cd-calendar-event-default-bg)'}
                          role="button"
                          tabindex={ev.disabled ? -1 : 0}
                          aria-disabled={ev.disabled || undefined}
                          aria-label={`${hourLabelFormatter.format(ev.start)} ${ev.title}`}
                          title={ev.title}
                          onclick={(e) => activateEvent(ev, e)}
                          onkeydown={(e) => onEventKeydown(ev, e)}
                        >
                          <span class="cd-calendar__event-bar" aria-hidden="true"></span>
                          <span class="cd-calendar__event-time">{hourLabelFormatter.format(ev.start)}</span>
                          <span class="cd-calendar__event-title">{ev.title}</span>
                        </div>
                      {/if}
                    {/each}
                  </div>
                </div>
              {/each}
            </div>
          </div>
        {:else}
          {#each hourSlots as slot (slot.hour)}
            {@const hourEvents = dayTimeline.byHour.get(slot.hour) ?? []}
            <div class="cd-calendar__hour" role="listitem">
              <div class="cd-calendar__hour-label" aria-hidden="true">
                {hourLabelFormatter.format(slot.date)}
              </div>
              <div class="cd-calendar__hour-slot">
                {#each hourEvents as ev (ev.key)}
                  {#if event}
                    {@render event({ event: ev })}
                  {:else}
                    <div
                      class="cd-calendar__event cd-calendar__event--timed"
                      class:cd-calendar__event--disabled={ev.disabled}
                      style:--cd-calendar-event-accent={ev.color ?? 'var(--cd-calendar-event-default-bg)'}
                      title={ev.title}
                    >
                      <span class="cd-calendar__event-bar" aria-hidden="true"></span>
                      <span class="cd-calendar__event-time">{hourLabelFormatter.format(ev.start)}</span>
                      <span class="cd-calendar__event-title">{ev.title}</span>
                    </div>
                  {/if}
                {/each}
              </div>
            </div>
          {/each}
        {/if}
      </div>
    </div>
  {:else}
  <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
  <div
    class="cd-calendar__grid"
    role="grid"
    aria-label={ariaLabel ?? title}
    tabindex="-1"
    onkeydown={onGridKeydown}
  >
    <div class="cd-calendar__row cd-calendar__row--head" role="row">
      {#each weekdayNames as name, i (weekdayOrderList[i])}
        {@const weekend = markWeekend && weekendDays.includes(weekdayOrderList[i] as number)}
        <div
          class="cd-calendar__weekday"
          class:cd-calendar__weekday--weekend={weekend}
          role="columnheader"
        >
          {name}
        </div>
      {/each}
    </div>

    {#each weeks as week, wi (wi)}
      <div class="cd-calendar__row" role="row">
        {#each week as cell (dayKey(cell.date))}
          {@const date = cell.date}
          {@const outside = !cell.inMonth}
          {@const disabled = isDisabled(date)}
          {@const isToday = isTodayDay(date)}
          {@const selected = isSelectedDay(date)}
          {@const weekend = isWeekendDay(date)}
          {@const past = isPastDay(date, today)}
          {@const rangeEdgeCell = isRangeEdge(date)}
          {@const inRangeCell = isInRange(date)}
          {@const active = isActiveCell(date)}
          {@const dayData = dayMap.get(dayKey(date))}
          {@const visible = dayData?.visible ?? []}
          {@const total = dayData?.total ?? []}
          {@const overflow = dayData?.overflow ?? 0}
          <!-- 键盘交互由网格容器统一处理（roving + Enter/Space），格本身只响应点击 -->
          <!-- svelte-ignore a11y_click_events_have_key_events -->
          <div
            class="cd-calendar__cell"
            class:cd-calendar__cell--week={mode === 'week'}
            class:cd-calendar__cell--today={isToday}
            class:cd-calendar__cell--selected={selected}
            class:cd-calendar__cell--range-edge={rangeEdgeCell}
            class:cd-calendar__cell--in-range={inRangeCell}
            class:cd-calendar__cell--outside={outside}
            class:cd-calendar__cell--weekend={weekend}
            class:cd-calendar__cell--disabled={disabled}
            class:cd-calendar__cell--past={past}
            class:cd-calendar__cell--active={active}
            role="gridcell"
            tabindex={disabled ? undefined : active ? 0 : -1}
            aria-selected={selected || rangeEdgeCell || undefined}
            aria-disabled={disabled || undefined}
            aria-current={isToday ? 'date' : undefined}
            onclick={() => onCellActivate(date)}
            onpointerenter={() => onCellHover(date)}
          >
            {#if dateCell}
              {@render dateCell({ date, events: total, isToday, isOutside: outside, disabled })}
            {:else}
              <div class="cd-calendar__date">{dayNumber(date)}</div>
              <div class="cd-calendar__events">
                {#each visible as ev (ev.key)}
                  {#if event}
                    {@render event({ event: ev })}
                  {:else}
                    <div
                      class="cd-calendar__event"
                      class:cd-calendar__event--disabled={ev.disabled}
                      style:--cd-calendar-event-accent={ev.color ?? 'var(--cd-calendar-event-default-bg)'}
                      role="button"
                      tabindex={ev.disabled ? -1 : 0}
                      aria-disabled={ev.disabled || undefined}
                      aria-label={ev.title}
                      title={ev.title}
                      onclick={(e) => activateEvent(ev, e)}
                      onkeydown={(e) => onEventKeydown(ev, e)}
                    >
                      <span class="cd-calendar__event-bar" aria-hidden="true"></span>
                      <span class="cd-calendar__event-title">{ev.title}</span>
                    </div>
                  {/if}
                {/each}
                {#if overflow > 0}
                  <button
                    type="button"
                    class="cd-calendar__more"
                    onclick={(e) => {
                      e.stopPropagation();
                      onMore(date, total);
                    }}
                  >
                    {loc().t('Calendar.moreCount', { count: overflow })}
                  </button>
                {/if}
              </div>
            {/if}
          </div>
        {/each}
      </div>
    {/each}
  </div>
  {/if}
{/snippet}

{#if popup}
  <div class="cd-calendar-popup" bind:this={triggerEl}>
    {#if trigger}
      {@render trigger({ open: isOpen, toggle: toggleOpen })}
    {:else}
      <button
        type="button"
        class="cd-calendar-popup__trigger"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        onclick={toggleOpen}
      >
        <span>{title}</span>
        <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" focusable="false">
          <path fill="currentColor" d="M5 1v1H3.5A1.5 1.5 0 0 0 2 3.5v9A1.5 1.5 0 0 0 3.5 14h9a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 12.5 2H11V1h-1v1H6V1H5Zm7.5 4.5v7h-9v-7h9Z" />
        </svg>
      </button>
    {/if}
    {#if isOpen}
      <div
        bind:this={panelEl}
        class="cd-calendar cd-calendar--popup"
        role="dialog"
        aria-label={ariaLabel ?? title}
        use:floating={{ trigger: triggerEl, placement, offset: 8, autoAdjust: true, getContainer }}
      >
        {@render calendarBody()}
      </div>
    {/if}
  </div>
{:else}
  <div class="cd-calendar" bind:this={rootEl}>
    {@render calendarBody()}
  </div>
{/if}

<style>
  .cd-calendar {
    display: flex;
    flex-direction: column;
    gap: var(--cd-spacing-2);
    color: var(--cd-calendar-text);
    background: var(--cd-calendar-bg);
    border: 1px solid var(--cd-calendar-border);
    border-radius: var(--cd-calendar-radius);
    font-size: var(--cd-font-size-body);
  }

  .cd-calendar__toolbar {
    display: flex;
    align-items: center;
    gap: var(--cd-spacing-2);
    padding: var(--cd-spacing-2) var(--cd-spacing-3);
    background: var(--cd-calendar-header-bg);
    border-bottom: 1px solid var(--cd-calendar-border);
    border-start-start-radius: var(--cd-calendar-radius);
    border-start-end-radius: var(--cd-calendar-radius);
  }

  .cd-calendar__title {
    flex: 1 1 auto;
    font-weight: 600;
  }

  .cd-calendar__nav,
  .cd-calendar__today {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: var(--cd-spacing-1) var(--cd-spacing-2);
    color: inherit;
    background: transparent;
    border: 1px solid var(--cd-calendar-border);
    border-radius: var(--cd-calendar-radius);
    cursor: pointer;
    font: inherit;
    transition: background-color var(--cd-motion-duration-fast) var(--cd-motion-ease-standard);
  }
  .cd-calendar__nav:hover,
  .cd-calendar__today:hover {
    background: var(--cd-calendar-cell-bg-hover);
  }
  .cd-calendar__nav:focus-visible,
  .cd-calendar__today:focus-visible {
    outline: none;
    box-shadow: 0 0 0 2px var(--cd-focus-ring);
  }

  .cd-calendar__grid {
    display: flex;
    flex-direction: column;
  }

  .cd-calendar__row {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
  }

  .cd-calendar__weekday {
    padding: var(--cd-spacing-1);
    color: var(--cd-calendar-text-secondary);
    text-align: center;
    font-weight: 500;
    border-block-end: 1px solid var(--cd-calendar-border);
  }
  .cd-calendar__weekday--weekend {
    background: var(--cd-calendar-weekend-bg);
  }

  .cd-calendar__cell {
    display: flex;
    flex-direction: column;
    gap: var(--cd-spacing-1);
    min-block-size: var(--cd-calendar-cell-min-h);
    padding: var(--cd-spacing-1);
    border-inline-end: 1px solid var(--cd-calendar-border);
    border-block-end: 1px solid var(--cd-calendar-border);
    cursor: pointer;
    outline: none;
    transition: background-color var(--cd-motion-duration-fast) var(--cd-motion-ease-standard);
  }
  .cd-calendar__cell:hover {
    background: var(--cd-calendar-cell-bg-hover);
  }
  .cd-calendar__cell:focus-visible {
    box-shadow: inset 0 0 0 2px var(--cd-focus-ring);
  }
  /* grid roving 焦点容器自身不需可见焦点环（焦点落在活动格） */
  .cd-calendar__grid:focus {
    outline: none;
  }

  .cd-calendar__cell--weekend {
    background: var(--cd-calendar-weekend-bg);
  }
  .cd-calendar__cell--today {
    background: var(--cd-calendar-today-bg);
  }
  .cd-calendar__cell--today .cd-calendar__date {
    color: var(--cd-calendar-today-fg);
    font-weight: 700;
  }
  .cd-calendar__cell--selected {
    box-shadow: inset 0 0 0 2px var(--cd-calendar-selected-border);
  }
  /* range 区间内：浅底连续填充 */
  .cd-calendar__cell--in-range {
    background: var(--cd-calendar-range-bg, var(--cd-calendar-today-bg));
  }
  /* range 端点：实心边框高亮（起止） */
  .cd-calendar__cell--range-edge {
    background: var(--cd-calendar-range-edge-bg, var(--cd-calendar-today-bg));
    box-shadow: inset 0 0 0 2px var(--cd-calendar-selected-border);
  }
  /* week 模式：单行更高，事件区有更多展示空间 */
  .cd-calendar__cell--week {
    min-block-size: var(--cd-calendar-week-cell-min-h, calc(var(--cd-calendar-cell-min-h) * 3));
  }
  .cd-calendar__cell--outside .cd-calendar__date {
    color: var(--cd-calendar-text-secondary);
  }
  .cd-calendar__cell--past .cd-calendar__date {
    opacity: 0.6;
  }
  .cd-calendar__cell--disabled {
    background: var(--cd-calendar-disabled-bg);
    cursor: not-allowed;
    background-image: repeating-linear-gradient(
      45deg,
      transparent,
      transparent 4px,
      var(--cd-calendar-disabled-bg) 4px,
      var(--cd-calendar-disabled-bg) 8px
    );
  }
  .cd-calendar__cell--disabled:hover {
    background-color: var(--cd-calendar-disabled-bg);
  }

  .cd-calendar__date {
    align-self: flex-end;
    font-size: var(--cd-font-size-body);
    line-height: 1.2;
  }

  .cd-calendar__events {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-inline-size: 0;
  }

  .cd-calendar__event {
    display: flex;
    align-items: center;
    gap: var(--cd-spacing-1);
    min-inline-size: 0;
    padding-block: 1px;
    padding-inline: var(--cd-spacing-1);
    color: var(--cd-calendar-text);
    background: var(--cd-calendar-cell-bg-hover);
    border-radius: var(--cd-calendar-radius);
    font-size: 0.75rem;
    line-height: 1.4;
  }
  .cd-calendar__event--disabled {
    opacity: 0.5;
  }
  /* 事件块作为 role=button：键盘焦点环可见 */
  .cd-calendar__event[role='button'] {
    cursor: pointer;
    text-align: start;
  }
  .cd-calendar__event[role='button']:focus-visible {
    outline: none;
    box-shadow: 0 0 0 2px var(--cd-focus-ring);
  }
  .cd-calendar__event--disabled[role='button'] {
    cursor: not-allowed;
  }
  .cd-calendar__event-bar {
    flex: 0 0 auto;
    inline-size: 3px;
    align-self: stretch;
    min-block-size: 0.9em;
    background: var(--cd-calendar-event-accent, var(--cd-calendar-event-default-bg));
    border-radius: 2px;
  }
  .cd-calendar__event-title {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .cd-calendar__more {
    align-self: flex-start;
    padding: 0;
    color: var(--cd-calendar-more-color);
    background: transparent;
    border: none;
    cursor: pointer;
    font: inherit;
    font-size: var(--cd-font-size-caption, 0.85em);
  }
  .cd-calendar__more:hover {
    text-decoration: underline;
  }
  .cd-calendar__more:focus-visible {
    outline: none;
    box-shadow: 0 0 0 2px var(--cd-focus-ring);
    border-radius: var(--cd-calendar-radius);
  }

  /* --- day 视图：单日时间轴 --- */
  .cd-calendar__timeline {
    display: flex;
    flex-direction: column;
  }

  .cd-calendar__allday {
    display: flex;
    align-items: flex-start;
    gap: var(--cd-spacing-2);
    padding: var(--cd-spacing-1) var(--cd-spacing-2);
    border-block-end: 1px solid var(--cd-calendar-border);
    background: var(--cd-calendar-header-bg);
  }
  .cd-calendar__allday-label {
    flex: 0 0 var(--cd-calendar-hour-label-w, 56px);
    color: var(--cd-calendar-text-secondary);
    font-weight: 500;
    text-align: end;
  }
  .cd-calendar__allday-events {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-inline-size: 0;
    flex: 1 1 auto;
  }

  .cd-calendar__hours {
    display: flex;
    flex-direction: column;
  }
  .cd-calendar__hour {
    display: flex;
    align-items: stretch;
    gap: var(--cd-spacing-2);
    min-block-size: var(--cd-calendar-hour-min-h, 40px);
    border-block-end: 1px solid var(--cd-calendar-border);
  }
  .cd-calendar__hour:last-child {
    border-block-end: none;
  }
  .cd-calendar__hour-label {
    flex: 0 0 var(--cd-calendar-hour-label-w, 56px);
    padding: var(--cd-spacing-1) var(--cd-spacing-2);
    color: var(--cd-calendar-text-secondary);
    text-align: end;
    font-variant-numeric: tabular-nums;
    border-inline-end: 1px solid var(--cd-calendar-border);
  }
  .cd-calendar__hour-slot {
    display: flex;
    flex-direction: column;
    gap: 2px;
    flex: 1 1 auto;
    min-inline-size: 0;
    padding: var(--cd-spacing-1);
  }
  .cd-calendar__event--timed {
    padding-block: 2px;
  }
  .cd-calendar__event-time {
    flex: 0 0 auto;
    color: var(--cd-calendar-text-secondary);
    font-variant-numeric: tabular-nums;
    font-size: 0.75rem;
  }

  /* --- 虚拟化时间轴：滚动视口（block 布局，避免 flex 压缩撑高占位）--- */
  .cd-calendar__hours--virtual {
    display: block;
    overflow-y: auto;
    position: relative;
  }
  .cd-calendar__hours-spacer {
    position: relative;
    flex: none;
  }

  /* --- 弹层模式 --- */
  .cd-calendar-popup {
    position: relative;
    display: inline-block;
  }
  .cd-calendar-popup__trigger {
    display: inline-flex;
    align-items: center;
    gap: var(--cd-spacing-2);
    padding: var(--cd-spacing-1) var(--cd-spacing-3);
    color: var(--cd-calendar-text);
    background: var(--cd-calendar-bg);
    border: 1px solid var(--cd-calendar-border);
    border-radius: var(--cd-calendar-radius);
    cursor: pointer;
    font: inherit;
  }
  .cd-calendar-popup__trigger:hover {
    background: var(--cd-calendar-cell-bg-hover);
  }
  .cd-calendar-popup__trigger:focus-visible {
    outline: none;
    box-shadow: 0 0 0 2px var(--cd-focus-ring);
  }
  .cd-calendar--popup {
    z-index: var(--cd-z-popover, 1050);
    inline-size: max-content;
    box-shadow: var(--cd-shadow-elevated, 0 4px 16px rgb(0 0 0 / 0.12));
  }

  @media (prefers-reduced-motion: reduce) {
    .cd-calendar__cell,
    .cd-calendar__nav,
    .cd-calendar__today {
      transition: none;
    }
  }
</style>
