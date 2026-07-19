/**
 * createAudioPlayer — framework-agnostic headless logic for AudioPlayer.
 *
 * 对齐 Semi `AudioPlayerFoundation`（semi-foundation/audioPlayer）——Semi 底层无第三方
 * 媒体库，纯封装原生 `<audio>` + 自建工具栏。此处把 foundation 的状态机 + 方法移植为
 * 框架无关逻辑：render 层（svelte/vue/react）通过 `AudioPlayerAdapter` 注入对 `<audio>`
 * 元素的读写（play/pause/currentTime/volume/playbackRate/load），core 只维护状态与
 * 边界钳制，不直接持有 DOM。见 specs/components/show/AudioPlayer.spec.md §3。
 *
 * 行为对齐（严格照 Semi foundation.js）：
 *  - handleStatusClick：播放 ⇄ 暂停
 *  - handleTrackChange('next'|'prev')：多曲切换（无环绕，钳制在 [0, last]）
 *  - handleTimeChange(value)：进度跳转到绝对秒（钳制 [0, totalTime]）
 *  - handleSeek(direction)：按 skipDuration 相对快进/快退（direction ∈ {1,-1}）
 *  - handleSpeedChange({label,value})：倍速
 *  - handleRefresh：重播（currentTime=0 并播放）
 *  - handleVolumeChange(value)：音量（钳制 [0,100]）
 *  - endHandler：多曲切下一曲，单曲置 isPlaying=false（对齐 Semi）
 *  - errorHandler：置 isError
 *  - resetAudioState / initAudioState：切曲/加载后重置或从 <audio> 回读
 */

/** 单条音频信息（对齐 Semi AudioInfo）。 */
export interface AudioInfo {
  /** 音频地址。 */
  src: string;
  /** 标题。 */
  title?: string;
  /** 封面图。 */
  cover?: string;
}

/** audioUrl 的四种可接受形态（对齐 Semi）。 */
export type AudioUrl = string | string[] | AudioInfo | AudioInfo[];

/** 归一化后的内部曲目（src 必有，title/cover 可空）。 */
export interface AudioTrack {
  src: string;
  title?: string;
  cover?: string;
}

/** 倍速选项（对齐 Semi handleSpeedChange 的 {label,value}）。 */
export interface PlaybackRate {
  label: string;
  value: number;
}

/**
 * render 层注入的 `<audio>` 读写适配器。core 通过它操作真实元素，自身不持有 DOM。
 * 所有方法在无元素时应安全 no-op（SSR / 尚未挂载）。
 */
export interface AudioPlayerAdapter {
  /** 调用 audio.play()（可能返回 Promise，被吞掉的 rejection 由 render 层处理）。 */
  play(): void;
  /** 调用 audio.pause()。 */
  pause(): void;
  /** 读当前播放位置（秒）。 */
  getCurrentTime(): number;
  /** 写当前播放位置（秒）。 */
  setCurrentTime(seconds: number): void;
  /** 读时长（秒）；未就绪返回 0 / NaN。 */
  getDuration(): number;
  /** 读音量（0–1）。 */
  getVolume(): number;
  /** 写音量（0–1）。 */
  setVolume(v: number): void;
  /** 读倍速。 */
  getPlaybackRate(): number;
  /** 写倍速。 */
  setPlaybackRate(v: number): void;
  /** 重新加载媒体（audio.load()）；错误态重播用。可选（老 adapter 无则 no-op）。 */
  reload?(): void;
}

/** AudioPlayer 内部状态快照（对齐 Semi foundation state）。 */
export interface AudioPlayerState {
  /** 是否正在播放。 */
  isPlaying: boolean;
  /** 当前播放位置（秒）。 */
  currentTime: number;
  /** 总时长（秒）。 */
  totalTime: number;
  /** 音量（0–100，对齐 Semi 用百分比存储）。 */
  volume: number;
  /** 倍速（label + value）。 */
  playbackRate: PlaybackRate;
  /** 当前曲目下标。 */
  currentTrackIndex: number;
  /** 是否加载/播放出错。 */
  isError: boolean;
}

export interface AudioPlayerOptions {
  /** 原始 audioUrl（四形态之一）。 */
  audioUrl?: AudioUrl | undefined;
  /** 自动播放（对齐 Semi autoPlay）。 */
  autoPlay?: boolean;
  /** 快进/快退步长（秒），对齐 Semi skipDuration，默认 10。 */
  skipDuration?: number;
}

