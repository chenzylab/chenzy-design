<!--
  VideoPlayer — native <video> player, ported from Semi Design's VideoPlayer.
  No third-party media library (plyr/video.js/hls) — pure <video> + the
  framework-agnostic createVideoPlayerFoundation from @chenzy-design/core.

  State (isPlaying / volume / muted / time / buffered / notification / …) lives
  here as $state; the foundation mutates it through an adapter and reads it back
  through getState/getProps. Native media events + document keydown /
  fullscreenchange are registered in a single $effect that runs once the <video>
  is bound, and torn down (with foundation.destroy clearing timers) on cleanup.

  controlsList gates which control items render (Semi shouldShowControlItem).
  theme only switches the container background (Semi semantics). Every color /
  size is a Component Token; no hard-coded palette. Class prefix cd-.
  See specs Semi videoPlayer.foundation.js + VideoPlayer API.
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
  import { useLocale } from '../locale-provider/index.js';
  import VideoProgress from './VideoProgress.svelte';
  import VolumeControl from './VolumeControl.svelte';
  import ControlMenu from './ControlMenu.svelte';

  type Theme = 'dark' | 'light';

  interface Props {
    /** video source url */
    src?: string;
    /** poster image url */
    poster?: string;
    /** captions/subtitles track url */
    captionsSrc?: string;
    /** container width; number → px */
    width?: number | string;
    /** container height; number → px */
    height?: number | string;
    autoPlay?: boolean;
    loop?: boolean;
    muted?: boolean;
    /** click the video surface to toggle play (default true) */
    clickToPlay?: boolean;
    /** initial volume 0–100 */
    volume?: number;
    /** seek step (seconds) for ←/→ keys */
    seekTime?: number;
    /** which control items to show, in order */
    controlsList?: string[];
    /** playback-rate menu options */
    playbackRateList?: PlaybackRateOption[];
    /** initial playback rate */
    defaultPlaybackRate?: number;
    /** quality menu options */
    qualityList?: LabeledOption[];
    /** initial quality */
    defaultQuality?: string;
    /** route menu options */
    routeList?: LabeledOption[];
    /** initial route */
    defaultRoute?: string;
    /** chapter markers */
    markers?: VideoMarker[];
    /** background theme (affects container bg only) */
    theme?: Theme;
    crossOrigin?: 'anonymous' | 'use-credentials';
    class?: string;
    /** bound native <video> element ref */
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
    videoRef = $bindable(null),
    onPlay,
    onPause,
    onVolumeChange,
    onRateChange,
    onQualityChange,
    onRouteChange,
  }: Props = $props();

  const loc = useLocale();

  // --- reactive state (foundation mutates via adapter) ---
  let videoNode = $state<HTMLVideoElement | null>(null);
  let wrapperNode = $state<HTMLElement | null>(null);

  let isPlaying = $state(false);
  let muted = $state(untrack(() => mutedProp));
  let volume = $state(untrack(() => volumeProp)); // 0–100
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

  // localized bundle for foundation notifications
  const notiLocale = $derived<VideoPlayerLocale>({
    loading: loc().t('VideoPlayer.loading'),
    stall: loc().t('VideoPlayer.stall'),
    mirror: loc().t('VideoPlayer.mirrorOn'),
    cancelMirror: loc().t('VideoPlayer.mirrorOff'),
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

  // --- derived UI helpers ---
  const show = (name: string): boolean => controlsList.includes(name);
  const currentDisplay = $derived(formatTimeDisplay(currentTime));
  const totalDisplay = $derived(formatTimeDisplay(totalTime));
  const currentRateLabel = $derived(
    playbackRateList.find((r) => r.value === playbackRate)?.label ?? `${playbackRate}x`,
  );
  const currentQualityLabel = $derived(
    qualityList?.find((q) => q.value === quality)?.label ?? quality ?? '',
  );
  const currentRouteLabel = $derived(
    routeList?.find((r) => r.value === route)?.label ?? route ?? '',
  );

  const dimStyle = $derived(
    [
      width != null ? `width:${typeof width === 'number' ? `${width}px` : width}` : '',
      height != null ? `height:${typeof height === 'number' ? `${height}px` : height}` : '',
    ]
      .filter(Boolean)
      .join(';'),
  );

  // Register native media events + document keydown/fullscreenchange once the
  // <video> is bound. Cleanup removes all listeners and clears foundation timers.
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

  // --- control handlers ---
  function onSurfaceClick(): void {
    if (clickToPlay) foundation.handlePlayOrPause();
  }
  function onTogglePlay(): void {
    foundation.handlePlayOrPause();
  }
  function onToggleMute(): void {
    foundation.handleVolumeSilent();
  }
  function onVolume(v: number): void {
    foundation.handleVolumeChange(v);
    onVolumeChange?.(v);
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
  // ControlMenu's option value is the wide `string | number`; narrow back to
  // the concrete option type the foundation expects at the call boundary.
  function onSelectRate(o: { label: string; value: string | number }): void {
    foundation.handleRateChange({ label: o.label, value: Number(o.value) }, untrack(() => notiLocale));
  }
  function onSelectQuality(o: { label: string; value: string | number }): void {
    foundation.handleQualityChange(
      { label: o.label, value: String(o.value) },
      untrack(() => notiLocale),
    );
  }
  function onSelectRoute(o: { label: string; value: string | number }): void {
    foundation.handleRouteChange(
      { label: o.label, value: String(o.value) },
      untrack(() => notiLocale),
    );
  }
  function onMouseMove(): void {
    foundation.handleMouseMove();
  }
  function onMouseEnter(): void {
    foundation.handleMouseEnterWrapper();
  }
  function onMouseLeave(): void {
    foundation.handleMouseLeaveWrapper();
  }
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  bind:this={wrapperNode}
  class={['cd-video-player', `cd-video-player--${theme}`, className]}
  class:cd-video-player--playing={isPlaying}
  class:cd-video-player--controls-visible={showControls || !isPlaying}
  style={dimStyle}
  onmousemove={onMouseMove}
  onmouseenter={onMouseEnter}
  onmouseleave={onMouseLeave}
>
  <!-- svelte-ignore a11y_media_has_caption -->
  <video
    bind:this={videoNode}
    class="cd-video-player__video"
    class:cd-video-player__video--mirror={isMirror}
    {src}
    {poster}
    {loop}
    autoplay={autoPlay}
    muted={mutedProp}
    crossorigin={crossOrigin}
    playsinline
    onclick={onSurfaceClick}
  >
    {#if captionsSrc}
      <track kind="captions" src={captionsSrc} default />
    {/if}
  </video>

  {#if isError}
    <div class="cd-video-player__error" role="alert">
      {loc().t('VideoPlayer.error')}
    </div>
  {/if}

  {#if showNotification && notificationContent}
    <div class="cd-video-player__notification" aria-live="polite">
      {notificationContent}
    </div>
  {/if}

  <div class="cd-video-player__controls" aria-hidden={!(showControls || !isPlaying)}>
    {#if show('time') || totalTime > 0}
      <div class="cd-video-player__progress-row">
        <VideoProgress
          value={currentTime}
          buffered={bufferedValue}
          max={totalTime}
          {markers}
          ariaLabel={loc().t('VideoPlayer.progress')}
          onChange={onSeek}
        />
      </div>
    {/if}

    <div class="cd-video-player__bar">
      <div class="cd-video-player__group">
        {#if show('play')}
          <button
            type="button"
            class="cd-video-player__btn"
            aria-label={isPlaying ? loc().t('VideoPlayer.pause') : loc().t('VideoPlayer.play')}
            onclick={onTogglePlay}
          >
            <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" fill="currentColor">
              {#if isPlaying}
                <path d="M6 5h4v14H6zM14 5h4v14h-4z" />
              {:else}
                <path d="M8 5v14l11-7z" />
              {/if}
            </svg>
          </button>
        {/if}

        {#if show('volume')}
          <VolumeControl
            {volume}
            {muted}
            muteLabel={loc().t('VideoPlayer.mute')}
            unmuteLabel={loc().t('VideoPlayer.unmute')}
            volumeLabel={loc().t('VideoPlayer.volume')}
            onToggleMute={onToggleMute}
            onVolumeChange={onVolume}
          />
        {/if}

        {#if show('time')}
          <span class="cd-video-player__time" aria-hidden="true">
            {currentDisplay} / {totalDisplay}
          </span>
        {/if}
      </div>

      <div class="cd-video-player__group">
        {#if show('playbackRate')}
          <ControlMenu
            options={playbackRateList}
            current={playbackRate}
            label={loc().t('VideoPlayer.playbackRate')}
            onSelect={onSelectRate}
          >
            {#snippet trigger()}
              <span class="cd-video-player__btn-text">{currentRateLabel}</span>
            {/snippet}
          </ControlMenu>
        {/if}

        {#if show('quality') && qualityList && qualityList.length > 0}
          <ControlMenu
            options={qualityList}
            current={quality}
            label={loc().t('VideoPlayer.quality')}
            onSelect={onSelectQuality}
          >
            {#snippet trigger()}
              <span class="cd-video-player__btn-text">{currentQualityLabel}</span>
            {/snippet}
          </ControlMenu>
        {/if}

        {#if show('route') && routeList && routeList.length > 0}
          <ControlMenu
            options={routeList}
            current={route}
            label={loc().t('VideoPlayer.route')}
            onSelect={onSelectRoute}
          >
            {#snippet trigger()}
              <span class="cd-video-player__btn-text">{currentRouteLabel}</span>
            {/snippet}
          </ControlMenu>
        {/if}

        {#if show('mirror')}
          <button
            type="button"
            class="cd-video-player__btn"
            aria-label={loc().t('VideoPlayer.mirror')}
            aria-pressed={isMirror}
            onclick={onMirror}
          >
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="currentColor">
              <path d="M11 3h2v18h-2zM3 8l6-2v12l-6-2V8zm18 0v8l-6 2V6l6 2z" />
            </svg>
          </button>
        {/if}

        {#if show('pictureInPicture')}
          <button
            type="button"
            class="cd-video-player__btn"
            aria-label={loc().t('VideoPlayer.pictureInPicture')}
            onclick={onPip}
          >
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="currentColor">
              <path d="M21 3H3a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zm0 16H3V5h18v14zm-2-8h-8v6h8v-6z" />
            </svg>
          </button>
        {/if}

        {#if show('fullscreen')}
          <button
            type="button"
            class="cd-video-player__btn"
            aria-label={isFullscreen
              ? loc().t('VideoPlayer.exitFullscreen')
              : loc().t('VideoPlayer.fullscreen')}
            aria-pressed={isFullscreen}
            onclick={onFullscreen}
          >
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="currentColor">
              {#if isFullscreen}
                <path d="M9 9H5V7h2V5h2v4zm10-2h-2V5h-2v4h4V7zM5 15h2v2h2v2H5v-4zm12 2v-2h2v4h-4v-2h2z" />
              {:else}
                <path d="M7 7h4V5H5v6h2V7zm10 0v4h2V5h-6v2h4zM7 17v-4H5v6h6v-2H7zm10 0h-4v2h6v-6h-2v4z" />
              {/if}
            </svg>
          </button>
        {/if}
      </div>
    </div>
  </div>
</div>

<style>
  .cd-video-player {
    position: relative;
    display: inline-block;
    max-width: 100%;
    overflow: hidden;
    border-radius: var(--cd-video-player-radius, var(--cd-border-radius-medium, 6px));
    background: var(--cd-video-player-bg-dark, #1c1f23);
    line-height: 0;
  }
  .cd-video-player--light {
    background: var(--cd-video-player-bg-light, var(--cd-color-bg-0));
  }
  .cd-video-player__video {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
  .cd-video-player__video--mirror {
    transform: scaleX(-1);
  }

  .cd-video-player__controls {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    padding: var(--cd-video-player-controls-padding, 12px);
    background: var(
      --cd-video-player-controls-bg,
      linear-gradient(180deg, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.6))
    );
    opacity: 0;
    transition: opacity var(--cd-video-player-transition, 150ms) ease;
    line-height: normal;
  }
  .cd-video-player--controls-visible .cd-video-player__controls {
    opacity: 1;
  }

  .cd-video-player__progress-row {
    margin-bottom: var(--cd-video-player-controls-gap, 8px);
  }
  .cd-video-player__bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--cd-video-player-controls-gap, 8px);
  }
  .cd-video-player__group {
    display: flex;
    align-items: center;
    gap: var(--cd-video-player-controls-gap, 8px);
  }

  .cd-video-player__btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 4px;
    border: none;
    background: transparent;
    color: var(--cd-video-player-icon-color, var(--cd-color-text-inverse));
    cursor: pointer;
    border-radius: var(--cd-border-radius-small, 3px);
    transition: color var(--cd-video-player-transition, 150ms) ease;
  }
  .cd-video-player__btn:hover {
    color: var(--cd-video-player-icon-color-hover, rgba(255, 255, 255, 0.85));
  }
  .cd-video-player__btn:focus-visible {
    outline: 2px solid var(--cd-focus-ring, rgba(255, 255, 255, 0.6));
    outline-offset: 1px;
  }
  .cd-video-player__btn-text {
    font-size: var(--cd-font-size-regular, 14px);
    line-height: 1;
    padding: 0 4px;
  }

  .cd-video-player__time {
    color: var(--cd-video-player-text-color, var(--cd-color-text-inverse));
    font-size: var(--cd-font-size-regular, 14px);
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }

  .cd-video-player__notification {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    padding: 8px 16px;
    background: var(--cd-video-player-notification-bg, rgba(0, 0, 0, 0.6));
    color: var(--cd-video-player-notification-color, var(--cd-color-text-inverse));
    border-radius: var(--cd-video-player-notification-radius, var(--cd-border-radius-medium, 6px));
    font-size: var(--cd-font-size-regular, 14px);
    line-height: normal;
    pointer-events: none;
  }

  .cd-video-player__error {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--cd-video-player-notification-bg, rgba(0, 0, 0, 0.6));
    color: var(--cd-video-player-notification-color, var(--cd-color-text-inverse));
    font-size: var(--cd-font-size-regular, 14px);
    line-height: normal;
  }
</style>
