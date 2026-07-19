/**
 * video-player — framework-agnostic state machine for a native <video> player,
 * ported 1:1 from Semi Design's VideoPlayerFoundation + VideoProgressFoundation.
 *
 * ZERO framework deps. The render layer injects an adapter (getVideo /
 * getVideoWrapper + notify callbacks + state setters) and forwards native media
 * events (timeupdate / durationchange / progress / ended / error / canplay /
 * waiting / stalled / leavepictureinpicture) and document keydown /
 * fullscreenchange into the foundation methods. All time/volume clamping,
 * play-rate/quality/route switching, the keyboard map (Space / ← / →) and the
 * progress-bar drag→time math live here so any MVVM layer can reuse them.
 *
 * The foundation NEVER reads the DOM except through the adapter's getVideo /
 * getVideoWrapper accessors (which return the live element or null), matching
 * Semi. No document.* is touched here beyond fullscreen APIs invoked through
 * the video wrapper the adapter hands us — event (un)registration is delegated
 * to the render layer, so this module stays library-agnostic and SSR-safe.
 *
 * See specs Semi videoPlayer.foundation.js / progressFoundation.js.
 */

/** A localized string bundle the foundation needs for transient notifications. */
export interface VideoPlayerLocale {
  /** shown while the media is buffering (native `waiting`) */
  loading: string;
  /** shown when playback stalls (native `stalled`) */
  stall: string;
  /** mirror-on notification */
  mirror: string;
  /** mirror-off notification */
  cancelMirror: string;
  /** rate-change notification template, contains `${rate}` */
  rateChange: string;
  /** quality-change notification template, contains `${quality}` */
  qualityChange: string;
  /** route-change notification template, contains `${route}` */
  routeChange: string;
}

/** A `{ label, value }` option for the playback-rate menu. */
export interface PlaybackRateOption {
  label: string;
  value: number;
}

/** A `{ label, value }` option for the quality / route menus. */
export interface LabeledOption {
  label: string;
  value: string;
}

/** A chapter marker on the progress track. */
export interface VideoMarker {
  /** start time in seconds */
  start: number;
  /** chapter title */
  title?: string;
}

/**
 * Adapter the render layer implements. Mirrors Semi's VideoPlayerAdapter:
 * two element accessors, a set of `notify*` callbacks (fired outward to the
 * host's `onXxx` props) and a set of `set*` state mutators (fired inward to
 * the render layer's reactive state).
 */
export interface VideoPlayerAdapter {
  getVideo: () => HTMLVideoElement | null;
  getVideoWrapper: () => HTMLElement | null;
  notifyPlay: () => void;
  notifyPause: () => void;
  notifyQualityChange: (quality: string) => void;
  notifyRateChange: (rate: number) => void;
  notifyRouteChange: (route: string) => void;
  notifyVolumeChange: (volume: number) => void;
  setBufferedValue: (bufferedValue: number) => void;
  setCurrentTime: (currentTime: number) => void;
  setIsError: (isError: boolean) => void;
  setIsMirror: (isMirror: boolean) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setMuted: (muted: boolean) => void;
  setNotificationContent: (content: string) => void;
  setPlaybackRate: (rate: number) => void;
  setQuality: (quality: string) => void;
  setRoute: (route: string) => void;
  setShowControls: (showControls: boolean) => void;
  setShowNotification: (showNotification: boolean) => void;
  setTotalTime: (totalTime: number) => void;
  setVolume: (volume: number) => void;
}

/** Reactive state the foundation reads back through `getState`. */
export interface VideoPlayerState {
  isPlaying: boolean;
  muted: boolean;
  volume: number; // 0–100
  currentTime: number;
  isMirror: boolean;
}

/** Host props the foundation reads through `getProps`. */
export interface VideoPlayerProps {
  volume: number; // 0–100 initial
  muted: boolean;
  seekTime: number;
  controlsList: string[];
}

