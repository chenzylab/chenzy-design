// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createVideoPlayerFoundation,
  DEFAULT_CONTROLS_LIST,
  DEFAULT_PLAYBACK_RATE_LIST,
  progressValueFromPointer,
  segmentValueWidth,
  buildMarkerSegments,
  formatTimeDisplay,
  type VideoPlayerAdapter,
  type VideoPlayerLocale,
  type VideoPlayerProps,
  type VideoPlayerState,
} from './video-player.js';

const locale: VideoPlayerLocale = {
  loading: 'Loading',
  stall: 'Stalled',
  mirror: 'Mirrored',
  cancelMirror: 'Mirror off',
  rateChange: 'Rate: ${rate}',
  qualityChange: 'Quality: ${quality}',
  routeChange: 'Route: ${route}',
};

/** A fake <video> with just the surface the foundation touches. */
function makeVideo() {
  const listeners = new Map<string, EventListener[]>();
  return {
    paused: true,
    currentTime: 0,
    duration: 100,
    volume: 1,
    playbackRate: 1,
    buffered: {
      length: 1,
      end: () => 42,
    } as unknown as TimeRanges,
    play: vi.fn(function (this: { paused: boolean }) {
      this.paused = false;
      return Promise.resolve();
    }),
    pause: vi.fn(function (this: { paused: boolean }) {
      this.paused = true;
    }),
    requestPictureInPicture: vi.fn(() => Promise.resolve({} as PictureInPictureWindow)),
    addEventListener: (t: string, cb: EventListener) => {
      listeners.set(t, [...(listeners.get(t) ?? []), cb]);
    },
    removeEventListener: (t: string, cb: EventListener) => {
      listeners.set(t, (listeners.get(t) ?? []).filter((l) => l !== cb));
    },
    _emit: (t: string) => (listeners.get(t) ?? []).forEach((l) => l(new Event(t))),
  };
}

function setup(overrides?: {
  props?: Partial<VideoPlayerProps>;
  state?: Partial<VideoPlayerState>;
}) {
  const video = makeVideo();
  const wrapper = document.createElement('div');
  document.body.appendChild(wrapper);

  const state: VideoPlayerState = {
    isPlaying: false,
    muted: false,
    volume: 100,
    currentTime: 0,
    isMirror: false,
    ...overrides?.state,
  };
  const props: VideoPlayerProps = {
    volume: 100,
    muted: false,
    seekTime: 10,
    controlsList: DEFAULT_CONTROLS_LIST,
    ...overrides?.props,
  };

  const calls: Record<string, unknown[][]> = {};
  const rec =
    (name: string) =>
    (...args: unknown[]) => {
      (calls[name] ??= []).push(args);
    };

  const adapter: VideoPlayerAdapter = {
    getVideo: () => video as unknown as HTMLVideoElement,
    getVideoWrapper: () => wrapper,
    notifyPlay: rec('notifyPlay'),
    notifyPause: rec('notifyPause'),
    notifyQualityChange: rec('notifyQualityChange'),
    notifyRateChange: rec('notifyRateChange'),
    notifyRouteChange: rec('notifyRouteChange'),
    notifyVolumeChange: rec('notifyVolumeChange'),
    setBufferedValue: (v) => {
      rec('setBufferedValue')(v);
    },
    setCurrentTime: (v) => {
      state.currentTime = v;
      rec('setCurrentTime')(v);
    },
    setIsError: rec('setIsError'),
    setIsMirror: (v) => {
      state.isMirror = v;
      rec('setIsMirror')(v);
    },
    setIsPlaying: (v) => {
      state.isPlaying = v;
      rec('setIsPlaying')(v);
    },
    setMuted: (v) => {
      state.muted = v;
      rec('setMuted')(v);
    },
    setNotificationContent: rec('setNotificationContent'),
    setPlaybackRate: rec('setPlaybackRate'),
    setQuality: rec('setQuality'),
    setRoute: rec('setRoute'),
    setShowControls: rec('setShowControls'),
    setShowNotification: rec('setShowNotification'),
    setTotalTime: rec('setTotalTime'),
    setVolume: (v) => {
      state.volume = v;
      rec('setVolume')(v);
    },
  };

  const f = createVideoPlayerFoundation({
    adapter,
    getState: () => state,
    getProps: () => props,
  });

  return { f, adapter, video, wrapper, state, calls };
}

