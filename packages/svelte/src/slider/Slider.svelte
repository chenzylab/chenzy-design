<!--
  Slider — see specs/components/input/Slider.spec.md
  Single / range slider. APG slider(-multithumb). Controlled / uncontrolled.
  Dragging is IMPERATIVE: rail rect read once on pointerdown into a plain var,
  document pointermove/up listeners added/removed by hand — no reactive
  attachment reads DOM measurements (avoids re-subscribe loops). Variation only
  via onChange; an optional local `dragValue` gives instant feedback while dragging.
-->
<script lang="ts">
  type Size = 'small' | 'default' | 'large';
  type Status = 'default' | 'warning' | 'error';
  type Single = number;
  type Pair = [number, number];
  type SliderValue = Single | Pair;

  interface Props {
    value?: SliderValue;
    defaultValue?: SliderValue;
    min?: number;
    max?: number;
    step?: number | null;
    range?: boolean;
    marks?: Record<number, string>;
    included?: boolean;
    vertical?: boolean;
    height?: number;
    disabled?: boolean;
    size?: Size;
    status?: Status;
    ariaLabel?: string;
    onChange?: (v: SliderValue) => void;
  }

  let {
    value = $bindable(),
    defaultValue,
    min = 0,
    max = 100,
    step = 1,
    range = false,
    marks,
    included = true,
    vertical = false,
    height = 200,
    disabled = false,
    size = 'default',
    status = 'default',
    ariaLabel,
    onChange,
  }: Props = $props();

  const isControlled = $derived(value !== undefined);
  let inner = $state<SliderValue>(getInitialValue());
  // While dragging, a local override gives instant visual feedback without
  // writing the controlled prop. null = not dragging.
  let dragValue = $state<SliderValue | null>(null);

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

  function commit(next: SliderValue) {
    // Controlled: never write the prop; propagate only via onChange.
    if (!isControlled) inner = next;
    onChange?.(next);
  }

  // Build the next value for a given handle index, keeping range handles ordered.
  function withHandle(index: number, raw: number): SliderValue {
    const snapped = snap(raw);
    if (!range) return snapped;
    const pair: Pair = [...(current as Pair)] as Pair;
    pair[index] = snapped;
    if (pair[0] > pair[1]) {
      // Swap so handles never cross.
      return [pair[1], pair[0]];
    }
    return pair;
  }

  // ---- Imperative pointer drag ----
  // Plain (non-reactive) variables: rail rect is read once on pointerdown.
  let railRect: DOMRect | null = null;
  let activeIndex = 0;
  let railElement: HTMLElement | null = null;

  function ratioFromRect(rect: DOMRect, clientX: number, clientY: number): number {
    let ratio: number;
    if (vertical) {
      ratio = (rect.bottom - clientY) / rect.height;
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
    dragValue = withHandle(activeIndex, raw);
  }

  function onPointerUp() {
    document.removeEventListener('pointermove', onPointerMove);
    document.removeEventListener('pointerup', onPointerUp);
    if (dragValue !== null) {
      const finalValue = dragValue;
      dragValue = null;
      commit(finalValue);
    }
    railRect = null;
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
    if (disabled || !railElement) return;
    const rect = railElement.getBoundingClientRect();
    const raw = min + ratioFromRect(rect, e.clientX, e.clientY) * (max - min);
    beginDrag(nearestHandle(raw), e);
  }

  function handleKeydown(index: number, e: KeyboardEvent) {
    if (disabled) return;
    const cur = handleValue(index);
    const bigStep = (step ?? 1) * 10;
    let next = cur;
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowUp':
        next = cur + (step ?? 1);
        break;
      case 'ArrowLeft':
      case 'ArrowDown':
        next = cur - (step ?? 1);
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
    commit(withHandle(index, next));
  }

  // Track geometry (percent) for the filled segment.
  const trackStart = $derived(range ? valueToPercent(values[0]) : 0);
  const trackEnd = $derived(valueToPercent(range ? values[1] : (current as number)));
  const handleList = $derived(range ? ([0, 1] as const) : ([1] as const));

  function handleValue(index: number): number {
    if (!range) return current as number;
    return (current as Pair)[index] ?? min;
  }

  const cls = $derived(
    [
      'cd-slider',
      `cd-slider--${size}`,
      `cd-slider--${vertical ? 'vertical' : 'horizontal'}`,
      status !== 'default' && `cd-slider--${status}`,
      disabled && 'cd-slider--disabled',
    ]
      .filter(Boolean)
      .join(' '),
  );
</script>

<div
  class={cls}
  class:cd-slider--vertical={vertical}
  role="group"
  aria-label={ariaLabel}
  aria-disabled={disabled || undefined}
  style={vertical ? `block-size: ${height}px` : undefined}
>
  <div
    class="cd-slider__rail"
    role="presentation"
    bind:this={railElement}
    onpointerdown={handleRailPointerDown}
  >
    {#if included}
      <div
        class="cd-slider__track"
        style={vertical
          ? `inset-block-end: ${trackStart}%; block-size: ${trackEnd - trackStart}%`
          : `inset-inline-start: ${trackStart}%; inline-size: ${trackEnd - trackStart}%`}
      ></div>
    {/if}

    {#each markKeys as mk (mk)}
      {@const pct = valueToPercent(mk)}
      <span
        class="cd-slider__mark"
        style={vertical ? `inset-block-end: ${pct}%` : `inset-inline-start: ${pct}%`}
      >{marks?.[mk]}</span>
    {/each}

    {#each handleList as index (index)}
      {@const hv = handleValue(index)}
      {@const pct = valueToPercent(hv)}
      <span
        class="cd-slider__handle"
        role="slider"
        tabindex={disabled ? -1 : 0}
        aria-label={ariaLabel}
        aria-orientation={vertical ? 'vertical' : 'horizontal'}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={hv}
        aria-disabled={disabled || undefined}
        style={vertical ? `inset-block-end: ${pct}%` : `inset-inline-start: ${pct}%`}
        onpointerdown={(e) => handleHandlePointerDown(index, e)}
        onkeydown={(e) => handleKeydown(index, e)}
      ></span>
    {/each}
  </div>
</div>

<style>
  .cd-slider {
    position: relative;
    display: flex;
    align-items: center;
    inline-size: 100%;
    padding-block: var(--cd-spacing-2);
    touch-action: none;
  }
  .cd-slider--vertical {
    display: inline-flex;
    inline-size: auto;
    block-size: 200px;
    padding-block: 0;
    padding-inline: var(--cd-spacing-2);
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
    border: 2px solid var(--cd-slider-handle-border);
    border-radius: var(--cd-radius-full);
    transform: translate(-50%, -50%);
    cursor: grab;
    outline: none;
    transition: box-shadow var(--cd-motion-duration-fast) var(--cd-motion-ease-standard);
  }
  .cd-slider--vertical .cd-slider__handle {
    inset-block-start: auto;
    inset-inline-start: 50%;
    transform: translate(-50%, 50%);
  }
  .cd-slider__handle:hover {
    box-shadow: var(--cd-shadow-1);
  }
  .cd-slider__handle:active {
    cursor: grabbing;
  }
  .cd-slider__handle:focus-visible {
    box-shadow: var(--cd-focus-ring);
  }
  .cd-slider__mark {
    position: absolute;
    inset-block-start: calc(100% + var(--cd-spacing-2));
    transform: translateX(-50%);
    color: var(--cd-slider-mark-color);
    font-size: var(--cd-font-size-1);
    white-space: nowrap;
  }
  .cd-slider--vertical .cd-slider__mark {
    inset-block-start: auto;
    inset-inline-start: calc(100% + var(--cd-spacing-2));
    transform: translateY(50%);
  }
  .cd-slider--disabled {
    opacity: 0.5;
  }
  .cd-slider--disabled .cd-slider__rail,
  .cd-slider--disabled .cd-slider__handle {
    cursor: not-allowed;
  }
  .cd-slider--disabled .cd-slider__track {
    background: var(--cd-color-text-3);
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
