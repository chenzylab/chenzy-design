<!--
  VideoProgress — the seek bar with buffered / played overlays + chapter markers.
  Ported from Semi's VideoProgressFoundation: pointer X → fraction of the rail
  rect → time value, dispatched via onChange. Dragging is IMPERATIVE (rect read
  once on pointerdown into a plain var; document pointermove/up added by hand),
  matching the Slider component to avoid reactive re-subscribe loops.
  See specs Semi videoPlayer.progressFoundation.js.
-->
<script lang="ts">
  import { progressValueFromPointer, segmentValueWidth, buildMarkerSegments, type VideoMarker } from '@chenzy-design/core';

  interface Props {
    /** current playback time (seconds) */
    value: number;
    /** buffered end (seconds) */
    buffered: number;
    /** total duration (seconds) */
    max: number;
    markers?: VideoMarker[];
    ariaLabel: string;
    /** fired continuously while seeking with the new time */
    onChange: (value: number) => void;
  }

  let { value, buffered, max, markers = [], ariaLabel, onChange }: Props = $props();

  let railNode = $state<HTMLDivElement | null>(null);
  let dragging = $state(false);
  // rail rect captured once at pointerdown (imperative, non-reactive)
  let rect: { left: number; width: number } | null = null;

  // media duration is NaN until metadata loads; treat as 0 so aria values and
  // fraction math stay finite/valid.
  const safeMax = $derived(Number.isFinite(max) && max > 0 ? max : 0);
  const safeValue = $derived(Number.isFinite(value) ? value : 0);
  const safeBuffered = $derived(Number.isFinite(buffered) ? buffered : 0);
  const segments = $derived(buildMarkerSegments(markers, safeMax));

  function commitFromPointer(clientX: number): void {
    if (!rect) return;
    const { value: v } = progressValueFromPointer(clientX, rect, safeMax);
    if (!Number.isNaN(v)) onChange(v);
  }

  function onPointerDown(e: PointerEvent): void {
    if (!railNode || safeMax <= 0) return;
    const r = railNode.getBoundingClientRect();
    rect = { left: r.left, width: r.width };
    dragging = true;
    commitFromPointer(e.clientX);
    document.addEventListener('pointermove', onDocPointerMove);
    document.addEventListener('pointerup', onDocPointerUp);
  }

  function onDocPointerMove(e: PointerEvent): void {
    if (dragging) commitFromPointer(e.clientX);
  }

  function onDocPointerUp(): void {
    dragging = false;
    rect = null;
    document.removeEventListener('pointermove', onDocPointerMove);
    document.removeEventListener('pointerup', onDocPointerUp);
  }

  // keyboard seek handled at player level (←/→); here support Home/End on the
  // focusable rail for direct APG slider affordance without changing Semi's
  // player-level arrow behavior.
  function onKeyDown(e: KeyboardEvent): void {
    if (safeMax <= 0) return;
    if (e.key === 'Home') {
      e.preventDefault();
      onChange(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      onChange(safeMax);
    }
  }
</script>

<div
  bind:this={railNode}
  class="cd-video-player-progress"
  class:cd-video-player-progress--active={dragging}
  role="slider"
  tabindex="0"
  aria-label={ariaLabel}
  aria-valuemin={0}
  aria-valuemax={Math.round(safeMax)}
  aria-valuenow={Math.round(safeValue)}
  onpointerdown={onPointerDown}
  onkeydown={onKeyDown}
>
  <div class="cd-video-player-progress__track">
    {#each segments as seg, i (i)}
      <div class="cd-video-player-progress__segment">
        <div
          class="cd-video-player-progress__buffered"
          style:width={segmentValueWidth(seg, safeBuffered)}
        ></div>
        <div
          class="cd-video-player-progress__played"
          style:width={segmentValueWidth(seg, safeValue)}
        ></div>
      </div>
    {/each}
  </div>
  <!-- chapter markers -->
  {#if markers.length > 0 && safeMax > 0}
    {#each markers as m, i (i)}
      <span
        class="cd-video-player-progress__marker"
        style:left={`${Math.min(Math.max(m.start / safeMax, 0), 1) * 100}%`}
        title={m.title}
        aria-hidden="true"
      ></span>
    {/each}
  {/if}
  <!-- drag handle -->
  <span
    class="cd-video-player-progress__handle"
    style:left={`${safeMax > 0 ? Math.min(Math.max(safeValue / safeMax, 0), 1) * 100 : 0}%`}
    aria-hidden="true"
  ></span>
</div>

<style>
  .cd-video-player-progress {
    position: relative;
    width: 100%;
    height: var(--cd-video-player-handle-size, 12px);
    display: flex;
    align-items: center;
    cursor: pointer;
    touch-action: none;
    outline: none;
  }
  .cd-video-player-progress__track {
    position: relative;
    width: 100%;
    height: var(--cd-video-player-progress-height, 4px);
    display: flex;
    gap: 2px;
    border-radius: var(--cd-border-radius-full, 9999px);
    transition: height var(--cd-video-player-transition, 150ms) ease;
  }
  .cd-video-player-progress--active .cd-video-player-progress__track,
  .cd-video-player-progress:hover .cd-video-player-progress__track {
    height: var(--cd-video-player-progress-height-active, 6px);
  }
  .cd-video-player-progress:focus-visible {
    box-shadow: 0 0 0 2px var(--cd-focus-ring, rgba(255, 255, 255, 0.6));
    border-radius: var(--cd-border-radius-full, 9999px);
  }
  .cd-video-player-progress__segment {
    position: relative;
    flex: 1 1 auto;
    height: 100%;
    background: var(--cd-video-player-progress-track, rgba(255, 255, 255, 0.3));
    border-radius: var(--cd-border-radius-full, 9999px);
    overflow: hidden;
  }
  .cd-video-player-progress__buffered,
  .cd-video-player-progress__played {
    position: absolute;
    inset: 0 auto 0 0;
    height: 100%;
    border-radius: var(--cd-border-radius-full, 9999px);
  }
  .cd-video-player-progress__buffered {
    background: var(--cd-video-player-progress-buffered, rgba(255, 255, 255, 0.5));
  }
  .cd-video-player-progress__played {
    background: var(--cd-video-player-progress-played, var(--cd-color-primary));
  }
  .cd-video-player-progress__marker {
    position: absolute;
    top: 50%;
    width: 2px;
    height: 8px;
    transform: translate(-50%, -50%);
    background: var(--cd-video-player-marker-color, rgba(255, 255, 255, 0.85));
    border-radius: 1px;
    pointer-events: none;
  }
  .cd-video-player-progress__handle {
    position: absolute;
    top: 50%;
    width: var(--cd-video-player-handle-size, 12px);
    height: var(--cd-video-player-handle-size, 12px);
    transform: translate(-50%, -50%);
    background: var(--cd-video-player-progress-handle, var(--cd-color-white));
    border-radius: var(--cd-border-radius-circle, 50%);
    opacity: 0;
    transition: opacity var(--cd-video-player-transition, 150ms) ease;
    pointer-events: none;
  }
  .cd-video-player-progress:hover .cd-video-player-progress__handle,
  .cd-video-player-progress--active .cd-video-player-progress__handle,
  .cd-video-player-progress:focus-visible .cd-video-player-progress__handle {
    opacity: 1;
  }
</style>
