<!--
  CheckboxInner — 严格对齐 Semi（checkboxInner.tsx）。
  内层 span.inner > input + span.inner-display（图标）。承载原生 input 的 a11y / 焦点 / 受控 checked；
  切换本身由外层 Checkbox 根 span 的 click 驱动（对齐 Semi handleChange 绑在根节点，非 input 自身）。
-->
<script lang="ts">
  import { IconCheckboxTick, IconCheckboxIndeterminate } from '@chenzy-design/icons';

  interface Props {
    indeterminate?: boolean;
    checked?: boolean;
    disabled?: boolean;
    name?: string | undefined;
    isPureCardType?: boolean;
    addonId?: string | undefined;
    extraId?: string | undefined;
    'aria-label'?: string | undefined;
    ariaDescribedby?: string | undefined;
    ariaErrormessage?: string | undefined;
    ariaRequired?: boolean | undefined;
    ariaInvalid?: boolean | undefined;
    value?: string | number | undefined;
    /** 焦点环画在 inner-display 上（非 card/pureCard；对齐 Semi focusInner）。 */
    focusInner?: boolean;
    onInputChange?: (e: Event & { currentTarget: HTMLInputElement }) => void;
    onInputFocus?: (e: FocusEvent) => void;
    onInputBlur?: (e: FocusEvent) => void;
  }

  let {
    indeterminate = false,
    checked = false,
    disabled = false,
    name,
    isPureCardType = false,
    addonId,
    extraId,
    'aria-label': ariaLabel,
    ariaDescribedby,
    ariaErrormessage,
    ariaRequired,
    ariaInvalid,
    value,
    focusInner = false,
    onInputChange,
    onInputFocus,
    onInputBlur,
  }: Props = $props();

  let inputEl = $state<HTMLInputElement | null>(null);

  /** Imperatively focus the native checkbox input (对齐 Semi CheckboxInner.focus，preventScroll 由调用方决定). */
  export function focus(opts?: FocusOptions): void {
    inputEl?.focus(opts);
  }

  /** Imperatively blur the native checkbox input（对齐 Semi CheckboxInner.blur）. */
  export function blur(): void {
    inputEl?.blur();
  }

  /** Set the indeterminate DOM property (not a reflected attribute). */
  function indeterminateAttach(node: HTMLInputElement) {
    node.indeterminate = indeterminate && !checked;
  }

  const wrapperCls = $derived(
    [
      'cd-checkbox-inner',
      checked && 'cd-checkbox-inner-checked',
      isPureCardType && 'cd-checkbox-inner-pureCardType',
    ]
      .filter(Boolean)
      .join(' '),
  );

  // 对齐 Semi checkboxInner.tsx:82-86：inner class 同时含 -focus 与 -focus-border
  // （-focus-border 仅未选中时叠加，画法不同：-focus 是 outline，-focus-border 是 inset 描边）。
  const innerDisplayCls = $derived(
    [
      'cd-checkbox-inner-display',
      focusInner && 'cd-checkbox-focus',
      focusInner && !checked && 'cd-checkbox-focus-border',
    ]
      .filter(Boolean)
      .join(' '),
  );
</script>

