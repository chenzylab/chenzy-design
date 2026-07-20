<!--
  TextArea — 严格对齐 Semi Design（semi-ui/input/textarea.tsx）。
  原生 <textarea class="cd-input-textarea">，受控/非受控，IME 安全。
  DOM 与 class 镜像 Semi：cd-input-textarea-wrapper 容器 + cd-input-textarea 元素。
  能力：autosize（minRows/maxRows）、showClear、maxCount 计数、showLineNumber 行号、
  resize 全值域、textareaStyle、cols、getValueLength、composition、onKeyDown 系列、focus/blur。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { computeAutosizeHeight, createResizeObserver } from '@chenzy-design/core';
  import { IconClear } from '@chenzy-design/icons';
  import { useLocale } from '../locale-provider/index.js';

  type Size = 'small' | 'default' | 'large';
  type ValidateStatus = 'default' | 'warning' | 'error' | 'success';
  type Resize = 'none' | 'both' | 'horizontal' | 'vertical' | 'block' | 'inline';
  type Autosize = boolean | { minRows?: number; maxRows?: number };

  interface Props {
    value?: string;
    defaultValue?: string;
    size?: Size;
    disabled?: boolean;
    readonly?: boolean;
    placeholder?: string;
    /** 显示字数统计（对齐 Semi showCounter；本库沿用 showCount，maxCount 存在时亦显示）。 */
    showCount?: boolean;
    maxLength?: number;
    /** 设置字数限制并显示字数统计（对齐 Semi maxCount，不硬截断）。 */
    maxCount?: number;
    /** 显示清除按钮（非空且非禁用/只读时，对齐 Semi showClear）。 */
    showClear?: boolean;
    /** 挂载后自动聚焦（对齐 Semi autoFocus）。 */
    autoFocus?: boolean;
    /** 校验状态（对齐 Semi validateStatus）。 */
    validateStatus?: ValidateStatus;
    /** 默认行数（对齐 Semi rows）。 */
    rows?: number;
    /** 默认列数（对齐 Semi cols）。 */
    cols?: number;
    /** 自适应高度：true 或 { minRows, maxRows }（对齐 Semi autosize）。 */
    autosize?: Autosize;
    /** 拖拽调整方向（对齐 Semi resize，全值域）。autosize 开启时忽略；仅显式传入时生效。 */
    resize?: Resize;
    /** 无边框模式（对齐 Semi borderless）。 */
    borderless?: boolean;
    /** 展示行号（对齐 Semi showLineNumber）。 */
    showLineNumber?: boolean;
    /** 行号起始值（对齐 Semi lineNumberStart）。 */
    lineNumberStart?: number;
    /** 行号区自定义类名（对齐 Semi lineNumberClassName）。 */
    lineNumberClassName?: string;
    /** 行号区自定义样式（对齐 Semi lineNumberStyle）。 */
    lineNumberStyle?: string;
    /** textarea 元素样式，可设高度等（对齐 Semi textareaStyle）。 */
    textareaStyle?: string;
    /** 自定义字符计数函数，替代默认长度（对齐 Semi getValueLength）。 */
    getValueLength?: (value: string) => number;
    /** 禁用 Enter 换行（Shift+Enter 才换行，对齐 Semi disabledEnterStartNewLine，Chat 场景用）。 */
    disabledEnterStartNewLine?: boolean;
    /**
     * 输入法模式（对齐 Semi composition）。默认 false：拼音输入过程中每次输入都触发 onChange。
     * true：IME 未确认期间不触发 onChange，确认后补触发一次。
     */
    composition?: boolean;
    name?: string;
    id?: string;
    /** 根容器自定义类名（对齐 Semi className）。 */
    class?: string;
    /** 根容器内联样式（对齐 Semi style）。 */
    style?: string;
    ariaLabel?: string;
    ariaLabelledby?: string;
    ariaDescribedby?: string;
    ariaErrormessage?: string;
    ariaRequired?: boolean;
    /** 自定义计数器渲染（覆盖内建，本库超集扩展）。 */
    count?: Snippet<[{ count: number; maxCount: number | undefined; overLimit: boolean }]>;
    /** 自定义清除图标。 */
    clearIcon?: Snippet;
    /** 内容变化回调（对齐 Semi：第二参为原生事件）。 */
    onChange?: (value: string, e: Event) => void;
    onInput?: (value: string, e: Event) => void;
    /** 点击清除按钮回调（对齐 Semi：透传鼠标事件）。 */
    onClear?: (e: MouseEvent) => void;
    onFocus?: (e: FocusEvent) => void;
    onBlur?: (e: FocusEvent) => void;
    /** 按下 Enter 回调（对齐 Semi onEnterPress：透传原生键盘事件）。composition 中不触发。 */
    onEnterPress?: (e: KeyboardEvent) => void;
    /** onEnterPress 别名（对齐 Semi onPressEnter）。 */
    onPressEnter?: (e: KeyboardEvent) => void;
    /** 尺寸变化回调（对齐 Semi：autosize 高度变化，或 resize 拖拽含 width）。 */
    onResize?: (data: { height: number; width?: number }) => void;
    onKeyDown?: (e: KeyboardEvent) => void;
    onKeyUp?: (e: KeyboardEvent) => void;
    onKeyPress?: (e: KeyboardEvent) => void;
    onCompositionStart?: (e: CompositionEvent) => void;
    onCompositionEnd?: (e: CompositionEvent) => void;
    onCompositionUpdate?: (e: CompositionEvent) => void;
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
    showClear = false,
    autoFocus = false,
    validateStatus = 'default',
    rows = 4,
    cols,
    autosize = false,
    resize,
    borderless = false,
    showLineNumber = false,
    lineNumberStart = 1,
    lineNumberClassName,
    lineNumberStyle,
    textareaStyle,
    getValueLength,
    disabledEnterStartNewLine = false,
    composition = false,
    name,
    id,
    class: className = '',
    style,
    ariaLabel,
    ariaLabelledby,
    ariaDescribedby,
    ariaErrormessage,
    ariaRequired,
    count: countSnippet,
    clearIcon,
    onChange,
    onInput,
    onClear,
    onFocus,
    onBlur,
    onEnterPress,
    onPressEnter,
    onResize,
    onKeyDown,
    onKeyUp,
    onKeyPress,
    onCompositionStart,
    onCompositionEnd,
    onCompositionUpdate,
  }: Props = $props();

  const loc = useLocale();

  const isControlled = $derived(value !== undefined);
  let inner = $state(getInitialValue());
  const current = $derived(isControlled ? (value ?? '') : inner);

  function getInitialValue(): string {
    return defaultValue;
  }

  let composing = $state(false);
  // 悬浮 / 聚焦态（对齐 Semi isHover / isFocus）：清除按钮仅在有内容且 hover 或 focus 时显示。
  let isHovering = $state(false);
  let isFocus = $state(false);

  // 计数：优先 getValueLength，否则字素长度（正确处理 emoji）。
  const count = $derived(getValueLength ? getValueLength(current) : [...current].length);
  const overLimit = $derived(maxCount !== undefined && count > maxCount);
  const over = $derived(overLimit ? count - (maxCount as number) : 0);
  const showCounter = $derived(showCount || maxCount !== undefined);

  const isError = $derived(validateStatus === 'error');

  function setValue(next: string) {
    // 受控时不回写 prop，仅经 onChange 上报（避免 value→onChange→value 死循环）。
    if (!isControlled) inner = next;
  }

  function handleInput(e: Event & { currentTarget: HTMLTextAreaElement }) {
    const next = e.currentTarget.value;
    setValue(next);
    onInput?.(next, e);
    if (!(composition && composing)) onChange?.(next, e);
  }

  function handleCompositionStart(e: CompositionEvent) {
    composing = true;
    onCompositionStart?.(e);
  }
  function handleCompositionEnd(e: CompositionEvent & { currentTarget: HTMLTextAreaElement }) {
    composing = false;
    if (composition) {
      const next = e.currentTarget.value;
      setValue(next);
      onChange?.(next, e);
    }
    onCompositionEnd?.(e);
  }

  function handleKeydown(e: KeyboardEvent) {
    // disabledEnterStartNewLine：禁用 Enter 换行（Shift+Enter 仍换行，对齐 Semi Chat 场景）。
    if (disabledEnterStartNewLine && e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
    }
    if (e.key === 'Enter' && !composing) {
      onEnterPress?.(e);
      onPressEnter?.(e);
    }
    onKeyDown?.(e);
  }

  // clear 用 onclick（对齐 Semi textarea handleClear onClick）：textarea clearbtn 始终渲染、
  // 用 hidden 类控制显隐，click 时按钮仍在 DOM 不丢事件。
  function clear(e: MouseEvent) {
    setValue('');
    onClear?.(e);
    onChange?.('', e);
    taEl?.focus();
  }

  function handleFocus(e: FocusEvent) {
    isFocus = true;
    onFocus?.(e);
  }
  function handleBlur(e: FocusEvent) {
    isFocus = false;
    onBlur?.(e);
  }

  // 有内容 + showClear + 非禁用/只读 + (聚焦 或 悬浮)（对齐 Semi textarea isAllowClear）。
  const canClear = $derived(
    current.length > 0 && showClear && !disabled && !readonly && (isFocus || isHovering),
  );

  const autosizeOn = $derived(autosize !== false);
  const minRows = $derived(typeof autosize === 'object' ? (autosize.minRows ?? rows) : rows);
  const maxRows = $derived(typeof autosize === 'object' ? autosize.maxRows : undefined);

  // resize 仅显式传入时生效（对齐 Semi hasResizeProp）；autosize 时强制 none。
  const effectiveResize = $derived<Resize | undefined>(
    autosizeOn ? 'none' : resize,
  );

  // --- imperative refs ---
  let taEl = $state<HTMLTextAreaElement | null>(null);
  let lineNumberEl = $state<HTMLDivElement | null>(null);
  let lastReportedHeight = -1;

  /** 命令式聚焦（对齐 Semi focus()）。 */
  export function focus(): void {
    taEl?.focus();
  }
  /** 命令式失焦（对齐 Semi blur()）。 */
  export function blur(): void {
    taEl?.blur();
  }

  // 命令式测量并设定 autosize 高度（不写 $state，不参与 effect 依赖）。
  function measureAutosize(el: HTMLTextAreaElement): number {
    const cs = getComputedStyle(el);
    const lineHeight = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.5;
    const verticalPadding = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom);
    const verticalBorder = parseFloat(cs.borderTopWidth) + parseFloat(cs.borderBottomWidth);

    el.style.height = 'auto';
    const scrollHeight = el.scrollHeight + verticalBorder;
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

    if (result.height !== lastReportedHeight) {
      lastReportedHeight = result.height;
      onResize?.({ height: result.height });
    }
    return result.height;
  }

  $effect(() => {
    if (!autosizeOn || !taEl) return;
    const el = taEl;
    void current;

    const prevHeight = el.style.height;
    measureAutosize(el);

    let lastWidth = -1;
    const ro = createResizeObserver({
      box: 'content-box',
      onResize: (entry) => {
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

  // --- native resize (non-autosize)：拖拽把手时上报 { height, width }（对齐 Semi handleNativeResize） ---
  const observeNativeResize = $derived(
    !autosizeOn && resize !== undefined && resize !== 'none',
  );
  $effect(() => {
    if (!observeNativeResize || !taEl) return;
    const el = taEl;
    let observedOnce = false;
    let last: { width: number; height: number } | null = null;
    const ro = createResizeObserver({
      box: 'content-box',
      onResize: (entry) => {
        const width = entry.width;
        const height = entry.height;
        // RO 首帧立即 fire，跳过以免挂载即触发。
        if (!observedOnce) {
          observedOnce = true;
          last = { width, height };
          return;
        }
        if (last && last.width === width && last.height === height) return;
        last = { width, height };
        onResize?.({ height, width });
      },
    });
    ro.observe(el);
    return () => ro.disconnect();
  });

  // --- autoFocus 命令式 + cleanup ---
  $effect(() => {
    if (!autoFocus || !taEl || disabled) return;
    const el = taEl;
    const raf = requestAnimationFrame(() => el.focus());
    return () => cancelAnimationFrame(raf);
  });

  // --- 行号：随内容 / 尺寸变化重算（对齐 Semi renderLineNumbers）---
  const lines = $derived(showLineNumber ? (current ? current.split('\n') : ['']) : []);
  let textareaHeight = $state(0);

  // 行号面板高度约束到 textarea 视口，滚动同步。
  $effect(() => {
    if (!showLineNumber || !taEl) return;
    const el = taEl;
    textareaHeight = el.clientHeight;
    const ro = createResizeObserver({
      box: 'content-box',
      onResize: () => {
        textareaHeight = el.clientHeight;
      },
    });
    ro.observe(el);
    return () => ro.disconnect();
  });

  function handleScroll(e: Event & { currentTarget: HTMLTextAreaElement }) {
    if (showLineNumber && lineNumberEl) {
      const top = e.currentTarget.scrollTop;
      requestAnimationFrame(() => {
        if (lineNumberEl) lineNumberEl.scrollTop = top;
      });
    }
  }

  const wrapperCls = $derived(
    [
      'cd-input-textarea-wrapper',
      `cd-input-textarea-wrapper-${size}`,
      borderless && 'cd-input-textarea-borderless',
      disabled && 'cd-input-textarea-wrapper-disabled',
      readonly && 'cd-input-textarea-wrapper-readonly',
      validateStatus !== 'default' && `cd-input-textarea-wrapper-${validateStatus}`,
      overLimit && 'cd-input-textarea-wrapper-over-limit',
      showLineNumber && 'cd-input-textarea-wrapper-withLineNumber',
      className,
    ]
      .filter(Boolean)
      .join(' '),
  );

  const textareaCls = $derived(
    [
      'cd-input-textarea',
      autosizeOn && maxRows === undefined && 'cd-input-textarea-autosize',
      showClear && 'cd-input-textarea-showClear',
    ]
      .filter(Boolean)
      .join(' '),
  );

  const mergedTextareaStyle = $derived(
    [
      textareaStyle,
      effectiveResize !== undefined ? `resize:${effectiveResize}` : undefined,
    ]
      .filter(Boolean)
      .join(';'),
  );

  const lineNumberPanelStyle = $derived(
    [
      lineNumberStyle,
      textareaHeight ? `height:${textareaHeight}px;max-height:${textareaHeight}px` : undefined,
    ]
      .filter(Boolean)
      .join(';'),
  );
</script>

<!-- wrapper 严格对齐 Semi：<div> 无 role，仅承载 mouseenter/leave 追踪 hover（清除按钮显隐用）。 -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  class={wrapperCls}
  {style}
  aria-invalid={isError || undefined}
  onmouseenter={() => (isHovering = true)}
  onmouseleave={() => (isHovering = false)}
>
  {#if showLineNumber}
    <div
      bind:this={lineNumberEl}
      class={['cd-input-textarea-lineNumber', lineNumberClassName].filter(Boolean).join(' ')}
      style={lineNumberPanelStyle}
    >
      {#each lines as _line, i (i)}
        <div class="cd-input-textarea-lineNumber-item">{lineNumberStart + i}</div>
      {/each}
    </div>
    <div class="cd-input-textarea-content">
      <textarea
        class={textareaCls}
        bind:this={taEl}
        {name}
        {id}
        {disabled}
        {readonly}
        {placeholder}
        {rows}
        {cols}
        style={mergedTextareaStyle}
        maxlength={getValueLength ? undefined : maxLength}
        value={current}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledby}
        aria-describedby={ariaDescribedby}
        aria-errormessage={ariaErrormessage}
        aria-required={ariaRequired || undefined}
        aria-invalid={isError || undefined}
        oninput={handleInput}
        onkeydown={handleKeydown}
        onkeyup={onKeyUp}
        onkeypress={onKeyPress}
        onscroll={handleScroll}
        oncompositionstart={handleCompositionStart}
        oncompositionend={handleCompositionEnd}
        oncompositionupdate={onCompositionUpdate}
        onfocus={handleFocus}
        onblur={handleBlur}
      ></textarea>
    </div>
  {:else}
    <textarea
      class={textareaCls}
      bind:this={taEl}
      {name}
      {id}
      {disabled}
      {readonly}
      {placeholder}
      {rows}
      {cols}
      style={mergedTextareaStyle}
      maxlength={getValueLength ? undefined : maxLength}
      value={current}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledby}
      aria-describedby={ariaDescribedby}
      aria-errormessage={ariaErrormessage}
      aria-required={ariaRequired || undefined}
      aria-invalid={isError || undefined}
      oninput={handleInput}
      onkeydown={handleKeydown}
      onkeyup={onKeyUp}
      onkeypress={onKeyPress}
      oncompositionstart={handleCompositionStart}
      oncompositionend={handleCompositionEnd}
      oncompositionupdate={onCompositionUpdate}
      onfocus={handleFocus}
      onblur={handleBlur}
    ></textarea>
  {/if}

  {#if showClear}
    <!-- clearbtn 严格对齐 Semi textarea：<div> 无 aria-label，onclick 触发（始终渲染，用 hidden 类控制显隐）。 -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <div
      class="cd-input-clearbtn"
      class:cd-input-clearbtn-hidden={!canClear}
      onclick={clear}
    >
      {#if clearIcon}
        {@render clearIcon()}
      {:else}
        <IconClear />
      {/if}
    </div>
  {/if}

  {#if showCounter}
    {#if countSnippet}
      {@render countSnippet({ count, maxCount, overLimit })}
    {:else}
      <div
        class="cd-input-textarea-counter"
        class:cd-input-textarea-counter-exceed={overLimit}
      >
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
      </div>
    {/if}
  {/if}

  {#if overLimit}
    <span class="cd-sr-only" aria-live="polite">
      {loc().t('Textarea.overLimitAnnounce', { over: loc().formatNumber(over) })}
    </span>
  {/if}
</div>

<style>
  /* 容器 —— 对齐 Semi input-textarea-wrapper：填充式灰底 + 透明描边。 */
  .cd-input-textarea-wrapper {
    box-sizing: border-box;
    display: inline-block;
    position: relative;
    inline-size: 100%;
    vertical-align: bottom;
    background: var(--cd-color-input-default-bg-default);
    border: var(--cd-width-input-wrapper-border) solid var(--cd-color-input-default-border-default);
    border-radius: var(--cd-radius-input-wrapper);
    font-size: var(--cd-font-size-regular);
    transition:
      background-color var(--cd-transition-duration-input-bg)
        var(--cd-transition-function-input-bg) var(--cd-transition-delay-input-bg),
      border var(--cd-transition-duration-input-border)
        var(--cd-transition-function-input-border) var(--cd-transition-delay-input-border);
  }
  .cd-input-textarea-wrapper-small {
    font-size: var(--cd-font-size-small);
  }
  .cd-input-textarea-wrapper-large {
    font-size: var(--cd-font-size-header-6);
  }
  .cd-input-textarea-wrapper:hover:not(.cd-input-textarea-wrapper-disabled):not(:focus-within) {
    background: var(--cd-color-input-default-bg-hover);
  }
  .cd-input-textarea-wrapper:focus-within {
    background: var(--cd-color-input-default-bg-focus);
    border: var(--cd-width-input-wrapper-focus-border) solid var(--cd-color-input-default-border-focus);
  }
  /* warning / error —— 对齐 Semi。 */
  .cd-input-textarea-wrapper-warning {
    background: var(--cd-color-input-warning-bg-default);
    border-color: var(--cd-color-input-warning-border-default);
  }
  .cd-input-textarea-wrapper-warning:hover:not(.cd-input-textarea-wrapper-disabled):not(:focus-within) {
    background: var(--cd-color-input-warning-bg-hover);
    border-color: var(--cd-color-input-warning-border-hover);
  }
  .cd-input-textarea-wrapper-warning:focus-within {
    background: var(--cd-color-input-warning-bg-focus);
    border-color: var(--cd-color-input-warning-border-focus);
  }
  .cd-input-textarea-wrapper-error {
    background: var(--cd-color-input-danger-bg-default);
    border-color: var(--cd-color-input-danger-border-default);
  }
  .cd-input-textarea-wrapper-error:hover:not(.cd-input-textarea-wrapper-disabled):not(:focus-within) {
    background: var(--cd-color-input-danger-bg-hover);
    border-color: var(--cd-color-input-danger-border-hover);
  }
  .cd-input-textarea-wrapper-error:focus-within {
    background: var(--cd-color-input-danger-bg-focus);
    border-color: var(--cd-color-input-danger-border-focus);
  }
  .cd-input-textarea-wrapper-disabled,
  .cd-input-textarea-wrapper-readonly {
    color: var(--cd-color-input-disabled-text-default);
  }
  .cd-input-textarea-wrapper-disabled {
    background: var(--cd-color-input-disabled-bg-default);
    cursor: not-allowed;
  }
  .cd-input-textarea-wrapper-disabled:hover {
    background: var(--cd-color-input-disabled-bg-default);
  }
  /* borderless —— 对齐 Semi。 */
  .cd-input-textarea-borderless:not(:focus-within):not(:hover) {
    border-color: transparent;
    background: transparent;
  }
  .cd-input-textarea-borderless:focus-within:not(:active) {
    background: transparent;
  }
  .cd-input-textarea-borderless.cd-input-textarea-wrapper-error:not(:focus-within) {
    border-color: var(--cd-color-input-danger-border-focus);
  }
  .cd-input-textarea-borderless.cd-input-textarea-wrapper-warning:not(:focus-within) {
    border-color: var(--cd-color-input-warning-border-focus);
  }

  /* textarea 元素 —— 对齐 Semi input-textarea。 */
  .cd-input-textarea {
    position: relative;
    display: block;
    inline-size: 100%;
    min-inline-size: 0;
    box-sizing: border-box;
    margin: 0;
    padding: var(--cd-spacing-textarea-paddingy) var(--cd-spacing-textarea-paddingx);
    border: var(--cd-width-textarea-border) solid var(--cd-color-textarea-border-default);
    background: transparent;
    color: var(--cd-color-input-default-text-default);
    font: inherit;
    font-size: inherit;
    line-height: 1.5;
    resize: none;
    outline: none;
    cursor: text;
  }
  .cd-input-textarea:hover {
    border-color: var(--cd-color-textarea-border-hover);
  }
  .cd-input-textarea::placeholder {
    color: var(--cd-color-input-placeholder-text-default);
  }
  .cd-input-textarea-showClear {
    padding-inline-end: var(--cd-spacing-textarea-withshowclear-paddingright);
  }
  .cd-input-textarea-autosize {
    overflow: hidden;
    resize: none;
  }
  .cd-input-textarea-wrapper-disabled .cd-input-textarea,
  .cd-input-textarea-wrapper-readonly .cd-input-textarea {
    color: var(--cd-color-input-disabled-text-default);
    cursor: not-allowed;
  }
  .cd-input-textarea-wrapper-readonly .cd-input-textarea {
    cursor: text;
  }
  .cd-input-textarea-wrapper-disabled .cd-input-textarea::placeholder,
  .cd-input-textarea-wrapper-readonly .cd-input-textarea::placeholder {
    color: var(--cd-color-input-disabled-text-default);
  }

  /* clear 按钮 —— 对齐 Semi textarea clearbtn：绝对定位右上。 */
  .cd-input-clearbtn {
    position: absolute;
    inset-block-start: 0;
    inset-inline-end: var(--cd-spacing-textarea-icon-right);
    display: flex;
    align-items: center;
    justify-content: center;
    min-inline-size: var(--cd-width-textarea-icon);
    block-size: var(--cd-height-textarea-default);
    padding: 0;
    border: none;
    background: transparent;
    color: var(--cd-color-textarea-icon-default);
    cursor: pointer;
    border-radius: var(--cd-radius-input-wrapper);
  }
  /* 图标不参与命中测试（对齐 Semi textarea `& > svg { pointer-events: none }`）：
     本库图标根为 span.cd-icon，故作用在图标容器上。 */
  .cd-input-clearbtn > :global(.cd-icon) {
    pointer-events: none;
  }
  .cd-input-clearbtn:hover {
    color: var(--cd-color-textarea-icon-hover);
  }
  .cd-input-clearbtn-hidden {
    visibility: hidden;
  }

  /* counter —— 对齐 Semi textarea-counter。 */
  .cd-input-textarea-counter {
    display: flex;
    flex-direction: column;
    justify-content: center;
    min-block-size: var(--cd-height-textarea-counter);
    padding: var(--cd-spacing-textarea-counter-paddingtop) var(--cd-spacing-textarea-counter-paddingright)
      var(--cd-spacing-textarea-counter-paddingbottom) var(--cd-spacing-textarea-counter-paddingleft);
    text-align: right;
    color: var(--cd-color-input-counter-text-default);
    font-size: var(--cd-font-size-small);
    white-space: nowrap;
  }
  .cd-input-textarea-counter-exceed {
    color: var(--cd-color-input-counter-danger-text-default);
  }

  /* 行号 —— 对齐 Semi textarea-lineNumber。 */
  .cd-input-textarea-wrapper-withLineNumber {
    display: flex;
    padding: 0;
    align-items: flex-start;
  }
  .cd-input-textarea-lineNumber {
    flex-shrink: 0;
    padding: var(--cd-spacing-textarea-paddingy) var(--cd-spacing-textarea-paddingx);
    background: var(--cd-color-fill-1);
    border-inline-end: 1px solid var(--cd-color-border);
    color: var(--cd-color-text-2);
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono',
      'Courier New', monospace;
    font-size: inherit;
    line-height: 1.5;
    text-align: right;
    user-select: none;
    min-inline-size: 36px;
    border-start-start-radius: var(--cd-radius-input-wrapper);
    border-end-start-radius: var(--cd-radius-input-wrapper);
    overflow-y: auto;
    overflow-x: hidden;
    scrollbar-width: none;
  }
  .cd-input-textarea-lineNumber::-webkit-scrollbar {
    display: none;
  }
  .cd-input-textarea-content {
    display: flex;
    flex: 1;
    min-inline-size: 0;
  }
  .cd-input-textarea-lineNumber-item {
    display: flex;
    align-items: flex-start;
    justify-content: flex-end;
    box-sizing: border-box;
  }
  .cd-input-textarea-wrapper-withLineNumber .cd-input-textarea {
    border-start-end-radius: var(--cd-radius-input-wrapper);
    border-end-end-radius: var(--cd-radius-input-wrapper);
    line-height: 1.5;
    flex: 1;
  }

  .cd-sr-only {
    position: absolute;
    inline-size: 1px;
    block-size: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
  @media (prefers-reduced-motion: reduce) {
    .cd-input-textarea-wrapper {
      transition: none;
    }
  }
</style>
