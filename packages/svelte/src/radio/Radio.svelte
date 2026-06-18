<!--
  Radio — see specs/components/input/Radio.spec.md
  Inside RadioGroup: role=radio via native input, roving tabindex.
  Standalone: self controlled / uncontrolled.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { useId } from '@chenzy-design/core';
  import { getRadioGroupContext, type RadioValue, type RadioSize } from './context.js';

  interface Props {
    value: RadioValue;
    checked?: boolean;
    defaultChecked?: boolean;
    disabled?: boolean;
    size?: RadioSize;
    name?: string;
    extra?: string | undefined;
    children?: Snippet;
    onChange?: (checked: boolean) => void;
  }

  let {
    value,
    checked = $bindable(),
    defaultChecked = false,
    disabled = false,
    size = 'default',
    name,
    extra,
    children,
    onChange,
  }: Props = $props();

  const group = getRadioGroupContext();

  const fieldId = useId('cd-radio-item');
  const extraId = $derived(extra ? `${fieldId}-extra` : undefined);

  const isControlled = $derived(checked !== undefined);
  let inner = $state(getInitialChecked());

  function getInitialChecked(): boolean {
    return defaultChecked;
  }

  const resolvedDisabled = $derived(disabled || (group ? group.getDisabled() : false));
  const resolvedSize = $derived(group ? group.getSize() : size);
  const resolvedName = $derived(group ? group.name : name);

  const isChecked = $derived(
    group ? group.getSelected() === value : isControlled ? !!checked : inner,
  );

  // roving tabindex: in a group only the tab stop is 0, else -1; standalone always 0
  const tabindex = $derived(group ? (group.isTabStop(value, resolvedDisabled) ? 0 : -1) : 0);

  function handleChange(e: Event & { currentTarget: HTMLInputElement }) {
    const next = e.currentTarget.checked;
    if (group) {
      group.select(value);
      onChange?.(true);
      return;
    }
    // Controlled (`checked=` / `bind:checked`): parent owns `checked`; propagate
    // only via `onChange`. Writing the prop AND firing `onChange` loops.
    // Uncontrolled: keep our own state in sync.
    if (!isControlled) inner = next;
    onChange?.(next);
  }

  function handleKeydown(e: KeyboardEvent) {
    group?.onKeydown(e, value);
  }

  /** Register this radio's input with the group for roving focus management. */
  function registerAttach(node: HTMLInputElement) {
    if (!group) return;
    // read deps so registration metadata stays current
    return group.register({ value, disabled: resolvedDisabled, el: node });
  }

  const cls = $derived(
    [
      'cd-radio',
      `cd-radio--${resolvedSize}`,
      isChecked && 'cd-radio--checked',
      resolvedDisabled && 'cd-radio--disabled',
    ]
      .filter(Boolean)
      .join(' '),
  );
</script>

<label class={cls} for={fieldId}>
  <input
    {@attach registerAttach}
    id={fieldId}
    class="cd-radio__input"
    type="radio"
    name={resolvedName}
    value={String(value)}
    checked={isChecked}
    disabled={resolvedDisabled}
    {tabindex}
    aria-describedby={extraId}
    onchange={handleChange}
    onkeydown={handleKeydown}
  />
  <span class="cd-radio__circle" aria-hidden="true"></span>
  {#if children || extra}
    <span class="cd-radio__content">
      {#if children}<span class="cd-radio__label">{@render children()}</span>{/if}
      {#if extra}<span class="cd-radio__extra" id={extraId}>{extra}</span>{/if}
    </span>
  {/if}
</label>

<style>
  .cd-radio {
    display: inline-flex;
    align-items: flex-start;
    gap: var(--cd-radio-label-gap);
    color: var(--cd-color-text-0);
    cursor: pointer;
    line-height: 1.4;
  }
  .cd-radio--disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
  .cd-radio__input {
    position: absolute;
    inline-size: 1px;
    block-size: 1px;
    padding: 0;
    margin: 0;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
    border: 0;
  }
  .cd-radio__circle {
    position: relative;
    flex: 0 0 auto;
    inline-size: var(--cd-radio-size-default);
    block-size: var(--cd-radio-size-default);
    background: var(--cd-radio-bg);
    border: 1px solid var(--cd-radio-border);
    border-radius: var(--cd-radius-full);
    transition:
      border-color var(--cd-motion-duration-fast) var(--cd-motion-ease-standard);
  }
  .cd-radio--small .cd-radio__circle {
    inline-size: var(--cd-radio-size-small);
    block-size: var(--cd-radio-size-small);
  }
  .cd-radio--large .cd-radio__circle {
    inline-size: var(--cd-radio-size-large);
    block-size: var(--cd-radio-size-large);
  }
  .cd-radio--checked .cd-radio__circle {
    border-color: var(--cd-radio-color-checked);
  }
  .cd-radio--checked .cd-radio__circle::after {
    content: '';
    position: absolute;
    inset: 50%;
    inline-size: 50%;
    block-size: 50%;
    transform: translate(-50%, -50%);
    background: var(--cd-radio-dot-color);
    border-radius: var(--cd-radius-full);
  }
  .cd-radio__input:focus-visible + .cd-radio__circle {
    outline: none;
    box-shadow: var(--cd-focus-ring);
  }
  .cd-radio__content {
    display: inline-flex;
    flex-direction: column;
    gap: var(--cd-spacing-1);
  }
  .cd-radio__extra {
    color: var(--cd-color-text-2);
    font-size: var(--cd-font-size-1);
  }
  @media (prefers-reduced-motion: reduce) {
    .cd-radio__circle {
      transition: none;
    }
  }
</style>
