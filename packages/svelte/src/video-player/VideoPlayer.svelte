<!--
  VideoPlayer — 基于原生 <video> 的视频播放器，严格对齐 Semi VideoPlayer（无第三方媒体库）。
  DOM 镜像 Semi：div.cd-videoPlayer.-mirror? > div.-wrapper.-wrapper-{theme}(video + resource-not-found)
  + poster(img) + pause(中央 IconPlayCircle) + error(ErrorSvg) + notification
  + div.-controls.-controls-hide?(VideoProgress + div.-menu(-menu-left: play/next/time/volume/rate
  + -menu-right: quality/route/mirror/fullscreen/pip))。
  复用 Button/Popover/Dropdown/AudioSlider/Tooltip + 11 具名图标。headless 逻辑在
  @chenzy-design/core createVideoPlayerFoundation（对齐 Semi foundation + progressFoundation）。

  ⚠️ 照搬 Semi 缺陷（用户决策）：clickToPlay 死 prop（声明未用，onClick 无条件 handlePlayOrPause）、
  next 控件语义（绑 play/pause 非下一集）、硬编码色（token 层照搬）、音量键盘调节不实现。
  ✅ 不复刻 Semi keydown 泄漏 bug：本库 add/removeEventListener 绑同一函数引用（Semi 传不同箭头函数致 remove 无效）。
