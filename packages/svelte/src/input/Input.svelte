<!--
  Input — see specs/components/input/Input.spec.md
  Token-driven, a11y-correct (native <input>), controlled / uncontrolled.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { tick } from 'svelte';
  import { useLocale } from '../locale-provider/index.js';
  import { getInputGroupContext } from './context.js';

  type Size = 'small' | 'default' | 'large';
  type Status = 'default' | 'warning' | 'error';

  interface Props {
    value?: string;
    defaultValue?: string;
    size?: Size;
    disabled?: boolean;
    readonly?: boolean;
    placeholder?: string;
    clearable?: boolean;
    showCount?: boolean;
    maxLength?: number;
    status?: Status;
    type?: 'text' | 'password';
    prefix?: Snippet;
    suffix?: Snippet;
    /** 前置标签（在 input 框外左侧，如 "https://"）；传 Snippet 可自定义渲染 */
    addonBefore?: Snippet | string;
    /** 后置标签（在 input 框外右侧，如 ".com"）；传 Snippet 可自定义渲染 */
    addonAfter?: Snippet | string;
    /** 无边框模式 */
    borderless?: boolean;
    /** 自定义字符计数函数，替代默认 value.length（用于 showCount 展示和 maxLength 校验） */
    getValueLength?: (value: string) => number;
    /** 有值时隐藏 suffix（常用于清除按钮/搜索图标场景） */
    hideSuffix?: boolean;
    /** 调用 focus() 时传入 { preventScroll } 参数 */
    preventScroll?: boolean;
    /** 组件挂载时自动聚焦 */
    autoFocus?: boolean;
    name?: string;
    id?: string;
    ariaLabel?: string;
    ariaDescribedby?: string;
    /** 必填语义（Form.Field required 透传）：输出 aria-required="true"。 */
    ariaRequired?: boolean;
    onChange?: (v: string) => void;
    onInput?: (v: string) => void;
    onClear?: () => void;
    /** 回车按下（spec §4 on:enterPress）。Enter 触发，composition 中不触发。 */
    onEnterPress?: (e: KeyboardEvent) => void;
    /** @deprecated 改用 onEnterPress（保留向后兼容）。 */
    onEnter?: (e: KeyboardEvent) => void;
    onFocus?: (e: FocusEvent) => void;
    onBlur?: (e: FocusEvent) => void;
  }

  let {
    value = $bindable(),
    defaultValue = '',
    size: sizeProp,
    disabled: disabledProp,
    readonly = false,
    placeholder,
    clearable = false,
    showCount = false,
    maxLength,
    status = 'default',
    type = 'text',
    prefix,
    suffix,
    addonBefore,
    addonAfter,
    borderless = false,
    getValueLength,
    hideSuffix = false,
    preventScroll = false,
    autoFocus = false,
    name,
    id,
    ariaLabel,
    ariaDescribedby,
    ariaRequired,
    onChange,
    onInput,
    onClear,
    onEnterPress,
    onEnter,
    onFocus,
    onBlur,
  }: Props = $props();

  const loc = useLocale();

  // InputGroup 组级默认（size/disabled）：显式 prop 始终优先，否则回退组级，再回退组件默认。
  const group = getInputGroupContext();
  const size = $derived<Size>(sizeProp ?? group?.size ?? 'default');
  const disabled = $derived<boolean>(disabledProp ?? group?.disabled ?? false);

  const isControlled = $derived(value !== undefined);
  let inner = $state(getInitialValue());
  const current = $derived(isControlled ? (value ?? '') : inner);

  function getInitialValue(): string {
    return defaultValue;
  }

  let composing = $state(false);
  let revealed = $state(false);
  const inputType = $derived(type === 'password' && !revealed ? 'password' : 'text');

  const len = $derived(getValueLength ? getValueLength(current) : [...current].length);

  function setValue(next: string) {
    // Controlled (`value=` / `bind:value`): the parent owns `value`. We do NOT
    // write the prop here — the change is propagated via `onChange` (callers
    // always invoke it). Writing the prop AND firing `onChange` is what creates
    // the value -> onChange -> value update loop (effect_update_depth_exceeded).
    // Uncontrolled: keep our own state in sync.
    if (!isControlled) inner = next;
  }

  function handleInput(e: Event & { currentTarget: HTMLInputElement }) {
    const next = e.currentTarget.value;
    setValue(next);
    onInput?.(next);
    if (!composing) onChange?.(next);
  }

  function handleChange(e: Event & { currentTarget: HTMLInputElement }) {
    if (composing) return;
    onChange?.(e.currentTarget.value);
  }

  function handleCompositionStart() {
    composing = true;
  }

  function handleCompositionEnd(e: Event & { currentTarget: HTMLInputElement }) {
    composing = false;
    const next = e.currentTarget.value;
    setValue(next);
    onChange?.(next);
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' && !composing) {
      onEnterPress?.(e);
      onEnter?.(e);
    }
  }

  function clear() {
    setValue('');
    onClear?.();
    onChange?.('');
  }

  function toggleReveal() {
    revealed = !revealed;
  }

  const showClear = $derived(clearable && !disabled && !readonly && current.length > 0);

  // suffix 显示条件：hideSuffix 为 true 且有值时隐藏
  const showSuffix = $derived(suffix && !(hideSuffix && current.length > 0));

  // addonBefore/addonAfter 的 Snippet 判断
  const addonBeforeSnippet = $derived(typeof addonBefore === 'function' ? (addonBefore as Snippet) : undefined);
  const addonAfterSnippet = $derived(typeof addonAfter === 'function' ? (addonAfter as Snippet) : undefined);

  const cls = $derived(
    [
      'cd-input',
      `cd-input--${size}`,
      `cd-input--${status}`,
      disabled && 'cd-input--disabled',
      borderless && 'cd-input--borderless',
    ]
      .filter(Boolean)
      .join(' '),
  );

  // --- autoFocus 命令式（红线 #3）---
  let inputEl = $state<HTMLInputElement | undefined>(undefined);

  $effect(() => {
    if (!autoFocus || !inputEl) return;
    const el = inputEl;
    let raf: number;
    tick().then(() => {
      raf = requestAnimationFrame(() => el.focus({ preventScroll }));
    });
    return () => {
      if (raf !== undefined) cancelAnimationFrame(raf);
    };
  });
