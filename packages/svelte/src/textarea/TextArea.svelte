<!--
  TextArea — see specs/components/input/Input.spec.md（多行输入）
  原生 <textarea>，受控/非受控，size/status，showCount/maxLength，IME 安全。
  autosize：随内容自适应高度（minRows/maxRows），$effect 内命令式测量 scrollHeight
  调 core computeAutosizeHeight 设高度 + cleanup（红线 #3）。
-->
<script lang="ts">
  import { computeAutosizeHeight } from '@chenzy-design/core';

  type Size = 'small' | 'default' | 'large';
  type Status = 'default' | 'warning' | 'error';
  type Autosize = boolean | { minRows?: number; maxRows?: number };

  interface Props {
    value?: string;
    defaultValue?: string;
    size?: Size;
    disabled?: boolean;
    readonly?: boolean;
    placeholder?: string;
    showCount?: boolean;
    maxLength?: number;
    status?: Status;
    rows?: number;
    /** 自适应高度：true 或 { minRows, maxRows } */
    autosize?: Autosize;
    name?: string;
    ariaLabel?: string;
    onChange?: (v: string) => void;
    onInput?: (v: string) => void;
  }

  let {
    value = $bindable(),
    defaultValue = '',
    size = 'default',
    disabled = false,
    readonly = false,
    placeholder,
    showCount = false,
    maxLength,
    status = 'default',
    rows = 3,
    autosize = false,
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

  function setValue(next: string) {
    // 受控时不回写 prop，仅经 onChange 上报（避免 value→onChange→value 死循环）。
    if (!isControlled) inner = next;
  }

  function handleInput(e: Event & { currentTarget: HTMLTextAreaElement }) {
    const next = e.currentTarget.value;
    setValue(next);
    onInput?.(next);
    if (!composing) onChange?.(next);
  }

  function handleCompositionStart() {
    composing = true;
  }
  function handleCompositionEnd(e: Event & { currentTarget: HTMLTextAreaElement }) {
    composing = false;
    const next = e.currentTarget.value;
    setValue(next);
    onChange?.(next);
  }

  const autosizeOn = $derived(autosize !== false);
  const minRows = $derived(
    typeof autosize === 'object' ? (autosize.minRows ?? rows) : rows,
  );
  const maxRows = $derived(
    typeof autosize === 'object' ? autosize.maxRows : undefined,
  );

  // --- autosize 命令式测量 (红线 #3)：current 变化时测 scrollHeight 设高度 ---
  let taEl = $state<HTMLTextAreaElement | null>(null);

  $effect(() => {
    if (!autosizeOn || !taEl) return;
    const el = taEl;
    // 读 current 建立依赖：内容变化触发重测。
    void current;

    const cs = getComputedStyle(el);
    const lineHeight = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.5;
    const verticalPadding = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom);
    const verticalBorder = parseFloat(cs.borderTopWidth) + parseFloat(cs.borderBottomWidth);

    // 先重置 height 再读 scrollHeight，得到内容自然高度。
    const prevHeight = el.style.height;
    el.style.height = 'auto';
    const scrollHeight = el.scrollHeight + verticalBorder; // scrollHeight 不含 border
    const result = computeAutosizeHeight({
      scrollHeight,
      lineHeight,
      verticalPadding,
      verticalBorder,
      minRows,
      ...(maxRows !== undefined ? { maxRows } : {}),
    });
    el.style.height = `${result.height}px`;
    el.style.overflowY = result.overflow ? 'auto' : 'hidden';

    return () => {
      el.style.height = prevHeight;
    };
  });

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
    class="cd-textarea__native"
    class:cd-textarea__native--autosize={autosizeOn}
    bind:this={taEl}
    {name}
    {disabled}
    {readonly}
    {placeholder}
    {rows}
    maxlength={maxLength}
    value={current}
    aria-label={ariaLabel}
    aria-invalid={status === 'error' || undefined}
    oninput={handleInput}
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
    padding: var(--cd-input-padding-x);
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
  .cd-textarea__native--autosize {
    resize: none;
    overflow-y: hidden;
  }
  .cd-textarea__native::placeholder {
    color: var(--cd-input-color-placeholder);
  }
  .cd-textarea__native:disabled {
    cursor: not-allowed;
  }
  .cd-textarea__count {
    position: absolute;
    inset-block-end: var(--cd-spacing-1);
    inset-inline-end: var(--cd-spacing-2);
    color: var(--cd-color-text-3);
    font-size: var(--cd-font-size-1);
    white-space: nowrap;
    pointer-events: none;
  }
  @media (prefers-reduced-motion: reduce) {
    .cd-textarea {
      transition: none;
    }
  }
</style>
