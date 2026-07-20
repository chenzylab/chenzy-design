<!--
  Switch — 严格对齐 Semi Design（semi-ui/switch）。

  DOM 偏离说明（保守决策，见返回报告）：
    Semi 根为 <div class="semi-switch"> + 隐藏 <input type=checkbox role=switch>；
    本库保留 <button role="switch">（APG Switch Pattern，role 载体在按钮本身），
    a11y 更优且已有键盘/焦点测试覆盖，故不照搬 input 结构；仅将 class 命名
    连字符化对齐 Semi（cd-switch / cd-switch-checked / cd-switch-knob …）、
    token 名值对齐 Semi variables.scss。

  死循环红线：
    - 受控（value=）：父持有 value，仅经 onChange 上抛，绝不回写 prop。
    - on / activeText / cls 均为纯 $derived。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';

  type Size = 'small' | 'default' | 'large';

  interface Props {
    /** 受控值；提供则为受控。 */
    value?: boolean;
    /** 非受控初始值（对齐 Semi defaultChecked）。 */
    defaultValue?: boolean;
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
    'aria-required'?: boolean;
  }

  let {
    value,
    defaultValue = false,
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
    'aria-required': ariaRequired,
  }: Props = $props();

  const isControlled = $derived(value !== undefined);
  // 非受控初始态：仅取 defaultValue 首值播种，后续由内部 toggle 维护（受控则读 value）。
  let inner = $state(getInitialValue());
  const on = $derived(isControlled ? !!value : inner);

  function getInitialValue(): boolean {
    return defaultValue;
  }

  const interactable = $derived(!disabled && !loading);

  function toggle(event: Event) {
    if (!interactable) return;
    const next = !on;
    // 受控：父持有 value，仅 onChange 上抛；非受控：同步内部态。
    if (!isControlled) inner = next;
    onChange?.(next, event);
  }

  // 内嵌文字在最小尺寸下不渲染（对齐 Semi：small 放不下文本）。
  const activeText = $derived<string | Snippet | undefined>(
    size === 'small' ? undefined : on ? checkedText : uncheckedText,
  );
  const isSnippet = (c: string | Snippet | undefined): c is Snippet => typeof c === 'function';

  const cls = $derived(
    [
      'cd-switch',
      size === 'large' && 'cd-switch-large',
      size === 'small' && 'cd-switch-small',
      on && 'cd-switch-checked',
      disabled && 'cd-switch-disabled',
      loading && 'cd-switch-loading',
      className,
    ]
      .filter(Boolean)
      .join(' '),
  );
</script>

<button
  {id}
  type="button"
  role="switch"
  class={cls}
  {style}
  aria-checked={on}
  aria-labelledby={ariaLabelledby}
  aria-label={ariaLabelledby ? undefined : ariaLabel}
  aria-describedby={ariaDescribedby}
  aria-errormessage={ariaErrormessage}
  aria-invalid={ariaInvalid || undefined}
  aria-required={ariaRequired || undefined}
  aria-busy={loading || undefined}
  disabled={disabled || loading}
  onclick={toggle}
  onmouseenter={onMouseEnter}
  onmouseleave={onMouseLeave}
