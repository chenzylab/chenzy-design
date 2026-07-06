<!--
  SideBarOptions — 主视图顶部图标 tab 组（P1）。see specs/components/show/SideBar.spec.md §4.1。
  role=tablist + roving tabindex（仅激活项 tabindex=0，其余 -1）+ 键盘 ←→/Home/End 在项间移焦并激活
  （参照 Tabs 的 roving 实现）。每项图标以 name 作可访问名（aria-label），无障碍名不硬编码。
  受控 activeKey（红线 #1）：不回写，仅经 onActiveOptionChange 通知。
-->
<script lang="ts">
  import { useId } from '@chenzy-design/core';
  import type { SideBarOption } from './types.js';

  interface Props {
    options: SideBarOption[];
    activeKey?: string | undefined;
    onActiveOptionChange?: ((e: Event, key: string) => void) | undefined;
  }

  let { options, activeKey, onActiveOptionChange }: Props = $props();

  const baseId = useId('cd-sidebar-opt');

  function optionId(key: string): string {
    return `${baseId}-${key}`;
  }

  function setActive(e: Event, key: string): void {
    if (key === activeKey) return;
    onActiveOptionChange?.(e, key);
  }

  function focusOption(index: number): void {
    const item = options[index];
    if (!item) return;
    const el = document.getElementById(optionId(item.key));
    el?.focus();
    // auto 激活：聚焦即切换（roving，与 Tabs 一致）。
    const evt = typeof Event !== 'undefined' ? new Event('focus') : ({} as Event);
    setActive(evt, item.key);
  }

  function onKeydown(e: KeyboardEvent, item: SideBarOption): void {
    const len = options.length;
    if (len === 0) return;
    const cur = options.findIndex((o) => o.key === item.key);
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        e.preventDefault();
        focusOption((cur + 1) % len);
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        e.preventDefault();
        focusOption((cur - 1 + len) % len);
        break;
      case 'Home':
        e.preventDefault();
        focusOption(0);
        break;
      case 'End':
        e.preventDefault();
        focusOption(len - 1);
        break;
      default:
        break;
    }
  }
</script>

<div class="cd-sidebar__options" role="tablist" aria-orientation="horizontal">
  {#each options as item (item.key)}
    {@const selected = item.key === activeKey}
    <button
      type="button"
      class="cd-sidebar__option"
      class:cd-sidebar__option--active={selected}
      role="tab"
      id={optionId(item.key)}
      aria-selected={selected}
      aria-label={item.name}
      title={item.name}
      tabindex={selected ? 0 : -1}
      onclick={(e) => setActive(e, item.key)}
      onkeydown={(e) => onKeydown(e, item)}
    >
      {#if item.icon}
        <span class="cd-sidebar__option-icon" aria-hidden="true">{@render item.icon()}</span>
      {:else}
        <span class="cd-sidebar__option-icon" aria-hidden="true">{item.name.slice(0, 1)}</span>
      {/if}
    </button>
  {/each}
</div>

<style>
  .cd-sidebar__options {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    gap: var(--cd-sidebar-options-gap);
    padding: var(--cd-sidebar-options-padding);
    border-block-end: 1px solid var(--cd-sidebar-border);
  }
  .cd-sidebar__option {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    inline-size: var(--cd-sidebar-option-size);
    block-size: var(--cd-sidebar-option-size);
    padding: 0;
    border: none;
    border-radius: var(--cd-sidebar-option-radius);
    background: transparent;
    color: var(--cd-sidebar-option-color);
    cursor: pointer;
    transition:
      background-color var(--cd-motion-duration-fast, 0.1s) var(--cd-motion-ease-standard, ease),
      color var(--cd-motion-duration-fast, 0.1s) var(--cd-motion-ease-standard, ease);
  }
  .cd-sidebar__option:hover:not(.cd-sidebar__option--active) {
    background: var(--cd-sidebar-option-bg-hover);
    color: var(--cd-sidebar-option-color-hover);
  }
  .cd-sidebar__option--active {
    background: var(--cd-sidebar-option-bg-active);
    color: var(--cd-sidebar-option-color-active);
  }
  .cd-sidebar__option:focus-visible {
    outline: none;
    box-shadow: var(--cd-focus-ring);
  }
  .cd-sidebar__option-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: var(--cd-font-size-regular, 14px);
  }
</style>
