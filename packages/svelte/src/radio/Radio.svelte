<!--
  Radio — 严格对齐 Semi radio.tsx / radioInner.tsx。

  DOM 结构镜像 Semi：
    <label class="cd-radio ...">
      <span class="cd-radio-inner ...">
        <input type="radio"|"checkbox">           ← 全类型都是原生 input
        <span class="cd-radio-inner-display ...">   ← default/card 显示圆圈；button 型无此 span
          {checked ? <IconRadio/> : null}
        </span>
      </span>
      <div class="cd-radio-content">                ← 有 children/extra 时才渲染
        <span class="cd-radio-addon ...">{children}</span>
        <div class="cd-radio-extra">{extra}</div>   ← 仅 !isButtonRadio
      </div>
    </label>

  键盘：原生 radio 分组（同 name），方向键切换即选中由浏览器接管，无 JS roving。
  button/card/pureCard 型 input 绝对定位盖满容器（.cd-radio-inner-buttonRadio / -pureCardRadio）。
  onChange 回调收到对齐 Semi 的 RadioChangeEvent（e.target.{checked,value,name,...}）。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { useId } from '@chenzy-design/core';
  import { IconRadio } from '@chenzy-design/icons';
  import {
    getRadioGroupContext,
    type RadioValue,
    type RadioType,
    type RadioMode,
    type RadioChangeEvent,
  } from './context.js';

  interface Props {
    value?: RadioValue;
    checked?: boolean;
    defaultChecked?: boolean;
    disabled?: boolean;
    /** 样式类型（单机使用时生效；在 Group 内由 Group.type 决定）。 */
    type?: RadioType;
    name?: string;
    extra?: string | undefined;
    children?: Snippet;
    /** 对齐 Semi：变更回调收到 RadioChangeEvent（e.target.{checked,value}）。 */
    onChange?: (e: RadioChangeEvent) => void;
    addonId?: string;
    addonClassName?: string;
    addonStyle?: string;
    autoFocus?: boolean;
    extraId?: string;
    /** 高级模式：checked 时点击可变 unchecked（对齐 Semi mode='advanced'，input 变 checkbox）。 */
    mode?: RadioMode;
    /** 根元素附加 class（对齐 Semi className；本库惯例用 class）。 */
    class?: string;
    style?: string;
    onMouseEnter?: (e: MouseEvent) => void;
    onMouseLeave?: (e: MouseEvent) => void;
    ariaLabel?: string;
    preventScroll?: boolean;
  }

  let {
    value,
    checked = $bindable(),
    defaultChecked = false,
    disabled = false,
    type,
    name,
    extra,
    children,
    onChange,
    addonId: addonIdProp,
    addonClassName,
    addonStyle,
    autoFocus = false,
    extraId: extraIdProp,
    mode = '',
    class: className,
    style,
    onMouseEnter,
    onMouseLeave,
    ariaLabel,
    preventScroll = false,
  }: Props = $props();

  const group = getRadioGroupContext();

  const uid = useId('cd-radio-item');
  // addon/extra 的 id：优先用 prop，否则在有 children/extra 时随机生成（对齐 Semi setAddonId/setExtraId）。
  const addonId = $derived(children ? (addonIdProp ?? `${uid}-addon`) : undefined);
  const extraId = $derived(extra ? (extraIdProp ?? `${uid}-extra`) : undefined);

  const isControlled = $derived(checked !== undefined);
  // defaultChecked 只取初值（对齐 Semi 非受控初始态）——初值快照，非响应式追踪。
  // svelte-ignore state_referenced_locally
  let inner = $state(defaultChecked);

  let inputEl = $state<HTMLInputElement | null>(null);
  $effect(() => {
    if (autoFocus) inputEl?.focus({ preventScroll });
  });

  /** Imperatively focus the radio's input (mirrors Semi's `focus()`). */
  export function focus(): void {
    inputEl?.focus({ preventScroll });
  }

  /** Imperatively blur the radio's input (mirrors Semi's `blur()`). */
  export function blur(): void {
    inputEl?.blur();
  }

  // —— 解析在/不在 Group 中的实际值（对齐 Semi radio.tsx render 的 isInGroup 分支）——
  const resolvedDisabled = $derived(disabled || (group ? group.getDisabled() : false));
  const resolvedName = $derived(name ?? (group ? group.name : undefined));
  const resolvedMode = $derived<RadioMode>(group ? group.getMode() : mode);
  const resolvedType = $derived<RadioType>(group ? group.getType() : (type ?? 'default'));
  const buttonSize = $derived(group?.getButtonSize());

  const isChecked = $derived(
    group ? group.getSelected() === value : isControlled ? !!checked : inner,
  );

  // —— 类型标志（对齐 Semi）——
  const isButtonRadioGroup = $derived(resolvedType === 'button');
  const isPureCardRadioGroup = $derived(resolvedType === 'pureCard');
  const isCardRadioGroup = $derived(resolvedType === 'card' || isPureCardRadioGroup);
  // 单机 button 型：Semi 有 buttonRadioComponent 包裹（仅非 Group 的 type=button）。
  const isButtonRadioComponent = $derived(!group && resolvedType === 'button');
  const isButtonRadio = $derived(isButtonRadioGroup);

  // hover / focusVisible 本地态（对齐 Semi setHover / setFocusVisible）。
  let isHover = $state(false);
  let focusVisible = $state(false);
  const focusOuter = $derived(isCardRadioGroup || isPureCardRadioGroup || isButtonRadio);
  const focusInner = $derived(focusVisible && !focusOuter);

  /** 构造对齐 Semi 的 RadioChangeEvent（target 展开 props + checked）。 */
  function makeEvent(nextChecked: boolean, nativeEvent?: Event): RadioChangeEvent {
    return {
      target: { checked: nextChecked, value, name: resolvedName, mode: resolvedMode },
      ...(nativeEvent ? { nativeEvent } : {}),
      stopPropagation: () => nativeEvent?.stopPropagation(),
      preventDefault: () => nativeEvent?.preventDefault(),
    };
  }

  function handleChange(e: Event & { currentTarget: HTMLInputElement }) {
    if (resolvedDisabled) return;
    const next = e.currentTarget.checked;
    const evt = makeEvent(next, e);
    if (group) {
      group.onChange(evt);
      onChange?.(evt);
      return;
    }
    // 非 Group：受控（checked=）只经 onChange 回传；非受控维护 inner。
    if (!isControlled) inner = next;
    onChange?.(evt);
  }

  function handleMouseEnter(e: MouseEvent) {
    onMouseEnter?.(e);
    isHover = true;
  }
  function handleMouseLeave(e: MouseEvent) {
    onMouseLeave?.(e);
    isHover = false;
  }

  // 对齐 Semi radioFoundation.handleFocusVisible：仅键盘聚焦（:focus-visible）才显示 focus 轮廓，
  // 鼠标点击不触发——否则 button/card 型点击后会误显蓝色 outline。
  function handleFocusVisible(e: FocusEvent) {
    const target = e.target as HTMLElement | null;
    if (target?.matches(':focus-visible')) focusVisible = true;
  }

  // —— class 组装：严格镜像 Semi radio.tsx 的 wrapper/inner/addon cls ——
  const wrapperCls = $derived(
    [
      'cd-radio',
      resolvedDisabled && 'cd-radio-disabled',
      isChecked && 'cd-radio-checked',
      isButtonRadioComponent && 'cd-radio-buttonRadioComponent',
      isButtonRadioGroup && 'cd-radio-buttonRadioGroup',
      isButtonRadioGroup && buttonSize && `cd-radio-buttonRadioGroup-${buttonSize}`,
      isCardRadioGroup && 'cd-radio-cardRadioGroup',
      resolvedDisabled && isCardRadioGroup && 'cd-radio-cardRadioGroup_disabled',
      isCardRadioGroup && isChecked && !resolvedDisabled && 'cd-radio-cardRadioGroup_checked',
      isCardRadioGroup && isChecked && resolvedDisabled && 'cd-radio-cardRadioGroup_checked_disabled',
      isCardRadioGroup && !isChecked && isHover && !resolvedDisabled && 'cd-radio-cardRadioGroup_hover',
      focusVisible && (isCardRadioGroup || isPureCardRadioGroup) && 'cd-radio-focus',
      className,
    ]
      .filter(Boolean)
      .join(' '),
  );

  const innerWrapCls = $derived(
    [
      'cd-radio-inner',
      isChecked && 'cd-radio-inner-checked',
      isButtonRadio && 'cd-radio-inner-buttonRadio',
      isPureCardRadioGroup && 'cd-radio-inner-pureCardRadio',
    ]
      .filter(Boolean)
      .join(' '),
  );

  const innerDisplayCls = $derived(
    [
      focusInner && 'cd-radio-focus',
      focusInner && !isChecked && 'cd-radio-focus-border',
      !isButtonRadio && 'cd-radio-inner-display',
    ]
      .filter(Boolean)
      .join(' '),
  );

  const addonCls = $derived(
    [
      !isButtonRadio && 'cd-radio-addon',
      isButtonRadio && 'cd-radio-addon-buttonRadio',
      isButtonRadio && isChecked && 'cd-radio-addon-buttonRadio-checked',
      isButtonRadio && resolvedDisabled && 'cd-radio-addon-buttonRadio-disabled',
      isButtonRadio && !isChecked && !resolvedDisabled && isHover && 'cd-radio-addon-buttonRadio-hover',
      isButtonRadio && buttonSize && `cd-radio-addon-buttonRadio-${buttonSize}`,
      focusVisible && isButtonRadio && 'cd-radio-focus',
      addonClassName,
    ]
      .filter(Boolean)
      .join(' '),
  );

  const hasContent = $derived(!!children || !!extra);
