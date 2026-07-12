<!--
  Image — 增强图片（对齐 Semi image/image.tsx + imageFoundation）。
  职责：src 加载态机（loading/success/error）→ overlay 显占位/破图；success 且 preview 时
    hover 蒙层 + 点击进预览。在 ImagePreview（组）内时把预览交给组共享浮层（context），
    否则渲染自身单图 PreviewInner。
  DOM 镜像 Semi：.cd-image > img.cd-image-img + .cd-image-overlay(status) + .cd-image-mask + PreviewInner。
  红线 #1：preview.visible 受控不回写，仅经 preview.onVisibleChange 回调（非受控用本地态）。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { untrack } from 'svelte';
  import { SkeletonImage } from '../skeleton/index.js';
  import { Icon } from '../icon/index.js';
  import { useLocale } from '../locale-provider/index.js';
  import PreviewInner from './PreviewInner.svelte';
  import { getImagePreviewGroupContext } from './previewContext.js';
  import { iconEyeOpened, iconUploadError } from './icons.js';
  import type { PreviewProps } from './types.js';

  type LoadStatus = 'loading' | 'success' | 'error';

  interface Props {
    src?: string;
    width?: number | string;
    height?: number | string;
    alt?: string;
    /** 加载中占位内容（对齐 Semi placeholder: ReactNode）。 */
    placeholder?: Snippet;
    /** 加载失败：string=降级图 src；Snippet=自定义内容；不传=默认破图。 */
    fallback?: string | Snippet;
    /** 预览：false 禁用；true 默认开启；对象=预览参数（含 src 覆盖预览图）。 */
    preview?: boolean | PreviewProps;
    crossorigin?: 'anonymous' | 'use-credentials';
    /** 透传到 img 的自定义类名（对齐 Semi imgCls）。 */
    imgCls?: string;
    /** 透传到 img 的自定义内联样式（对齐 Semi imgStyle）。 */
    imgStyle?: string;
    /** 预览下载自定义文件名（对齐 Semi setDownloadName）。 */
    setDownloadName?: (src: string) => string;
    class?: string;
    style?: string;
    /** 组内稳定索引，由 ImagePreview 组注入（对齐 Semi imageID）。 */
    imageID?: number;
    onError?: (e: Event) => void;
    onLoad?: (e: Event) => void;
    onClick?: (e: MouseEvent) => void;
  }

  let {
    src,
    width,
    height,
    alt = '',
    placeholder,
    fallback,
    preview = true,
    crossorigin,
    imgCls,
    imgStyle,
    setDownloadName,
    class: className = '',
    style = '',
    imageID,
    onError,
    onLoad,
    onClick,
  }: Props = $props();

  const loc = useLocale();
  const group = getImagePreviewGroupContext();

  let loadStatus = $state<LoadStatus>('loading');
  // 单图非受控预览可见态（组内不用）。
  let previewVisible = $state(false);

  // 组内懒加载：img bind + 进视口态。进视口前 src 为 undefined（声明式派生，避免命令式
  // 设 DOM 被 Svelte 响应式覆盖）。非组内或组未开 lazyLoad 时恒 true。
  let imgNode = $state<HTMLImageElement | null>(null);
  const lazyLoad = $derived(Boolean(group?.lazyLoad));
  // 初始 inView：复用同一次 getContext 的 group（勿重复调 getContext，setup 后返回 undefined）。
  // 非懒加载（无组/组未开）时恒 true，src 直接生效。
  let inView = $state(!(group?.lazyLoad ?? false));
  const resolvedSrc = $derived(lazyLoad && !inView ? undefined : src);

  // preview 为对象时提取参数；预览图 src 优先取 preview.src，否则用 src。
  const previewProps = $derived(
    typeof preview === 'object' && preview !== null ? preview : undefined,
  );
  const previewEnabled = $derived(preview !== false);
  // 单图预览图源窄化为 string：preview.src 为数组时取首张，否则用它，再回退 src。
  const previewSrc = $derived<string | undefined>(
    Array.isArray(previewProps?.src)
      ? previewProps.src[0]
      : ((previewProps?.src as string | undefined) ?? src),
  );
  const canPreview = $derived(loadStatus === 'success' && previewEnabled && !group);
  const showPreviewCursor = $derived(previewEnabled && loadStatus === 'success');

  // 受控 previewVisible（对齐 Semi getDerivedStateFromProps：preview.visible 为 bool 时受控）。
  const controlledVisible = $derived(
    typeof previewProps?.visible === 'boolean' ? previewProps.visible : undefined,
  );
  const effectiveVisible = $derived(controlledVisible ?? previewVisible);

  // src 变化重置加载态（对齐 Semi getDerivedStateFromProps）。
  let lastSrc = $state(untrack(() => src));
  $effect(() => {
    if (src !== lastSrc) {
      lastSrc = src;
      loadStatus = 'loading';
    }
  });

  // 组内懒加载 IntersectionObserver：进视口置 inView（命令式创建 + cleanup，红线 #3）。
  // 每图自管 observer，src 经 resolvedSrc 声明式派生，进视口后浏览器加载，避免命令式改 DOM 被覆盖。
  $effect(() => {
    if (!lazyLoad || inView) return;
    const node = imgNode;
    if (!node) return;
    if (typeof IntersectionObserver === 'undefined') {
      inView = true;
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            inView = true;
            observer.disconnect();
            break;
          }
        }
      },
      { rootMargin: group?.lazyLoadMargin ?? '0px 100px 100px 0px' },
    );
    observer.observe(node);
    return () => observer.disconnect();
  });

  // 组内注册（注册顺序 = imageID）；src/title 用 getter 保持响应，卸载注销（红线 #3 cleanup）。
  let groupID = -1;
  if (group) {
    groupID = group.register({
      getSrc: () => previewSrc ?? '',
      getTitle: () => previewProps?.previewTitle,
    });
    $effect(() => () => group.unregister(groupID));
  }

  function handleLoad(e: Event) {
    onLoad?.(e);
    loadStatus = 'success';
  }
  function handleError(e: Event) {
    onError?.(e);
    loadStatus = 'error';
  }
  function handleClick(e: MouseEvent) {
    onClick?.(e);
    if (!previewEnabled) return;
    if (group) {
      group.setCurrentIndex(imageID ?? groupID);
      group.handleVisibleChange(true);
    } else {
      setPreviewVisible(true);
    }
  }
  function setPreviewVisible(v: boolean) {
    previewProps?.onVisibleChange?.(v);
    if (controlledVisible === undefined) previewVisible = v;
  }

  const outerStyle = $derived(
    [
      width !== undefined && `width:${typeof width === 'number' ? `${width}px` : width}`,
      height !== undefined && `height:${typeof height === 'number' ? `${height}px` : height}`,
      style,
    ]
      .filter(Boolean)
      .join(';'),
  );

  const fallbackSrc = $derived(typeof fallback === 'string' ? fallback : undefined);

  const imgClass = $derived(
    [
      'cd-image-img',
      showPreviewCursor && 'cd-image-img-preview',
      loadStatus === 'error' && 'cd-image-img-error',
      imgCls,
    ]
      .filter(Boolean)
      .join(' '),
  );
