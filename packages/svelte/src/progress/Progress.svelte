<!--
  Progress — 进度条，严格对齐 Semi Design（semi-ui/progress）。
  两种形态：line（horizontal / vertical）与 circle。
  几何与颜色逻辑全部复用 @chenzy-design/core 纯函数（clampPercent /
  getCirclePathProps / generateColor / getRootAriaProps），不在组件里重复实现。

  红线 #1：percent 是受控输入，绝不回写。
  数字滚动：percent 变化时线性插值动画（对齐 Semi Animation linear/300ms），
  motion=false 或 reduced-motion 时直接跳到目标值，无定时器残留。
  DOM 对齐 Semi：
    line   → .cd-progress.cd-progress-horizontal/-vertical > .cd-progress-track
             > .cd-progress-track-inner；文本 .cd-progress-line-text。
    circle → .cd-progress.cd-progress-circle > svg.cd-progress-circle-ring
             > circle.cd-progress-circle-ring-track / .cd-progress-circle-ring-inner；
             文本 .cd-progress-circle-text。
  role=progressbar + aria-valuenow/min/max/valuetext/label/labelledby。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { untrack } from 'svelte';
  import {
    clampPercent,
    getCirclePathProps,
    generateColor,
    getRootAriaProps,
    type ProgressType,
    type ProgressDirection,
    type ProgressSize,
    type StrokeLinecap,
    type StrokeArr,
  } from '@chenzy-design/core';

  interface Props {
    percent?: number;
    type?: ProgressType;
    direction?: ProgressDirection;
    size?: ProgressSize;
    width?: number;
    strokeWidth?: number;
    strokeLinecap?: StrokeLinecap;
    showInfo?: boolean;
    /** 进度条填充色：字符串直接用作颜色，或分段颜色数组（配合 strokeGradient 渐变）。 */
    stroke?: string | StrokeArr;
    /** 是否自动补齐颜色区间生成渐变（需 stroke 为至少一个区间的数组）。 */
    strokeGradient?: boolean;
    /** 进度条轨道填充色。 */
    orbitStroke?: string;
    /** 格式化函数，入参为当前百分比，返回值渲染在信息区。默认 percent + '%'。 */
    format?: (percent: number) => string | null;
    motion?: boolean;
    class?: string;
    style?: string;
    id?: string;
    'aria-label'?: string;
    'aria-labelledby'?: string;
    'aria-valuetext'?: string;
    /** 信息区自定义内容 snippet，优先于 format prop。 */
    formatSnippet?: Snippet<[{ percent: number }]>;
  }

  let {
    percent = 0,
    type = 'line',
    direction = 'horizontal',
    size = 'default',
    width,
    strokeWidth = 4,
    strokeLinecap = 'round',
    showInfo = false,
    stroke,
    strokeGradient = false,
    orbitStroke,
    format,
    motion = true,
    class: className,
    style,
    id,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    'aria-valuetext': ariaValueText,
    formatSnippet,
  }: Props = $props();

  const isCircle = $derived(type === 'circle');
  const isVertical = $derived(direction === 'vertical');

  // 真实 percent（钳制）；动画 percent（数字滚动的当前显示值）。
  const perc = $derived(clampPercent(percent));

  // ---- 数字滚动动画：线性插值，对齐 Semi Animation(linear, 300ms) ----
  // 初始快照读 prop（untrack 避免 state_referenced_locally 告警）；
  // 后续动画由下方 $effect 驱动，逐帧写 percentNumber。
  let percentNumber = $state(untrack(() => clampPercent(percent)));
  let prevPercent = untrack(() => clampPercent(percent));
  let rafId = 0;

  function prefersReducedMotion(): boolean {
    return (
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );
  }

  $effect(() => {
    const target = perc;
    const from = prevPercent;
    prevPercent = target;
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = 0;
    }
    if (!motion || prefersReducedMotion() || from === target) {
      percentNumber = target;
      return;
    }
    const duration = 300;
    let start = 0;
    const step = (t: number) => {
      if (!start) start = t;
      const elapsed = t - start;
      const ratio = Math.min(1, elapsed / duration);
      // parseInt 语义：截断到整数（对齐 Semi）
      percentNumber = Math.trunc(from + (target - from) * ratio);
      if (ratio < 1) {
        rafId = requestAnimationFrame(step);
      } else {
        percentNumber = target;
        rafId = 0;
      }
    };
    rafId = requestAnimationFrame(step);
    return () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = 0;
      }
    };
  });

  const percNumber = $derived(clampPercent(percentNumber));

  // circle 直径：优先 width，其次 size（default 72 / small 24）。
  const diameter = $derived(width ?? (size === 'default' ? 72 : 24));

  const circle = $derived(
    getCirclePathProps({ width: diameter, strokeWidth, percent: perc }),
  );

  // stroke 颜色解析：字符串直接用；数组走 generateColor（分段/渐变）。
  const strokeColor = $derived.by(() => {
    if (typeof stroke === 'string') return stroke;
    if (Array.isArray(stroke)) {
      const c = generateColor(stroke, perc, strokeGradient);
      return c ?? undefined;
    }
    return undefined;
  });

  const aria = $derived(
    getRootAriaProps({
      // Semi：line 用真实 perc，circle 用动画 percNumber
      percent: isCircle ? percNumber : perc,
      ...(ariaLabel !== undefined ? { label: ariaLabel } : {}),
      ...(ariaLabelledBy !== undefined ? { labelledBy: ariaLabelledBy } : {}),
      ...(ariaValueText !== undefined ? { valueText: ariaValueText } : {}),
    }),
  );

  // 信息区文本：默认 percent + '%'；format 自定义（入参为动画值）。
  const infoText = $derived(format ? format(percNumber) : `${percNumber}%`);
