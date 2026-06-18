<!--
  Switch — see specs/components/input/Switch.spec.md
  Native role="switch" button, controlled / uncontrolled.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';

  type Size = 'small' | 'default' | 'large';
  type Status = 'default' | 'warning' | 'error';

  interface Props {
    value?: boolean;
    defaultValue?: boolean;
    size?: Size;
    status?: Status;
    disabled?: boolean;
    loading?: boolean;
    checkedChildren?: string | Snippet;
    uncheckedChildren?: string | Snippet;
    name?: string;
    ariaLabel?: string;
    onChange?: (v: boolean) => void;
  }

  let {
    value = $bindable(),
    defaultValue = false,
    size = 'default',
    status = 'default',
    disabled = false,
    loading = false,
    checkedChildren,
    uncheckedChildren,
    name,
    ariaLabel,
    onChange,
  }: Props = $props();

  const isControlled = $derived(value !== undefined);
  let inner = $state(getInitialValue());
  const on = $derived(isControlled ? !!value : inner);

  function getInitialValue(): boolean {
    return defaultValue;
  }

  const interactable = $derived(!disabled && !loading);

  function toggle() {
    if (!interactable) return;
    const next = !on;
    // Controlled (`value=` / `bind:value`): parent owns `value`; propagate only
    // via `onChange`. Writing the prop AND firing `onChange` loops.
    // Uncontrolled: keep our own state in sync.
    if (!isControlled) inner = next;
    onChange?.(next);
  }

  const activeChildren = $derived(on ? checkedChildren : uncheckedChildren);
  const isSnippet = (c: string | Snippet | undefined): c is Snippet => typeof c === 'function';

  const cls = $derived(
    ['cd-switch', `cd-switch--${size}`, `cd-switch--${status}`, on && 'cd-switch--on']
      .filter(Boolean)
      .join(' '),
  );
</script>

<button
  type="button"
  role="switch"
  class={cls}
  aria-checked={on}
  aria-label={ariaLabel}
  aria-busy={loading || undefined}
  disabled={disabled || loading}
  onclick={toggle}
>
  {#if name}<input type="hidden" {name} value={on ? 'true' : 'false'} />{/if}
  {#if activeChildren !== undefined}
    <span class="cd-switch__label">
      {#if isSnippet(activeChildren)}{@render activeChildren()}{:else}{activeChildren}{/if}
    </span>
  {/if}
  <span class="cd-switch__knob">
    {#if loading}<span class="cd-switch__spinner" aria-hidden="true"></span>{/if}
  </span>
</button>

<style>
  .cd-switch {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: flex-start;
    inline-size: var(--cd-switch-width-default);
    block-size: var(--cd-switch-height-default);
    padding: 0;
    border: none;
    border-radius: var(--cd-switch-radius);
    background: var(--cd-switch-bg-off);
    cursor: pointer;
    transition: background-color var(--cd-motion-duration-mid) var(--cd-motion-ease-standard);
  }
  .cd-switch--small {
    inline-size: var(--cd-switch-width-small);
    block-size: var(--cd-switch-height-small);
  }
  .cd-switch--large {
    inline-size: var(--cd-switch-width-large);
    block-size: var(--cd-switch-height-large);
  }
  .cd-switch--on {
    background: var(--cd-switch-bg-on);
    justify-content: flex-end;
  }
  .cd-switch--warning.cd-switch--on {
    background: var(--cd-color-warning);
  }
  .cd-switch--error.cd-switch--on {
    background: var(--cd-color-danger);
  }
  .cd-switch:focus-visible {
    outline: none;
    box-shadow: var(--cd-focus-ring);
  }
  .cd-switch:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
  .cd-switch__knob {
    position: absolute;
    inset-block: 2px;
    inset-inline-start: 2px;
    aspect-ratio: 1;
    block-size: calc(100% - 4px);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--cd-radius-full);
    background: var(--cd-switch-knob-bg);
    transition: inset-inline-start var(--cd-motion-duration-mid) var(--cd-motion-ease-standard);
  }
  .cd-switch--on .cd-switch__knob {
    inset-inline-start: calc(100% - 2px);
    transform: translateX(-100%);
  }
  .cd-switch__label {
    color: var(--cd-color-text-inverse);
    font-size: var(--cd-font-size-1);
    line-height: 1;
    padding-inline: var(--cd-spacing-2);
  }
  .cd-switch--on .cd-switch__label {
    padding-inline-start: var(--cd-spacing-3);
    padding-inline-end: var(--cd-spacing-5);
  }
  .cd-switch__spinner {
    inline-size: 60%;
    aspect-ratio: 1;
    border: 2px solid var(--cd-color-grey-3);
    border-block-start-color: var(--cd-color-primary);
    border-radius: var(--cd-radius-full);
    animation: cd-switch-spin var(--cd-motion-duration-slow) linear infinite;
  }
  @keyframes cd-switch-spin {
    to {
      transform: rotate(360deg);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .cd-switch,
    .cd-switch__knob {
      transition: none;
    }
    .cd-switch__spinner {
      animation: none;
    }
  }
</style>
