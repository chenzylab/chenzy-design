<!--
  Sider — collapsible side panel. Backed by headless createSider from core.
  Registers with Layout (context) so Layout switches to row direction.
  NOTE: aria-label text is hardcoded Chinese for now.
  TODO: wire to ConfigProvider locale once ConfigProvider exists.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { getContext, onMount, untrack } from 'svelte';
  import {
    createSider,
    type Breakpoint,
    type SiderOptions,
    type SiderTrigger,
  } from '@chenzy-design/core';
  import { LAYOUT_CONTEXT_KEY, type LayoutContext } from './Layout.svelte';

  interface Props {
    /** controlled collapsed value */
    collapsed?: boolean;
    defaultCollapsed?: boolean;
    collapsible?: boolean;
    width?: string | number;
    collapsedWidth?: string | number;
    breakpoint?: Breakpoint;
    reverseArrow?: boolean;
    placement?: 'left' | 'right';
    class?: string;
    onCollapse?: (collapsed: boolean, trigger: SiderTrigger) => void;
    children?: Snippet;
    /** custom trigger; receives current collapsed + toggle */
    trigger?: Snippet<[{ collapsed: boolean; toggle: () => void }]>;
  }

  let {
    collapsed,
    defaultCollapsed = false,
    collapsible = false,
    width = 200,
    collapsedWidth = 60,
    breakpoint,
    reverseArrow = false,
    placement = 'left',
    class: className = '',
    onCollapse,
    children,
    trigger,
  }: Props = $props();

  const layout = getContext<LayoutContext | undefined>(LAYOUT_CONTEXT_KEY);

  // Headless machine is created once with the initial prop values; later changes
  // to the controlled `collapsed` prop are applied via the $derived below.
  // untrack documents that we intentionally capture only the initial values here.
  const sider = untrack(() => {
    // Build options conditionally — exactOptionalPropertyTypes forbids passing
    // `undefined` for optional props typed without `| undefined`.
    const options: SiderOptions = {
      defaultCollapsed,
      onChange: (value, t) => onCollapse?.(value, t),
    };
    if (collapsed !== undefined) options.collapsed = collapsed;
    if (breakpoint !== undefined) options.breakpoint = breakpoint;
    return createSider(options);
  });

  // Tracks the headless machine's uncontrolled collapsed state.
  let internalCollapsed = $state(sider.getCollapsed());

  // Controlled `collapsed` prop always wins over the internal value.
  const collapsedState = $derived(collapsed ?? internalCollapsed);

  // Notify Layout once so it switches to row direction.
  onMount(() => {
    layout?.registerSider();
  });

  // Bridge the headless subscription/breakpoint watcher into Svelte reactivity.
  // This is the intended escape-hatch use of $effect: syncing an external store.
  $effect(() => {
    const unsubscribe = sider.subscribe((value) => {
      internalCollapsed = value;
    });
    const stopWatch = sider.watchBreakpoint();
    return () => {
      unsubscribe();
      stopWatch();
    };
  });

  function toggle(): void {
    sider.toggle();
  }

  function toCss(value: string | number): string {
    return typeof value === 'number' ? `${value}px` : value;
  }

  const widthCss = $derived(collapsedState ? toCss(collapsedWidth) : toCss(width));

  const isCollapsedToZero = $derived(
    collapsedState && (collapsedWidth === 0 || collapsedWidth === '0' || collapsedWidth === '0px'),
  );

  const cls = $derived(
    [
      'cd-layout-sider',
      `cd-layout-sider--${placement}`,
      collapsedState && 'cd-layout-sider--collapsed',
      className,
    ]
      .filter(Boolean)
      .join(' '),
  );

  const inlineStyle = $derived(`flex: 0 0 ${widthCss}; width: ${widthCss}; max-width: ${widthCss}`);

  // Arrow direction: point "outward" to expand, "inward" to collapse.
  // placement + reverseArrow flip which glyph means which.
  const pointsStart = $derived.by(() => {
    const base = placement === 'left' ? collapsedState : !collapsedState;
    return reverseArrow ? !base : base;
  });
</script>

<aside class={cls} style={inlineStyle}>
  <div
    id={sider.id}
    class="cd-layout-sider__children"
    aria-hidden={isCollapsedToZero || undefined}
  >
    {@render children?.()}
  </div>

  {#if trigger}
    {@render trigger({ collapsed: collapsedState, toggle })}
  {:else if collapsible}
    <button
      type="button"
      class="cd-layout-sider__trigger"
      aria-expanded={!collapsedState}
      aria-controls={sider.id}
      aria-label={collapsedState ? '展开侧边栏' : '收起侧边栏'}
      onclick={toggle}
    >
      <span class="cd-layout-sider__arrow" aria-hidden="true">{pointsStart ? '‹' : '›'}</span>
    </button>
  {/if}
</aside>

<style>
  .cd-layout-sider {
    position: relative;
    display: flex;
    flex-direction: column;
    min-height: 0;
    background: var(--cd-layout-sider-bg);
    transition:
      flex-basis var(--cd-layout-motion-duration) var(--cd-layout-motion-ease),
      width var(--cd-layout-motion-duration) var(--cd-layout-motion-ease),
      max-width var(--cd-layout-motion-duration) var(--cd-layout-motion-ease);
  }
  .cd-layout-sider--left {
    border-inline-end: var(--cd-layout-sider-border);
  }
  .cd-layout-sider--right {
    border-inline-start: var(--cd-layout-sider-border);
  }
  .cd-layout-sider__children {
    flex: 1;
    min-height: 0;
    overflow: hidden;
  }
  .cd-layout-sider__trigger {
    display: flex;
    flex: 0 0 auto;
    align-items: center;
    justify-content: center;
    height: var(--cd-layout-header-height);
    padding: 0;
    border: none;
    background: var(--cd-layout-sider-trigger-bg);
    color: var(--cd-layout-sider-trigger-color);
    cursor: pointer;
    transition: background-color var(--cd-layout-motion-duration) var(--cd-layout-motion-ease);
  }
  .cd-layout-sider__trigger:hover {
    background: var(--cd-layout-sider-trigger-hover-bg);
  }
  .cd-layout-sider__trigger:focus-visible {
    outline: none;
    box-shadow: var(--cd-focus-ring);
  }
  .cd-layout-sider__arrow {
    display: inline-flex;
    font-size: var(--cd-font-size-3);
    line-height: 1;
  }
  @media (prefers-reduced-motion: reduce) {
    .cd-layout-sider,
    .cd-layout-sider__trigger {
      transition: none;
    }
  }
</style>
