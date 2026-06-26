<!--
  Steps — see specs/components/navigation/Steps.spec.md
  Base subset: horizontal/vertical, fill/nav/basic types, clickable, status, dot mode.
  dot：图标渲染为小圆点（不显数字/✓），process 态高亮放大。
  basic：线框/简洁型——节点圆圈描边而非实心填充，process 态高亮描边。
  icon：自定义图标 snippet，提供时替代默认序号/✓/✕。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { nextRovingIndex, rovingKeyFromEvent, type RovingKey } from '@chenzy-design/core';
  import { useLocale } from '../locale-provider/index.js';
  import type { StepItem } from './types.js';

  type StepDirection = 'horizontal' | 'vertical';
  type StepType = 'fill' | 'nav' | 'basic';
  type StepStatus = 'process' | 'finish' | 'error' | 'warning';
  type StepSize = 'small' | 'default' | 'large';
  type DerivedStatus = 'wait' | 'process' | 'finish' | 'error' | 'warning';

  interface Props {
    current?: number;
    defaultCurrent?: number;
    steps?: StepItem[];
    direction?: StepDirection;
    type?: StepType;
    status?: StepStatus;
    size?: StepSize;
    initial?: number;
    clickable?: boolean;
    /** 点状步骤：图标渲染为小圆点，不显数字/✓ */
    dot?: boolean;
    /** 自定义图标渲染器，提供时替代默认序号/✓/✕（dot 模式不渲染图标） */
    icon?: Snippet<[{ step: StepItem; index: number; status: DerivedStatus }]>;
    onChange?: (current: number) => void;
    onClick?: (e: MouseEvent) => void;
    onKeyDown?: (e: KeyboardEvent) => void;
    class?: string;
  }

  let {
    current,
    defaultCurrent = 0,
    steps = [],
    direction = 'horizontal',
    type = 'fill',
    status = 'process',
    size = 'default',
    initial = 0,
    clickable,
    dot = false,
    icon,
    onChange,
    onClick,
    onKeyDown,
    class: className = '',
  }: Props = $props();

  // Controlled / uncontrolled (red line #1): never write back the prop.
  const isControlled = $derived(current !== undefined);
  let inner = $state(getInitialCurrent());
  const activeIndex = $derived(isControlled ? (current as number) : inner);

  function getInitialCurrent(): number {
    return defaultCurrent;
  }

  const isClickable = $derived(clickable ?? type === 'nav');

  function statusOf(index: number): DerivedStatus {
    // 显式 step.status 优先于由 current 推断的状态
    const explicit = steps[index]?.status;
    if (explicit) return explicit;
    if (index < activeIndex) return 'finish';
    if (index === activeIndex) return status;
    return 'wait';
  }

  const cls = $derived(
    [
      'cd-steps',
      `cd-steps--${direction}`,
      `cd-steps--${type}`,
      `cd-steps--${size}`,
      dot && 'cd-steps--dot',
      className,
    ]
      .filter(Boolean)
      .join(' '),
  );

  function select(index: number) {
    if (!isClickable) return;
    if (steps[index]?.disabled) return; // 禁用步不可激活
    if (index === activeIndex) return;
    if (!isControlled) inner = index;
    onChange?.(index);
  }

  const loc = useLocale();

  // 视觉隐藏的状态文本（WCAG 1.4.1：颜色非唯一信息载体）。
  // 组合「步骤 N，共 M 步，<状态>」供屏幕阅读器朗读。
  function statusText(st: DerivedStatus): string {
    switch (st) {
      case 'finish':
        return loc().t('Steps.statusFinish');
      case 'process':
        return loc().t('Steps.statusProcess');
      case 'error':
        return loc().t('Steps.statusError');
      case 'warning':
        return loc().t('Steps.statusWarning');
      default:
        return loc().t('Steps.statusWait');
    }
  }
  function srLabel(index: number, st: DerivedStatus): string {
    // 分隔符 ofTotal 已带（zh「，共 N 步」/ en「 of N」），状态前再以 locale 分隔符停顿。
    const sep = loc().t('Steps.statusSeparator');
    return (
      loc().t('Steps.stepLabel', { index: index + 1 + initial }) +
      loc().t('Steps.ofTotal', { total: steps.length }) +
      sep +
      statusText(st)
    );
  }

  // --- roving tabindex（a11y §6）：可点击步骤组为单一 Tab 停靠点。 ---
  // rootEl 普通引用（bind:this），命令式 focus() 用，非 render 期读 DOM。
  let rootEl = $state<HTMLElement | null>(null);
  // 当前焦点步索引；-1 = 尚无焦点 -> 首个可点击步作为 Tab 停靠点。
  let focusedIndex = $state(-1);

  // 可点击（且未禁用）的步骤索引序列；roving 在其中漫游，跳过 disabled（红线 #2：纯派生）。
  const focusableIndices = $derived<number[]>(
    isClickable
      ? steps.map((s, i) => (s.disabled ? -1 : i)).filter((i) => i >= 0)
      : [],
  );

  // 纯派生 tabindex：当前焦点步（或无焦点时回退到 activeIndex/首个可点击步）为 0，其余 -1。
  // 不在 render 期写 $state（红线 #2）。
  function stepTabindex(index: number): 0 | -1 {
    if (!isClickable || steps[index]?.disabled) return -1;
    const anchor =
      focusedIndex >= 0
        ? focusedIndex
        : focusableIndices.includes(activeIndex)
          ? activeIndex
          : (focusableIndices[0] ?? -1);
    return index === anchor ? 0 : -1;
  }

  function focusStep(index: number): void {
    focusedIndex = index;
    rootEl
      ?.querySelector<HTMLElement>(`[data-step-index="${index}"]`)
      ?.focus();
  }

  // 步骤 keydown：方向键 roving（纯函数 nextRovingIndex 派生，仅在可点击步间移动）、
  // Home/End 跳首尾可点击步。Enter/Space 交给原生 <button>（向后兼容）。
  function onStepKeydown(e: KeyboardEvent, index: number): void {
    const intent: RovingKey | null = rovingKeyFromEvent(e.key);
    if (!intent) return;
    e.preventDefault();
    const list = focusableIndices;
    if (list.length === 0) return;
    const cur = list.indexOf(index);
    const next = nextRovingIndex(cur, list.length, intent, false);
    const target = list[next];
    if (target != null) focusStep(target);
  }
