<!--
  PreviewHeader — 预览顶部区（对齐 Semi image/previewHeader.tsx）。
  左侧 title（可被 renderHeader 覆盖），右侧关闭按钮（可被 renderCloseIcon 覆盖）。
  header 整体 pointer-events:none，仅关闭热区恢复 auto（对齐 Semi，避免遮挡图片拖拽）。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { Icon } from '../icon/index.js';
  import { useLocale } from '../locale-provider/index.js';
  import { iconClose } from './icons.js';

  interface Props {
    /** 当前图 title（string 或 Snippet），来自 context.titles[currentIndex]。 */
    title?: string | Snippet | undefined;
    closable?: boolean | undefined;
    /** 自定义整个 header 内容，收到 title 作为入参。 */
    renderHeader?: Snippet<[string | Snippet | undefined]> | undefined;
    /** 自定义关闭图标。 */
    renderCloseIcon?: Snippet | undefined;
    class?: string | undefined;
    onClose?: ((e: MouseEvent) => void) | undefined;
  }

  let { title, closable = true, renderHeader, renderCloseIcon, class: className = '', onClose }: Props = $props();

  const loc = useLocale();
</script>

<section class={['cd-image-preview-header', className].filter(Boolean).join(' ')}>
  <section class="cd-image-preview-header-title">
    {#if renderHeader}
      {@render renderHeader(title)}
    {:else if typeof title === 'function'}
      {@render title()}
    {:else if title}
      {title}
    {/if}
  </section>
  {#if closable}
    <button
      type="button"
      class="cd-image-preview-header-close"
      aria-label={loc().t('Image.closePreview')}
      onclick={onClose}
    >
      {#if renderCloseIcon}
        {@render renderCloseIcon()}
      {:else}
        <Icon svg={iconClose} />
      {/if}
    </button>
  {/if}
</section>

<style>
  .cd-image-preview-header {
    position: absolute;
    inset-block-start: 0;
    inset-inline-start: 0;
    inset-inline-end: 0;
    height: var(--cd-image-preview-header-height);
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-inline: var(--cd-image-preview-header-padding-x);
    color: var(--cd-image-preview-header-color);
    font-weight: normal;
    z-index: 1;
    pointer-events: none;
  }
  .cd-image-preview-header-title {
    flex: 1;
  }
  .cd-image-preview-header-close {
    display: flex;
    justify-content: center;
    align-items: center;
    width: var(--cd-image-preview-header-close-size);
    height: var(--cd-image-preview-header-close-size);
    padding: 0;
    border: 0;
    border-radius: 50%;
    background: none;
    color: inherit;
    cursor: pointer;
    pointer-events: auto;
  }
  .cd-image-preview-header-close:hover {
    background-color: var(--cd-image-header-close-bg);
  }
  .cd-image-preview-header-close:focus-visible {
    outline: var(--cd-focus-ring);
  }
</style>