-->
<script lang="ts">
  import { untrack } from 'svelte';
  import {
    createVideoPlayerFoundation,
    DEFAULT_CONTROLS_LIST,
    DEFAULT_PLAYBACK_RATE_LIST,
    formatTimeDisplay,
    type VideoPlayerAdapter,
    type VideoPlayerLocale,
    type PlaybackRateOption,
    type LabeledOption,
    type VideoMarker,
  } from '@chenzy-design/core';
  import {
    IconPlay,
    IconPause,
    IconRestart,
    IconVolume1,
    IconVolume2,
    IconMute,
    IconFlipHorizontal,
    IconMaximize,
    IconMinimize,
    IconMiniPlayer,
    IconPlayCircle,
  } from '@chenzy-design/icons';
  import { useLocale } from '../locale-provider/index.js';
  import Button from '../button/Button.svelte';
  import Popover from '../popover/Popover.svelte';
  import Dropdown from '../dropdown/Dropdown.svelte';
  import DropdownMenu from '../dropdown/DropdownMenu.svelte';
  import DropdownItem from '../dropdown/DropdownItem.svelte';
  import AudioSlider from '../audio-player/AudioSlider.svelte';
  import VideoProgress from './VideoProgress.svelte';
  import ErrorSvg from './ErrorSvg.svelte';

  type Theme = 'dark' | 'light';

  interface Props {
    src?: string;
    poster?: string;
    captionsSrc?: string;
    width?: number | string;
    height?: number | string;
    autoPlay?: boolean;
    loop?: boolean;
    muted?: boolean;
    /** 点击视频面切换播放。**死 prop**（照搬 Semi：声明但未消费，onClick 无条件切换）。 */
    clickToPlay?: boolean;
    /** 初始音量 0–100 */
    volume?: number;
    /** ←/→ 键快进快退秒数 */
    seekTime?: number;
    /** 展示哪些控件项（对齐 Semi controlsList 10 项） */
    controlsList?: string[];
    playbackRateList?: PlaybackRateOption[];
    defaultPlaybackRate?: number;
    qualityList?: LabeledOption[];
    defaultQuality?: string;
    routeList?: LabeledOption[];
    defaultRoute?: string;
    markers?: VideoMarker[];
    theme?: Theme;
    crossOrigin?: 'anonymous' | 'use-credentials';
    class?: string;
    style?: string;
    /** 绑定的原生 <video> 元素 ref（对齐 Semi forwardRef/ref） */
    videoRef?: HTMLVideoElement | null;
    onPlay?: () => void;
    onPause?: () => void;
    onVolumeChange?: (volume: number) => void;
    onRateChange?: (rate: number) => void;
    onQualityChange?: (quality: string) => void;
    onRouteChange?: (route: string) => void;
  }

  let {
    src,
    poster,
    captionsSrc,
    width,
    height,
    autoPlay = false,
    loop = false,
    muted: mutedProp = false,
    clickToPlay = true,
    volume: volumeProp = 100,
    seekTime = 10,
    controlsList = DEFAULT_CONTROLS_LIST,
    playbackRateList = DEFAULT_PLAYBACK_RATE_LIST,
    defaultPlaybackRate = 1,
    qualityList,
    defaultQuality,
    routeList,
    defaultRoute,
    markers = [],
    theme = 'dark',
    crossOrigin,
    class: className = '',
    style = '',
    videoRef = $bindable(null),
    onPlay,
    onPause,
    onVolumeChange,
    onRateChange,
    onQualityChange,
    onRouteChange,
  }: Props = $props();

  const loc = useLocale();

  // --- reactive state（foundation 经 adapter 写入）---
  let videoNode = $state<HTMLVideoElement | null>(null);
  let wrapperNode = $state<HTMLElement | null>(null);

  let isPlaying = $state(false);
  let muted = $state(untrack(() => mutedProp));
  let volume = $state(untrack(() => (mutedProp ? 0 : volumeProp))); // 0–100
  let currentTime = $state(0);
  let totalTime = $state(0);
  let bufferedValue = $state(0);
  let isMirror = $state(false);
  let isError = $state(false);
  let showControls = $state(true);
  let showNotification = $state(false);
  let notificationContent = $state('');
  let playbackRate = $state(untrack(() => defaultPlaybackRate));
  let quality = $state<string | undefined>(untrack(() => defaultQuality));
  let route = $state<string | undefined>(untrack(() => defaultRoute));
  let isFullscreen = $state(false);

  const notiLocale = $derived<VideoPlayerLocale>({
    loading: loc().t('VideoPlayer.loading'),
    stall: loc().t('VideoPlayer.stall'),
    mirror: loc().t('VideoPlayer.mirror'),
    cancelMirror: loc().t('VideoPlayer.cancelMirror'),
    rateChange: loc().t('VideoPlayer.rateChange', { rate: '${rate}' }),
    qualityChange: loc().t('VideoPlayer.qualityChange', { quality: '${quality}' }),
    routeChange: loc().t('VideoPlayer.routeChange', { route: '${route}' }),
  });

  const adapter: VideoPlayerAdapter = {
    getVideo: () => videoNode,
    getVideoWrapper: () => wrapperNode,
    notifyPlay: () => onPlay?.(),
    notifyPause: () => onPause?.(),
    notifyQualityChange: (q) => onQualityChange?.(q),
    notifyRateChange: (r) => onRateChange?.(r),
    notifyRouteChange: (r) => onRouteChange?.(r),
    notifyVolumeChange: (v) => onVolumeChange?.(v),
    setBufferedValue: (v) => (bufferedValue = v),
    setCurrentTime: (v) => (currentTime = v),
    setIsError: (v) => (isError = v),
    setIsMirror: (v) => (isMirror = v),
    setIsPlaying: (v) => (isPlaying = v),
    setMuted: (v) => (muted = v),
    setNotificationContent: (v) => (notificationContent = v),
    setPlaybackRate: (v) => (playbackRate = v),
    setQuality: (v) => (quality = v),
    setRoute: (v) => (route = v),
    setShowControls: (v) => (showControls = v),
    setShowNotification: (v) => (showNotification = v),
    setTotalTime: (v) => (totalTime = v),
    setVolume: (v) => (volume = v),
  };

  const foundation = createVideoPlayerFoundation({
    adapter,
    getState: () => ({ isPlaying, muted, volume, currentTime, isMirror }),
    getProps: () => ({ volume: volumeProp, muted: mutedProp, seekTime, controlsList }),
  });

  // --- 派生 UI ---
  const show = (name: string): boolean => controlsList.includes(name);
  const isResourceNotFound = $derived(src == null);
  const currentRateLabel = $derived(
    playbackRateList.find((r) => r.value === playbackRate)?.label ?? `${playbackRate}x`,
  );
  const currentQualityLabel = $derived(
    qualityList?.find((q) => q.value === quality)?.label ?? quality ?? '',
  );
  const currentRouteLabel = $derived(routeList?.find((r) => r.value === route)?.label ?? route ?? '');
  // poster 隐藏：播放中途（currentTime>0 且 <totalTime）淡出（对齐 Semi renderPoster）。
  const posterHide = $derived(currentTime > 0 && currentTime < totalTime);
  // 音量图标三态（对齐 Semi getVolumeIcon：muted→Mute、<50→Volume1、否则 Volume2）。
  const volumeDisplay = $derived(muted ? 0 : volume);

  const wrapperStyle = $derived(
    [
      width != null ? `width:${typeof width === 'number' ? `${width}px` : width}` : '',
      height != null ? `height:${typeof height === 'number' ? `${height}px` : height}` : '',
      style,
    ]
      .filter(Boolean)
      .join(';'),
  );

  // 注册原生媒体事件 + document keydown/fullscreenchange。cleanup 全注销（绑同一引用，不复刻 Semi 泄漏 bug）。
  $effect(() => {
    const video = videoNode;
    if (!video) return;
    videoRef = video;
    foundation.init();

    const onKeyDown = (e: KeyboardEvent): void => foundation.handleBodyKeyDown(e);
    const onFsChange = (): void => {
      foundation.handleFullscreenChange();
      isFullscreen = foundation.checkFullScreen();
    };
    const onWaiting = (): void => foundation.handleWaiting(untrack(() => notiLocale));
    const onStalled = (): void => foundation.handleStalled(untrack(() => notiLocale));
    const onLeavePip = (): void => foundation.handleLeavePictureInPicture();

    video.addEventListener('play', foundation.handleVideoPlay);
    video.addEventListener('pause', foundation.handleVideoPause);
    video.addEventListener('timeupdate', foundation.handleTimeUpdate);
    video.addEventListener('durationchange', foundation.handleDurationChange);
    video.addEventListener('progress', foundation.handleProgress);
    video.addEventListener('ended', foundation.handleEnded);
    video.addEventListener('error', foundation.handleError);
    video.addEventListener('canplay', foundation.handleCanPlay);
    video.addEventListener('waiting', onWaiting);
    video.addEventListener('stalled', onStalled);
    video.addEventListener('leavepictureinpicture', onLeavePip);
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('fullscreenchange', onFsChange);

    return () => {
      video.removeEventListener('play', foundation.handleVideoPlay);
      video.removeEventListener('pause', foundation.handleVideoPause);
      video.removeEventListener('timeupdate', foundation.handleTimeUpdate);
      video.removeEventListener('durationchange', foundation.handleDurationChange);
      video.removeEventListener('progress', foundation.handleProgress);
      video.removeEventListener('ended', foundation.handleEnded);
      video.removeEventListener('error', foundation.handleError);
      video.removeEventListener('canplay', foundation.handleCanPlay);
      video.removeEventListener('waiting', onWaiting);
      video.removeEventListener('stalled', onStalled);
      video.removeEventListener('leavepictureinpicture', onLeavePip);
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('fullscreenchange', onFsChange);
      foundation.destroy();
    };
  });

  // --- 控制回调 ---
  function onSurfaceClick(): void {
    // 照搬 Semi：无条件 handlePlayOrPause（clickToPlay 为死 prop）。
    foundation.handlePlayOrPause();
  }
  function onTogglePlay(): void {
    foundation.handlePlayOrPause();
  }
  function onToggleMute(): void {
    foundation.handleVolumeSilent();
  }
  function onVolume(v: number): void {
    foundation.handleVolumeChange(v);
  }
  function onSeek(v: number): void {
    foundation.handleTimeChange(v);
  }
  function onFullscreen(): void {
    foundation.handleFullscreen();
  }
  function onMirror(): void {
    foundation.handleMirror(untrack(() => notiLocale));
  }
  function onPip(): void {
    foundation.handlePictureInPicture();
  }
  function onSelectRate(o: PlaybackRateOption): void {
    foundation.handleRateChange(o, untrack(() => notiLocale));
  }
  function onSelectQuality(o: LabeledOption): void {
    foundation.handleQualityChange(o, untrack(() => notiLocale));
  }
  function onSelectRoute(o: LabeledOption): void {
    foundation.handleRouteChange(o, untrack(() => notiLocale));
  }
  function onWrapperEnter(): void {
    foundation.handleMouseEnterWrapper();
  }
  function onWrapperLeave(): void {
    foundation.handleMouseLeaveWrapper();
  }
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  bind:this={wrapperNode}
  class={['cd-videoPlayer', isMirror && 'cd-videoPlayer-mirror', className].filter(Boolean).join(' ')}
  style={wrapperStyle || undefined}
  onmouseenter={onWrapperEnter}
  onmouseleave={onWrapperLeave}
