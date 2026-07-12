<!--
  Slider — see specs/components/input/Slider.spec.md
  Single / range slider. APG slider(-multithumb). Controlled / uncontrolled.
  Dragging is IMPERATIVE: rail rect read once on pointerdown into a plain var,
  document pointermove/up listeners added/removed by hand — no reactive
  attachment reads DOM measurements (avoids re-subscribe loops). Variation only
  via onChange; an optional local `dragValue` gives instant feedback while dragging.

  Tooltip is a lightweight absolutely-positioned bubble above each handle, shown
  on hover/focus/drag (or always via alwaysShowTip / forced via tooltipVisible).
  No floating library is pulled in: percent layout already gives the position.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { useLiveAnnouncer } from '@chenzy-design/core';
  import { useLocale } from '../locale-provider/index.js';

  type Size = 'small' | 'default' | 'large';
  type Status = 'default' | 'warning' | 'error';
  type Single = number;
  type Pair = [number, number];
  type SliderValue = Single | Pair;
  /** 刻度值：字符串标签，或对象形式 { label, style }（对齐 Semi 的 marks 富配置）。 */
  type MarkValue = string | { label: string; style?: string };

  interface Props {
    value?: SliderValue;
    defaultValue?: SliderValue;
    min?: number;
    max?: number;
    step?: number | null;
    range?: boolean;
    marks?: Record<number, MarkValue>;
    dots?: boolean;
    included?: boolean;
    vertical?: boolean;
    verticalReverse?: boolean;
    height?: number;
    disabled?: boolean;
    clickable?: boolean;
    size?: Size;
    status?: Status;
    tooltipVisible?: boolean | undefined;
    alwaysShowTip?: boolean;
    tipFormatter?: (value: number) => string | null;
    getAriaValueText?: (value: number, index: number) => string;
    railStyle?: string;
    handleStyle?: string;
    id?: string;
    ariaLabel?: string;
    /** group 容器与各手柄的 aria-labelledby（指向外部 label 的 id）。 */
    ariaLabelledby?: string;
    onChange?: (v: SliderValue) => void;
    /** 拖拽结束（pointerup）或键盘操作落定时触发，适合做请求节流。 */
    onChangeComplete?: (v: SliderValue) => void;
    /** 与 change 同步的低级输入信号（拖动中每次值变化实时触发，表单绑定用）。 */
    onInput?: (v: SliderValue) => void;
    /** 手柄获得焦点，附带手柄索引（0/1）。 */
    onFocus?: (detail: { index: number }) => void;
    /** 手柄失焦，附带手柄索引（0/1）。 */
    onBlur?: (detail: { index: number }) => void;
    /** 已选轨道段自定义样式（range 时为数组，各段对应一个样式对象） */
    trackStyle?: Record<string, string> | Record<string, string>[];
    /** range 模式下两手柄是否可相互推动（true=最小间距 0，number=最小间距值） */
    pushable?: boolean | number;
    /** range 模式下是否允许交叉（默认 true，false 时强制 left <= right） */
    allowCross?: boolean;
    /** 拖拽/点击结束时触发（onChangeComplete 的别名，语义更明确） */
    onAfterChange?: (v: SliderValue) => void;
    /** 显示轨道两端边界值标签 */
    showBoundary?: boolean;
    /** tooltip 是否显示箭头 */
    showArrow?: boolean;
    /** 显示标记文本标签 */
    showMarkLabel?: boolean;
    /** tooltip 跟随标记位置 */
    tooltipOnMark?: boolean;
    /** 自定义手柄圆点样式，range 时为数组 */
    handleDot?: { color: string; size: string } | { color: string; size: string }[];
    /** pointerup 时触发 */
    onMouseUp?: (e: MouseEvent) => void;
    /** 覆盖 getAriaValueText 的 aria-valuetext 文案 */
    ariaValuetext?: string;
    /** 自定义单个刻度标签渲染（替换默认 label 文本）。 */
    mark?: Snippet<[{ value: number; label: string; active: boolean }]>;
    /** 自定义手柄内容（如带数字徽标）。 */
    handle?: Snippet<[{ value: number; index: number; dragging: boolean; focused: boolean }]>;
    /** 自定义数值气泡内部内容（替换默认 tipFormatter 文本）。 */
    tooltip?: Snippet<[{ value: number; index: number }]>;
  }

  let {
    value = $bindable(),
    defaultValue,
    min = 0,
    max = 100,
    step = 1,
    range = false,
    marks,
    dots = false,
    included = true,
    vertical = false,
    verticalReverse = false,
    height = 200,
    disabled = false,
    clickable = true,
    size = 'default',
    status = 'default',
    tooltipVisible = undefined,
    alwaysShowTip = false,
    tipFormatter = String,
    getAriaValueText,
    railStyle,
    handleStyle,
    id,
    ariaLabel,
    ariaLabelledby,
    onChange,
    onChangeComplete,
    onInput,
    onFocus,
    onBlur,
    trackStyle,
    pushable = false,
    allowCross = true,
    onAfterChange,
    showBoundary = false,
    showArrow = true,
    showMarkLabel = true,
    tooltipOnMark = false,
    handleDot,
    onMouseUp,
    ariaValuetext,
    mark,
    handle,
    tooltip,
  }: Props = $props();

  // marks 值统一取 label 文本（对象形式取 .label）。索引访问可能取不到键，容忍 undefined。
  function markLabel(v: MarkValue | undefined): string {
    if (v === undefined) return '';
    return typeof v === 'string' ? v : v.label;
  }
  // marks 对象形式的自定义样式（字符串形式无样式）。
  function markStyle(v: MarkValue | undefined): string | undefined {
    return typeof v === 'string' || v === undefined ? undefined : v.style;
  }
  // 该刻度是否落在已选轨道段内（included 时驱动命中标签色）。
  function markActive(mk: number): boolean {
    const pct = valueToPercent(mk);
    return included && pct >= trackStart - 1e-9 && pct <= trackEnd + 1e-9;
  }

  const loc = useLocale();
  // 单例 live region（polite）：值到达 min/max 边界时播报一次（红线 #3：命令式、事件回调内）。
  const announcer = useLiveAnnouncer();
  // 节流：记住上次播报的边界，连续停在同一边界不重复播；离开后再回到才重播。
  let lastBoundary: 'min' | 'max' | null = null;

  // 任一手柄到达 min/max 时 polite 播报一次（拖拽落定 / 键盘步进后调用）。
  function maybeAnnounceBoundary(v: SliderValue) {
    const reachesMin = Array.isArray(v) ? v[0] <= min : v <= min;
    const reachesMax = Array.isArray(v) ? v[1] >= max : v >= max;
    const boundary: 'min' | 'max' | null = reachesMax ? 'max' : reachesMin ? 'min' : null;
    if (boundary === null) {
      lastBoundary = null;
      return;
    }
    if (boundary === lastBoundary) return;
    lastBoundary = boundary;
    announcer.announce(
      loc().t(boundary === 'max' ? 'Slider.maxReachedAnnounce' : 'Slider.minReachedAnnounce'),
    );
  }

  const isControlled = $derived(value !== undefined);
  let inner = $state<SliderValue>(getInitialValue());
  // While dragging, a local override gives instant visual feedback without
  // writing the controlled prop. null = not dragging.
  let dragValue = $state<SliderValue | null>(null);
  // Which handle (if any) the pointer is hovering / which has focus — drives the
  // hover/focus tooltip without any imperative DOM measurement.
  let hoverIndex = $state<number | null>(null);
  let focusIndex = $state<number | null>(null);

  const current = $derived<SliderValue>(
    dragValue ?? (isControlled ? (value as SliderValue) : inner),
  );

  function getInitialValue(): SliderValue {
    if (defaultValue !== undefined) return defaultValue;
    return range ? [min, min] : min;
  }

  // Normalize to a pair for rendering; single mode uses index 1 (start = min).
  const values = $derived<Pair>(
    range ? (current as Pair) : ([min, current as number] as Pair),
  );

  const markKeys = $derived(
    marks ? Object.keys(marks).map(Number).sort((a, b) => a - b) : [],
  );

  // Dot positions: every step between min and max (skip endpoints duplicates of marks not needed).
  const dotValues = $derived.by<number[]>(() => {
    if (!dots || step === null || step <= 0) return [];
    const out: number[] = [];
    for (let v = min; v <= max + 1e-9; v += step) {
      out.push(Math.round(v * 1e6) / 1e6);
    }
    return out;
  });

  function clampToRange(n: number): number {
    return Math.min(max, Math.max(min, n));
  }

  function snap(n: number): number {
    const clamped = clampToRange(n);
    if (step === null) {
      if (markKeys.length === 0) return clamped;
      return markKeys.reduce((best, k) =>
        Math.abs(k - clamped) < Math.abs(best - clamped) ? k : best,
      );
    }
    const stepped = Math.round((clamped - min) / step) * step + min;
    // Avoid float drift.
    const decimals = decimalsOf(step);
    const factor = 10 ** decimals;
    return clampToRange(Math.round(stepped * factor) / factor);
  }

  function decimalsOf(n: number): number {
    const s = String(n);
    const dot = s.indexOf('.');
    return dot === -1 ? 0 : s.length - dot - 1;
  }

  function valueToPercent(n: number): number {
    if (max === min) return 0;
    return ((n - min) / (max - min)) * 100;
  }

  function commit(next: SliderValue, complete = false) {
    // Controlled: never write the prop; propagate only via onChange.
    if (!isControlled) inner = next;
    onChange?.(next);
    // onInput: low-level input signal, kept in sync with change.
    onInput?.(next);
    // onChangeComplete / onAfterChange: only when the interaction settles (pointerup / keyboard),
    // for request throttling on the consumer side.
    if (complete) {
      onChangeComplete?.(next);
      onAfterChange?.(next);
      maybeAnnounceBoundary(next);
    }
  }

  // Build the next value for a given handle index, honoring allowCross and pushable.
  function withHandle(index: number, raw: number): SliderValue {
    const snapped = snap(raw);
    if (!range) return snapped;
    const pair: Pair = [...(current as Pair)] as Pair;
    pair[index] = snapped;

    if (!allowCross) {
      // Enforce left <= right; clamp instead of swap.
      if (index === 0 && pair[0] > pair[1]) pair[0] = pair[1];
      if (index === 1 && pair[1] < pair[0]) pair[1] = pair[0];
    } else if (pushable !== false) {
      // pushable: minimum gap between handles.
      const minGap = typeof pushable === 'number' ? pushable : 0;
      if (index === 0 && pair[0] > pair[1] - minGap) {
        pair[1] = snap(pair[0] + minGap);
        if (pair[1] > max) { pair[1] = max; pair[0] = snap(max - minGap); }
      }
      if (index === 1 && pair[1] < pair[0] + minGap) {
        pair[0] = snap(pair[1] - minGap);
        if (pair[0] < min) { pair[0] = min; pair[1] = snap(min + minGap); }
      }
    } else {
      // Default: swap so handles never cross.
      if (pair[0] > pair[1]) {
        return [pair[1], pair[0]];
      }
    }
    return pair;
  }

  // ---- Imperative pointer drag ----
  // Plain (non-reactive): rail rect is read once on pointerdown; DOM ref set via bind.
  let railRect: DOMRect | null = null;
  let railElement: HTMLElement | null = null;
  // Which handle is being dragged. Read reactively in the template (handle `dragging`
  // state, line 476/622), so it must be $state — otherwise a change wouldn't trigger
  // re-render and correctness would rely on it happening to be assigned before dragValue.
  let activeIndex = $state(0);

  function ratioFromRect(rect: DOMRect, clientX: number, clientY: number): number {
    let ratio: number;
    if (vertical) {
      // Default: bottom = min (value grows upward). verticalReverse flips it.
      ratio = verticalReverse
        ? (clientY - rect.top) / rect.height
        : (rect.bottom - clientY) / rect.height;
    } else {
      const rtl = getComputedStyle(document.documentElement).direction === 'rtl';
      const fromStart = (clientX - rect.left) / rect.width;
      ratio = rtl ? 1 - fromStart : fromStart;
    }
    return Math.min(1, Math.max(0, ratio));
  }

  function rawFromClient(clientX: number, clientY: number): number {
    if (!railRect) return min;
    return min + ratioFromRect(railRect, clientX, clientY) * (max - min);
  }

  function nearestHandle(raw: number): number {
    if (!range) return 0;
    const [a, b] = current as Pair;
    return Math.abs(raw - a) <= Math.abs(raw - b) ? 0 : 1;
  }

  function onPointerMove(e: PointerEvent) {
    const raw = rawFromClient(e.clientX, e.clientY);
    const next = withHandle(activeIndex, raw);
    // Fire onInput on every live value change during the drag; only emit when the
    // value actually moved to avoid spamming identical values per pixel.
    if (!sameValue(next, dragValue)) onInput?.(next);
    dragValue = next;
  }

  function onPointerUp(e?: PointerEvent) {
    document.removeEventListener('pointermove', onPointerMove);
    document.removeEventListener('pointerup', onPointerUp);
    if (e) onMouseUp?.(e as MouseEvent);
    if (dragValue !== null) {
      const finalValue = dragValue;
      dragValue = null;
      // Drag settled: emit change + changeComplete (onInput already fired live).
      if (!isControlled) inner = finalValue;
      onChange?.(finalValue);
      onChangeComplete?.(finalValue);
      onAfterChange?.(finalValue);
      maybeAnnounceBoundary(finalValue);
    }
    railRect = null;
  }

  function sameValue(a: SliderValue, b: SliderValue | null): boolean {
    if (b === null) return false;
    if (Array.isArray(a) && Array.isArray(b)) return a[0] === b[0] && a[1] === b[1];
    return a === b;
  }

  function beginDrag(index: number, e: PointerEvent) {
    if (disabled || !railElement) return;
    activeIndex = index;
    railRect = railElement.getBoundingClientRect();
    dragValue = withHandle(index, rawFromClient(e.clientX, e.clientY));
    document.addEventListener('pointermove', onPointerMove);
    document.addEventListener('pointerup', onPointerUp);
  }

  function handleHandlePointerDown(index: number, e: PointerEvent) {
    if (disabled || !railElement) return;
    e.preventDefault();
    (e.currentTarget as HTMLElement).focus();
    beginDrag(index, e);
  }

  function handleRailPointerDown(e: PointerEvent) {
    if (disabled || !railElement || !clickable) return;
    const rect = railElement.getBoundingClientRect();
    const raw = min + ratioFromRect(rect, e.clientX, e.clientY) * (max - min);
    beginDrag(nearestHandle(raw), e);
  }

  // RTL detection for keyboard mapping (SSR-safe). Mirrors the pointer path which
  // reads documentElement direction.
  function isRtl(): boolean {
    if (typeof document === 'undefined') return false;
    return getComputedStyle(document.documentElement).direction === 'rtl';
  }

  // Map an arrow key to +1 / -1 / 0 (other) so the *visual* direction always
  // matches increase/decrease, honoring vertical + verticalReverse + RTL.
  // Horizontal: Right increases, Left decreases — flipped under RTL.
  // Vertical: Up increases, Down decreases — flipped under verticalReverse.
  // (The cross-axis arrows stay consistent with APG: Right/Up increase.)
  function arrowDirection(key: string): -1 | 0 | 1 {
    const rtl = isRtl();
    switch (key) {
      case 'ArrowUp':
        return vertical && verticalReverse ? -1 : 1;
      case 'ArrowDown':
        return vertical && verticalReverse ? 1 : -1;
      case 'ArrowRight':
        return rtl ? -1 : 1;
      case 'ArrowLeft':
        return rtl ? 1 : -1;
      default:
        return 0;
    }
  }

  function handleKeydown(index: number, e: KeyboardEvent) {
    if (disabled) return;
    const cur = handleValue(index);
    const stepSize = step ?? 1;
    const bigStep = stepSize * 10;
    let next = cur;
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowUp':
      case 'ArrowLeft':
      case 'ArrowDown':
        next = cur + arrowDirection(e.key) * stepSize;
        break;
      case 'PageUp':
        next = cur + bigStep;
        break;
      case 'PageDown':
        next = cur - bigStep;
        break;
      case 'Home':
        next = min;
        break;
      case 'End':
        next = max;
        break;
      default:
        return;
    }
    e.preventDefault();
    // Keyboard step settles immediately: change + input + changeComplete.
    commit(withHandle(index, next), true);
  }

  // Track geometry (percent) for the filled segment.
  const trackStart = $derived(range ? valueToPercent(values[0]) : 0);
  const trackEnd = $derived(valueToPercent(range ? values[1] : (current as number)));
  const handleList = $derived(range ? ([0, 1] as const) : ([1] as const));

  function handleValue(index: number): number {
    if (!range) return current as number;
    return (current as Pair)[index] ?? min;
  }

  // Per-handle aria-valuemin/max. In range mode the two handles must not report
  // ranges that allow crossing: the low handle (0) caps its max at the high
  // handle's current value, and the high handle (1) floors its min at the low
  // handle's current value (防越界的可达性表达 — spec §6).
  function handleMin(index: number): number {
    if (range && index === 1) return (current as Pair)[0] ?? min;
    return min;
  }
  function handleMax(index: number): number {
    if (range && index === 0) return (current as Pair)[1] ?? max;
    return max;
  }

  // A dot sits inside the filled segment (active) when between trackStart/End.
  function dotActive(v: number): boolean {
    const pct = valueToPercent(v);
    return included && pct >= trackStart - 1e-9 && pct <= trackEnd + 1e-9;
  }

  // Should the value bubble show for a given handle?
  function tipText(index: number): string | null {
    return tipFormatter ? tipFormatter(handleValue(index)) : String(handleValue(index));
  }
  function tipShown(index: number): boolean {
    if (tipText(index) === null) return false;
    if (tooltipVisible !== undefined) return tooltipVisible;
    if (alwaysShowTip) return true;
    if (dragValue !== null && activeIndex === index) return true;
    return hoverIndex === index || focusIndex === index;
  }

  function ariaValueText(index: number): string | undefined {
    const v = handleValue(index);
    if (getAriaValueText) return getAriaValueText(v, index);
    const t = tipFormatter ? tipFormatter(v) : null;
    return t ?? undefined;
  }

  // Position style for an element at a value percent, honoring direction.
  function posStyle(pct: number): string {
    if (vertical) {
      return verticalReverse ? `inset-block-start: ${pct}%` : `inset-block-end: ${pct}%`;
    }
    return `inset-inline-start: ${pct}%`;
  }

  function handleDotStyle(index: number): string {
    if (!handleDot) return '';
    const dot = Array.isArray(handleDot) ? handleDot[index] : handleDot;
    if (!dot) return '';
    const parts: string[] = [];
    if (dot.color) parts.push(`--cd-slider-dot-color:${dot.color}`);
    if (dot.size) parts.push(`--cd-slider-dot-size:${dot.size}`);
    return parts.join(';');
  }

  const cls = $derived(
    [
      'cd-slider',
      `cd-slider--${size}`,
      `cd-slider--${vertical ? 'vertical' : 'horizontal'}`,
      vertical && verticalReverse && 'cd-slider--reverse',
      status !== 'default' && `cd-slider--${status}`,
      disabled && 'cd-slider--disabled',
    ]
      .filter(Boolean)
      .join(' '),
  );

  // Track segment style: anchor + size, honoring vertical reverse.
  const trackSegStyle = $derived.by(() => {
    const segSize = `${trackEnd - trackStart}%`;
    if (vertical) {
      return verticalReverse
        ? `inset-block-start: ${trackStart}%; block-size: ${segSize}`
        : `inset-block-end: ${trackStart}%; block-size: ${segSize}`;
    }
    return `inset-inline-start: ${trackStart}%; inline-size: ${segSize}`;
  });

  // trackStyle: merge user-provided custom track styles into the segment style string.
  // In range mode trackStyle may be an array; index 0 applies to the single segment
  // (the filled area between the two handles). Single mode uses index 0 or the object directly.
  function getTrackStyleStr(segIndex: number): string {
    if (!trackStyle) return '';
    const styleObj = Array.isArray(trackStyle) ? trackStyle[segIndex] : trackStyle;
    if (!styleObj) return '';
    return Object.entries(styleObj).map(([k, v]) => `${k}: ${v}`).join('; ');
  }
