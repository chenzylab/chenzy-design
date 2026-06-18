<!--
  Textarea — see specs/components/input/Textarea.spec.md
  Reuses input tokens. Controlled / uncontrolled, optional autosize.
-->
<script lang="ts">
  type Size = 'small' | 'default' | 'large';
  type Status = 'default' | 'warning' | 'error';
  type Autosize = boolean | { minRows?: number; maxRows?: number };

  interface Props {
    value?: string;
    defaultValue?: string;
    placeholder?: string;
    rows?: number;
    autosize?: Autosize;
    size?: Size;
    status?: Status;
    disabled?: boolean;
    readonly?: boolean;
    showCount?: boolean;
    maxLength?: number;
    name?: string;
    ariaLabel?: string;
    onChange?: (v: string) => void;
    onInput?: (v: string) => void;
  }

  let {
    value = $bindable(),
    defaultValue = '',
    placeholder,
    rows = 3,
    autosize = false,
    size = 'default',
    status = 'default',
    disabled = false,
    readonly = false,
    showCount = false,
    maxLength,
    name,
    ariaLabel,
    onChange,
    onInput,
  }: Props = $props();

  const isControlled = $derived(value !== undefined);
  let inner = $state(getInitialValue());
  const current = $derived(isControlled ? (value ?? '') : inner);

  function getInitialValue(): string {
    return defaultValue;
  }

  let composing = $state(false);

  const len = $derived([...current].length);
  const isAutosize = $derived(autosize !== false);
  const minRows = $derived(typeof autosize === 'object' ? autosize.minRows : undefined);
  const maxRows = $derived(typeof autosize === 'object' ? autosize.maxRows : undefined);

  function setValue(next: string) {
    // Controlled (`value=` / `bind:value`): parent owns `value`; we propagate
    // only via `onChange` (callers always fire it). Writing the prop here as
    // well creates the value -> onChange -> value loop.
    // Uncontrolled: keep our own state in sync.
    if (!isControlled) inner = next;
  }

  // Hold the textarea node so input handlers can resize imperatively.
  let nativeEl: HTMLTextAreaElement | undefined;

  /**
   * Resize the textarea to fit content. Pure imperative DOM work — it reads
   * layout (scrollHeight) and writes node.style only; it must NOT read reactive
   * state, otherwise an {@attach} wrapping it would re-subscribe and loop
   * (effect_update_depth_exceeded). Called on mount and on every input.
   */
  function resize(node: HTMLTextAreaElement): void {
    if (!isAutosize) {
      node.style.height = '';
      node.style.overflowY = '';
      return;
    }
    node.style.height = 'auto';
    const style = getComputedStyle(node);
    const lineHeight = parseFloat(style.lineHeight) || 20;
    const paddingY = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
    const borderY = parseFloat(style.borderTopWidth) + parseFloat(style.borderBottomWidth);
    let target = node.scrollHeight;
    if (minRows !== undefined) {
      target = Math.max(target, minRows * lineHeight + paddingY + borderY);
    }
    if (maxRows !== undefined) {
      const max = maxRows * lineHeight + paddingY + borderY;
      target = Math.min(target, max);
      node.style.overflowY = node.scrollHeight > max ? 'auto' : 'hidden';
    }
    node.style.height = `${target}px`;
  }

  /** Non-reactive attachment: store the node and size it once on mount. */
  function autosizeAttach(node: HTMLTextAreaElement) {
    nativeEl = node;
    resize(node);
    return () => {
      if (nativeEl === node) nativeEl = undefined;
    };
  }

  function handleInput(e: Event & { currentTarget: HTMLTextAreaElement }) {
    const next = e.currentTarget.value;
    setValue(next);
    resize(e.currentTarget);
    onInput?.(next);
    if (!composing) onChange?.(next);
  }

  function handleChange(e: Event & { currentTarget: HTMLTextAreaElement }) {
    if (composing) return;
    onChange?.(e.currentTarget.value);
  }

  function handleCompositionStart() {
    composing = true;
  }

  function handleCompositionEnd(e: Event & { currentTarget: HTMLTextAreaElement }) {
    composing = false;
    const next = e.currentTarget.value;
    setValue(next);
    resize(e.currentTarget);
    onChange?.(next);
  }

  const cls = $derived(
    [
      'cd-textarea',
      `cd-textarea--${size}`,
      `cd-textarea--${status}`,
      disabled && 'cd-textarea--disabled',
    ]
      .filter(Boolean)
      .join(' '),
  );
</script>

<div class={cls} aria-invalid={status === 'error' || undefined}>
  <textarea
    {@attach autosizeAttach}
    class="cd-textarea__native"
    rows={isAutosize ? undefined : rows}
    {name}
    {disabled}
    {readonly}
    {placeholder}
    maxlength={maxLength}
    value={current}
    aria-label={ariaLabel}
    aria-invalid={status === 'error' || undefined}
    oninput={handleInput}
    onchange={handleChange}
    oncompositionstart={handleCompositionStart}
    oncompositionend={handleCompositionEnd}
  ></textarea>

  {#if showCount}
    <span class="cd-textarea__count">
      {len}{#if maxLength !== undefined}/{maxLength}{/if}
    </span>
  {/if}
</div>

<style>
  .cd-textarea {
    position: relative;
    display: inline-flex;
    inline-size: 100%;
    padding-block: var(--cd-spacing-2);
    padding-inline: var(--cd-input-padding-x);
    background: var(--cd-input-color-bg);
    color: var(--cd-input-color-text);
    border: 1px solid var(--cd-input-border);
    border-radius: var(--cd-input-radius);
    font-size: var(--cd-input-font-size);
    transition: border-color var(--cd-motion-duration-fast) var(--cd-motion-ease-standard);
  }
  .cd-textarea--small {
    font-size: var(--cd-font-size-1);
  }
  .cd-textarea--large {
    font-size: var(--cd-font-size-3);
  }
  .cd-textarea:focus-within {
    border-color: var(--cd-input-border-active);
    box-shadow: var(--cd-focus-ring);
  }
  .cd-textarea--warning {
    border-color: var(--cd-input-border-warning);
  }
  .cd-textarea--error {
    border-color: var(--cd-input-border-error);
  }
  .cd-textarea--disabled {
    background: var(--cd-color-fill-0);
    color: var(--cd-color-text-3);
    cursor: not-allowed;
  }
  .cd-textarea__native {
    flex: 1 1 auto;
    inline-size: 100%;
    min-inline-size: 0;
    margin: 0;
    padding: 0;
    border: none;
    background: transparent;
    color: inherit;
    font: inherit;
    line-height: 1.5;
    resize: vertical;
    outline: none;
  }
  .cd-textarea__native::placeholder {
    color: var(--cd-input-color-placeholder);
  }
  .cd-textarea__count {
    position: absolute;
    inset-block-end: var(--cd-spacing-1);
    inset-inline-end: var(--cd-spacing-2);
    color: var(--cd-color-text-3);
    font-size: var(--cd-font-size-1);
    pointer-events: none;
  }
  @media (prefers-reduced-motion: reduce) {
    .cd-textarea {
      transition: none;
    }
  }
</style>
