<!--
  SplitTagGroup — 严格对齐 Semi semi-ui/tag/splitTagGroup.tsx + tag.scss .semi-tag-split。
  连接式标签组：多个 Tag 连成一体（首子前缘圆角、末子后缘圆角、中间去圆角，相邻 1px 间隙）。
  Semi 通过 cloneElement 注入 first/last class；此处用纯 CSS :first-child/:last-child 定位直接子 .cd-tag，
  语义等价且无运行时开销。circle 形状子标签首末用 radius-tag_circle。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    /** 组的可访问名（对齐 Semi aria-label） */
    ariaLabel?: string;
    /** 透传根类名（对齐 Semi className） */
    class?: string;
    /** 透传根内联样式（对齐 Semi style） */
    style?: string;
    /** 子 Tag（对齐 Semi children） */
    children?: Snippet;
  }

  let { ariaLabel, class: className, style, children }: Props = $props();

  const rootCls = $derived(['cd-tag-split', className].filter(Boolean).join(' '));
</script>

<div class={rootCls} {style} role="group" aria-label={ariaLabel}>
  {#if children}{@render children()}{/if}
</div>

<style>
  /* —— 对齐 Semi .semi-tag-split —— */
  .cd-tag-split {
    display: inline-flex;
    align-items: center;
  }

  /* 子标签去圆角 + 相邻 1px 间隙（对齐 Semi .semi-tag-split .semi-tag）—— */
  .cd-tag-split :global(> .cd-tag) {
    border-radius: 0;
    margin-right: var(--cd-tag-split-gap);
  }
  /* 首子前缘圆角（对齐 Semi &-first）—— */
  .cd-tag-split :global(> .cd-tag:first-child) {
    border-top-left-radius: var(--cd-tag-radius);
    border-bottom-left-radius: var(--cd-tag-radius);
  }
  /* 末子后缘圆角 + 去右间隙（对齐 Semi &-last）—— */
  .cd-tag-split :global(> .cd-tag:last-child) {
    border-top-right-radius: var(--cd-tag-radius);
    border-bottom-right-radius: var(--cd-tag-radius);
    margin-right: 0;
  }
  /* circle 子标签首末用胶囊圆角（对齐 Semi &-circle.&-first/&-last）—— */
  .cd-tag-split :global(> .cd-tag--circle:first-child) {
    border-top-left-radius: var(--cd-tag-radius-circle);
    border-bottom-left-radius: var(--cd-tag-radius-circle);
  }
  .cd-tag-split :global(> .cd-tag--circle:last-child) {
    border-top-right-radius: var(--cd-tag-radius-circle);
    border-bottom-right-radius: var(--cd-tag-radius-circle);
  }
</style>
