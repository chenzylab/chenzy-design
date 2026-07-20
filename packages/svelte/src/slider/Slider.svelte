<!--
  Slider — 严格对齐 Semi Design（semi-ui/slider）。
  单值 / range 滑块，受控 / 非受控，APG slider(-multithumb) 键盘可达。

  DOM 结构对齐 Semi（index.tsx render）：
   - 水平：<div.cd-slider> > <div.cd-slider-wrapper> > rail / track / dots / handles(div) / marks / boundary
   - 垂直：<div.cd-slider-vertical> > <div.cd-slider-wrapper.cd-slider-vertical-wrapper> …（无外层，对齐 Semi 只渲染 wrapper）
  class 采用连字符 BEM（cd-slider-rail / cd-slider-handle …，对齐 Semi semi-slider-*），
  与已对齐的 Input/checkbox/space 全库连字符化一致。

  数值气泡复用本库 Tooltip 组件（trigger="custom" + visible + position + rePosKey），
  对齐 Semi（每个 handle 由 <Tooltip> 包裹）。不再自绘轻量气泡。

  拖拽命令式：pointerdown 读一次 rail rect 到普通变量，document pointermove/up 手动增删，
  拖动中 dragValue 提供即时视觉反馈；落定后经 onChange / onAfterChange 上抛（range 时已排序）。
