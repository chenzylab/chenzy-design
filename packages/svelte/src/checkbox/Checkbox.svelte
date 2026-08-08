<!--
  Checkbox — 严格对齐 Semi（checkbox.tsx / checkboxInner.tsx）。
  Works standalone (controlled / uncontrolled) or inside CheckboxGroup via context.
  DOM class 镜像 Semi 连字符体系（cd-checkbox / -inner / -inner-display / -addon / -content）。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { useId } from '@chenzy-design/core';
  import CheckboxInner from './CheckboxInner.svelte';
  import {
    getCheckboxGroupContext,
    type CheckboxValue,
    type CheckboxType,
    type CheckboxEvent,
  } from './context.js';

  interface Props {
    checked?: boolean;
    defaultChecked?: boolean;
    indeterminate?: boolean;
    value?: CheckboxValue;
    disabled?: boolean;
    /** Display form. card adds border+background and expands the hit area to the whole card; pureCard hides the box. */
    type?: CheckboxType;
    name?: string;
    /** 辅助说明，可传富内容（对齐 Semi ReactNode）。 */
    extra?: Snippet | string;
    id?: string;
    addonId?: string;
    extraId?: string;
    preventScroll?: boolean;
    /** 无可见文本 label 时提供可访问名（如嵌在 Tree 行内、label 由外部承载时）。 */
    'aria-label'?: string;
    /** 关联外部 label 的 id（对齐 Semi withField aria-labelledby 注入）。 */
    ariaLabelledby?: string;
    /** 关联外部辅助说明的 id（对齐 Semi withField aria-describedby 注入）。 */
    ariaDescribedby?: string;
    /** 关联外部错误提示的 id（对齐 Semi withField aria-errormessage 注入）。 */
    ariaErrormessage?: string;
    /** 标记为必填（对齐 Semi withField aria-required 注入）。 */
    ariaRequired?: boolean;
    /** a11y: 标记为无效（校验失败时，对齐 Semi aria-invalid）。 */
    ariaInvalid?: boolean;
    /** a11y: wrapper role（对齐 Semi 默认不设置——role=checkbox 语义由内层原生 input 天然承载；
     *  Group 内由 CheckboxGroup 显式传入 listitem）。 */
    role?: string;
    /** 根 wrapper 的 tabindex（对齐 Semi tabIndex，a11y: wrapper tabIndex；grid roving 场景用，缺省不设）。 */
    tabindex?: number | undefined;
    /** 挂载后自动聚焦（对齐 Semi autoFocus）。 */
    autoFocus?: boolean;
    /** 根容器内联样式（对齐 Semi style，可设 width 等）。 */
    style?: string;
    /** 根容器自定义类名（与内置 cd-checkbox 并存，对齐 Semi className）。 */
    class?: string;
    onChange?: (e: CheckboxEvent) => void;
    children?: Snippet;
  }

  let {
    checked = $bindable(),
    defaultChecked = false,
    indeterminate = false,
    value,
    disabled = false,
    type = 'default',
    name,
    extra,
    id,
    addonId,
    extraId: extraIdProp,
    preventScroll,
    'aria-label': ariaLabel,
    ariaLabelledby,
    ariaDescribedby,
    ariaErrormessage,
    ariaRequired,
    ariaInvalid,
    role,
    tabindex,
    autoFocus,
    style,
    class: className,
    onChange,
    children,
  }: Props = $props();

  const group = getCheckboxGroupContext();

  const fieldId = resolveId();
  const extraId = $derived(extraIdProp ?? (extra ? `${fieldId}-extra` : undefined));
  // 有可见标签内容时自动生成 addonId 关联 aria-labelledby（对齐 Semi setAddonId）。
  const resolvedAddonId = $derived(addonId ?? (children ? `${fieldId}-addon` : undefined));

  function resolveId(): string {
    return id ?? useId('cd-checkbox');
  }

  const isControlled = $derived(checked !== undefined);
  let inner = $state(getInitialChecked());
  let innerEntity = $state<CheckboxInner | null>(null);
  // 对齐 Semi checkboxFoundation clickState/focusVisible：区分「点击触发的 focus」与
  // 「键盘导航触发的 focus」。纯 CSS :focus-visible 在“JS 主动 focus()”场景会被浏览器
  // 判定为需要展示焦点环（与 Semi 鼠标点击后无焦点环的实测行为不符），故用 JS 显式过滤。
  let clickState = false;
  let focusVisible = $state(false);

  function getInitialChecked(): boolean {
    return defaultChecked;
  }

  /** Imperatively focus the native checkbox input (honors `preventScroll`，对齐 Semi Checkbox.focus). */
  export function focus(): void {
    innerEntity?.focus(preventScroll !== undefined ? { preventScroll } : undefined);
  }

  /** Imperatively blur the native checkbox input（对齐 Semi Checkbox.blur）. */
  export function blur(): void {
    innerEntity?.blur();
  }

  $effect(() => {
    if (autoFocus) focus();
  });

  const isChecked = $derived(
    group && value !== undefined
      ? group.isChecked(value)
      : isControlled
        ? !!checked
        : inner,
  );

  const resolvedDisabled = $derived(disabled || (group ? group.getDisabled() : false));
  const resolvedName = $derived(name ?? group?.getName());
  // Group transparently provides `type`; a per-item non-default `type` overrides it.
  const resolvedType = $derived(type !== 'default' ? type : (group?.getType() ?? 'default'));
  const isCardType = $derived(resolvedType === 'card' || resolvedType === 'pureCard');
  const isPureCardType = $derived(resolvedType === 'pureCard');

  /** 构造对齐 Semi 的 CheckboxEvent（checkbox.tsx:104-126）。 */
  function makeEvent(next: boolean, e: Event): CheckboxEvent {
    return {
      target: { checked: next, value },
      stopPropagation: () => e.stopPropagation(),
      preventDefault: () => e.preventDefault(),
      nativeEvent: {
        stopImmediatePropagation: () => e.stopImmediatePropagation(),
      },
    };
  }

  // 对齐 Semi：切换的唯一入口是根 span 的 onClick={handleChange}（checkbox.tsx:299）。
  // 原生 input 铺满 inner 且可交互（无 pointer-events:none），点击 input 时浏览器会先原生翻转
  // input.checked，但该原生 click 冒泡到根 span 后仍会走同一 handleChange —— newChecked 由
  // isChecked（受控派生值）取反算出，与 DOM 当前值无关；随后重渲染把 input.checked 强制回写为
  // isChecked，两者结果一致，不会有二次跳变（对齐 Semi CheckboxInner input onChange=noop，
  // 真正状态变更只发生一次）。键盘 Space 在聚焦的原生 checkbox 上会自动派发 click 并冒泡到此，
  // 天然复用同一入口，无需为 Space 单独写逻辑（对齐 Semi 未处理 Space，只处理 Enter）。
  function commit(next: boolean, e: Event) {
    const evt = makeEvent(next, e);
    if (group && value !== undefined) {
      group.toggle(value, evt);
      onChange?.(evt);
      return;
    }
    // Controlled (`checked=` / `bind:checked`): parent owns `checked`; propagate
    // only via `onChange`. Writing the prop AND firing `onChange` loops.
    // Uncontrolled: keep our own state in sync.
    if (!isControlled) inner = next;
    onChange?.(evt);
  }

  /** 根 span 的 click（对齐 Semi handleChange，唯一切换入口）。点击先置 clickState，
   *  紧随其后的 focus() 触发 input 的 focus 事件时会被 handleInputFocus 读到并跳过，
   *  不产生焦点环（对齐 Semi handleChange: e.type==='click' 时 this.clickState=true）。 */
  function handleChange(e: MouseEvent) {
    if (resolvedDisabled) return;
    clickState = true;
    focus();
    commit(indeterminate && !isChecked ? true : !isChecked, e);
  }

  /** input 的 change 是 noop（对齐 Semi CheckboxInner onChange=noop）：原生 toggle 已被上面
   *  的根 span click 处理并受控回写，这里只需阻止浏览器对未受控属性做任何额外反应。 */
  function handleInputChange(_e: Event) {}

  /** 对齐 Semi handleFocusVisible：点击引发的 focus 消费掉 clickState 后直接跳过；
   *  其余（Tab 键盘导航）情形才依据浏览器 :focus-visible 判定决定是否显示焦点环。 */
  function handleInputFocus(e: FocusEvent) {
    if (clickState) {
      clickState = false;
      return;
    }
    const target = e.target as HTMLElement;
    try {
      if (target.matches(':focus-visible')) focusVisible = true;
    } catch {
      // 当前浏览器不支持 :focus-visible（对齐 Semi warning 分支，静默降级不展示焦点环）。
    }
  }

  /** 对齐 Semi handleBlur：失焦清空 clickState 与 focusVisible。 */
  function handleInputBlur(_e: FocusEvent) {
    clickState = false;
    focusVisible = false;
  }

  /** Enter 切换（对齐 Semi handleEnterPress）。原生 checkbox 只认 Space，Enter 是 Semi 额外行为。 */
  function handleKeydown(e: KeyboardEvent) {
    if (resolvedDisabled) return;
    if (e.key === 'Enter') {
      e.preventDefault();
      commit(indeterminate && !isChecked ? true : !isChecked, e);
    }
  }

  // 对齐 Semi：focusOuter = isCardType || isPureCardType（card/pureCard 整卡展示焦点环，
  // 否则焦点环画在 inner-display 上）。
  const focusOuter = $derived(isCardType || isPureCardType);
  const showInnerFocus = $derived(focusVisible && !focusOuter);
  const showOuterFocus = $derived(focusVisible && focusOuter);

  const cls = $derived(
    [
      'cd-checkbox',
      isChecked ? 'cd-checkbox-checked' : 'cd-checkbox-unChecked',
      indeterminate && !isChecked && 'cd-checkbox-indeterminate',
      resolvedDisabled && 'cd-checkbox-disabled',
      isCardType && 'cd-checkbox-cardType',
      isCardType && resolvedDisabled && 'cd-checkbox-cardType_disabled',
      isCardType && !resolvedDisabled && 'cd-checkbox-cardType_enable',
      isCardType && isChecked && !resolvedDisabled && 'cd-checkbox-cardType_checked',
      isCardType && isChecked && resolvedDisabled && 'cd-checkbox-cardType_checked_disabled',
      showOuterFocus && 'cd-checkbox-focus',
      className,
    ]
      .filter(Boolean)
      .join(' '),
  );

  const extraIsString = $derived(typeof extra === 'string');
