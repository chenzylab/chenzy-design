<!--
  AudioPlayer — 基于原生 <audio> 的音频播放器（对齐 Semi AudioPlayer，无第三方媒体库）。
  headless 逻辑在 @chenzy-design/core createAudioPlayer；本组件负责：
    - <audio bind:this> 元素 + adapter（读写 currentTime/volume/rate/play/pause）。
    - $effect 注册原生事件（timeupdate/ended/error/loadedmetadata），cleanup 注销。
    - audioUrl 四形态归一（core normalizeAudioUrl）后按 currentTrackIndex 取当前曲 src。
    - 封面/标题渲染；showToolbar 控制工具栏；theme 深/浅（默认 dark）。

  ⚠️ 红线（对齐 BackTop/项目教训）：
    - core 的 state 由 subscribe 回调写入本地 $state 快照，render 期只读该快照，绝不在
      render 期读 DOM 几何或调用 headless 方法。
    - 事件监听在 $effect 内命令式 addEventListener，cleanup removeEventListener；
      audioEl / src 变化时重绑。
    - src 切换只在「currentTrackIndex 或 tracks 变化」的独立 $effect 内写 audio.src + load()，
      不与状态订阅同一 effect，避免自循环。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import {
    createAudioPlayer,
    normalizeAudioUrl,
    type AudioUrl,
    type AudioPlayerApi,
    type AudioPlayerState,
    type AudioPlayerAdapter,
    type PlaybackRate,
  } from '@chenzy-design/core';
  import { useLocale } from '../locale-provider/index.js';
  import AudioToolbar from './AudioToolbar.svelte';

  interface Props {
    /** 音频地址（对齐 Semi 四形态：string | string[] | AudioInfo | AudioInfo[]）。 */
    audioUrl?: AudioUrl;
    /** 自动播放。 */
    autoPlay?: boolean;
    /** 主题（对齐 Semi，默认 dark）。 */
    theme?: 'dark' | 'light';
    /** 是否显示工具栏。 */
    showToolbar?: boolean;
    /** 快进/快退步长（秒）。 */
    skipDuration?: number;
    /** 倍速可选项（对齐 Semi 默认档）。 */
    rates?: PlaybackRate[];
    class?: string;
    style?: string;
    /** 完全自定义封面区（覆盖默认封面/标题）。 */
    cover?: Snippet<[{ track: { src: string; title?: string; cover?: string } | undefined }]>;
  }

  const DEFAULT_RATES: PlaybackRate[] = [
    { label: '0.5x', value: 0.5 },
    { label: '1.0x', value: 1 },
    { label: '1.5x', value: 1.5 },
    { label: '2.0x', value: 2 },
  ];

  let {
    audioUrl,
    autoPlay = false,
    theme = 'dark',
    showToolbar = true,
    skipDuration = 10,
    rates = DEFAULT_RATES,
    class: className = '',
    style = '',
    cover,
  }: Props = $props();

  const loc = useLocale();

  // 归一化曲目（纯函数，render 期只读派生）。
  const tracks = $derived(normalizeAudioUrl(audioUrl));

  // <audio> 元素引用（bind:this）。
  let audioEl = $state<HTMLAudioElement | undefined>(undefined);

  // headless 控制器实例（挂载后创建；adapter 命令式读写 audioEl）。
  let api: AudioPlayerApi | undefined;

  // 本地状态快照：由 core subscribe 写入，render 期只读（红线）。
  // 初值用字面量（不读 prop，避免 state_referenced_locally）；挂载 effect 会立即
  // 用 player.getState() 覆盖（含 autoPlay 决定的 isPlaying）。
  let snapshot = $state<AudioPlayerState>({
    isPlaying: false,
    currentTime: 0,
    totalTime: 0,
    volume: 100,
    playbackRate: { label: '1.0x', value: 1 },
    currentTrackIndex: 0,
    isError: false,
  });

  // 派生：当前曲目 / 多曲。渲染只读。
  const currentTrack = $derived(tracks[snapshot.currentTrackIndex]);
  const multiTrack = $derived(tracks.length > 1);

  /** 命令式 adapter：无元素时安全 no-op（SSR / 未挂载）。 */
  function makeAdapter(): AudioPlayerAdapter {
    return {
      play() {
        void audioEl?.play().catch(() => {
          // 自动播放被浏览器策略拒绝等：不抛，状态由 error/end 事件与用户交互纠正。
        });
      },
      pause() {
        audioEl?.pause();
      },
      getCurrentTime: () => audioEl?.currentTime ?? 0,
      setCurrentTime: (s) => {
        if (audioEl) audioEl.currentTime = s;
      },
      getDuration: () => audioEl?.duration ?? 0,
      getVolume: () => audioEl?.volume ?? 1,
      setVolume: (v) => {
        if (audioEl) audioEl.volume = v;
      },
      getPlaybackRate: () => audioEl?.playbackRate ?? 1,
      setPlaybackRate: (v) => {
        if (audioEl) audioEl.playbackRate = v;
      },
    };
  }

  // 挂载：创建 headless 控制器 + 订阅状态 + 注册原生事件。cleanup 全注销。
  // 依赖 audioEl（bind:this 挂载后赋值），元素就绪后建立。
  $effect(() => {
    const el = audioEl;
    if (!el) return;

    const player = createAudioPlayer(makeAdapter(), {
      audioUrl,
      autoPlay,
      skipDuration,
    });
    api = player;
    // 立即同步一次快照。
    snapshot = player.getState();
    const unsub = player.subscribe((s) => {
      snapshot = s;
    });

    const onTimeUpdate = () => player.handleTimeUpdate();
    const onEnded = () => player.endHandler();
    const onError = () => player.errorHandler();
    const onLoaded = () => player.initAudioState();

    el.addEventListener('timeupdate', onTimeUpdate);
    el.addEventListener('ended', onEnded);
    el.addEventListener('error', onError);
    el.addEventListener('loadedmetadata', onLoaded);

    return () => {
      el.removeEventListener('timeupdate', onTimeUpdate);
      el.removeEventListener('ended', onEnded);
      el.removeEventListener('error', onError);
      el.removeEventListener('loadedmetadata', onLoaded);
      unsub();
      player.destroy();
      api = undefined;
    };
  });

  // audioUrl prop 变化：同步进 headless（重置曲目与进度）。独立 effect（红线：与订阅分离）。
  $effect(() => {
    const url = audioUrl; // 追踪
    if (api) api.setAudioUrl(url);
  });

  // 当前曲 src 切换：写 audio.src + load()。依赖 currentTrack.src（切曲 / 换列表触发）。
  // 独立 effect，仅做命令式媒体加载，不写 headless 状态（避免自循环）。
  $effect(() => {
    const el = audioEl;
    const src = currentTrack?.src;
    if (!el || !src) return;
    if (el.getAttribute('src') !== src) {
      el.setAttribute('src', src);
      el.load();
      if (snapshot.isPlaying) {
        void el.play().catch(() => {});
      }
    }
  });

  const rootClass = $derived(
    ['cd-audio-player', `cd-audio-player--${theme}`, className].filter(Boolean).join(' '),
  );

  // 工具栏事件桥接到 headless（命令式，非 render 期）。
  const onStatusClick = () => api?.handleStatusClick();
  const onTrackChange = (d: 'next' | 'prev') => api?.handleTrackChange(d);
  const onTimeChange = (v: number) => api?.handleTimeChange(v);
  const onSeek = (d: number) => api?.handleSeek(d);
  const onSpeedChange = (r: PlaybackRate) => api?.handleSpeedChange(r);
  const onRefresh = () => api?.handleRefresh();
  const onVolumeChange = (v: number) => api?.handleVolumeChange(v);
