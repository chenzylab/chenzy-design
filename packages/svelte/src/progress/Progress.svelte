<!--
  Progress — see specs/components/feedback/Progress.spec.md
  进度条：line / circle / dashboard 三形态，normal/success/error/warning 四态。
  几何与 a11y 逻辑全部复用 @chenzy-design/core 纯函数（clampPercent / resolveStatus /
  getCirclePathProps / getRootAriaProps），不在组件里重复实现。
  红线 #1：percent 是受控输入，绝不回写；onComplete/onChange 仅通知。
  红线 #3：无 DOM 测量、无定时器；indeterminate 纯 CSS 动画。
  role=progressbar + aria-valuenow/min/max/valuetext；indeterminate 省略 valuenow 并设 aria-busy。
  success 环形显示对勾（非颜色冗余信号）；reduced-motion 禁用过渡与循环动画。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { untrack } from 'svelte';
  import {
    clampPercent,
    resolveStatus,
    getCirclePathProps,
    getRootAriaProps,
    type ProgressStatus,
    type ProgressType,
    type GapPosition,
  } from '@chenzy-design/core';

  type Size = 'small' | 'default' | 'large';

  type StrokeColorGradient = { from: string; to: string; direction?: string };

  interface Props {
    percent?: number;
    type?: ProgressType;
    status?: ProgressStatus;
    size?: Size;
    width?: number;
    strokeWidth?: number;
    strokeLinecap?: 'round' | 'butt' | 'square';
    showInfo?: boolean;
    format?: (percent: number, status: ProgressStatus) => string | null;
    indeterminate?: boolean;
    gapDegree?: number;
    gapPosition?: GapPosition;
    successWhenFull?: boolean;
    /** 进度条颜色：字符串直接用作颜色，对象 {from, to, direction?} 生成渐变。 */
    strokeColor?: string | StrokeColorGradient;
    /** 轨道（背景）颜色。 */
    trailColor?: string;
    motion?: boolean;
    ariaLabel?: string;
    formatSnippet?: Snippet<[{ percent: number; status: ProgressStatus }]>;
    onComplete?: (info: { percent: number }) => void;
    onChange?: (info: { percent: number }) => void;
  }

  let {
    percent = 0,
    type = 'line',
    status = 'normal',
    size = 'default',
    width,
    strokeWidth,
    strokeLinecap = 'round',
    showInfo = true,
    format,
    indeterminate = false,
    gapDegree,
    gapPosition = 'bottom',
    successWhenFull = false,
    strokeColor,
    trailColor,
    motion = true,
    ariaLabel,
    formatSnippet,
    onComplete,
    onChange,
  }: Props = $props();

  const pct = $derived(clampPercent(percent));
  const effStatus = $derived(resolveStatus(pct, status, successWhenFull));

  const isCircle = $derived(type === 'circle' || type === 'dashboard');
  const gap = $derived(gapDegree ?? (type === 'dashboard' ? 75 : 0));

  const circleSize: Record<Size, number> = { small: 80, default: 120, large: 160 };
  const diameter = $derived(width ?? circleSize[size]);
  const sw = $derived(strokeWidth ?? Math.max(2, Math.round(diameter * 0.06)));

  const circle = $derived(
    getCirclePathProps({
      width: diameter,
      strokeWidth: sw,
      percent: pct,
      gapDegree: gap,
      gapPosition,
    }),
  );

  const aria = $derived(
    getRootAriaProps({
      percent: pct,
      indeterminate,
      ...(ariaLabel !== undefined ? { label: ariaLabel } : {}),
      valueText: `${pct}%`,
    }),
  );

  // 信息区文本：formatSnippet 优先于 format prop；format 返回 null 时隐藏。
  // indeterminate（不确定进度）忽略 percent 数值显示，不渲染默认百分比。
  const infoText = $derived(
    indeterminate ? null : format ? format(pct, effStatus) : `${pct}%`,
  );
  const showCheck = $derived(isCircle && effStatus === 'success');

  // strokeColor 处理：字符串直接用，对象生成渐变
  const isGradientStroke = $derived(typeof strokeColor === 'object' && strokeColor !== null);
  const gradientId = $derived(isGradientStroke ? `cd-progress-grad-${Math.abs(hashStr(JSON.stringify(strokeColor)))}` : '');
  const strokeColorValue = $derived(
    !strokeColor
      ? undefined
      : typeof strokeColor === 'string'
        ? strokeColor
        : `url(#${gradientId})`
  );
  const trailColorValue = $derived(trailColor ?? undefined);

  function hashStr(s: string): number {
    let h = 0;
    for (let i = 0; i < s.length; i++) { h = (h << 5) - h + s.charCodeAt(i); h |= 0; }
    return h;
  }

  // onComplete：percent 首达 100 触发一次；回落到 <100 后重置可再次触发。
  let firedComplete = false;
  $effect(() => {
    const p = pct;
    if (p >= 100 && !firedComplete) {
      firedComplete = true;
      onComplete?.({ percent: p });
    }
    if (p < 100) firedComplete = false;
  });

  // onChange：percent 变化时通知，untrack 上次值避免初次挂载触发噪音。
  let prevPct = untrack(() => pct);
  $effect(() => {
    const p = pct;
    if (p !== untrack(() => prevPct)) {
      prevPct = p;
      onChange?.({ percent: p });
    }
  });
