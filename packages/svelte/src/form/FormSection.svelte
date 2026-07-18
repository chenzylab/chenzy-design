<!--
  Form.Section — see specs/components/input/Form.spec.md
  分组容器：镜像 Semi <section class=cd-form-section><h5 class=cd-form-section-text>。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    /** 分组标题：字符串或 Snippet（Snippet 为本库超集，Semi 只支持 node）。 */
    text?: string | Snippet;
    className?: string;
    /** 透传到 <section> 的内联样式。 */
    style?: string;
    children?: Snippet;
  }

  let { text, className, style, children }: Props = $props();
</script>

<section class={['cd-form-section', className].filter(Boolean).join(' ')} {style}>
  <h5 class="cd-form-section-text">
    {#if typeof text === 'string'}
      {text}
    {:else if text}
      {@render text()}
    {/if}
  </h5>
  {@render children?.()}
</section>

<style>
  .cd-form-section {
    display: contents;
  }
  .cd-form-section-text {
    color: var(--cd-form-label-color);
    font-weight: var(--cd-font-weight-medium, 500);
    font-size: var(--cd-font-size-regular, 0.875rem);
    padding: 0;
    margin: 0;
    margin-block-end: var(--cd-spacing-tight);
  }
</style>
