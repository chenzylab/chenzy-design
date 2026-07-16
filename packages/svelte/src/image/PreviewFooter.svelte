<!--
  PreviewFooter — 预览底部操作区（对齐 Semi image/previewFooter.tsx + previewFooterFoundation）。
  功能项顺序（对齐 Semi getMenu）：上一张 · 页码 · 下一张 · 缩小 · 缩放Slider · 放大 ·
    原始尺寸↔适应页面 · 旋转 · 下载。默认渲染在「翻页组后」「原始尺寸后」插竖分割线
    （对齐 Semi getFooterMenu 的 splice(3) / splice(8)：div1 在 minus 前、div2 在 rotate 前）。
  renderPreviewMenu 存在时把结构化 props（含 menuItems: Snippet[] 默认按钮数组）交出自定义。
  showTooltip 决定每项是否 Tooltip 包裹。缩放值以百分比流转（zoom*100）。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import {
    IconChevronLeft,
    IconChevronRight,
    IconMinus,
    IconPlus,
    IconRotate,
    IconDownload,
    IconRealSizeStroked,
    IconWindowAdaptionStroked,
  } from '@chenzy-design/icons';
  import { Slider } from '../slider/index.js';
  import { Divider } from '../divider/index.js';
  import { Tooltip } from '../tooltip/index.js';
  import { useLocale } from '../locale-provider/index.js';

  type RatioType = 'adaptation' | 'realSize';

  export interface MenuProps {
    min?: number | undefined;
    max?: number | undefined;
    step?: number | undefined;
    curPage?: number | undefined;
    totalNum?: number | undefined;
    zoom?: number | undefined;
    ratio?: RatioType | undefined;
    disabledPrev?: boolean | undefined;
    disabledNext?: boolean | undefined;
    disableDownload?: boolean | undefined;
    disabledZoomIn?: boolean | undefined;
    disabledZoomOut?: boolean | undefined;
    onDownload?: (() => void) | undefined;
    onNext?: (() => void) | undefined;
    onPrev?: (() => void) | undefined;
    onZoomIn?: (() => void) | undefined;
    onZoomOut?: (() => void) | undefined;
    onRatioClick?: (() => void) | undefined;
    onRotateLeft?: (() => void) | undefined;
    onRotateRight?: (() => void) | undefined;
    /** 默认底部操作区按钮的 Snippet 数组，顺序同默认工具栏（对齐 Semi menuItems）。 */
    menuItems?: Snippet[] | undefined;
  }

  interface Props {
    curPage?: number | undefined;
    totalNum?: number | undefined;
    disabledPrev?: boolean | undefined;
    disabledNext?: boolean | undefined;
    disableDownload?: boolean | undefined;
    /** 缩放百分比（zoom*100）。 */
    zoom?: number | undefined;
    min?: number | undefined;
    max?: number | undefined;
    step?: number | undefined;
    ratio?: RatioType | undefined;
    showTooltip?: boolean | undefined;
    zIndex?: number | undefined;
    class?: string | undefined;
    prevTip?: string | undefined;
    nextTip?: string | undefined;
    zoomInTip?: string | undefined;
    zoomOutTip?: string | undefined;
    rotateTip?: string | undefined;
    downloadTip?: string | undefined;
    adaptiveTip?: string | undefined;
    originTip?: string | undefined;
    onPrev?: () => void;
    onNext?: () => void;
    onZoomIn?: (zoom: number) => void;
    onZoomOut?: (zoom: number) => void;
    onDownload?: () => void;
    onRotate?: (direction: string) => void;
    onAdjustRatio?: (type: RatioType) => void;
    renderPreviewMenu?: Snippet<[MenuProps]> | undefined;
  }

  let {
    curPage = 1,
    totalNum = 0,
    disabledPrev = false,
    disabledNext = false,
    disableDownload = false,
    zoom = 100,
    min = 10,
    max = 500,
    step = 10,
    ratio = 'adaptation',
    showTooltip = false,
    zIndex,
    class: className = '',
    prevTip,
    nextTip,
    zoomInTip,
    zoomOutTip,
    rotateTip,
    downloadTip,
    adaptiveTip,
    originTip,
    onPrev,
    onNext,
    onZoomIn,
    onZoomOut,
    onDownload,
    onRotate,
    onAdjustRatio,
    renderPreviewMenu,
  }: Props = $props();

  const loc = useLocale();

  const disabledZoomIn = $derived(zoom === max);
  const disabledZoomOut = $derived(zoom === min);

  // 缩放步进（对齐 Semi changeSliderValue）：加减号按钮 → clamp。
  function changeSliderValue(type: 'plus' | 'minus') {
    let next = type === 'plus' ? zoom + step : zoom - step;
    if (next > max) next = max;
    else if (next < min) next = min;
    handleValueChange(next);
  }
  // slider 拖动/按钮统一入口：按方向调 onZoomIn/onZoomOut，值转回 0~x 倍率。
  function handleValueChange(value: number) {
    if (value > zoom) onZoomIn?.(Number((value / 100).toFixed(2)));
    else onZoomOut?.(Number((value / 100).toFixed(2)));
  }
  function handleRatioClick() {
    onAdjustRatio?.(ratio === 'adaptation' ? 'realSize' : 'adaptation');
  }
  function handleRotateLeft() {
    onRotate?.('left');
  }
  function handleRotateRight() {
    onRotate?.('right');
  }

  const prevContent = $derived(prevTip ?? loc().t('Image.prevTip'));
  const nextContent = $derived(nextTip ?? loc().t('Image.nextTip'));
  const zoomInContent = $derived(zoomInTip ?? loc().t('Image.zoomInTip'));
  const zoomOutContent = $derived(zoomOutTip ?? loc().t('Image.zoomOutTip'));
  const rotateContent = $derived(rotateTip ?? loc().t('Image.rotateTip'));
  const downloadContent = $derived(downloadTip ?? loc().t('Image.downloadTip'));
  const ratioContent = $derived(
    ratio === 'adaptation'
      ? (originTip ?? loc().t('Image.originTip'))
      : (adaptiveTip ?? loc().t('Image.adaptiveTip')),
  );

  // 结构化 menuProps（renderPreviewMenu 与 menuItems 共用）。
  const menuProps = $derived<MenuProps>({
    min,
    max,
    step,
    curPage,
    totalNum,
    zoom,
    ratio,
    disabledPrev,
    disabledNext,
    disableDownload,
    disabledZoomIn,
    disabledZoomOut,
    onDownload,
    onNext: !disabledNext ? onNext : undefined,
    onPrev: !disabledPrev ? onPrev : undefined,
    onZoomIn: () => changeSliderValue('plus'),
    onZoomOut: () => changeSliderValue('minus'),
    onRatioClick: handleRatioClick,
    onRotateLeft: handleRotateLeft,
    onRotateRight: handleRotateRight,
    menuItems: [
      itemChevronLeft,
      itemPage,
      itemChevronRight,
      itemMinus,
      itemSlider,
      itemPlus,
      itemRatio,
      itemRotate,
      itemDownload,
    ],
  });
