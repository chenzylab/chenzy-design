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
    /**
     * prefix/suffix 传 Snippet 时是否按「图标」计外边距（默认 true）。
     *
     * 对齐 Semi 的三态：`isString` → text 变体(12px)、`isSemiIcon` → icon 变体(8px)、
     * **其余任意 ReactNode → 两个变体都不加（外边距为 0）**。Svelte 无法内省 Snippet 的内容，
     * 缺省按最常见的图标处理；传非图标节点（如 ColorPicker 的 `%` 文本 span）时置 false，
     * 落到 Semi 的第三态，否则平白多吃 8+8px 把输入区挤窄。
     */
    affixIsIcon?: boolean;
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
    'aria-label'?: string;
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
    affixIsIcon = true,
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
    'aria-label': ariaLabel,
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
  // stopPropagation 对齐 Semi handleClear：Input 嵌在 Popover 内（如 TreeSelect）时，点击清除
  // 按钮会让该按钮从 DOM 消失，clickOutside 判定（dom.contains(e.target)）因而误判为点击外部，
  // 导致浮层意外收起；阻止事件冒泡即可避免。
  function clear(e: MouseEvent) {
    e.preventDefault(); // 阻止 mousedown 抢焦点，保持输入框聚焦
    e.stopPropagation();
    setValue('');
    onClear?.(e);
    onChange?.('', e);
    inputEl?.focus({ preventScroll });
  }

  function toggleReveal() {
    revealed = !revealed;
  }

  // modebtn mousedown/mouseup 均 preventDefault（对齐 Semi handleMouseDown/handleMouseUp）：
  // 点击密码显隐按钮时阻止其抢占 input 的焦点/光标位置。
  function handleModebtnMouseDown(e: MouseEvent) {
    e.preventDefault();
  }
  function handleModebtnMouseUp(e: MouseEvent) {
    e.preventDefault();
  }

  // wrapper 点击空白区聚焦 input（对齐 Semi handleClick）：isEventTarget 判定「点击的确实是
  // wrapper 自身」（e.target === e.currentTarget），避免点击 input/prefix/suffix/clearbtn 等
  // 子元素时重复处理——那些子元素各自已有聚焦/点击逻辑（或本就是 input 自身）。
  function handleWrapperClick(e: MouseEvent) {
    if (disabled || isFocus) return;
    if (e.target === e.currentTarget) {
      inputEl?.focus({ preventScroll });
      isFocus = true;
    }
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
      (prefix != null || insetLabel != null) && 'cd-input-wrapper-with-prefix',
      suffix != null && 'cd-input-wrapper-with-suffix',
      suffix != null && !!suffixSnippet && affixIsIcon && 'cd-input-wrapper-with-suffix-icon',
      suffixHidden && 'cd-input-wrapper-with-suffix-hidden',
      hasPrepend && 'cd-input-wrapper-with-prepend',
      hasAppend && 'cd-input-wrapper-with-append',
      hasPrepend && !hasAppend && 'cd-input-wrapper-with-prepend-only',
      hasAppend && !hasPrepend && 'cd-input-wrapper-with-append-only',
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

  /** 取底层原生 input 元素（对齐 Semi ref inputNode）。TimeInput 光标恢复等场景需读 selectionStart。 */
  export function getInputElement(): HTMLInputElement | null {
    return inputEl ?? null;
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

<!-- wrapper 严格对齐 Semi：<div> 无 role，承载 mouseenter/leave 追踪 hover（清除按钮显隐用）+
     点击空白区聚焦 input（对齐 Semi handleClick）。 -->
<!-- svelte-ignore a11y_no_static_element_interactions, a11y_click_events_have_key_events -->
<div
  class={wrapperCls}
  {style}
  aria-invalid={isError || undefined}
  onmouseenter={() => (isHovering = true)}
  onmouseleave={() => (isHovering = false)}
  onclick={handleWrapperClick}
>
  {#if addonBefore != null}
    <div class="cd-input-prepend">
      {#if addonBeforeSnippet}{@render addonBeforeSnippet()}{:else}{addonBefore}{/if}
    </div>
  {/if}

  {#if prefixNode != null}
    <!-- -prefix-text / -prefix-icon 变体同 suffix（对齐 Semi）：字符串=文案(12px)、Snippet=图标(8px)。
         insetLabel 走自己的 -inset-label 规则（Semi 同样单列），故不叠变体类。 -->
    <div
      class="cd-input-prefix"
      class:cd-input-prefix-text={!prefixSnippet && !(insetLabel != null && prefix == null)}
      class:cd-input-prefix-icon={!!prefixSnippet && affixIsIcon}
      class:cd-input-inset-label={insetLabel != null && prefix == null}
      id={insetLabelId}
    >
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
    <!-- -suffix-text / -suffix-icon 变体对齐 Semi（`isString(suffix)` → text、`isSemiIcon(suffix)` → icon）：
         两者水平外边距不同（text 12px / icon 8px），Svelte 无法内省 Snippet，故按
         「字符串=文案、Snippet=图标」映射。**别只留基类**——图标拿到 text 的 12px 会让
         suffix 占位 12+16+12=40px，与 hover 时顶替它的 clearbtn(32px) 不等宽，触发器就会抖。 -->
    <div
      class="cd-input-suffix"
      class:cd-input-suffix-text={!suffixSnippet}
      class:cd-input-suffix-icon={!!suffixSnippet && affixIsIcon}
      class:cd-input-suffix-hidden={suffixHidden}
    >
      {#if suffixSnippet}{@render suffixSnippet()}{:else}{suffix}{/if}
    </div>
  {/if}

  {#if showModeBtn}
    <!-- modebtn 严格对齐 Semi：div role=button + tabindex + aria-label（Show/Hidden password），无 aria-pressed；
         mousedown/mouseup 均 preventDefault，避免点击时抢占 input 焦点/光标位置。 -->
    <div
      role="button"
      tabindex="0"
      class="cd-input-modebtn"
      aria-label={revealed ? loc().t('Input.hidePassword') : loc().t('Input.showPassword')}
      onclick={toggleReveal}
      onmousedown={handleModebtnMouseDown}
      onmouseup={handleModebtnMouseUp}
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
    width: 100%;
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
    height: var(--cd-height-input-wrapper-default);
    line-height: var(--cd-height-input-default);
  }
  .cd-input-wrapper-small {
    height: var(--cd-height-input-wrapper-small);
    line-height: var(--cd-height-input-small);
  }
  .cd-input-wrapper-large {
    height: var(--cd-height-input-wrapper-large);
    font-size: var(--cd-font-size-header-6);
    line-height: var(--cd-height-input-large);
  }
  .cd-input-wrapper-readonly {
    cursor: default;
  }
  /* 对齐 Semi 填充式：悬浮加深底色（无前后置标签时）。 */
  .cd-input-wrapper:not(.cd-input-wrapper-with-prepend):not(.cd-input-wrapper-with-append):hover:not(.cd-input-wrapper-disabled):not(:focus-within) {
    background: var(--cd-color-input-default-bg-hover);
    border-color: var(--cd-color-input-default-border-hover);
  }
  .cd-input-wrapper:not(.cd-input-wrapper-with-prepend):not(.cd-input-wrapper-with-append):focus-within {
    background: var(--cd-color-input-default-bg-focus);
    border: var(--cd-width-input-wrapper-focus-border) solid var(--cd-color-input-default-border-focus);
  }
  .cd-input-wrapper:not(.cd-input-wrapper-with-prepend):not(.cd-input-wrapper-with-append):focus-within:hover:not(.cd-input-wrapper-warning):not(.cd-input-wrapper-error) {
    background: var(--cd-color-input-default-bg-focus-hover);
  }
  .cd-input-wrapper:not(.cd-input-wrapper-with-prepend):not(.cd-input-wrapper-with-append):focus-within:active {
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
  /* —— 前后置标签模式（对齐 Semi with-prepend/append）——
     Semi 架构：wrapper 恒透明，input/clearbtn/modebtn 各自独立描边（平时透明），
     hover 时 input 变 hover 底色并联动 clearbtn/modebtn 背景；focus 时 input 描边
     显现，并联动 clearbtn/modebtn 背景+描边+圆角，同时 input 自身在紧邻 clearbtn/
     modebtn 时去掉右侧描边（class:cd-input-sibling-clearbtn/-modebtn，避免与其
     左边框重叠成双线）。本库用 :focus-within/:hover 原生伪类等价 Semi 的
     JS state class（&-focus/&:hover），机制不同但视觉结果一致。 */
  .cd-input-wrapper-with-prepend,
  .cd-input-wrapper-with-append {
    background: transparent;
  }
  .cd-input-wrapper-with-prepend:hover,
  .cd-input-wrapper-with-append:hover {
    background: transparent;
  }
  .cd-input-wrapper-with-prepend:focus-within,
  .cd-input-wrapper-with-append:focus-within {
    background: transparent;
    border: var(--cd-width-input-wrapper-focus-border) solid var(--cd-color-input-default-border-default);
  }
  .cd-input-wrapper-with-prepend .cd-input,
  .cd-input-wrapper-with-append .cd-input {
    background: var(--cd-color-input-default-bg-default);
    border: var(--cd-width-input-wrapper-focus-border) solid transparent;
    box-sizing: border-box;
  }
  .cd-input-wrapper-with-prepend .cd-input:hover,
  .cd-input-wrapper-with-append .cd-input:hover {
    background: var(--cd-color-input-default-bg-hover);
  }
  .cd-input-wrapper-with-prepend .cd-input:hover + .cd-input-clearbtn,
  .cd-input-wrapper-with-prepend .cd-input:hover ~ .cd-input-modebtn,
  .cd-input-wrapper-with-append .cd-input:hover + .cd-input-clearbtn,
  .cd-input-wrapper-with-append .cd-input:hover ~ .cd-input-modebtn {
    background: var(--cd-color-input-default-bg-hover);
  }
  .cd-input-wrapper-with-prepend .cd-input:focus,
  .cd-input-wrapper-with-append .cd-input:focus {
    background: var(--cd-color-input-default-bg-focus);
    border-color: var(--cd-color-input-default-border-focus);
  }
  .cd-input-wrapper-with-prepend .cd-input.cd-input-sibling-clearbtn:focus,
  .cd-input-wrapper-with-prepend .cd-input.cd-input-sibling-modebtn:focus,
  .cd-input-wrapper-with-append .cd-input.cd-input-sibling-clearbtn:focus,
  .cd-input-wrapper-with-append .cd-input.cd-input-sibling-modebtn:focus {
    border-right-style: none;
  }
  .cd-input-wrapper-with-prepend .cd-input:focus + .cd-input-clearbtn,
  .cd-input-wrapper-with-prepend .cd-input:focus ~ .cd-input-modebtn,
  .cd-input-wrapper-with-append .cd-input:focus + .cd-input-clearbtn,
  .cd-input-wrapper-with-append .cd-input:focus ~ .cd-input-modebtn {
    box-sizing: border-box;
    background: var(--cd-color-input-default-bg-focus);
  }
  .cd-input-wrapper-with-prepend .cd-input:focus + .cd-input-clearbtn,
  .cd-input-wrapper-with-append .cd-input:focus + .cd-input-clearbtn {
    border: var(--cd-width-input-wrapper-focus-border) solid var(--cd-color-input-default-border-focus);
    border-left-style: none;
    border-radius: 0 var(--cd-radius-input-wrapper) var(--cd-radius-input-wrapper) 0;
  }
  .cd-input-wrapper-with-prepend .cd-input:focus + .cd-input-clearbtn:not(:last-child),
  .cd-input-wrapper-with-append .cd-input:focus + .cd-input-clearbtn:not(:last-child) {
    border-radius: 0;
  }
  .cd-input-wrapper-with-prepend .cd-input:focus ~ .cd-input-modebtn,
  .cd-input-wrapper-with-append .cd-input:focus ~ .cd-input-modebtn {
    border: var(--cd-width-input-wrapper-focus-border) solid var(--cd-color-input-default-border-focus);
    border-radius: 0 var(--cd-radius-input-wrapper) var(--cd-radius-input-wrapper) 0;
  }
  .cd-input-wrapper-with-prepend .cd-input:focus ~ .cd-input-modebtn:not(:last-child),
  .cd-input-wrapper-with-append .cd-input:focus ~ .cd-input-modebtn:not(:last-child) {
    border-radius: 0;
  }
  /* input 在 prepend/append 模式下仅自身变 active 底色（clearbtn/modebtn 不联动 active）。 */
  .cd-input-wrapper-with-prepend .cd-input:active,
  .cd-input-wrapper-with-append .cd-input:active {
    background: var(--cd-color-input-default-bg-active);
  }
  .cd-input-wrapper-with-prepend .cd-input-clearbtn,
  .cd-input-wrapper-with-prepend .cd-input-modebtn,
  .cd-input-wrapper-with-append .cd-input-clearbtn,
  .cd-input-wrapper-with-append .cd-input-modebtn {
    background: var(--cd-color-input-default-bg-default);
  }
  .cd-input-wrapper-with-prepend .cd-input-clearbtn:last-child,
  .cd-input-wrapper-with-prepend .cd-input-modebtn:last-child,
  .cd-input-wrapper-with-append .cd-input-clearbtn:last-child,
  .cd-input-wrapper-with-append .cd-input-modebtn:last-child {
    border-radius: 0 var(--cd-radius-input-wrapper) var(--cd-radius-input-wrapper) 0;
  }

  /* error/warning 变体重复整套 hover/focus/active 联动，仅换色（对齐 Semi）。 */
  .cd-input-wrapper-with-prepend.cd-input-wrapper-error,
  .cd-input-wrapper-with-append.cd-input-wrapper-error {
    border-color: transparent;
  }
  .cd-input-wrapper-with-prepend.cd-input-wrapper-error .cd-input,
  .cd-input-wrapper-with-append.cd-input-wrapper-error .cd-input {
    background: var(--cd-color-input-danger-bg-default);
    border-color: var(--cd-color-input-danger-border-default);
  }
  .cd-input-wrapper-with-prepend.cd-input-wrapper-error .cd-input:hover,
  .cd-input-wrapper-with-append.cd-input-wrapper-error .cd-input:hover {
    background: var(--cd-color-input-danger-bg-hover);
    border-color: var(--cd-color-input-danger-border-hover);
  }
  .cd-input-wrapper-with-prepend.cd-input-wrapper-error .cd-input:hover + .cd-input-clearbtn,
  .cd-input-wrapper-with-prepend.cd-input-wrapper-error .cd-input:hover ~ .cd-input-modebtn,
  .cd-input-wrapper-with-append.cd-input-wrapper-error .cd-input:hover + .cd-input-clearbtn,
  .cd-input-wrapper-with-append.cd-input-wrapper-error .cd-input:hover ~ .cd-input-modebtn {
    background: var(--cd-color-input-danger-bg-hover);
  }
  .cd-input-wrapper-with-prepend.cd-input-wrapper-error .cd-input:focus,
  .cd-input-wrapper-with-append.cd-input-wrapper-error .cd-input:focus {
    background: var(--cd-color-input-danger-bg-focus);
    border-color: var(--cd-color-input-danger-border-focus);
  }
  .cd-input-wrapper-with-prepend.cd-input-wrapper-error .cd-input:focus + .cd-input-clearbtn,
  .cd-input-wrapper-with-prepend.cd-input-wrapper-error .cd-input:focus ~ .cd-input-modebtn,
  .cd-input-wrapper-with-append.cd-input-wrapper-error .cd-input:focus + .cd-input-clearbtn,
  .cd-input-wrapper-with-append.cd-input-wrapper-error .cd-input:focus ~ .cd-input-modebtn {
    background: var(--cd-color-input-danger-bg-focus);
    border-color: var(--cd-color-input-danger-border-focus);
  }
  .cd-input-wrapper-with-prepend.cd-input-wrapper-error .cd-input:active,
  .cd-input-wrapper-with-append.cd-input-wrapper-error .cd-input:active {
    background: var(--cd-color-input-danger-bg-active);
  }
  .cd-input-wrapper-with-prepend.cd-input-wrapper-error .cd-input:active + .cd-input-clearbtn,
  .cd-input-wrapper-with-prepend.cd-input-wrapper-error .cd-input:active ~ .cd-input-modebtn,
  .cd-input-wrapper-with-append.cd-input-wrapper-error .cd-input:active + .cd-input-clearbtn,
  .cd-input-wrapper-with-append.cd-input-wrapper-error .cd-input:active ~ .cd-input-modebtn {
    background: var(--cd-color-input-danger-bg-active);
    border-color: var(--cd-color-input-danger-border-focus);
  }
  .cd-input-wrapper-with-prepend.cd-input-wrapper-error .cd-input-clearbtn,
  .cd-input-wrapper-with-prepend.cd-input-wrapper-error .cd-input-modebtn,
  .cd-input-wrapper-with-append.cd-input-wrapper-error .cd-input-clearbtn,
  .cd-input-wrapper-with-append.cd-input-wrapper-error .cd-input-modebtn {
    background: var(--cd-color-input-danger-bg-default);
  }

  .cd-input-wrapper-with-prepend.cd-input-wrapper-warning,
  .cd-input-wrapper-with-append.cd-input-wrapper-warning {
    border-color: transparent;
  }
  .cd-input-wrapper-with-prepend.cd-input-wrapper-warning .cd-input,
  .cd-input-wrapper-with-append.cd-input-wrapper-warning .cd-input {
    background: var(--cd-color-input-warning-bg-default);
    border-color: var(--cd-color-input-warning-border-default);
  }
  .cd-input-wrapper-with-prepend.cd-input-wrapper-warning .cd-input:hover,
  .cd-input-wrapper-with-append.cd-input-wrapper-warning .cd-input:hover {
    background: var(--cd-color-input-warning-bg-hover);
    border-color: var(--cd-color-input-warning-border-hover);
  }
  .cd-input-wrapper-with-prepend.cd-input-wrapper-warning .cd-input:hover + .cd-input-clearbtn,
  .cd-input-wrapper-with-prepend.cd-input-wrapper-warning .cd-input:hover ~ .cd-input-modebtn,
  .cd-input-wrapper-with-append.cd-input-wrapper-warning .cd-input:hover + .cd-input-clearbtn,
  .cd-input-wrapper-with-append.cd-input-wrapper-warning .cd-input:hover ~ .cd-input-modebtn {
    background: var(--cd-color-input-warning-bg-hover);
  }
  .cd-input-wrapper-with-prepend.cd-input-wrapper-warning .cd-input:focus,
  .cd-input-wrapper-with-append.cd-input-wrapper-warning .cd-input:focus {
    background: var(--cd-color-input-warning-bg-focus);
    border-color: var(--cd-color-input-warning-border-focus);
  }
  .cd-input-wrapper-with-prepend.cd-input-wrapper-warning .cd-input:focus + .cd-input-clearbtn,
  .cd-input-wrapper-with-prepend.cd-input-wrapper-warning .cd-input:focus ~ .cd-input-modebtn,
  .cd-input-wrapper-with-append.cd-input-wrapper-warning .cd-input:focus + .cd-input-clearbtn,
  .cd-input-wrapper-with-append.cd-input-wrapper-warning .cd-input:focus ~ .cd-input-modebtn {
    background: var(--cd-color-input-warning-bg-focus);
    border-color: var(--cd-color-input-warning-border-focus);
  }
  .cd-input-wrapper-with-prepend.cd-input-wrapper-warning .cd-input:active,
  .cd-input-wrapper-with-append.cd-input-wrapper-warning .cd-input:active {
    background: var(--cd-color-input-warning-bg-active);
  }
  .cd-input-wrapper-with-prepend.cd-input-wrapper-warning .cd-input:active + .cd-input-clearbtn,
  .cd-input-wrapper-with-prepend.cd-input-wrapper-warning .cd-input:active ~ .cd-input-modebtn,
  .cd-input-wrapper-with-append.cd-input-wrapper-warning .cd-input:active + .cd-input-clearbtn,
  .cd-input-wrapper-with-append.cd-input-wrapper-warning .cd-input:active ~ .cd-input-modebtn {
    background: var(--cd-color-input-warning-bg-active);
    border-color: var(--cd-color-input-warning-border-focus);
  }
  .cd-input-wrapper-with-prepend.cd-input-wrapper-warning .cd-input-clearbtn,
  .cd-input-wrapper-with-prepend.cd-input-wrapper-warning .cd-input-modebtn,
  .cd-input-wrapper-with-append.cd-input-wrapper-warning .cd-input-clearbtn,
  .cd-input-wrapper-with-append.cd-input-wrapper-warning .cd-input-modebtn {
    background: var(--cd-color-input-warning-bg-default);
  }

  /* suffix 为图标 + clearbtn 同时显示：clearbtn 加宽并右对齐，为二者共存腾出空间
     （对齐 Semi &__with-suffix-icon.wrapper-clearable）。 */
  .cd-input-wrapper-with-suffix-icon.cd-input-wrapper-clearable:not(.cd-input-wrapper-with-suffix-hidden)
    .cd-input-clearbtn {
    min-width: var(--cd-width-input-icon-clear-before-suffix);
    justify-content: flex-end;
  }
  /* modebtn + clearbtn 同时显示：clearbtn 收窄并居中（对齐 Semi &-modebtn.wrapper-clearable）。 */
  .cd-input-wrapper-modebtn.cd-input-wrapper-clearable .cd-input-clearbtn {
    min-width: var(--cd-width-input-icon-clear-before-modebtn);
    justify-content: center;
  }

  /* input 元素 —— 对齐 Semi .semi-input：透明底 + 继承色 + 内边距。 */
  .cd-input {
    /* 对齐 Semi .semi-input：不写 flex，用浏览器默认 `0 1 auto`（可收缩不伸长）。 */
    flex: 0 1 auto;
    width: 100%;
    min-width: 0;
    height: 100%;
    margin: 0;
    padding-left: var(--cd-spacing-input-paddingleft);
    padding-right: var(--cd-spacing-input-paddingright);
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
  .cd-input-wrapper-with-prefix .cd-input {
    padding-left: 0;
  }
  .cd-input-wrapper-with-suffix .cd-input {
    padding-right: 0;
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

  /* prefix/suffix —— 对齐 Semi `&-prefix, &-suffix { @include all-center }`：容器只做居中，
     **外边距/颜色/字重由 -text / -icon 变体分别承担**（Semi 就是这么分的）。 */
  .cd-input-prefix,
  .cd-input-suffix {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 auto;
    white-space: nowrap;
  }
  /* 文案变体（对齐 Semi `&-text`）：水平外边距 12px + text-2 + bold。 */
  .cd-input-prefix-text,
  .cd-input-suffix-text {
    margin: 0 var(--cd-spacing-input-prefix-suffix-marginx);
    color: var(--cd-color-input-prefix-text-default);
    font-weight: var(--cd-font-input-prefix-suffix-fontweight);
  }
  /* 图标变体（对齐 Semi `&-icon`）：外边距 8px（比文案窄），图标色，不吃 font-weight。
     8+16+8=32px 恰等于 clearbtn 宽度，hover 互换时宽度守恒——改小这里会让触发器抖。 */
  .cd-input-prefix-icon,
  .cd-input-suffix-icon {
    margin: var(--cd-spacing-input-prefix-icon-marginy) var(--cd-spacing-input-prefix-icon-marginx);
    color: var(--cd-color-input-icon-default);
  }
  /* clearbtn 紧邻 suffix 出现时，suffix 外边距单侧归零（对齐 Semi &-clearbtn + &-suffix）：
     clearbtn 自身已提供左侧间距，suffix 不应再叠加一份，否则二者间距翻倍。 */
  .cd-input-clearbtn + .cd-input-suffix-text,
  .cd-input-clearbtn + .cd-input-suffix-icon {
    margin-right: auto;
    margin-left: 0;
  }
  /* 内嵌标签（对齐 Semi `&-inset-label`）：自带 margin/色/字重，不依赖 -text 变体。 */
  .cd-input-inset-label {
    margin: 0 var(--cd-spacing-input-prefix-suffix-marginx);
    color: var(--cd-color-input-prefix-text-default);
    font-weight: var(--cd-font-input-prefix-suffix-fontweight);
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
    height: 100%;
    min-width: var(--cd-width-input-icon);
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
  /* 前后置标签 —— 对齐 Semi input-prepend/append：灰底 + text-2 + 分隔描边，物理属性。 */
  .cd-input-prepend,
  .cd-input-append {
    display: inline-flex;
    align-items: center;
    flex: 0 0 auto;
    height: 100%;
    padding-top: var(--cd-spacing-input-prepend-paddingy);
    padding-bottom: var(--cd-spacing-input-prepend-paddingy);
    padding-left: var(--cd-spacing-input-prepend-paddingx);
    padding-right: var(--cd-spacing-input-prepend-paddingx);
    background: var(--cd-color-input-default-bg-default);
    color: var(--cd-color-input-prefix-text-default);
    font-size: var(--cd-font-size-regular);
    white-space: nowrap;
    user-select: none;
  }
  .cd-input-prepend {
    border-radius: var(--cd-radius-input-wrapper) 0 0 var(--cd-radius-input-wrapper);
    border-right: var(--cd-width-input-prepend-border) solid
      var(--cd-color-input-default-border-default);
  }
  .cd-input-append {
    border-radius: 0 var(--cd-radius-input-wrapper) var(--cd-radius-input-wrapper) 0;
    border-left: var(--cd-width-input-append-border) solid
      var(--cd-color-input-default-border-default);
  }
  /* 前后置标签模式下 input 侧的圆角调整（对齐 Semi with-prepend-only/append-only）。 */
  .cd-input-wrapper-with-prepend:not(.cd-input-wrapper-with-append) .cd-input {
    border-radius: 0 var(--cd-radius-input-wrapper) var(--cd-radius-input-wrapper) 0;
  }
  .cd-input-wrapper-with-append:not(.cd-input-wrapper-with-prepend) .cd-input {
    border-radius: var(--cd-radius-input-wrapper) 0 0 var(--cd-radius-input-wrapper);
  }
  /* input 后面还跟着 clearbtn/modebtn（非末位子元素）时，右侧描边/圆角让位给它们承载，
     避免两条描边重叠（对齐 Semi &.wrapper__with-append-only .semi-input:not(:last-child)）。 */
  .cd-input-wrapper-with-append-only .cd-input:not(:last-child) {
    border-right-style: none;
    border-radius: 0;
  }
  .cd-input-wrapper-with-prepend-only .cd-input:not(:last-child) {
    border-right-style: none;
  }
  /* borderless —— 对齐 Semi：非悬浮/聚焦时全透明；error/warning 保留实色描边（仅这 4 条，
     与 Semi input.scss 逐条一致，不额外补选择器特异性补丁）。 */
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

  /* —— RTL（对齐 Semi input/rtl.scss）—— 物理属性正向已用 left/right，RTL 逐条镜像。 */
  :global(.cd-rtl) .cd-input-wrapper {
    direction: rtl;
  }
  :global(.cd-rtl) .cd-input-wrapper-with-prefix .cd-input {
    padding-right: 0;
    padding-left: auto;
  }
  :global(.cd-rtl) .cd-input-wrapper-with-suffix .cd-input {
    padding-left: 0;
    padding-right: auto;
  }
  :global(.cd-rtl) .cd-input {
    padding-left: var(--cd-spacing-input-paddingright);
    padding-right: var(--cd-spacing-input-paddingleft);
  }
  /* clearbtn 紧邻 suffix 时，suffix 外边距单侧归零（对齐 Semi）：LTR 收窄左侧，RTL 收窄右侧。 */
  :global(.cd-rtl) .cd-input-clearbtn + .cd-input-suffix-text,
  :global(.cd-rtl) .cd-input-clearbtn + .cd-input-suffix-icon {
    margin-left: auto;
    margin-right: 0;
  }
  :global(.cd-rtl) .cd-input-append {
    border-left: 0;
    border-right: var(--cd-width-input-append-border) solid var(--cd-color-input-default-border-default);
  }
  :global(.cd-rtl) .cd-input-prepend {
    border-right: 0;
    border-left: var(--cd-width-input-prepend-border) solid var(--cd-color-input-default-border-default);
  }
</style>
