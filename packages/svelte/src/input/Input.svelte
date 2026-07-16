<!--
  Input — 严格对齐 Semi Design（semi-ui/input/index.tsx）。
  单层 semi-input-wrapper 容器 + 原生 <input class="semi-input">，受控/非受控，IME 安全。
  DOM 结构镜像 Semi：wrapper 内直挂 prepend / prefix / input / clearbtn / suffix / modebtn / append
  （前后置标签是 wrapper 的直接子级，非外层 group）。class 用 Semi 连字符体系（cd- 前缀）。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { tick } from 'svelte';
  import { IconClear, IconEyeOpened, IconEyeClosedSolid } from '@chenzy-design/icons';
  import { useLocale } from '../locale-provider/index.js';
  import { getInputGroupContext } from './context.js';

  type Size = 'small' | 'default' | 'large';
  /** Semi 保留 success（Form 会注入），Input 不为 success 配置特殊样式但接受为合法值。 */
  type ValidateStatus = 'default' | 'warning' | 'error' | 'success';

  interface Props {
    value?: string;
    defaultValue?: string;
    size?: Size;
    disabled?: boolean;
    readonly?: boolean;
    placeholder?: string;
    /** 有内容且 hover/focus 时展示清除按钮（对齐 Semi showClear）。 */
    showClear?: boolean;
    showCount?: boolean;
    maxLength?: number;
    /** 校验状态（对齐 Semi validateStatus，仅影响展示样式）。 */
    validateStatus?: ValidateStatus;
    /** 输入框模式，password 时启用密码显隐按钮（对齐 Semi mode）。 */
    mode?: 'password';
    /** 原生 input type，透传（对齐 Semi type，可为 text/number/email/search 等任意字符串）。 */
    type?: string;
    prefix?: Snippet;
    suffix?: Snippet;
    /** 内嵌标签（渲染在输入框内左侧，与 prefix 同槽，对齐 Semi insetLabel）。 */
    insetLabel?: Snippet | string;
    /** 内嵌标签容器 id（关联 aria，对齐 Semi insetLabelId）。 */
    insetLabelId?: string;
    /** 自定义清除图标（showClear 且有值时替代内置清除图标，对齐 Semi clearIcon）。 */
    clearIcon?: Snippet;
    /** 前置标签（在输入框内左侧、prefix 更外层，如 "https://"）；传 Snippet 可自定义渲染。 */
    addonBefore?: Snippet | string;
    /** 后置标签（在输入框内右侧，如 ".com"）；传 Snippet 可自定义渲染。 */
    addonAfter?: Snippet | string;
    /** 无边框模式（对齐 Semi borderless）。 */
    borderless?: boolean;
    /** 自定义字符计数函数，替代默认 [...value].length（用于 showCount 展示与 maxLength 校验）。 */
    getValueLength?: (value: string) => number;
    /** 清除按钮与后缀并存时隐藏后缀（对齐 Semi hideSuffix）。 */
    hideSuffix?: boolean;
    /** 根容器内联样式（对齐 Semi style）。 */
    style?: string;
    /** 根容器自定义类名（对齐 Semi className）。 */
    class?: string;
    /** input 元素内联样式（对齐 Semi inputStyle）。 */
    inputStyle?: string;
    /** 调用 focus() 时传入 { preventScroll } 参数（对齐 Semi preventScroll）。 */
    preventScroll?: boolean;
    /** 组件挂载时自动聚焦（对齐 Semi autoFocus）。 */
    autoFocus?: boolean;
    /**
     * 输入法模式（对齐 Semi composition）。默认 false：拼音输入过程中每次输入都触发 onChange。
     * true：IME 未确认期间不触发 onChange，确认（compositionend）后补触发一次。
     */
    composition?: boolean;
    name?: string;
    id?: string;
    ariaLabel?: string;
    ariaLabelledby?: string;
    ariaDescribedby?: string;
    ariaErrormessage?: string;
    /** 必填语义（Form.Field required 透传）：输出 aria-required="true"。 */
    ariaRequired?: boolean;
    /** 内容变化回调（对齐 Semi：第二参为原生事件）。 */
    onChange?: (value: string, e: Event) => void;
    /** 原生 input 事件回调（对齐 Semi）。 */
    onInput?: (value: string, e: Event) => void;
    /** 点击清除按钮回调（对齐 Semi：透传鼠标事件）。 */
    onClear?: (e: MouseEvent) => void;
    /** 回车按下（对齐 Semi onEnterPress）。composition 中不触发。 */
    onEnterPress?: (e: KeyboardEvent) => void;
    onFocus?: (e: FocusEvent) => void;
    onBlur?: (e: FocusEvent) => void;
    /** 原生 keydown 透传（对齐 Semi onKeyDown）。onEnterPress 逻辑不受影响。 */
    onKeyDown?: (e: KeyboardEvent) => void;
    onKeyUp?: (e: KeyboardEvent) => void;
    onKeyPress?: (e: KeyboardEvent) => void;
    onCompositionStart?: (e: CompositionEvent) => void;
    onCompositionEnd?: (e: CompositionEvent) => void;
    onCompositionUpdate?: (e: CompositionEvent) => void;
    /**
     * 透传到原生 <input> 的其余属性（对齐 Semi Input extends InputHTMLAttributes + {...rest}）。
     * 供 InputNumber(role=spinbutton/aria-valuenow)、AutoComplete/Cascader(role=combobox/aria-expanded
     * /aria-controls/aria-activedescendant/aria-autocomplete) 等复用方透传 role 与任意 aria/data-* 属性。
     */
    [key: string]: unknown;
  }

  let {
    value = $bindable(),
    defaultValue = '',
    size: sizeProp,
    disabled: disabledProp,
    readonly = false,
    placeholder,
    showClear = false,
    showCount = false,
    maxLength,
    validateStatus = 'default',
    mode,
    type = 'text',
    prefix,
    suffix,
    insetLabel,
    insetLabelId,
    clearIcon,
    addonBefore,
    addonAfter,
    borderless = false,
    getValueLength,
    hideSuffix = false,
    style,
    class: className,
    inputStyle,
    preventScroll = false,
    autoFocus = false,
    composition = false,
    name,
    id,
    ariaLabel,
    ariaLabelledby,
    ariaDescribedby,
    ariaErrormessage,
    ariaRequired,
    onChange,
    onInput,
    onClear,
    onEnterPress,
    onFocus,
    onBlur,
    onKeyDown,
    onKeyUp,
    onKeyPress,
    onCompositionStart,
    onCompositionEnd,
    onCompositionUpdate,
    ...rest
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
  const inputType = $derived(mode === 'password' && !revealed ? 'password' : type);

  const len = $derived(getValueLength ? getValueLength(current) : [...current].length);

  function setValue(next: string) {
    // 受控时不回写 prop，仅经 onChange 上报（避免 value→onChange→value 死循环）。
    if (!isControlled) inner = next;
  }

  function handleInput(e: Event & { currentTarget: HTMLInputElement }) {
    const next = e.currentTarget.value;
    setValue(next);
    onInput?.(next, e);
    // composition 缓冲仅在 composition=true 时生效。
    if (!(composition && composing)) onChange?.(next, e);
  }

  function handleChange(e: Event & { currentTarget: HTMLInputElement }) {
    if (composition && composing) return;
    onChange?.(e.currentTarget.value, e);
  }

  function handleCompositionStart(e: CompositionEvent) {
    composing = true;
    onCompositionStart?.(e);
  }

  function handleCompositionEnd(e: CompositionEvent & { currentTarget: HTMLInputElement }) {
    composing = false;
    if (composition) {
      const next = e.currentTarget.value;
      setValue(next);
      onChange?.(next, e);
    }
    onCompositionEnd?.(e);
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' && !composing) onEnterPress?.(e);
    onKeyDown?.(e);
  }

  function clear(e: MouseEvent) {
    setValue('');
    onClear?.(e);
    onChange?.('', e);
    inputEl?.focus({ preventScroll });
  }

  function toggleReveal() {
    revealed = !revealed;
  }

  const allowClear = $derived(showClear && !disabled && !readonly && current.length > 0);
  const showModeBtn = $derived(mode === 'password' && !disabled);
  const isError = $derived(validateStatus === 'error');

  // suffix 显示条件：hideSuffix 为 true 且清除按钮可见时隐藏（对齐 Semi）。
  const suffixHidden = $derived(hideSuffix && allowClear);

  // 前缀槽（prefix 或 insetLabel，对齐 Semi renderPrefix：二者同槽）。
  const prefixNode = $derived(prefix ?? insetLabel);
  const prefixSnippet = $derived(typeof prefixNode === 'function' ? (prefixNode as Snippet) : undefined);
  const addonBeforeSnippet = $derived(typeof addonBefore === 'function' ? (addonBefore as Snippet) : undefined);
  const addonAfterSnippet = $derived(typeof addonAfter === 'function' ? (addonAfter as Snippet) : undefined);

  const wrapperCls = $derived(
    [
      'cd-input-wrapper',
      `cd-input-wrapper-${size}`,
      (prefix != null || insetLabel != null) && 'cd-input-wrapper__with-prefix',
      suffix != null && 'cd-input-wrapper__with-suffix',
      suffixHidden && 'cd-input-wrapper__with-suffix-hidden',
      addonBefore != null && 'cd-input-wrapper__with-prepend',
      addonAfter != null && 'cd-input-wrapper__with-append',
      readonly && 'cd-input-wrapper-readonly',
      disabled && 'cd-input-wrapper-disabled',
      validateStatus === 'warning' && 'cd-input-wrapper-warning',
      validateStatus === 'error' && 'cd-input-wrapper-error',
      allowClear && 'cd-input-wrapper-clearable',
      mode === 'password' && 'cd-input-wrapper-modebtn',
      borderless && 'cd-input-borderless',
      className,
    ]
      .filter(Boolean)
      .join(' '),
  );

  let inputEl = $state<HTMLInputElement | undefined>(undefined);

  /** 命令式聚焦（对齐 Semi focus()）。沿用 preventScroll prop。 */
  export function focus(): void {
    inputEl?.focus({ preventScroll });
  }

  /** 命令式失焦（对齐 Semi blur()）。 */
  export function blur(): void {
    inputEl?.blur();
  }

  $effect(() => {
    if (!autoFocus || !inputEl || disabled) return;
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

<div class={wrapperCls} {style} aria-invalid={isError || undefined}>
  {#if addonBefore != null}
    <div class="cd-input-prepend">
      {#if addonBeforeSnippet}{@render addonBeforeSnippet()}{:else}{addonBefore}{/if}
    </div>
  {/if}

  {#if prefixNode != null}
    <div class="cd-input-prefix" class:cd-input-inset-label={insetLabel != null && prefix == null} id={insetLabelId}>
      {#if prefixSnippet}{@render prefixSnippet()}{:else}{prefixNode}{/if}
    </div>
  {/if}

  <input
    bind:this={inputEl}
    {...rest}
    class="cd-input"
    class:cd-input-sibling-clearbtn={allowClear}
    class:cd-input-sibling-modebtn={mode === 'password'}
    style={inputStyle}
    type={inputType}
    {name}
    {id}
    {disabled}
    {readonly}
    {placeholder}
    maxlength={getValueLength ? undefined : maxLength}
    value={current}
    aria-label={ariaLabel}
    aria-labelledby={ariaLabelledby}
    aria-describedby={ariaDescribedby}
    aria-errormessage={ariaErrormessage}
    aria-required={ariaRequired || undefined}
    aria-invalid={isError || undefined}
    oninput={handleInput}
    onchange={handleChange}
    onkeydown={handleKeydown}
    onkeyup={onKeyUp}
    onkeypress={onKeyPress}
    oncompositionstart={handleCompositionStart}
    oncompositionend={handleCompositionEnd}
    oncompositionupdate={onCompositionUpdate}
    onfocus={onFocus}
    onblur={onBlur}
  />

  {#if allowClear}
    <button
      type="button"
      class="cd-input-clearbtn"
      aria-label={loc().t('Input.clear')}
      onclick={clear}
    >
      {#if clearIcon}
        {@render clearIcon()}
      {:else}
        <IconClear />
      {/if}
    </button>
  {/if}

  {#if suffix}
    <div class="cd-input-suffix" class:cd-input-suffix-hidden={suffixHidden}>
      {@render suffix()}
    </div>
  {/if}

  {#if showModeBtn}
    <button
      type="button"
      class="cd-input-modebtn"
      aria-label={revealed ? loc().t('Input.hidePassword') : loc().t('Input.showPassword')}
      aria-pressed={revealed}
      onclick={toggleReveal}
    >
      {#if revealed}
        <IconEyeOpened />
      {:else}
        <IconEyeClosedSolid />
      {/if}
    </button>
  {/if}

  {#if showCount}
    <span class="cd-input-count">
      {len}{#if maxLength !== undefined}/{maxLength}{/if}
    </span>
  {/if}

  {#if addonAfter != null}
    <div class="cd-input-append">
      {#if addonAfterSnippet}{@render addonAfterSnippet()}{:else}{addonAfter}{/if}
    </div>
  {/if}
</div>

<style>
  /* 输入框容器 —— 对齐 Semi input-wrapper：填充式灰底 + 透明描边，聚焦换 focus 边框。 */
  .cd-input-wrapper {
    display: inline-flex;
    align-items: center;
    position: relative;
    vertical-align: middle;
    inline-size: 100%;
    box-sizing: border-box;
    background: var(--cd-color-input-default-bg-default);
    color: var(--cd-color-input-default-text-default);
    border: var(--cd-width-input-wrapper-border) solid var(--cd-color-input-default-border-default);
    border-radius: var(--cd-radius-input-wrapper);
    font-size: var(--cd-font-size-regular);
    cursor: text;
    /* 过渡由 input 专属 token 接管（对齐 Semi animation.scss）：默认 duration=0ms。 */
    transition:
      background-color var(--cd-transition-duration-input-bg)
        var(--cd-transition-function-input-bg) var(--cd-transition-delay-input-bg),
      border var(--cd-transition-duration-input-border)
        var(--cd-transition-function-input-border) var(--cd-transition-delay-input-border);
    transform: var(--cd-transform-scale-input);
  }
  .cd-input-wrapper-default {
    block-size: var(--cd-height-input-wrapper-default);
    line-height: var(--cd-height-input-default);
  }
  .cd-input-wrapper-small {
    block-size: var(--cd-height-input-wrapper-small);
    line-height: var(--cd-height-input-small);
  }
  .cd-input-wrapper-large {
    block-size: var(--cd-height-input-wrapper-large);
    font-size: var(--cd-font-size-header-6);
    line-height: var(--cd-height-input-large);
  }
  .cd-input-wrapper-readonly {
    cursor: default;
  }
  /* 对齐 Semi 填充式：悬浮加深底色（无前后置标签时）。 */
  .cd-input-wrapper:not(.cd-input-wrapper__with-prepend):not(.cd-input-wrapper__with-append):hover:not(.cd-input-wrapper-disabled):not(:focus-within) {
    background: var(--cd-color-input-default-bg-hover);
    border-color: var(--cd-color-input-default-border-hover);
  }
  .cd-input-wrapper:not(.cd-input-wrapper__with-prepend):not(.cd-input-wrapper__with-append):focus-within {
    background: var(--cd-color-input-default-bg-focus);
    border: var(--cd-width-input-wrapper-focus-border) solid var(--cd-color-input-default-border-focus);
  }
  .cd-input-wrapper:not(.cd-input-wrapper__with-prepend):not(.cd-input-wrapper__with-append):focus-within:hover:not(.cd-input-wrapper-warning):not(.cd-input-wrapper-error) {
    background: var(--cd-color-input-default-bg-focus-hover);
  }
  .cd-input-wrapper:not(.cd-input-wrapper__with-prepend):not(.cd-input-wrapper__with-append):focus-within:active {
    background: var(--cd-color-input-default-bg-active);
    border-color: var(--cd-color-input-default-border-focus);
  }
  /* warning / error —— 对齐 Semi：浅色状态底 + 同色描边，聚焦换实色描边。 */
  .cd-input-wrapper-warning {
    background: var(--cd-color-input-warning-bg-default);
    border-color: var(--cd-color-input-warning-border-default);
  }
  .cd-input-wrapper-warning:hover:not(.cd-input-wrapper-disabled):not(:focus-within) {
    background: var(--cd-color-input-warning-bg-hover);
    border-color: var(--cd-color-input-warning-border-hover);
  }
  .cd-input-wrapper-warning:focus-within {
    background: var(--cd-color-input-warning-bg-focus);
    border-color: var(--cd-color-input-warning-border-focus);
  }
  .cd-input-wrapper-warning:active:not(.cd-input-wrapper-disabled) {
    background: var(--cd-color-input-warning-bg-active);
    border-color: var(--cd-color-input-warning-border-focus);
  }
  .cd-input-wrapper-error {
    background: var(--cd-color-input-danger-bg-default);
    border-color: var(--cd-color-input-danger-border-default);
  }
  .cd-input-wrapper-error:hover:not(.cd-input-wrapper-disabled):not(:focus-within) {
    background: var(--cd-color-input-danger-bg-hover);
    border-color: var(--cd-color-input-danger-border-hover);
  }
  .cd-input-wrapper-error:focus-within {
    background: var(--cd-color-input-danger-bg-focus);
    border-color: var(--cd-color-input-danger-border-focus);
  }
  .cd-input-wrapper-error:active:not(.cd-input-wrapper-disabled) {
    background: var(--cd-color-input-danger-bg-active);
    border-color: var(--cd-color-input-danger-border-focus);
  }
  .cd-input-wrapper-disabled {
    background: var(--cd-color-input-disabled-bg-default);
    color: var(--cd-color-input-disabled-text-default);
    -webkit-text-fill-color: var(--cd-color-input-disabled-text-default);
    cursor: not-allowed;
  }
  .cd-input-wrapper-disabled:hover {
    background: var(--cd-color-input-disabled-bg-default);
  }
  .cd-input-wrapper-disabled .cd-input-prefix,
  .cd-input-wrapper-disabled .cd-input-suffix,
  .cd-input-wrapper-disabled .cd-input-prepend,
  .cd-input-wrapper-disabled .cd-input-append,
  .cd-input-wrapper-disabled .cd-input-clearbtn,
  .cd-input-wrapper-disabled .cd-input-modebtn {
    color: var(--cd-color-input-disabled-text-default);
  }
  /* 前后置标签模式：wrapper 转透明，内部 input 自持填充底（对齐 Semi with-prepend/append）。 */
  .cd-input-wrapper__with-prepend,
  .cd-input-wrapper__with-append {
    background: transparent;
  }
  .cd-input-wrapper__with-prepend:hover,
  .cd-input-wrapper__with-append:hover {
    background: transparent;
  }
  .cd-input-wrapper__with-prepend:focus-within,
  .cd-input-wrapper__with-append:focus-within {
    background: transparent;
    border-color: var(--cd-color-input-default-border-default);
  }
  .cd-input-wrapper__with-prepend .cd-input,
  .cd-input-wrapper__with-append .cd-input {
    background: var(--cd-color-input-default-bg-default);
  }

  /* input 元素 —— 对齐 Semi .semi-input：透明底 + 继承色 + 内边距。 */
  .cd-input {
    flex: 1 1 auto;
    inline-size: 100%;
    min-inline-size: 0;
    block-size: 100%;
    margin: 0;
    padding-inline-start: var(--cd-spacing-input-paddingleft);
    padding-inline-end: var(--cd-spacing-input-paddingright);
    border: none;
    background: transparent;
    color: inherit;
    font: inherit;
    box-sizing: border-box;
    outline: none;
  }
  /* 对齐 Semi with-prefix/suffix：相应侧内边距归零，交给 prefix/suffix 槽。 */
  .cd-input-wrapper__with-prefix .cd-input {
    padding-inline-start: 0;
  }
  .cd-input-wrapper__with-suffix .cd-input {
    padding-inline-end: 0;
  }
  .cd-input::placeholder {
    color: var(--cd-color-input-placeholder-text-default);
    text-overflow: ellipsis;
  }
  .cd-input:disabled {
    cursor: not-allowed;
    color: inherit;
  }
  .cd-input-wrapper-disabled .cd-input::placeholder {
    color: var(--cd-color-input-disabled-text-default);
  }
  /* 隐藏浏览器原生密码/搜索的清除/显隐控件（对齐 Semi）。 */
  .cd-input[type='password']::-ms-reveal,
  .cd-input[type='password']::-ms-clear {
    display: none;
  }
  .cd-input[type='search']::-webkit-search-cancel-button {
    display: none;
  }

  /* prefix/suffix —— 对齐 Semi：text-2 + bold 字重（图标不受 font-weight 影响）。 */
  .cd-input-prefix,
  .cd-input-suffix {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 auto;
    margin: 0 var(--cd-spacing-input-prefix-suffix-marginx);
    color: var(--cd-color-input-prefix-text-default);
    font-weight: var(--cd-font-input-prefix-suffix-fontweight);
    white-space: nowrap;
  }
  .cd-input-inset-label {
    flex-shrink: 0;
    white-space: nowrap;
  }
  .cd-input-suffix-hidden {
    display: none;
  }
  /* clear / 密码显隐按钮 —— 对齐 Semi clearbtn/modebtn 图标三态 + outline 聚焦。 */
  .cd-input-clearbtn,
  .cd-input-modebtn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 auto;
    block-size: 100%;
    min-inline-size: var(--cd-width-input-icon);
    padding: 0;
    border: none;
    background: transparent;
    color: var(--cd-color-input-icon-default);
    cursor: pointer;
    border-radius: var(--cd-radius-input-wrapper);
  }
  .cd-input-clearbtn:hover,
  .cd-input-modebtn:hover {
    color: var(--cd-color-input-icon-hover);
  }
  .cd-input-clearbtn:active,
  .cd-input-modebtn:active {
    color: var(--cd-color-input-icon-active);
  }
  .cd-input-clearbtn:focus-visible,
  .cd-input-modebtn:focus-visible {
    outline: var(--cd-width-input-icon-outline) solid var(--cd-color-input-icon-outline);
    outline-offset: var(--cd-width-input-icon-outlineoffset);
  }
  /* 前后置标签 —— 对齐 Semi input-prepend/append：灰底 + text-2 + 分隔描边。 */
  .cd-input-prepend,
  .cd-input-append {
    display: inline-flex;
    align-items: center;
    flex: 0 0 auto;
    block-size: 100%;
    padding-block: var(--cd-spacing-input-prepend-paddingy);
    padding-inline: var(--cd-spacing-input-prepend-paddingx);
    background: var(--cd-color-input-default-bg-default);
    color: var(--cd-color-input-prefix-text-default);
    font-size: var(--cd-font-size-regular);
    white-space: nowrap;
    user-select: none;
  }
  .cd-input-prepend {
    border-inline-end: var(--cd-width-input-prepend-border) solid
      var(--cd-color-input-default-border-default);
    border-start-start-radius: var(--cd-radius-input-wrapper);
    border-end-start-radius: var(--cd-radius-input-wrapper);
  }
  .cd-input-append {
    border-inline-start: var(--cd-width-input-append-border) solid
      var(--cd-color-input-default-border-default);
    border-start-end-radius: var(--cd-radius-input-wrapper);
    border-end-end-radius: var(--cd-radius-input-wrapper);
  }
  /* 前后置标签模式下 input 侧的圆角调整（对齐 Semi with-prepend-only/append-only）。 */
  .cd-input-wrapper__with-prepend:not(.cd-input-wrapper__with-append) .cd-input {
    border-start-end-radius: var(--cd-radius-input-wrapper);
    border-end-end-radius: var(--cd-radius-input-wrapper);
  }
  .cd-input-wrapper__with-append:not(.cd-input-wrapper__with-prepend) .cd-input {
    border-start-start-radius: var(--cd-radius-input-wrapper);
    border-end-start-radius: var(--cd-radius-input-wrapper);
  }
  .cd-input-count {
    flex: 0 0 auto;
    margin-inline-end: var(--cd-spacing-input-paddingright);
    color: var(--cd-color-input-counter-text-default);
    font-size: var(--cd-font-size-small);
    white-space: nowrap;
  }
  /* borderless —— 对齐 Semi：非悬浮/聚焦时全透明；error/warning 保留实色描边。 */
  .cd-input-borderless:not(:focus-within):not(:hover) {
    background: transparent;
    border-color: transparent;
  }
  .cd-input-borderless:focus-within:not(:active) {
    background: transparent;
  }
  .cd-input-borderless.cd-input-wrapper-error:not(:focus-within) {
    border-color: var(--cd-color-input-danger-border-focus);
  }
  .cd-input-borderless.cd-input-wrapper-warning:not(:focus-within) {
    border-color: var(--cd-color-input-warning-border-focus);
  }
  @media (prefers-reduced-motion: reduce) {
    .cd-input-wrapper {
      transition: none;
    }
  }
</style>
