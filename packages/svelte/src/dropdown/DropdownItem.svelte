<!--
  Dropdown.Item — 单个叶子菜单项的声明式包装。
  用于 <Dropdown> children 插槽模式（相对于 items 数据驱动模式）。
  直接渲染 li + button，遵循 DropdownItemNode 的样式约定。
-->
<script lang="ts">
  import { getContext } from 'svelte';
  import { DROPDOWN_CTX, type DropdownContext } from './context.js';

  interface Props {
    /** 菜单项标识（选中回调携带） */
    key?: string | number;
    /** 是否禁用 */
    disabled?: boolean;
    /** 危险操作样式 */
    danger?: boolean;
    /** 是否选中（showTick=true 时渲染 ✓ 标记） */
    selected?: boolean;
    /** 点击回调 */
    onClick?: (key: string | number | undefined) => void;
    children?: import('svelte').Snippet;
  }

  let {
    key,
    disabled = false,
    danger = false,
    selected = false,
    onClick,
    children,
  }: Props = $props();

  const ddCtx = getContext<DropdownContext | undefined>(DROPDOWN_CTX);
  const showTick = $derived(ddCtx?.showTick ?? false);

  function handleClick() {
    if (disabled) return;
    onClick?.(key);
  }
</script>

<li class="cd-dropdown__item-wrap" role="none">
  <!-- svelte-ignore a11y_consider_explicit_label -->
  <button
    type="button"
    class="cd-dropdown__item"
    class:cd-dropdown__item--danger={danger}
    class:cd-dropdown__item--selected={selected}
    role={showTick ? 'menuitemcheckbox' : 'menuitem'}
    tabindex="-1"
    aria-checked={showTick ? selected : undefined}
    aria-disabled={disabled || undefined}
    disabled={disabled || undefined}
    onclick={handleClick}
  >
    <span class="cd-dropdown__label">
      {@render children?.()}
    </span>
    {#if showTick}
      <span class="cd-dropdown__tick" aria-hidden="true">
        {#if selected}
          <svg viewBox="0 0 16 16" width="12" height="12" focusable="false">
            <path stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none" d="M2.5 8.5l4 4 7-8" />
          </svg>
        {/if}
      </span>
    {/if}
  </button>
</li>

<style>
  .cd-dropdown__item-wrap {
    margin: 0;
    padding: 0;
    list-style: none;
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
  .cd-dropdown__item--danger {
    color: var(--cd-color-danger);
  }
  .cd-dropdown__item--danger:hover,
  .cd-dropdown__item--danger:focus-visible {
    background: var(--cd-color-danger-light-default, var(--cd-dropdown-item-bg-hover));
  }
  .cd-dropdown__item[aria-disabled='true'] {
    color: var(--cd-dropdown-item-color-disabled);
    cursor: not-allowed;
  }
  .cd-dropdown__item--selected {
    color: var(--cd-color-primary, #165dff);
  }
  .cd-dropdown__label {
    flex: 1 1 auto;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  .cd-dropdown__tick {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 auto;
    inline-size: 14px;
    block-size: 14px;
    color: var(--cd-color-primary, #165dff);
  }
</style>
