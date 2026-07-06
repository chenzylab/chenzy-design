<!--
  SplitTagGroup — see specs/components/show/SplitTagGroup.spec.md
  连接式标签组：多个 Tag 连成一体（首子前缘圆角、末子后缘圆角、中间去圆角合并边），
  视觉上是一个分段控件。纯 CSS 装饰（无运行时几何、无 cloneElement）：
  用 :first-child / :last-child 定位直接子 .cd-tag，合并相邻边。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    /** 组的可访问名（aria-label） */
    ariaLabel?: string;
    /** 透传根类名 */
    class?: string;
    /** 透传根内联样式 */
    style?: string;
    /** 子 Tag（首尾自动加圆角、相邻合并边） */
    children?: Snippet;
  }

  let { ariaLabel, class: className, style, children }: Props = $props();

  const rootCls = $derived(['cd-splittaggroup', className].filter(Boolean).join(' '));
</script>

<div class={rootCls} {style} role="group" aria-label={ariaLabel}>
  {#if children}{@render children()}{/if}
</div>

<style>
  .cd-splittaggroup {
    display: inline-flex;
    align-items: center;
    vertical-align: middle;
  }

  /* 相邻子标签合并边：非首个去掉左圆角并叠 -1px 让边合并 */
  .cd-splittaggroup :global(> .cd-tag) {
    border-radius: 0;
  }
  .cd-splittaggroup :global(> .cd-tag:first-child) {
    border-start-start-radius: var(--cd-tag-radius);
    border-end-start-radius: var(--cd-tag-radius);
  }
  .cd-splittaggroup :global(> .cd-tag:last-child) {
    border-start-end-radius: var(--cd-tag-radius);
    border-end-end-radius: var(--cd-tag-radius);
  }
  .cd-splittaggroup :global(> .cd-tag:not(:first-child)) {
    margin-inline-start: calc(-1 * var(--cd-splittaggroup-divider-width));
    border-inline-start: var(--cd-splittaggroup-divider-width) solid
      var(--cd-splittaggroup-divider-color);
  }
</style>