export interface VideoPlayerFoundationOptions {
  adapter: VideoPlayerAdapter;
  getState: () => VideoPlayerState;
  getProps: () => VideoPlayerProps;
  /** how long (ms) auto-hide controls waits after the last mouse move (Semi: 3000) */
  controlsHideDelay?: number;
  /** how long (ms) a transient notification stays up (Semi: 1000) */
  notificationDuration?: number;
}

type TimerId = ReturnType<typeof setTimeout>;

/** Default control items, in Semi's order. */
export const DEFAULT_CONTROLS_LIST: string[] = [
  'play',
  'next',
  'time',
  'volume',
  'playbackRate',
  'quality',
  'route',
  'mirror',
  'fullscreen',
  'pictureInPicture',
];

/** Semi's default 6-tier playback-rate menu (2.0 → 0.75). */
export const DEFAULT_PLAYBACK_RATE_LIST: PlaybackRateOption[] = [
  { label: '2.0x', value: 2 },
  { label: '1.5x', value: 1.5 },
  { label: '1.25x', value: 1.25 },
  { label: '1.0x', value: 1 },
  { label: '0.75x', value: 0.75 },
];

export const VIDEO_PLAYER_NUMBERS = {
  DEFAULT_VOLUME: 100,
  DEFAULT_SEEK_TIME: 10,
  DEFAULT_VOLUME_STEP: 10,
  DEFAULT_PLAYBACK_RATE: 1,
} as const;

/**
 * Create the VideoPlayer foundation. Returns an object of methods the render
 * layer wires to DOM events + UI controls. Pure w.r.t. framework; the only
 * side effects are through the injected adapter, timers, and fullscreen /
 * PiP browser APIs reached via the elements the adapter returns.
 */