</script>

{#if addonBefore != null || addonAfter != null}
  <div class="cd-input-group">
    {#if addonBefore != null}
      <span class="cd-input__addon cd-input__addon--before">
        {#if addonBeforeSnippet}{@render addonBeforeSnippet()}{:else}{addonBefore}{/if}
      </span>
    {/if}

    <div class={cls} aria-invalid={status === 'error' || undefined}>
      {#if prefix}<span class="cd-input__affix cd-input__prefix">{@render prefix()}</span>{/if}

      <input
        bind:this={inputEl}
        class="cd-input__native"
        type={inputType}
        {name}
        {id}
        {disabled}
        {readonly}
        {placeholder}
        maxlength={maxLength}
        value={current}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedby}
        aria-required={ariaRequired || undefined}
        aria-invalid={status === 'error' || undefined}
        oninput={handleInput}
        onchange={handleChange}
        onkeydown={handleKeydown}
        oncompositionstart={handleCompositionStart}
        oncompositionend={handleCompositionEnd}
        onfocus={onFocus}
        onblur={onBlur}
      />

      {#if showClear}
        <button
          type="button"
          class="cd-input__action cd-input__clear"
          aria-label={loc().t('Input.clear')}
          onclick={clear}
        >
          <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" focusable="false">
            <path
              fill="currentColor"
              d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1Zm2.5 9.1-1.4 1.4L8 9.4 6.5 11l-1.4-1.4L6.6 8 5.1 6.5 6.5 5.1 8 6.6 9.5 5.1l1.4 1.4L9.4 8l1.1 1.1Z"
            />
          </svg>
        </button>
      {/if}

      {#if type === 'password'}
        <button
          type="button"
          class="cd-input__action cd-input__reveal"
          aria-label={revealed ? loc().t('Input.hidePassword') : loc().t('Input.showPassword')}
          aria-pressed={revealed}
          onclick={toggleReveal}
        >
          <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" focusable="false">
            {#if revealed}
              <path
                fill="currentColor"
                d="M8 3C4.5 3 1.7 5.1.5 8c1.2 2.9 4 5 7.5 5s6.3-2.1 7.5-5C14.3 5.1 11.5 3 8 3Zm0 8a3 3 0 1 1 0-6 3 3 0 0 1 0 6Zm0-4.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Z"
              />
            {:else}
              <path
                fill="currentColor"
                d="M2.1 1.4 1 2.5l2.3 2.3C2 5.6 1 6.7.5 8c1.2 2.9 4 5 7.5 5 1.3 0 2.6-.3 3.7-.8l2.3 2.3 1.1-1.1L2.1 1.4ZM8 11a3 3 0 0 1-2.8-4.1l1.3 1.3a1.5 1.5 0 0 0 2.3 2.3l1.3 1.3c-.6.2-1.3.2-2.1.2Zm0-8c3.5 0 6.3 2.1 7.5 5-.5 1.1-1.2 2.1-2.1 2.8l-2-2A3 3 0 0 0 8 5h-.4L6.1 3.5C6.7 3.2 7.3 3 8 3Z"
              />
            {/if}
          </svg>
        </button>
      {/if}

      {#if showCount}
        <span class="cd-input__count">
          {len}{#if maxLength !== undefined}/{maxLength}{/if}
        </span>
      {/if}

      {#if showSuffix}<span class="cd-input__affix cd-input__suffix">{@render suffix!()}</span>{/if}
    </div>

    {#if addonAfter != null}
      <span class="cd-input__addon cd-input__addon--after">
        {#if addonAfterSnippet}{@render addonAfterSnippet()}{:else}{addonAfter}{/if}
      </span>
    {/if}
  </div>
{:else}
  <div class={cls} aria-invalid={status === 'error' || undefined}>
    {#if prefix}<span class="cd-input__affix cd-input__prefix">{@render prefix()}</span>{/if}

    <input
      bind:this={inputEl}
      class="cd-input__native"
      type={inputType}
      {name}
      {id}
      {disabled}
      {readonly}
      {placeholder}
      maxlength={maxLength}
      value={current}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedby}
      aria-required={ariaRequired || undefined}
      aria-invalid={status === 'error' || undefined}
      oninput={handleInput}
      onchange={handleChange}
      onkeydown={handleKeydown}
      oncompositionstart={handleCompositionStart}
      oncompositionend={handleCompositionEnd}
      onfocus={onFocus}
      onblur={onBlur}
    />

    {#if showClear}
      <button
        type="button"
        class="cd-input__action cd-input__clear"
        aria-label={loc().t('Input.clear')}
        onclick={clear}
      >
        <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" focusable="false">
          <path
            fill="currentColor"
            d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1Zm2.5 9.1-1.4 1.4L8 9.4 6.5 11l-1.4-1.4L6.6 8 5.1 6.5 6.5 5.1 8 6.6 9.5 5.1l1.4 1.4L9.4 8l1.1 1.1Z"
          />
        </svg>
      </button>
    {/if}

    {#if type === 'password'}
      <button
        type="button"
        class="cd-input__action cd-input__reveal"
        aria-label={revealed ? loc().t('Input.hidePassword') : loc().t('Input.showPassword')}
        aria-pressed={revealed}
        onclick={toggleReveal}
      >
        <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" focusable="false">
          {#if revealed}
            <path
              fill="currentColor"
              d="M8 3C4.5 3 1.7 5.1.5 8c1.2 2.9 4 5 7.5 5s6.3-2.1 7.5-5C14.3 5.1 11.5 3 8 3Zm0 8a3 3 0 1 1 0-6 3 3 0 0 1 0 6Zm0-4.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Z"
            />
          {:else}
            <path
              fill="currentColor"
              d="M2.1 1.4 1 2.5l2.3 2.3C2 5.6 1 6.7.5 8c1.2 2.9 4 5 7.5 5 1.3 0 2.6-.3 3.7-.8l2.3 2.3 1.1-1.1L2.1 1.4ZM8 11a3 3 0 0 1-2.8-4.1l1.3 1.3a1.5 1.5 0 0 0 2.3 2.3l1.3 1.3c-.6.2-1.3.2-2.1.2Zm0-8c3.5 0 6.3 2.1 7.5 5-.5 1.1-1.2 2.1-2.1 2.8l-2-2A3 3 0 0 0 8 5h-.4L6.1 3.5C6.7 3.2 7.3 3 8 3Z"
            />
          {/if}
        </svg>
      </button>
    {/if}

    {#if showCount}
      <span class="cd-input__count">
        {len}{#if maxLength !== undefined}/{maxLength}{/if}
      </span>
    {/if}

    {#if showSuffix}<span class="cd-input__affix cd-input__suffix">{@render suffix!()}</span>{/if}
  </div>
{/if}

<style>
  .cd-input-group {
    display: inline-flex;
    align-items: stretch;
    inline-size: 100%;
  }
  /* 前/后置标签 —— 对齐 Semi input-prepend/append：灰底 + text-2 + 透明分隔描边 */
  .cd-input__addon {
    display: inline-flex;
    align-items: center;
    flex: 0 0 auto;
    padding-block: var(--cd-spacing-input-prepend-paddingy);
    padding-inline: var(--cd-spacing-input-prepend-paddingx);
    background: var(--cd-color-input-default-bg-default);
    color: var(--cd-color-input-prefix-text-default);
    font-size: var(--cd-input-font-size);
    white-space: nowrap;
    user-select: none;
  }
  .cd-input__addon--before {
    border-inline-end: var(--cd-width-input-prepend-border) solid
      var(--cd-color-input-default-border-default);
    border-start-start-radius: var(--cd-radius-input-wrapper);
    border-end-start-radius: var(--cd-radius-input-wrapper);
  }
  .cd-input__addon--after {
    border-inline-start: var(--cd-width-input-append-border) solid
      var(--cd-color-input-default-border-default);
    border-start-end-radius: var(--cd-radius-input-wrapper);
    border-end-end-radius: var(--cd-radius-input-wrapper);
  }
  /* 有 addon 时，input wrapper 的圆角需要调整 */
  .cd-input-group .cd-input {
    flex: 1 1 auto;
    min-inline-size: 0;
  }
  .cd-input-group .cd-input:not(:first-child) {
    border-start-start-radius: 0;
    border-end-start-radius: 0;
  }
  .cd-input-group .cd-input:not(:last-child) {
    border-start-end-radius: 0;
    border-end-end-radius: 0;
  }
  /* 输入框容器 —— 对齐 Semi input-wrapper：填充式灰底 + 透明描边，聚焦换 focus 边框 */
  .cd-input {
    display: inline-flex;
    align-items: center;
    gap: var(--cd-spacing-input-prefix-icon-marginx);
    inline-size: 100%;
    block-size: var(--cd-height-input-wrapper-default);
    padding-inline-start: var(--cd-spacing-input-paddingleft);
    padding-inline-end: var(--cd-spacing-input-paddingright);
    background: var(--cd-color-input-default-bg-default);
    color: var(--cd-color-input-default-text-default);
    border: var(--cd-width-input-wrapper-border) solid var(--cd-color-input-default-border-default);
    border-radius: var(--cd-radius-input-wrapper);
    font-size: var(--cd-input-font-size);
    line-height: var(--cd-height-input-default);
    /* 过渡/变换由 input 专属 transition/transform token 接管（对齐 Semi animation.scss）：
       默认 duration=0ms（无过渡），主题/DSM 可开启。 */
    transition:
      background-color var(--cd-transition-duration-input-bg)
        var(--cd-transition-function-input-bg) var(--cd-transition-delay-input-bg),
      border var(--cd-transition-duration-input-border)
        var(--cd-transition-function-input-border) var(--cd-transition-delay-input-border);
    transform: var(--cd-transform-scale-input);
  }
  /* Semi：small/default 字号统一 regular，仅 large 用 header-6 */
  .cd-input--small {
    block-size: var(--cd-height-input-wrapper-small);
    line-height: var(--cd-height-input-small);
  }
  .cd-input--large {
    block-size: var(--cd-height-input-wrapper-large);
    font-size: var(--cd-font-size-header-6);
    line-height: var(--cd-height-input-large);
  }
  /* 对齐 Semi 填充式：悬浮加深底色 */
  .cd-input:hover:not(.cd-input--disabled):not(:focus-within) {
    background: var(--cd-color-input-default-bg-hover);
    border-color: var(--cd-color-input-default-border-hover);
  }
  .cd-input:focus-within {
    background: var(--cd-color-input-default-bg-focus);
    border-color: var(--cd-color-input-default-border-focus);
  }
  .cd-input:focus-within:hover:not(.cd-input--warning):not(.cd-input--error) {
    background: var(--cd-color-input-default-bg-focus-hover);
  }
  .cd-input:focus-within:active {
    background: var(--cd-color-input-default-bg-active);
    border-color: var(--cd-color-input-default-border-focus);
  }
  /* warning / error —— 对齐 Semi：浅色状态底 + 同色描边，聚焦换实色描边 */
  .cd-input--warning {
    background: var(--cd-color-input-warning-bg-default);
    border-color: var(--cd-color-input-warning-border-default);
  }
  .cd-input--warning:hover:not(.cd-input--disabled):not(:focus-within) {
    background: var(--cd-color-input-warning-bg-hover);
    border-color: var(--cd-color-input-warning-border-hover);
  }
  .cd-input--warning:focus-within {
    background: var(--cd-color-input-warning-bg-focus);
    border-color: var(--cd-color-input-warning-border-focus);
  }
  .cd-input--warning:active:not(.cd-input--disabled) {
    background: var(--cd-color-input-warning-bg-active);
    border-color: var(--cd-color-input-warning-border-focus);
  }
  .cd-input--error {
    background: var(--cd-color-input-danger-bg-default);
    border-color: var(--cd-color-input-danger-border-default);
  }
  .cd-input--error:hover:not(.cd-input--disabled):not(:focus-within) {
    background: var(--cd-color-input-danger-bg-hover);
    border-color: var(--cd-color-input-danger-border-hover);
  }
  .cd-input--error:focus-within {
    background: var(--cd-color-input-danger-bg-focus);
    border-color: var(--cd-color-input-danger-border-focus);
  }
  .cd-input--error:active:not(.cd-input--disabled) {
    background: var(--cd-color-input-danger-bg-active);
    border-color: var(--cd-color-input-danger-border-focus);
  }
  .cd-input--disabled {
    background: var(--cd-color-input-disabled-bg-default);
    color: var(--cd-color-input-disabled-text-default);
    /* fix：Safari 下禁用态文字颜色（对齐 Semi） */
    -webkit-text-fill-color: var(--cd-color-input-disabled-text-default);
    cursor: not-allowed;
  }
  .cd-input--disabled:hover {
    background: var(--cd-color-input-disabled-bg-default);
  }
  .cd-input--disabled .cd-input__affix,
  .cd-input--disabled .cd-input__action {
    color: var(--cd-color-input-disabled-text-default);
  }
  /* borderless —— 对齐 Semi：非悬浮/聚焦时全透明；error/warning 保留实色描边 */
  .cd-input--borderless:not(:focus-within):not(:hover) {
    background: transparent;
    border-color: transparent;
  }
  .cd-input--borderless:focus-within:not(:active) {
    background: transparent;
  }
  .cd-input--borderless.cd-input--error:not(:focus-within) {
    border-color: var(--cd-color-input-danger-border-focus);
  }
  .cd-input--borderless.cd-input--warning:not(:focus-within) {
    border-color: var(--cd-color-input-warning-border-focus);
  }
  .cd-input__native {
    flex: 1 1 auto;
    inline-size: 100%;
    min-inline-size: 0;
    block-size: 100%;
    margin: 0;
    padding: 0;
    border: none;
    background: transparent;
    color: inherit;
    font: inherit;
    outline: none;
  }
  .cd-input__native::placeholder {
    color: var(--cd-color-input-placeholder-text-default);
  }
  .cd-input__native:disabled {
    cursor: not-allowed;
  }
  .cd-input--disabled .cd-input__native::placeholder {
    color: var(--cd-color-input-disabled-text-default);
  }
  /* prefix/suffix —— 对齐 Semi：text-2 + bold 字重（图标不受 font-weight 影响） */
  .cd-input__affix {
    display: inline-flex;
    align-items: center;
    color: var(--cd-color-input-prefix-text-default);
    font-weight: var(--cd-font-input-prefix-suffix-fontweight);
    flex: 0 0 auto;
  }
  /* clear / 密码显隐按钮 —— 对齐 Semi clearbtn/modebtn 图标三态 + outline 聚焦 */
  .cd-input__action {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 auto;
    padding: 0;
    border: none;
    background: transparent;
    color: var(--cd-color-input-icon-default);
    cursor: pointer;
    border-radius: var(--cd-radius-input-wrapper);
  }
  .cd-input__action:hover {
    color: var(--cd-color-input-icon-hover);
  }
  .cd-input__action:active {
    color: var(--cd-color-input-icon-active);
  }
  .cd-input__action:focus-visible {
    outline: var(--cd-width-input-icon-outline) solid var(--cd-color-input-icon-outline);
    outline-offset: var(--cd-width-input-icon-outlineoffset);
  }
  .cd-input__count {
    flex: 0 0 auto;
    color: var(--cd-color-input-counter-text-default);
    font-size: var(--cd-font-size-small);
    white-space: nowrap;
  }
  @media (prefers-reduced-motion: reduce) {
    .cd-input {
      transition: none;
    }
  }
</style>
