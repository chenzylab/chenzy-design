<!--
  VideoProgress — 视频进度条（严格镜像 Semi videoProgress.tsx）。DOM：
  div.cd-videoPlayer-progress[role=slider] > div.-markers > (每段 div.-slider > -list/-buffered/-played)
  + div.-handle；showTooltip 时外包 Tooltip（有 markers 两行=章节标题+时间，否则仅时间）。
  markers 多段：每段独立 slider（含未播放底轨/缓冲/已播放三层），段间 margin-right 2px；
  hover/active 时三轨高度 4→10px。拖拽：mousedown 即定位 + 文档级 mousemove/mouseup（对齐 Semi）。
  纯自建，复用本库 Tooltip。类名前缀 cd-videoPlayer-progress（驼峰对齐 Semi）。
-->
<script lang="ts">
  import {
    progressValueFromPointer,
    segmentValueWidth,
    buildMarkerSegments,
    formatTimeDisplay,
    type VideoMarker,
  } from '@chenzy-design/core';
  import Tooltip from '../tooltip/Tooltip.svelte';

  interface Props {
    /** 当前播放时间（秒） */
    value: number;
    /** 已缓冲末端（秒） */
    buffered: number;
    /** 总时长（秒） */
    max: number;
    markers?: VideoMarker[];
    showTooltip?: boolean;
    ariaLabel: string;
    /** 拖拽/点击时持续回调新时间 */
    onChange: (value: number) => void;
  }

  let { value, buffered, max, markers = [], showTooltip = true, ariaLabel, onChange }: Props =
    $props();

  let sliderEl = $state<HTMLDivElement | null>(null);
  let isDragging = $state(false);
  let isHandleHovering = $state(false);
  let activeIndex = $state(-1);
  let movingInfo = $state<{ progress: number; offset: number; value: number } | null>(null);

  const safeMax = $derived(Number.isFinite(max) && max > 0 ? max : 0);
  const safeValue = $derived(Number.isFinite(value) ? value : 0);
  const safeBuffered = $derived(Number.isFinite(buffered) ? buffered : 0);
  // 段列表（对齐 Semi initMarkerList：含 left/width 百分比 + start/end/title）。
  const segments = $derived(buildMarkerSegments(markers, safeMax));

  // 核心定位（对齐 Semi handleMouseEvent）：算 percentage/value，拖拽/mousedown 时 onChange，总更新 movingInfo。
  function handleMouseEvent(e: MouseEvent, shouldSetValue: boolean): void {
    if (!sliderEl || safeMax <= 0) return;
    const r = sliderEl.getBoundingClientRect();
    const { percentage, value: v, offset } = progressValueFromPointer(
      e.clientX,
      { left: r.left, width: r.width },
      safeMax,
    );
    if (shouldSetValue && (isDragging || e.type === 'mousedown')) {
      onChange(v);
    }
    movingInfo = { progress: percentage, offset, value: v };
  }

  function onMouseDown(e: MouseEvent): void {
    isDragging = true;
    handleMouseEvent(e, true);
    document.addEventListener('mousemove', onDocMouseMove);
    document.addEventListener('mouseup', onDocMouseUp);
  }
  function onDocMouseMove(e: MouseEvent): void {
    if (isDragging) handleMouseEvent(e, true);
  }
  function onDocMouseUp(): void {
    isDragging = false;
    document.removeEventListener('mousemove', onDocMouseMove);
    document.removeEventListener('mouseup', onDocMouseUp);
  }
  function onMouseEnter(e: MouseEvent): void {
    handleMouseEvent(e, false); // 仅更新预览
  }
  function onMouseMove(e: MouseEvent): void {
    handleMouseEvent(e, true);
  }
  // marker hover：value 落在段区间时切 handle hover + 记 activeIndex（对齐 Semi）。
  function onSliderMouseEnter(index: number): void {
    isHandleHovering = true;
    activeIndex = index;
  }
  function onSliderMouseLeave(): void {
    isHandleHovering = false;
    activeIndex = -1;
  }

  // 每段的 left/width 百分比（对齐 Semi initMarkerList）。
  function segLeft(seg: { start: number }): string {
    return safeMax > 0 ? `${(seg.start / safeMax) * 100}%` : '0';
  }
  function segWidth(seg: { start: number; end: number }): string {
    return safeMax > 0 ? `${((seg.end - seg.start) / safeMax) * 100}%` : '100%';
  }

  // handle left = calc(pct% - 8px)（对齐 Semi，value||1 避免 0 时贴边）。
  const handlePct = $derived(safeMax > 0 ? ((safeValue || 1) / safeMax) * 100 : 0);

  // Tooltip 内容：有 markers 两行（命中段标题 + 时间），否则仅时间字符串。
  const hoverIndex = $derived(
    movingInfo
      ? segments.findIndex((s) => movingInfo!.value > s.start && movingInfo!.value < s.end)
      : -1,
  );
  const hasMarkerTooltip = $derived(markers.length > 0);