</script>

<div class={rootClass} style={style || undefined}>
  <!-- 隐藏的原生 audio（无 controls；UI 全走自建工具栏，对齐 Semi）。纯音频无字幕轨。 -->
  <audio bind:this={audioEl} preload="metadata" autoplay={autoPlay}></audio>

  <div class="cd-audio-player__main">
    {#if cover}
      {@render cover({ track: currentTrack })}
    {:else if currentTrack?.cover}
      <img
        class="cd-audio-player__cover"
        src={currentTrack.cover}
        alt={currentTrack.title ?? ''}
      />
    {/if}

    <div class="cd-audio-player__body">
      {#if currentTrack?.title}
        <div class="cd-audio-player__title">{currentTrack.title}</div>
      {/if}

      {#if showToolbar}
        <AudioToolbar
          state={snapshot}
          {multiTrack}
          trackCount={tracks.length}
          {skipDuration}
          {rates}
          {onStatusClick}
          {onTrackChange}
          {onTimeChange}
          {onSeek}
          {onSpeedChange}
          {onRefresh}
          {onVolumeChange}
        />
      {/if}
    </div>
  </div>

  {#if snapshot.isError}
    <div class="cd-audio-player__error" role="status" aria-live="polite">
      {loc().t('AudioPlayer.error')}
    </div>
  {/if}
</div>

<style>
  .cd-audio-player {
    display: block;
    box-sizing: border-box;
    padding: var(--cd-spacing-base, 16px);
    border: 1px solid var(--cd-audio-player-border);
    border-radius: var(--cd-audio-player-radius);
    background: var(--cd-audio-player-bg);
    box-shadow: var(--cd-audio-player-shadow);
  }

  .cd-audio-player__main {
    display: flex;
    align-items: center;
    gap: var(--cd-spacing-base-tight, 12px);
  }

  .cd-audio-player__cover {
    inline-size: var(--cd-audio-player-cover-size);
    block-size: var(--cd-audio-player-cover-size);
    border-radius: var(--cd-audio-player-cover-radius);
    object-fit: cover;
    flex: 0 0 auto;
  }

  .cd-audio-player__body {
    flex: 1 1 auto;
    min-inline-size: 0;
    display: flex;
    flex-direction: column;
    gap: var(--cd-spacing-extra-tight, 4px);
  }

  .cd-audio-player__title {
    color: var(--cd-audio-player-title);
    font-weight: var(--cd-font-weight-bold, 600);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .cd-audio-player__error {
    margin-block-start: var(--cd-spacing-tight, 8px);
    color: var(--cd-color-danger, #f93920);
    font-size: var(--cd-audio-player-time-font-size);
  }
</style>
