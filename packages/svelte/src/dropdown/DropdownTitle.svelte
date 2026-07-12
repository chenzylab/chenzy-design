<!--
  Dropdown.Title — 下拉菜单分组标题（对齐 Semi dropdownTitle）。
  渲染 div.cd-dropdown-title（不可点击、不接收焦点）；showTick 时左内边距让位对勾列。
-->
<script lang="ts">
  import { getContext, type Snippet } from 'svelte';
  import { DROPDOWN_CTX, type DropdownContext } from './context.js';

  interface Props {
    /** 样式类名（对齐 Semi className）。 */
    class?: string;
    /** 内联样式（对齐 Semi style）。 */
    style?: string;
    children?: Snippet;
  }

  let { class: className, style, children }: Props = $props();

  const ctx = getContext<DropdownContext | undefined>(DROPDOWN_CTX);
  const showTick = $derived(ctx?.showTick ?? false);

  const titleCls = $derived(
    [
      'cd-dropdown-title',
      showTick && 'cd-dropdown-title-withTick',
      className,
    ]
      .filter(Boolean)
      .join(' '),
  );
</script>

<div class={titleCls} {style}>
  {@render children?.()}
</div>

<style>
  /* 对齐 Semi .semi-dropdown-title */
  .cd-dropdown-title {
    color: var(--cd-color-dropdown-title-text-default);
    padding-top: var(--cd-spacing-dropdown-title-paddingtop);
    padding-bottom: var(--cd-spacing-dropdown-title-paddingbottom);
    padding-left: var(--cd-spacing-dropdown-title-paddingleft);
    padding-right: var(--cd-spacing-dropdown-title-paddingright);
    font-size: var(--cd-font-size-small);
    line-height: var(--cd-line-height-small);
    cursor: default;
  }
  .cd-dropdown-title-withTick {
    padding-left: var(--cd-spacing-dropdown-title-withtick-paddingleft);
  }
</style>