</script>

<!-- Semi 注释：label 更好，但用 span 是为规避 gitlab #364（对齐 Semi 根用 span 非 label）。
     切换挂在根 span 的 click 上（对齐 Semi onClick={handleChange}），点击整个 checkbox（含
     addon 文本 / extra / card）都切换；原生 input 只承载焦点 / a11y / 受控 checked。
     根 span 的 aria-labelledby 只回显外部传入值（对齐 checkbox.tsx render），内部 addonId 关联
     另在 CheckboxInner 的 input 上单独设置（对齐 checkboxInner.tsx input aria-labelledby={addonId}）。 -->
<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<span
  class={cls}
  {style}
  {id}
  {role}
  {tabindex}
  aria-labelledby={ariaLabelledby}
  onclick={handleChange}
  onkeypress={handleKeydown}
>
  <CheckboxInner
    bind:this={innerEntity}
    indeterminate={indeterminate && !isChecked}
    checked={isChecked}
    disabled={resolvedDisabled}
    name={resolvedName}
    {value}
    {isPureCardType}
    addonId={children ? resolvedAddonId : undefined}
    extraId={extra ? extraId : undefined}
    aria-label={ariaLabel}
    ariaDescribedby={ariaDescribedby}
    ariaErrormessage={ariaErrormessage}
    ariaRequired={ariaRequired}
    ariaInvalid={ariaInvalid}
    focusInner={showInnerFocus}
    onInputChange={handleInputChange}
    onInputFocus={handleInputFocus}
    onInputBlur={handleInputBlur}
  />
  {#if children || extra}
    <div class="cd-checkbox-content">
      {#if children}<span class="cd-checkbox-addon" id={resolvedAddonId}>{@render children()}</span>{/if}
      {#if extra}
        <div
          class="cd-checkbox-extra"
          class:cd-checkbox-cardType_extra_noChildren={isCardType && !children}
          id={extraId}
        >
          {#if extraIsString}{extra}{:else}{@render (extra as Snippet)()}{/if}
        </div>
      {/if}
    </div>
  {/if}
</span>

<style>
  .cd-checkbox {
    box-sizing: border-box;
    position: relative;
    display: inline-flex;
    align-items: flex-start;
    column-gap: var(--cd-spacing-checkbox-label-paddingleft);
    color: var(--cd-color-checkbox-label-text-default);
    cursor: pointer;
    /* 对齐 Semi checkbox.scss:44 `line-height: $font-checkbox_label-lineHeight`
       —— Semi 用的是组件专属变量，本库对应 token 同名同值，故消费它而非通用刻度。 */
    line-height: var(--cd-font-checkbox-label-lineheight);
    transform: var(--cd-transform-scale-checkbox);
    transition:
      background-color var(--cd-transition-duration-checkbox-bg) var(--cd-transition-function-checkbox-bg)
        var(--cd-transition-delay-checkbox-bg),
      border-color var(--cd-transition-duration-checkbox-border) var(--cd-transition-function-checkbox-border)
        var(--cd-transition-delay-checkbox-border);
  }
  .cd-checkbox-disabled {
    cursor: not-allowed;
  }

  /* inner/input/inner-display 现在渲染自子组件 CheckboxInner.svelte，样式定义随 DOM 迁移到那边
     （Svelte scoped CSS 按文件生效，父组件里写这些选择器不会命中子组件渲染的元素）。此处仅保留
     跨组件边界的组合选择器（:hover 等状态类在父 wrapper 上，需 :global() 打透子组件的 inner-display）。 */

  /* 未选中态悬浮（对齐 Semi：描边 focus-border、背景 fill-0） */
  .cd-checkbox:hover:not(.cd-checkbox-disabled):not(.cd-checkbox-checked):not(.cd-checkbox-indeterminate)
    :global(.cd-checkbox-inner-display) {
    background: var(--cd-color-checkbox-default-bg-hover);
    box-shadow: inset 0 0 0 var(--cd-size-checkbox-inner-shadow) var(--cd-color-checkbox-default-border-hover);
  }
  /* 未选中态按下 */
  .cd-checkbox:active:not(.cd-checkbox-disabled):not(.cd-checkbox-checked):not(.cd-checkbox-indeterminate)
    :global(.cd-checkbox-inner-display) {
    background: var(--cd-color-checkbox-default-bg-active);
  }

  /* 选中 / 半选态 */
  .cd-checkbox-checked :global(.cd-checkbox-inner-display),
  .cd-checkbox-indeterminate :global(.cd-checkbox-inner-display) {
    background: var(--cd-color-checkbox-checked-bg-default);
    color: var(--cd-color-checkbox-checked-icon-default);
    box-shadow: inset 0 0 0 var(--cd-size-checkbox-inner-shadow) var(--cd-color-checkbox-checked-border-default);
  }
  .cd-checkbox-checked:hover:not(.cd-checkbox-disabled) :global(.cd-checkbox-inner-display),
  .cd-checkbox-indeterminate:hover:not(.cd-checkbox-disabled) :global(.cd-checkbox-inner-display) {
    background: var(--cd-color-checkbox-checked-bg-hover);
    box-shadow: inset 0 0 0 var(--cd-size-checkbox-inner-shadow) var(--cd-color-checkbox-checked-border-hover);
  }
  .cd-checkbox-checked:active:not(.cd-checkbox-disabled) :global(.cd-checkbox-inner-display),
  .cd-checkbox-indeterminate:active:not(.cd-checkbox-disabled) :global(.cd-checkbox-inner-display) {
    background: var(--cd-color-checkbox-checked-bg-active);
    box-shadow: inset 0 0 0 var(--cd-size-checkbox-inner-shadow) var(--cd-color-checkbox-checked-border-active);
  }

  /* 禁用态 */
  .cd-checkbox-disabled :global(.cd-checkbox-inner-display) {
    background: var(--cd-color-checkbox-disabled-bg-default);
    box-shadow: inset 0 0 0 var(--cd-size-checkbox-inner-shadow) var(--cd-color-checkbox-disabled-border-default);
    color: var(--cd-color-checkbox-checked-icon-disabled);
  }
  .cd-checkbox-disabled.cd-checkbox-checked :global(.cd-checkbox-inner-display),
  .cd-checkbox-disabled.cd-checkbox-indeterminate :global(.cd-checkbox-inner-display) {
    opacity: 0.75;
    background: var(--cd-color-checkbox-checked-bg-disabled);
    box-shadow: inset 0 0 0 var(--cd-size-checkbox-inner-shadow) var(--cd-color-checkbox-checked-bg-disabled);
    color: var(--cd-color-checkbox-checked-icon-disabled);
  }
  .cd-checkbox-disabled .cd-checkbox-addon,
  .cd-checkbox-disabled .cd-checkbox-extra {
    color: var(--cd-color-checkbox-label-text-disabled);
  }

  /* 焦点环（card/pureCard 整卡态，对齐 Semi checkbox.scss:366-368 `&-focus`）：由 JS 计算的
     focusVisible && focusOuter 驱动，非纯 CSS :focus-visible（理由见 CheckboxInner.svelte 同名注释）。 */
  .cd-checkbox-focus {
    outline: var(--cd-width-checkbox-outline) solid var(--cd-color-checkbox-primary-outline-focus);
  }

  /* —— 内容区 —— */
  .cd-checkbox-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    row-gap: var(--cd-spacing-checkbox-extra-margintop);
  }
  .cd-checkbox-addon {
    display: flex;
    flex: 1;
    align-items: center;
    color: var(--cd-color-checkbox-label-text-default);
    line-height: var(--cd-font-checkbox-label-lineheight);
    user-select: none;
  }
  .cd-checkbox-extra {
    box-sizing: border-box;
    color: var(--cd-color-checkbox-extra-text-default);
    font-size: var(--cd-font-size-small);
  }

  /* —— card / pureCard 形态 —— */
  .cd-checkbox-cardType {
    flex-wrap: nowrap;
    align-items: flex-start;
    border-radius: var(--cd-radius-checkbox-cardtype);
    padding: var(--cd-spacing-checkbox-cardtype-paddingy) var(--cd-spacing-checkbox-cardtype-paddingx);
    background: transparent;
    border: var(--cd-width-checkbox-cardtype-border) solid var(--cd-color-checkbox-cardtype-border-default);
  }
  /* 仅未选中态用卡片内框底色（对齐 Semi checkbox.scss:195-201 该规则嵌套在 &-cardType 内、
     早于 &-checked 声明，源码顺序上被选中态覆盖；此处直接排除选中/半选态达到同等效果，
     不依赖跨规则块的源码顺序，更不易在后续重排样式时再次踩坑）。 */
  .cd-checkbox-cardType:not(.cd-checkbox-checked):not(.cd-checkbox-indeterminate)
    :global(.cd-checkbox-inner-display) {
    background: var(--cd-color-checkbox-cardtype-inner-bg-default);
  }
  .cd-checkbox-cardType .cd-checkbox-addon {
    font-weight: var(--cd-font-checkbox-cardtype-addon-fontweight);
    font-size: var(--cd-font-checkbox-cardtype-addon-size);
    line-height: var(--cd-font-checkbox-cardtype-addon-lineheight);
    color: var(--cd-color-checkbox-cardtype-addon-text-default);
  }
  .cd-checkbox-cardType .cd-checkbox-extra {
    font-size: var(--cd-font-checkbox-cardtype-extra-size);
    line-height: var(--cd-font-checkbox-cardtype-extra-lineheight);
    color: var(--cd-color-checkbox-cardtype-extra-text-default);
  }
  .cd-checkbox-cardType_extra_noChildren {
    margin-top: 0;
  }
  .cd-checkbox-cardType_enable:hover {
    background: var(--cd-color-checkbox-cardtype-bg-hover);
  }
  .cd-checkbox-cardType_enable:active {
    background: var(--cd-color-checkbox-cardtype-bg-active);
  }
  .cd-checkbox-cardType_checked {
    background: var(--cd-color-checkbox-cardtype-checked-bg);
    border-color: var(--cd-color-checkbox-cardtype-checked-border-default);
  }
  .cd-checkbox-cardType_checked:hover {
    border-color: var(--cd-color-checkbox-cardtype-checked-border-hover);
  }
  .cd-checkbox-cardType_checked:active {
    border-color: var(--cd-color-checkbox-cardtype-checked-border-active);
  }
  .cd-checkbox-cardType_checked_disabled {
    background: var(--cd-color-checkbox-cardtype-checked-disabled-bg);
    border-color: var(--cd-color-checkbox-cardtype-checked-disabled-border-default);
  }
  .cd-checkbox-cardType_disabled:hover,
  .cd-checkbox-cardType_disabled:active {
    background: transparent;
  }

  @media (prefers-reduced-motion: reduce) {
    .cd-checkbox,
    :global(.cd-checkbox-inner-display) {
      transition: none;
    }
  }
</style>
