<!--
  FloatButtonGroup — 平铺容器，遍历 items 渲染多个 FloatButton，事件委托回传 value。
  a11y：role="group" + aria-label（缺省取 locale FloatButton.groupAriaLabel）。
  各子项为独立 button/a，逐个可 Tab（非 roving，悬浮入口数量少）。
  点击委托：从事件目标向上找带 data-value 的元素读取 value。
-->
<script lang="ts">
  import { useLocale } from '../locale-provider/index.js';
  import FloatButton from './FloatButton.svelte';
  import type { FloatButtonGroupProps } from './types.js';

  let {
    items = [],
    disabled = false,
    ariaLabel,
    onClick,
    class: className = '',
    style,
  }: FloatButtonGroupProps = $props();

  const loc = useLocale();

  const rootClass = $derived(
    ['cd-floatbutton-group', disabled ? 'cd-floatbutton-group--disabled' : '', className]
      .filter(Boolean)
      .join(' '),
  );

  // 事件委托：从 e.target 向上（止于容器）找最近带 data-value 的元素，读取 value 回传。
  function handleClick(e: MouseEvent) {
    if (!onClick) return;
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

<!--
  委托点击仅为便利：真正的键盘/激活交互由每个子项的原生 <button>/<a> 承担，
  容器自身是非交互包裹层，故此处 a11y 交互告警不适用。
-->
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
    {@const { value, content, disabled: itemDisabled, ...fbProps } = item}
    <div class="cd-floatbutton-group__item" data-value={value}>
      <FloatButton {...fbProps} disabled={disabled || itemDisabled || false}>
        {#if content}
          {#if typeof content === 'string'}
            {content}
          {:else}
            {@render content()}
          {/if}
        {/if}
      </FloatButton>
    </div>
  {/each}
</div>

<style>
  .cd-floatbutton-group {
    position: fixed;
    display: inline-flex;
    flex-direction: column;
    gap: var(--cd-floatbutton-group-gap);
    z-index: var(--cd-floatbutton-z);
  }

  /* Group 内子项取消各自的 fixed 定位（改由容器统一定位） */
  .cd-floatbutton-group__item :global(.cd-floatbutton) {
    position: static;
  }

  .cd-floatbutton-group--disabled {
    opacity: var(--cd-floatbutton-disabled-opacity);
    pointer-events: none;
  }
</style>
