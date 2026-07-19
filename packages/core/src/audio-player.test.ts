import { describe, expect, it, vi } from 'vitest';
import {
  createAudioPlayer,
  normalizeAudioUrl,
  clampVolume,
  clampTime,
  type AudioPlayerAdapter,
} from './audio-player.js';

/** 一个可断言的假 <audio> 适配器：记录调用并维护一份内部媒体状态。 */
function makeAdapter(overrides: Partial<AudioPlayerAdapter> = {}) {
  const media = { currentTime: 0, duration: 120, volume: 1, playbackRate: 1 };
  const play = vi.fn(() => {});
  const pause = vi.fn(() => {});
  const adapter: AudioPlayerAdapter = {
    play,
    pause,
    getCurrentTime: () => media.currentTime,
    setCurrentTime: (s) => {
      media.currentTime = s;
    },
    getDuration: () => media.duration,
    getVolume: () => media.volume,
    setVolume: (v) => {
      media.volume = v;
    },
    getPlaybackRate: () => media.playbackRate,
    setPlaybackRate: (v) => {
      media.playbackRate = v;
    },
    ...overrides,
  };
  return { adapter, media, play, pause };
}

describe('normalizeAudioUrl — audioUrl 四形态归一（对齐 Semi）', () => {
  it('string → 单曲', () => {
    expect(normalizeAudioUrl('a.mp3')).toEqual([{ src: 'a.mp3' }]);
  });

  it('AudioInfo → 单曲带 title/cover', () => {
    expect(normalizeAudioUrl({ src: 'a.mp3', title: 'A', cover: 'a.png' })).toEqual([
      { src: 'a.mp3', title: 'A', cover: 'a.png' },
    ]);
  });

  it('string[] → 多曲，丢弃空串', () => {
    expect(normalizeAudioUrl(['a.mp3', '', 'b.mp3'])).toEqual([
      { src: 'a.mp3' },
      { src: 'b.mp3' },
    ]);
  });

  it('AudioInfo[] → 多曲，丢弃无 src 项', () => {
    const input = [
      { src: 'a.mp3', title: 'A' },
      { title: 'no-src' } as unknown as { src: string },
      { src: 'b.mp3', cover: 'b.png' },
    ];
    expect(normalizeAudioUrl(input)).toEqual([
      { src: 'a.mp3', title: 'A' },
      { src: 'b.mp3', cover: 'b.png' },
    ]);
  });

  it('空/无效输入 → []', () => {
    expect(normalizeAudioUrl(undefined)).toEqual([]);
    expect(normalizeAudioUrl(null)).toEqual([]);
    expect(normalizeAudioUrl('')).toEqual([]);
    expect(normalizeAudioUrl([])).toEqual([]);
  });
});

describe('clamp helpers', () => {
  it('clampVolume 钳制 [0,100]', () => {
    expect(clampVolume(-5)).toBe(0);
    expect(clampVolume(50)).toBe(50);
    expect(clampVolume(150)).toBe(100);
    expect(clampVolume(NaN)).toBe(0);
  });

  it('clampTime 钳制 [0,total]', () => {
    expect(clampTime(-1, 100)).toBe(0);
    expect(clampTime(50, 100)).toBe(50);
    expect(clampTime(200, 100)).toBe(100);
  });
});

describe('createAudioPlayer — statusClick 播放/暂停', () => {
  it('切换 isPlaying 并调用 play/pause', () => {
    const { adapter, play, pause } = makeAdapter();
    const p = createAudioPlayer(adapter, { audioUrl: 'a.mp3' });
    expect(p.getState().isPlaying).toBe(false);

    p.handleStatusClick();
    expect(p.getState().isPlaying).toBe(true);
    expect(play).toHaveBeenCalledTimes(1);

    p.handleStatusClick();
    expect(p.getState().isPlaying).toBe(false);
    expect(pause).toHaveBeenCalledTimes(1);
  });
});