describe('createVideoPlayerFoundation — play/pause', () => {
  it('handlePlayOrPause plays when paused', () => {
    const { f, video } = setup();
    video.paused = true;
    f.handlePlayOrPause();
    expect(video.play).toHaveBeenCalled();
  });

  it('handlePlayOrPause pauses when playing', () => {
    const { f, video } = setup();
    video.paused = false;
    f.handlePlayOrPause();
    expect(video.pause).toHaveBeenCalled();
  });

  it('handleVideoPlay sets isPlaying + notifies', () => {
    const { f, calls } = setup();
    f.handleVideoPlay();
    expect(calls.setIsPlaying).toEqual([[true]]);
    expect(calls.notifyPlay).toHaveLength(1);
  });

  it('handleVideoPause sets isPlaying false + notifies', () => {
    const { f, calls } = setup();
    f.handleVideoPause();
    expect(calls.setIsPlaying).toEqual([[false]]);
    expect(calls.notifyPause).toHaveLength(1);
  });

  it('handleEnded stops + reveals controls', () => {
    const { f, calls } = setup();
    f.handleEnded();
    expect(calls.setIsPlaying).toEqual([[false]]);
    expect(calls.setShowControls).toEqual([[true]]);
  });
});

describe('time change (NaN clamp)', () => {
  it('sets currentTime for a valid value', () => {
    const { f, video, calls } = setup();
    f.handleTimeChange(30);
    expect(video.currentTime).toBe(30);
    expect(calls.setCurrentTime).toEqual([[30]]);
  });

  it('ignores NaN', () => {
    const { f, video, calls } = setup();
    video.currentTime = 5;
    f.handleTimeChange(Number.NaN);
    expect(video.currentTime).toBe(5);
    expect(calls.setCurrentTime).toBeUndefined();
  });

  it('handleTimeUpdate mirrors video.currentTime', () => {
    const { f, video, calls } = setup();
    video.currentTime = 12.5;
    f.handleTimeUpdate();
    expect(calls.setCurrentTime).toEqual([[12.5]]);
  });

  it('handleDurationChange mirrors video.duration', () => {
    const { f, video, calls } = setup();
    video.duration = 250;
    f.handleDurationChange();
    expect(calls.setTotalTime).toEqual([[250]]);
  });
});

describe('volume change (0–100 clamp + mute derivation)', () => {
  it('floors and clamps negatives to 0 → muted', () => {
    const { f, video, calls } = setup();
    f.handleVolumeChange(-20);
    expect(video.volume).toBe(0);
    expect(calls.setVolume).toEqual([[0]]);
    expect(calls.setMuted).toEqual([[true]]);
  });

  it('floors fractional volume, unmutes above 0', () => {
    const { f, video, calls } = setup();
    f.handleVolumeChange(55.9);
    expect(calls.setVolume).toEqual([[55]]);
    expect(video.volume).toBeCloseTo(0.55);
    expect(calls.setMuted).toEqual([[false]]);
  });

  it('does NOT fire notifyVolumeChange (faithful to Semi)', () => {
    const { f, calls } = setup();
    f.handleVolumeChange(50);
    expect(calls.notifyVolumeChange).toBeUndefined();
  });

  it('handleVolumeSilent mutes when unmuted', () => {
    const { f, video, calls } = setup({ state: { muted: false, volume: 80 } });
    f.handleVolumeSilent();
    expect(video.volume).toBe(0);
    expect(calls.setMuted).toEqual([[true]]);
  });

  it('handleVolumeSilent restores volume when muted', () => {
    const { f, video, calls } = setup({ state: { muted: true, volume: 80 } });
    f.handleVolumeSilent();
    expect(video.volume).toBeCloseTo(0.8);
    expect(calls.setVolume).toEqual([[80]]);
    expect(calls.setMuted).toEqual([[false]]);
  });
});

describe('rate / quality / route', () => {
  it('handleRateChange sets rate + notifies + notifies label', () => {
    const { f, video, calls } = setup();
    f.handleRateChange({ label: '1.5x', value: 1.5 }, locale);
    expect(video.playbackRate).toBe(1.5);
    expect(calls.setPlaybackRate).toEqual([[1.5]]);
    expect(calls.notifyRateChange).toEqual([[1.5]]);
    expect(calls.setNotificationContent).toEqual([['Rate: 1.5x']]);
  });

  it('handleQualityChange sets quality + notifies + interpolates label', () => {
    const { f, calls } = setup();
    f.handleQualityChange({ label: '1080p', value: '1080p' }, locale);
    expect(calls.setQuality).toEqual([['1080p']]);
    expect(calls.notifyQualityChange).toEqual([['1080p']]);
    expect(calls.setNotificationContent).toEqual([['Quality: 1080p']]);
  });

  it('handleRouteChange sets route + notifies + interpolates label', () => {
    const { f, calls } = setup();
    f.handleRouteChange({ label: 'Line 2', value: 'l2' }, locale);
    expect(calls.setRoute).toEqual([['l2']]);
    expect(calls.notifyRouteChange).toEqual([['l2']]);
    expect(calls.setNotificationContent).toEqual([['Route: Line 2']]);
  });
});

