<!--
  Dropdown.Divider — 菜单项之间的水平分隔线（role=separator）。
  对应 items 数据驱动模式中 type='divider' 的项。
-->
<script lang="ts">
  // 无 props，仅渲染分隔线。
</script>

<li class="cd-dropdown__divider" role="separator"></li>

<style>
  .cd-dropdown__divider {
    block-size: 1px;
    margin-block: var(--cd-spacing-extra-tight);
    background: var(--cd-color-border);
  }
</style>
