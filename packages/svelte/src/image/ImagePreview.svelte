<!--
  ImagePreview — 图片预览组 / 独立可编程预览（对齐 Semi image/preview.tsx）。
  两种用法：
    1) 包裹多个 <Image>：子图注册进组，点任一图进组预览可左右切换（PreviewContext）。
    2) 独立：直接传 src=string|string[] + visible/onVisibleChange 编程式控制，无需 children。
  受控 currentIndex/visible 不回写，仅经 onChange/onVisibleChange（红线 #1）。
  lazyLoad 时对组内子 .cd-image-img 做 IntersectionObserver 懒设真实 src（命令式 + cleanup，红线 #3）。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { untrack } from 'svelte';
  import PreviewInner from './PreviewInner.svelte';
  import { setImagePreviewGroupContext } from './previewContext.js';
  import type { PreviewProps, MenuProps } from './types.js';

  type RatioType = 'adaptation' | 'realSize';

  interface Props extends Omit<PreviewProps, 'src' | 'previewTitle'> {
    src?: string | string[];
    class?: string;
    style?: string;
    children?: Snippet;
  }

  let {
    src,
    visible,
    defaultVisible,
    currentIndex,
    defaultCurrentIndex,
    maskClosable,
    closable,
    closeOnEsc,
    zoomStep,
    infinite,
    showTooltip,
    prevTip,
    nextTip,
    zoomInTip,
    zoomOutTip,
    rotateTip,
    downloadTip,
    adaptiveTip,
    originTip,
    lazyLoad = true,
    lazyLoadMargin = '0px 100px 100px 0px',
    preLoad,
    preLoadGap,
    viewerVisibleDelay,
    disableDownload,
    zIndex,
    crossOrigin,
    maxZoom,
    minZoom,
    initialZoom,
    previewCls,
    previewStyle,
    getPopupContainer,
    setDownloadName,
    renderHeader,
    renderPreviewMenu,
    renderCloseIcon,
    renderLeftIcon,
    renderRightIcon,
    onVisibleChange,
    onChange,
    onClose,
    onZoomIn,
    onZoomOut,
    onPrev,
    onNext,
    onRotateLeft,
    onRatioChange,
    onDownload,
    onDownloadError,
    class: className = '',
    style = '',
    children,
  }: Props = $props();

  // 已注册子图（注册顺序即索引）；卸载置 null 避免索引漂移。
  let items = $state<
    ({ getSrc: () => string; getTitle: () => string | Snippet | undefined } | null)[]
  >([]);

  // 非受控本地态（初始读一次 default*，untrack 避免 state_referenced_locally 警告）。
  let innerCurrent = $state(untrack(() => defaultCurrentIndex) ?? 0);
  let innerVisible = $state(untrack(() => defaultVisible) ?? false);

  const isCurrentControlled = $derived(currentIndex !== undefined);
  const isVisibleControlled = $derived(visible !== undefined);
  const activeCurrent = $derived(isCurrentControlled ? (currentIndex as number) : innerCurrent);
  const activeVisible = $derived(isVisibleControlled ? (visible as boolean) : innerVisible);

  // props.src 展平为数组。
  const propsSrcArr = $derived(
    Array.isArray(src) ? src : typeof src === 'string' ? [src] : [],
  );
  // 组内子图紧凑列表（过滤已卸载槽位）。
  const childList = $derived(
    items.filter(
      (it): it is { getSrc: () => string; getTitle: () => string | Snippet | undefined } =>
        it !== null,
    ),
  );
  const childSrc = $derived(childList.map((it) => it.getSrc()));
  const childTitles = $derived(childList.map((it) => it.getTitle()));
  const finalSrcList = $derived([...propsSrcArr, ...childSrc]);
  const finalTitles = $derived<(string | Snippet | undefined)[]>([
    ...propsSrcArr.map(() => undefined),
    ...childTitles,
  ]);

  function setCurrent(index: number) {
    if (!isCurrentControlled) innerCurrent = index;
    onChange?.(index);
  }
  function setVisible(next: boolean) {
    if (!isVisibleControlled) innerVisible = next;
    onVisibleChange?.(next);
  }

  setImagePreviewGroupContext({
    isGroup: true,
    // context 仅 setup 时构建一次；lazyLoad/lazyLoadMargin/setDownloadName 取初始值（运行期不变），untrack 消警告。
    lazyLoad: untrack(() => lazyLoad),
    lazyLoadMargin: untrack(() => lazyLoadMargin),
    register(item) {
      const slot = items.length;
      items = [...items, item];
      return slot;
    },
    unregister(slot) {
      if (slot < items.length) {
        const next = items.slice();
        next[slot] = null;
        items = next;
      }
    },
    setCurrentIndex(index) {
      // 子图 imageID 是「所有可预览子图」中的序号，需叠加 propsSrc 偏移。
      setCurrent(propsSrcArr.length + index);
    },
    handleVisibleChange(v) {
      setVisible(v);
    },
    setDownloadName: untrack(() => setDownloadName),
  });

  // lazyLoad：每个子 Image 自管 IntersectionObserver（见 Image.svelte），进视口才设真实 src。
  // 此处仅提供组根容器引用（布局/样式用）。lazyLoad 经 context 下发给子图。
  let rootEl = $state<HTMLDivElement | null>(null);

  const groupCls = $derived(
    ['cd-image-preview-group', className].filter(Boolean).join(' '),
  );
</script>

<div bind:this={rootEl} class={groupCls} {style}>
  {@render children?.()}
</div>

{#if finalSrcList.length > 0}
  <PreviewInner
    src={finalSrcList}
    titles={finalTitles}
    visible={activeVisible}
    currentIndex={activeCurrent}
    onVisibleChange={setVisible}
    onChange={setCurrent}
    {maskClosable}
    {closable}
    {closeOnEsc}
    {infinite}
    {zoomStep}
    {maxZoom}
    {minZoom}
    {initialZoom}
    {preLoad}
    {preLoadGap}
    {disableDownload}
    {showTooltip}
    {viewerVisibleDelay}
    {zIndex}
    {crossOrigin}
    {prevTip}
    {nextTip}
    {zoomInTip}
    {zoomOutTip}
    {rotateTip}
    {downloadTip}
    {adaptiveTip}
    {originTip}
    className={previewCls ?? ''}
    style={previewStyle ?? ''}
    {getPopupContainer}
    {setDownloadName}
    {renderHeader}
    {renderPreviewMenu}
    {renderCloseIcon}
    {renderLeftIcon}
    {renderRightIcon}
    {onClose}
    {onZoomIn}
    {onZoomOut}
    {onPrev}
    {onNext}
    {onRotateLeft}
    {onRatioChange}
    {onDownload}
    {onDownloadError}
  />
{/if}