describe('createAudioPlayer — trackChange 上下曲边界', () => {
  it('多曲 next/prev 取模循环（对齐 Semi：末曲 next 绕回首曲、首曲 prev 绕到末曲）', () => {
    const { adapter } = makeAdapter();
    const p = createAudioPlayer(adapter, { audioUrl: ['a.mp3', 'b.mp3', 'c.mp3'] });
    expect(p.isMultiTrack()).toBe(true);
    expect(p.getState().currentTrackIndex).toBe(0);

    // 首曲 prev 绕到末曲（(0-1+3)%3=2，对齐 Semi）
    p.handleTrackChange('prev');
    expect(p.getState().currentTrackIndex).toBe(2);

    p.handleTrackChange('next'); // (2+1)%3=0 绕回首曲
    expect(p.getState().currentTrackIndex).toBe(0);
    p.handleTrackChange('next');
    expect(p.getState().currentTrackIndex).toBe(1);
    p.handleTrackChange('next');
    expect(p.getState().currentTrackIndex).toBe(2);

    // 末曲 next 绕回首曲（(2+1)%3=0）
    p.handleTrackChange('next');
    expect(p.getState().currentTrackIndex).toBe(0);
  });

  it('切曲重置进度', () => {
    const { adapter } = makeAdapter();
    const p = createAudioPlayer(adapter, { audioUrl: ['a.mp3', 'b.mp3'] });
    p.handleTimeChange(30);
    expect(p.getState().currentTime).toBe(30);
    p.handleTrackChange('next');
    expect(p.getState().currentTime).toBe(0);
    expect(p.getState().totalTime).toBe(0);
  });

  it('单曲 trackChange no-op', () => {
    const { adapter } = makeAdapter();
    const p = createAudioPlayer(adapter, { audioUrl: 'a.mp3' });
    expect(p.isMultiTrack()).toBe(false);
    p.handleTrackChange('next');
    expect(p.getState().currentTrackIndex).toBe(0);
  });
});

describe('createAudioPlayer — timeChange / seek 钳制', () => {
  it('timeChange 钳到 [0,totalTime] 并写 audio', () => {
    const { adapter, media } = makeAdapter();
    const p = createAudioPlayer(adapter, { audioUrl: 'a.mp3' });
    p.initAudioState(); // totalTime=120
    expect(p.getState().totalTime).toBe(120);

    p.handleTimeChange(50);
    expect(p.getState().currentTime).toBe(50);
    expect(media.currentTime).toBe(50);

    p.handleTimeChange(999);
    expect(p.getState().currentTime).toBe(120);

    p.handleTimeChange(-10);
    expect(p.getState().currentTime).toBe(0);
  });

  it('seek 按 skipDuration 相对跳，并钳制', () => {
    const { adapter } = makeAdapter();
    const p = createAudioPlayer(adapter, { audioUrl: 'a.mp3', skipDuration: 15 });
    p.initAudioState(); // totalTime=120
    p.handleTimeChange(30);

    p.handleSeek(1); // +15 → 45
    expect(p.getState().currentTime).toBe(45);

    p.handleSeek(-1); // -15 → 30
    expect(p.getState().currentTime).toBe(30);

    p.handleTimeChange(10);
    p.handleSeek(-1); // 10-15 → 钳到 0
    expect(p.getState().currentTime).toBe(0);
  });

  it('skipDuration 默认 10', () => {
    const { adapter } = makeAdapter();
    const p = createAudioPlayer(adapter, { audioUrl: 'a.mp3' });
    p.initAudioState();
    p.handleTimeChange(20);
    p.handleSeek(1);
    expect(p.getState().currentTime).toBe(30);
  });
});

describe('createAudioPlayer — speedChange', () => {
  it('写倍速到 audio 并存 state', () => {
    const { adapter, media } = makeAdapter();
    const p = createAudioPlayer(adapter, { audioUrl: 'a.mp3' });
    p.handleSpeedChange({ label: '2.0x', value: 2 });
    expect(media.playbackRate).toBe(2);
    expect(p.getState().playbackRate).toEqual({ label: '2.0x', value: 2 });
  });
});

describe('createAudioPlayer — refresh 重播', () => {
  it('无错误：仅 currentTime 归零，不自动播放、不改 isPlaying（对齐 Semi handleRefresh）', () => {
    const { adapter, media, play } = makeAdapter();
    const p = createAudioPlayer(adapter, { audioUrl: 'a.mp3' });
    p.handleTimeChange(60);
    p.handleRefresh();
    expect(media.currentTime).toBe(0);
    expect(p.getState().currentTime).toBe(0);
    // 对齐 Semi：不播放、不改 isPlaying（初始 false）。
    expect(p.getState().isPlaying).toBe(false);
    expect(play).not.toHaveBeenCalled();
  });

  it('错误态：调 adapter.reload() 重载并清 isError（对齐 Semi handleRefresh error 分支）', () => {
    const { adapter, media } = makeAdapter();
    const reload = vi.fn();
    // 补齐 reload（makeAdapter 可能未提供）。
    const withReload = { ...adapter, reload };
    const p = createAudioPlayer(withReload, { audioUrl: 'a.mp3' });
    p.errorHandler();
    expect(p.getState().isError).toBe(true);
    p.handleRefresh();
    expect(reload).toHaveBeenCalledTimes(1);
    expect(p.getState().isError).toBe(false);
    void media;
  });
});