>
  {#if activeText !== undefined}
    <span class={on ? 'cd-switch-checked-text' : 'cd-switch-unchecked-text'}>
      {#if isSnippet(activeText)}{@render activeText()}{:else}{activeText}{/if}
    </span>
  {/if}
  {#if loading}
    <span class="cd-switch-loading-spin" aria-hidden="true"></span>
  {:else}
    <span class="cd-switch-knob" aria-hidden="true"></span>
  {/if}
</button>

<style>
  .cd-switch {
    position: relative;
    display: inline-block;
    box-sizing: border-box;
    inline-size: var(--cd-switch-width-default);
    block-size: var(--cd-switch-height-default);
    padding: 0;
    border: var(--cd-switch-border-width) solid var(--cd-switch-border-off);
    border-radius: var(--cd-switch-radius);
    background: var(--cd-switch-bg-off);
    cursor: pointer;
    transition: background-color var(--cd-switch-transition-duration) var(--cd-switch-transition-easing);
  }
  .cd-switch:hover {
    background: var(--cd-switch-bg-off-hover);
  }
  .cd-switch:active {
    background: var(--cd-switch-bg-off-active);
  }
  .cd-switch-small {
    inline-size: var(--cd-switch-width-small);
    block-size: var(--cd-switch-height-small);
  }
  .cd-switch-large {
    inline-size: var(--cd-switch-width-large);
    block-size: var(--cd-switch-height-large);
  }
  .cd-switch-checked {
    background: var(--cd-switch-bg-on);
  }
  .cd-switch-checked:hover {
    background: var(--cd-switch-bg-on-hover);
  }
  .cd-switch-checked:active {
    background: var(--cd-switch-bg-on-active);
  }
  .cd-switch:focus-visible {
    outline: var(--cd-switch-outline-width) solid var(--cd-switch-outline-focus);
    outline-offset: 0;
  }
  .cd-switch-disabled {
    cursor: not-allowed;
    background: var(--cd-switch-bg-off);
    opacity: 0.5;
  }
  .cd-switch-disabled.cd-switch-checked {
    background: var(--cd-switch-bg-on-disabled);
    opacity: 1;
  }
  .cd-switch-disabled:hover,
  .cd-switch-disabled:active {
    background: var(--cd-switch-bg-off);
  }
  .cd-switch-disabled.cd-switch-checked:hover,
  .cd-switch-disabled.cd-switch-checked:active {
    background: var(--cd-switch-bg-on-disabled);
  }

  /* knob：绝对定位 + translateX 位移，对齐 Semi。 */
  .cd-switch-knob {
    position: absolute;
    inset-block-start: var(--cd-switch-knob-padding);
    inset-inline-start: 0;
    inline-size: var(--cd-switch-knob-size);
    block-size: var(--cd-switch-knob-size);
    border-radius: 50%;
    background: var(--cd-switch-knob-bg);
    box-shadow: var(--cd-switch-knob-shadow);
    transform: translateX(var(--cd-switch-knob-tx-off));
    transition: transform var(--cd-switch-transition-duration) var(--cd-switch-transition-easing);
  }
  .cd-switch-checked .cd-switch-knob {
    transform: translateX(var(--cd-switch-knob-tx-on));
  }
  .cd-switch-large .cd-switch-knob {
    inset-block-start: var(--cd-switch-knob-padding-large);
    inline-size: var(--cd-switch-knob-size-large);
    block-size: var(--cd-switch-knob-size-large);
    transform: translateX(var(--cd-switch-knob-tx-off-large));
  }
  .cd-switch-large.cd-switch-checked .cd-switch-knob {
    transform: translateX(var(--cd-switch-knob-tx-on-large));
  }
  .cd-switch-small .cd-switch-knob {
    inset-block-start: var(--cd-switch-knob-padding-small);
    inline-size: var(--cd-switch-knob-size-small);
    block-size: var(--cd-switch-knob-size-small);
    transform: translateX(var(--cd-switch-knob-tx-off-small));
  }
  .cd-switch-small.cd-switch-checked .cd-switch-knob {
    transform: translateX(var(--cd-switch-knob-tx-on-small));
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
    line-height: 1;
  }
  .cd-switch-checked-text {
    inset-inline-start: 0;
    color: var(--cd-switch-checked-text-color);
  }
  .cd-switch-unchecked-text {
    inset-inline-end: 0;
    color: var(--cd-switch-unchecked-text-color);
  }
  .cd-switch-large .cd-switch-checked-text,
  .cd-switch-large .cd-switch-unchecked-text {
    inline-size: var(--cd-switch-text-width-large);
    font-size: var(--cd-switch-text-font-size-large);
  }

  /* loading spin：与 knob 互斥切换，对齐 Semi。 */
  .cd-switch-loading {
    background: var(--cd-switch-bg-spin-off);
  }
  .cd-switch-loading.cd-switch-checked {
    background: var(--cd-switch-bg-spin-on);
  }
  .cd-switch-loading-spin {
    position: absolute;
    inset-block-start: var(--cd-switch-knob-padding);
    inset-inline-start: 0;
    inline-size: var(--cd-switch-knob-size);
    block-size: var(--cd-switch-knob-size);
    border: 2px solid var(--cd-switch-spin-track);
    border-block-start-color: var(--cd-switch-spin-indicator);
    border-radius: 50%;
    transform: translateX(var(--cd-switch-knob-tx-off));
    animation: cd-switch-spin var(--cd-switch-spin-duration) linear infinite;
  }
  .cd-switch-checked .cd-switch-loading-spin {
    transform: translateX(var(--cd-switch-knob-tx-on));
  }
  .cd-switch-large .cd-switch-loading-spin {
    inline-size: var(--cd-switch-knob-size-large);
    block-size: var(--cd-switch-knob-size-large);
    transform: translateX(var(--cd-switch-knob-tx-off-large));
  }
  .cd-switch-large.cd-switch-checked .cd-switch-loading-spin {
    transform: translateX(var(--cd-switch-knob-tx-on-large));
  }
  .cd-switch-small .cd-switch-loading-spin {
    inline-size: var(--cd-switch-knob-size-small);
    block-size: var(--cd-switch-knob-size-small);
    transform: translateX(var(--cd-switch-knob-tx-off-small));
  }
  .cd-switch-small.cd-switch-checked .cd-switch-loading-spin {
    transform: translateX(var(--cd-switch-knob-tx-on-small));
  }

  @keyframes cd-switch-spin {
    to {
      transform: rotate(360deg);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .cd-switch,
    .cd-switch-knob,
    .cd-switch-loading-spin {
      transition: none;
      animation: none;
    }
  }
</style>