</script>

{#snippet sliderContent()}
  <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
  <div
    bind:this={sliderEl}
    role="slider"
    tabindex="0"
    aria-label={ariaLabel}
    aria-valuemin={0}
    aria-valuemax={Math.round(safeMax)}
    aria-valuenow={Math.round(safeValue)}
    class="cd-videoPlayer-progress"
    onmousedown={onMouseDown}
    onmouseenter={onMouseEnter}
    onmousemove={onMouseMove}
  >
    <div class="cd-videoPlayer-progress-markers">
      {#each segments as seg, i (i)}
        <div
          class="cd-videoPlayer-progress-slider"
          class:cd-videoPlayer-progress-slider-active={i === activeIndex && isDragging}
          style:left={segLeft(seg)}
          style:width={segWidth(seg)}
          onmouseenter={() => onSliderMouseEnter(i)}
          onmouseleave={onSliderMouseLeave}
          role="presentation"
        >
          <div class="cd-videoPlayer-progress-slider-list"></div>
          <div
            class="cd-videoPlayer-progress-slider-buffered"
            style:width={segmentValueWidth(seg, safeBuffered)}
          ></div>
          <div
            class="cd-videoPlayer-progress-slider-played"
            style:width={segmentValueWidth(seg, safeValue)}
          ></div>
        </div>
      {/each}
    </div>
    <div
      class="cd-videoPlayer-progress-handle"
      style:left={`calc(${handlePct}% - 8px)`}
      style:opacity={isHandleHovering || isDragging ? 1 : 0}
    ></div>
  </div>
{/snippet}

{#if showTooltip}
  <Tooltip position="top" style={`left:${movingInfo?.offset ?? 0}px`}>
    {#snippet content()}
      {#if hasMarkerTooltip && movingInfo}
        <div class="cd-videoPlayer-progress-tooltip-content">
          {segments[hoverIndex]?.title ?? ''}
        </div>
        <div class="cd-videoPlayer-progress-tooltip-content">
          {formatTimeDisplay(movingInfo.progress * safeMax)}
        </div>
      {:else if movingInfo}
        {formatTimeDisplay(movingInfo.progress * safeMax)}
      {/if}
    {/snippet}
    {@render sliderContent()}
  </Tooltip>
{:else}
  {@render sliderContent()}
{/if}

<style>
  /* 严格镜像 Semi videoPlayer.scss .semi-videoPlayer-progress。 */
  .cd-videoPlayer-progress {
    position: relative;
    height: var(--cd-height-videoPlayer-progress-bar-hotSpot-default);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    margin: var(--cd-spacing-videoPlayer-progress-bar-wrapper-marginY)
      var(--cd-spacing-videoPlayer-progress-bar-wrapper-marginX);
    outline: none;
  }
  .cd-videoPlayer-progress-markers {
    position: absolute;
    width: 100%;
    height: 100%;
  }
  .cd-videoPlayer-progress-slider {
    position: absolute;
    width: 100%;
    height: 100%;
    left: 0;
    bottom: 0;
    border-radius: var(--cd-radius-videoPlayer-progress-bar);
  }
  /* hover/active：三轨高度 4→10px（对齐 Semi）。 */
  .cd-videoPlayer-progress-slider-active .cd-videoPlayer-progress-slider-list,
  .cd-videoPlayer-progress-slider-active .cd-videoPlayer-progress-slider-played,
  .cd-videoPlayer-progress-slider-active .cd-videoPlayer-progress-slider-buffered,
  .cd-videoPlayer-progress-slider:hover .cd-videoPlayer-progress-slider-list,
  .cd-videoPlayer-progress-slider:hover .cd-videoPlayer-progress-slider-played,
  .cd-videoPlayer-progress-slider:hover .cd-videoPlayer-progress-slider-buffered {
    height: var(--cd-height-videoPlayer-progress-bar-hover);
    transition: transform var(--cd-animation-duration-videoPlayer-slider-in);
    transition-timing-function: var(--cd-animation-function-videoPlayer-slider-in);
  }
  .cd-videoPlayer-progress-slider-list {
    position: absolute;
    bottom: 0;
    left: 0;
    background-color: var(--cd-color-videoPlayer-progress-bar-bg-unplayed);
    height: var(--cd-height-videoPlayer-progress-bar-default);
    width: calc(100% - var(--cd-spacing-videoPlayer-progress-bar-chapter-marginRight));
    margin-right: var(--cd-spacing-videoPlayer-progress-bar-chapter-marginRight);
    border-radius: var(--cd-radius-videoPlayer-progress-bar);
    transition: transform var(--cd-animation-duration-videoPlayer-slider-in);
    transition-timing-function: var(--cd-animation-function-videoPlayer-slider-out);
  }
  .cd-videoPlayer-progress-slider-played {
    position: absolute;
    bottom: 0;
    left: 0;
    background-color: var(--cd-color-videoPlayer-progress-bar-bg-played);
    height: var(--cd-height-videoPlayer-progress-bar-default);
    border-radius: var(--cd-radius-videoPlayer-progress-bar);
    transition: transform var(--cd-animation-duration-videoPlayer-slider-in);
    transition-timing-function: var(--cd-animation-function-videoPlayer-slider-out);
  }
  .cd-videoPlayer-progress-slider-buffered {
    position: absolute;
    bottom: 0;
    left: 0;
    background-color: var(--cd-color-videoPlayer-progress-bar-bg-loaded);
    height: var(--cd-height-videoPlayer-progress-bar-default);
    border-radius: var(--cd-radius-videoPlayer-progress-bar);
    transition: transform var(--cd-animation-duration-videoPlayer-slider-in);
    transition-timing-function: var(--cd-animation-function-videoPlayer-slider-out);
  }
  .cd-videoPlayer-progress-handle {
    box-sizing: border-box;
    position: absolute;
    width: var(--cd-height-videoPlayer-progress-bar-handle);
    height: var(--cd-height-videoPlayer-progress-bar-handle);
    background-color: var(--cd-color-videoPlayer-progress-bar-handle-bg);
    border: 1px solid var(--cd-color-videoPlayer-progress-bar-handle-border);
    box-shadow: 0px 0px 4px 0px var(--cd-color-videoPlayer-progress-bar-handle-shadow);
    border-radius: var(--cd-radius-videoPlayer-progress-bar-handle);
    top: var(--cd-spacing-videoPlayer-progress-bar-handle-top);
    transform: translateY(-50%);
    transition: opacity 0.3s;
    pointer-events: none;
  }
  .cd-videoPlayer-progress-tooltip-content {
    display: flex;
    align-items: center;
    justify-content: center;
  }
</style>
