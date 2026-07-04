<!--
  VolumeControl — mute toggle button + a hover-reveal volume slider (0–100).
  Clicking the icon toggles mute (handleVolumeSilent at player level); the
  slider drags the volume (handleVolumeChange). Drag is imperative, like the
  progress bar. Icon reflects muted / low / high volume.
-->
<script lang="ts">
  interface Props {
    /** 0–100 */
    volume: number;
    muted: boolean;
    muteLabel: string;
    unmuteLabel: string;
    volumeLabel: string;
    onToggleMute: () => void;
    onVolumeChange: (value: number) => void;
  }

  let { volume, muted, muteLabel, unmuteLabel, volumeLabel, onToggleMute, onVolumeChange }: Props =
    $props();

  let railNode = $state<HTMLDivElement | null>(null);
  let dragging = $state(false);
  let rect: { top: number; height: number } | null = null;

  const effectiveVolume = $derived(muted ? 0 : volume);

  function valueFromPointer(clientY: number): number {
    if (!rect || rect.height <= 0) return 0;
    const offset = clientY - rect.top;
    const frac = 1 - Math.min(Math.max(offset / rect.height, 0), 1);
    return Math.round(frac * 100);
  }

  function onPointerDown(e: PointerEvent): void {
    if (!railNode) return;
    const r = railNode.getBoundingClientRect();
    rect = { top: r.top, height: r.height };
    dragging = true;
    onVolumeChange(valueFromPointer(e.clientY));
    document.addEventListener('pointermove', onDocPointerMove);
    document.addEventListener('pointerup', onDocPointerUp);
  }
  function onDocPointerMove(e: PointerEvent): void {
    if (dragging) onVolumeChange(valueFromPointer(e.clientY));
  }
  function onDocPointerUp(): void {
    dragging = false;
    rect = null;
    document.removeEventListener('pointermove', onDocPointerMove);
    document.removeEventListener('pointerup', onDocPointerUp);
  }

  function onRailKeyDown(e: KeyboardEvent): void {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      onVolumeChange(Math.min(100, effectiveVolume + 10));
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      onVolumeChange(Math.max(0, effectiveVolume - 10));
    }
  }
</script>

<div class="cd-video-player-volume">
  <button
    type="button"
    class="cd-video-player__btn cd-video-player-volume__toggle"
    aria-label={muted || effectiveVolume === 0 ? unmuteLabel : muteLabel}
    aria-pressed={muted}
    onclick={onToggleMute}
  >
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="currentColor">
      {#if muted || effectiveVolume === 0}
        <path d="M3.63 3.63a1 1 0 0 0 0 1.41L7.29 8.7 7 9H3v6h4l5 5v-6.59l4.18 4.18c-.65.49-1.38.88-2.18 1.11v2.06a8.9 8.9 0 0 0 3.61-1.75l2.15 2.15a1 1 0 0 0 1.41-1.41L5.05 3.63a1 1 0 0 0-1.42 0zM12 4 9.91 6.09 12 8.18V4z" />
      {:else if effectiveVolume < 50}
        <path d="M7 9v6h4l5 5V4l-5 5H7zm7.5 3A4.5 4.5 0 0 0 12 8v8a4.5 4.5 0 0 0 2.5-4z" />
      {:else}
        <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 8v8a4.5 4.5 0 0 0 2.5-4zM14 3.23v2.06A7 7 0 0 1 14 18.7v2.06a9 9 0 0 0 0-17.53z" />
      {/if}
    </svg>
  </button>
  <div class="cd-video-player-volume__popup">
    <div
      bind:this={railNode}
      class="cd-video-player-volume__rail"
      role="slider"
      tabindex="0"
      aria-label={volumeLabel}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={effectiveVolume}
      onpointerdown={onPointerDown}
      onkeydown={onRailKeyDown}
    >
      <div class="cd-video-player-volume__fill" style:height={`${effectiveVolume}%`}></div>
    </div>
  </div>
</div>

<style>
  .cd-video-player-volume {
    position: relative;
    display: inline-flex;
  }
  .cd-video-player-volume__popup {
    position: absolute;
    bottom: calc(100% + 8px);
    left: 50%;
    transform: translateX(-50%);
    padding: 8px;
    background: var(--cd-video-player-menu-bg, rgba(28, 31, 35, 0.9));
    border-radius: var(--cd-video-player-menu-radius, var(--cd-border-radius-medium, 6px));
    box-shadow: var(--cd-shadow-elevated, 0 4px 14px rgba(0, 0, 0, 0.35));
    opacity: 0;
    visibility: hidden;
    transition:
      opacity var(--cd-video-player-transition, 150ms) ease,
      visibility var(--cd-video-player-transition, 150ms) ease;
    z-index: 2;
  }
  .cd-video-player-volume:hover .cd-video-player-volume__popup,
  .cd-video-player-volume:focus-within .cd-video-player-volume__popup {
    opacity: 1;
    visibility: visible;
  }
  .cd-video-player-volume__rail {
    position: relative;
    width: 4px;
    height: 72px;
    background: var(--cd-video-player-progress-track, rgba(255, 255, 255, 0.3));
    border-radius: var(--cd-border-radius-full, 9999px);
    cursor: pointer;
    touch-action: none;
    outline: none;
  }
  .cd-video-player-volume__rail:focus-visible {
    box-shadow: 0 0 0 2px var(--cd-focus-ring, rgba(255, 255, 255, 0.6));
  }
  .cd-video-player-volume__fill {
    position: absolute;
    left: 0;
    bottom: 0;
    width: 100%;
    background: var(--cd-video-player-progress-played, var(--cd-color-primary));
    border-radius: var(--cd-border-radius-full, 9999px);
  }
</style>