<span class={wrapperCls}>
  <input
    bind:this={inputEl}
    {@attach indeterminateAttach}
    class="cd-checkbox-input"
    type="checkbox"
    {name}
    value={value !== undefined ? String(value) : undefined}
    {checked}
    {disabled}
    aria-label={ariaLabel}
    aria-disabled={disabled}
    aria-checked={checked}
    aria-labelledby={addonId}
    aria-describedby={extraId ?? ariaDescribedby}
    aria-errormessage={ariaErrormessage}
    aria-required={ariaRequired || undefined}
    aria-invalid={ariaInvalid || undefined}
    onchange={onInputChange}
    onfocus={onInputFocus}
    onblur={onInputBlur}
  />
  <span class={innerDisplayCls} aria-hidden="true">
    {#if checked}
      <IconCheckboxTick size="inherit" />
    {:else if indeterminate}
      <IconCheckboxIndeterminate size="inherit" />
    {/if}
  </span>
</span>

<style>
  .cd-checkbox-inner {
    position: relative;
    display: flex;
    align-items: center;
    flex-shrink: 0;
    inline-size: var(--cd-checkbox-size-default);
    block-size: var(--cd-checkbox-inner-height);
    user-select: none;
    cursor: pointer;
  }
  /* disabled 态覆盖 cursor（对齐 Semi checkbox.scss:310-313
     `.semi-checkbox-disabled { cursor:not-allowed } .semi-checkbox-disabled .semi-checkbox-inner
     { cursor:not-allowed }`）：.cd-checkbox-inner 自身有显式 cursor:pointer，仅靠外层
     .cd-checkbox-disabled 的 cursor 继承不会生效（子元素的显式声明优先于继承），必须在
     disabled 时单独覆盖。用 :has(:disabled) 直接查询内部 input 的原生 disabled 状态，
     不需要额外从父组件传 disabled class。 */
  .cd-checkbox-inner:has(.cd-checkbox-input:disabled) {
    cursor: not-allowed;
  }
  /* 原生 input 铺满 inner，opacity:0 承载键盘焦点与 a11y（对齐 Semi checkbox.scss:22-30）。
     input 保持默认可交互（无 pointer-events:none）：点击 input 时浏览器会先原生翻转
     input.checked，但切换的唯一真值来源是外层 Checkbox 根 span 的 onClick（对齐 Semi
     checkboxInner input onChange=noop，checkbox.tsx 根节点 onClick={handleChange}），
     该 click 冒泡后重渲染会把 checked 属性强制回写为受控值，与浏览器原生翻转结果一致。 */
  .cd-checkbox-input {
    position: absolute;
    inset: 0;
    inline-size: 100%;
    block-size: 100%;
    margin: 0;
    padding: 0;
    opacity: 0;
    cursor: inherit;
  }
  .cd-checkbox-inner-display {
    box-sizing: border-box;
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    inline-size: var(--cd-checkbox-size-default);
    block-size: var(--cd-checkbox-size-default);
    /* Semi 图标经字号驱动填满整盒（图标 viewBox 自带视觉内边距）。 */
    font-size: var(--cd-checkbox-size-default);
    background: var(--cd-color-checkbox-default-bg-default);
    border-radius: var(--cd-radius-checkbox-inner);
    /* Semi 用 inset box-shadow 画描边（checkbox.scss:110）。 */
    box-shadow: inset 0 0 0 var(--cd-size-checkbox-inner-shadow) var(--cd-color-checkbox-default-border-default);
    color: var(--cd-color-checkbox-checked-icon-default);
    transition:
      background-color var(--cd-transition-duration-checkbox-bg) var(--cd-transition-function-checkbox-bg)
        var(--cd-transition-delay-checkbox-bg),
      box-shadow var(--cd-transition-duration-checkbox-border) var(--cd-transition-function-checkbox-border)
        var(--cd-transition-delay-checkbox-border);
  }
  /* pureCard：隐藏勾选框但保留 input 承载 a11y 焦点（对齐 Semi checkbox.scss:204-210） */
  .cd-checkbox-inner-pureCardType {
    opacity: 0;
    width: 0;
  }
  /* 焦点环：由 JS 计算的 focusVisible 状态驱动 class（对齐 Semi handleFocusVisible + clickState
     判断——点击触发的 focus 需被过滤掉，纯 CSS :focus-visible 伪类在“JS 主动 focus()”场景下会
     被浏览器误判为需要展示焦点环，与 Semi 鼠标点击后无焦点环的实测行为不符，故改为对齐 JS 判断）。 */
  .cd-checkbox-focus {
    outline: var(--cd-width-checkbox-outline) solid var(--cd-color-checkbox-primary-outline-focus);
  }
  .cd-checkbox-focus-border {
    box-shadow: inset 0 0 0 var(--cd-size-checkbox-inner-shadow) var(--cd-color-checkbox-default-border-hover);
  }
</style>