describe('createAudioPlayer — volumeChange 钳制', () => {
  it('钳到 [0,100] 并写 audio（0–1）', () => {
    const { adapter, media } = makeAdapter();
    const p = createAudioPlayer(adapter, { audioUrl: 'a.mp3' });

    p.handleVolumeChange(50);
    expect(p.getState().volume).toBe(50);
    expect(media.volume).toBe(0.5);

    p.handleVolumeChange(150);
    expect(p.getState().volume).toBe(100);
    expect(media.volume).toBe(1);

    p.handleVolumeChange(-20);
    expect(p.getState().volume).toBe(0);
    expect(media.volume).toBe(0);
  });
});

describe('createAudioPlayer — endHandler（对齐 Semi）', () => {
  it('多曲未到末曲：切下一曲', () => {
    const { adapter } = makeAdapter();
    const p = createAudioPlayer(adapter, { audioUrl: ['a.mp3', 'b.mp3'] });
    p.endHandler();
    expect(p.getState().currentTrackIndex).toBe(1);
  });

  it('单曲：停止播放', () => {
    const { adapter } = makeAdapter();
    const p = createAudioPlayer(adapter, { audioUrl: 'a.mp3' });
    p.handleStatusClick();
    p.endHandler();
    expect(p.getState().isPlaying).toBe(false);
  });

  it('多曲末曲：ended 绕回首曲并续播（对齐 Semi 循环连播）', () => {
    const { adapter } = makeAdapter();
    const p = createAudioPlayer(adapter, { audioUrl: ['a.mp3', 'b.mp3'] });
    p.handleTrackChange('next'); // → 末曲 index=1
    expect(p.getState().currentTrackIndex).toBe(1);
    p.endHandler(); // 末曲 ended → (1+1)%2=0 绕回首曲
    expect(p.getState().currentTrackIndex).toBe(0);
    // handleTrackChange 设 isPlaying=true（切曲自动播放，对齐 Semi resetAudioState）。
    expect(p.getState().isPlaying).toBe(true);
  });
});

describe('createAudioPlayer — errorHandler / initAudioState / subscribe', () => {
  it('errorHandler 置 isError 并停播', () => {
    const { adapter } = makeAdapter();
    const p = createAudioPlayer(adapter, { audioUrl: 'a.mp3' });
    p.errorHandler();
    expect(p.getState().isError).toBe(true);
    expect(p.getState().isPlaying).toBe(false);
  });

  it('initAudioState 从 audio 回读时长/音量/倍速', () => {
    const { adapter } = makeAdapter({ getDuration: () => 200, getVolume: () => 0.8 });
    const p = createAudioPlayer(adapter, { audioUrl: 'a.mp3', autoPlay: true });
    p.initAudioState();
    const s = p.getState();
    expect(s.totalTime).toBe(200);
    expect(s.volume).toBe(80);
    expect(s.isPlaying).toBe(true);
  });

  it('subscribe 收到状态更新，取消后不再收到', () => {
    const { adapter } = makeAdapter();
    const p = createAudioPlayer(adapter, { audioUrl: 'a.mp3' });
    const seen: boolean[] = [];
    const unsub = p.subscribe((s) => seen.push(s.isPlaying));
    p.handleStatusClick();
    expect(seen).toEqual([true]);
    unsub();
    p.handleStatusClick();
    expect(seen).toEqual([true]);
  });
});

describe('createAudioPlayer — setAudioUrl 重置与 index 钳制', () => {
  it('换更短列表时 index 钳到末尾', () => {
    const { adapter } = makeAdapter();
    const p = createAudioPlayer(adapter, { audioUrl: ['a.mp3', 'b.mp3', 'c.mp3'] });
    p.handleTrackChange('next');
    p.handleTrackChange('next'); // index=2
    p.setAudioUrl(['x.mp3']);
    expect(p.getState().currentTrackIndex).toBe(0);
    expect(p.isMultiTrack()).toBe(false);
    expect(p.getCurrentTrack()).toEqual({ src: 'x.mp3' });
  });
});
