<!--
  Form.Section — see specs/components/input/Form.spec.md
  分组容器：<fieldset> 包裹，legend 显示分组标题。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    /** 分组标题：字符串或 Snippet。 */
    text?: string | Snippet;
    className?: string;
    children?: Snippet;
  }

  let { text, className, children }: Props = $props();
</script>

<fieldset class={['cd-form__section', className].filter(Boolean).join(' ')}>
  {#if text !== undefined}
    <legend class="cd-form__section-legend">
      {#if typeof text === 'string'}
        {text}
      {:else}
        {@render text()}
      {/if}
    </legend>
  {/if}
  {@render children?.()}
</fieldset>

<style>
  .cd-form__section {
    display: contents;
    border: none;
    padding: 0;
    margin: 0;
  }
  .cd-form__section-legend {
    color: var(--cd-form-label-color, var(--cd-color-text-1));
    font-weight: var(--cd-font-weight-medium, 500);
    font-size: var(--cd-font-size-regular, 0.875rem);
    padding: 0;
    margin-block-end: var(--cd-spacing-tight);
  }
</style>
