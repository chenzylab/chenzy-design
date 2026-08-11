<!--
  Switch — 严格对齐 Semi Design（semi-ui/switch/index.tsx + semi-foundation/switch）。

  DOM 结构镜像 Semi：
    <div class="cd-switch ...">
      <Spin> 或 <span class="cd-switch-knob">   ← loading 时用 Spin 替换 knob
      <span class="cd-switch-checked-text">     ← 仅 checkedText && checked && size!=small
      <span class="cd-switch-unchecked-text">   ← 仅 uncheckedText && !checked && size!=small
      <input type="checkbox" class="cd-switch-native-control" role="switch" ...>
    </div>

  role=switch 挂在隐藏 input 上（非根节点），事件（change/focus/blur）也绑在 input 上，
  根 div 只接 onMouseEnter/onMouseLeave（对齐 Semi render()）。

  死循环红线：
    - 受控（checked=）：父持有 checked，仅经 onChange 上抛，绝不回写 prop。
    - on / activeText / cls 均为纯 $derived。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import Spin from '../spin/Spin.svelte';

  type Size = 'small' | 'default' | 'large';

  interface Props {
    /** 受控选中态；提供则为受控（对齐 Semi checked）。 */
    checked?: boolean;
    /** 非受控初始选中态（对齐 Semi defaultChecked）。 */
    defaultChecked?: boolean;
    size?: Size;
    disabled?: boolean;
    loading?: boolean;
    /** 开态内嵌文字/图标（size=small 时不渲染）。 */
    checkedText?: string | Snippet;
    /** 关态内嵌文字/图标（size=small 时不渲染）。 */
    uncheckedText?: string | Snippet;
    /** 变更回调，对齐 Semi (checked, event)。 */
    onChange?: (checked: boolean, event: Event) => void;
    onMouseEnter?: (e: MouseEvent) => void;
    onMouseLeave?: (e: MouseEvent) => void;
    /** 透传根元素内联样式。 */
    style?: string;
    /** 透传根元素 class（本库惯例用 class，对齐 Semi className）。 */
    class?: string;
    id?: string;
    'aria-label'?: string;
    'aria-labelledby'?: string;
    'aria-describedby'?: string;
    'aria-errormessage'?: string;
    'aria-invalid'?: boolean;
  }

  let {
    checked,
    defaultChecked = false,
    size = 'default',
    disabled = false,
    loading = false,
    checkedText,
    uncheckedText,
    onChange,
    onMouseEnter,
    onMouseLeave,
    style,
    class: className,
    id,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledby,
    'aria-describedby': ariaDescribedby,
    'aria-errormessage': ariaErrormessage,
    'aria-invalid': ariaInvalid,
  }: Props = $props();

  const isControlled = $derived(checked !== undefined);
  // 非受控初始态：仅取 defaultChecked 首值播种，后续由内部 toggle 维护（受控则读 checked）。
  let inner = $state(getInitialValue());
  const on = $derived(isControlled ? !!checked : inner);

  function getInitialValue(): boolean {
    return defaultChecked;
  }

  // 对齐 Semi handleFocusVisible：仅键盘聚焦（:focus-visible）才显示 focus 轮廓。
  let focusVisible = $state(false);
  function handleFocusVisible(e: FocusEvent) {
    const target = e.target as HTMLElement | null;
    if (target?.matches(':focus-visible')) focusVisible = true;
  }
  function handleBlur() {
    focusVisible = false;
  }

  function handleChange(e: Event & { currentTarget: HTMLInputElement }) {
    const next = e.currentTarget.checked;
    // 受控：父持有 checked，仅 onChange 上抛；非受控：同步内部态。
    if (!isControlled) inner = next;
    onChange?.(next, e);
  }

  // 内嵌文字在最小尺寸下不渲染（对齐 Semi：small 放不下文本）。
  const showCheckedText = $derived(!!checkedText && on && size !== 'small');
  const showUncheckedText = $derived(!!uncheckedText && !on && size !== 'small');
  const isSnippet = (c: string | Snippet | undefined): c is Snippet => typeof c === 'function';

  const cls = $derived(
    [
      'cd-switch',
      className,
      on && 'cd-switch-checked',
      disabled && 'cd-switch-disabled',
      size === 'large' && 'cd-switch-large',
      size === 'small' && 'cd-switch-small',
      loading && 'cd-switch-loading',
      focusVisible && 'cd-switch-focus',
    ]
      .filter(Boolean)
      .join(' '),
  );
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class={cls} {style} onmouseenter={onMouseEnter} onmouseleave={onMouseLeave}>
  {#if loading}
    <!-- 对齐 Semi：loading 复用 <Spin>（渐变弧 SVG），非自绘 border 圈。
         SVG 尺寸/位移由 .cd-switch-loading-spin 作用域 CSS 控制。 -->
    <Spin wrapperClassName="cd-switch-loading-spin" />
  {:else}
    <span class="cd-switch-knob" aria-hidden="true"></span>
  {/if}
  {#if showCheckedText}
    <span class="cd-switch-checked-text">
      {#if isSnippet(checkedText)}{@render checkedText()}{:else}{checkedText}{/if}
    </span>
  {/if}
  {#if showUncheckedText}
    <span class="cd-switch-unchecked-text">
      {#if isSnippet(uncheckedText)}{@render uncheckedText()}{:else}{uncheckedText}{/if}
    </span>
  {/if}
  <input
    type="checkbox"
    class="cd-switch-native-control"
    {id}
    role="switch"
    checked={on}
    disabled={disabled || loading}
    aria-checked={on}
    aria-invalid={ariaInvalid || undefined}
    aria-errormessage={ariaErrormessage}
    aria-label={ariaLabel}
    aria-labelledby={ariaLabelledby}
    aria-describedby={ariaDescribedby}
    aria-disabled={disabled || undefined}
    onchange={handleChange}
    onfocus={handleFocusVisible}
    onblur={handleBlur}
  />
</div>

<style>
  .cd-switch {
    box-sizing: border-box;
    display: inline-block;
    position: relative;
    cursor: pointer;
    border-radius: var(--cd-switch-radius);
    border: var(--cd-switch-border-width) solid var(--cd-switch-border-off);
    background-color: var(--cd-switch-bg-off);
    transition: background-color var(--cd-switch-transition-duration) var(--cd-switch-transition-easing);
    inline-size: var(--cd-switch-width-default);
    block-size: var(--cd-switch-height-default);
  }
  .cd-switch:hover {
    background-color: var(--cd-switch-bg-off-hover);
  }
  .cd-switch:active {
    border-color: var(--cd-switch-bg-off-active);
  }
  .cd-switch-focus {
    outline: var(--cd-switch-outline-width) solid var(--cd-switch-outline-focus);
  }
  .cd-switch-checked {
    background-color: var(--cd-switch-bg-on);
  }
  .cd-switch-checked:hover {
    background-color: var(--cd-switch-bg-on-hover);
  }
  .cd-switch-disabled {
    cursor: not-allowed;
    background-color: var(--cd-switch-bg-off);
    border-color: var(--cd-switch-border-off);
  }
  .cd-switch-disabled:hover {
    background-color: var(--cd-switch-bg-off);
  }
  .cd-switch-disabled .cd-switch-knob {
    cursor: not-allowed;
    box-shadow: none;
    border: var(--cd-switch-knob-disabled-border-width) solid var(--cd-switch-knob-border-color);
  }
  .cd-switch-disabled .cd-switch-native-control {
    pointer-events: none;
    cursor: not-allowed;
  }
  .cd-switch-disabled.cd-switch-checked {
    border-color: var(--cd-switch-checked-disabled-border);
    background-color: var(--cd-switch-bg-on-disabled);
  }
  .cd-switch-disabled.cd-switch-checked .cd-switch-knob {
    box-shadow: none;
    border: none;
  }

  /* knob：绝对定位 + translateX 位移，对齐 Semi。 */
  .cd-switch-knob {
    box-shadow: var(--cd-switch-knob-shadow);
    cursor: pointer;
    box-sizing: border-box;
    position: absolute;
    inset-block-start: var(--cd-switch-knob-padding);
    inset-inline-start: 0;
    inline-size: var(--cd-switch-knob-size);
    block-size: var(--cd-switch-knob-size);
    border-radius: 50%;
    background-color: var(--cd-switch-knob-bg);
    transform: translateX(var(--cd-switch-knob-tx-off));
    transition:
      transform var(--cd-switch-transition-duration) var(--cd-switch-transition-easing),
      inline-size var(--cd-switch-transition-duration) var(--cd-switch-transition-easing);
  }
  .cd-switch-checked .cd-switch-knob {
    transform: translateX(var(--cd-switch-knob-tx-on));
  }

  /* native control：铺满、透明、承担交互与 a11y（对齐 Semi native-control）。 */
  .cd-switch-native-control {
    inline-size: 100%;
    block-size: 100%;
    opacity: 0;
    cursor: inherit;
    pointer-events: auto;
    margin: 0;
    position: absolute;
    inset-block-start: 0;
    inset-inline-start: 0;
  }

  /* 内嵌文案：绝对定位、宽 20px、居中，对齐 Semi。 */
  .cd-switch-checked-text,
  .cd-switch-unchecked-text {
    position: absolute;
    inset-block: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    inline-size: var(--cd-switch-text-width);
    block-size: 100%;
    font-size: var(--cd-switch-text-font-size);
  }
  .cd-switch-checked-text {
    color: var(--cd-switch-checked-text-color);
  }
  .cd-switch-unchecked-text {
    color: var(--cd-switch-unchecked-text-color);
    inset-inline-end: 0;
  }

  /* loading：复用 <Spin>（渐变弧 SVG），对齐 Semi 的 <Spin wrapperClassName>。
     背景切浅灰/浅绿；Spin 根 .cd-switch-loading-spin 绝对定位到 knob 位置、
     translateX 位移；SVG 恒白、尺寸对齐 Semi spin 宽度。 */
  .cd-switch-loading {
    display: inline-flex;
    align-items: center;
    background-color: var(--cd-switch-bg-spin-off);
  }
  .cd-switch-disabled.cd-switch-loading:not(.cd-switch-checked):hover {
    background-color: var(--cd-switch-bg-spin-off);
  }
  /* :global —— Spin 根节点由子组件渲染，作用域选择器不覆盖，故用 :global 精确限定在 .cd-switch 内。
     Spin 根盒子取消默认尺寸约束（收缩到内容），改由 SVG 尺寸决定；绝对定位到 knob 位置。 */
  .cd-switch :global(.cd-switch-loading-spin) {
    position: absolute;
    inset-block-start: 50%;
    inset-inline-start: 0;
    inline-size: auto;
    block-size: auto;
    transform: translate(var(--cd-switch-spin-tx-off), -50%);
    transition: transform var(--cd-switch-transition-duration) var(--cd-switch-transition-easing);
  }
  /* spinner 恒白：覆盖 Spin wrapper 的默认 color（currentColor 继承源，对齐 Semi）。
     wrapper 从 absolute 改回 static，让 Spin 根盒子随 SVG 内容收缩，避免相对 0 尺寸塌陷。 */
  .cd-switch :global(.cd-switch-loading-spin .cd-spin-wrapper) {
    position: static;
    display: inline-flex;
    align-items: center;
    transform: none;
    color: var(--cd-switch-spin-indicator);
  }
  .cd-switch.cd-switch-checked :global(.cd-switch-loading-spin) {
    transform: translate(var(--cd-switch-spin-tx-on), -50%);
  }
  .cd-switch :global(.cd-switch-loading-spin svg) {
    inline-size: var(--cd-switch-spin-size);
    block-size: var(--cd-switch-spin-size);
  }
  .cd-switch-loading.cd-switch-checked {
    background-color: var(--cd-switch-bg-spin-on);
  }
  .cd-switch-disabled.cd-switch-checked {
    background-color: var(--cd-switch-bg-on-disabled);
  }

  /* ============ large ============ */
  .cd-switch-large {
    inline-size: var(--cd-switch-width-large);
    block-size: var(--cd-switch-height-large);
    border-radius: var(--cd-switch-radius-large);
  }
  .cd-switch-large .cd-switch-knob {
    inline-size: var(--cd-switch-knob-size-large);
    block-size: var(--cd-switch-knob-size-large);
    inset-block-start: var(--cd-switch-knob-padding-large);
    transform: translateX(var(--cd-switch-knob-tx-off-large));
  }
  .cd-switch-large.cd-switch-checked .cd-switch-knob {
    transform: translateX(var(--cd-switch-knob-tx-on-large));
  }
  .cd-switch-large .cd-switch-checked-text,
  .cd-switch-large .cd-switch-unchecked-text {
    inline-size: var(--cd-switch-text-width-large);
    font-size: var(--cd-switch-text-font-size-large);
  }
  .cd-switch-large :global(.cd-switch-loading-spin) {
    transform: translate(var(--cd-switch-spin-tx-off-large), -50%);
  }
  .cd-switch-large.cd-switch-checked :global(.cd-switch-loading-spin) {
    transform: translate(var(--cd-switch-spin-tx-on-large), -50%);
  }
  .cd-switch-large :global(.cd-switch-loading-spin svg) {
    inline-size: var(--cd-switch-spin-size-large);
    block-size: var(--cd-switch-spin-size-large);
  }

  /* ============ small ============ */
  .cd-switch-small {
    inline-size: var(--cd-switch-width-small);
    block-size: var(--cd-switch-height-small);
    border-radius: var(--cd-switch-radius-small);
  }
  .cd-switch-small .cd-switch-knob {
    inline-size: var(--cd-switch-knob-size-small);
    block-size: var(--cd-switch-knob-size-small);
    inset-block-start: var(--cd-switch-knob-padding-small);
    transform: translateX(var(--cd-switch-knob-tx-off-small));
  }
  .cd-switch-small.cd-switch-checked .cd-switch-knob {
    transform: translateX(var(--cd-switch-knob-tx-on-small));
  }
  .cd-switch-small :global(.cd-switch-loading-spin) {
    transform: translate(var(--cd-switch-spin-tx-off-small), -50%);
  }
  .cd-switch-small.cd-switch-checked :global(.cd-switch-loading-spin) {
    transform: translate(var(--cd-switch-spin-tx-on-small), -50%);
  }
  .cd-switch-small :global(.cd-switch-loading-spin svg) {
    inline-size: var(--cd-switch-spin-size-small);
    block-size: var(--cd-switch-spin-size-small);
  }

  @media (prefers-reduced-motion: reduce) {
    .cd-switch,
    .cd-switch-knob {
      transition: none;
    }
  }

  /* —— RTL（对齐 Semi switch/rtl.scss）——
     knob 的位移是**物理方向**的 translateX（逻辑属性管不到），RTL 下须整体取负。

     ⚠️ 但只取负是不够的，会把 knob 甩出轨道外：本库正向用 `inset-inline-start: 0`，
     它在 RTL 下**自己已经翻到右边**了，再叠一个负位移等于翻两次
     （实测 knob 跑到 switch 左外侧 fromLeft=-17）。
     故须像 Semi 那样把锚点**用物理属性钉死在右边**（Semi rtl.scss 同样写 `right:0; left:auto`），
     锚点不再随书写方向浮动，负位移才是唯一的那次翻转。

     真机实测（RTL，40px 轨道 / 18px knob）：
       仅取负        → off fromLeft=-1、on fromLeft=-17（knob 跑到轨道外，错）
       钉右 + 取负   → off fromRight=3、on fromLeft=3（正确镜像 LTR） */
  :global(.cd-rtl) .cd-switch {
    direction: rtl;
  }
  :global(.cd-rtl) .cd-switch-knob {
    inset-inline-start: auto;
    right: 0;
    left: auto;
    transform: translateX(calc(-1 * var(--cd-switch-knob-tx-off)));
  }
  :global(.cd-rtl) .cd-switch-checked .cd-switch-knob {
    transform: translateX(calc(-1 * var(--cd-switch-knob-tx-on)));
  }
  :global(.cd-rtl) .cd-switch-native-control {
    inset-inline-end: 0;
  }
  :global(.cd-rtl) .cd-switch-unchecked-text {
    inset-inline-start: 0;
  }
  :global(.cd-rtl) .cd-switch :global(.cd-switch-loading-spin) {
    transform: translate(calc(-1 * var(--cd-switch-spin-tx-off)), -50%);
  }
  :global(.cd-rtl) .cd-switch.cd-switch-checked :global(.cd-switch-loading-spin) {
    transform: translate(calc(-1 * var(--cd-switch-spin-tx-on)), -50%);
  }
  :global(.cd-rtl) .cd-switch-large .cd-switch-knob {
    transform: translateX(calc(-1 * var(--cd-switch-knob-tx-off-large)));
  }
  :global(.cd-rtl) .cd-switch-large.cd-switch-checked .cd-switch-knob {
    transform: translateX(calc(-1 * var(--cd-switch-knob-tx-on-large)));
  }
  :global(.cd-rtl) .cd-switch-small .cd-switch-knob {
    transform: translateX(calc(-1 * var(--cd-switch-knob-tx-off-small)));
  }
  :global(.cd-rtl) .cd-switch-small.cd-switch-checked .cd-switch-knob {
    transform: translateX(calc(-1 * var(--cd-switch-knob-tx-on-small)));
  }
  :global(.cd-rtl) .cd-switch-large :global(.cd-switch-loading-spin) {
    transform: translate(calc(-1 * var(--cd-switch-spin-tx-off-large)), -50%);
  }
  :global(.cd-rtl) .cd-switch-large.cd-switch-checked :global(.cd-switch-loading-spin) {
    transform: translate(calc(-1 * var(--cd-switch-spin-tx-on-large)), -50%);
  }
  :global(.cd-rtl) .cd-switch-small :global(.cd-switch-loading-spin) {
    transform: translate(calc(-1 * var(--cd-switch-spin-tx-off-small)), -50%);
  }
  :global(.cd-rtl) .cd-switch-small.cd-switch-checked :global(.cd-switch-loading-spin) {
    transform: translate(calc(-1 * var(--cd-switch-spin-tx-on-small)), -50%);
  }
</style>
