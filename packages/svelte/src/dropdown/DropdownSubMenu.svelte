<!--
  Dropdown.SubMenu — 声明式可展开子菜单包装。
  用于 <Dropdown> children 插槽模式，与 DropdownItemNode（items 数据驱动）行为对齐：
  hover/聚焦展开，floating 到父项右侧（溢出翻转左侧），键盘 →/←/↑↓/Esc 导航。
-->
<script lang="ts">
  import { tick, getContext } from 'svelte';
  import { floating } from '../_floating/use-floating.js';
  import { DROPDOWN_CTX, type DropdownContext } from './context.js';

  interface Props {
    /** 子菜单标题文案 */
    title?: string;
    /** 是否禁用 */
    disabled?: boolean;
    /** hover 开启延迟（ms），默认 100 */
    openDelay?: number;
    /** hover 关闭延迟（ms），默认 200 */
    closeDelay?: number;
    children?: import('svelte').Snippet;
  }

  let {
    title = '',
    disabled = false,
    openDelay = 100,
    closeDelay = 200,
    children,
  }: Props = $props();

  const ddCtx = getContext<DropdownContext | undefined>(DROPDOWN_CTX);

  let titleEl = $state<HTMLButtonElement | null>(null);
  let subEl = $state<HTMLUListElement | null>(null);
  let open = $state(false);

  let openTimer: ReturnType<typeof setTimeout> | undefined;
  let closeTimer: ReturnType<typeof setTimeout> | undefined;

  function clearTimers() {
    if (openTimer !== undefined) { clearTimeout(openTimer); openTimer = undefined; }
    if (closeTimer !== undefined) { clearTimeout(closeTimer); closeTimer = undefined; }
  }

  function scheduleOpen() {
    if (disabled) return;
    if (closeTimer !== undefined) { clearTimeout(closeTimer); closeTimer = undefined; }
    if (open) return;
    openTimer = setTimeout(() => { open = true; openTimer = undefined; }, openDelay);
  }

  function scheduleClose() {
    if (openTimer !== undefined) { clearTimeout(openTimer); openTimer = undefined; }
    if (!open) return;
    closeTimer = setTimeout(() => { open = false; closeTimer = undefined; }, closeDelay);
  }

  function keepOpen() {
    if (closeTimer !== undefined) { clearTimeout(closeTimer); closeTimer = undefined; }
  }

  function closeNow() {
    clearTimers();
    open = false;
  }

  async function openAndFocusFirst() {
    if (disabled) return;
    open = true;
    await tick();
    const first = subEl?.querySelector<HTMLElement>('[role="menuitem"]:not([aria-disabled="true"])');
    first?.focus();
  }

  function onTitleKeydown(e: KeyboardEvent) {
    switch (e.key) {
      case 'ArrowRight':
      case 'Enter':
      case ' ':
        e.preventDefault();
        void openAndFocusFirst();
        break;
      case 'ArrowLeft':
      case 'Escape':
        if (open) {
          e.preventDefault();
          e.stopPropagation();
          closeNow();
          titleEl?.focus();
        }
        break;
    }
  }

  function onSubKeydown(e: KeyboardEvent) {
    if (e.key === 'ArrowLeft' || e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      closeNow();
      titleEl?.focus();
    }
  }

  $effect(() => clearTimers);
</script>

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<li
  class="cd-dropdown__item-wrap cd-dropdown__item-wrap--submenu"
  role="none"
  onpointerenter={scheduleOpen}
  onpointerleave={scheduleClose}
>
  <button
    type="button"
    class="cd-dropdown__item cd-dropdown__item--submenu"
    role="menuitem"
    tabindex="-1"
    aria-haspopup="menu"
    aria-expanded={open}
    aria-disabled={disabled || undefined}
    disabled={disabled || undefined}
    bind:this={titleEl}
    onclick={() => void openAndFocusFirst()}
    onkeydown={onTitleKeydown}
  >
    <span class="cd-dropdown__label">{title}</span>
    <span class="cd-dropdown__arrow" aria-hidden="true">
      <svg viewBox="0 0 16 16" width="10" height="10" focusable="false">
        <path fill="currentColor" d="M6 4l4 4-4 4V4Z" />
      </svg>
    </span>
  </button>

  {#if open && titleEl}
    <ul
      class="cd-dropdown__sub"
      role="menu"
      tabindex="-1"
      bind:this={subEl}
      use:floating={{ trigger: titleEl, placement: 'rightStart', offset: 2, autoAdjust: true, getContainer: ddCtx?.getContainer }}
      onpointerenter={keepOpen}
      onpointerleave={scheduleClose}
      onkeydown={onSubKeydown}
    >
      {@render children?.()}
    </ul>
  {/if}
</li>

<style>
  .cd-dropdown__item-wrap {
    margin: 0;
    padding: 0;
    list-style: none;
  }
  .cd-dropdown__item-wrap--submenu {
    position: relative;
  }
  .cd-dropdown__item {
    display: flex;
    align-items: center;
    gap: var(--cd-spacing-tight);
    inline-size: 100%;
    margin: 0;
    padding: var(--cd-dropdown-item-padding);
    border: none;
    background: transparent;
    color: inherit;
    font: inherit;
    text-align: start;
    cursor: pointer;
  }
  .cd-dropdown__item:hover,
  .cd-dropdown__item:focus-visible {
    background: var(--cd-dropdown-item-bg-hover);
  }
  .cd-dropdown__item:focus-visible {
    outline: none;
  }
  .cd-dropdown__item--submenu[aria-expanded='true'] {
    background: var(--cd-dropdown-item-bg-hover);
  }
  .cd-dropdown__item[aria-disabled='true'] {
    color: var(--cd-dropdown-item-color-disabled);
    cursor: not-allowed;
  }
  .cd-dropdown__label {
    flex: 1 1 auto;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  .cd-dropdown__arrow {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 auto;
    color: var(--cd-color-text-2);
  }
  .cd-dropdown__sub {
    margin: 0;
    padding: 0;
    list-style: none;
    z-index: var(--cd-dropdown-z);
    min-inline-size: var(--cd-dropdown-min-width);
    padding-block: var(--cd-spacing-extra-tight);
    background: var(--cd-dropdown-bg);
    border-radius: var(--cd-dropdown-radius);
    box-shadow: var(--cd-dropdown-shadow);
  }
</style>
