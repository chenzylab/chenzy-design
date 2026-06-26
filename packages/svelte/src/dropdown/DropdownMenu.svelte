<!--
  Dropdown.Menu — 声明式子菜单/菜单分组容器。
  包裹 Dropdown.Item / Dropdown.SubMenu / Dropdown.Title / Dropdown.Divider，
  渲染为 role=group 的 ul，与 items 数据驱动模式下的分组一致。
-->
<script lang="ts">
  interface Props {
    children?: import('svelte').Snippet;
  }

  let { children }: Props = $props();
</script>

<ul class="cd-dropdown__menu-group" role="group">
  {@render children?.()}
</ul>

<style>
  .cd-dropdown__menu-group {
    margin: 0;
    padding: 0;
    list-style: none;
  }
</style>