</script>

<div
  {id}
  class={cls}
  class:cd-slider--vertical={vertical}
  class:cd-slider--tooltip-on-mark={tooltipOnMark}
  role="group"
  aria-label={ariaLabelledby ? undefined : ariaLabel}
  aria-labelledby={ariaLabelledby}
  aria-disabled={disabled || undefined}
  style={vertical ? `block-size: ${height}px` : undefined}
>
  {#if showBoundary}<span class="cd-slider__boundary-min">{min}</span>{/if}
  <div
    class="cd-slider__rail"
    role="presentation"
    bind:this={railElement}
    style={railStyle}
    onpointerdown={handleRailPointerDown}
  >
    {#if included}
      <div
        class="cd-slider__track"
        style={[trackSegStyle, getTrackStyleStr(0)].filter(Boolean).join('; ')}
      ></div>
    {/if}

    {#each dotValues as dv (dv)}
      {@const pct = valueToPercent(dv)}
      <span
        class="cd-slider__dot"
        class:cd-slider__dot--active={dotActive(dv)}
        style={posStyle(pct)}
      ></span>
    {/each}

    {#each markKeys as mk (mk)}
      {@const pct = valueToPercent(mk)}
      {@const mv = marks![mk]}
      {@const active = markActive(mk)}
      <span
        class="cd-slider__mark"
        class:cd-slider__mark--active={active}
        class:cd-slider__mark-label--hidden={!showMarkLabel}
        style={[posStyle(pct), markStyle(mv)].filter(Boolean).join('; ')}
      >
        {#if mark}{@render mark({ value: mk, label: markLabel(mv), active })}{:else}{markLabel(mv)}{/if}
        {#if tooltipOnMark}
          <span class="cd-slider__mark-tip" role="tooltip" aria-hidden="true">{markLabel(mv)}</span>
        {/if}
      </span>
    {/each}

    {#each handleList as index (index)}
      {@const hv = handleValue(index)}
      {@const pct = valueToPercent(hv)}
      <span
        class="cd-slider__handle"
        role="slider"
        tabindex={disabled ? -1 : 0}
        aria-label={ariaLabelledby ? undefined : ariaLabel}
        aria-labelledby={ariaLabelledby}
        aria-orientation={vertical ? 'vertical' : 'horizontal'}
        aria-valuemin={handleMin(index)}
        aria-valuemax={handleMax(index)}
        aria-valuenow={hv}
        aria-valuetext={ariaValuetext ?? ariaValueText(index)}
        aria-disabled={disabled || undefined}
        data-show-arrow={showArrow}
        style={[posStyle(pct), handleStyle ?? '', handleDotStyle(index)].filter(Boolean).join(';')}
        onpointerdown={(e) => handleHandlePointerDown(index, e)}
        onkeydown={(e) => handleKeydown(index, e)}
        onpointerenter={() => (hoverIndex = index)}
        onpointerleave={() => (hoverIndex = null)}
        onfocus={() => {
          focusIndex = index;
          onFocus?.({ index });
        }}
        onblur={() => {
          focusIndex = null;
          onBlur?.({ index });
        }}
      >
        {#if handle}{@render handle({ value: hv, index, dragging: dragValue !== null && activeIndex === index, focused: focusIndex === index })}{/if}
        {#if tipShown(index)}
          <span class="cd-slider__tip" role="tooltip" aria-hidden="true">
            {#if tooltip}{@render tooltip({ value: hv, index })}{:else}{tipText(index)}{/if}
          </span>
        {/if}
      </span>
    {/each}
  </div>
  {#if showBoundary}<span class="cd-slider__boundary-max">{max}</span>{/if}
</div>

<style>
  .cd-slider {
    position: relative;
    display: flex;
    align-items: center;
    inline-size: 100%;
    padding-block: var(--cd-slider-padding);
    touch-action: none;
  }
  .cd-slider--vertical {
    display: inline-flex;
    inline-size: auto;
    block-size: 200px;
    padding-block: 0;
    padding-inline: var(--cd-slider-padding);
  }
  .cd-slider__rail {
    position: relative;
    flex: 1 1 auto;
    inline-size: 100%;
    block-size: var(--cd-slider-rail-height);
    background: var(--cd-slider-rail-bg);
    border-radius: var(--cd-slider-radius);
    cursor: pointer;
  }
  .cd-slider--vertical .cd-slider__rail {
    inline-size: var(--cd-slider-rail-height);
    block-size: 100%;
  }
  .cd-slider__track {
    position: absolute;
    inset-block: 0;
    inset-inline-start: 0;
    block-size: 100%;
    background: var(--cd-slider-track-bg);
    border-radius: var(--cd-slider-radius);
  }
  .cd-slider--vertical .cd-slider__track {
    inset-block: auto;
    inset-inline: 0;
    inline-size: 100%;
  }
  .cd-slider__handle {
    position: absolute;
    inset-block-start: 50%;
    inline-size: var(--cd-slider-handle-size);
    block-size: var(--cd-slider-handle-size);
    background: var(--cd-slider-handle-bg);
    border: var(--cd-slider-handle-border-width) solid var(--cd-slider-handle-border);
    border-radius: var(--cd-slider-handle-radius);
    transform: translate(-50%, -50%);
    cursor: grab;
    outline: none;
    transition: box-shadow var(--cd-slider-handle-transition-duration) var(--cd-slider-handle-transition-easing);
  }
  .cd-slider--vertical .cd-slider__handle {
    inset-block-start: auto;
    inset-inline-start: 50%;
    transform: translate(-50%, 50%);
  }
  /* Reverse vertical: handle anchored from the top, offset upward by half. */
  .cd-slider--vertical.cd-slider--reverse .cd-slider__handle {
    transform: translate(-50%, -50%);
  }
  /* Custom handle dot (only rendered when handleDot sets the color variable). */
  .cd-slider__handle[style*='--cd-slider-dot-color']::before {
    content: '';
    position: absolute;
    inset-block-start: 50%;
    inset-inline-start: 50%;
    inline-size: var(--cd-slider-dot-size, 6px);
    block-size: var(--cd-slider-dot-size, 6px);
    background: var(--cd-slider-dot-color);
    border-radius: var(--cd-slider-handle-radius);
    transform: translate(-50%, -50%);
    pointer-events: none;
  }
  .cd-slider__handle:hover {
    box-shadow: var(--cd-slider-handle-shadow-hover);
  }
  .cd-slider__handle:active {
    cursor: grabbing;
  }
  .cd-slider__handle:focus-visible {
    box-shadow: var(--cd-slider-handle-focus-ring);
  }
  /* Value bubble above the handle. */
  .cd-slider__tip {
    position: absolute;
    inset-block-end: calc(100% + var(--cd-slider-gap));
    inset-inline-start: 50%;
    transform: translateX(-50%);
    padding: 2px var(--cd-slider-gap);
    background: var(--cd-slider-tip-bg);
    color: var(--cd-slider-tip-color);
    font-size: var(--cd-slider-tip-font-size);
    line-height: 1.4;
    white-space: nowrap;
    border-radius: var(--cd-slider-tip-radius);
    pointer-events: none;
    z-index: 1;
  }
  .cd-slider--vertical .cd-slider__tip {
    inset-block-end: 50%;
    inset-inline-start: calc(100% + var(--cd-slider-gap));
    transform: translateY(50%);
  }
  /* Step dots. */
  .cd-slider__dot {
    position: absolute;
    inset-block-start: 50%;
    inline-size: var(--cd-slider-dot-size);
    block-size: var(--cd-slider-dot-size);
    background: var(--cd-slider-dot-bg);
    border: 2px solid var(--cd-slider-dot-color, var(--cd-slider-dot-border));
    border-radius: var(--cd-slider-handle-radius);
    transform: translate(-50%, -50%);
    pointer-events: none;
  }
  .cd-slider__dot--active {
    border-color: var(--cd-slider-dot-border-active);
  }
  .cd-slider--vertical .cd-slider__dot {
    inset-block-start: auto;
    inset-inline-start: 50%;
    transform: translate(-50%, 50%);
  }
  .cd-slider--vertical.cd-slider--reverse .cd-slider__dot {
    transform: translate(-50%, -50%);
  }
  .cd-slider__mark {
    position: absolute;
    inset-block-start: calc(100% + var(--cd-slider-gap));
    transform: translateX(-50%);
    color: var(--cd-slider-mark-color);
    font-size: var(--cd-slider-mark-font-size);
    white-space: nowrap;
  }
  .cd-slider--vertical .cd-slider__mark {
    inset-block-start: auto;
    inset-inline-start: calc(100% + var(--cd-slider-gap));
    transform: translateY(50%);
  }
  .cd-slider--vertical.cd-slider--reverse .cd-slider__mark {
    transform: translateY(-50%);
  }
  /* 命中刻度（落在已选段内）标签变色。 */
  .cd-slider__mark--active {
    color: var(--cd-slider-mark-color-active);
  }
  /* showMarkLabel=false: keep the tick dot but hide its text label. */
  .cd-slider__mark-label--hidden {
    visibility: hidden;
  }
  /* tooltipOnMark: 刻度上方的数值气泡，默认隐藏，hover 刻度时浮现。 */
  .cd-slider__mark-tip {
    position: absolute;
    inset-block-end: calc(100% + var(--cd-slider-gap));
    inset-inline-start: 50%;
    transform: translateX(-50%);
    padding: 2px var(--cd-slider-gap);
    background: var(--cd-slider-tip-bg);
    color: var(--cd-slider-tip-color);
    font-size: var(--cd-slider-tip-font-size);
    line-height: 1.4;
    white-space: nowrap;
    border-radius: var(--cd-slider-tip-radius);
    opacity: 0;
    pointer-events: none;
    transition: opacity var(--cd-slider-handle-transition-duration) var(--cd-slider-handle-transition-easing);
    z-index: 1;
  }
  .cd-slider__mark:hover .cd-slider__mark-tip {
    opacity: 1;
  }
  @media (prefers-reduced-motion: reduce) {
    .cd-slider__mark-tip {
      transition: none;
    }
  }
  /* Boundary value labels flanking the rail (showBoundary). */
  .cd-slider__boundary-min,
  .cd-slider__boundary-max {
    flex: 0 0 auto;
    color: var(--cd-slider-boundary-color);
    font-size: var(--cd-slider-boundary-font-size);
    white-space: nowrap;
  }
  .cd-slider__boundary-min {
    margin-inline-end: var(--cd-slider-boundary-gap);
  }
  .cd-slider__boundary-max {
    margin-inline-start: var(--cd-slider-boundary-gap);
  }
  .cd-slider--vertical .cd-slider__boundary-min,
  .cd-slider--vertical .cd-slider__boundary-max {
    margin-inline: 0;
    margin-block: var(--cd-slider-gap);
  }
  .cd-slider--disabled {
    opacity: 0.5;
  }
  .cd-slider--disabled .cd-slider__rail,
  .cd-slider--disabled .cd-slider__handle {
    cursor: not-allowed;
  }
  .cd-slider--disabled .cd-slider__track {
    background: var(--cd-slider-track-disabled-bg);
  }
  /* 校验态：已选轨道段与手柄边框改用 warning/error 色调（disabled 优先）。 */
  .cd-slider--warning:not(.cd-slider--disabled) .cd-slider__track {
    background: var(--cd-slider-status-warning);
  }
  .cd-slider--warning:not(.cd-slider--disabled) .cd-slider__handle {
    border-color: var(--cd-slider-status-warning);
  }
  .cd-slider--error:not(.cd-slider--disabled) .cd-slider__track {
    background: var(--cd-slider-status-error);
  }
  .cd-slider--error:not(.cd-slider--disabled) .cd-slider__handle {
    border-color: var(--cd-slider-status-error);
  }
  @media (prefers-reduced-motion: reduce) {
    .cd-slider__handle {
      transition: none;
    }
  }
</style>
