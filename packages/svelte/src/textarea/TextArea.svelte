<!--
  TextArea — see specs/components/input/Textarea.spec.md
  原生 <textarea>，受控/非受控，size/status，showCount/maxCount/maxLength，IME 安全。
  autosize：随内容自适应高度（minRows/maxRows），$effect 内命令式测量 scrollHeight
  调 core computeAutosizeHeight 设高度 + cleanup（红线 #3）。
  计数走 core countCharacters（length / Intl.Segmenter 字素），纯函数派生（红线 #2）。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import {
    computeAutosizeHeight,
    countCharacters,
    createResizeObserver,
  } from '@chenzy-design/core';
  import { IconClear } from '@chenzy-design/icons';
  import { useLocale } from '../locale-provider/index.js';

  type Size = 'small' | 'default' | 'large';
  type Status = 'default' | 'warning' | 'error';
  type Resize = 'none' | 'vertical' | 'both';
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
    /** 计数上限：用于计数展示与超限提示（不硬截断，截断用 maxLength） */
    maxCount?: number;
    /** 按视觉字符（Intl.Segmenter 字素）计数而非 UTF-16/code point */
    countGraphemes?: boolean;
    /** 显示清除按钮（非空且非禁用/只读时） */
    showClear?: boolean;
    /** 挂载后自动聚焦（命令式 + cleanup） */
    autoFocus?: boolean;
    status?: Status;
    /** Form 注入别名：等价 status，仅当未显式传 status 时生效（兼容） */
    validateStatus?: Status;
    rows?: number;
    /** 自适应高度：true 或 { minRows, maxRows } */
    autosize?: Autosize;
    /** 原生手动调整把手（autosize 时建议 none） */
    resize?: Resize;
    name?: string;
    id?: string;
    class?: string;
    ariaLabel?: string;
    ariaDescribedby?: string;
    /** 自定义计数器渲染（覆盖内建） */
    count?: Snippet<[{ count: number; maxCount: number | undefined; overLimit: boolean }]>;
    /** 自定义清除图标 */
    clearIcon?: Snippet;
    onChange?: (v: string) => void;
    onInput?: (v: string) => void;
    onClear?: () => void;
    onFocus?: (e: FocusEvent) => void;
    onBlur?: (e: FocusEvent) => void;
    /** 按下 Enter（含修饰键信息，供「Ctrl+Enter 提交」场景）。composition 中不触发。 */
    onEnterPress?: (payload: { value: string; event: KeyboardEvent }) => void;
    /** autosize 高度变化（命令式重测后触发，高度无变化不触发）。 */
    onResize?: (payload: { height: number }) => void;
    onCompositionStart?: (e: CompositionEvent) => void;
    onCompositionEnd?: (e: CompositionEvent) => void;
    /** 无边框模式 */
    borderless?: boolean;
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
    maxCount,
    countGraphemes = false,
    showClear = false,
    autoFocus = false,
    status,
    validateStatus,
    rows = 3,
    autosize = false,
    resize = 'none',
    name,
    id,
    class: className = '',
    ariaLabel,
    ariaDescribedby,
    count: countSnippet,
    clearIcon,
    onChange,
    onInput,
    onClear,
    onFocus,
    onBlur,
    onEnterPress,
    onResize,
    onCompositionStart,
    onCompositionEnd,
    borderless = false,
  }: Props = $props();

  const loc = useLocale();

  // status 优先；未显式传 status 时用 validateStatus（Form 注入别名）；都无则 default。
  const effectiveStatus = $derived<Status>(status ?? validateStatus ?? 'default');

  const isControlled = $derived(value !== undefined);
  let inner = $state(getInitialValue());
  const current = $derived(isControlled ? (value ?? '') : inner);

  function getInitialValue(): string {
    return defaultValue;
  }

  let composing = $state(false);

  // 计数：纯函数派生（红线 #2）。composition 中也照常显示，不裁剪。
  const count = $derived(
    countCharacters(current, countGraphemes ? { graphemes: true } : undefined),
  );
  const overLimit = $derived(maxCount !== undefined && count > maxCount);
  const over = $derived(overLimit ? count - (maxCount as number) : 0);

  function setValue(next: string) {
    // 受控时不回写 prop，仅经 onChange 上报（避免 value→onChange→value 死循环，红线 #1）。
    if (!isControlled) inner = next;
  }

  function handleInput(e: Event & { currentTarget: HTMLTextAreaElement }) {
    const next = e.currentTarget.value;
    setValue(next);
    onInput?.(next);
    if (!composing) onChange?.(next);
  }

  function handleCompositionStart(e: CompositionEvent) {
    composing = true;
    onCompositionStart?.(e);
  }
  function handleCompositionEnd(
    e: CompositionEvent & { currentTarget: HTMLTextAreaElement },
  ) {
    composing = false;
    const next = e.currentTarget.value;
    setValue(next);
    onChange?.(next);
    onCompositionEnd?.(e);
  }

  function handleKeydown(e: KeyboardEvent) {
    // Textarea 的 Enter 默认换行；onEnterPress 透传事件，由调用方判断修饰键
    // （Ctrl/Cmd+Enter 提交等）。composition 中（IME 选词回车）不触发。
    if (e.key === 'Enter' && !composing) onEnterPress?.({ value: current, event: e });
  }

  function clear() {
    setValue('');
    onClear?.();
    onChange?.('');
    taEl?.focus();
  }

  const canClear = $derived(showClear && !disabled && !readonly && current.length > 0);

  const autosizeOn = $derived(autosize !== false);
  const minRows = $derived(
    typeof autosize === 'object' ? (autosize.minRows ?? rows) : rows,
  );
  const maxRows = $derived(
    typeof autosize === 'object' ? autosize.maxRows : undefined,
  );

  // autosize 时强制 resize none（把手与自适应冲突）。
  const effectiveResize = $derived<Resize>(autosizeOn ? 'none' : resize);

  // --- autosize 命令式测量 (红线 #3)：current 变化时测 scrollHeight 设高度 ---
  let taEl = $state<HTMLTextAreaElement | null>(null);
  // 上一次上报的 autosize 高度；仅在高度真正变化时触发 onResize（避免重复）。
  let lastReportedHeight = -1;

  // 命令式测量并设定 autosize 高度（不写任何 $state，故不参与 effect 依赖，红线 #2/#3）。
  // 返回本次测得的高度（用于宽度观测去重判断是否需重跑）。
  function measureAutosize(el: HTMLTextAreaElement): number {
    const cs = getComputedStyle(el);
    const lineHeight = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.5;
    const verticalPadding = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom);
    const verticalBorder = parseFloat(cs.borderTopWidth) + parseFloat(cs.borderBottomWidth);

    // 先重置 height 再读 scrollHeight，得到内容自然高度。
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

    // 高度变化时上报（{height}），首次测量也上报一次。
    if (result.height !== lastReportedHeight) {
      lastReportedHeight = result.height;
      onResize?.({ height: result.height });
    }
    return result.height;
  }

  $effect(() => {
    if (!autosizeOn || !taEl) return;
    const el = taEl;
    // 读 current 建立依赖：内容变化触发重测。
    void current;

    const prevHeight = el.style.height;
    measureAutosize(el);

    // 宽度变化重测（对标 Semi：容器变窄→换行增多→需更高）。core RO 观测
    // content-box 宽度；宽度变了才重跑 measure（内容变化已由上面的 current 依赖覆盖）。
    // 首帧 RO 立即 fire 一次，用 lastWidth 去重避免与上面的 measure 重复。
    let lastWidth = -1;
    const ro = createResizeObserver({
      box: 'content-box',
      onResize: (entry) => {
        // 命令式回调：只读几何 + 写 el.style（非 $state），不触发本 effect 重跑。
        if (entry.width === lastWidth) return;
        lastWidth = entry.width;
        measureAutosize(el);
      },
    });
    ro.observe(el);

    return () => {
      ro.disconnect();
      el.style.height = prevHeight;
    };
  });

  // --- autoFocus 命令式 + cleanup (红线 #3) ---
  $effect(() => {
    if (!autoFocus || !taEl) return;
    const el = taEl;
    const raf = requestAnimationFrame(() => el.focus());
    return () => cancelAnimationFrame(raf);
  });

  const cls = $derived(
    [
      'cd-textarea',
      `cd-textarea--${size}`,
      `cd-textarea--${effectiveStatus}`,
      disabled && 'cd-textarea--disabled',
      readonly && 'cd-textarea--readonly',
      autosizeOn && 'cd-textarea--autosize',
      overLimit && 'cd-textarea--over-limit',
      borderless && 'cd-textarea--borderless',
      className,
    ]
      .filter(Boolean)
      .join(' '),
  );
