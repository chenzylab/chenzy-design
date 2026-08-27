<!--
  SideBarOptions — 主视图顶部图标 tab 组（P1）。see specs/components/show/SideBar.spec.md §4.1。
  对齐 Semi options.tsx：每项都是本库 Button（icon + name 文字），非激活态叠加 -options-normal
  类把 primary/light 按钮的强调色/粗体压回常规文本色。本库在此之上叠加 role=tablist/tab +
  roving tabindex（仅激活项 tabindex=0，其余 -1）+ 键盘 ←→/Home/End 移焦并激活（参照 Tabs 的
  roving 实现）——这是对齐 SPEC §6「对标 Semi 的增强」，Semi 原版 Options 只是普通可点击 Button，
  没有 tab 语义。受控 activeKey（红线 #1）：不回写，仅经 onActiveOptionChange 通知。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { useId } from '@chenzy-design/core';
  import Button from '../button/Button.svelte';
  import type { SideBarOption } from './types.js';

  interface Props {
    options: SideBarOption[];
    activeKey?: string | undefined;
    onActiveOptionChange?: ((e: Event, key: string) => void) | undefined;
    /**
     * 自定义单个 Option 的渲染（对齐 Semi renderOptionItem(option, onChange)）：
     * 命中时**整项替换**默认按钮，连 role=tab / roving tabindex 一起交给使用方。
     */
    renderOptionItem?:
      | Snippet<[{ option: SideBarOption; onChange: (e: Event, key: string) => void }]>
      | undefined;
  }

  let { options, activeKey, onActiveOptionChange, renderOptionItem }: Props = $props();

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

<div class="cd-sidebar-options" role="tablist" aria-orientation="horizontal">
  {#each options as item (item.key)}
    {@const selected = item.key === activeKey}
    {#if renderOptionItem}
      <!-- 对齐 Semi options.tsx:15-17：renderOptionItem 命中即整项接管，不再渲染默认按钮。 -->
      {@render renderOptionItem({ option: item, onChange: setActive })}
    {:else}
      <!-- 对齐 Semi options.tsx:20-27：每项是一个 Button（图标 + name 可见文字），非选中态
           叠加 -options-normal 把 primary/light 强调色压回常规文本色。role=tab/roving tabindex
           透传到 Button 根节点（本库对标 SPEC §6 的增强，Semi 原版只是普通 Button）。 -->
      {@const itemIcon = item.icon}
      <Button
        class="cd-sidebar-options-button {selected ? '' : 'cd-sidebar-options-normal'}"
        role="tab"
        id={optionId(item.key)}
        aria-selected={selected}
        tabindex={selected ? 0 : -1}
        onclick={(e) => setActive(e, item.key)}
        onkeydown={(e: KeyboardEvent) => onKeydown(e, item)}
      >
        {#if itemIcon}
          {#snippet icon()}{@render itemIcon()}{/snippet}
        {/if}
        {item.name}
      </Button>
    {/if}
  {/each}
</div>

<style>
  .cd-sidebar-options {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    gap: var(--cd-sidebar-options-gap);
    padding: var(--cd-sidebar-options-padding-y) var(--cd-sidebar-options-padding-x);
    border-block-end: 1px solid var(--cd-sidebar-border);
  }
  /* Semi options.tsx:20-27 每项是 Button（默认 type=primary theme=light，视觉全部由
     Button 自身提供），本库不再手造尺寸/圆角/hover/focus 去模拟 Button。
     &-button 只贴 Semi 的 -options_button-marginLeft（content-right 即图标后跟的文字）。 */
  :global(.cd-sidebar-options-button .cd-button-content-right) {
    margin-inline-start: var(--cd-sidebar-options-button-margin-left);
  }
  /* 未选中态（对齐 Semi &-options-normal { &.semi-button-primary.semi-button-light {...} }）：
     把默认 primary/light 按钮的强调色/粗体压回常规文本色；选中态保留 Button 默认外观。
     :global() 包裹整条复合选择器——Svelte 编译器会丢失裸复合选择器的特异性标记。 */
  :global(.cd-sidebar-options-normal.cd-button-primary.cd-button-light) {
    color: var(--cd-sidebar-options-button-text);
    font-weight: var(--cd-font-weight-regular);
  }
</style>
