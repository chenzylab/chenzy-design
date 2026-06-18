<!--
  InputNumber — see specs/components/input/InputNumber.spec.md
  Constrained numeric input: native <input inputmode="decimal"> + stacked steppers.
  Controlled / uncontrolled (same pattern as Input). Variation only via onChange.
-->
<script lang="ts">
  type Size = 'small' | 'default' | 'large';
  type Status = 'default' | 'warning' | 'error';

  interface Props {
    value?: number | null;
    defaultValue?: number | null;
    min?: number;
    max?: number;
    step?: number;
    shiftStep?: number;
    precision?: number;
    size?: Size;
    disabled?: boolean;
    readonly?: boolean;
    status?: Status;
    controls?: boolean;
    keyboard?: boolean;
    placeholder?: string;
    name?: string;
    ariaLabel?: string;
    onChange?: (v: number | null) => void;
  }

  let {
    value = $bindable(),
    defaultValue = null,
    min = -Infinity,
    max = Infinity,
    step = 1,
    shiftStep,
    precision,
    size = 'default',
    disabled = false,
    readonly = false,
    status = 'default',
    controls = true,
    keyboard = true,
    placeholder,
    name,
    ariaLabel,
    onChange,
  }: Props = $props();

  // Controlled when `value` prop is explicitly provided (incl. `null`).
  const isControlled = $derived(value !== undefined);
  let inner = $state<number | null>(getInitialValue());
  // Numeric source of truth (controlled value wins).
  const current = $derived(isControlled ? (value ?? null) : inner);

  // While editing, `editingText` holds the raw string the user typed (kept loose
  // so intermediate forms like "-" / "1." survive). When `null`, the field shows
  // the formatted `current` — no $effect needed, so external value changes flow
  // straight through the derived display.
  let editingText = $state<string | null>(null);
  const text = $derived(editingText ?? formatDisplay(current));

  const effectiveShiftStep = $derived(shiftStep ?? step * 10);

  function getInitialValue(): number | null {
    return defaultValue ?? null;
  }

  const atMin = $derived(current !== null && current <= min);
  const atMax = $derived(current !== null && current >= max);

  function formatDisplay(n: number | null): string {
    if (n === null || Number.isNaN(n)) return '';
    return String(n);
  }

  function parseText(t: string): number | null {
    const trimmed = t.trim();
    if (trimmed === '') return null;
    const n = Number(trimmed);
    return Number.isNaN(n) ? null : n;
  }

  function clamp(n: number): number {
    return Math.min(max, Math.max(min, n));
  }

  function applyPrecision(n: number): number {
    if (precision === undefined) return n;
    const factor = 10 ** precision;
    return Math.round(n * factor) / factor;
  }

  // Floating-point safe step using integer scaling.
  function addStep(base: number, delta: number): number {
    const decimals = Math.max(decimalsOf(base), decimalsOf(delta));
    const factor = 10 ** decimals;
    return (Math.round(base * factor) + Math.round(delta * factor)) / factor;
  }

  function decimalsOf(n: number): number {
    const s = String(n);
    const dot = s.indexOf('.');
    return dot === -1 ? 0 : s.length - dot - 1;
  }

  function commitValue(next: number | null) {
    // Controlled: never write the prop here; propagate only via onChange.
    // Uncontrolled: keep local state in sync. (Avoids the value->onChange->value loop.)
    if (!isControlled) inner = next;
    onChange?.(next);
  }

  function handleInput(e: Event & { currentTarget: HTMLInputElement }) {
    editingText = e.currentTarget.value;
  }

  function commitFromText() {
    const raw = editingText ?? formatDisplay(current);
    editingText = null;
    const parsed = parseText(raw);
    if (parsed === null) {
      if (current !== null) commitValue(null);
      return;
    }
    const normalized = clamp(applyPrecision(parsed));
    if (normalized !== current) commitValue(normalized);
  }

  function handleBlur() {
    commitFromText();
  }

  function stepBy(dir: 1 | -1, large: boolean) {
    if (disabled || readonly) return;
    const delta = (large ? effectiveShiftStep : step) * dir;
    const base = current ?? (Number.isFinite(min) ? min : 0);
    const next = clamp(applyPrecision(addStep(base, delta)));
    editingText = null;
    if (next !== current) commitValue(next);
  }

  function handleKeydown(e: KeyboardEvent) {
    if (!keyboard || disabled || readonly) return;
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      stepBy(1, e.shiftKey);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      stepBy(-1, e.shiftKey);
    } else if (e.key === 'Enter') {
      commitFromText();
    }
  }

  function preventBlurSteal(e: MouseEvent) {
    // Keep input focus when clicking stepper buttons.
    e.preventDefault();
  }

  const cls = $derived(
    [
      'cd-input-number',
      `cd-input-number--${size}`,
      `cd-input-number--${status}`,
      disabled && 'cd-input-number--disabled',
    ]
      .filter(Boolean)
      .join(' '),
  );