</script>

<div class={cls} aria-invalid={effectiveStatus === 'error' || undefined}>
  <textarea
    class="cd-textarea__native"
    class:cd-textarea__native--autosize={autosizeOn}
    bind:this={taEl}
    {name}
    {id}
    {disabled}
    {readonly}
    {placeholder}
    {rows}
    style:resize={effectiveResize}
    maxlength={maxLength}
    value={current}
    aria-label={ariaLabel}
    aria-describedby={ariaDescribedby}
    aria-invalid={effectiveStatus === 'error' || undefined}
    oninput={handleInput}
    onkeydown={handleKeydown}
    oncompositionstart={handleCompositionStart}
    oncompositionend={handleCompositionEnd}
    onfocus={onFocus}
    onblur={onBlur}
  ></textarea>

  {#if canClear}
    <button
      type="button"
      class="cd-textarea__clear"
      aria-label={loc().t('Textarea.clear')}
      onclick={clear}
    >
      {#if clearIcon}
        {@render clearIcon()}
      {:else}
        <IconClear />
      {/if}
    </button>
  {/if}

  {#if showCount}
    {#if countSnippet}
      {@render countSnippet({ count, maxCount, overLimit })}
    {:else}
      <span class="cd-textarea__count" class:cd-textarea__count--over={overLimit}>
        {#if maxCount !== undefined}
          {loc().t('Textarea.countFormat', {
            count: loc().formatNumber(count),
            maxCount: loc().formatNumber(maxCount),
          })}
        {:else if maxLength !== undefined}
          {loc().formatNumber(count)}/{loc().formatNumber(maxLength)}
        {:else}
          {loc().t('Textarea.countOnly', { count: loc().formatNumber(count) })}
        {/if}
      </span>
    {/if}
  {/if}

  {#if overLimit}
    <span class="cd-sr-only" aria-live="polite">
      {loc().t('Textarea.overLimitAnnounce', { over: loc().formatNumber(over) })}
    </span>
  {/if}
</div>

<style>
  /* 输入框容器 —— 对齐 Semi textarea：复用 input 填充式 token（灰底 + 透明描边，
     聚焦换 focus 边框），textarea 专属项走 textarea token。 */
  .cd-textarea {
    position: relative;
    display: inline-flex;
    inline-size: 100%;
    padding: var(--cd-spacing-textarea-paddingy) var(--cd-spacing-textarea-paddingx);
    background: var(--cd-color-input-default-bg-default);
    color: var(--cd-color-input-default-text-default);
    border: var(--cd-width-input-wrapper-border) solid var(--cd-color-input-default-border-default);
    border-radius: var(--cd-radius-input-wrapper);
    font-size: var(--cd-input-font-size);
    transition:
      background-color var(--cd-transition-duration-input-bg)
        var(--cd-transition-function-input-bg) var(--cd-transition-delay-input-bg),
      border var(--cd-transition-duration-input-border)
        var(--cd-transition-function-input-border) var(--cd-transition-delay-input-border);
  }
  .cd-textarea--small {
    font-size: var(--cd-font-size-small);
  }
  .cd-textarea--large {
    font-size: var(--cd-font-size-header-6);
  }
  .cd-textarea:hover:not(.cd-textarea--disabled):not(:focus-within) {
    background: var(--cd-color-input-default-bg-hover);
    border-color: var(--cd-color-input-default-border-hover);
  }
  .cd-textarea:focus-within {
    background: var(--cd-color-input-default-bg-focus);
    border-color: var(--cd-color-input-default-border-focus);
  }
  /* warning / error —— 对齐 Semi：浅色状态底 + 同色描边，聚焦换实色描边 */
  .cd-textarea--warning {
    background: var(--cd-color-input-warning-bg-default);
    border-color: var(--cd-color-input-warning-border-default);
  }
  .cd-textarea--warning:hover:not(.cd-textarea--disabled):not(:focus-within) {
    background: var(--cd-color-input-warning-bg-hover);
    border-color: var(--cd-color-input-warning-border-hover);
  }
  .cd-textarea--warning:focus-within {
    background: var(--cd-color-input-warning-bg-focus);
    border-color: var(--cd-color-input-warning-border-focus);
  }
  .cd-textarea--error {
    background: var(--cd-color-input-danger-bg-default);
    border-color: var(--cd-color-input-danger-border-default);
  }
  .cd-textarea--error:hover:not(.cd-textarea--disabled):not(:focus-within) {
    background: var(--cd-color-input-danger-bg-hover);
    border-color: var(--cd-color-input-danger-border-hover);
  }
  .cd-textarea--error:focus-within {
    background: var(--cd-color-input-danger-bg-focus);
    border-color: var(--cd-color-input-danger-border-focus);
  }
  .cd-textarea--disabled {
    background: var(--cd-color-input-disabled-bg-default);
    color: var(--cd-color-input-disabled-text-default);
    cursor: not-allowed;
  }
  /* borderless —— 对齐 Semi：非悬浮/聚焦时全透明；error/warning 保留实色描边 */
  .cd-textarea--borderless:not(:focus-within):not(:hover) {
    border-color: transparent;
    background: transparent;
  }
  .cd-textarea--borderless.cd-textarea--error:not(:focus-within) {
    border-color: var(--cd-color-input-danger-border-focus);
  }
  .cd-textarea--borderless.cd-textarea--warning:not(:focus-within) {
    border-color: var(--cd-color-input-warning-border-focus);
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
    color: var(--cd-color-input-placeholder-text-default);
  }
  .cd-textarea--disabled .cd-textarea__native::placeholder {
    color: var(--cd-color-input-disabled-text-default);
  }
  .cd-textarea__native:disabled {
    cursor: not-allowed;
  }
  .cd-textarea__clear {
    position: absolute;
    inset-block-start: var(--cd-spacing-extra-tight);
    inset-inline-end: var(--cd-spacing-extra-tight);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    border: none;
    background: transparent;
    color: var(--cd-color-textarea-icon-default);
    cursor: pointer;
    border-radius: var(--cd-radius-input-wrapper);
  }
  .cd-textarea__clear:hover {
    color: var(--cd-color-textarea-icon-hover);
  }
  .cd-textarea__clear:focus-visible {
    outline: var(--cd-width-input-icon-outline) solid var(--cd-color-input-icon-outline);
    outline-offset: var(--cd-width-input-icon-outlineoffset);
  }
  .cd-textarea__count {
    position: absolute;
    inset-block-end: var(--cd-spacing-extra-tight);
    inset-inline-end: var(--cd-spacing-tight);
    color: var(--cd-color-input-counter-text-default);
    font-size: var(--cd-font-size-small);
    white-space: nowrap;
    pointer-events: none;
  }
  .cd-textarea__count--over {
    color: var(--cd-color-input-counter-danger-text-default);
  }
  @media (prefers-reduced-motion: reduce) {
    .cd-textarea {
      transition: none;
    }
  }
</style>
