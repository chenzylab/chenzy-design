<!--
  FloatButtonGroup — 胶囊工具条（对齐 Semi）：一个背景圆角条内横排（或竖排）多个
  「图标 + 文字」项，事件委托回传 value。
  a11y：role="group" + aria-label（缺省取 locale FloatButton.groupAriaLabel）；
  每项为原生 <button>，逐个可 Tab。点击委托从事件目标向上找带 data-value 的元素读取 value。
-->
<script lang="ts">
  import { useLocale } from '../locale-provider/index.js';
  import type { FloatButtonGroupProps } from './types.js';

  let {
    items = [],
    direction = 'horizontal',
    disabled = false,
    ariaLabel,
    onClick,
    class: className = '',
    style,
  }: FloatButtonGroupProps = $props();

  const loc = useLocale();

  const rootClass = $derived(
    [
      'cd-floatbutton-group',
      `cd-floatbutton-group--${direction}`,
      disabled ? 'cd-floatbutton-group--disabled' : '',
      className,
    ]
      .filter(Boolean)
      .join(' '),
  );

  // 事件委托：从 e.target 向上（止于容器）找最近带 data-value 的元素，读取 value 回传。
  function handleClick(e: MouseEvent) {
    if (!onClick || disabled) return;
    let node = e.target as HTMLElement | null;
    const root = e.currentTarget as HTMLElement;
    while (node && node !== root) {
      const value = node.getAttribute?.('data-value');
      if (value != null) {
        onClick(value, e);
        return;
      }
      node = node.parentElement;
    }
  }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<div
  class={rootClass}
  role="group"
  aria-label={ariaLabel ?? loc().t('FloatButton.groupAriaLabel')}
  {style}
  onclick={handleClick}
>
  {#each items as item (item.value)}
    <button
      type="button"
      class="cd-floatbutton-group__item"
      data-value={item.value}
      disabled={disabled || item.disabled || false}
      aria-label={item.ariaLabel}
    >
      {#if item.icon}
        <span class="cd-floatbutton-group__icon">{@render item.icon()}</span>
      {/if}
      {#if item.content}
        <span class="cd-floatbutton-group__text">
          {#if typeof item.content === 'string'}
            {item.content}
          {:else}
            {@render item.content()}
          {/if}
        </span>
      {/if}
    </button>
  {/each}
</div>

<style>
  .cd-floatbutton-group {
    position: fixed;
    display: inline-flex;
    gap: var(--cd-floatbutton-group-gap);
    padding: var(--cd-floatbutton-group-padding);
    border-radius: var(--cd-floatbutton-group-radius);
    background: var(--cd-floatbutton-group-bg);
    box-shadow: var(--cd-floatbutton-group-shadow);
    z-index: var(--cd-floatbutton-z);
  }
  .cd-floatbutton-group--horizontal {
    flex-direction: row;
  }
  .cd-floatbutton-group--vertical {
    flex-direction: column;
  }

  .cd-floatbutton-group__item {
    display: flex;
    align-items: center;
    gap: var(--cd-floatbutton-group-item-gap);
    padding: var(--cd-floatbutton-group-item-padding-y) var(--cd-floatbutton-group-item-padding-x);
    border: none;
    border-radius: var(--cd-floatbutton-group-item-radius);
    background: transparent;
    color: var(--cd-floatbutton-group-item-color);
    font: inherit;
    cursor: pointer;
    white-space: nowrap;
    transition: background var(--cd-floatbutton-motion-duration) ease;
  }
  .cd-floatbutton-group__item:hover {
    background: var(--cd-floatbutton-group-item-bg-hover);
  }
  .cd-floatbutton-group__item:active {
    background: var(--cd-floatbutton-group-item-bg-active);
  }
  .cd-floatbutton-group__item:focus-visible {
    outline: 2px solid var(--cd-floatbutton-focus-ring);
    outline-offset: -2px;
  }
  .cd-floatbutton-group__item:disabled {
    opacity: var(--cd-floatbutton-disabled-opacity);
    cursor: not-allowed;
  }

  .cd-floatbutton-group__icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
  .cd-floatbutton-group__icon :global(svg) {
    inline-size: 1.25em;
    block-size: 1.25em;
  }

  .cd-floatbutton-group--disabled {
    opacity: var(--cd-floatbutton-disabled-opacity);
    pointer-events: none;
  }

  @media (prefers-reduced-motion: reduce) {
    .cd-floatbutton-group__item {
      transition: none;
    }
  }
</style>