</script>

{#snippet checkIcon()}
  <svg
    class="cd-progress__check"
    viewBox="0 0 24 24"
    aria-hidden="true"
    focusable="false"
  >
    <path
      d="M5 13l4 4L19 7"
      fill="none"
      stroke="currentColor"
      stroke-width="2.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
{/snippet}

{#snippet info(forCircle: boolean)}
  {#if formatSnippet}
    {@render formatSnippet({ percent: pct, status: effStatus })}
  {:else if forCircle && showCheck}
    {@render checkIcon()}
  {:else}
    {infoText}
  {/if}
{/snippet}

{#if isCircle}
  <div
    class="cd-progress cd-progress--circle cd-progress--{effStatus}"
    class:cd-progress--no-motion={!motion}
    class:cd-progress--indeterminate={indeterminate}
    style="inline-size:{diameter}px; block-size:{diameter}px"
    {...aria}
  >
    <svg
      class="cd-progress__svg"
      width={diameter}
      height={diameter}
      viewBox="0 0 {diameter} {diameter}"
      aria-hidden="true"
    >
      {#if isGradientStroke && strokeColor && typeof strokeColor === 'object'}
        <defs>
          <linearGradient
            id={gradientId}
            x1={strokeColor.direction === 'to bottom' ? '0%' : '0%'}
            y1={strokeColor.direction === 'to bottom' ? '0%' : '0%'}
            x2={strokeColor.direction === 'to bottom' ? '0%' : '100%'}
            y2={strokeColor.direction === 'to bottom' ? '100%' : '0%'}
          >
            <stop offset="0%" stop-color={strokeColor.from} />
            <stop offset="100%" stop-color={strokeColor.to} />
          </linearGradient>
        </defs>
      {/if}
      <circle
        class="cd-progress__circle-track"
        cx={circle.center}
        cy={circle.center}
        r={circle.radius}
        fill="none"
        stroke={trailColorValue ?? 'var(--cd-progress-track-color)'}
        stroke-width={sw}
        stroke-dasharray={circle.trackDash}
        transform="rotate({circle.rotation} {circle.center} {circle.center})"
      />
      <circle
        class="cd-progress__circle-fill"
        cx={circle.center}
        cy={circle.center}
        r={circle.radius}
        fill="none"
        stroke={strokeColorValue}
        stroke-width={sw}
        stroke-linecap={strokeLinecap}
        stroke-dasharray={circle.fillDash}
        transform="rotate({circle.rotation} {circle.center} {circle.center})"
      />
    </svg>
    {#if showInfo}
      <span class="cd-progress__circle-info">{@render info(true)}</span>
    {/if}
  </div>
{:else}
  {#if isGradientStroke && strokeColor && typeof strokeColor === 'object'}
    <svg width="0" height="0" aria-hidden="true" style="position:absolute">
      <defs>
        <linearGradient
          id={gradientId}
          x1={strokeColor.direction === 'to bottom' ? '0%' : '0%'}
          y1={strokeColor.direction === 'to bottom' ? '0%' : '0%'}
          x2={strokeColor.direction === 'to bottom' ? '0%' : '100%'}
          y2={strokeColor.direction === 'to bottom' ? '100%' : '0%'}
        >
          <stop offset="0%" stop-color={strokeColor.from} />
          <stop offset="100%" stop-color={strokeColor.to} />
        </linearGradient>
      </defs>
    </svg>
  {/if}
  <div
    class="cd-progress cd-progress--line cd-progress--{size} cd-progress--{effStatus}"
    class:cd-progress--no-motion={!motion}
    {...aria}
  >
    <div class="cd-progress__track" style={trailColorValue ? `background:${trailColorValue}` : undefined}>
      <div
        class="cd-progress__fill"
        class:cd-progress__fill--indeterminate={indeterminate}
        style={[
          `inline-size: ${indeterminate ? 100 : pct}%`,
          strokeColorValue ? `background:${strokeColorValue}` : '',
        ].filter(Boolean).join(';')}
      ></div>
    </div>
    {#if showInfo && infoText !== null}
      <span class="cd-progress__info">{@render info(false)}</span>
    {/if}
  </div>
{/if}

<style>
  /* ---- line 形态 ---- */
  .cd-progress--line {
    display: flex;
    align-items: center;
    gap: var(--cd-spacing-2, 8px);
    inline-size: 100%;
  }

  .cd-progress__track {
    position: relative;
    flex: 1 1 auto;
    overflow: hidden;
    block-size: var(--cd-progress-height-default);
    border-radius: calc(var(--cd-progress-height-default) / 2);
    background: var(--cd-progress-track-color);
  }
  .cd-progress--small .cd-progress__track {
    block-size: var(--cd-progress-height-small);
    border-radius: calc(var(--cd-progress-height-small) / 2);
  }
  .cd-progress--large .cd-progress__track {
    block-size: var(--cd-progress-height-large);
    border-radius: calc(var(--cd-progress-height-large) / 2);
  }

  .cd-progress__fill {
    block-size: 100%;
    border-radius: inherit;
    background: var(--cd-progress-stroke-normal);
    transition: inline-size var(--cd-progress-transition);
  }
  .cd-progress--success .cd-progress__fill {
    background: var(--cd-progress-stroke-success);
  }
  .cd-progress--error .cd-progress__fill {
    background: var(--cd-progress-stroke-error);
  }
  .cd-progress--warning .cd-progress__fill {
    background: var(--cd-progress-stroke-warning);
  }

  .cd-progress__fill--indeterminate {
    inline-size: 40% !important;
    border-radius: inherit;
    transition: none;
    animation: cd-progress-indeterminate 1.4s ease-in-out infinite;
  }

  .cd-progress__info {
    flex: 0 0 auto;
    min-inline-size: 3em;
    color: var(--cd-progress-info-color);
    font-size: var(--cd-font-size-body, 14px);
    text-align: end;
    white-space: nowrap;
  }
  .cd-progress--success .cd-progress__info {
    color: var(--cd-progress-info-success-color);
  }

  /* ---- circle / dashboard 形态 ---- */
  .cd-progress--circle {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .cd-progress__svg {
    display: block;
  }

  .cd-progress__circle-fill {
    stroke: var(--cd-progress-stroke-normal);
    transition: stroke-dasharray var(--cd-progress-transition);
  }
  .cd-progress--success .cd-progress__circle-fill {
    stroke: var(--cd-progress-stroke-success);
  }
  .cd-progress--error .cd-progress__circle-fill {
    stroke: var(--cd-progress-stroke-error);
  }
  .cd-progress--warning .cd-progress__circle-fill {
    stroke: var(--cd-progress-stroke-warning);
  }

  .cd-progress__circle-info {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--cd-progress-info-color);
    font-size: var(--cd-font-size-h4, 20px);
    line-height: 1;
  }
  .cd-progress--success .cd-progress__circle-info {
    color: var(--cd-progress-info-success-color);
  }

  .cd-progress__check {
    inline-size: 40%;
    block-size: 40%;
  }

  /* indeterminate circle：整体旋转 + 固定弧（fillDash 由 percent 给一段弧即可） */
  .cd-progress--indeterminate .cd-progress__svg {
    animation: cd-progress-spin 1.4s linear infinite;
  }
  .cd-progress--indeterminate .cd-progress__circle-fill {
    transition: none;
  }

  @keyframes cd-progress-indeterminate {
    0% {
      transform: translateX(-100%);
    }
    100% {
      transform: translateX(250%);
    }
  }
  @keyframes cd-progress-spin {
    to {
      transform: rotate(360deg);
    }
  }

  /* motion=false 与 reduced-motion：禁用过渡与循环动画 */
  .cd-progress--no-motion .cd-progress__fill,
  .cd-progress--no-motion .cd-progress__circle-fill {
    transition: none;
  }
  .cd-progress--no-motion .cd-progress__fill--indeterminate,
  .cd-progress--no-motion .cd-progress__svg {
    animation: none;
  }

  @media (prefers-reduced-motion: reduce) {
    .cd-progress__fill,
    .cd-progress__circle-fill {
      transition: none;
    }
    .cd-progress__fill--indeterminate,
    .cd-progress--indeterminate .cd-progress__svg {
      animation: none;
    }
  }
</style>
