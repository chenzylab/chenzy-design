<!--
  AudioPlayer — 基于原生 <audio> 的音频播放器，严格对齐 Semi AudioPlayer（无第三方媒体库）。
  DOM 单行布局镜像 Semi：div.cd-audio-player.-{theme} > <audio> + control(播放) + info(封面/标题/进度)
  + toolbar(音量/快退/快进/倍速/刷新)。复用 Button/Dropdown/Popover/Tooltip/Image + 具名图标。
  headless 逻辑在 @chenzy-design/core createAudioPlayer（对齐 Semi foundation + adapter 行为）。

  ⚠️ 红线（对齐项目教训）：
    - core state 由 subscribe 写入本地 $state 快照，render 期只读；不在 render 期读 DOM/调 headless。
    - 事件监听在 $effect 内命令式 add/removeEventListener，cleanup 注销。
    - src 切换独立 effect，与状态订阅分离，避免自循环。
  静音行为严格照搬 Semi handleVolumeSilent：0↔50%（不记忆原音量）。
  rateOptions 5 档 0.5/0.75/1.0/1.5/2.0 硬编码（对齐 Semi，无 prop 可配）。
-->
<script lang="ts">
  import {
    createAudioPlayer,
    normalizeAudioUrl,
    type AudioUrl,
    type AudioPlayerApi,
    type AudioPlayerState,
    type AudioPlayerAdapter,
    type PlaybackRate,
  } from '@chenzy-design/core';
  import {
    IconAlertCircle,
    IconBackward,
    IconFastForward,
    IconPause,
    IconPlay,
    IconRefresh,
    IconRestart,
    IconVolume2,
    IconVolumnSilent,
  } from '@chenzy-design/icons';
  import { useLocale } from '../locale-provider/index.js';
  import Button from '../button/Button.svelte';
  import Dropdown from '../dropdown/Dropdown.svelte';
  import DropdownMenu from '../dropdown/DropdownMenu.svelte';
  import DropdownItem from '../dropdown/DropdownItem.svelte';
  import Popover from '../popover/Popover.svelte';
  import Tooltip from '../tooltip/Tooltip.svelte';
  import Image from '../image/Image.svelte';
  import AudioSlider from './AudioSlider.svelte';

  interface Props {
    /** 音频地址（对齐 Semi 四形态：string | string[] | AudioInfo | AudioInfo[]）。 */
    audioUrl?: AudioUrl;
    /** 自动播放（对齐 Semi，默认 false）。 */
    autoPlay?: boolean;
    /** 是否显示工具栏（对齐 Semi，默认 true）。 */
    showToolbar?: boolean;
    /** 快进/快退步长（秒），对齐 Semi 默认 10。 */
    skipDuration?: number;
    /** 主题（对齐 Semi，默认 dark）。 */
    theme?: 'dark' | 'light';
    /** 根节点类名（对齐 Semi className）。 */
    class?: string;
    /** 根节点内联样式（对齐 Semi style）。 */
    style?: string;
  }

  let {
    audioUrl,
    autoPlay = false,
    showToolbar = true,
    skipDuration = 10,
    theme = 'dark',
    class: className = '',
    style = '',
  }: Props = $props();

  const loc = useLocale();

  // 倍速档位（对齐 Semi rateOptions 5 档，硬编码）。
  const rateOptions: PlaybackRate[] = [
    { label: '0.5x', value: 0.5 },
    { label: '0.75x', value: 0.75 },
    { label: '1.0x', value: 1 },
    { label: '1.5x', value: 1.5 },
    { label: '2.0x', value: 2 },
  ];

  // 归一化曲目（纯函数）。
  const tracks = $derived(normalizeAudioUrl(audioUrl));
  const isAudioUrlArray = $derived(Array.isArray(audioUrl));

  let audioEl = $state<HTMLAudioElement | undefined>(undefined);
  let api: AudioPlayerApi | undefined;

  // core 状态快照，render 期只读。
  let snapshot = $state<AudioPlayerState>({
    isPlaying: false,
    currentTime: 0,
    totalTime: 0,
    volume: 100,
    playbackRate: { label: '1.0x', value: 1 },
    currentTrackIndex: 0,
    isError: false,
  });

  const currentTrack = $derived(tracks[snapshot.currentTrackIndex]);
  const isVolumeSilent = $derived(snapshot.volume === 0);

  /** 命令式 adapter：无元素时 no-op（SSR/未挂载）。 */
  function makeAdapter(): AudioPlayerAdapter {
    return {
      play() {
        void audioEl?.play().catch(() => {});
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
      reload: () => audioEl?.load(),
    };
  }

  // 挂载：创建 headless + 订阅 + 注册原生事件（对齐 Semi adapter.init 绑 loadedmetadata/error/ended）。
  $effect(() => {
    const el = audioEl;
    if (!el) return;
    const player = createAudioPlayer(makeAdapter(), { audioUrl, autoPlay, skipDuration });
    api = player;
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

  // audioUrl prop 变化：同步进 headless（重置曲目与进度）。独立 effect。
  $effect(() => {
    const url = audioUrl;
    if (api) api.setAudioUrl(url);
  });

  // 当前曲 src 切换：写 audio.src + load()；isPlaying 时续播（对齐 Semi 切曲自动播放）。
  $effect(() => {
    const el = audioEl;
    const src = currentTrack?.src;
    if (!el || !src) return;
    if (el.getAttribute('src') !== src) {
      el.setAttribute('src', src);
      el.load();
      if (snapshot.isPlaying) void el.play().catch(() => {});
    }
  });

  // isError 变化触发重载（对齐 Semi handleRefresh error 分支的 audio.load()）。
  $effect(() => {
    if (!snapshot.isError && api) {
      // core handleRefresh 已在 error 时调 adapter.reload()，此处无需额外处理。
    }
  });

  const rootClass = $derived(
    ['cd-audio-player', `cd-audio-player-${theme}`, className].filter(Boolean).join(' '),
  );

  // 秒 → m:ss（对齐 Semi utils.formatTime，无小时/NaN 保护——严格照搬）。
  function formatTime(time: number): string {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  // —— 事件桥接到 headless（命令式）——
  const onStatusClick = () => api?.handleStatusClick();
  const onPrev = () => api?.handleTrackChange('prev');
  const onNext = () => api?.handleTrackChange('next');
  const onTimeChange = (v: number) => api?.handleTimeChange(v);
  const onSeek = (d: number) => api?.handleSeek(d);
  const onRefresh = () => api?.handleRefresh();
  const onSpeedChange = (r: PlaybackRate) => api?.handleSpeedChange(r);
  const onVolumeChange = (v: number) => api?.handleVolumeChange(v);

  // 静音切换（严格照搬 Semi handleVolumeSilent：0↔50%，不记忆原音量）。
  function onVolumeSilent(): void {
    api?.handleVolumeChange(snapshot.volume === 0 ? 50 : 0);
  }

  const backwardLabel = $derived(
    loc().t('AudioPlayer.backward').replace('{seconds}', String(skipDuration)),
  );
  const forwardLabel = $derived(
    loc().t('AudioPlayer.forward').replace('{seconds}', String(skipDuration)),
  );
</script>

<div class={rootClass} style={style || undefined}>
  <!-- 原生 audio（无 controls，UI 全走自建）。src 由 effect 命令式写入。 -->
  <!-- svelte-ignore a11y_media_has_caption -->
  <audio bind:this={audioEl} autoplay={autoPlay} preload="metadata"></audio>

  <!-- renderControl：上一曲 + 播放/暂停 + 下一曲 -->
  <div class="cd-audio-player-control">
    {#if isAudioUrlArray}
      <Tooltip content={loc().t('AudioPlayer.prev')} showArrow={false}>
        <span>
          <Button
            size="large"
            style="border-radius:50%;background:transparent"
            onclick={onPrev}
          >
            {#snippet icon()}<IconRestart size="large" class="cd-audio-player-control-button-icon"
              />{/snippet}
          </Button>
        </span>
      </Tooltip>
    {/if}

    <Button
      size="large"
      disabled={snapshot.isError}
      style="border-radius:50%"
      class={[
        'cd-audio-player-control-button-play',
        snapshot.isError && 'cd-audio-player-control-button-play-disabled',
      ]
        .filter(Boolean)
        .join(' ')}
      onclick={onStatusClick}
    >
      {#snippet icon()}
        {#if snapshot.isPlaying}<IconPause size="large" />{:else}<IconPlay
            size="large"
            style="margin-left:1px"
          />{/if}
      {/snippet}
    </Button>

    {#if isAudioUrlArray}
      <Tooltip content={loc().t('AudioPlayer.next')} showArrow={false}>
        <span>
          <Button
            size="large"
            style="border-radius:50%;background:transparent"
            onclick={onNext}
          >
            {#snippet icon()}<IconRestart
                size="large"
                rotate={180}
                class="cd-audio-player-control-button-icon"
              />{/snippet}
          </Button>
        </span>
      </Tooltip>
    {/if}
  </div>

  <!-- renderInfo：封面 + 标题 + 进度行 -->
  <div class="cd-audio-player-info-container">
    {#if currentTrack?.cover}
      <Image src={currentTrack.cover} width={50} height={50} />
    {/if}
    <div class="cd-audio-player-info">
      {#if currentTrack?.title}
        <div class="cd-audio-player-info-title">
          {currentTrack.title}
          {#if snapshot.isError}
            <div class="cd-audio-player-error">
              <IconAlertCircle size="large" />音频加载失败
            </div>
          {/if}
        </div>
      {/if}
      {#if !snapshot.isError}
        <div class="cd-audio-player-info-time">
          <span style="width:38px">{formatTime(snapshot.currentTime)}</span>
          <div class="cd-audio-player-slider-container">
            <AudioSlider
              value={snapshot.currentTime}
              max={snapshot.totalTime}
              {theme}
              ariaLabel={loc().t('AudioPlayer.progress')}
              onChange={onTimeChange}
            />
          </div>
          <span style="width:38px">{formatTime(snapshot.totalTime)}</span>
        </div>
      {/if}
    </div>
  </div>

  <!-- renderToolbar：音量 + 快退 + 快进 + 倍速 + 刷新（error 时仅刷新）-->
  {#if showToolbar}
    {#if !snapshot.isError}
      <div class="cd-audio-player-control">
        <!-- 音量 Popover -->
        <Popover>
          {#snippet content()}
            <div class="cd-audio-player-control-volume">
              <div class="cd-audio-player-control-volume-title">{snapshot.volume}%</div>
              <AudioSlider
                value={snapshot.volume}
                max={100}
                vertical
                height={120}
                {theme}
                showTooltip={false}
                ariaLabel={loc().t('AudioPlayer.volume')}
                onChange={onVolumeChange}
              />
            </div>
          {/snippet}
          <span>
            <Tooltip content={loc().t('AudioPlayer.volume')} showArrow={false}>
              <Button style="background:transparent" onclick={onVolumeSilent}>
                {#snippet icon()}
                  {#if !isVolumeSilent}<IconVolume2 class="cd-audio-player-control-button-icon"
                    />{:else}<IconVolumnSilent class="cd-audio-player-control-button-icon" />{/if}
                {/snippet}
              </Button>
            </Tooltip>
          </span>
        </Popover>

        <!-- 快退 -->
        <Tooltip content={backwardLabel} showArrow={false}>
          <span>
            <Button style="background:transparent" onclick={() => onSeek(-1)}>
              {#snippet icon()}<IconBackward class="cd-audio-player-control-button-icon"
                />{/snippet}
            </Button>
          </span>
        </Tooltip>

        <!-- 快进 -->
        <Tooltip content={forwardLabel} showArrow={false}>
          <span>
            <Button style="background:transparent" onclick={() => onSeek(1)}>
              {#snippet icon()}<IconFastForward class="cd-audio-player-control-button-icon"
                />{/snippet}
            </Button>
          </span>
        </Tooltip>

        <!-- 倍速 Dropdown（className 作用于弹层，对齐 Semi -control-speed-menu）-->
        <Dropdown className="cd-audio-player-control-speed-menu">
          {#snippet render()}
            <DropdownMenu>
              {#each rateOptions as option (option.value)}
                <DropdownItem
                  class="cd-audio-player-control-speed-menu-item"
                  active={option.value === snapshot.playbackRate.value}
                  onClick={() => onSpeedChange(option)}
                >
                  {option.label}
                </DropdownItem>
              {/each}
            </DropdownMenu>
          {/snippet}
          <!-- role=button + tabindex 让 Dropdown 附加的 aria-haspopup/expanded 合法且可键盘聚焦
               （Semi 原触发器是无 role 的 div，本库补 role 修正无障碍，视觉对齐 Semi 不变）。 -->
          <div class="cd-audio-player-control-speed" role="button" tabindex="0">
            <span>{snapshot.playbackRate.label}</span>
          </div>
        </Dropdown>

        <!-- 刷新 -->
        <Button style="background:transparent" onclick={onRefresh}>
          {#snippet icon()}<IconRefresh
              style="transform:rotateY(180deg)"
              class="cd-audio-player-control-button-icon"
            />{/snippet}
        </Button>
      </div>
    {:else}
      <div class="cd-audio-player-control">
        <Button style="background:transparent" onclick={onRefresh}>
          {#snippet icon()}<IconRefresh
              style="transform:rotateY(180deg)"
              class="cd-audio-player-control-button-icon"
            />{/snippet}
        </Button>
      </div>
    {/if}
  {/if}
</div>

<style>
  /* 严格镜像 Semi audioPlayer.scss，token 值经 --cd-color-audio-player-* 映射 Semi variables.scss。 */
  .cd-audio-player {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--cd-gap-audio-player-large);
    max-width: var(--cd-width-audio-player-max);
    height: var(--cd-height-audio-player);
    background: var(--cd-color-audio-player-background);
  }

  .cd-audio-player-control {
    display: flex;
    align-items: center;
    gap: var(--cd-gap-audio-player-medium);
  }

  .cd-audio-player :global(.cd-audio-player-control-button-icon) {
    color: var(--cd-color-audio-player-control-icon);
  }

  .cd-audio-player :global(.cd-audio-player-control-button-play) {
    background: var(--cd-color-audio-player-control-icon) !important;
    color: var(--cd-color-audio-player-control-icon-play) !important;
  }
  .cd-audio-player :global(.cd-audio-player-control-button-play-disabled) {
    background: var(--cd-color-audio-player-disabled-bg) !important;
    color: var(--cd-color-audio-player-disabled-text) !important;
  }

  .cd-audio-player-slider-container {
    width: var(--cd-width-audio-player-slider);
    height: 100%;
  }

  .cd-audio-player-info-container {
    display: flex;
    align-items: center;
    gap: var(--cd-gap-audio-player-medium);
  }

  .cd-audio-player-info {
    display: flex;
    flex-direction: column;
    gap: var(--cd-gap-audio-player-small);
  }

  .cd-audio-player-info-title {
    font-size: var(--cd-font-size-audio-player-text);
    color: var(--cd-color-audio-player-font-color);
    font-weight: 600;
    display: flex;
    align-items: center;
  }

  .cd-audio-player-info-time {
    width: 100%;
    height: var(--cd-height-audio-player-time);
    font-size: var(--cd-font-size-audio-player-text);
    color: var(--cd-color-audio-player-font-color);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--cd-gap-audio-player-small);
    user-select: none;
  }

  .cd-audio-player-control-speed {
    width: var(--cd-width-audio-player-speed);
    height: var(--cd-height-audio-player-speed);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--cd-gap-audio-player-small);
    background: var(--cd-color-audio-player-font-color-speed);
    border-radius: var(--cd-border-radius-audio-player-speed);
    font-size: var(--cd-font-size-audio-player-small);
    line-height: var(--cd-line-height-audio-player-small);
    color: var(--cd-color-grey-0);
    font-weight: 600;
    user-select: none;
    cursor: pointer;
  }

  .cd-audio-player :global(.cd-audio-player-control-speed-menu) {
    background: var(--cd-color-audio-player-font-color-speed);
    width: var(--cd-width-audio-player-speed-menu);
  }
  :global(.cd-audio-player-control-speed-menu-item) {
    color: var(--cd-color-audio-player-text-default);
  }
  :global(.cd-audio-player-control-speed-menu-item:hover) {
    background: var(--cd-color-tertiary-active) !important;
  }

  .cd-audio-player-control-volume {
    width: var(--cd-width-audio-player-volume);
    height: var(--cd-height-audio-player-volume);
    background: var(--cd-color-audio-player-font-color-speed);
    border-radius: var(--cd-border-radius-audio-player-volume);
    padding: 4px 0;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    gap: calc(var(--cd-gap-audio-player-small) * 2);
  }
  .cd-audio-player-control-volume-title {
    font-size: var(--cd-font-size-audio-player-small);
    line-height: var(--cd-line-height-audio-player-small);
    color: var(--cd-color-audio-player-text-default);
    font-weight: 600;
    user-select: none;
  }

  .cd-audio-player-error {
    display: flex;
    align-items: center;
    gap: var(--cd-gap-audio-player-small);
    margin-left: 4px;
    color: var(--cd-color-danger);
  }

  /* light 主题（镜像 Semi &-light 覆盖）。 */
  .cd-audio-player-light {
    background: var(--cd-color-audio-player-background-light);
    border: 1px solid var(--cd-color-border);
  }
  .cd-audio-player-light :global(.cd-audio-player-control-button-icon) {
    color: var(--cd-color-audio-player-control-icon-light);
  }
  .cd-audio-player-light :global(.cd-audio-player-control-button-play) {
    background: var(--cd-color-audio-player-control-icon-light) !important;
    color: var(--cd-color-audio-player-control-icon-play-light) !important;
  }
  .cd-audio-player-light :global(.cd-audio-player-control-button-play-disabled) {
    background: var(--cd-color-audio-player-light-disabled-bg) !important;
    color: var(--cd-color-audio-player-light-disabled-text) !important;
  }
  .cd-audio-player-light .cd-audio-player-info-title,
  .cd-audio-player-light .cd-audio-player-info-time {
    color: var(--cd-color-audio-player-font-color-light);
  }
  .cd-audio-player-light .cd-audio-player-control-volume-title {
    color: var(--cd-color-audio-player-light-text);
  }
  :global(.cd-audio-player-light .cd-audio-player-control-speed-menu-item) {
    color: var(--cd-color-audio-player-light-text);
  }
  :global(.cd-audio-player-light .cd-audio-player-control-speed-menu-item:hover) {
    background: var(--cd-color-audio-player-light-hover-bg) !important;
  }

  /* AudioSlider 样式（镜像 Semi .semi-audio-player-slider）。 */
  :global(.cd-audio-player-slider) {
    background: var(--cd-color-audio-player-slider-bg);
    border-radius: var(--cd-border-radius-audio-player-slider);
    position: relative;
  }
  :global(.cd-audio-player-slider-light) {
    background: var(--cd-color-audio-player-slider-bg-light);
  }
  :global(.cd-audio-player-slider-wrapper) {
    position: relative;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  :global(.cd-audio-player-slider-wrapper-vertical) {
    width: 100%;
  }
  :global(.cd-audio-player-slider-wrapper-horizontal) {
    height: 100%;
  }
  :global(.cd-audio-player-slider-vertical) {
    width: var(--cd-width-audio-player-slider-bar);
    height: 100%;
  }
  :global(.cd-audio-player-slider-horizontal) {
    width: 100%;
    height: var(--cd-width-audio-player-slider-bar);
  }
  :global(.cd-audio-player-slider-progress) {
    position: absolute;
    background: var(--cd-color-audio-player-slider-progress);
    border-radius: var(--cd-border-radius-audio-player-slider);
  }
  :global(.cd-audio-player-slider-progress-vertical) {
    bottom: 0;
  }
  :global(.cd-audio-player-slider-progress-horizontal) {
    left: 0;
  }
  :global(.cd-audio-player-slider-dot) {
    position: absolute;
    width: var(--cd-size-audio-player-slider-dot);
    height: var(--cd-size-audio-player-slider-dot);
    background: var(--cd-color-audio-player-slider-dot-bg);
    border: 1px solid var(--cd-color-primary);
    box-shadow: 0px 0px 4px 0px var(--cd-color-shadow);
    border-radius: 50%;
    transition: opacity 0.2s;
  }
</style>
