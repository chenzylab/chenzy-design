<!--
  Image — see specs/components/show/Image.spec.md
  基础子集：src + 懒加载(native/observer) + fit/position + 占位 + 失败降级 + 点击预览(全屏遮罩)。
  TODO(延后): LQIP 模糊、预览组缩放/旋转/多图切换、crossorigin/srcset 细节、portal。

  红线遵守：
   - observer 模式 IntersectionObserver 在 $effect 内命令式创建 + cleanup disconnect；
     node 用 bind:this 普通引用，不在 render 期读几何。
   - 预览 Esc keydown 监听在 $effect 内 addEventListener + cleanup removeEventListener。
   - 无受控 prop 需回写（previewOpen 为本地 $state）。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { untrack } from 'svelte';
  import { useLocale } from '../locale-provider/index.js';

  type ImageFit = 'fill' | 'contain' | 'cover' | 'none' | 'scale-down';
  type ImageStatus = 'pending' | 'loading' | 'loaded' | 'error';
  type LazyMode = 'native' | 'observer';

  interface Props {
    src: string;
    alt?: string;
    width?: number | string;
    height?: number | string;
    fit?: ImageFit;
    position?: string;
    lazy?: boolean;
    lazyMode?: LazyMode;
    rootMargin?: string;
    placeholder?: string | boolean;
    fallback?: string | boolean;
    preview?: boolean;
    class?: string;
    errorSlot?: Snippet;
    placeholderSlot?: Snippet;
  }

  let {
    src,
    alt = '',
    width,
    height,
    fit = 'fill',
    position = 'center',
    lazy = true,
    lazyMode = 'native',
    rootMargin = '200px',
    placeholder = true,
    fallback = true,
    preview = false,
    class: className = '',
    errorSlot,
    placeholderSlot,
  }: Props = $props();

  const loc = useLocale();

  const useObserver = $derived(lazy && lazyMode === 'observer');
  // 仅用于 $state 初始值：untrack 读一次原始 props，避免 state_referenced_locally 警告。
  const initialObserver = untrack(() => lazy && lazyMode === 'observer');

  // observer 模式初始为 pending（未进视口），否则直接 loading
  let status = $state<ImageStatus>(initialObserver ? 'pending' : 'loading');
  let inView = $state(!initialObserver);
  let previewOpen = $state(false);

  let imgNode = $state<HTMLImageElement | null>(null);

  // observer 模式下，进入视口前不设真实 src
  const resolvedSrc = $derived(useObserver && !inView ? undefined : src);

  // placeholder 是字符串时当作占位图 src（loading/pending 阶段显示）
  const placeholderSrc = $derived(typeof placeholder === 'string' ? placeholder : undefined);
  const showPlaceholder = $derived(status === 'pending' || status === 'loading');
  const showSkeleton = $derived(showPlaceholder && placeholder === true);

  // error 降级：fallback 为字符串 → 降级图；true → 默认破图占位；false → errorSlot
  const fallbackSrc = $derived(typeof fallback === 'string' ? fallback : undefined);

  const nativeLoading = $derived(lazy && lazyMode === 'native' ? 'lazy' : undefined);

  const rootStyle = $derived(
    [
      width !== undefined ? `inline-size:${typeof width === 'number' ? `${width}px` : width}` : '',
      height !== undefined ? `block-size:${typeof height === 'number' ? `${height}px` : height}` : '',
    ]
      .filter(Boolean)
      .join(';'),
  );

  const imgStyle = $derived(`object-fit:${fit};object-position:${position}`);

  const cls = $derived(
    ['cd-image', preview && status === 'loaded' && 'cd-image--previewable', className]
      .filter(Boolean)
      .join(' '),
  );

  const canPreview = $derived(preview && status === 'loaded');

  function handleLoad() {
    status = 'loaded';
  }

  function handleError() {
    status = 'error';
  }

  function openPreview() {
    if (canPreview) previewOpen = true;
  }

  function closePreview() {
    previewOpen = false;
  }

  function handleOverlayKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      closePreview();
    }
  }

  // IntersectionObserver：命令式创建 + cleanup，进入视口才放行真实 src
  $effect(() => {
    if (!useObserver) return;
    if (inView) return;
    const node = imgNode;
    if (!node) return;
    if (typeof IntersectionObserver === 'undefined') {
      inView = true;
      status = 'loading';
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            inView = true;
            status = 'loading';
            observer.disconnect();
            break;
          }
        }
      },
      { rootMargin },
    );
    observer.observe(node);
    return () => observer.disconnect();
  });

  // 预览遮罩 Esc 监听：命令式绑定 + cleanup 解绑
  $effect(() => {
    if (!previewOpen) return;
    function onKeydown(e: KeyboardEvent) {
      if (e.key === 'Escape') closePreview();
    }
    window.addEventListener('keydown', onKeydown);
    return () => window.removeEventListener('keydown', onKeydown);
  });
</script>

