<!--
  Checkbox — see specs/components/input/Checkbox.spec.md
  Works standalone (controlled / uncontrolled) or inside CheckboxGroup via context.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { useId } from '@chenzy-design/core';
  import {
    getCheckboxGroupContext,
    type CheckboxValue,
    type CheckboxSize,
    type CheckboxType,
  } from './context.js';

  type Status = 'default' | 'warning' | 'error';

  interface Props {
    checked?: boolean;
    defaultChecked?: boolean;
    indeterminate?: boolean;
    value?: CheckboxValue;
    disabled?: boolean;
    size?: CheckboxSize;
    status?: Status;
    /** Display form. card adds border+background and expands the hit area to the whole card; pureCard is borderless. */
    type?: CheckboxType;
    name?: string;
    extra?: string | undefined;
    id?: string;
    onChange?: (checked: boolean) => void;
    children?: Snippet;
  }

  let {
    checked = $bindable(),
    defaultChecked = false,
    indeterminate = false,
    value,
    disabled = false,
    size = 'default',
    status = 'default',
    type = 'default',
    name,
    extra,
    id,
    onChange,
    children,
  }: Props = $props();

  const group = getCheckboxGroupContext();

  const fieldId = resolveId();
  const extraId = $derived(extra ? `${fieldId}-extra` : undefined);

  function resolveId(): string {
    return id ?? useId('cd-checkbox');
  }

  const isControlled = $derived(checked !== undefined);
  let inner = $state(getInitialChecked());

  function getInitialChecked(): boolean {
    return defaultChecked;
  }

  const isChecked = $derived(
    group && value !== undefined
      ? group.isChecked(value)
      : isControlled
        ? !!checked
        : inner,
  );

  const resolvedSize = $derived(group ? group.getSize() : size);
  const resolvedDisabled = $derived(disabled || (group ? group.getDisabled() : false));
  const resolvedName = $derived(name ?? group?.getName());
  // Group transparently provides `type`; a per-item non-default `type` overrides it.
  const resolvedType = $derived(type !== 'default' ? type : (group?.getType() ?? 'default'));

  function handleChange(e: Event & { currentTarget: HTMLInputElement }) {
    const next = e.currentTarget.checked;
    if (group && value !== undefined) {
      group.toggle(value);
      onChange?.(next);
      return;
    }
    // Controlled (`checked=` / `bind:checked`): parent owns `checked`; propagate
    // only via `onChange`. Writing the prop AND firing `onChange` loops.
    // Uncontrolled: keep our own state in sync.
    if (!isControlled) inner = next;
    onChange?.(next);
  }

  /** Set the indeterminate DOM property (not a reflected attribute). */
  function indeterminateAttach(node: HTMLInputElement) {
    node.indeterminate = indeterminate && !isChecked;
  }

  const cls = $derived(
    [
      'cd-checkbox',
      `cd-checkbox--${resolvedSize}`,
      `cd-checkbox--${status}`,
      resolvedType !== 'default' && `cd-checkbox--${resolvedType}`,
      isChecked && 'cd-checkbox--checked',
      indeterminate && !isChecked && 'cd-checkbox--indeterminate',
      resolvedDisabled && 'cd-checkbox--disabled',
    ]
      .filter(Boolean)
      .join(' '),
  );
</script>