-->
<script lang="ts">
  import { useLiveAnnouncer } from '@chenzy-design/core';
  import { useLocale } from '../locale-provider/index.js';
  import Tooltip from '../tooltip/Tooltip.svelte';

  type Single = number;
  type Pair = [number, number];
  type SliderValue = Single | Pair;
  /** 刻度值：字符串标签（对齐 Semi Record<number, string>）。 */
  type MarkValue = string;

  interface Props {
    /** 受控值；range 时为二元组。对齐 Semi value。 */
    value?: SliderValue;
    /** 非受控初始值。对齐 Semi defaultValue。 */
    defaultValue?: SliderValue;
    min?: number;
    max?: number;
    step?: number;
    range?: boolean;
    /** 刻度标记（对齐 Semi marks: Record<number, string>）。 */
    marks?: Record<number, MarkValue>;
    /** 是否填充已选轨道段（对齐 Semi included）。 */
    included?: boolean;
    vertical?: boolean;
    /** 垂直时反向（顶部为 min，对齐 Semi verticalReverse）。 */
    verticalReverse?: boolean;
    disabled?: boolean;
    /** 强制控制数值气泡显隐（受控，对齐 Semi tooltipVisible）。 */
    tooltipVisible?: boolean | undefined;
    /** tooltip 跟随刻度显示（对齐 Semi tooltipOnMark）。 */
    tooltipOnMark?: boolean;
    /** 自定义气泡文案；返回 null/undefined 隐藏气泡（对齐 Semi tipFormatter，默认原样返回）。 */
    tipFormatter?: (value: number) => string | number | null | undefined;
    /** 自定义 aria-valuetext（对齐 Semi getAriaValueText）。 */
    getAriaValueText?: (value: number, index?: number) => string;
    /** 透传轨道内联样式（对齐 Semi railStyle）。 */
    railStyle?: string;
    /** tooltip 是否显示箭头（对齐 Semi showArrow）。 */
    showArrow?: boolean;
    /** 显示刻度文本标签（对齐 Semi showMarkLabel）。 */
    showMarkLabel?: boolean;
    /** hover 时展示轨道两端边界值标签（对齐 Semi showBoundary）。 */
    showBoundary?: boolean;
    /** 自定义手柄圆点样式，range 时为数组（对齐 Semi handleDot）。 */
    handleDot?: { color?: string; size?: string } | { color?: string; size?: string }[];
    id?: string;
    /** 根节点自定义类名（对齐 Semi className）。 */
    class?: string;
    /** 根节点自定义内联样式（对齐 Semi style）。 */
    style?: string;
    ariaLabel?: string;
    ariaLabelledby?: string;
    ariaDescribedby?: string;
    ariaErrormessage?: string;
    ariaRequired?: boolean;
    /** 覆盖 getAriaValueText 的 aria-valuetext 文案（对齐 Semi aria-valuetext）。 */
    ariaValuetext?: string;
    /** 值变化（拖拽中实时 + 键盘），range 时回传已排序数组（对齐 Semi onChange）。 */
    onChange?: (value: SliderValue) => void;
    /** 拖拽结束（pointerup）/点击/键盘落定时触发（对齐 Semi onAfterChange）。 */
    onAfterChange?: (value: SliderValue) => void;
    /** pointerup 时触发（对齐 Semi onMouseUp）。 */
    onMouseUp?: (e: MouseEvent) => void;
  }

  let {
    value,
    defaultValue,
    min = 0,
    max = 100,
    step = 1,
    range = false,
    marks,
    included = true,
    vertical = false,
    verticalReverse = false,
    disabled = false,
    tooltipVisible = undefined,
    tooltipOnMark = false,
    tipFormatter = (v) => v,
    getAriaValueText,
    railStyle,
    showArrow = true,
    showMarkLabel = true,
    showBoundary = false,
    handleDot,
    id,
    class: className,
    style: styleProp,
    ariaLabel,
    ariaLabelledby,
    ariaDescribedby,
    ariaErrormessage,
    ariaRequired,
    ariaValuetext,
    onChange,
    onAfterChange,
    onMouseUp,
  }: Props = $props();

  const loc = useLocale();
  // 单例 live region（polite）：值到达 min/max 边界时播报一次。
  const announcer = useLiveAnnouncer();
  let lastBoundary: 'min' | 'max' | null = null;

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
  // 拖拽中的本地覆盖，给即时视觉反馈（不写受控 prop）。null = 未拖拽。
  let dragValue = $state<SliderValue | null>(null);
  // hover / focus 的手柄索引，驱动气泡显隐（对齐 Semi focusPos）。
  let hoverIndex = $state<number | null>(null);
  let focusIndex = $state<number | null>(null);
  // hover wrapper 时展示 boundary（对齐 Semi handleWrapperEnter/Leave）。
  let wrapperHover = $state(false);

  const current = $derived<SliderValue>(
    dragValue ?? (isControlled ? (value as SliderValue) : inner),
  );

  function getInitialValue(): SliderValue {
    if (defaultValue !== undefined) return defaultValue;
    return range ? [min, min] : min;
  }

  // 归一为一对做渲染；单值用索引 1（起点 = min）。
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
    const s = step > 0 ? step : 1;
    const stepped = Math.round((clamped - min) / s) * s + min;
    const decimals = decimalsOf(s);
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

  // 上抛值：range 时排序（对齐 Semi adapter.notifyChange sort）。
  function sortValue(v: SliderValue): SliderValue {
    return Array.isArray(v) ? ([...v].sort((a, b) => a - b) as Pair) : v;
  }

  function commit(next: SliderValue, complete = false) {
    if (!isControlled) inner = next;
    onChange?.(sortValue(next));
    if (complete) {
      onAfterChange?.(sortValue(next));
      maybeAnnounceBoundary(next);
    }
  }

  // 为某手柄构造下一个值；越过时自动交换（对齐 Semi range 恒排序，无 allowCross/pushable）。
  function withHandle(index: number, raw: number): SliderValue {
    const snapped = snap(raw);
    if (!range) return snapped;
    const pair: Pair = [...(current as Pair)] as Pair;
    pair[index] = snapped;
    if (pair[0] > pair[1]) return [pair[1], pair[0]];
    return pair;
  }

  // ---- 命令式指针拖拽 ----
  let railRect: DOMRect | null = null;
  let railElement: HTMLElement | null = $state(null);
  let activeIndex = $state(0);

  function ratioFromRect(rect: DOMRect, clientX: number, clientY: number): number {
    let ratio: number;
    if (vertical) {
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
    if (!sameValue(next, dragValue)) {
      dragValue = next;
      if (!isControlled) inner = next;
      onChange?.(sortValue(next));
    }
  }

  function onPointerUp(e?: PointerEvent) {
    document.removeEventListener('pointermove', onPointerMove);
    document.removeEventListener('pointerup', onPointerUp);
    if (e) onMouseUp?.(e as unknown as MouseEvent);
    if (dragValue !== null) {
      const finalValue = dragValue;
      dragValue = null;
      if (!isControlled) inner = finalValue;
      onAfterChange?.(sortValue(finalValue));
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
    const next = withHandle(index, rawFromClient(e.clientX, e.clientY));
    dragValue = next;
    if (!isControlled) inner = next;
    onChange?.(sortValue(next));
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

  function isRtl(): boolean {
    if (typeof document === 'undefined') return false;
    return getComputedStyle(document.documentElement).direction === 'rtl';
  }

  // 方向键 → +1 / -1 / 0，令视觉方向恒与增减一致（vertical + verticalReverse + RTL）。
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
    const stepSize = step > 0 ? step : 1;
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
    commit(withHandle(index, next), true);
  }

  // 已选段几何（percent）。
  const trackStart = $derived(range ? valueToPercent(values[0]) : 0);
  const trackEnd = $derived(valueToPercent(range ? values[1] : (current as number)));
  const handleList = $derived(range ? ([0, 1] as const) : ([1] as const));

  function handleValue(index: number): number {
    if (!range) return current as number;
    return (current as Pair)[index] ?? min;
  }

  function handleMin(index: number): number {
    if (range && index === 1) return (current as Pair)[0] ?? min;
    return min;
  }
  function handleMax(index: number): number {
    if (range && index === 0) return (current as Pair)[1] ?? max;
    return max;
  }

  // 刻度是否落在已选段内（included 时驱动命中色，对齐 Semi isMarkActive）。
  function markActive(mk: number): boolean {
    if (!included) return false;
    const pct = valueToPercent(mk);
    return pct >= trackStart - 1e-9 && pct <= trackEnd + 1e-9;
  }

  // 气泡文案：tipFormatter 返回 null/undefined 时隐藏。
  function tipText(index: number): string | null {
    const raw = tipFormatter ? tipFormatter(handleValue(index)) : handleValue(index);
    if (raw === null || raw === undefined) return null;
    return String(raw);
  }
  function tipShown(index: number): boolean {
    if (tipText(index) === null) return false;
    if (tooltipVisible !== undefined) return tooltipVisible;
    if (dragValue !== null && activeIndex === index) return true;
    return hoverIndex === index || focusIndex === index;
  }

  function ariaValueText(index: number): string | undefined {
    const v = handleValue(index);
    if (getAriaValueText) return getAriaValueText(v, index);
    if (ariaValuetext !== undefined) return ariaValuetext;
    const t = tipText(index);
    return t ?? undefined;
  }

  // 元素在某 value 百分比处的定位（对齐 Semi stylePos：vertical→top，RTL→right，否则 left）。
  function posStyle(pct: number): string {
    if (vertical) {
      return verticalReverse ? `inset-block-start: ${pct}%` : `inset-block-end: ${pct}%`;
    }
    return `inset-inline-start: ${pct}%`;
  }

  function handleDotForIndex(index: number): { color?: string; size?: string } | undefined {
    if (!handleDot) return undefined;
    return Array.isArray(handleDot) ? handleDot[index] : handleDot;
  }
  function handleDotStyle(index: number): string {
    const dot = handleDotForIndex(index);
    if (!dot) return '';
    const parts: string[] = [];
    if (dot.size) parts.push(`inline-size:${dot.size}`, `block-size:${dot.size}`);
    if (dot.color) parts.push(`background-color:${dot.color}`);
    return parts.join(';');
  }

  // 已选段样式：锚点 + 尺寸，honoring vertical reverse（对齐 Semi renderTrack）。
  const trackSegStyle = $derived.by(() => {
    const segSize = `${trackEnd - trackStart}%`;
    if (vertical) {
      return verticalReverse
        ? `inset-block-start: ${trackStart}%; block-size: ${segSize}`
        : `inset-block-end: ${trackStart}%; block-size: ${segSize}`;
    }
    return `inset-inline-start: ${trackStart}%; inline-size: ${segSize}`;
  });

  // 手柄拖拽态 class（对齐 Semi handle-clicked）。
  function isHandleClicked(index: number): boolean {
    return dragValue !== null && activeIndex === index;
  }
</script>

{#snippet sliderBody()}
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="cd-slider-wrapper {vertical ? 'cd-slider-vertical-wrapper' : ''} {vertical &&
    verticalReverse
      ? 'cd-slider-reverse'
      : ''} {disabled ? 'cd-slider-disabled' : ''}"
    onmouseenter={() => (wrapperHover = true)}
    onmouseleave={() => (wrapperHover = false)}
  >
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
      class="cd-slider-rail"
      bind:this={railElement}
      style={railStyle}
      onpointerdown={handleRailPointerDown}
    ></div>

    {#if included}
      <div class="cd-slider-track" style={trackSegStyle}></div>
    {/if}

    {#if markKeys.length > 0}
      <div class="cd-slider-dots">
        {#each markKeys as mk (mk)}
          {#if markActive(mk)}
            {@const pct = valueToPercent(mk)}
            <span
              class="cd-slider-dot"
              class:cd-slider-dot-active={markActive(mk)}
              style={posStyle(pct)}
            ></span>
          {/if}
        {/each}
      </div>
    {/if}

    <div>
      {#each handleList as index (index)}
        {@const hv = handleValue(index)}
        {@const pct = valueToPercent(hv)}
        {@const tip = tipText(index)}
        <!--
          复用 Tooltip 组件承载数值气泡（对齐 Semi：每个 handle 由 <Tooltip> 包裹）。
          Tooltip 外层包裹 span 承载手柄的绝对定位（经 wrapperClassName + triggerStyle，
          对齐 Tooltip 注释里 UserGuide 的用法）；手柄 span 自身不再绝对定位，填满包裹 span。
        -->
        <Tooltip
          content={tip ?? ''}
          trigger="custom"
          position={vertical ? 'right' : 'top'}
          {showArrow}
          visible={tip !== null && tipShown(index)}
          rePosKey={pct}
          wrapperClassName="cd-slider-handle-anchor {isHandleClicked(index)
            ? 'cd-slider-handle-anchor-clicked'
            : ''}"
          triggerStyle="{posStyle(pct)}; z-index: {isHandleClicked(index) ? 2 : 1}"
        >
          <span
            class="cd-slider-handle"
            class:cd-slider-handle-clicked={isHandleClicked(index)}
            role="slider"
            tabindex={disabled ? -1 : 0}
            aria-label={ariaLabelledby ? undefined : ariaLabel}
            aria-labelledby={ariaLabelledby}
            aria-describedby={ariaDescribedby}
            aria-orientation={vertical ? 'vertical' : 'horizontal'}
            aria-valuemin={handleMin(index)}
            aria-valuemax={handleMax(index)}
            aria-valuenow={hv}
            aria-valuetext={ariaValueText(index)}
            aria-disabled={disabled || undefined}
            onpointerdown={(e) => handleHandlePointerDown(index, e)}
            onkeydown={(e) => handleKeydown(index, e)}
            onpointerenter={() => (hoverIndex = index)}
            onpointerleave={() => (hoverIndex = null)}
            onfocus={() => (focusIndex = index)}
            onblur={() => (focusIndex = null)}
          >
            {#if handleDotForIndex(index)}
              <div class="cd-slider-handle-dot" style={handleDotStyle(index)}></div>
            {/if}
          </span>
        </Tooltip>
      {/each}
    </div>

    {#if showMarkLabel && markKeys.length > 0}
      <div class="cd-slider-marks">
        {#each markKeys as mk (mk)}
          {#if markActive(mk)}
            {@const pct = valueToPercent(mk)}
            {@const mv = marks![mk] ?? ''}
            <span
              class="cd-slider-mark"
              class:cd-slider-mark-active={markActive(mk)}
              style={posStyle(pct)}
            >
              {#if tooltipOnMark}
                <Tooltip content={mv}>
                  <span>{mv}</span>
                </Tooltip>
              {:else}
                {mv}
              {/if}
            </span>
          {/if}
        {/each}
      </div>
    {/if}

    <div class="cd-slider-boundary" class:cd-slider-boundary-show={showBoundary && wrapperHover}>
      <span class="cd-slider-boundary-min">{min}</span>
      <span class="cd-slider-boundary-max">{max}</span>
    </div>
  </div>
{/snippet}

{#if vertical}
  <div
    {id}
    class="cd-slider-vertical {className ?? ''}"
    style={styleProp}
    role="group"
    aria-label={ariaLabelledby ? undefined : ariaLabel}
    aria-labelledby={ariaLabelledby}
    aria-disabled={disabled || undefined}
  >
    {@render sliderBody()}
  </div>
{:else}
  <div
    {id}
    class="cd-slider {className ?? ''}"
    style={styleProp}
    role="group"
    aria-label={ariaLabelledby ? undefined : ariaLabel}
    aria-labelledby={ariaLabelledby}
    aria-disabled={disabled || undefined}
  >
    {@render sliderBody()}
  </div>
{/if}

<style>
  /* --- 外层（对齐 Semi .semi-slider / .semi-slider-vertical）--- */
  .cd-slider {
    padding: 0 var(--cd-spacing-slider-paddingx);
  }
  .cd-slider-vertical {
    display: inline-block;
    block-size: 100%;
  }

  /* --- wrapper（对齐 Semi .semi-slider-wrapper）--- */
  .cd-slider-wrapper {
    box-sizing: border-box;
    position: relative;
    block-size: var(--cd-height-slider-wrapper);
    inline-size: 100%;
    display: inline-block;
    vertical-align: bottom;
  }
  .cd-slider-vertical-wrapper {
    inline-size: var(--cd-height-slider-rail);
    block-size: 100%;
  }

  /* --- rail（未填充轨道，对齐 Semi .semi-slider-rail）--- */
  .cd-slider-rail {
    box-sizing: border-box;
    position: absolute;
    inset-block-start: var(--cd-spacing-slider-rail-top);
    inline-size: 100%;
    block-size: var(--cd-height-slider-rail);
    background-color: var(--cd-color-slider-rail-bg-default);
    border-radius: var(--cd-radius-slider-rail);
    cursor: pointer;
    touch-action: none;
  }
  .cd-slider-vertical-wrapper .cd-slider-rail {
    inline-size: var(--cd-height-slider-rail);
    block-size: 100%;
    inset-block-start: 0;
  }

  /* --- track（已填充轨道，对齐 Semi .semi-slider-track）--- */
  .cd-slider-track {
    position: absolute;
    inset-block-start: var(--cd-spacing-slider-rail-top);
    block-size: var(--cd-height-slider-track);
    background: var(--cd-color-slider-track-bg-default);
    border-radius: var(--cd-radius-slider-track);
    cursor: pointer;
  }
  .cd-slider-vertical-wrapper .cd-slider-track {
    inline-size: var(--cd-height-slider-track);
    inset-block-start: auto;
    inset-inline-start: 0;
  }

  /* --- handle 锚点（Tooltip 外层包裹 span，承载手柄的绝对定位）。
     用 .cd-slider-wrapper 前缀提高特异性(0,2,0)，稳压 Tooltip 自身 .cd-tooltip(0,1,0)
     的 position:relative/display:inline-block（记忆 svelte-compiler-drops-compound-selector-specificity）。 --- */
  .cd-slider-wrapper :global(.cd-slider-handle-anchor) {
    position: absolute;
    inset-block-start: var(--cd-spacing-slider-rail-top);
    inline-size: var(--cd-width-slider-handle);
    block-size: var(--cd-width-slider-handle);
    margin-block-start: -10px;
    transform: translateX(-50%);
  }
  .cd-slider-vertical-wrapper :global(.cd-slider-handle-anchor) {
    inset-block-start: auto;
    inset-inline-start: 50%;
    margin-block-start: 0;
    margin-inline-start: -10px;
    transform: translateY(50%);
  }

  /* --- handle（圆形按钮，对齐 Semi .semi-slider-handle）：填满锚点 span --- */
  .cd-slider-handle {
    box-sizing: border-box;
    display: inline-flex;
    inline-size: var(--cd-width-slider-handle);
    block-size: var(--cd-width-slider-handle);
    justify-content: center;
    align-items: center;
    background-color: var(--cd-color-slider-handle-bg-default);
    border: none;
    border-radius: 50%;
    box-shadow: var(--cd-shadow-slider-knob);
    cursor: pointer;
    transition: background-color var(--cd-motion-duration-fast) var(--cd-motion-ease-standard);
    outline: none;
  }
  .cd-slider-handle:hover {
    background-color: var(--cd-color-slider-handle-bg-hover);
  }
  .cd-slider-handle:focus-visible {
    outline: var(--cd-width-slider-handle-focus) solid var(--cd-color-slider-handle-focus);
  }
  /* 拖拽态：细描边（对齐 Semi .semi-slider-handle-clicked）。 */
  .cd-slider-handle-clicked {
    border: solid var(--cd-width-slider-handle-clicked) var(--cd-color-slider-handle-border-focus);
    cursor: grabbing;
  }

  /* 手柄内部圆点（对齐 Semi .semi-slider-handle-dot）。 */
  .cd-slider-handle-dot {
    background: var(--cd-color-slider-handle-dot);
    inline-size: var(--cd-width-slider-handle-dot);
    block-size: var(--cd-width-slider-handle-dot);
    border-radius: var(--cd-border-radius-circle);
  }

  /* --- dots（步进/刻度圆点，对齐 Semi .semi-slider-dots > .semi-slider-dot）--- */
  .cd-slider-dots {
    inline-size: 100%;
    background: transparent;
  }
  .cd-slider-dot {
    position: absolute;
    inset-block-start: var(--cd-spacing-slider-rail-top);
    inline-size: var(--cd-width-slider-dot);
    block-size: var(--cd-width-slider-dot);
    background-color: var(--cd-color-slider-dot-bg-default);
    border-radius: 50%;
    cursor: pointer;
    transform: translateX(-50%);
  }
  .cd-slider-dot-active {
    background-color: var(--cd-color-slider-dot-border-active);
  }
  .cd-slider-vertical-wrapper .cd-slider-dot {
    inset-block-start: auto;
    inset-inline-start: 50%;
    transform: translateY(50%);
  }

  /* --- marks（刻度标签，对齐 Semi .semi-slider-marks > .semi-slider-mark）--- */
  .cd-slider-marks {
    position: absolute;
    inset-block-start: var(--cd-spacing-slider-marks-top);
    inset-inline-start: 0;
    inline-size: 100%;
    font-size: var(--cd-font-slider-marks-fontsize);
  }
  .cd-slider-mark {
    position: absolute;
    display: inline-block;
    color: var(--cd-color-slider-mark-text-default);
    text-align: center;
    cursor: pointer;
    transform: translateX(-50%);
    white-space: nowrap;
  }
  .cd-slider-vertical-wrapper .cd-slider-marks {
    block-size: 100%;
    inset-block-start: 0;
    inset-inline-start: 0;
    margin-inline-start: 29px;
  }
  .cd-slider-vertical-wrapper .cd-slider-mark {
    inset-block-start: auto;
    transform: translateY(50%);
  }

  /* --- boundary（边界值，hover 展示，对齐 Semi .semi-slider-boundary）--- */
  .cd-slider-boundary {
    position: relative;
    inset-block-start: var(--cd-spacing-slider-boundary-top);
    font-size: var(--cd-font-size-small);
    color: var(--cd-color-slider-text-default);
    visibility: hidden;
  }
  .cd-slider-boundary-show {
    visibility: visible;
  }
  .cd-slider-boundary span {
    position: absolute;
    display: inline-block;
  }
  .cd-slider-boundary-min {
    inset-inline-start: 0;
  }
  .cd-slider-boundary-max {
    inset-inline-end: 0;
  }

  /* --- disabled（对齐 Semi .semi-slider-disabled）--- */
  .cd-slider-disabled .cd-slider-rail,
  .cd-slider-disabled .cd-slider-track,
  .cd-slider-disabled .cd-slider-handle,
  .cd-slider-disabled .cd-slider-dot {
    cursor: not-allowed;
  }
  .cd-slider-disabled .cd-slider-handle {
    box-shadow: none;
    border: var(--cd-width-slider-handle-border-disabled) solid
      var(--cd-color-slider-handle-disabled-border);
  }
  .cd-slider-disabled .cd-slider-track {
    background-color: var(--cd-color-slider-track-disabled-bg);
  }

  @media (prefers-reduced-motion: reduce) {
    .cd-slider-handle {
      transition: none;
    }
  }
</style>