export function createVideoPlayerFoundation(options: VideoPlayerFoundationOptions) {
  const { adapter, getState, getProps } = options;
  const controlsHideDelay = options.controlsHideDelay ?? 3000;
  const notificationDuration = options.notificationDuration ?? 1000;

  let controlsTimer: TimerId | null = null;
  let notificationTimer: TimerId | null = null;
  let mouseMoveThrottleTs = 0;
  let scrollPosition: { x: number; y: number } | null = null;

  function clearTimer(): void {
    if (controlsTimer !== null) {
      clearTimeout(controlsTimer);
      controlsTimer = null;
    }
  }
  function clearNotificationTimer(): void {
    if (notificationTimer !== null) {
      clearTimeout(notificationTimer);
      notificationTimer = null;
    }
  }

  // --- controls auto-hide (Semi throttles mousemove at 200ms) ---
  function handleMouseMove(): void {
    const now = Date.now();
    if (now - mouseMoveThrottleTs < 200) return;
    mouseMoveThrottleTs = now;
    adapter.setShowControls(true);
    clearTimer();
    controlsTimer = setTimeout(() => {
      adapter.setShowControls(false);
    }, controlsHideDelay);
  }

  function handleMouseEnterWrapper(): void {
    adapter.setShowControls(true);
  }
  function handleMouseLeaveWrapper(): void {
    if (getState().isPlaying) {
      adapter.setShowControls(false);
    }
  }

  // --- native media events → state ---
  function handleVideoPlay(): void {
    adapter.setIsPlaying(true);
    adapter.notifyPlay();
  }
  function handleVideoPause(): void {
    adapter.setIsPlaying(false);
    adapter.notifyPause();
  }
  function handleCanPlay(): void {
    adapter.setShowNotification(false);
  }
  function handleWaiting(locale: VideoPlayerLocale): void {
    adapter.setNotificationContent(locale.loading);
    adapter.setShowNotification(true);
  }
  function handleStalled(locale: VideoPlayerLocale): void {
    adapter.setNotificationContent(locale.stall);
    adapter.setShowNotification(true);
  }
  function handleProgress(): void {
    const video = adapter.getVideo();
    if (video && video.buffered.length > 0) {
      const bufferedEnd = video.buffered.end(video.buffered.length - 1);
      adapter.setBufferedValue(bufferedEnd);
    }
  }
  function handleEnded(): void {
    adapter.setIsPlaying(false);
    adapter.setShowControls(true);
  }
  function handleTimeUpdate(): void {
    const video = adapter.getVideo();
    if (!video) return;
    adapter.setCurrentTime(video.currentTime);
  }
  function handleDurationChange(): void {
    const video = adapter.getVideo();
    if (!video) return;
    adapter.setTotalTime(video.duration);
  }
  function handleError(): void {
    adapter.setIsError(true);
  }

  // --- play / pause ---
  function handlePlay(): void {
    const video = adapter.getVideo();
    if (video) {
      // native onPlay → handleVideoPlay updates isPlaying
      void video.play();
    }
  }
  function handlePause(): void {
    const video = adapter.getVideo();
    if (video) {
      video.pause();
    }
  }
  function handlePlayOrPause(): void {
    const video = adapter.getVideo();
    if (!video) return;
    if (video.paused) handlePlay();
    else handlePause();
  }

  // --- time / seek (with NaN guard, matching Semi) ---
  function handleTimeChange(value: number): void {
    const video = adapter.getVideo();
    if (!video) return;
    if (!Number.isNaN(value)) {
      video.currentTime = value;
      adapter.setCurrentTime(value);
    }
  }

  // --- volume (0–100 floor + mute derivation, matching Semi) ---
  function handleVolumeChange(value: number): void {
    const video = adapter.getVideo();
    if (!video) return;
    const volume = Math.floor(value > 0 ? value : 0);
    video.volume = volume / 100;
    adapter.setVolume(volume);
    adapter.setMuted(volume === 0);
    // NB: Semi's handleVolumeChange does not fire notifyVolumeChange; the
    // onVolumeChange callback is wired by the render layer to the slider's
    // own change event. Kept faithful — no notify here.
  }
  /** Toggle mute: restore previous volume when muted, else drop to 0. */
  function handleVolumeSilent(): void {
    const video = adapter.getVideo();
    if (!video) return;
    const { volume, muted } = getState();
    if (muted) {
      video.volume = volume / 100;
      adapter.setVolume(volume);
      adapter.setMuted(false);
    } else {
      video.volume = 0;
      adapter.setMuted(true);
    }
  }

  // --- fullscreen ---
  function checkFullScreen(): boolean {
    const videoWrapper = adapter.getVideoWrapper();
    if (!videoWrapper) return false;
    const doc = document as Document & {
      webkitFullscreenElement?: Element | null;
      mozFullScreenElement?: Element | null;
      msFullscreenElement?: Element | null;
    };
    const el = videoWrapper as HTMLElement & { webkitDisplayingFullscreen?: boolean };
    return !!(
      doc.fullscreenElement === videoWrapper ||
      doc.webkitFullscreenElement === videoWrapper ||
      doc.mozFullScreenElement === videoWrapper ||
      doc.msFullscreenElement === videoWrapper ||
      el.webkitDisplayingFullscreen // iOS Safari
    );
  }
  function handleFullscreen(): void {
    const videoWrapper = adapter.getVideoWrapper();
    if (!videoWrapper) return;
    if (checkFullScreen()) {
      void document.exitFullscreen();
    } else {
      scrollPosition = { x: window.scrollX, y: window.scrollY };
      void videoWrapper.requestFullscreen();
    }
  }
  function handleFullscreenChange(): void {
    if (checkFullScreen()) {
      document.addEventListener('mousemove', handleMouseMove);
    } else {
      // Esc or button exit both land here; restore the pre-fullscreen scroll.
      if (scrollPosition) {
        const pos = scrollPosition;
        setTimeout(() => {
          window.scrollTo(pos.x, pos.y);
          scrollPosition = null;
        }, 0);
      }
      document.removeEventListener('mousemove', handleMouseMove);
    }
  }

  // --- mirror ---
  function handleMirror(locale: VideoPlayerLocale): void {
    const { isMirror } = getState();
    const next = !isMirror;
    adapter.setIsMirror(next);
    handleTemporaryNotification(next ? locale.mirror : locale.cancelMirror);
  }

  // --- picture-in-picture ---
  function handlePictureInPicture(): void {
    const video = adapter.getVideo();
    if (!video) return;
    void video.requestPictureInPicture();
  }
  function handleLeavePictureInPicture(): void {
    const video = adapter.getVideo();
    if (!video) return;
    adapter.setIsPlaying(!video.paused);
  }

  // --- rate / quality / route ---
  function handleRateChange(rate: PlaybackRateOption, locale: VideoPlayerLocale): void {
    const video = adapter.getVideo();
    if (!video) return;
    video.playbackRate = rate.value;
    adapter.setPlaybackRate(rate.value);
    adapter.notifyRateChange(rate.value);
    handleTemporaryNotification(locale.rateChange.replace('${rate}', rate.label));
  }
  function handleQualityChange(quality: LabeledOption, locale: VideoPlayerLocale): void {
    adapter.setQuality(quality.value);
    adapter.notifyQualityChange(quality.value);
    handleTemporaryNotification(locale.qualityChange.replace('${quality}', quality.label));
    restorePlayPosition();
  }
  function handleRouteChange(route: LabeledOption, locale: VideoPlayerLocale): void {
    adapter.setRoute(route.value);
    adapter.notifyRouteChange(route.value);
    handleTemporaryNotification(locale.routeChange.replace('${route}', route.label));
    restorePlayPosition();
  }
  /** After a src swap, seek back to the previous position and resume if it was playing. */
  function restorePlayPosition(): void {
    const video = adapter.getVideo();
    if (!video) return;
    const wasPlaying = !video.paused;
    const currentTime = video.currentTime;
    const handleLoaded = (): void => {
      video.currentTime = currentTime;
      if (wasPlaying) void video.play();
      video.removeEventListener('loadeddata', handleLoaded);
    };
    video.addEventListener('loadeddata', handleLoaded);
  }

  // --- transient notification ---
  function handleTemporaryNotification(content: string): void {
    adapter.setNotificationContent(content);
    adapter.setShowNotification(true);
    clearNotificationTimer();
    notificationTimer = setTimeout(() => {
      adapter.setShowNotification(false);
      notificationTimer = null;
    }, notificationDuration);
  }

  // --- keyboard (Space play/pause, ←/→ seek by seekTime) ---
  function handleBodyKeyDown(e: KeyboardEvent): void {
    const videoWrapper = adapter.getVideoWrapper();
    // Only respond when focus is inside the player, so we don't hijack keys
    // from other interactive elements on the page (Semi behavior).
    if (videoWrapper && !videoWrapper.contains(document.activeElement)) {
      return;
    }
    const { currentTime } = getState();
    const { seekTime } = getProps();
    if (e.key === ' ') {
      handlePlayOrPause();
    } else if (e.key === 'ArrowLeft') {
      handleTimeChange(currentTime - seekTime);
    } else if (e.key === 'ArrowRight') {
      handleTimeChange(currentTime + seekTime);
    }
  }

  // --- lifecycle ---
  function init(): void {
    const { volume, muted } = getProps();
    const video = adapter.getVideo();
    if (video) {
      adapter.setTotalTime(video.duration);
      handleVolumeChange(muted ? 0 : volume);
    }
  }
  function destroy(): void {
    clearTimer();
    clearNotificationTimer();
    document.removeEventListener('mousemove', handleMouseMove);
  }

  function shouldShowControlItem(name: string): boolean {
    return getProps().controlsList.includes(name);
  }

  return {
    init,
    destroy,
    clearTimer,
    shouldShowControlItem,
    checkFullScreen,
    // media events
    handleVideoPlay,
    handleVideoPause,
    handleCanPlay,
    handleWaiting,
    handleStalled,
    handleProgress,
    handleEnded,
    handleTimeUpdate,
    handleDurationChange,
    handleError,
    handleLeavePictureInPicture,
    // controls
    handleMouseMove,
    handleMouseEnterWrapper,
    handleMouseLeaveWrapper,
    handlePlay,
    handlePause,
    handlePlayOrPause,
    handleTimeChange,
    handleVolumeChange,
    handleVolumeSilent,
    handleFullscreen,
    handleFullscreenChange,
    handleMirror,
    handlePictureInPicture,
    handleRateChange,
    handleQualityChange,
    handleRouteChange,
    handleTemporaryNotification,
    handleBodyKeyDown,
  };
}

