<!--
  FloatButtonGroup — 胶囊工具条（严格对齐 Semi）：一个背景圆角条内 inline-flex 横排多个
  「图标 + 文字」项，事件委托直接读 e.target.dataset.value 回传（不向上查找，对齐 Semi）。
  纯 div（非 button），item.badge 时 item 外层包裹 Badge。
-->
<script lang="ts">
  import Badge from '../badge/Badge.svelte';
  import type { FloatButtonGroupProps } from './types.js';

  let {
    items = [],
    disabled = false,
    onClick,
    class: className = '',
    style,
  }: FloatButtonGroupProps = $props();

  const rootClass = $derived(
    ['cd-floatButtonGroup', disabled ? 'cd-floatButtonGroup-disabled' : '', className]
      .filter(Boolean)
      .join(' '),
  );

  // 点击委托：对齐 Semi，直接读 e.target.dataset.value（不向上冒泡查找）。
  function handleClick(e: MouseEvent) {
    if (disabled) return;
    const value = (e.target as HTMLElement).dataset?.value;
    if (value != null) onClick?.(value, e);
  }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class={rootClass} {style} onclick={handleClick}>
  {#each items as item (item.value)}
    {#if item.badge}
      <Badge {...item.badge}>
        <div class="cd-floatButtonGroup-item" data-value={item.value}>
          {@render item.icon?.()}
          {#if typeof item.content === 'string'}{item.content}{:else if item.content}{@render item.content()}{/if}
        </div>
      </Badge>
    {:else}
      <div class="cd-floatButtonGroup-item" data-value={item.value}>
        {@render item.icon?.()}
        {#if typeof item.content === 'string'}{item.content}{:else if item.content}{@render item.content()}{/if}
      </div>
    {/if}
  {/each}
</div>

<style>
  .cd-floatButtonGroup {
    position: fixed;
    border-radius: var(--cd-floatbutton-group-radius);
    bottom: var(--cd-floatbutton-group-bottom);
    right: var(--cd-floatbutton-group-right);
    z-index: var(--cd-floatbutton-z);
    background: var(--cd-floatbutton-group-bg);
    box-shadow: var(--cd-floatbutton-group-shadow);
    display: inline-flex;
    padding: var(--cd-floatbutton-group-padding);
    gap: var(--cd-floatbutton-group-gap);
  }

  .cd-floatButtonGroup-item {
    cursor: pointer;
    display: flex;
    padding: var(--cd-floatbutton-group-item-padding-y) var(--cd-floatbutton-group-item-padding-x);
    align-items: center;
    column-gap: var(--cd-floatbutton-group-item-gap);
    border-radius: var(--cd-floatbutton-group-item-radius);
    color: var(--cd-floatbutton-group-item-color);
    font-size: var(--cd-floatbutton-group-item-font-size);
    font-style: normal;
    font-weight: var(--cd-floatbutton-group-item-font-weight);
    line-height: var(--cd-floatbutton-group-item-line-height);
  }
  .cd-floatButtonGroup-item:hover {
    background: var(--cd-floatbutton-group-item-bg-hover);
  }
  .cd-floatButtonGroup-item:active {
    background: var(--cd-floatbutton-group-item-bg-active);
  }

  .cd-floatButtonGroup-item :global(svg) {
    width: 1.25em;
    height: 1.25em;
  }
</style>