<div class={cls} style={rootStyle || undefined} data-status={status}>
  {#if status === 'error'}
    {#if fallbackSrc}
      <img class="cd-image__img" src={fallbackSrc} {alt} style={imgStyle} />
    {:else if fallback === true}
      <div class="cd-image__error" role="img" aria-label={alt || loc().t('Image.errorAlt')}>
        <svg viewBox="0 0 48 48" width="32" height="32" aria-hidden="true" focusable="false">
          <rect x="6" y="10" width="36" height="28" rx="3" fill="none" stroke="currentColor" stroke-width="2" />
          <path d="M12 32 20 22 27 30 32 25 38 32" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" />
          <circle cx="30" cy="18" r="3" fill="currentColor" />
        </svg>
      </div>
    {:else if errorSlot}
      {@render errorSlot()}
    {/if}
  {:else}
    {#if showPlaceholder}
      <div class="cd-image__placeholder" aria-hidden="true">
        {#if placeholderSrc}
          <img class="cd-image__img cd-image__placeholder-img" src={placeholderSrc} alt="" style={imgStyle} />
        {:else if placeholderSlot}
          {@render placeholderSlot()}
        {:else if showSkeleton}
          <span class="cd-image__skeleton"></span>
        {/if}
      </div>
    {/if}

    {#if canPreview}
      <button
        type="button"
        class="cd-image__trigger"
        onclick={openPreview}
        aria-label={loc().t('Image.previewTrigger')}
      >
        <img
          bind:this={imgNode}
          class="cd-image__img"
          src={resolvedSrc}
          {alt}
          loading={nativeLoading}
          style={imgStyle}
          onload={handleLoad}
          onerror={handleError}
        />
        <span class="cd-image__mask" aria-hidden="true">{loc().t('Image.previewMask')}</span>
      </button>
    {:else}
      <img
        bind:this={imgNode}
        class="cd-image__img"
        src={resolvedSrc}
        {alt}
        loading={nativeLoading}
        style={imgStyle}
        onload={handleLoad}
        onerror={handleError}
      />
    {/if}
  {/if}
</div>

{#if previewOpen}
  <div
    class="cd-image__preview"
    role="dialog"
    aria-modal="true"
    aria-label={alt || loc().t('Image.previewAlt')}
    tabindex="-1"
    onclick={closePreview}
    onkeydown={handleOverlayKeydown}
  >
    <button
      type="button"
      class="cd-image__preview-close"
      aria-label={loc().t('Image.closePreview')}
      onclick={closePreview}
    >
      ×
    </button>
    <img class="cd-image__preview-img" {src} {alt} />
  </div>
{/if}

<style>
  .cd-image {
    position: relative;
    display: inline-block;
    overflow: hidden;
    background: var(--cd-image-bg);
    border-radius: var(--cd-image-radius);
    line-height: 0;
  }
  .cd-image__img {
    display: block;
    inline-size: 100%;
    block-size: 100%;
  }
  .cd-image__trigger {
    display: block;
    inline-size: 100%;
    block-size: 100%;
    padding: 0;
    margin: 0;
    border: 0;
    background: none;
    cursor: zoom-in;
  }
  .cd-image__trigger:focus-visible {
    outline: var(--cd-focus-ring);
    outline-offset: -2px;
  }

  .cd-image__placeholder {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .cd-image__placeholder-img {
    object-fit: cover;
  }
  .cd-image__skeleton {
    inline-size: 100%;
    block-size: 100%;
    background: var(--cd-image-placeholder-color);
    opacity: 0.4;
  }

  .cd-image__error {
    display: flex;
    align-items: center;
    justify-content: center;
    inline-size: 100%;
    block-size: 100%;
    min-block-size: 64px;
    color: var(--cd-image-placeholder-color);
  }

  .cd-image__mask {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--cd-image-mask-bg);
    color: var(--cd-image-mask-color);
    line-height: normal;
    opacity: 0;
    transition: opacity var(--cd-motion-duration-fast, 0.12s) ease;
  }
  .cd-image__trigger:hover .cd-image__mask,
  .cd-image__trigger:focus-visible .cd-image__mask {
    opacity: 1;
  }

  .cd-image__preview {
    position: fixed;
    inset: 0;
    z-index: var(--cd-image-preview-z);
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--cd-image-preview-overlay);
    line-height: normal;
  }
  .cd-image__preview-img {
    max-inline-size: 90vw;
    max-block-size: 90vh;
    object-fit: contain;
  }
  .cd-image__preview-close {
    position: absolute;
    inset-block-start: 16px;
    inset-inline-end: 16px;
    inline-size: 36px;
    block-size: 36px;
    padding: 0;
    border: 0;
    border-radius: var(--cd-radius-full);
    background: var(--cd-image-mask-bg);
    color: var(--cd-image-mask-color);
    font-size: 24px;
    cursor: pointer;
  }
  .cd-image__preview-close:focus-visible {
    outline: var(--cd-focus-ring);
  }

  @media (prefers-reduced-motion: reduce) {
    .cd-image__mask {
      transition: none;
    }
  }
</style>
