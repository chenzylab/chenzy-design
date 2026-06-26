<!--
  Dropdown.Title — 不可点击的分组标题（对应 items 数据驱动模式中 type='group' 的 label）。
  渲染为 role=none 的 li 中的纯展示 div，不接收键盘焦点。
-->
<script lang="ts">
  interface Props {
    children?: import('svelte').Snippet;
  }

  let { children }: Props = $props();
</script>

<li class="cd-dropdown__group" role="none">
  <div class="cd-dropdown__group-title">
    {@render children?.()}
  </div>
</li>

<style>
  .cd-dropdown__group {
    margin: 0;
    padding: 0;
    list-style: none;
  }
  .cd-dropdown__group-title {
    display: flex;
    align-items: center;
    padding: var(--cd-dropdown-item-padding);
    color: var(--cd-dropdown-item-color-disabled);
    font-size: var(--cd-font-size-1);
    cursor: default;
    user-select: none;
  }
</style>