export type VideoPlayerFoundation = ReturnType<typeof createVideoPlayerFoundation>;

// ---------------------------------------------------------------------------
// Progress-bar drag → time math (ported from VideoProgressFoundation).
// Pure geometry helpers the render layer calls on pointer events; no DOM
// beyond the ClientRect the caller passes in.
// ---------------------------------------------------------------------------

/** Clamp a pointer X to a [0,1] fraction of a slider rect, then to a value. */
export function progressValueFromPointer(
  clientX: number,
  rect: { left: number; width: number },
  max: number,
): { percentage: number; value: number; offset: number } {
  const offset = clientX - rect.left;
  const total = rect.width;
  const percentage = total > 0 ? Math.min(Math.max(offset / total, 0), 1) : 0;
  const value = percentage * max;
  return { percentage, value, offset: offset - rect.width / 2 };
}

/**
 * Width (as CSS length) of the `value` overlay within one marker segment.
 * Returns `'0%'` before the segment, a clamped `calc(100% - 2px)` past it, and
 * a percentage inside it — matching Semi's getValueWidth.
 */
export function segmentValueWidth(
  marker: { start: number; end: number },
  value: number,
): string {
  const { start, end } = marker;
  if (value > end) return 'calc(100% - 2px)';
  if (value < start) return '0%';
  if (end === start) return '0%';
  return `${((value - start) / (end - start)) * 100}%`;
}

