<!--
  Steps — see specs/components/navigation/Steps.spec.md
  Base subset: horizontal/vertical, fill/nav types, clickable, status, dot mode.
  dot：图标渲染为小圆点（不显数字/✓），process 态高亮放大。
  TODO: type='basic' details.
-->
<script lang="ts">
  import type { StepItem } from './types.js';

  type StepDirection = 'horizontal' | 'vertical';
  type StepType = 'fill' | 'nav';
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
    if (index === activeIndex) return;
    if (!isControlled) inner = index;
    onChange?.(index);
  }
</script>

<ol class={cls}>
  {#each steps as step, index (index)}
    {@const st = statusOf(index)}
    {@const last = index === steps.length - 1}
    <li class="cd-steps__item cd-steps__item--{st}">
      {#if isClickable}
        <button
          type="button"
          class="cd-steps__head"
          aria-current={index === activeIndex ? 'step' : undefined}
          onclick={() => select(index)}
        >
          <span class="cd-steps__icon" aria-hidden="true">
            {#if dot}{:else if st === 'finish'}✓{:else if st === 'error'}✕{:else}{index + 1 + initial}{/if}
          </span>
          <span class="cd-steps__content">
            <span class="cd-steps__title">{step.title}</span>
            {#if step.description}
              <span class="cd-steps__desc">{step.description}</span>
            {/if}
          </span>
        </button>
      {:else}
        <div class="cd-steps__head" aria-current={index === activeIndex ? 'step' : undefined}>
          <span class="cd-steps__icon" aria-hidden="true">
            {#if dot}{:else if st === 'finish'}✓{:else if st === 'error'}✕{:else}{index + 1 + initial}{/if}
          </span>
          <span class="cd-steps__content">
            <span class="cd-steps__title">{step.title}</span>
            {#if step.description}
              <span class="cd-steps__desc">{step.description}</span>
            {/if}
          </span>
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