</script>

<div class={cls} aria-invalid={status === 'error' || undefined}>
  <input
    class="cd-input-number__native"
    type="text"
    inputmode="decimal"
    role="spinbutton"
    {name}
    {disabled}
    {readonly}
    {placeholder}
    value={text}
    aria-label={ariaLabel}
    aria-valuenow={current ?? undefined}
    aria-valuemin={Number.isFinite(min) ? min : undefined}
    aria-valuemax={Number.isFinite(max) ? max : undefined}
    aria-invalid={status === 'error' || undefined}
    aria-disabled={disabled || undefined}
    aria-readonly={readonly || undefined}
    oninput={handleInput}
    onblur={handleBlur}
    onkeydown={handleKeydown}
  />

  {#if controls}
    <span class="cd-input-number__actions">
      <button
        type="button"
        class="cd-input-number__action cd-input-number__increment"
        tabindex="-1"
        aria-label="增加"
        disabled={disabled || readonly || atMax}
        onmousedown={preventBlurSteal}
        onclick={() => stepBy(1, false)}
      >
        <svg viewBox="0 0 16 16" width="10" height="10" aria-hidden="true" focusable="false">
          <path fill="currentColor" d="M8 4 3 10h10L8 4Z" />
        </svg>
      </button>
      <button
        type="button"
        class="cd-input-number__action cd-input-number__decrement"
        tabindex="-1"
        aria-label="减少"
        disabled={disabled || readonly || atMin}
        onmousedown={preventBlurSteal}
        onclick={() => stepBy(-1, false)}
      >
        <svg viewBox="0 0 16 16" width="10" height="10" aria-hidden="true" focusable="false">
          <path fill="currentColor" d="M3 6h10L8 12 3 6Z" />
        </svg>
      </button>
    </span>
  {/if}
</div>

<style>
  .cd-input-number {
    display: inline-flex;
    align-items: stretch;
    inline-size: 100%;
    block-size: var(--cd-input-height-default);
    background: var(--cd-input-color-bg);
    color: var(--cd-input-color-text);
    border: 1px solid var(--cd-input-border);
    border-radius: var(--cd-input-radius);
    font-size: var(--cd-input-font-size);
    overflow: hidden;
    transition: border-color var(--cd-motion-duration-fast) var(--cd-motion-ease-standard);
  }
  .cd-input-number--small {
    block-size: var(--cd-input-height-small);
    font-size: var(--cd-font-size-1);
  }
  .cd-input-number--large {
    block-size: var(--cd-input-height-large);
    font-size: var(--cd-font-size-3);
  }
  .cd-input-number:focus-within {
    border-color: var(--cd-input-border-active);
    box-shadow: var(--cd-focus-ring);
  }
  .cd-input-number--warning {
    border-color: var(--cd-input-border-warning);
  }
  .cd-input-number--error {
    border-color: var(--cd-input-border-error);
  }
  .cd-input-number--disabled {
    background: var(--cd-color-fill-0);
    color: var(--cd-color-text-3);
    cursor: not-allowed;
  }
  .cd-input-number__native {
    flex: 1 1 auto;
    inline-size: 100%;
    min-inline-size: 0;
    margin: 0;
    padding-inline: var(--cd-input-padding-x);
    border: none;
    background: transparent;
    color: inherit;
    font: inherit;
    outline: none;
  }
  .cd-input-number__native::placeholder {
    color: var(--cd-input-color-placeholder);
  }
  .cd-input-number__native:disabled {
    cursor: not-allowed;
  }
  .cd-input-number__actions {
    display: flex;
    flex-direction: column;
    flex: 0 0 auto;
    inline-size: var(--cd-spacing-5);
    border-inline-start: 1px solid var(--cd-input-border);
  }
  .cd-input-number__action {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: 1 1 50%;
    min-block-size: 0;
    padding: 0;
    border: none;
    background: transparent;
    color: var(--cd-color-text-2);
    cursor: pointer;
    transition: background-color var(--cd-motion-duration-fast) var(--cd-motion-ease-standard);
  }
  .cd-input-number__increment {
    border-block-end: 1px solid var(--cd-input-border);
  }
  .cd-input-number__action:hover:not(:disabled) {
    color: var(--cd-color-primary);
    background: var(--cd-color-fill-1);
  }
  .cd-input-number__action:disabled {
    color: var(--cd-color-text-3);
    cursor: not-allowed;
  }
  @media (prefers-reduced-motion: reduce) {
    .cd-input-number,
    .cd-input-number__action {
      transition: none;
    }
  }
</style>
