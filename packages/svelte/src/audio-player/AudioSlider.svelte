<!--
  AudioSlider — AudioPlayer 自建滑块（严格镜像 Semi audioSlider.tsx，不复用通用 Slider）。
  支持横向(进度)/纵向(音量)，hover 轨道变粗 4→8px、拖拽圆点 hover 显现、可选 Tooltip 时间预览。
  交互：mousedown 即定位(点击 seek)，move 仅 dragging 中写值(拖拽)，enter 仅更新预览不写值。
  纯自建 DOM + 鼠标事件，onChange 回调透传给父。类名前缀 cd-audio-player。
-->
<script lang="ts">
  import Tooltip from '../tooltip/Tooltip.svelte';

  interface Props {
    value: number;
    onChange?: (value: number) => void;
    class?: string;
    max?: number;
    vertical?: boolean;
    /** 横向宽度（px 或 CSS 值，如 "100%"）；纵向忽略。 */
    width?: number | string;
    /** 纵向高度（px）；横向忽略。 */
    height?: number;
    showTooltip?: boolean;
    disabled?: boolean;
    theme?: 'dark' | 'light';
    /** 无障碍名（role=slider 的 accessible name）。 */
    ariaLabel?: string;
  }

  let {
    value = 0,
    onChange = () => {},
    class: className,
    max = 100,
    vertical = false,
    width = '100%',
    height = 4,
    showTooltip = true,
    disabled = false,
    theme = 'dark',
    ariaLabel,
  }: Props = $props();

  let sliderEl = $state<HTMLDivElement | null>(null);
  let isDragging = $state(false);
  let isHovering = $state(false);
  let movingInfo = $state<{ progress: number; offset: number } | null>(null);

  // 核心：算出百分比与值，按条件写回（对齐 Semi handleMouseEvent）。
  function handleMouseEvent(e: MouseEvent, shouldSetValue = true): void {
    if (!sliderEl || disabled) return;
    const rect = sliderEl.getBoundingClientRect();
    const offset = vertical ? rect.bottom - e.clientY : e.clientX - rect.left;
    const total = vertical ? rect.height : rect.width;
    const percentage = Math.min(Math.max(offset / total, 0), 1);
    const nextValue = percentage * max;
    // mousedown 即定位；move 仅 dragging 中写值（对齐 Semi shouldSetValue 条件）。
    if (shouldSetValue && (isDragging || e.type === 'mousedown')) {
      onChange(nextValue);
    }
    movingInfo = {
      progress: percentage,
      offset: vertical ? offset - rect.height / 2 : offset - rect.width / 2,
    };
  }

  function onMouseDown(e: MouseEvent): void {
    isDragging = true;
    handleMouseEvent(e, true);
  }
  function onMouseUp(): void {
    if (isDragging) isDragging = false;
  }
  function onMouseEnter(e: MouseEvent): void {
    isHovering = true;
    handleMouseEvent(e, false); // 仅更新预览，不写值
  }
  function onMouseMove(e: MouseEvent): void {
    handleMouseEvent(e, true); // 拖拽中才生效
  }
  function onMouseLeave(): void {
    isHovering = false;
    isDragging = false;
  }

  const percent = $derived(max > 0 ? (value / max) * 100 : 0);

  // 秒 → m:ss（对齐 Semi utils.formatTime，无小时/NaN 保护——严格照搬）。
  function formatTime(time: number): string {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  // Tooltip 预览内容（movingInfo 为 null 时 undefined*max=NaN → 显示 NaN:NaN，严格照搬 Semi 缺陷）。
  const tooltipContent = $derived(formatTime((movingInfo?.progress as number) * max));
  // 轨道厚度：hover 时 4→8px（对齐 Semi）。
  const sliderStyle = $derived(
    vertical
      ? `width:${isHovering ? 8 : 4}px;height:${height}px`
      : `width:${typeof width === 'number' ? width + 'px' : width};height:${isHovering ? 8 : 4}px`,
  );
  const progressStyle = $derived(
    vertical ? `height:${percent}%;width:100%` : `width:${percent}%;height:100%`,
  );
  const dotStyle = $derived(
    vertical
      ? `left:50%;bottom:calc(${percent}% - 8px);transform:translateX(-50%);opacity:${isHovering ? 1 : 0}`
      : `left:calc(${percent}% - 8px);top:50%;transform:translateY(-50%);opacity:${isHovering ? 1 : 0}`,
  );
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
{#snippet sliderContent()}
  <div
    role="slider"
    tabindex="-1"
    aria-valuemin={0}
    aria-valuemax={max}
    aria-valuenow={value}
    aria-orientation={vertical ? 'vertical' : 'horizontal'}
    aria-label={ariaLabel}
    class={[
      'cd-audio-player-slider-wrapper',
      vertical ? 'cd-audio-player-slider-wrapper-vertical' : 'cd-audio-player-slider-wrapper-horizontal',
    ].join(' ')}
    onmousedown={onMouseDown}
    onmouseup={onMouseUp}
    onmouseenter={onMouseEnter}
    onmouseleave={onMouseLeave}
    onmousemove={onMouseMove}
  >
    <div
      bind:this={sliderEl}
      class={[
        'cd-audio-player-slider',
        `cd-audio-player-slider-${theme}`,
        vertical ? 'cd-audio-player-slider-vertical' : 'cd-audio-player-slider-horizontal',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={sliderStyle}
    >
      <div
        class={[
          'cd-audio-player-slider-progress',
          vertical
            ? 'cd-audio-player-slider-progress-vertical'
            : 'cd-audio-player-slider-progress-horizontal',
        ].join(' ')}
        style={progressStyle}
      ></div>
      <div class="cd-audio-player-slider-dot" style={dotStyle}></div>
    </div>
  </div>
{/snippet}

{#if showTooltip}
  <Tooltip position={vertical ? 'right' : 'top'} content={tooltipContent}>
    {@render sliderContent()}
  </Tooltip>
{:else}
  {@render sliderContent()}
{/if}
