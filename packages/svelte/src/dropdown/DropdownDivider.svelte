<!--
  Dropdown.Divider — 菜单项之间的分隔线（对齐 Semi dropdownDivider）。
  渲染 div.cd-dropdown-divider（block 水平线）。
-->
<script lang="ts">
  interface Props {
    /** 样式类名（对齐 Semi className）。 */
    class?: string;
    /** 内联样式（对齐 Semi style）。 */
    style?: string;
  }

  let { class: className, style }: Props = $props();
</script>

<div class="cd-dropdown-divider {className ?? ''}" {style} role="separator"></div>

<style>
  /* 对齐 Semi .semi-dropdown-divider */
  .cd-dropdown-divider {
    display: block;
    height: var(--cd-height-dropdown-seperator);
    width: 100%;
    min-width: 100%;
    clear: both;
    background: var(--cd-color-dropdown-seperator-bg-default);
    margin: var(--cd-spacing-dropdown-seperator-marginy) var(--cd-spacing-dropdown-seperator-marginx);
  }
</style>
