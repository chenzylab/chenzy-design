<!--
  Radio — 严格对齐 Semi radio.tsx / radioInner.tsx。
  Inside RadioGroup: role=radio via native input, roving tabindex.
  Standalone: self controlled / uncontrolled.
  onChange 回调收到对齐 Semi 的 RadioChangeEvent（e.target.{checked,value}）。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { useId } from '@chenzy-design/core';
  import {
    getRadioGroupContext,
    type RadioValue,
    type RadioType,
    type RadioChangeEvent,
  } from './context.js';

  interface Props {
    value: RadioValue;
    checked?: boolean;
    defaultChecked?: boolean;
    disabled?: boolean;
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
    mode?: 'advanced' | '';
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
    addonId,
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

  const fieldId = useId('cd-radio-item');
  const extraId = $derived(extraIdProp ?? (extra ? `${fieldId}-extra` : undefined));

  const isControlled = $derived(checked !== undefined);
  let inner = $state(getInitialChecked());

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

  function getInitialChecked(): boolean {
    return defaultChecked;
  }

  const resolvedDisabled = $derived(disabled || (group ? group.getDisabled() : false));
  const resolvedName = $derived(group ? group.name : name);
  // type 优先取本项显式值，否则继承 Group，再退 default。
  const resolvedType = $derived<RadioType>(type ?? group?.getType() ?? 'default');
  // button 型的尺寸（仅 group + type=button 时生效，对齐 Semi buttonSize）。
  const resolvedButtonSize = $derived(group?.getButtonSize());
  // button/card/pureCard 用 role=radio 容器（非原生 input），其余用隐藏 input。
  const isFancy = $derived(resolvedType !== 'default');

  const isChecked = $derived(
    group ? group.getSelected() === value : isControlled ? !!checked : inner,
  );

  // roving tabindex: in a group only the tab stop is 0, else -1; standalone always 0
  const tabindex = $derived(group ? (group.isTabStop(value, resolvedDisabled) ? 0 : -1) : 0);

  /** 构造对齐 Semi 的 RadioChangeEvent（e.target.{checked,value}）。 */
  function makeEvent(nextChecked: boolean, nativeEvent?: Event): RadioChangeEvent {
    return {
      target: { checked: nextChecked, value, name: resolvedName, mode },
      ...(nativeEvent ? { nativeEvent } : {}),
      stopPropagation: () => nativeEvent?.stopPropagation(),
      preventDefault: () => nativeEvent?.preventDefault(),
    };
  }

  function handleChange(e: Event & { currentTarget: HTMLInputElement }) {
    const next = e.currentTarget.checked;
    if (group) {
      group.select(value, makeEvent(true, e));
      onChange?.(makeEvent(true, e));
      return;
    }
    // Controlled (`checked=` / `bind:checked`): parent owns `checked`; propagate
    // only via `onChange`. Writing the prop AND firing `onChange` loops.
    // Uncontrolled: keep our own state in sync.
    if (!isControlled) inner = next;
    onChange?.(makeEvent(next, e));
  }

  function handleKeydown(e: KeyboardEvent) {
    group?.onKeydown(e, value);
  }

  // role=radio 容器（button/card 型）：方向键交给 group，Space/Enter 选中本项。
  function handleFancyKeydown(e: KeyboardEvent) {
    if (resolvedDisabled) return;
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      if (mode === 'advanced' && isChecked) {
        onChange?.(makeEvent(false, e));
        return;
      }
      activate(e);
      return;
    }
    group?.onKeydown(e, value);
  }

  function handleFancyClick(e: MouseEvent) {
    if (resolvedDisabled) return;
    if (mode === 'advanced' && isChecked) {
      onChange?.(makeEvent(false, e));
      return;
    }
    activate(e);
  }

  // 选中本项（用于 role=radio 容器的点击/键盘），同 handleChange 的提交逻辑。
  function activate(nativeEvent?: Event) {
    if (group) {
      group.select(value, makeEvent(true, nativeEvent));
      onChange?.(makeEvent(true, nativeEvent));
      return;
    }
    if (!isControlled) inner = true;
    onChange?.(makeEvent(true, nativeEvent));
  }

  /** Register this radio's focusable element with the group for roving focus management. */
  function registerAttach(node: HTMLElement) {
    if (!group) return;
    // read deps so registration metadata stays current
    return group.register({ value, disabled: resolvedDisabled, el: node });
  }

  const cls = $derived(
    [
      'cd-radio',
      `cd-radio--${resolvedType}`,
      isFancy && resolvedType === 'button' && resolvedButtonSize && `cd-radio--button-${resolvedButtonSize}`,
      isChecked && 'cd-radio--checked',
      resolvedDisabled && 'cd-radio--disabled',
      className,
    ]
      .filter(Boolean)
      .join(' '),
  );