describe('mirror', () => {
  it('toggles on with mirror notification', () => {
    const { f, calls } = setup({ state: { isMirror: false } });
    f.handleMirror(locale);
    expect(calls.setIsMirror).toEqual([[true]]);
    expect(calls.setNotificationContent).toEqual([['Mirrored']]);
  });

  it('toggles off with cancel notification', () => {
    const { f, calls } = setup({ state: { isMirror: true } });
    f.handleMirror(locale);
    expect(calls.setIsMirror).toEqual([[false]]);
    expect(calls.setNotificationContent).toEqual([['Mirror off']]);
  });
});

describe('buffering notifications', () => {
  it('handleWaiting shows loading', () => {
    const { f, calls } = setup();
    f.handleWaiting(locale);
    expect(calls.setNotificationContent).toEqual([['Loading']]);
    expect(calls.setShowNotification).toEqual([[true]]);
  });

  it('handleStalled shows stall', () => {
    const { f, calls } = setup();
    f.handleStalled(locale);
    expect(calls.setNotificationContent).toEqual([['Stalled']]);
  });

  it('handleCanPlay hides notification', () => {
    const { f, calls } = setup();
    f.handleCanPlay();
    expect(calls.setShowNotification).toEqual([[false]]);
  });

  it('handleProgress reports buffered end', () => {
    const { f, calls } = setup();
    f.handleProgress();
    expect(calls.setBufferedValue).toEqual([[42]]);
  });

  it('handleError flags error', () => {
    const { f, calls } = setup();
    f.handleError();
    expect(calls.setIsError).toEqual([[true]]);
  });
});

describe('picture-in-picture', () => {
  it('handlePictureInPicture requests PiP', () => {
    const { f, video } = setup();
    f.handlePictureInPicture();
    expect(video.requestPictureInPicture).toHaveBeenCalled();
  });

  it('handleLeavePictureInPicture syncs isPlaying to !paused', () => {
    const { f, video, calls } = setup();
    video.paused = false;
    f.handleLeavePictureInPicture();
    expect(calls.setIsPlaying).toEqual([[true]]);
  });
});

