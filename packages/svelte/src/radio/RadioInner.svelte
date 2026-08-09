<!--
  RadioInner — 严格对齐 Semi（radioInner.tsx）。
  内层 span.inner > input + span.inner-display（选中时渲染 IconRadio）。
  承载原生 input 的 a11y / 焦点 / 受控 checked；wrapper class 与 hover/active 样式挂在
  外层 Radio 根 label 上，跨组件用 :global() 打透（对齐 CheckboxInner 拆分先例）。
-->
<script lang="ts">
  import { IconRadio } from '@chenzy-design/icons';

  interface Props {
    checked?: boolean;
    disabled?: boolean;
    isButtonRadio?: boolean;
    isPureCardRadioGroup?: boolean;
    mode?: 'advanced' | '';
    name?: string | undefined;
    value?: string | number | boolean | undefined;
    addonId?: string | undefined;
    extraId?: string | undefined;
    'aria-label'?: string | undefined;
    /** 焦点环画在 inner-display 上（非 button/card/pureCard；对齐 Semi focusInner）。 */
    focusInner?: boolean;
    onInputChange?: (e: Event & { currentTarget: HTMLInputElement }) => void;
    onInputFocus?: (e: FocusEvent) => void;
    onInputBlur?: (e: FocusEvent) => void;
  }

  let {
    checked = false,
    disabled = false,
    isButtonRadio = false,
    isPureCardRadioGroup = false,
    mode = '',
    name,
    value,
    addonId,
    extraId,
    'aria-label': ariaLabel,
    focusInner = false,
    onInputChange,
    onInputFocus,
    onInputBlur,
  }: Props = $props();

  let inputEl = $state<HTMLInputElement | null>(null);

  /** Imperatively focus the native radio input（对齐 Semi RadioInner.focus，preventScroll 由调用方决定）. */
  export function focus(opts?: FocusOptions): void {
    inputEl?.focus(opts);
  }

  /** Imperatively blur the native radio input（对齐 Semi RadioInner.blur）. */
  export function blur(): void {
    inputEl?.blur();
  }

  const wrapperCls = $derived(
    [
      'cd-radio-inner',
      checked && 'cd-radio-inner-checked',
      isButtonRadio && 'cd-radio-inner-buttonRadio',
      isPureCardRadioGroup && 'cd-radio-inner-pureCardRadio',
    ]
      .filter(Boolean)
      .join(' '),
  );

  const innerDisplayCls = $derived(
    [
      focusInner && 'cd-radio-focus',
      focusInner && !checked && 'cd-radio-focus-border',
      !isButtonRadio && 'cd-radio-inner-display',
    ]
      .filter(Boolean)
      .join(' '),
  );
</script>

<span class={wrapperCls}>
  <input
    bind:this={inputEl}
    class="cd-radio-native-control"
    type={mode === 'advanced' ? 'checkbox' : 'radio'}
    checked={Boolean(checked)}
    {disabled}
    {name}
    value={value === undefined ? undefined : String(value)}
    aria-label={ariaLabel}
    aria-labelledby={addonId}
    aria-describedby={extraId}
    onchange={onInputChange}
    onfocus={onInputFocus}
    onblur={onInputBlur}
  />
  <span class={innerDisplayCls}>
    {#if checked}<IconRadio />{/if}
  </span>
</span>

<style>
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

  /* ============ 聚焦（对齐 Semi .semi-radio-focus / -focus-border） ============ */
  .cd-radio-focus {
    outline: var(--cd-width-radio-outline) solid var(--cd-color-radio-primary-outline-focus);
  }
  .cd-radio-focus-border {
    border: solid var(--cd-width-radio-hover-border) var(--cd-color-radio-default-border-hover);
  }

  /* ============ button / pureCard 型：input 绝对盖满、隐藏圆圈 ============ */
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

  @media (prefers-reduced-motion: reduce) {
    .cd-radio-inner-display {
      transition: none;
    }
  }
</style>