</script>

{#if isFancy}
  <!-- button/card/pureCard 型：role=radio 容器承载 aria-checked，参与 roving。 -->
  <div
    {@attach registerAttach}
    class={cls}
    {style}
    role="radio"
    aria-checked={isChecked}
    aria-disabled={resolvedDisabled ? 'true' : undefined}
    aria-describedby={extraId}
    aria-label={ariaLabel}
    {tabindex}
    onclick={handleFancyClick}
    onkeydown={handleFancyKeydown}
    onmouseenter={onMouseEnter}
    onmouseleave={onMouseLeave}
  >
    {#if resolvedType !== 'pureCard'}
      <span class="cd-radio__circle" aria-hidden="true"></span>
    {/if}
    {#if children || extra}
      <span class={['cd-radio__content', addonClassName].filter(Boolean).join(' ')} id={addonId} style={addonStyle}>
        {#if children}<span class="cd-radio__label">{@render children()}</span>{/if}
        {#if extra}<span class="cd-radio__extra" id={extraId}>{extra}</span>{/if}
      </span>
    {/if}
  </div>
{:else}
  <label class={cls} for={fieldId} {style} onmouseenter={onMouseEnter} onmouseleave={onMouseLeave}>
    <input
      {@attach registerAttach}
      bind:this={inputEl}
      id={fieldId}
      class="cd-radio__input"
      type="radio"
      name={resolvedName}
      value={String(value)}
      checked={isChecked}
      disabled={resolvedDisabled}
      {tabindex}
      aria-describedby={extraId}
      aria-labelledby={addonId ?? fieldId}
      aria-label={ariaLabel}
      onchange={handleChange}
      onkeydown={handleKeydown}
    />
    <span class="cd-radio__circle" aria-hidden="true"></span>
    {#if children || extra}
      <span class={['cd-radio__content', addonClassName].filter(Boolean).join(' ')} id={addonId} style={addonStyle}>
        {#if children}<span class="cd-radio__label">{@render children()}</span>{/if}
        {#if extra}<span class="cd-radio__extra" id={extraId}>{extra}</span>{/if}
      </span>
    {/if}
  </label>
{/if}

<style>
  .cd-radio {
    display: inline-flex;
    align-items: flex-start;
    gap: var(--cd-radio-label-gap);
    color: var(--cd-color-radio-default-text-default);
    cursor: pointer;
    line-height: 1.4;
  }
  .cd-radio--disabled {
    cursor: not-allowed;
    /* 对齐 Semi：禁用态用精确禁用色 token（非 opacity 近似）。 */
    color: var(--cd-color-radio-disabled-text-default);
  }
  .cd-radio__input {
    position: absolute;
    inline-size: 1px;
    block-size: 1px;
    padding: 0;
    margin: 0;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
    border: 0;
  }
  .cd-radio__circle {
    position: relative;
    flex: 0 0 auto;
    /* 对齐 Semi .semi-radio-inner：圆圈整体下移 2px，与文字首行视觉居中对齐。 */
    margin-top: 2px;
    inline-size: var(--cd-radio-size-default);
    block-size: var(--cd-radio-size-default);
    background: var(--cd-color-radio-default-bg-default);
    border: 1px solid var(--cd-color-radio-default-border-default);
    border-radius: var(--cd-border-radius-full);
    transition:
      background-color var(--cd-motion-duration-fast) var(--cd-motion-ease-standard),
      border-color var(--cd-motion-duration-fast) var(--cd-motion-ease-standard);
  }
  /* 未选中态悬浮：对齐 Semi（描边 focus-border、背景 fill-0） */
  .cd-radio:hover:not(.cd-radio--disabled):not(.cd-radio--checked) .cd-radio__circle {
    background: var(--cd-color-radio-default-bg-hover);
    border-color: var(--cd-color-radio-default-border-hover);
  }
  /* 选中态：品牌色实心圆底 + 描边，中心白点（对齐 Semi .inner-checked .inner-display）。 */
  .cd-radio--checked .cd-radio__circle {
    background: var(--cd-color-radio-primary-bg-default);
    border-color: var(--cd-color-radio-primary-border-default);
  }
  .cd-radio--checked:hover:not(.cd-radio--disabled) .cd-radio__circle {
    background: var(--cd-color-radio-primary-bg-hover);
    border-color: var(--cd-color-radio-primary-bg-hover);
  }
  .cd-radio--checked:active:not(.cd-radio--disabled) .cd-radio__circle {
    background: var(--cd-color-radio-primary-bg-active);
    border-color: var(--cd-color-radio-primary-bg-active);
  }
  .cd-radio--checked .cd-radio__circle::after {
    content: '';
    position: absolute;
    inset: 50%;
    inline-size: 50%;
    block-size: 50%;
    transform: translate(-50%, -50%);
    background: var(--cd-color-radio-primary-text-default);
    border-radius: var(--cd-border-radius-full);
  }
  /* 禁用态圆圈：对齐 Semi 精确禁用色（描边 border、背景 disabled-fill）。 */
  .cd-radio--disabled .cd-radio__circle {
    background: var(--cd-color-radio-disabled-bg-default);
    border-color: var(--cd-color-radio-default-border-disabled);
  }
  .cd-radio--disabled.cd-radio--checked .cd-radio__circle {
    background: var(--cd-color-radio-checked-bg-disabled);
    border-color: var(--cd-color-radio-checked-border-disabled);
  }
  .cd-radio__input:focus-visible + .cd-radio__circle {
    outline: none;
    box-shadow: var(--cd-focus-ring);
  }
  .cd-radio__content {
    display: inline-flex;
    flex-direction: column;
    gap: var(--cd-spacing-radio-content-rowgap);
  }
  .cd-radio__extra {
    color: var(--cd-color-radio-extra-text-default);
    font-size: var(--cd-font-size-small);
  }
  /* ---- button / card / pureCard 型：role=radio 容器 ---- */
  .cd-radio--button,
  .cd-radio--card,
  .cd-radio--pureCard {
    box-sizing: border-box;
    outline: none;
  }
  .cd-radio--button:focus-visible,
  .cd-radio--card:focus-visible,
  .cd-radio--pureCard:focus-visible {
    box-shadow: var(--cd-focus-ring);
  }
  /* button 型（对齐 Semi buttonRadioGroup，segmented control 样式）：透明底无边框，
     嵌在 group 的灰底容器里；选中项白底（bg-3）+ 蓝字浮起；未选中透明、hover 浅灰。隐藏圆点。 */
  .cd-radio--button {
    gap: 0;
    block-size: var(--cd-radio-button-height);
    padding-inline: var(--cd-spacing-radio-addon-buttonradio-middle-paddingx);
    align-items: center;
    justify-content: center;
    color: var(--cd-color-radio-buttonradio-text-default);
    background: transparent;
    border: none;
    border-radius: var(--cd-radius-radio-buttonradio);
  }
  .cd-radio--button-small {
    block-size: var(--cd-radio-button-height-small);
  }
  .cd-radio--button-large {
    block-size: var(--cd-radio-button-height-large);
  }
  .cd-radio--button .cd-radio__circle {
    display: none;
  }
  .cd-radio--button:hover:not(.cd-radio--disabled):not(.cd-radio--checked) {
    background: var(--cd-color-radio-buttonradio-bg-hover);
  }
  /* 选中态：白底浮起（bg-checked=bg-3）+ 蓝字（对齐 Semi addon-buttonRadio-checked）。 */
  .cd-radio--button.cd-radio--checked {
    color: var(--cd-color-radio-buttonradio-text-checked);
    background: var(--cd-color-radio-buttonradio-bg-checked);
  }
  /* card / pureCard 型：带边框卡片，选中高亮边框 */
  .cd-radio--card,
  .cd-radio--pureCard {
    padding: var(--cd-spacing-radio-cardradiogroup-paddingy) var(--cd-spacing-radio-cardradiogroup-paddingx);
    background: var(--cd-color-radio-default-bg-default);
    border: 1px solid var(--cd-color-radio-default-border-default);
    border-radius: var(--cd-radius-radio-cardradiogroup);
  }
  .cd-radio--card.cd-radio--checked,
  .cd-radio--pureCard.cd-radio--checked {
    border-color: var(--cd-color-radio-cardradiogroup-border-active);
  }

  @media (prefers-reduced-motion: reduce) {
    .cd-radio__circle {
      transition: none;
    }
  }
</style>
