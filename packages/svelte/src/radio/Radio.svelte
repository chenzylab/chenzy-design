<!--
  Radio — see specs/components/input/Radio.spec.md
  Inside RadioGroup: role=radio via native input, roving tabindex.
  Standalone: self controlled / uncontrolled.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { useId } from '@chenzy-design/core';
  import {
    getRadioGroupContext,
    type RadioValue,
    type RadioSize,
    type RadioStatus,
    type RadioType,
  } from './context.js';

  interface Props {
    value: RadioValue;
    checked?: boolean;
    defaultChecked?: boolean;
    disabled?: boolean;
    size?: RadioSize;
    status?: RadioStatus;
    type?: RadioType;
    name?: string;
    extra?: string | undefined;
    children?: Snippet;
    onChange?: (checked: boolean) => void;
    addonId?: string;
    addonClassName?: string;
    addonStyle?: string;
    autoFocus?: boolean;
    extraId?: string;
    mode?: 'advanced' | '';
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
    size = 'default',
    status = 'default',
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

  let inputEl = $state<HTMLElement | null>(null);
  $effect(() => {
    if (autoFocus) inputEl?.focus({ preventScroll });
  });

  function getInitialChecked(): boolean {
    return defaultChecked;
  }

  const resolvedDisabled = $derived(disabled || (group ? group.getDisabled() : false));
  const resolvedSize = $derived(group ? group.getSize() : size);
  // Group transparently provides `status`; a per-item non-default `status` overrides it.
  const resolvedStatus = $derived(status !== 'default' ? status : (group?.getStatus() ?? 'default'));
  const resolvedName = $derived(group ? group.name : name);
  // type 优先取本项显式值，否则继承 Group，再退 default。
  const resolvedType = $derived<RadioType>(type ?? group?.getType() ?? 'default');
  // button/card/pureCard 用 role=radio 容器（非原生 input），其余用隐藏 input。
  const isFancy = $derived(resolvedType !== 'default');

  const isChecked = $derived(
    group ? group.getSelected() === value : isControlled ? !!checked : inner,
  );

  // roving tabindex: in a group only the tab stop is 0, else -1; standalone always 0
  const tabindex = $derived(group ? (group.isTabStop(value, resolvedDisabled) ? 0 : -1) : 0);

  function handleChange(e: Event & { currentTarget: HTMLInputElement }) {
    const next = e.currentTarget.checked;
    if (group) {
      group.select(value);
      onChange?.(true);
      return;
    }
    // Controlled (`checked=` / `bind:checked`): parent owns `checked`; propagate
    // only via `onChange`. Writing the prop AND firing `onChange` loops.
    // Uncontrolled: keep our own state in sync.
    if (!isControlled) inner = next;
    onChange?.(next);
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
        onChange?.(false);
        return;
      }
      activate();
      return;
    }
    group?.onKeydown(e, value);
  }

  function handleFancyClick() {
    if (resolvedDisabled) return;
    if (mode === 'advanced' && isChecked) {
      onChange?.(false);
      return;
    }
    activate();
  }

  // 选中本项（用于 role=radio 容器的点击/键盘），同 handleChange 的提交逻辑。
  function activate() {
    if (group) {
      group.select(value);
      onChange?.(true);
      return;
    }
    if (!isControlled) inner = true;
    onChange?.(true);
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
      `cd-radio--${resolvedSize}`,
      `cd-radio--${resolvedType}`,
      resolvedStatus !== 'default' && `cd-radio--${resolvedStatus}`,
      isChecked && 'cd-radio--checked',
      resolvedDisabled && 'cd-radio--disabled',
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
    opacity: 0.5;
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
    inline-size: var(--cd-radio-size-default);
    block-size: var(--cd-radio-size-default);
    background: var(--cd-radio-bg);
    border: 1px solid var(--cd-radio-border);
    border-radius: var(--cd-border-radius-full);
    transition:
      border-color var(--cd-motion-duration-fast) var(--cd-motion-ease-standard);
  }
  .cd-radio--small .cd-radio__circle {
    inline-size: var(--cd-radio-size-small);
    block-size: var(--cd-radio-size-small);
  }
  .cd-radio--large .cd-radio__circle {
    inline-size: var(--cd-radio-size-large);
    block-size: var(--cd-radio-size-large);
  }
  /* 未选中态悬浮：对齐 Semi（描边 focus-border、背景 fill-0） */
  .cd-radio:hover:not(.cd-radio--disabled):not(.cd-radio--checked) .cd-radio__circle {
    background: var(--cd-radio-bg-hover);
    border-color: var(--cd-radio-border-hover);
  }
  .cd-radio--checked .cd-radio__circle {
    border-color: var(--cd-radio-color-checked);
  }
  .cd-radio--checked .cd-radio__circle::after {
    content: '';
    position: absolute;
    inset: 50%;
    inline-size: 50%;
    block-size: 50%;
    transform: translate(-50%, -50%);
    background: var(--cd-radio-dot-color);
    border-radius: var(--cd-border-radius-full);
  }
  /* 校验态：边框改用 warning/error，覆盖默认与 checked 描边（token 驱动） */
  .cd-radio--warning .cd-radio__circle {
    border-color: var(--cd-radio-color-warning);
  }
  .cd-radio--error .cd-radio__circle {
    border-color: var(--cd-radio-color-error);
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
  /* button 型：矩形分段按钮，隐藏圆点 indicator */
  .cd-radio--button {
    gap: 0;
    block-size: var(--cd-radio-button-height);
    padding-inline: var(--cd-spacing-radio-addon-buttonradio-middle-paddingx);
    align-items: center;
    justify-content: center;
    color: var(--cd-color-radio-buttonradio-text-default);
    background: var(--cd-color-radio-buttonradio-bg-default);
    border: 1px solid var(--cd-radio-border);
    border-radius: var(--cd-radius-radio-buttonradio);
  }
  .cd-radio--button.cd-radio--small {
    block-size: var(--cd-radio-button-height-small);
  }
  .cd-radio--button.cd-radio--large {
    block-size: var(--cd-radio-button-height-large);
  }
  .cd-radio--button .cd-radio__circle {
    display: none;
  }
  .cd-radio--button.cd-radio--checked {
    color: var(--cd-radio-color-checked);
    border-color: var(--cd-radio-color-checked);
  }
  /* card / pureCard 型：带边框卡片，选中高亮边框 */
  .cd-radio--card,
  .cd-radio--pureCard {
    padding: var(--cd-spacing-radio-cardradiogroup-paddingy) var(--cd-spacing-radio-cardradiogroup-paddingx);
    background: var(--cd-radio-bg);
    border: 1px solid var(--cd-radio-border);
    border-radius: var(--cd-radio-card-radius);
  }
  .cd-radio--card.cd-radio--checked,
  .cd-radio--pureCard.cd-radio--checked {
    border-color: var(--cd-radio-card-border-checked);
  }
  .cd-radio--card.cd-radio--warning,
  .cd-radio--pureCard.cd-radio--warning,
  .cd-radio--button.cd-radio--warning {
    border-color: var(--cd-radio-color-warning);
  }
  .cd-radio--card.cd-radio--error,
  .cd-radio--pureCard.cd-radio--error,
  .cd-radio--button.cd-radio--error {
    border-color: var(--cd-radio-color-error);
  }

  @media (prefers-reduced-motion: reduce) {
    .cd-radio__circle {
      transition: none;
    }
  }
</style>