</script>

{#snippet head(step: StepItem, index: number, st: DerivedStatus)}
  <span class="cd-steps__icon" aria-hidden="true">
    {#if dot}{:else if icon}{@render icon({ step, index, status: st })}{:else if st === 'finish'}✓{:else if st === 'error'}✕{:else}{index + 1 + initial}{/if}
  </span>
  <span class="cd-steps__content">
    <span class="cd-steps__title">{step.title}</span>
    {#if step.description}
      <span class="cd-steps__desc">{step.description}</span>
    {/if}
  </span>
  <!-- WCAG 1.4.1：视觉隐藏的「步骤 N，共 M 步，<状态>」供屏幕阅读器朗读，颜色非唯一信息载体。 -->
  <span class="cd-sr-only">{srLabel(index, st)}</span>
{/snippet}

{#snippet stepsList()}
  <ol class={cls} bind:this={rootEl}>
    {#each steps as step, index (index)}
      {@const st = statusOf(index)}
      {@const last = index === steps.length - 1}
      {@const isDisabled = step.disabled === true}
      <li class="cd-steps__item cd-steps__item--{st}" class:cd-steps__item--disabled={isDisabled}>
        {#if isClickable}
          <button
            type="button"
            class="cd-steps__head"
            data-step-index={index}
            aria-current={index === activeIndex ? 'step' : undefined}
            disabled={isDisabled}
            aria-disabled={isDisabled || undefined}
            tabindex={stepTabindex(index)}
            onclick={(e) => { select(index); onClick?.(e); }}
            onkeydown={(e) => { onStepKeydown(e, index); onKeyDown?.(e); }}
            onfocus={() => {
              focusedIndex = index;
            }}
          >
            {@render head(step, index, st)}
          </button>
        {:else}
          <div
            class="cd-steps__head"
            aria-current={index === activeIndex ? 'step' : undefined}
            aria-disabled={isDisabled || undefined}
          >
            {@render head(step, index, st)}
          </div>
        {/if}
        {#if !last}
          <span
            class="cd-steps__line"
            class:cd-steps__line--finish={index < activeIndex}
            aria-hidden="true"
          ></span>
        {/if}
      </li>
    {/each}
  </ol>
{/snippet}

{#if type === 'nav'}
  <nav aria-label={loc().t('Steps.navAriaLabel')}>
    {@render stepsList()}
  </nav>
{:else}
  {@render stepsList()}
{/if}

<style>
  /* 视觉隐藏的状态文本（class="cd-sr-only"）复用 tokens.css 全局工具类，
     令颜色非唯一信息载体（WCAG 1.4.1）。 */
  .cd-steps {
    display: flex;
    margin: 0;
    padding: 0;
    list-style: none;
  }
  .cd-steps--horizontal {
    flex-direction: row;
    align-items: flex-start;
  }
  .cd-steps--vertical {
    flex-direction: column;
  }
  .cd-steps__item {
    position: relative;
    display: flex;
    flex: 1 1 auto;
    align-items: center;
    gap: var(--cd-spacing-2);
  }
  .cd-steps--vertical .cd-steps__item {
    flex-direction: column;
    align-items: flex-start;
  }
  .cd-steps__head {
    display: inline-flex;
    align-items: center;
    gap: var(--cd-spacing-2);
    margin: 0;
    padding: 0;
    border: none;
    background: transparent;
    color: inherit;
    font: inherit;
    text-align: start;
  }
  button.cd-steps__head {
    cursor: pointer;
  }
  /* 禁用步：置灰、不可点击 */
  .cd-steps__item--disabled .cd-steps__head {
    cursor: not-allowed;
    opacity: 0.4;
  }
  button.cd-steps__head:disabled {
    cursor: not-allowed;
  }
  button.cd-steps__head:focus-visible {
    outline: none;
    box-shadow: var(--cd-focus-ring);
    border-radius: var(--cd-radius-1);
  }
  .cd-steps__icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    inline-size: var(--cd-steps-icon-size);
    block-size: var(--cd-steps-icon-size);
    border-radius: var(--cd-radius-full);
    background: var(--cd-steps-icon-bg);
    color: var(--cd-steps-icon-color);
    flex: 0 0 auto;
  }
  .cd-steps__item--process .cd-steps__icon {
    background: var(--cd-steps-icon-bg-process);
    color: var(--cd-steps-icon-color-active);
  }
  .cd-steps__item--finish .cd-steps__icon {
    background: var(--cd-steps-icon-bg-finish);
    color: var(--cd-steps-icon-color-active);
  }
  .cd-steps__item--error .cd-steps__icon {
    background: var(--cd-steps-icon-bg-error);
    color: var(--cd-steps-icon-color-active);
  }
  .cd-steps__content {
    display: inline-flex;
    flex-direction: column;
  }
  .cd-steps__title {
    color: var(--cd-steps-title-color);
  }
  .cd-steps__desc {
    color: var(--cd-steps-desc-color);
    font-size: var(--cd-font-size-1);
  }
  .cd-steps__line {
    flex: 1 1 auto;
    background: var(--cd-steps-line-color);
  }
  .cd-steps--horizontal .cd-steps__line {
    block-size: 1px;
    min-inline-size: var(--cd-spacing-4);
  }
  .cd-steps--vertical .cd-steps__line {
    inline-size: 1px;
    min-block-size: var(--cd-spacing-4);
    margin-inline-start: calc(var(--cd-steps-icon-size) / 2);
  }
  .cd-steps__line--finish {
    background: var(--cd-steps-line-color-finish);
  }

  /* --- basic 线框型：节点圆圈用描边而非实心填充 --- */
  .cd-steps--basic .cd-steps__icon {
    background: transparent;
    color: var(--cd-steps-basic-color, var(--cd-color-text-2));
    border: 1px solid var(--cd-steps-basic-border, var(--cd-color-border));
  }
  .cd-steps--basic .cd-steps__item--process .cd-steps__icon {
    background: transparent;
    color: var(--cd-steps-basic-color-process, var(--cd-color-primary));
    border-color: var(--cd-steps-basic-border-process, var(--cd-color-primary));
  }
  .cd-steps--basic .cd-steps__item--finish .cd-steps__icon {
    background: transparent;
    color: var(--cd-steps-basic-color-finish, var(--cd-color-primary));
    border-color: var(--cd-steps-basic-border-finish, var(--cd-color-primary));
  }
  .cd-steps--basic .cd-steps__item--error .cd-steps__icon {
    background: transparent;
    color: var(--cd-steps-basic-color-error, var(--cd-color-danger));
    border-color: var(--cd-steps-basic-border-error, var(--cd-color-danger));
  }

  /* --- dot 模式：图标缩为小圆点，process 态放大高亮 --- */
  .cd-steps--dot .cd-steps__icon {
    inline-size: var(--cd-steps-dot-size, 8px);
    block-size: var(--cd-steps-dot-size, 8px);
    background: var(--cd-steps-line-color);
  }
  .cd-steps--dot .cd-steps__item--process .cd-steps__icon {
    inline-size: var(--cd-steps-dot-size-active, 10px);
    block-size: var(--cd-steps-dot-size-active, 10px);
    background: var(--cd-steps-icon-bg-process);
  }
  .cd-steps--dot .cd-steps__item--finish .cd-steps__icon {
    background: var(--cd-steps-icon-bg-finish);
  }
  .cd-steps--dot .cd-steps__item--error .cd-steps__icon {
    background: var(--cd-steps-icon-bg-error);
  }
  /* dot 模式垂直对齐 line 与圆点中心 */
  .cd-steps--dot.cd-steps--vertical .cd-steps__line {
    margin-inline-start: calc(var(--cd-steps-dot-size, 8px) / 2);
  }
</style>