>
  <div class={['cd-videoPlayer-wrapper', `cd-videoPlayer-wrapper-${theme}`].join(' ')}>
    <!-- svelte-ignore a11y_media_has_caption -->
    <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
    <video
      bind:this={videoNode}
      {src}
      {poster}
      {loop}
      autoplay={autoPlay}
      muted={mutedProp}
      crossorigin={crossOrigin}
      controls={false}
      playsinline
      onclick={onSurfaceClick}
    >
      {#if captionsSrc}<track kind="captions" src={captionsSrc} />{/if}
    </video>
    {#if isResourceNotFound}
      <div class="cd-videoPlayer-resource-not-found">{loc().t('VideoPlayer.noResource')}</div>
    {/if}
  </div>

  <!-- poster：未播放且有 poster 时覆盖 -->
  {#if !isPlaying && poster}
    <img
      class={['cd-videoPlayer-poster', posterHide && 'cd-videoPlayer-poster-hide']
        .filter(Boolean)
        .join(' ')}
      src={poster}
      alt="poster"
    />
  {/if}

  <!-- 中央播放按钮（未播放且无错误）-->
  {#if !isPlaying && !isError}
    <div class="cd-videoPlayer-pause"><IconPlayCircle /></div>
  {/if}

  <!-- 错误态（ErrorSvg 插画 + 文案）-->
  {#if isError}
    <div class={['cd-videoPlayer-error', `cd-videoPlayer-error-${theme}`].join(' ')} role="alert">
      <div class="cd-videoPlayer-error-svg"><ErrorSvg /></div>
      {loc().t('VideoPlayer.videoError')}
    </div>
  {/if}

  <!-- notification（loading/stall/临时提示）-->
  {#if showNotification && notificationContent}
    <div class="cd-videoPlayer-notification" aria-live="polite">{notificationContent}</div>
  {/if}

  <!-- 控制栏 -->
  <div class={['cd-videoPlayer-controls', !showControls && 'cd-videoPlayer-controls-hide']
      .filter(Boolean)
      .join(' ')}>
    <VideoProgress
      value={currentTime}
      buffered={bufferedValue}
      max={totalTime}
      {markers}
      ariaLabel={loc().t('VideoPlayer.progress')}
      onChange={onSeek}
    />
    <div class="cd-videoPlayer-controls-menu">
      <div class="cd-videoPlayer-controls-menu-left">
        {#if show('play')}
          <Button
            theme="borderless"
            class="cd-videoPlayer-controls-menu-item cd-videoPlayer-controls-menu-button"
            ariaLabel={isPlaying ? loc().t('VideoPlayer.pause') : loc().t('VideoPlayer.play')}
            onclick={onTogglePlay}
          >
            {#snippet icon()}{#if isPlaying}<IconPause />{:else}<IconPlay />{/if}{/snippet}
          </Button>
        {/if}

        {#if show('next')}
          <!-- next 控件：照搬 Semi 语义（绑 play/pause 非下一集，图标 IconRestart rotate=180）-->
          <Button
            theme="borderless"
            class="cd-videoPlayer-controls-menu-item cd-videoPlayer-controls-menu-button"
            ariaLabel={isPlaying ? loc().t('VideoPlayer.pause') : loc().t('VideoPlayer.play')}
            onclick={onTogglePlay}
          >
            {#snippet icon()}<IconRestart rotate={180} />{/snippet}
          </Button>
        {/if}

        {#if show('time')}
          <div class="cd-videoPlayer-controls-time">
            {formatTimeDisplay(currentTime)} / {formatTimeDisplay(totalTime)}
          </div>
        {/if}

        {#if show('volume')}
          <Popover position="top" class="cd-videoPlayer-controls-popover">
            {#snippet content()}
              <div class="cd-videoPlayer-controls-volume">
                <div class="cd-videoPlayer-controls-volume-title">{volumeDisplay}%</div>
                <AudioSlider
                  value={volumeDisplay}
                  max={100}
                  vertical
                  height={120}
                  showTooltip={false}
                  ariaLabel={loc().t('VideoPlayer.volume')}
                  onChange={onVolume}
                />
              </div>
            {/snippet}
            <Button
              theme="borderless"
              class="cd-videoPlayer-controls-menu-item cd-videoPlayer-controls-menu-button"
              ariaLabel={muted ? loc().t('VideoPlayer.unmute') : loc().t('VideoPlayer.mute')}
              onclick={onToggleMute}
            >
              {#snippet icon()}
                {#if muted}<IconMute />{:else if volume < 50}<IconVolume1 />{:else}<IconVolume2
                  />{/if}
              {/snippet}
            </Button>
          </Popover>
        {/if}

        {#if show('playbackRate')}
          <Dropdown position="top" className="cd-videoPlayer-controls-popup-menu">
            {#snippet render()}
              <DropdownMenu>
                {#each playbackRateList as opt (opt.value)}
                  <DropdownItem
                    class="cd-videoPlayer-controls-popup-menu-item"
                    active={opt.value === playbackRate}
                    onClick={() => onSelectRate(opt)}
                  >
                    {opt.label}
                  </DropdownItem>
                {/each}
              </DropdownMenu>
            {/snippet}
            <div class="cd-videoPlayer-controls-menu-item cd-videoPlayer-controls-popup" role="button" tabindex="0">
              {currentRateLabel}
            </div>
          </Dropdown>
        {/if}
      </div>

      <div class="cd-videoPlayer-controls-menu-right">
        {#if show('quality') && qualityList && qualityList.length > 0}
          <Dropdown position="top" className="cd-videoPlayer-controls-popup-menu">
            {#snippet render()}
              <DropdownMenu>
                {#each qualityList as opt (opt.value)}
                  <DropdownItem
                    class="cd-videoPlayer-controls-popup-menu-item"
                    active={opt.value === quality}
                    onClick={() => onSelectQuality(opt)}
                  >
                    {opt.label}
                  </DropdownItem>
                {/each}
              </DropdownMenu>
            {/snippet}
            <div class="cd-videoPlayer-controls-menu-item cd-videoPlayer-controls-popup" role="button" tabindex="0">
              {currentQualityLabel}
            </div>
          </Dropdown>
        {/if}

        {#if show('route') && routeList && routeList.length > 0}
          <Dropdown position="top" className="cd-videoPlayer-controls-popup-menu">
            {#snippet render()}
              <DropdownMenu>
                {#each routeList as opt (opt.value)}
                  <DropdownItem
                    class="cd-videoPlayer-controls-popup-menu-item"
                    active={opt.value === route}
                    onClick={() => onSelectRoute(opt)}
                  >
                    {opt.label}
                  </DropdownItem>
                {/each}
              </DropdownMenu>
            {/snippet}
            <div class="cd-videoPlayer-controls-menu-item cd-videoPlayer-controls-popup" role="button" tabindex="0">
              {currentRouteLabel}
            </div>
          </Dropdown>
        {/if}

        {#if show('mirror')}
          <Button
            theme="borderless"
            class="cd-videoPlayer-controls-menu-item cd-videoPlayer-controls-menu-button"
            ariaLabel={loc().t('VideoPlayer.mirror')}
            aria-pressed={isMirror}
            onclick={onMirror}
          >
            {#snippet icon()}<IconFlipHorizontal />{/snippet}
          </Button>
        {/if}

        {#if show('fullscreen')}
          <Button
            theme="borderless"
            class="cd-videoPlayer-controls-menu-item cd-videoPlayer-controls-menu-button"
            ariaLabel={isFullscreen
              ? loc().t('VideoPlayer.exitFullscreen')
              : loc().t('VideoPlayer.fullscreen')}
            aria-pressed={isFullscreen}
            onclick={onFullscreen}
          >
            {#snippet icon()}{#if isFullscreen}<IconMinimize />{:else}<IconMaximize />{/if}{/snippet}
          </Button>
        {/if}

        {#if show('pictureInPicture')}
          <Button
            theme="borderless"
            class="cd-videoPlayer-controls-menu-item cd-videoPlayer-controls-menu-button"
            ariaLabel={loc().t('VideoPlayer.pictureInPicture')}
            onclick={onPip}
          >
            {#snippet icon()}<IconMiniPlayer />{/snippet}
          </Button>
        {/if}
      </div>
    </div>
  </div>
</div>

<style>
  /* 严格镜像 Semi videoPlayer.scss。 */
  .cd-videoPlayer {
    position: relative;
    display: inline-block;
    max-width: 100%;
  }
  .cd-videoPlayer :global(::-webkit-media-controls) {
    display: none;
  }
  .cd-videoPlayer-wrapper {
    width: 100%;
    height: 100%;
    position: relative;
    line-height: 0;
  }
  .cd-videoPlayer-wrapper :global(video) {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
  .cd-videoPlayer-wrapper-dark {
    background-color: var(--cd-color-videoPlayer-theme-dark-bg);
    color: var(--cd-color-videoPlayer-theme-dark-text);
  }
  .cd-videoPlayer-wrapper-light {
    background-color: var(--cd-color-videoPlayer-theme-light-bg);
    color: var(--cd-color-videoPlayer-theme-light-text);
  }

  /* 镜像：video 水平翻转（对齐 Semi rotateY(180deg)）。 */
  .cd-videoPlayer-mirror :global(video) {
    transform: rotateX(0deg) rotateY(180deg);
  }

  .cd-videoPlayer-pause {
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
  }
  .cd-videoPlayer-pause :global(svg) {
    font-size: 88px;
    width: 88px;
    height: 88px;
    color: var(--cd-color-videoPlayer-pause-bg);
    pointer-events: none;
  }

  .cd-videoPlayer-error {
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    font-weight: var(--cd-font-videoPlayer-error-fontWeight);
    font-size: var(--cd-font-videoPlayer-error-fontSize);
  }
  .cd-videoPlayer-error-svg {
    margin-bottom: var(--cd-spacing-videoPlayer-error-svg-marginBottom);
  }
  .cd-videoPlayer-error-dark {
    background-color: var(--cd-color-videoPlayer-theme-dark-bg);
    color: var(--cd-color-videoPlayer-theme-dark-text);
  }
  .cd-videoPlayer-error-dark :global(path) {
    fill: var(--cd-color-videoPlayer-theme-dark-text);
  }
  .cd-videoPlayer-error-light {
    background-color: var(--cd-color-videoPlayer-theme-light-bg);
    color: var(--cd-color-videoPlayer-theme-light-text);
  }
  .cd-videoPlayer-error-light :global(path) {
    fill: var(--cd-color-videoPlayer-theme-light-text);
  }

  .cd-videoPlayer-poster {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    object-fit: contain;
  }
  .cd-videoPlayer-poster-hide {
    opacity: 0;
  }

  .cd-videoPlayer-resource-not-found {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .cd-videoPlayer-notification {
    position: absolute;
    bottom: calc(
      var(--cd-height-videoPlayer-controls-menu-default) +
        var(--cd-spacing-videoPlayer-notification-bottom)
    );
    left: var(--cd-spacing-videoPlayer-notification-left);
    text-align: center;
    background-color: var(--cd-color-videoPlayer-notification-bg);
    color: var(--cd-color-videoPlayer-notification-text);
    padding: var(--cd-spacing-videoPlayer-notification-text-paddingY)
      var(--cd-spacing-videoPlayer-notification-text-paddingX);
    line-height: var(--cd-font-videoPlayer-notification-lineHeight);
    border-radius: var(--cd-radius-videoPlayer-notification);
    font-size: var(--cd-font-videoPlayer-notification-fontSize);
  }

  .cd-videoPlayer-controls {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: fit-content;
    opacity: 1;
    transition: opacity var(--cd-animation-duration-videoPlayer-controls-show) ease-in-out;
    z-index: 1;
  }
  .cd-videoPlayer-controls-hide {
    opacity: 0;
  }
  .cd-videoPlayer-controls-menu {
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-sizing: border-box;
    height: var(--cd-height-videoPlayer-controls-menu-default);
    background-color: var(--cd-color-videoPlayer-controls-bg);
    padding: var(--cd-spacing-videoPlayer-controls-paddingY)
      var(--cd-spacing-videoPlayer-controls-paddingX);
  }
  .cd-videoPlayer-controls-menu-left,
  .cd-videoPlayer-controls-menu-right {
    display: flex;
    align-items: center;
  }
  .cd-videoPlayer :global(.cd-videoPlayer-controls-menu-item) {
    margin-right: var(--cd-spacing-videoPlayer-controls-item-gap);
  }
  .cd-videoPlayer :global(.cd-videoPlayer-controls-menu-button svg) {
    color: var(--cd-color-videoPlayer-controls-text);
  }

  .cd-videoPlayer-controls-time {
    color: var(--cd-color-videoPlayer-controls-text);
    font-size: var(--cd-font-videoPlayer-controls-time-text-fontSize);
    margin-right: var(--cd-spacing-videoPlayer-controls-item-gap);
    padding: 0 var(--cd-spacing-videoPlayer-controls-time-paddingX);
    font-variant-numeric: tabular-nums;
  }

  /* 倍速/清晰度/线路触发块（对齐 Semi -controls-popup）。 */
  .cd-videoPlayer-controls-popup {
    display: flex;
    align-items: center;
    justify-content: center;
    width: var(--cd-width-videoPlayer-controls-popup-item-default);
    height: var(--cd-height-videoPlayer-controls-popup-default);
    background-color: var(--cd-color-videoPlayer-controls-item-popup-bg-default);
    color: var(--cd-color-videoPlayer-controls-text);
    font-weight: var(--cd-font-videoPlayer-controls-popup-item-fontWeight);
    font-size: var(--cd-font-videoPlayer-controls-item-fontSize);
    line-height: var(--cd-font-videoPlayer-controls-popup-item-lineHeight);
    border-radius: var(--cd-radius-videoPlayer-controls-item);
    cursor: pointer;
  }

  /* 音量弹层（Popover content 内）。 */
  .cd-videoPlayer-controls-volume {
    box-sizing: border-box;
    width: var(--cd-width-videoPlayer-controls-volume-default);
    height: var(--cd-height-videoPlayer-controls-volume-default);
    background-color: var(--cd-color-videoPlayer-controls-item-bg);
    color: var(--cd-color-videoPlayer-controls-popup-item-text-default);
    border-radius: var(--cd-radius-videoPlayer-controls-popup);
    padding: var(--cd-spacing-videoPlayer-controls-volume-popup-paddingY)
      var(--cd-spacing-videoPlayer-controls-volume-popup-paddingX);
    line-height: var(--cd-font-videoPlayer-controls-popup-item-lineHeight);
    font-size: var(--cd-font-videoPlayer-controls-item-fontSize);
    user-select: none;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .cd-videoPlayer-controls-volume-title {
    padding: var(--cd-spacing-videoPlayer-controls-volume-title-paddingX)
      var(--cd-spacing-videoPlayer-controls-volume-title-paddingY);
    text-align: center;
  }

  /* 弹层菜单（Dropdown className）+ 项 hover/active。 */
  :global(.cd-videoPlayer-controls-popup-menu) {
    width: var(--cd-width-videoPlayer-controls-popup-default);
    background-color: var(--cd-color-videoPlayer-controls-item-popup-bg-default);
    border-radius: var(--cd-radius-videoPlayer-controls-popup);
  }
  :global(.cd-videoPlayer-controls-popup-menu-item) {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--cd-spacing-videoPlayer-controls-popup-paddingY)
      var(--cd-spacing-videoPlayer-controls-popup-paddingX);
    height: var(--cd-height-videoPlayer-controls-popup-item-default);
    color: var(--cd-color-videoPlayer-controls-text);
    font-size: var(--cd-font-videoPlayer-controls-item-fontSize);
  }
  :global(.cd-videoPlayer-controls-popup-menu-item:hover) {
    background-color: var(--cd-color-videoPlayer-controls-item-popup-bg-hover) !important;
  }

  /* Popover 容器透明（对齐 Semi -controls-popover）。 */
  :global(.cd-videoPlayer-controls-popover) {
    background-color: transparent;
  }
</style>
