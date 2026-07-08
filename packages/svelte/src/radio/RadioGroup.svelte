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
    /** 专控 type='button' 时的尺寸（对齐 Semi）；传入时优先于 size。middle→default 映射。 */
    buttonSize?: 'small' | 'middle' | 'large';
    status?: RadioStatus;
    type?: RadioType;
    direction?: 'horizontal' | 'vertical';
    onChange?: (v: RadioValue) => void;
    children?: Snippet;
    ariaLabel?: string;
    /** 关联组的可见标题元素 id（无内置标题时用，优先于 ariaLabel 体现可访问名）。 */
    ariaLabelledby?: string;
  }

  let {
    value = $bindable(),
    defaultValue,
    name,
    options,
    disabled = false,
    size = 'default',
    buttonSize,
    status = 'default',
    type = 'default',
    direction = 'horizontal',
    onChange,
    children,
    ariaLabel,
    ariaLabelledby,
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

  // buttonSize（对齐 Semi）仅在 type='button' 时生效并优先于 size；middle→default 映射。
  // 未传 buttonSize 或非 button type 时 effectiveSize === size，行为与现状字节级一致。
  const effectiveSize = $derived<RadioSize>(
    type === 'button' && buttonSize
      ? buttonSize === 'middle'
        ? 'default'
        : buttonSize
      : size,
  );

  // Insertion-ordered registry of radios (matches DOM order). PLAIN (non-reactive)
  // on purpose: radios push to it while mounting. It is read ONLY inside keyboard
  // event handlers (moveTo) — never during render — so registration never feeds
  // back into a render-read. This is what keeps the component loop-free
  // (effect_update_depth_exceeded comes from render reading state that mount writes).
  const registry: RadioRegistration[] = [];

  function select(v: RadioValue) {
    if (disabled) return;
    // `value` 是 $bindable：受控时直接写回（Svelte 5 双向绑定核心，不像 React 会 loop）。
    // 这样 `bind:value` 无需额外 onChange 即可更新；纯受控（父只传 value 不传 bind）时，
    // 父在 onChange 里重新赋 value 覆盖即可。未传 value（非受控）时维护内部 inner。
    if (isControlled) value = v;
    else inner = v;
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
    getSize: () => effectiveSize,
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
  aria-labelledby={ariaLabelledby}
  aria-label={ariaLabelledby ? undefined : ariaLabel}
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
    gap: var(--cd-spacing-radio-group-horizontal-marginright);
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