</script>

<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
<div
  class={['cd-image', className].filter(Boolean).join(' ')}
  style={outerStyle || undefined}
  onclick={handleClick}
>
  <img
    bind:this={imgNode}
    class={imgClass}
    src={resolvedSrc}
    {alt}
    {width}
    {height}
    crossorigin={crossorigin}
    style={imgStyle}
    onload={handleLoad}
    onerror={handleError}
  />

  {#if loadStatus !== 'success'}
    <div class="cd-image-overlay">
      {#if loadStatus === 'error'}
        {#if fallbackSrc}
          <div class="cd-image-status">
            <img class="cd-image-status-fallback" src={fallbackSrc} alt="fallback" />
          </div>
        {:else if typeof fallback === 'function'}
          <div class="cd-image-status">{@render fallback()}</div>
        {:else}
          <div class="cd-image-status" role="img" aria-label={alt || loc().t('Image.errorAlt')}>
            <Icon svg={iconUploadError} size="extra-large" />
          </div>
        {/if}
      {:else if loadStatus === 'loading'}
        {#if placeholder}
          <div class="cd-image-status">{@render placeholder()}</div>
        {:else}
          <div class="cd-image-status"><SkeletonImage /></div>
        {/if}
      {/if}
    </div>
  {/if}

  {#if showPreviewCursor}
    <div class="cd-image-mask" aria-hidden="true">
      <div class="cd-image-mask-info">
        <Icon svg={iconEyeOpened} size="extra-large" />
        <span class="cd-image-mask-info-text">{loc().t('Image.preview')}</span>
      </div>
    </div>
  {/if}
</div>

{#if canPreview && previewSrc}
  <PreviewInner
    src={[previewSrc]}
    visible={effectiveVisible}
    onVisibleChange={setPreviewVisible}
    crossOrigin={crossorigin}
    {setDownloadName}
    maskClosable={previewProps?.maskClosable}
    closable={previewProps?.closable}
    closeOnEsc={previewProps?.closeOnEsc}
    zoomStep={previewProps?.zoomStep}
    maxZoom={previewProps?.maxZoom}
    minZoom={previewProps?.minZoom}
    initialZoom={previewProps?.initialZoom}
    disableDownload={previewProps?.disableDownload}
    showTooltip={previewProps?.showTooltip}
    viewerVisibleDelay={previewProps?.viewerVisibleDelay}
    zIndex={previewProps?.zIndex}
    prevTip={previewProps?.prevTip}
    nextTip={previewProps?.nextTip}
    zoomInTip={previewProps?.zoomInTip}
    zoomOutTip={previewProps?.zoomOutTip}
    rotateTip={previewProps?.rotateTip}
    downloadTip={previewProps?.downloadTip}
    adaptiveTip={previewProps?.adaptiveTip}
    originTip={previewProps?.originTip}
    getPopupContainer={previewProps?.getPopupContainer}
    renderHeader={previewProps?.renderHeader}
    renderPreviewMenu={previewProps?.renderPreviewMenu}
    renderCloseIcon={previewProps?.renderCloseIcon}
    renderLeftIcon={previewProps?.renderLeftIcon}
    renderRightIcon={previewProps?.renderRightIcon}
    onClose={previewProps?.onClose}
    onZoomIn={previewProps?.onZoomIn}
    onZoomOut={previewProps?.onZoomOut}
    onDownload={previewProps?.onDownload}
    onRotateLeft={previewProps?.onRotateLeft}
    onRatioChange={previewProps?.onRatioChange}
    onDownloadError={previewProps?.onDownloadError}
  />
{/if}

<style>
  .cd-image {
    border-radius: var(--cd-image-radius);
    position: relative;
    display: inline-block;
    overflow: hidden;
  }
  .cd-image :global(img) {
    /* 覆盖 tailwind 等把 img max-width 设为 100% 的场景，否则影响预览放大 */
    max-width: none;
  }
  .cd-image-img {
    vertical-align: top;
    border-radius: inherit;
    user-select: none;
  }
  .cd-image-img-preview {
    cursor: zoom-in;
  }
  .cd-image-img-error {
    opacity: 0;
  }
  .cd-image-overlay {
    position: absolute;
    inset-block-start: 0;
    inset-inline-start: 0;
    width: 100%;
    height: 100%;
  }
  .cd-image-status {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: var(--cd-image-radius);
    background-color: var(--cd-image-status-bg);
    color: var(--cd-image-status-color);
  }
  .cd-image-status-fallback {
    width: 100%;
    height: 100%;
  }

  /* hover 预览蒙层 */
  .cd-image-mask {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--cd-image-mask-bg);
    color: var(--cd-image-mask-info-text);
    opacity: 0;
    transition: opacity var(--cd-motion-duration-fast, 0.12s) ease;
  }
  .cd-image:hover .cd-image-mask {
    opacity: 1;
  }
  .cd-image-mask-info {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .cd-image-mask-info-text {
    margin-block-start: var(--cd-image-mask-info-text-margin-top);
  }

  @media (prefers-reduced-motion: reduce) {
    .cd-image-mask {
      transition: none;
    }
  }
</style>