</script>

{#snippet info()}
  {#if formatSnippet}
    {@render formatSnippet({ percent: percNumber })}
  {:else}
    {infoText}
  {/if}
{/snippet}

{#if isCircle}
  <div
    {id}
    class={['cd-progress', 'cd-progress-circle', className]}
    {style}
    {...aria}
  >
    <svg
      class="cd-progress-circle-ring"
      height={diameter}
      width={diameter}
      aria-hidden="true"
    >
      <circle
        class="cd-progress-circle-ring-track"
        stroke-dashoffset={0}
        stroke-width={strokeWidth}
        stroke-dasharray={circle.strokeDasharray}
        stroke-linecap={strokeLinecap}
        fill="transparent"
        style={orbitStroke ? `stroke:${orbitStroke}` : undefined}
        r={circle.radius}
        cx={circle.center}
        cy={circle.center}
      />
      <circle
        class="cd-progress-circle-ring-inner"
        stroke-dashoffset={circle.strokeDashoffset}
        stroke-width={strokeWidth}
        stroke-dasharray={circle.strokeDasharray}
        stroke-linecap={strokeLinecap}
        fill="transparent"
        style={strokeColor ? `stroke:${strokeColor}` : undefined}
        r={circle.radius}
        cx={circle.center}
        cy={circle.center}
      />
    </svg>
    {#if showInfo && size !== 'small'}
      <span class="cd-progress-circle-text">{@render info()}</span>
    {/if}
  </div>
{:else}
  <div
    {id}
    class={[
      'cd-progress',
      isVertical ? 'cd-progress-vertical' : 'cd-progress-horizontal',
      size === 'large' && 'cd-progress-large',
      className,
    ]}
    {style}
    {...aria}
  >
    <div
      class="cd-progress-track"
      style={orbitStroke ? `background-color:${orbitStroke}` : undefined}
      aria-hidden="true"
    >
      <div
        class="cd-progress-track-inner"
        style={[
          isVertical ? `height:${perc}%` : `width:${perc}%`,
          strokeColor ? `background:${strokeColor}` : '',
        ]
          .filter(Boolean)
          .join(';')}
        aria-hidden="true"
      ></div>
    </div>
    {#if showInfo}
      <div class="cd-progress-line-text">{@render info()}</div>
    {/if}
  </div>
{/if}

<style>
  /* ==== 根 ==== */
  .cd-progress {
    display: flex;
    align-items: center;
  }

  .cd-progress-track {
    background-color: var(--cd-color-progress-default-bg);
    border-radius: var(--cd-radius-progress-track);
  }

  /* ==== 水平 line ==== */
  .cd-progress-horizontal {
    height: var(--cd-height-progress-horizontal);
    margin-top: var(--cd-spacing-progress-horizontal-marginy);
    margin-bottom: var(--cd-spacing-progress-horizontal-marginy);
  }
  .cd-progress-horizontal.cd-progress-large {
    height: var(--cd-height-progress-horizontal-large);
  }
  .cd-progress-horizontal .cd-progress-track {
    height: 100%;
    width: 100%;
  }
  .cd-progress-horizontal .cd-progress-track-inner {
    height: 100%;
    background-color: var(--cd-color-progress-track-inner-bg);
    border-radius: var(--cd-radius-progress-track-inner);
    transition: width var(--cd-motion-progress-transition-duration);
    transition-timing-function: var(--cd-motion-progress-transition-timing-function);
  }
  .cd-progress-horizontal .cd-progress-line-text {
    min-width: var(--cd-width-progress-line-text);
    font-weight: var(--cd-font-progress-line-text-fontweight);
    margin-left: var(--cd-spacing-progress-line-text-marginleft);
    color: var(--cd-color-progress-line-text-text);
  }

  /* ==== 垂直 line ==== */
  .cd-progress-vertical {
    width: var(--cd-width-progress-vertical);
    display: inline-flex;
    height: 100%;
    margin-left: var(--cd-spacing-progress-vertical-marginx);
    margin-right: var(--cd-spacing-progress-vertical-marginx);
    flex-direction: column;
  }
  .cd-progress-vertical.cd-progress-large {
    width: var(--cd-width-progress-vertical-large);
  }
  .cd-progress-vertical .cd-progress-track {
    height: 100%;
    width: 100%;
  }
  .cd-progress-vertical .cd-progress-track-inner {
    background-color: var(--cd-color-progress-track-inner-bg);
    border-radius: var(--cd-radius-progress-track-inner);
    width: 100%;
    transition: height var(--cd-motion-progress-transition-duration);
    transition-timing-function: var(--cd-motion-progress-transition-timing-function);
  }
  .cd-progress-vertical .cd-progress-line-text {
    font-weight: var(--cd-font-progress-line-text-fontweight);
    margin-top: var(--cd-spacing-progress-vertical-line-text-margintop);
  }

  /* ==== 环形 circle ==== */
  .cd-progress-circle {
    position: relative;
    display: inline-block;
  }
  .cd-progress-circle-ring {
    display: block;
  }
  .cd-progress-circle-ring-track {
    stroke: var(--cd-color-progress-default-bg);
  }
  .cd-progress-circle-ring-inner {
    transition: stroke-dashoffset var(--cd-motion-progress-transition-duration);
    transition-timing-function: var(--cd-motion-progress-transition-timing-function);
    transform: rotate(-90deg);
    transform-origin: 50% 50%;
    stroke: var(--cd-color-progress-track-inner-bg);
  }
  .cd-progress-circle-text {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 100%;
    text-align: center;
    transform: translate(-50%, -50%);
    user-select: none;
    color: var(--cd-color-progress-circle-text);
  }

  /* reduced-motion：禁用过渡（数字滚动在脚本中同样跳过） */
  @media (prefers-reduced-motion: reduce) {
    .cd-progress-horizontal .cd-progress-track-inner,
    .cd-progress-vertical .cd-progress-track-inner,
    .cd-progress-circle-ring-inner {
      transition: none;
    }
  }
</style>