describe('keyboard map', () => {
  it('Space toggles play/pause when focus is inside wrapper', () => {
    const { f, video, wrapper } = setup();
    const btn = document.createElement('button');
    wrapper.appendChild(btn);
    btn.focus();
    video.paused = true;
    f.handleBodyKeyDown(new KeyboardEvent('keydown', { key: ' ' }));
    expect(video.play).toHaveBeenCalled();
  });

  it('ArrowLeft seeks back by seekTime', () => {
    const { f, video, wrapper } = setup({ props: { seekTime: 10 }, state: { currentTime: 30 } });
    wrapper.focus();
    // jsdom: activeElement must be inside wrapper — put a focusable child
    const btn = document.createElement('button');
    wrapper.appendChild(btn);
    btn.focus();
    f.handleBodyKeyDown(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
    expect(video.currentTime).toBe(20);
  });

  it('ArrowRight seeks forward by seekTime', () => {
    const { f, video, wrapper } = setup({ props: { seekTime: 5 }, state: { currentTime: 30 } });
    const btn = document.createElement('button');
    wrapper.appendChild(btn);
    btn.focus();
    f.handleBodyKeyDown(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
    expect(video.currentTime).toBe(35);
  });

  it('ignores keys when focus is outside the wrapper', () => {
    const { f, video } = setup();
    const outside = document.createElement('button');
    document.body.appendChild(outside);
    outside.focus();
    video.paused = true;
    f.handleBodyKeyDown(new KeyboardEvent('keydown', { key: ' ' }));
    expect(video.play).not.toHaveBeenCalled();
  });
});

describe('controlsList gating', () => {
  it('shouldShowControlItem reflects the list', () => {
    const { f } = setup({ props: { controlsList: ['play', 'time'] } });
    expect(f.shouldShowControlItem('play')).toBe(true);
    expect(f.shouldShowControlItem('mirror')).toBe(false);
  });
});

describe('init / destroy', () => {
  it('init sets total time + applies initial volume', () => {
    const { f, video, calls } = setup({ props: { volume: 60, muted: false } });
    video.duration = 88;
    f.init();
    expect(calls.setTotalTime).toEqual([[88]]);
    expect(calls.setVolume).toEqual([[60]]);
  });

  it('init with muted applies volume 0', () => {
    const { f, calls } = setup({ props: { volume: 60, muted: true } });
    f.init();
    expect(calls.setVolume).toEqual([[0]]);
    expect(calls.setMuted).toEqual([[true]]);
  });

  it('destroy clears the auto-hide timer without throwing', () => {
    const { f } = setup();
    f.handleMouseMove();
    expect(() => f.destroy()).not.toThrow();
  });
});

describe('controls auto-hide', () => {
  beforeEach(() => vi.useFakeTimers());

  it('shows controls immediately then hides after the delay', () => {
    const { f, calls } = setup();
    f.handleMouseMove();
    expect(calls.setShowControls).toEqual([[true]]);
    vi.advanceTimersByTime(3000);
    expect(calls.setShowControls).toEqual([[true], [false]]);
    vi.useRealTimers();
  });

  it('handleMouseLeaveWrapper hides only while playing', () => {
    vi.useRealTimers();
    const playing = setup({ state: { isPlaying: true } });
    playing.f.handleMouseLeaveWrapper();
    expect(playing.calls.setShowControls).toEqual([[false]]);

    const paused = setup({ state: { isPlaying: false } });
    paused.f.handleMouseLeaveWrapper();
    expect(paused.calls.setShowControls).toBeUndefined();
  });
});

describe('progress geometry helpers', () => {
  it('progressValueFromPointer clamps to [0,1] * max', () => {
    const rect = { left: 100, width: 200 };
    expect(progressValueFromPointer(200, rect, 60).value).toBeCloseTo(30);
    expect(progressValueFromPointer(50, rect, 60).value).toBe(0); // before start
    expect(progressValueFromPointer(400, rect, 60).value).toBe(60); // past end
  });

  it('progressValueFromPointer guards width 0', () => {
    expect(progressValueFromPointer(10, { left: 0, width: 0 }, 60)).toEqual({
      percentage: 0,
      value: 0,
      offset: 10,
    });
  });

  it('segmentValueWidth: before / inside / after a segment', () => {
    const seg = { start: 10, end: 20 };
    expect(segmentValueWidth(seg, 5)).toBe('0%');
    expect(segmentValueWidth(seg, 15)).toBe('50%');
    expect(segmentValueWidth(seg, 25)).toBe('calc(100% - 2px)');
  });

  it('buildMarkerSegments with no markers → single full-width segment', () => {
    expect(buildMarkerSegments([], 100)).toEqual([{ start: 0, end: 100 }]);
  });

  it('buildMarkerSegments sorts + chains to totalTime', () => {
    const segs = buildMarkerSegments(
      [
        { start: 30, title: 'c' },
        { start: 0, title: 'a' },
        { start: 10, title: 'b' },
      ],
      50,
    );
    expect(segs).toEqual([
      { start: 0, end: 10, title: 'a' },
      { start: 10, end: 30, title: 'b' },
      { start: 30, end: 50, title: 'c' },
    ]);
  });
});

describe('formatTimeDisplay', () => {
  it('formats m:ss and h:mm:ss', () => {
    expect(formatTimeDisplay(0)).toBe('0:00');
    expect(formatTimeDisplay(65)).toBe('1:05');
    expect(formatTimeDisplay(3661)).toBe('1:01:01');
    expect(formatTimeDisplay(Number.NaN)).toBe('0:00');
    expect(formatTimeDisplay(-5)).toBe('0:00');
  });
});

describe('exported defaults', () => {
  it('DEFAULT_CONTROLS_LIST matches Semi order', () => {
    expect(DEFAULT_CONTROLS_LIST).toEqual([
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
    ]);
  });

  it('DEFAULT_PLAYBACK_RATE_LIST has 5 tiers 2.0→0.75', () => {
    expect(DEFAULT_PLAYBACK_RATE_LIST.map((r) => r.value)).toEqual([2, 1.5, 1.25, 1, 0.75]);
  });
});