export interface AudioPlayerApi {
  /** 当前状态快照（值语义拷贝）。 */
  getState(): AudioPlayerState;
  /** 归一化后的曲目列表。 */
  getTracks(): AudioTrack[];
  /** 当前曲目（无曲目时 undefined）。 */
  getCurrentTrack(): AudioTrack | undefined;
  /** 是否为多曲（决定工具栏是否显示上/下曲，对齐 Semi）。 */
  isMultiTrack(): boolean;
  /** 订阅状态变化；返回取消订阅。 */
  subscribe(listener: (state: AudioPlayerState) => void): () => void;
  /** 播放 ⇄ 暂停切换。 */
  handleStatusClick(): void;
  /** 上/下曲（无环绕，越界不动）。 */
  handleTrackChange(direction: 'next' | 'prev'): void;
  /** 跳转到绝对秒（钳制）。 */
  handleTimeChange(value: number): void;
  /** 相对快进/快退（direction=1 快进 skipDuration，-1 快退）。 */
  handleSeek(direction: number): void;
  /** 倍速。 */
  handleSpeedChange(value: PlaybackRate): void;
  /** 重播（回到 0 并播放）。 */
  handleRefresh(): void;
  /** 音量（0–100，钳制）。 */
  handleVolumeChange(value: number): void;
  /** timeupdate：从 <audio> 回读 currentTime。 */
  handleTimeUpdate(): void;
  /** loadedmetadata / 初始化：从 <audio> 回读 totalTime / volume / rate。 */
  initAudioState(): void;
  /** 切曲/重置：currentTime/totalTime/isError 归零，isPlaying 视情况。 */
  resetAudioState(): void;
  /** ended：多曲切下一曲，单曲停。 */
  endHandler(): void;
  /** error：置 isError。 */
  errorHandler(): void;
  /** 替换 audioUrl（外部 prop 变化时调用）。 */
  setAudioUrl(audioUrl: AudioUrl | undefined): void;
  /** 释放订阅。 */
  destroy(): void;
}

/** 把 0–100 的音量钳到合法区间。 */
export function clampVolume(value: number): number {
  if (Number.isNaN(value)) return 0;
  if (value < 0) return 0;
  if (value > 100) return 100;
  return value;
}

/** 把秒数钳到 [0, total]（total<=0 时下界 0）。 */
export function clampTime(value: number, total: number): number {
  if (Number.isNaN(value) || value < 0) return 0;
  const upper = total > 0 ? total : 0;
  if (upper > 0 && value > upper) return upper;
  return value;
}

/** 判断是否为 AudioInfo 对象（含 src 字段）。 */
function isAudioInfo(v: unknown): v is AudioInfo {
  return typeof v === 'object' && v !== null && 'src' in v && typeof (v as AudioInfo).src === 'string';
}

/**
 * 把 audioUrl 四形态（`string | string[] | AudioInfo | AudioInfo[]`）归一为曲目数组。
 * 纯函数（对齐 Semi 对 audioUrl 的多形态处理）：
 *  - 空/无效 → []
 *  - string → 单曲 [{src}]
 *  - AudioInfo → 单曲 [{src,title,cover}]
 *  - string[] → 逐条 [{src}]（丢弃空串）
 *  - AudioInfo[] → 逐条（丢弃无 src 项）
 */
export function normalizeAudioUrl(audioUrl: AudioUrl | undefined | null): AudioTrack[] {
  if (audioUrl == null) return [];
  if (typeof audioUrl === 'string') {
    return audioUrl ? [{ src: audioUrl }] : [];
  }
  if (Array.isArray(audioUrl)) {
    const out: AudioTrack[] = [];
    for (const item of audioUrl) {
      if (typeof item === 'string') {
        if (item) out.push({ src: item });
      } else if (isAudioInfo(item)) {
        out.push(toTrack(item));
      }
    }
    return out;
  }
  if (isAudioInfo(audioUrl)) {
    return [toTrack(audioUrl)];
  }
  return [];
}

function toTrack(info: AudioInfo): AudioTrack {
  const track: AudioTrack = { src: info.src };
  if (info.title !== undefined) track.title = info.title;
  if (info.cover !== undefined) track.cover = info.cover;
  return track;
}

const DEFAULT_RATE: PlaybackRate = { label: '1.0x', value: 1 };

/**
 * 创建 AudioPlayer headless 控制器。adapter 注入对 `<audio>` 的读写；
 * 在挂载前（SSR）adapter 方法应 no-op，core 仍可维护纯状态。
 */
