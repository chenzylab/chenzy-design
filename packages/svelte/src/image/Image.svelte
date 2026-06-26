<!--
  Image — see specs/components/show/Image.spec.md
  基础子集：src + 懒加载(native/observer) + fit/position + 占位 + 失败降级 +
    点击预览(全屏遮罩 portal + 缩放/旋转/重置工具栏 + 多图左右切换) + LQIP 模糊占位 +
    crossorigin/srcset/sizes 原生属性透传(响应式图源)。

  红线遵守：
   - observer 模式 IntersectionObserver 在 $effect 内命令式创建 + cleanup disconnect；
     node 用 bind:this 普通引用，不在 render 期读几何。
   - 预览浮层 portal、keydown 监听在 ImagePreview 内命令式 + cleanup。
   - 无受控 prop 需回写（previewOpen 为本地 $state）。
   - 在 Image.PreviewGroup 内时，预览态交由组共享浮层管理（受控不回写仅回调）。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { untrack } from 'svelte';
  import { useLocale } from '../locale-provider/index.js';
  import ImagePreview from './ImagePreview.svelte';
  import { getImageGroupContext } from './context.js';

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
    crossorigin?: 'anonymous' | 'use-credentials';
    srcset?: string;
    sizes?: string;
    lazy?: boolean;
    lazyMode?: LazyMode;
    rootMargin?: string;
    placeholder?: string | boolean;
    fallback?: string | boolean;
    preview?: boolean;
    /** 自定义预览图 URL，不传时用 src。 */
    previewSrc?: string;
    /** img 加载失败回调。 */
    onError?: (e: Event) => void;
    /** img 加载成功回调。 */
    onLoad?: (e: Event) => void;
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
    crossorigin,
    srcset,
    sizes,
    lazy = true,
    lazyMode = 'native',
    rootMargin = '200px',
    placeholder = true,
    fallback = true,
    preview = false,
    previewSrc,
    onError,
    onLoad,
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
  // srcset 与 src 同步延迟：observer 未进视口前不设，避免浏览器提前选源加载。
  const resolvedSrcset = $derived(useObserver && !inView ? undefined : srcset);

  // placeholder 是字符串时当作 LQIP 低质占位图 src（loading/pending 阶段显示，CSS blur 模糊）。
  // 主图 onload 前显示模糊占位，加载完成后主图淡入清晰、占位淡出。
  const placeholderSrc = $derived(typeof placeholder === 'string' ? placeholder : undefined);
  const showPlaceholder = $derived(status === 'pending' || status === 'loading');
  const showSkeleton = $derived(showPlaceholder && placeholder === true);
  // 是否为 LQIP 模糊占位（字符串占位 = 低质图，需 blur + 淡入主图）。
  const isLqip = $derived(placeholderSrc !== undefined);
  // 主图加载完成才淡入（仅 LQIP 场景需要，避免无占位时初始透明闪烁）。
  const imgLoaded = $derived(status === 'loaded');

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

  // 装饰性图片（明确传 alt=''）：role="presentation" 让读屏跳过，不当作有意义内容。
  const presentationRole = $derived(alt === '' ? 'presentation' : undefined);

  // 主图类名：LQIP 场景下未加载完成时透明，加载完成淡入清晰。
  const imgCls = $derived(
    ['cd-image__img', isLqip && 'cd-image__img--fade', isLqip && imgLoaded && 'cd-image__img--in']
      .filter(Boolean)
      .join(' '),
  );

  const cls = $derived(
    ['cd-image', preview && status === 'loaded' && 'cd-image--previewable', className]
      .filter(Boolean)
      .join(' '),
  );

  const canPreview = $derived(preview && status === 'loaded');

  function handleLoad(e: Event) {
    status = 'loaded';
    onLoad?.(e);
  }

  function handleError(e: Event) {
    status = 'error';
    onError?.(e);
  }

  // 预览组上下文：存在则把预览态交给组共享浮层（多图切换）；否则用本地单图浮层。
  const group = getImageGroupContext();
  // 在组内注册自身（注册顺序 = 组内稳定槽位索引）。注册是一次性的（非响应式），
  // src/alt 经 getter 暴露给组以保持响应性。卸载时经 $effect cleanup 注销。
  const groupSlot = group ? group.register({ getSrc: () => previewSrc ?? src, getAlt: () => alt }) : -1;
  if (group) {
    $effect(() => () => group.unregister(groupSlot));
  }

  function openPreview() {
    if (!canPreview) return;
    if (group) {
      group.open(groupSlot);
    } else {
      previewOpen = true;
    }
  }

  function closePreview() {
    previewOpen = false;
  }

  // 单图浮层只有一张图，索引恒为 0；onChange 无实际切换（满足共享组件接口）。
  // previewSrc 指定自定义预览图（缩略图与预览图可不同）。
  const singleImages = $derived([{ src: previewSrc ?? src, alt }]);

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

  // 缓存图竞态兜底：若图片在 onload 监听挂载前已 complete（如缓存命中 / data-URI 同步解码），
  // load 事件可能不再触发，status 会卡在 loading。此处命令式补判 complete 推进状态。
  $effect(() => {
    if (status !== 'loading') return;
    const node = imgNode;
    if (!node || !node.getAttribute('src')) return;
    if (node.complete) {
      // naturalWidth 为 0 视为解码失败 → error，否则 loaded。
      status = node.naturalWidth > 0 ? 'loaded' : 'error';
    }
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
      <div class="cd-image__placeholder" aria-hidden="true" aria-busy="true">
        {#if placeholderSrc}
          <img class="cd-image__img cd-image__placeholder-img cd-image__placeholder-img--blur" src={placeholderSrc} alt="" style={imgStyle} />
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
          class={imgCls}
          src={resolvedSrc}
          srcset={resolvedSrcset}
          {sizes}
          {crossorigin}
          {alt}
          role={presentationRole}
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
        class={imgCls}
        src={resolvedSrc}
        srcset={resolvedSrcset}
        {sizes}
        {crossorigin}
        {alt}
        role={presentationRole}
        loading={nativeLoading}
        style={imgStyle}
        onload={handleLoad}
        onerror={handleError}
      />
    {/if}
  {/if}
</div>

<!-- 单图预览：复用共享浮层（组预览由 Image.PreviewGroup 渲染共享浮层）。 -->
{#if previewOpen && !group}
  <ImagePreview
    images={singleImages}
    current={0}
    onClose={closePreview}
    onChange={() => {}}
  />
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

  /* LQIP：低质占位图模糊；主图加载完成前透明，加载后淡入清晰。 */
  .cd-image__placeholder-img--blur {
    filter: blur(12px);
    transform: scale(1.05);
  }
  .cd-image__img--fade {
    opacity: 0;
    transition: opacity var(--cd-motion-duration-mid, 0.2s) var(--cd-motion-ease-standard);
  }
  .cd-image__img--in {
    opacity: 1;
  }

  @media (prefers-reduced-motion: reduce) {
    .cd-image__mask,
    .cd-image__img--fade {
      transition: none;
    }
  }
</style>