<label class={cls} for={fieldId}>
  <input
    {@attach indeterminateAttach}
    id={fieldId}
    class="cd-checkbox__input"
    type="checkbox"
    name={resolvedName}
    value={value !== undefined ? String(value) : undefined}
    checked={isChecked}
    disabled={resolvedDisabled}
    aria-describedby={extraId}
    onchange={handleChange}
  />
  <span class="cd-checkbox__box" aria-hidden="true">
    {#if indeterminate && !isChecked}
      <span class="cd-checkbox__dash"></span>
    {:else if isChecked}
      <svg class="cd-checkbox__check" viewBox="0 0 16 16" focusable="false">
        <path
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M3.5 8.5 6.5 11.5 12.5 4.5"
        />
      </svg>
    {/if}
  </span>
  {#if children || extra}
    <span class="cd-checkbox__content">
      {#if children}<span class="cd-checkbox__label">{@render children()}</span>{/if}
      {#if extra}<span class="cd-checkbox__extra" id={extraId}>{extra}</span>{/if}
    </span>
  {/if}
</label>

<style>
  .cd-checkbox {
    display: inline-flex;
    align-items: flex-start;
    gap: var(--cd-checkbox-label-gap);
    color: var(--cd-color-text-0);
    cursor: pointer;
    line-height: 1.4;
  }
  .cd-checkbox--disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
  .cd-checkbox__input {
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
  .cd-checkbox__box {
    position: relative;
    flex: 0 0 auto;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    inline-size: var(--cd-checkbox-size-default);
    block-size: var(--cd-checkbox-size-default);
    background: var(--cd-checkbox-bg);
    border: 1px solid var(--cd-checkbox-border);
    border-radius: var(--cd-checkbox-radius);
    color: var(--cd-checkbox-mark-color);
    transition:
      background-color var(--cd-motion-duration-fast) var(--cd-motion-ease-standard),
      border-color var(--cd-motion-duration-fast) var(--cd-motion-ease-standard);
  }
  .cd-checkbox--small .cd-checkbox__box {
    inline-size: var(--cd-checkbox-size-small);
    block-size: var(--cd-checkbox-size-small);
  }
  .cd-checkbox--large .cd-checkbox__box {
    inline-size: var(--cd-checkbox-size-large);
    block-size: var(--cd-checkbox-size-large);
  }
  .cd-checkbox--checked .cd-checkbox__box,
  .cd-checkbox--indeterminate .cd-checkbox__box {
    background: var(--cd-checkbox-bg-checked);
    border-color: var(--cd-checkbox-border-checked);
  }
  .cd-checkbox--warning .cd-checkbox__box {
    border-color: var(--cd-color-warning);
  }
  .cd-checkbox--error .cd-checkbox__box {
    border-color: var(--cd-color-danger);
  }
  .cd-checkbox__input:focus-visible + .cd-checkbox__box {
    outline: none;
    box-shadow: var(--cd-focus-ring);
  }
  .cd-checkbox__check {
    inline-size: 80%;
    block-size: 80%;
  }
  .cd-checkbox__dash {
    inline-size: 60%;
    block-size: 2px;
    background: currentColor;
    border-radius: var(--cd-radius-full);
  }
  .cd-checkbox__content {
    display: inline-flex;
    flex-direction: column;
    gap: var(--cd-spacing-1);
  }
  .cd-checkbox__extra {
    color: var(--cd-color-text-2);
    font-size: var(--cd-font-size-1);
  }

  /* card / pureCard 形态：整张卡片即命中区，hover 抬升背景，选中描边 primary。 */
  .cd-checkbox--card,
  .cd-checkbox--pureCard {
    padding: var(--cd-checkbox-card-padding);
    border-radius: var(--cd-checkbox-card-radius);
    background: var(--cd-checkbox-card-bg);
    transition:
      background-color var(--cd-motion-duration-fast) var(--cd-motion-ease-standard),
      border-color var(--cd-motion-duration-fast) var(--cd-motion-ease-standard);
  }
  .cd-checkbox--card {
    border: 1px solid var(--cd-checkbox-card-border);
  }
  .cd-checkbox--pureCard {
    border: 1px solid transparent;
  }
  .cd-checkbox--card:hover:not(.cd-checkbox--disabled),
  .cd-checkbox--pureCard:hover:not(.cd-checkbox--disabled) {
    background: var(--cd-checkbox-card-bg-hover);
  }
  .cd-checkbox--card.cd-checkbox--checked,
  .cd-checkbox--card.cd-checkbox--indeterminate,
  .cd-checkbox--pureCard.cd-checkbox--checked,
  .cd-checkbox--pureCard.cd-checkbox--indeterminate {
    border-color: var(--cd-checkbox-card-border-checked);
  }
  .cd-checkbox--card .cd-checkbox__input:focus-visible ~ .cd-checkbox__box,
  .cd-checkbox--pureCard .cd-checkbox__input:focus-visible ~ .cd-checkbox__box {
    box-shadow: none;
  }
  .cd-checkbox--card:has(.cd-checkbox__input:focus-visible),
  .cd-checkbox--pureCard:has(.cd-checkbox__input:focus-visible) {
    outline: none;
    box-shadow: var(--cd-focus-ring);
  }

  @media (prefers-reduced-motion: reduce) {
    .cd-checkbox__box,
    .cd-checkbox--card,
    .cd-checkbox--pureCard {
      transition: none;
    }
  }
</style>
