<!--
  Input — 严格对齐 Semi Design（semi-ui/input/index.tsx）。
  单层 semi-input-wrapper 容器 + 原生 <input class="semi-input">，受控/非受控，IME 安全。
  DOM 结构镜像 Semi：wrapper 内直挂 prepend / prefix / input / clearbtn / suffix / modebtn / append
  （前后置标签是 wrapper 的直接子级，非外层 group）。class 用 Semi 连字符体系（cd- 前缀）。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { tick } from 'svelte';
  import { truncateValueByLength, computeVisibleMinLength } from '@chenzy-design/core';
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
    maxLength?: number;
    /**
     * 最小长度（对齐 Semi minLength）：下发原生 minlength 触发浏览器校验。
     * 配合 getValueLength 时按可见长度换算（见 computeVisibleMinLength）。
     */
    minLength?: number;
    /** 校验状态（对齐 Semi validateStatus，仅影响展示样式）。 */
    validateStatus?: ValidateStatus;
    /** 输入框模式，password 时启用密码显隐按钮（对齐 Semi mode）。 */
    mode?: 'password';
    /** 原生 input type，透传（对齐 Semi type，可为 text/number/email/search 等任意字符串）。 */
    type?: string;
    /** 前缀标签（输入框内左侧）；传字符串直接渲染、传 Snippet 自定义（对齐 Semi prefix 接受 ReactNode）。 */
    prefix?: Snippet | string;
    /** 后缀标签（输入框内右侧）；传字符串直接渲染、传 Snippet 自定义（对齐 Semi suffix 接受 ReactNode）。 */
    suffix?: Snippet | string;
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
    /** 自定义字符计数函数，替代默认 [...value].length（存在时接管 maxLength 校验，maxlength 属性不下发）。 */
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
    maxLength,
    minLength,
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

  // 命令式回写 DOM value（替代声明式 value={current}）：仅当 current 与 DOM 实际值不一致时才赋值。
  // 目的：用户键入后 DOM 已是最新、current 亦经 handleInput/回流同步 → 二者相等 → 不写 DOM →
  //       原生 dirty 标志保持 → minlength 的 tooShort 等约束校验才能生效（对齐 Semi 用 state.value
  //       + React "值相等不写 DOM" 的效果）。外部程序化改 value → 二者不等 → 回写。
  // 读 current 建立响应依赖；inputEl 经 $state 绑定，mount 后此 effect 亦负责首帧值写入。
  $effect(() => {
    const v = current;
    if (inputEl && inputEl.value !== v) {
      inputEl.value = v;
    }
  });

  // 下发原生 minlength：无 getValueLength 时直接用 minLength；
  // 有 getValueLength 时按可见长度换算，使浏览器校验按可见长度触发（对齐 Semi handleVisibleMinLength）。
  const effectiveMinLength = $derived(
    minLength == null
      ? undefined
      : getValueLength
        ? computeVisibleMinLength({ value: current, minLength, getValueLength })
        : minLength,
  );

  function getInitialValue(): string {
    return defaultValue;
  }

  let composing = $state(false);
  let revealed = $state(false);
  // 悬浮 / 聚焦态（对齐 Semi isHovering / isFocus）：清除按钮仅在有内容且 hover 或 focus 时显示。
  let isHovering = $state(false);
  let isFocus = $state(false);
  const inputType = $derived(mode === 'password' && !revealed ? 'password' : type);

  function setValue(next: string) {
    // 受控时不回写 prop，仅经 onChange 上报（避免 value→onChange→value 死循环）。
    if (!isControlled) inner = next;
  }

  function handleInput(e: Event & { currentTarget: HTMLInputElement }) {
    // 自定义 getValueLength + maxLength：原生 maxlength 按 UTF-16 计不适用，
    // 在 JS 层按可见长度截断超长输入（对齐 Semi handleVisibleMaxLength）。
    // IME 组合期间不截断（避免打断拼音输入），compositionend 时再收尾。
    const raw = e.currentTarget.value;
    const next =
      getValueLength && maxLength != null && !(composition && composing)
        ? truncateValueByLength({ value: raw, maxLength, getValueLength })
        : raw;
    // 截断发生时回写 DOM，保持输入框显示与受控值一致。
    if (next !== raw && e.currentTarget.value !== next) e.currentTarget.value = next;
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
      const raw = e.currentTarget.value;
      // IME 确认后按可见长度收尾截断（对齐 Semi handleCompositionEnd）。
      const next =
        getValueLength && maxLength != null
          ? truncateValueByLength({ value: raw, maxLength, getValueLength })
          : raw;
      if (next !== raw && e.currentTarget.value !== next) e.currentTarget.value = next;
      setValue(next);
      onChange?.(next, e);
    }
    onCompositionEnd?.(e);
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' && !composing) onEnterPress?.(e);
    onKeyDown?.(e);
  }

  // clear 用 mousedown（对齐 Semi handleClear onMouseDown，fix issue 1203）：
  // 清除按钮仅在 hover/focus 时可见，用 click 会因 blur 先触发按钮消失而丢事件，故用 mousedown。
  function clear(e: MouseEvent) {
    e.preventDefault(); // 阻止 mousedown 抢焦点，保持输入框聚焦
    setValue('');
    onClear?.(e);
    onChange?.('', e);
    inputEl?.focus({ preventScroll });
  }

  function toggleReveal() {
    revealed = !revealed;
  }

  function handleFocus(e: FocusEvent) {
    isFocus = true;
    onFocus?.(e);
  }
  function handleBlur(e: FocusEvent) {
    isFocus = false;
    onBlur?.(e);
  }

  // 有内容 + showClear + 非禁用 + (聚焦 或 悬浮)（对齐 Semi isAllowClear）。
  const allowClear = $derived(
    current.length > 0 && showClear && !disabled && (isFocus || isHovering),
  );
  const showModeBtn = $derived(mode === 'password' && !disabled);
  const isError = $derived(validateStatus === 'error');

  // suffix 显示条件：hideSuffix 为 true 且清除按钮可见时隐藏（对齐 Semi）。
  const suffixHidden = $derived(hideSuffix && allowClear);

  // 前缀槽（prefix 或 insetLabel，对齐 Semi renderPrefix：二者同槽）。
  const prefixNode = $derived(prefix ?? insetLabel);
  const prefixSnippet = $derived(typeof prefixNode === 'function' ? (prefixNode as Snippet) : undefined);
  // 后缀槽（对齐 Semi renderSuffix：字符串直接渲染、Snippet 自定义）。
  const suffixSnippet = $derived(typeof suffix === 'function' ? (suffix as Snippet) : undefined);
  const addonBeforeSnippet = $derived(typeof addonBefore === 'function' ? (addonBefore as Snippet) : undefined);
  const addonAfterSnippet = $derived(typeof addonAfter === 'function' ? (addonAfter as Snippet) : undefined);

  // wrapper class 对齐 Semi（index.tsx wrapperCls）。元素类 .cd-input-prepend/-append 与渲染
  //   顺序严格镜像 Semi；wrapper 修饰类采用自洽命名（with-prepend=addonBefore/前置），并补齐 Semi
  //   的 -only 圆角变体（只有前置或只有后置时 input 相应侧保留圆角）。
  const hasPrepend = $derived(addonBefore != null);
  const hasAppend = $derived(addonAfter != null);
  const wrapperCls = $derived(
    [
      'cd-input-wrapper',
      `cd-input-wrapper-${size}`,
      (prefix != null || insetLabel != null) && 'cd-input-wrapper__with-prefix',
      suffix != null && 'cd-input-wrapper__with-suffix',
      suffixHidden && 'cd-input-wrapper__with-suffix-hidden',
      hasPrepend && 'cd-input-wrapper__with-prepend',
      hasAppend && 'cd-input-wrapper__with-append',
      hasPrepend && !hasAppend && 'cd-input-wrapper__with-prepend-only',
      hasAppend && !hasPrepend && 'cd-input-wrapper__with-append-only',
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

<!-- wrapper 严格对齐 Semi：<div> 无 role，仅承载 mouseenter/leave 追踪 hover（清除按钮显隐用）。 -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  class={wrapperCls}
  {style}
  aria-invalid={isError || undefined}
  onmouseenter={() => (isHovering = true)}
  onmouseleave={() => (isHovering = false)}
>
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
    minlength={effectiveMinLength}
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
    onfocus={handleFocus}
    onblur={handleBlur}
  />

  {#if allowClear}
    <!-- clearbtn 严格对齐 Semi：无 aria-label/role/tabindex 的 <div>，onmousedown 触发（fix issue 1203）。 -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <div class="cd-input-clearbtn" onmousedown={clear}>
      {#if clearIcon}
        {@render clearIcon()}
      {:else}
        <IconClear />
      {/if}
    </div>
  {/if}

  {#if suffix}
    <div class="cd-input-suffix" class:cd-input-suffix-hidden={suffixHidden}>
      {#if suffixSnippet}{@render suffixSnippet()}{:else}{suffix}{/if}
    </div>
  {/if}

  {#if showModeBtn}
    <!-- modebtn 严格对齐 Semi：div role=button + tabindex + aria-label（Show/Hidden password），无 aria-pressed。 -->
    <div
      role="button"
      tabindex="0"
      class="cd-input-modebtn"
      aria-label={revealed ? loc().t('Input.hidePassword') : loc().t('Input.showPassword')}
      onclick={toggleReveal}
      onkeypress={(e) => {
        if (e.key === 'Enter') toggleReveal();
      }}
    >
      {#if revealed}
        <IconEyeOpened />
      {:else}
        <IconEyeClosedSolid />
      {/if}
    </div>
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
    /* 对齐 Semi：Semi 靠全局 input reset（input { font-family/font-size: inherit }）
       让 input 继承 family/size/line-height，font-weight 走 <input> UA 默认（不继承
       父级 600）。本库无全局 input reset，故 input 自身显式继承 family/size/line-height
       （继承 wrapper 的 line-height 30px，与 Semi input 30px 一致），不设 font-weight。 */
    font-family: inherit;
    font-size: inherit;
    line-height: inherit;
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
  /* 图标不参与命中测试（对齐 Semi `& > svg { pointer-events: none }`）：本库图标根为
     span.cd-icon（内含 svg），故作用在图标容器上；令点击 target 恒为按钮本身。 */
  .cd-input-clearbtn > :global(.cd-icon),
  .cd-input-modebtn > :global(.cd-icon) {
    pointer-events: none;
  }
  .cd-input-clearbtn:hover,
  .cd-input-modebtn:hover {
    color: var(--cd-color-input-icon-hover);
  }
  .cd-input-clearbtn:active,
  .cd-input-modebtn:active {
    color: var(--cd-color-input-icon-active);
  }
  /* 仅 modebtn 可聚焦（div role=button tabindex=0）；clearbtn 无 tabindex 不可聚焦，
     故 focus-visible 只作用于 modebtn（对齐 Semi：clearbtn 是无 tabindex 的 div）。 */
  .cd-input-modebtn:focus-visible {
    border-radius: var(--cd-radius-input-wrapper);
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