</script>

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<label
  class={wrapperCls}
  {style}
  onmouseenter={handleMouseEnter}
  onmouseleave={handleMouseLeave}
>
  <span class={innerWrapCls}>
    <input
      bind:this={inputEl}
      class="cd-radio-native-control"
      type={resolvedMode === 'advanced' ? 'checkbox' : 'radio'}
      checked={isChecked}
      disabled={resolvedDisabled}
      name={resolvedName}
      value={value === undefined ? undefined : String(value)}
      aria-label={ariaLabel}
      aria-labelledby={addonId}
      aria-describedby={extraId}
      onchange={handleChange}
      onfocus={handleFocusVisible}
      onblur={() => (focusVisible = false)}
    />
    <span class={innerDisplayCls}>
      {#if isChecked}<IconRadio />{/if}
    </span>
  </span>
  {#if hasContent}
    <div class="cd-radio-content">
      {#if children}
        <span class={addonCls} style={addonStyle} id={addonId}>{@render children()}</span>
      {/if}
      {#if extra && !isButtonRadio}
        <div class="cd-radio-extra" id={extraId}>{extra}</div>
      {/if}
    </div>
  {/if}
</label>

<style>
  /* ============ 基础容器（对齐 Semi .semi-radio） ============ */
  .cd-radio {
    box-sizing: border-box;
    font-size: var(--cd-font-size-regular);
    position: relative;
    display: inline-flex;
    column-gap: var(--cd-spacing-radio-addon-paddingleft);
    transition:
      background-color var(--cd-motion-duration-fast) var(--cd-motion-ease-standard),
      border var(--cd-motion-duration-fast) var(--cd-motion-ease-standard);
    min-height: var(--cd-height-radio-inner-min);
    min-width: var(--cd-width-radio-inner);
    cursor: pointer;
    vertical-align: bottom;
    text-align: left;
  }

  /* 原生 input：覆盖整个容器承接点击/键盘（对齐 Semi input[type=radio] 绝对定位盖满）。 */
  .cd-radio-native-control {
    position: absolute;
    left: 0;
    top: 0;
    opacity: 0;
    width: 100%;
    height: 100%;
    margin: 0;
    cursor: pointer;
  }
  .cd-radio-disabled .cd-radio-native-control {
    cursor: not-allowed;
  }

  /* ---- 未选中态 hover / active（对齐 Semi &:hover / &:active .inner-display） ---- */
  .cd-radio:hover .cd-radio-inner-display {
    background: var(--cd-color-radio-default-bg-hover);
    border: solid var(--cd-width-radio-hover-border) var(--cd-color-radio-default-border-hover);
  }
  .cd-radio:active .cd-radio-inner-display {
    background: var(--cd-color-radio-default-bg-active);
  }
  /* 选中态 hover / active（品牌色描边随之变化） */
  .cd-radio:hover .cd-radio-inner-checked .cd-radio-inner-display {
    background: var(--cd-color-radio-primary-bg-hover);
    border-color: var(--cd-color-radio-checked-border-hover);
  }
  .cd-radio:active .cd-radio-inner-checked .cd-radio-inner-display {
    background: var(--cd-color-radio-primary-bg-active);
    border-color: var(--cd-color-radio-checked-border-active);
  }

  /* ============ inner 圆圈包裹（对齐 Semi .semi-radio-inner） ============ */
  .cd-radio-inner {
    display: inline-flex;
    margin-top: 2px;
    position: relative;
    width: var(--cd-width-radio-inner);
    height: var(--cd-width-radio-inner);
    vertical-align: sub;
    user-select: none;
  }
  .cd-radio-inner-display {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    width: var(--cd-width-radio-inner);
    height: var(--cd-width-radio-inner);
    border: solid var(--cd-width-radio-inner-border) var(--cd-color-radio-default-border-default);
    border-radius: var(--cd-width-radio-inner);
    background: var(--cd-color-radio-default-bg-default);
    transition:
      background-color var(--cd-motion-duration-fast) var(--cd-motion-ease-standard),
      border var(--cd-motion-duration-fast) var(--cd-motion-ease-standard);
  }
  /* IconRadio（中心圆点）：填满 display、字号 14（对齐 Semi .semi-icon 规则） */
  .cd-radio-inner-display :global(.cd-icon) {
    width: 100%;
    height: 100%;
    font-size: 14px;
  }

  /* 选中态圆圈（对齐 Semi .semi-radio-inner-checked .inner-display） */
  .cd-radio-inner-checked .cd-radio-inner-display {
    border: solid var(--cd-width-radio-inner-border) var(--cd-color-radio-primary-border-default);
    background: var(--cd-color-radio-primary-bg-default);
    color: var(--cd-color-radio-primary-text-default);
    border-radius: var(--cd-width-radio-inner);
  }

  /* ============ 内容区 ============ */
  .cd-radio-content {
    display: flex;
    flex-direction: column;
    row-gap: var(--cd-spacing-radio-content-rowgap);
  }
  .cd-radio-addon {
    user-select: none;
    color: var(--cd-color-radio-default-text-default);
    display: inline-flex;
    align-items: center;
  }
  .cd-radio-extra {
    color: var(--cd-color-radio-extra-text-default);
    box-sizing: border-box;
  }

  /* ============ 聚焦（对齐 Semi .semi-radio-focus / -focus-border） ============ */
  .cd-radio-focus {
    outline: var(--cd-width-radio-outline) solid var(--cd-color-radio-primary-outline-focus);
  }
  .cd-radio-focus-border {
    border: solid var(--cd-width-radio-hover-border) var(--cd-color-radio-default-border-hover);
  }

  /* ============ 禁用态（对齐 Semi .semi-radio-disabled） ============ */
  .cd-radio-disabled,
  .cd-radio-disabled:hover {
    cursor: not-allowed;
  }
  .cd-radio-disabled .cd-radio-inner {
    cursor: not-allowed;
  }
  .cd-radio-disabled .cd-radio-inner-display {
    opacity: 0.75;
    background: var(--cd-color-radio-disabled-bg-default);
    border-color: var(--cd-color-radio-default-border-disabled);
  }
  .cd-radio-disabled .cd-radio-inner-display:hover {
    background: var(--cd-color-radio-disabled-bg-hover);
  }
  .cd-radio-disabled .cd-radio-inner-checked .cd-radio-inner-display {
    color: var(--cd-color-radio-checked-icon-disabled);
    background: var(--cd-color-radio-checked-bg-disabled);
    border-color: var(--cd-color-radio-checked-border-disabled);
  }
  /* 禁用态 hover/active 圆圈恒定（对齐 Semi .disabled:hover / :active） */
  .cd-radio-disabled:hover .cd-radio-inner-display,
  .cd-radio-disabled:active .cd-radio-inner-display {
    background: var(--cd-color-radio-disabled-bg-default);
    border: solid var(--cd-width-radio-disabled-border) var(--cd-color-radio-disabled-border-default);
  }
  .cd-radio-disabled:hover .cd-radio-inner-checked .cd-radio-inner-display,
  .cd-radio-disabled:active .cd-radio-inner-checked .cd-radio-inner-display {
    color: var(--cd-color-radio-checked-icon-disabled);
    background: var(--cd-color-radio-checked-bg-disabled);
    border-color: var(--cd-color-radio-checked-border-disabled);
  }
  .cd-radio-disabled .cd-radio-addon,
  .cd-radio-disabled .cd-radio-extra {
    color: var(--cd-color-radio-disabled-text-default);
  }

  /* ============ button 型（对齐 Semi -buttonRadioComponent / -buttonRadioGroup） ============ */
  /* button 型 input 盖满、隐藏圆圈（inner-buttonRadio 绝对定位、无 inner-display） */
  .cd-radio-inner-buttonRadio,
  .cd-radio-inner-pureCardRadio {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    margin-top: 0;
    z-index: -1;
    opacity: 0;
  }

  .cd-radio-buttonRadioComponent {
    padding: var(--cd-spacing-radio-buttonradio-padding);
    background: var(--cd-color-radio-buttonradio-bg-default);
    border-radius: var(--cd-radius-radio-buttonradio);
  }

  .cd-radio-buttonRadioGroup {
    position: relative;
    padding: var(--cd-spacing-radio-buttonradiogroup-middle-padding);
    border-radius: var(--cd-radius-radio-buttonradio);
    line-height: var(--cd-font-radio-buttonradiogroup-middle-lineheight);
  }
  .cd-radio-buttonRadioGroup:not(:last-child) {
    padding-right: var(--cd-spacing-radio-buttonradiogroup-paddingright);
  }
  .cd-radio-buttonRadioGroup-small {
    padding: var(--cd-spacing-radio-buttonradiogroup-small-paddingx) var(--cd-spacing-radio-buttonradiogroup-small-paddingy);
    line-height: var(--cd-font-radio-buttonradiogroup-small-lineheight);
  }
  .cd-radio-buttonRadioGroup-large {
    padding: var(--cd-spacing-radio-buttonradiogroup-large-padding);
    line-height: var(--cd-font-radio-buttonradiogroup-large-lineheight);
  }

  /* button 型 addon（真正的按钮外观：圆角/字重/字号/内距，选中态背景浮起） */
  .cd-radio-addon-buttonRadio {
    text-align: center;
    border-radius: var(--cd-radius-radio-addon-buttonradio);
    font-weight: var(--cd-font-radio-buttonradio-default-fontweight);
    color: var(--cd-color-radio-buttonradio-text-default);
    font-size: var(--cd-font-radio-buttonradio-middle-default-size);
    padding: var(--cd-spacing-radio-addon-buttonradio-middle-paddingy) var(--cd-spacing-radio-addon-buttonradio-middle-paddingx);
    transition:
      background-color var(--cd-motion-duration-fast) var(--cd-motion-ease-standard),
      border var(--cd-motion-duration-fast) var(--cd-motion-ease-standard);
  }
  .cd-radio-addon-buttonRadio-hover {
    font-weight: var(--cd-font-radio-buttonradio-hover-fontweight);
    background: var(--cd-color-radio-addon-buttonradio-bg-hover);
  }
  .cd-radio-addon-buttonRadio-checked {
    font-weight: var(--cd-font-radio-buttonradio-checked-fontweight);
    background: var(--cd-color-radio-addon-buttonradio-bg-checked);
    color: var(--cd-color-radio-addon-buttonradio-text-checked);
  }
  .cd-radio-addon-buttonRadio-disabled {
    cursor: not-allowed;
    color: var(--cd-color-radio-buttonradio-text-disabled);
  }
  .cd-radio-addon-buttonRadio-small {
    font-size: var(--cd-font-radio-buttonradio-small-default-size);
    padding: var(--cd-spacing-radio-addon-buttonradio-small-paddingy) var(--cd-spacing-radio-addon-buttonradio-small-paddingx);
  }
  .cd-radio-addon-buttonRadio-large {
    font-size: var(--cd-font-radio-buttonradio-large-default-size);
    padding: var(--cd-spacing-radio-addon-buttonradio-large-paddingy) var(--cd-spacing-radio-addon-buttonradio-large-paddingx);
  }

  /* ============ card / pureCard 型（对齐 Semi -cardRadioGroup） ============ */
  .cd-radio-cardRadioGroup {
    flex-wrap: nowrap;
    border-radius: var(--cd-radius-radio-cardradiogroup);
    padding: var(--cd-spacing-radio-cardradiogroup-paddingy) var(--cd-spacing-radio-cardradiogroup-paddingx);
    background: var(--cd-color-radio-cardradiogroup-bg-default);
    border: var(--cd-width-radio-cardradiogroup-checked-border) solid var(--cd-color-radio-cardradiogroup-border-default);
    transition:
      background-color var(--cd-motion-duration-fast) var(--cd-motion-ease-standard),
      border var(--cd-motion-duration-fast) var(--cd-motion-ease-standard);
  }
  .cd-radio-cardRadioGroup .cd-radio-inner {
    flex-shrink: 0;
  }
  /* card 型未选中圆圈用卡片默认底（对齐 Semi &.cardRadioGroup .inner .inner-display）；
     选中圆圈保持 .inner-checked 的品牌蓝底，故此处排除 checked，避免白底盖掉蓝底。 */
  .cd-radio-cardRadioGroup .cd-radio-inner:not(.cd-radio-inner-checked) .cd-radio-inner-display {
    background: var(--cd-color-radio-card-bg-default);
  }
  .cd-radio-cardRadioGroup .cd-radio-addon {
    font-weight: var(--cd-font-radio-cardradiogroup-addon-fontweight);
    font-size: var(--cd-font-radio-cardradiogroup-addon-size);
    line-height: var(--cd-font-radio-cardradiogroup-addon-lineheight);
    color: var(--cd-color-radio-cardradiogroup-addon-text-default);
  }
  .cd-radio-cardRadioGroup .cd-radio-extra {
    font-weight: var(--cd-font-radio-cardradiogroup-extra-fontweight);
    font-size: var(--cd-font-radio-cardradiogroup-extra-size);
    line-height: var(--cd-font-radio-cardradiogroup-extra-lineheight);
    color: var(--cd-color-radio-cardradiogroup-extra-text-default);
    padding-left: 0;
  }
  /* card hover 圆圈背景（对齐 Semi &.cardRadioGroup .inner-display: card-bg-hover） */
  .cd-radio-cardRadioGroup:hover .cd-radio-inner-display {
    background: var(--cd-color-radio-card-bg-hover);
  }
  .cd-radio-cardRadioGroup:active .cd-radio-inner-display {
    background: var(--cd-color-radio-card-bg-active);
  }
  .cd-radio-cardRadioGroup:active {
    background: var(--cd-color-radio-cardradiogroup-bg-active);
  }
  /* card hover 卡片背景（JS hover class，区分 checked） */
  .cd-radio-cardRadioGroup_hover {
    background: var(--cd-color-radio-cardradiogroup-bg-hover);
  }
  /* card 选中态 */
  .cd-radio-cardRadioGroup_checked {
    background: var(--cd-color-radio-cardradiogroup-bg-checked);
    border: var(--cd-width-radio-cardradiogroup-checked-border) solid var(--cd-color-radio-cardradiogroup-border-active);
  }
  .cd-radio-cardRadioGroup_checked:hover {
    border: var(--cd-width-radio-cardradiogroup-checked-border) solid var(--cd-color-radio-cardradiogroup-checked-border-hover);
  }
  .cd-radio-cardRadioGroup_checked:hover .cd-radio-inner-checked .cd-radio-inner-display {
    border-color: var(--cd-color-radio-cardradiogroup-checked-border-hover);
  }
  .cd-radio-cardRadioGroup_checked:active {
    background: var(--cd-color-radio-cardradiogroup-bg-checked);
    border: var(--cd-width-radio-cardradiogroup-checked-border) solid var(--cd-color-radio-cardradiogroup-checked-border-active);
  }
  .cd-radio-cardRadioGroup_checked:active .cd-radio-inner-checked .cd-radio-inner-display {
    border-color: var(--cd-color-radio-cardradiogroup-checked-border-active);
  }
  /* card 禁用态 */
  .cd-radio-cardRadioGroup_disabled:active {
    background: var(--cd-color-radio-cardradiogroup-disabled-bg-active);
  }
  .cd-radio-cardRadioGroup_checked_disabled.cd-radio-cardRadioGroup {
    background: var(--cd-color-radio-cardradiogroup-disabled-bg-checked);
    border: var(--cd-width-radio-cardradiogroup-checked-disabled-border) solid var(--cd-color-radio-cardradiogroup-border-disabled-active);
  }
  .cd-radio-cardRadioGroup_checked_disabled .cd-radio-inner-checked .cd-radio-inner-display {
    border-color: var(--cd-color-radio-cardradiogroup-checked-disabled-border-default);
  }
  .cd-radio-cardRadioGroup_checked_disabled:hover .cd-radio-inner-checked .cd-radio-inner-display {
    border-color: var(--cd-color-radio-cardradiogroup-checked-disabled-border-hover);
  }

  @media (prefers-reduced-motion: reduce) {
    .cd-radio,
    .cd-radio-inner-display,
    .cd-radio-cardRadioGroup,
    .cd-radio-addon-buttonRadio {
      transition: none;
    }
  }
</style>
