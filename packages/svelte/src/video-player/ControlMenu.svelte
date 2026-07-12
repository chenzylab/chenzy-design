<!--
  ControlMenu — a small glass popup menu used by the playback-rate / quality /
  route controls. A trigger button toggles a list of {label,value} options;
  the current option is marked. Closes on outside-click / Escape / selection.
  APG-ish menu button: aria-haspopup, aria-expanded, arrow-key roving.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';

  // Non-generic on purpose: Svelte generic components leak the private `Props`
  // type through the emitted d.ts. Rate values are numbers, quality/route are
  // strings; a `string | number` value covers both. The caller's onSelect
  // narrows via its own option type.
  type MenuValue = string | number;
  interface Option {
    label: string;
    value: MenuValue;
  }

  interface Props {
    options: readonly Option[];
    current: MenuValue | undefined;
    /** accessible name for the trigger + menu */
    label: string;
    /** trigger content (label text of the current selection) */
    trigger: Snippet;
    onSelect: (option: Option) => void;
  }

  let { options, current, label, trigger, onSelect }: Props = $props();

  let open = $state(false);
  let rootNode = $state<HTMLDivElement | null>(null);
  let activeIndex = $state(-1);

  function close(): void {
    open = false;
    activeIndex = -1;
  }
  function toggle(): void {
    open = !open;
    if (open) {
      const idx = options.findIndex((o) => o.value === current);
      activeIndex = idx >= 0 ? idx : 0;
    } else {
      activeIndex = -1;
    }
  }
  function select(o: Option): void {
    onSelect(o);
    close();
  }

  function onDocPointerDown(e: PointerEvent): void {
    if (rootNode && !rootNode.contains(e.target as Node)) close();
  }

  $effect(() => {
    if (!open) return;
    document.addEventListener('pointerdown', onDocPointerDown, true);
    return () => document.removeEventListener('pointerdown', onDocPointerDown, true);
  });

  function onTriggerKeyDown(e: KeyboardEvent): void {
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      if (!open) toggle();
    } else if (e.key === 'Escape') {
      close();
    }
  }

  function onMenuKeyDown(e: KeyboardEvent): void {
    if (e.key === 'Escape') {
      e.preventDefault();
      close();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      activeIndex = (activeIndex + 1) % options.length;
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      activeIndex = (activeIndex - 1 + options.length) % options.length;
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const o = options[activeIndex];
      if (o) select(o);
    }
  }
</script>

<div bind:this={rootNode} class="cd-video-player-menu">
  <button
    type="button"
    class="cd-video-player__btn cd-video-player-menu__trigger"
    aria-haspopup="menu"
    aria-expanded={open}
    aria-label={label}
    onclick={toggle}
    onkeydown={onTriggerKeyDown}
  >
    {@render trigger()}
  </button>
  {#if open}
    <ul
      class="cd-video-player-menu__list"
      role="menu"
      aria-label={label}
      tabindex="-1"
      onkeydown={onMenuKeyDown}
    >
      {#each options as o, i (o.value)}
        <li role="none">
          <button
            type="button"
            role="menuitemradio"
            aria-checked={o.value === current}
            class="cd-video-player-menu__item"
            class:cd-video-player-menu__item--active={o.value === current}
            class:cd-video-player-menu__item--focus={i === activeIndex}
            onclick={() => select(o)}
          >
            {o.label}
          </button>
        </li>
      {/each}
    </ul>
  {/if}
</div>

<style>
  .cd-video-player-menu {
    position: relative;
    display: inline-flex;
  }
  .cd-video-player-menu__list {
    position: absolute;
    bottom: calc(100% + 8px);
    left: 50%;
    transform: translateX(-50%);
    margin: 0;
    padding: 4px;
    list-style: none;
    min-width: 88px;
    background: var(--cd-video-player-menu-bg, rgba(28, 31, 35, 0.9));
    border-radius: var(--cd-video-player-menu-radius, var(--cd-border-radius-medium, 6px));
    box-shadow: var(--cd-shadow-elevated, 0 4px 14px rgba(0, 0, 0, 0.35));
    z-index: 2;
  }
  .cd-video-player-menu__item {
    display: block;
    width: 100%;
    padding: 6px 12px;
    border: none;
    background: transparent;
    color: var(--cd-video-player-menu-item-color, var(--cd-color-white));
    font-size: var(--cd-font-size-regular, 14px);
    text-align: center;
    white-space: nowrap;
    cursor: pointer;
    border-radius: var(--cd-border-radius-small, 3px);
    transition: background var(--cd-video-player-transition, 150ms) ease;
  }
  .cd-video-player-menu__item:hover,
  .cd-video-player-menu__item--focus {
    background: var(--cd-video-player-menu-item-bg-hover, rgba(255, 255, 255, 0.12));
  }
  .cd-video-player-menu__item--active {
    color: var(--cd-video-player-menu-item-color-active, var(--cd-color-primary));
  }
  .cd-video-player-menu__item:focus-visible {
    outline: 2px solid var(--cd-focus-ring, rgba(255, 255, 255, 0.6));
    outline-offset: -2px;
  }
</style>
