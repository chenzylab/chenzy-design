<!--
  ResizeHandler — draggable separator between two ResizeItems. Registers with the
  group (context); pointerdown/keyboard delegate to the group's coupling geometry.
  role=separator + aria-orientation + aria-value* + keyboard (←→/↑↓/Home/End) +
  RTL mirroring. See specs/components/other/Resizable.spec.md §4.4 / §6.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { getContext, onMount } from 'svelte';
  import { RESIZE_GROUP_KEY, type ResizeGroupContext, type ResizeHandlerRegistration } from './context.js';
  import { useLocale } from '../locale-provider/index.js';

  interface Props {
    /** 禁用该把手。 */
    disabled?: boolean;
    /** 键盘步长（px），默认 10。 */
    keyboardStep?: number;
    /** 允许双击把手折叠/展开左（上）侧面板（本库独有增强，Semi 无内建折叠）。 */
    collapsible?: boolean;
    class?: string;
    style?: string;
    children?: Snippet;
  }

  let { disabled = false, keyboardStep = 10, collapsible = false, class: className = '', style, children }: Props = $props();

  const group = getContext<ResizeGroupContext | undefined>(RESIZE_GROUP_KEY);
  const loc = useLocale();

  let el = $state<HTMLDivElement | null>(null);
  let myId = $state(-1);

  onMount(() => {
    if (!group) return;
    const reg: ResizeHandlerRegistration = {
      id: -1,
      getEl: () => el,
      isDisabled: () => disabled,
    };
    const unregister = group.registerHandler(reg);
    myId = reg.id;
    return unregister;
  });

  const orientation = $derived<'horizontal' | 'vertical'>(
    group?.direction() === 'horizontal' ? 'vertical' : 'horizontal',
  );

  function onPointerDown(event: PointerEvent): void {
    if (disabled || event.button !== 0 || !group) return;
    group.startHandlerDrag(myId, event);
  }

  function onDblClick(): void {
    if (disabled || !collapsible || !group) return;
    group.toggleCollapse(myId);
  }

  function isRtl(): boolean {
    return typeof window !== 'undefined' && el ? getComputedStyle(el).direction === 'rtl' : false;
  }

  function onKeydown(event: KeyboardEvent): void {
    if (disabled || !group) return;
    const dir = group.direction();
    const rtl = isRtl();
    let delta = 0;
    const step = keyboardStep;
    switch (event.key) {
      case 'ArrowRight':
        if (dir === 'horizontal') delta = rtl ? -step : step;
        break;
      case 'ArrowLeft':
        if (dir === 'horizontal') delta = rtl ? step : -step;
        break;
      case 'ArrowDown':
        if (dir === 'vertical') delta = step;
        break;
      case 'ArrowUp':
        if (dir === 'vertical') delta = -step;
        break;
      case 'Home':
        delta = -1e6; // clamp shrinks last to its min
        break;
      case 'End':
        delta = 1e6;
        break;
      default:
        return;
    }
    if (delta === 0) return;
    event.preventDefault();
    group.keyboardAdjust(myId, delta, event);
  }

  function ariaNow(): number | undefined {
    if (!group || myId < 0) return undefined;
    return Math.round(group.itemSizeAround(myId).last);
  }

  const cls = $derived(
    [
      'cd-resize-handler',
      `cd-resize-handler--${group?.direction() ?? 'horizontal'}`,
      disabled && 'cd-resize-handler--disabled',
      className,
    ]
      .filter(Boolean)
      .join(' '),
  );

  const label = $derived(loc().t('Resizable.handleAriaLabel'));
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<div
  bind:this={el}
  class={cls}
  {style}
  role="separator"
  tabindex={disabled ? -1 : 0}
  aria-orientation={orientation}
  aria-label={label}
  aria-disabled={disabled || undefined}
  aria-valuenow={ariaNow()}
  onpointerdown={onPointerDown}
  ondblclick={onDblClick}
  onkeydown={onKeydown}
>
  {@render children?.()}
</div>

<style>
  .cd-resize-handler {
    position: relative;
    flex: 0 0 auto;
    box-sizing: border-box;
    touch-action: none;
    background: transparent;
    z-index: 1;
  }
  .cd-resize-handler--horizontal {
    width: max(var(--cd-resizable-handle-size), 8px);
    min-width: 8px;
    cursor: ew-resize;
    align-self: stretch;
  }
  .cd-resize-handler--vertical {
    height: max(var(--cd-resizable-handle-size), 8px);
    min-height: 8px;
    cursor: ns-resize;
    align-self: stretch;
  }
  .cd-resize-handler--disabled {
    cursor: default;
    pointer-events: none;
  }
  /* 可视线 */
  .cd-resize-handler::after {
    content: '';
    position: absolute;
    background: var(--cd-resizable-handle-color);
    transition: background-color 0.15s;
  }
  .cd-resize-handler--horizontal::after {
    top: 0;
    bottom: 0;
    left: 50%;
    width: 1px;
    transform: translateX(-50%);
  }
  .cd-resize-handler--vertical::after {
    left: 0;
    right: 0;
    top: 50%;
    height: 1px;
    transform: translateY(-50%);
  }
  .cd-resize-handler:not(.cd-resize-handler--disabled):hover::after {
    background: var(--cd-resizable-handle-color-hover);
  }
  .cd-resize-handler:focus-visible {
    outline: none;
  }
  .cd-resize-handler:focus-visible::after {
    background: var(--cd-resizable-handle-color-focus);
    box-shadow: 0 0 0 2px var(--cd-resizable-handle-color-focus);
  }
  @media (prefers-reduced-motion: reduce) {
    .cd-resize-handler::after {
      transition: none;
    }
  }
</style>
