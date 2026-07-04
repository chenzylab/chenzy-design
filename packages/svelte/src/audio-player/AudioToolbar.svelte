<!--
  AudioToolbar — AudioPlayer 的控制工具栏（对齐 Semi 自建工具栏，无第三方媒体库）。
  纯展示 + 事件回调：播放/暂停、上/下曲、快退/快进、重播、进度、时间、倍速、音量。
  自身不持有 <audio>；所有交互回调透传给父组件的 headless 控制器。
  图标内联 SVG（对齐 BackTop 做法，仓库无图标集），类名前缀 cd-。
-->
<script lang="ts">
  import type { AudioPlayerState, PlaybackRate } from '@chenzy-design/core';
  import { useLocale } from '../locale-provider/index.js';

  interface Props {
    state: AudioPlayerState;
    multiTrack: boolean;
    /** 曲目总数（用于上/下曲边界禁用）。 */
    trackCount: number;
    skipDuration: number;
    /** 倍速可选项（对齐 Semi 默认 0.5/1/1.5/2）。 */
    rates: PlaybackRate[];
    onStatusClick: () => void;
    onTrackChange: (direction: 'next' | 'prev') => void;
    onTimeChange: (value: number) => void;
    onSeek: (direction: number) => void;
    onSpeedChange: (rate: PlaybackRate) => void;
    onRefresh: () => void;
    onVolumeChange: (value: number) => void;
  }

  let {
    state,
    multiTrack,
    trackCount,
    skipDuration,
    rates,
    onStatusClick,
    onTrackChange,
    onTimeChange,
    onSeek,
    onSpeedChange,
    onRefresh,
    onVolumeChange,
  }: Props = $props();

  const loc = useLocale();

  // 首/末曲边界：禁用对应上/下曲按钮（无环绕，对齐 Semi headless 边界）。
  const atFirst = $derived(state.currentTrackIndex <= 0);
  const atLast = $derived(state.currentTrackIndex >= trackCount - 1);

  /** 秒 → m:ss。 */
  function fmt(sec: number): string {
    if (!Number.isFinite(sec) || sec < 0) sec = 0;
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  const currentLabel = $derived(fmt(state.currentTime));
  const totalLabel = $derived(fmt(state.totalTime));

  function onProgressInput(e: Event) {
    const value = Number((e.currentTarget as HTMLInputElement).value);
    onTimeChange(value);
  }

  function onVolumeInput(e: Event) {
    const value = Number((e.currentTarget as HTMLInputElement).value);
    onVolumeChange(value);
  }

  function onSpeedSelect(e: Event) {
    const value = Number((e.currentTarget as HTMLSelectElement).value);
    const rate = rates.find((r) => r.value === value) ?? rates[0];
    if (rate) onSpeedChange(rate);
  }
</script>

<div class="cd-audio-player__toolbar" class:cd-audio-player__toolbar--error={state.isError}>
  <!-- 进度条 + 时间 -->
  <div class="cd-audio-player__progress-row">
    <span class="cd-audio-player__time cd-audio-player__time--current">{currentLabel}</span>
    <input
      type="range"
      class="cd-audio-player__progress"
      min="0"
      max={state.totalTime > 0 ? state.totalTime : 0}
      step="0.1"
      value={state.currentTime}
      aria-label={loc().t('AudioPlayer.progress')}
      aria-valuemin={0}
      aria-valuemax={state.totalTime}
      aria-valuenow={state.currentTime}
      aria-valuetext={`${currentLabel} / ${totalLabel}`}
      oninput={onProgressInput}
    />
    <span class="cd-audio-player__time cd-audio-player__time--total">{totalLabel}</span>
  </div>

  <!-- 控制按钮行 -->
  <div class="cd-audio-player__controls">
    {#if multiTrack}
      <button
        type="button"
        class="cd-audio-player__btn"
        aria-label={loc().t('AudioPlayer.prev')}
        disabled={atFirst}
        onclick={() => onTrackChange('prev')}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true"
          ><path fill="currentColor" d="M6 6h2v12H6zm3.5 6 8.5 6V6z" /></svg
        >
      </button>
    {/if}

    <button
      type="button"
      class="cd-audio-player__btn"
      aria-label={loc().t('AudioPlayer.backward').replace('{seconds}', String(skipDuration))}
      onclick={() => onSeek(-1)}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true"
        ><path fill="currentColor" d="M12 5V1L7 6l5 5V7a5 5 0 1 1-5 5H5a7 7 0 1 0 7-7z" /></svg
      >
    </button>

    <button
      type="button"
      class="cd-audio-player__btn cd-audio-player__btn--status"
      aria-label={state.isPlaying ? loc().t('AudioPlayer.pause') : loc().t('AudioPlayer.play')}
      aria-pressed={state.isPlaying}
      onclick={onStatusClick}
    >
      {#if state.isPlaying}
        <svg viewBox="0 0 24 24" aria-hidden="true"
          ><path fill="currentColor" d="M6 5h4v14H6zm8 0h4v14h-4z" /></svg
        >
      {:else}
        <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M8 5v14l11-7z" /></svg>
      {/if}
    </button>

    <button
      type="button"
      class="cd-audio-player__btn"
      aria-label={loc().t('AudioPlayer.forward').replace('{seconds}', String(skipDuration))}
      onclick={() => onSeek(1)}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true"
        ><path fill="currentColor" d="M12 5V1l5 5-5 5V7a5 5 0 1 0 5 5h2a7 7 0 1 1-7-7z" /></svg
      >
    </button>

    {#if multiTrack}
      <button
        type="button"
        class="cd-audio-player__btn"
        aria-label={loc().t('AudioPlayer.next')}
        disabled={atLast}
        onclick={() => onTrackChange('next')}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true"
          ><path fill="currentColor" d="M16 6h2v12h-2zM6 6l8.5 6L6 18z" /></svg
        >
      </button>
    {/if}

    <button
      type="button"
      class="cd-audio-player__btn"
      aria-label={loc().t('AudioPlayer.refresh')}
      onclick={onRefresh}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true"
        ><path
          fill="currentColor"
          d="M12 6V3L8 7l4 4V8a4 4 0 1 1-4 4H6a6 6 0 1 0 6-6z"
        /></svg
      >
    </button>

    <!-- 倍速 -->
    <select
      class="cd-audio-player__speed"
      aria-label={loc().t('AudioPlayer.speed')}
      value={state.playbackRate.value}
      onchange={onSpeedSelect}
    >
      {#each rates as rate (rate.value)}
        <option value={rate.value}>{rate.label}</option>
      {/each}
    </select>

    <!-- 音量 -->
    <label class="cd-audio-player__volume">
      <span class="cd-sr-only">{loc().t('AudioPlayer.volume')}</span>
      <svg class="cd-audio-player__volume-icon" viewBox="0 0 24 24" aria-hidden="true"
        ><path
          fill="currentColor"
          d="M3 9v6h4l5 5V4L7 9zm13.5 3a4.5 4.5 0 0 0-2.5-4v8a4.5 4.5 0 0 0 2.5-4z"
        /></svg
      >
      <input
        type="range"
        class="cd-audio-player__volume-range"
        min="0"
        max="100"
        step="1"
        value={state.volume}
        aria-label={loc().t('AudioPlayer.volume')}
        oninput={onVolumeInput}
      />
    </label>
  </div>
</div>

<style>
  .cd-audio-player__toolbar {
    display: flex;
    flex-direction: column;
    gap: var(--cd-spacing-tight, 8px);
    inline-size: 100%;
  }

  .cd-audio-player__progress-row {
    display: flex;
    align-items: center;
    gap: var(--cd-spacing-tight, 8px);
  }

  .cd-audio-player__time {
    color: var(--cd-audio-player-time);
    font-size: var(--cd-audio-player-time-font-size);
    font-variant-numeric: tabular-nums;
    flex: 0 0 auto;
    min-inline-size: 3ch;
  }
  .cd-audio-player__time--total {
    text-align: end;
  }

  .cd-audio-player__progress {
    flex: 1 1 auto;
    block-size: var(--cd-audio-player-progress-height);
    accent-color: var(--cd-audio-player-progress-played);
    cursor: pointer;
  }

  .cd-audio-player__controls {
    display: flex;
    align-items: center;
    gap: var(--cd-spacing-extra-tight, 4px);
  }

  .cd-audio-player__btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    inline-size: 32px;
    block-size: 32px;
    padding: 0;
    border: none;
    border-radius: var(--cd-border-radius-small);
    background: transparent;
    color: var(--cd-audio-player-icon);
    cursor: pointer;
    transition: color var(--cd-audio-player-motion-duration) ease,
      background var(--cd-audio-player-motion-duration) ease;
  }
  .cd-audio-player__btn svg {
    inline-size: 20px;
    block-size: 20px;
  }
  .cd-audio-player__btn:hover:not(:disabled) {
    color: var(--cd-audio-player-icon-hover);
  }
  .cd-audio-player__btn:disabled {
    color: var(--cd-audio-player-icon-disabled);
    cursor: not-allowed;
  }
  .cd-audio-player__btn:focus-visible {
    outline: 2px solid var(--cd-audio-player-progress-played);
    outline-offset: 2px;
  }

  .cd-audio-player__btn--status svg {
    inline-size: 24px;
    block-size: 24px;
  }

  .cd-audio-player__speed {
    margin-inline-start: auto;
    block-size: 28px;
    border: 1px solid var(--cd-audio-player-border);
    border-radius: var(--cd-border-radius-small);
    background: transparent;
    color: var(--cd-audio-player-icon);
    font-size: var(--cd-audio-player-time-font-size);
    cursor: pointer;
  }

  .cd-audio-player__volume {
    display: inline-flex;
    align-items: center;
    gap: var(--cd-spacing-extra-tight, 4px);
    color: var(--cd-audio-player-icon);
  }
  .cd-audio-player__volume-icon {
    inline-size: 18px;
    block-size: 18px;
  }
  .cd-audio-player__volume-range {
    inline-size: 72px;
    accent-color: var(--cd-audio-player-progress-played);
    cursor: pointer;
  }

  @media (prefers-reduced-motion: reduce) {
    .cd-audio-player__btn {
      transition: none;
    }
  }
</style>