export function createAudioPlayer(
  adapter: AudioPlayerAdapter,
  options: AudioPlayerOptions = {},
): AudioPlayerApi {
  const skipDuration = options.skipDuration ?? 10;
  const autoPlay = options.autoPlay ?? false;

  let tracks = normalizeAudioUrl(options.audioUrl);

  const state: AudioPlayerState = {
    isPlaying: autoPlay,
    currentTime: 0,
    totalTime: 0,
    volume: 100,
    playbackRate: { ...DEFAULT_RATE },
    currentTrackIndex: 0,
    isError: false,
  };

  const listeners = new Set<(s: AudioPlayerState) => void>();

  function emit(): void {
    const snapshot = getState();
    for (const l of listeners) l(snapshot);
  }

  function getState(): AudioPlayerState {
    return { ...state, playbackRate: { ...state.playbackRate } };
  }

  function isMultiTrack(): boolean {
    return tracks.length > 1;
  }

  // --- 方法（对齐 Semi foundation） ---

  function handleStatusClick(): void {
    if (state.isPlaying) {
      adapter.pause();
      state.isPlaying = false;
    } else {
      adapter.play();
      state.isPlaying = true;
    }
    emit();
  }

  function handleTrackChange(direction: 'next' | 'prev'): void {
    if (tracks.length <= 1) return;
    const len = tracks.length;
    // 取模循环（对齐 Semi handleTrackChange：next=(i+1)%len，prev=(i-1+len)%len）。
    state.currentTrackIndex =
      direction === 'next'
        ? (state.currentTrackIndex + 1) % len
        : (state.currentTrackIndex - 1 + len) % len;
    // 切曲重置进度并自动播放（对齐 Semi resetAudioState：isPlaying=true, currentTime=0, rate=1x）。
    // src 由 render 层随 index 更新后 load()，见 render 层 isPlaying 续播逻辑。
    state.currentTime = 0;
    state.totalTime = 0;
    state.isError = false;
    state.isPlaying = true;
    state.playbackRate = { ...DEFAULT_RATE };
    emit();
  }

  function handleTimeChange(value: number): void {
    const clamped = clampTime(value, state.totalTime);
    adapter.setCurrentTime(clamped);
    state.currentTime = clamped;
    emit();
  }

  function handleSeek(direction: number): void {
    const step = direction >= 0 ? skipDuration : -skipDuration;
    handleTimeChange(state.currentTime + step);
  }

  function handleSpeedChange(value: PlaybackRate): void {
    adapter.setPlaybackRate(value.value);
    state.playbackRate = { ...value };
    emit();
  }

  function handleRefresh(): void {
    // 对齐 Semi handleRefresh：error 时 audio.load() 重载（由 render 层监听 isError 触发 load）；
    // 否则仅 currentTime 归零（不自动播放、不改 isPlaying，与 Semi 一致）。
    if (state.isError) {
      adapter.reload?.();
      state.isError = false;
    } else {
      adapter.setCurrentTime(0);
      state.currentTime = 0;
    }
    emit();
  }

  function handleVolumeChange(value: number): void {
    const clamped = clampVolume(value);
    adapter.setVolume(clamped / 100);
    state.volume = clamped;
    emit();
  }

  function handleTimeUpdate(): void {
    const t = adapter.getCurrentTime();
    state.currentTime = Number.isNaN(t) ? 0 : t;
    emit();
  }

  function initAudioState(): void {
    const duration = adapter.getDuration();
    const vol = adapter.getVolume();
    const rate = adapter.getPlaybackRate();
    state.totalTime = Number.isNaN(duration) ? 0 : duration;
    state.volume = Number.isNaN(vol) ? 100 : Math.round(vol * 100);
    state.playbackRate = { label: `${rate.toFixed(1)}x`, value: rate || 1 };
    state.isPlaying = autoPlay;
    emit();
  }

  function resetAudioState(): void {
    state.currentTime = 0;
    state.totalTime = 0;
    state.isError = false;
    emit();
  }

  function endHandler(): void {
    // 对齐 Semi endHandler：数组则切下一曲（循环连播，末曲绕回首曲）；单曲则停。
    if (isMultiTrack()) {
      handleTrackChange('next');
    } else {
      state.isPlaying = false;
      emit();
    }
  }

  function errorHandler(): void {
    state.isError = true;
    state.isPlaying = false;
    emit();
  }

  function setAudioUrl(audioUrl: AudioUrl | undefined): void {
    tracks = normalizeAudioUrl(audioUrl);
    if (state.currentTrackIndex > tracks.length - 1) {
      state.currentTrackIndex = tracks.length > 0 ? tracks.length - 1 : 0;
    }
    state.currentTime = 0;
    state.totalTime = 0;
    state.isError = false;
    emit();
  }

  function destroy(): void {
    listeners.clear();
  }

  return {
    getState,
    getTracks: () => tracks.slice(),
    getCurrentTrack: () => tracks[state.currentTrackIndex],
    isMultiTrack,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    handleStatusClick,
    handleTrackChange,
    handleTimeChange,
    handleSeek,
    handleSpeedChange,
    handleRefresh,
    handleVolumeChange,
    handleTimeUpdate,
    initAudioState,
    resetAudioState,
    endHandler,
    errorHandler,
    setAudioUrl,
    destroy,
  };
}
