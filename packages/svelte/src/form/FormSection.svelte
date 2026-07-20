<!--
  Form.Section — see specs/components/input/Form.spec.md
  分组容器：镜像 Semi section.tsx —— <section class="cd-form-section"><h5 class="cd-form-section-text">。
  仅影响布局，不影响数据结构。样式严格对齐 Semi form.scss（border-bottom + header-5 + bold + margin）。
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
    width: 100%;
    margin-block-start: var(--cd-spacing-form-section-margintop);
  }
  /* 首个 section 去掉顶部外边距（对齐 Semi :nth-of-type(1)）。 */
  .cd-form-section:first-of-type {
    margin-block-start: 0;
  }
  .cd-form-section-text {
    /* @include font-size-header-5（font-size + line-height:24px），对齐 Semi。 */
    font-size: var(--cd-font-size-header-5);
    line-height: 24px;
    font-weight: var(--cd-font-weight-bold);
    width: 100%;
    color: var(--cd-color-form-section-text-default);
    border-block-end: var(--cd-width-form-section-border) solid
      var(--cd-color-form-section-border-default);
    padding-block-start: var(--cd-spacing-form-section-text-paddingtop);
    padding-block-end: var(--cd-spacing-form-section-text-paddingbottom);
    margin-block-start: var(--cd-spacing-form-section-text-margintop);
    margin-block-end: var(--cd-spacing-form-section-text-marginbottom);
  }
</style>
