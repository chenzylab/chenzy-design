<!--
  Indent — 对齐 Semi Design `indent.tsx`。
  渲染 level 个占位 span（indent-unit），每个宽度固定为单级缩进增量；
  showLine 时每个 unit 用 CSS 伪元素画竖直引导线，isEnd[i] 为真的层级不画（该祖先链已到底）。
  取代本库此前"整体 padding-left calc 公式"的缩进实现，改为逐级 unit 撑宽，样式公式对齐 Semi。
-->
<script lang="ts">
  interface Props {
    level: number;
    isEnd: boolean[];
    showLine: boolean;
  }

  const { level, isEnd, showLine }: Props = $props();
</script>

<span
  aria-hidden="true"
  class="cd-tree-option-indent"
  class:cd-tree-option-indent-show-line={showLine}
>
  {#each Array(level) as _, i (i)}
    <span class="cd-tree-option-indent-unit" class:cd-tree-option-indent-unit-end={isEnd[i]}></span>
  {/each}
</span>

<style>
  .cd-tree-option-indent {
    align-self: stretch;
    white-space: nowrap;
    user-select: none;
  }
  .cd-tree-option-indent-unit {
    display: inline-block;
    width: var(--cd-spacing-tree-option-level-padding-left);
  }
  .cd-tree-option-indent-show-line .cd-tree-option-indent-unit {
    position: relative;
    height: 100%;
  }
  .cd-tree-option-indent-show-line .cd-tree-option-indent-unit::before {
    content: '';
    position: absolute;
    top: calc(var(--cd-spacing-tree-option-padding-top) * -1);
    bottom: calc(var(--cd-spacing-tree-option-padding-bottom) * -1);
    left: calc(var(--cd-width-tree-empty-icon) / 2);
    border-right: var(--cd-width-tree-option-line) solid var(--cd-color-tree-option-line);
  }
  .cd-tree-option-indent-show-line .cd-tree-option-indent-unit-end::before {
    display: none;
  }
</style>
