<!--
  Steps — see specs/components/navigation/Steps.spec.md
  Base subset: horizontal/vertical, fill/nav/basic types, clickable, status, dot mode.
  dot：图标渲染为小圆点（不显数字/✓），process 态高亮放大。
  basic：线框/简洁型——节点圆圈描边而非实心填充，process 态高亮描边。
  icon：自定义图标 snippet，提供时替代默认序号/✓/✕。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
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
{/snippet}

<ol class={cls}>
  {#each steps as step, index (index)}
    {@const st = statusOf(index)}
    {@const last = index === steps.length - 1}
    {@const isDisabled = step.disabled === true}
    <li class="cd-steps__item cd-steps__item--{st}" class:cd-steps__item--disabled={isDisabled}>
      {#if isClickable}
        <button
          type="button"
          class="cd-steps__head"
          aria-current={index === activeIndex ? 'step' : undefined}
          disabled={isDisabled}
          aria-disabled={isDisabled || undefined}
          onclick={() => select(index)}
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

<style>
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
