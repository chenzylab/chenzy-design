<!--
  Dropdown.Menu — 下拉弹层菜单容器（对齐 Semi dropdownMenu）。
  渲染 ul.cd-dropdown-menu[role=menu][aria-orientation=vertical]，包裹 Dropdown.Item /
  Dropdown.Title / Dropdown.Divider。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    /** 下拉弹层菜单样式类名（对齐 Semi className）。 */
    class?: string;
    /** 下拉弹层菜单样式（对齐 Semi style）。 */
    style?: string;
    children?: Snippet;
  }

  let { class: className, style, children }: Props = $props();
</script>

<ul
  class="cd-dropdown-menu {className ?? ''}"
  {style}
  role="menu"
  aria-orientation="vertical"
>
  {@render children?.()}
</ul>

<style>
  /* 对齐 Semi .semi-dropdown-menu：list-style:none + menu-paddingY/paddingX + margin:0 */
  .cd-dropdown-menu {
    list-style: none;
    padding: var(--cd-spacing-dropdown-menu-paddingy) var(--cd-spacing-dropdown-menu-paddingx);
    margin: 0;
  }
</style>
