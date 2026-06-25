<!--
  RadioGroup — see specs/components/input/Radio.spec.md
  WAI-ARIA radiogroup pattern: roving tabindex + arrow-key navigation.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { useId } from '@chenzy-design/core';
  import Radio from './Radio.svelte';
  import {
    setRadioGroupContext,
    type RadioValue,
    type RadioSize,
    type RadioStatus,
    type RadioType,
    type RadioRegistration,
  } from './context.js';

  type OptionObject = { label: string; value: RadioValue; disabled?: boolean; extra?: string };

  interface Props {
    value?: RadioValue;
    defaultValue?: RadioValue;
    name?: string;
    options?: OptionObject[];
    disabled?: boolean;
    size?: RadioSize;
    status?: RadioStatus;
    type?: RadioType;
    direction?: 'horizontal' | 'vertical';
    onChange?: (v: RadioValue) => void;
    children?: Snippet;
    ariaLabel?: string;
  }

  let {
    value = $bindable(),
    defaultValue,
    name,
    options,
    disabled = false,
    size = 'default',
    status = 'default',
    type = 'default',
    direction = 'horizontal',
    onChange,
    children,
    ariaLabel,
  }: Props = $props();

  let rootEl = $state<HTMLDivElement | null>(null);

  const groupName = resolveName();

  function resolveName(): string {
    return name ?? useId('cd-radio');
  }

  const isControlled = $derived(value !== undefined);
  let inner = $state<RadioValue | undefined>(getInitialValue());

  function getInitialValue(): RadioValue | undefined {
    return defaultValue;
  }

  const selected = $derived(isControlled ? value : inner);

  // Insertion-ordered registry of radios (matches DOM order). PLAIN (non-reactive)
  // on purpose: radios push to it while mounting. It is read ONLY inside keyboard
  // event handlers (moveTo) — never during render — so registration never feeds
  // back into a render-read. This is what keeps the component loop-free
  // (effect_update_depth_exceeded comes from render reading state that mount writes).
  const registry: RadioRegistration[] = [];

  function select(v: RadioValue) {
    if (disabled) return;
    // Controlled (`value=` / `bind:value`): parent owns `value`; propagate only
    // via `onChange`. Writing the prop AND firing `onChange` loops.
    // Uncontrolled: keep our own state in sync.
    if (!isControlled) inner = v;
    onChange?.(v);
  }

  function register(reg: RadioRegistration): () => void {
    registry.push(reg);
    return () => {
      const i = registry.indexOf(reg);
      if (i !== -1) registry.splice(i, 1);
    };
  }

  // Roving tabindex tab stop, computed from `selected` ALONE (no registry read
  // during render → no loop). Per WAI-ARIA APG: when a radio is selected it owns
  // the tab stop; when nothing is selected every radio is reachable by Tab
  // (tabindex=0) and Arrow keys then select one. `selected` is the only reactive
  // input, so this is render-safe.
  function isTabStop(v: RadioValue, radioDisabled: boolean): boolean {
    if (radioDisabled || disabled) return false;
    if (selected === undefined) return true; // none selected → all are tab stops
    return v === selected;
  }

  function moveTo(index: number) {
    const enabled = registry.filter((r) => !r.disabled);
    if (enabled.length === 0) return;
    const target = enabled[(index + enabled.length) % enabled.length];
    if (!target) return;
    select(target.value);
    target.el.focus();
  }

  function onKeydown(e: KeyboardEvent, current: RadioValue) {
    if (disabled) return;
    const enabled = registry.filter((r) => !r.disabled);
    const idx = enabled.findIndex((r) => r.value === current);
    if (idx === -1) return;
    // RTL：水平方向键语义翻转（左右镜像）。读 getComputedStyle 仅在事件里，render 不依赖。
    const rtl =
      rootEl != null && getComputedStyle(rootEl).direction === 'rtl';
    let key = e.key;
    if (rtl && key === 'ArrowRight') key = 'ArrowLeft';
    else if (rtl && key === 'ArrowLeft') key = 'ArrowRight';
    switch (key) {
      case 'ArrowDown':
      case 'ArrowRight':
        e.preventDefault();
        moveTo(idx + 1);
        break;
      case 'ArrowUp':
      case 'ArrowLeft':
        e.preventDefault();
        moveTo(idx - 1);
        break;
      case 'Home':
        e.preventDefault();
        moveTo(0);
        break;
      case 'End':
        e.preventDefault();
        moveTo(enabled.length - 1);
        break;
      default:
        break;
    }
  }

  setRadioGroupContext({
    name: groupName,
    getSelected: () => selected,
    getDisabled: () => disabled,
    getSize: () => size,
    getStatus: () => status,
    getType: () => type,
    select,
    register,
    onKeydown,
    isTabStop,
  });

  const cls = $derived(
    `cd-radio-group cd-radio-group--${direction} cd-radio-group--${type}`,
  );
</script>

<div
  class={cls}
  bind:this={rootEl}
  role="radiogroup"
  aria-label={ariaLabel}
  aria-invalid={status === 'error' ? 'true' : undefined}
>
  {#if options}
    {#each options as opt (opt.value)}
      <Radio value={opt.value} disabled={opt.disabled ?? false} extra={opt.extra}>{opt.label}</Radio
      >
    {/each}
  {:else}
    {@render children?.()}
  {/if}
</div>

<style>
  .cd-radio-group {
    display: inline-flex;
    gap: var(--cd-spacing-4);
  }
  .cd-radio-group--horizontal {
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
  }
  .cd-radio-group--vertical {
    flex-direction: column;
    align-items: flex-start;
  }
</style>