</script>

<!-- 各功能项 Snippet（默认渲染与 menuItems 数组共用同一实现） -->
{#snippet tip(content: string, gap: boolean, inner: Snippet)}
  {#if showTooltip}
    <Tooltip {content} zIndex={zIndex !== undefined ? zIndex + 1 : undefined}>
      <span class="cd-image-tooltip-children-wrapper" class:cd-image-preview-footer-gap={gap}>
        {@render inner()}
      </span>
    </Tooltip>
  {:else}
    {@render inner()}
  {/if}
{/snippet}

{#snippet itemChevronLeft()}
  {#snippet ic()}
    <IconChevronLeft
      size="large"
      class={disabledPrev ? 'cd-image-preview-footer-disabled' : ''}
      onclick={!disabledPrev ? onPrev : undefined}
    />
  {/snippet}
  {@render tip(prevContent, false, ic)}
{/snippet}

{#snippet itemPage()}
  <div class="cd-image-preview-footer-page">{curPage}/{totalNum}</div>
{/snippet}

{#snippet itemChevronRight()}
  {#snippet ic()}
    <IconChevronRight
      size="large"
      class={disabledNext ? 'cd-image-preview-footer-disabled' : ''}
      onclick={!disabledNext ? onNext : undefined}
    />
  {/snippet}
  {@render tip(nextContent, false, ic)}
{/snippet}

{#snippet itemMinus()}
  {#snippet ic()}
    <IconMinus
      size="large"
      class={disabledZoomOut ? 'cd-image-preview-footer-disabled' : ''}
      onclick={!disabledZoomOut ? () => changeSliderValue('minus') : undefined}
    />
  {/snippet}
  {@render tip(zoomOutContent, false, ic)}
{/snippet}

{#snippet itemSlider()}
  <Slider
    value={zoom}
    {min}
    {max}
    {step}
    tipFormatter={(v) => `${v}%`}
    tooltipVisible={showTooltip ? undefined : false}
    onChange={(v) => handleValueChange(typeof v === 'number' ? v : v[0])}
  />
{/snippet}

{#snippet itemPlus()}
  {#snippet ic()}
    <IconPlus
      size="large"
      class={disabledZoomIn ? 'cd-image-preview-footer-disabled' : ''}
      onclick={!disabledZoomIn ? () => changeSliderValue('plus') : undefined}
    />
  {/snippet}
  {@render tip(zoomInContent, false, ic)}
{/snippet}

{#snippet itemRatio()}
  {#snippet ic()}
    {#if ratio === 'adaptation'}
      <IconRealSizeStroked
        size="large"
        class={showTooltip ? '' : 'cd-image-preview-footer-gap'}
        onclick={handleRatioClick}
      />
    {:else}
      <IconWindowAdaptionStroked
        size="large"
        class={showTooltip ? '' : 'cd-image-preview-footer-gap'}
        onclick={handleRatioClick}
      />
    {/if}
  {/snippet}
  {@render tip(ratioContent, true, ic)}
{/snippet}

{#snippet itemRotate()}
  {#snippet ic()}
    <IconRotate size="large" onclick={handleRotateLeft} />
  {/snippet}
  {@render tip(rotateContent, false, ic)}
{/snippet}

{#snippet itemDownload()}
  {#snippet ic()}
    <IconDownload
      size="large"
      class={[
        !showTooltip && 'cd-image-preview-footer-gap',
        disableDownload && 'cd-image-preview-footer-disabled',
      ]
        .filter(Boolean)
        .join(' ')}
      onclick={!disableDownload ? onDownload : undefined}
    />
  {/snippet}
  {@render tip(downloadContent, true, ic)}
{/snippet}

<section
  class={['cd-image-preview-footer', 'cd-image-preview-footer-wrapper', className]
    .filter(Boolean)
    .join(' ')}
  class:cd-image-preview-footer-content={!renderPreviewMenu}
>
  {#if renderPreviewMenu}
    {@render renderPreviewMenu(menuProps)}
  {:else}
    {@render itemChevronLeft()}
    {@render itemPage()}
    {@render itemChevronRight()}
    <Divider layout="vertical" />
    {@render itemMinus()}
    {@render itemSlider()}
    {@render itemPlus()}
    {@render itemRatio()}
    <Divider layout="vertical" />
    {@render itemRotate()}
    {@render itemDownload()}
  {/if}
</section>

<style>
  .cd-image-preview-footer {
    display: flex;
    align-items: center;
  }
  .cd-image-preview-footer-wrapper {
    position: absolute;
    inset-inline-start: 50%;
    inset-block-end: 16px;
    transform: translateX(-50%);
  }
  .cd-image-preview-footer-content {
    padding-inline: var(--cd-image-preview-footer-padding-x);
    background: var(--cd-image-preview-footer-bg);
    border-radius: var(--cd-image-preview-footer-radius);
    height: var(--cd-image-preview-footer-height);
  }
  .cd-image-preview-footer-page {
    user-select: none;
    color: var(--cd-image-preview-footer-icon-color);
    margin-inline: var(--cd-image-preview-footer-page-margin-x);
  }
  .cd-image-preview-footer :global(.cd-icon) {
    color: var(--cd-image-preview-footer-icon-color);
    cursor: pointer;
  }
  /* gap 类可能加在子组件 Icon 的 span 上（footer scoped 选择器不命中子组件），用 :global 命中。 */
  .cd-image-preview-footer :global(.cd-image-preview-footer-gap) {
    margin-inline-start: var(--cd-image-preview-footer-gap);
  }
  .cd-image-tooltip-children-wrapper {
    display: inline-flex;
    width: fit-content;
    height: fit-content;
    vertical-align: middle;
  }

  /* 缩放 Slider：尺寸/颜色对齐 Semi image.scss footer slider 覆盖。
     Semi 的 slider width 是「内容区」宽（content-box），总宽 = width + padding*2 = 132+32 = 164px。
     本项目 slider 默认 border-box，故显式 content-box 以对齐 Semi 总宽，避免 slider 被挤窄。 */
  .cd-image-preview-footer :global(.cd-slider) {
    box-sizing: content-box;
    width: var(--cd-image-preview-footer-slider-width);
    padding-inline: var(--cd-image-preview-footer-slider-padding-x);
  }
  .cd-image-preview-footer :global(.cd-slider__rail) {
    color: var(--cd-image-preview-footer-slider-rail-color);
    block-size: var(--cd-image-preview-footer-slider-height);
  }
  .cd-image-preview-footer :global(.cd-slider__track) {
    block-size: var(--cd-image-preview-footer-slider-height);
  }
  .cd-image-preview-footer :global(.cd-slider__handle) {
    width: var(--cd-image-preview-footer-slider-handle-size);
    height: var(--cd-image-preview-footer-slider-handle-size);
    box-sizing: border-box;
  }

  /* 竖分割线：颜色对齐 Semi footer divider 覆盖 */
  .cd-image-preview-footer :global(.cd-divider--vertical) {
    background: var(--cd-image-preview-divider-bg);
    margin-inline: var(--cd-image-preview-footer-divider-margin-x);
  }

  .cd-image-preview-footer :global(.cd-image-preview-footer-disabled) {
    color: var(--cd-image-preview-disabled-color);
    cursor: default;
    pointer-events: none;
  }
</style>