/**
 * Build contiguous `[start, end)` marker segments across the whole duration
 * from Semi-style chapter markers (each with only a `start`). The last segment
 * runs to `totalTime`. When there are no markers a single full-width segment is
 * returned so the progress bar always has exactly one track to render.
 */
export function buildMarkerSegments(
  markers: VideoMarker[],
  totalTime: number,
): Array<{ start: number; end: number; title?: string }> {
  const total = Number.isFinite(totalTime) && totalTime > 0 ? totalTime : 0;
  if (!markers || markers.length === 0) {
    return [{ start: 0, end: total }];
  }
  const sorted = [...markers]
    .filter((m) => Number.isFinite(m.start) && m.start >= 0)
    .sort((a, b) => a.start - b.start);
  if (sorted.length === 0) return [{ start: 0, end: total }];
  return sorted.map((m, i) => {
    const next = sorted[i + 1];
    const end = next ? next.start : total;
    const seg: { start: number; end: number; title?: string } = {
      start: m.start,
      end: Math.max(end, m.start),
    };
    if (m.title !== undefined) seg.title = m.title;
    return seg;
  });
}

/**
 * Format seconds as `MM:SS` / `H:MM:SS`（严格对齐 Semi utils.formatTime）：
 * NaN/非法 → '00:00'；≥1h → `H:MM:SS`；否则 `MM:SS`（分钟也补零）。
 */
export function formatTimeDisplay(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '00:00';
  const total = Math.floor(seconds);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const ss = String(s).padStart(2, '0');
  const mm = String(m).padStart(2, '0');
  if (h > 0) {
    return `${h}:${mm}:${ss}`;
  }
  return `${mm}:${ss}`;
}
