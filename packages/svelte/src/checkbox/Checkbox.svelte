<!--
  Checkbox — 严格对齐 Semi（checkbox.tsx / checkboxInner.tsx）。
  Works standalone (controlled / uncontrolled) or inside CheckboxGroup via context.
  DOM class 镜像 Semi 连字符体系（cd-checkbox / -inner / -inner-display / -addon / -content）。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { useId } from '@chenzy-design/core';
  import { IconCheckboxTick, IconCheckboxIndeterminate } from '@chenzy-design/icons';
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
    ariaLabel?: string;
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
    /** a11y: wrapper role（Group 内为 listitem）。 */
    role?: string;
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
    ariaLabel,
    ariaLabelledby,
    ariaDescribedby,
    ariaErrormessage,
    ariaRequired,
    ariaInvalid,
    role,
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
  let inputEl = $state<HTMLInputElement | null>(null);

  function getInitialChecked(): boolean {
    return defaultChecked;
  }

  /** Imperatively focus the native checkbox input (honors `preventScroll`). */
  export function focus(): void {
    inputEl?.focus(preventScroll !== undefined ? { preventScroll } : undefined);
  }

  /** Imperatively blur the native checkbox input. */
  export function blur(): void {
    inputEl?.blur();
  }

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

  // 对齐 Semi：点击整个 checkbox（含 addon 文本 / extra / card）都切换（checkbox.tsx:299
  // onClick={handleChange}）。点击与键盘走互斥两条路径，避免双触发：
  //   · 指针点击 → 根 wrapper 的 onclick（input pointer-events:none，故 target 恒非 input，
  //     无原生 checkbox toggle 干扰）；
  //   · 键盘 Space / 聚焦态 → 原生 input 自身产生 change，走 input 的 onchange。
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

  /** 指针点击 wrapper（含文本/额外区）触发切换（对齐 Semi onClick）。input 已 pointer-events:none，
   *  指针命中恒不落在 input 上；键盘 Space 会在 input 上派发 click（target===input）并冒泡到此，
   *  那条路径交给 input 的 onchange 处理，此处按 target 跳过，避免与 change 双触发。 */
  function handleWrapperClick(e: MouseEvent) {
    if (resolvedDisabled) return;
    if (e.target === inputEl) return; // 键盘 Space 派发的 click：让 onchange 处理
    inputEl?.focus(preventScroll !== undefined ? { preventScroll } : undefined);
    commit(indeterminate && !isChecked ? true : !isChecked, e);
  }

  /** 原生 input 的 change（键盘 Space / 聚焦态切换的唯一入口）。 */
  function handleInputChange(e: Event & { currentTarget: HTMLInputElement }) {
    commit(e.currentTarget.checked, e);
  }

  /** Enter 切换（对齐 Semi handleEnterPress）。原生 checkbox 只认 Space，Enter 是 Semi 额外行为。 */
  function handleKeydown(e: KeyboardEvent) {
    if (resolvedDisabled) return;
    if (e.key === 'Enter') {
      e.preventDefault();
      commit(indeterminate && !isChecked ? true : !isChecked, e);
    }
  }

  /** Set the indeterminate DOM property (not a reflected attribute). */
  function indeterminateAttach(node: HTMLInputElement) {
    node.indeterminate = indeterminate && !isChecked;
  }

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
      className,
    ]
      .filter(Boolean)
      .join(' '),
  );

  const innerCls = $derived(
    [
      'cd-checkbox-inner',
      isChecked && 'cd-checkbox-inner-checked',
      isPureCardType && 'cd-checkbox-inner-pureCardType',
    ]
      .filter(Boolean)
      .join(' '),
  );

  const extraIsString = $derived(typeof extra === 'string');

  // 合并内部生成的关联 id 与外部（withField）注入的 aria id：
  // labelledby = 内部 addonId（有可见 children 时）拼外部 ariaLabelledby；
  // describedby = 内部 extraId（有 extra 时）拼外部 ariaDescribedby。
  const resolvedLabelledby = $derived(
    [children ? resolvedAddonId : undefined, ariaLabelledby].filter(Boolean).join(' ') || undefined,
  );
  const resolvedDescribedby = $derived(
    [extraId, ariaDescribedby].filter(Boolean).join(' ') || undefined,
  );
</script>

<!-- Semi 注释：label 更好，但用 span 是为规避 gitlab #364（对齐 Semi 根用 span 非 label）。
     切换挂在根 span 的 click 上（对齐 Semi onClick={handleChange}），点击整个 checkbox（含
     addon 文本 / extra / card）都切换；原生 input 只承载焦点 / a11y，其 change 被 preventDefault
     旁路，状态由受控 checked 驱动。 -->
<span
  class={cls}
  {style}
  id={id}
  {role}
  aria-labelledby={resolvedLabelledby}
  onclick={handleWrapperClick}
  onkeydown={handleKeydown}
>
  <span class={innerCls}>
    <input
      bind:this={inputEl}
      {@attach indeterminateAttach}
      id={fieldId}
      class="cd-checkbox-input"
      type="checkbox"
      name={resolvedName}
      value={value !== undefined ? String(value) : undefined}
      checked={isChecked}
      disabled={resolvedDisabled}
      aria-label={!children ? ariaLabel : undefined}
      aria-labelledby={resolvedLabelledby}
      aria-describedby={resolvedDescribedby}
      aria-errormessage={ariaErrormessage}
      aria-required={ariaRequired || undefined}
      aria-invalid={ariaInvalid || undefined}
      onchange={handleInputChange}
    />
    <span class="cd-checkbox-inner-display" aria-hidden="true">
      {#if indeterminate && !isChecked}
        <IconCheckboxIndeterminate size="inherit" />
      {:else if isChecked}
        <IconCheckboxTick size="inherit" />
      {/if}
    </span>
  </span>
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
    line-height: 1.4;
    transition:
      background-color var(--cd-transition-duration-checkbox-bg) var(--cd-transition-function-checkbox-bg)
        var(--cd-transition-delay-checkbox-bg),
      border-color var(--cd-transition-duration-checkbox-border) var(--cd-transition-function-checkbox-border)
        var(--cd-transition-delay-checkbox-border);
  }
  .cd-checkbox-disabled {
    cursor: not-allowed;
  }

  /* —— inner：三层 span.inner > input + span.inner-display —— */
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
  /* 原生 input 铺满 inner，opacity:0 承载键盘焦点与 a11y（对齐 Semi checkbox.scss:22-30）。
     pointer-events:none：切换由根 wrapper 的 click 承载（对齐 Semi onClick），若 input 仍接收指针
     则点框时浏览器会先原生 toggle input.checked，再与受控 checked 绑定打架 —— 表现为根 class 已
     checked 但 input.checked 停在旧值（受控值未变时 Svelte 跳过 DOM 纠正），真机点框失灵。
     焦点改由 handleToggle 内 inputEl.focus() 显式承载（对齐 Semi focusCheckboxEntity）。 */
  .cd-checkbox-input {
    position: absolute;
    inset: 0;
    inline-size: 100%;
    block-size: 100%;
    margin: 0;
    padding: 0;
    opacity: 0;
    cursor: inherit;
    pointer-events: none;
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

  /* 未选中态悬浮（对齐 Semi：描边 focus-border、背景 fill-0） */
  .cd-checkbox:hover:not(.cd-checkbox-disabled):not(.cd-checkbox-checked):not(.cd-checkbox-indeterminate)
    .cd-checkbox-inner-display {
    background: var(--cd-color-checkbox-default-bg-hover);
    box-shadow: inset 0 0 0 var(--cd-size-checkbox-inner-shadow) var(--cd-color-checkbox-default-border-hover);
  }
  /* 未选中态按下 */
  .cd-checkbox:active:not(.cd-checkbox-disabled):not(.cd-checkbox-checked):not(.cd-checkbox-indeterminate)
    .cd-checkbox-inner-display {
    background: var(--cd-color-checkbox-default-bg-active);
  }

  /* 选中 / 半选态 */
  .cd-checkbox-checked .cd-checkbox-inner-display,
  .cd-checkbox-indeterminate .cd-checkbox-inner-display {
    background: var(--cd-color-checkbox-checked-bg-default);
    color: var(--cd-color-checkbox-checked-icon-default);
    box-shadow: inset 0 0 0 var(--cd-size-checkbox-inner-shadow) var(--cd-color-checkbox-checked-border-default);
  }
  .cd-checkbox-checked:hover:not(.cd-checkbox-disabled) .cd-checkbox-inner-display,
  .cd-checkbox-indeterminate:hover:not(.cd-checkbox-disabled) .cd-checkbox-inner-display {
    background: var(--cd-color-checkbox-checked-bg-hover);
    box-shadow: inset 0 0 0 var(--cd-size-checkbox-inner-shadow) var(--cd-color-checkbox-checked-border-hover);
  }
  .cd-checkbox-checked:active:not(.cd-checkbox-disabled) .cd-checkbox-inner-display,
  .cd-checkbox-indeterminate:active:not(.cd-checkbox-disabled) .cd-checkbox-inner-display {
    background: var(--cd-color-checkbox-checked-bg-active);
    box-shadow: inset 0 0 0 var(--cd-size-checkbox-inner-shadow) var(--cd-color-checkbox-checked-border-active);
  }

  /* 禁用态 */
  .cd-checkbox-disabled .cd-checkbox-inner-display {
    background: var(--cd-color-checkbox-disabled-bg-default);
    box-shadow: inset 0 0 0 var(--cd-size-checkbox-inner-shadow) var(--cd-color-checkbox-disabled-border-default);
    color: var(--cd-color-checkbox-checked-icon-disabled);
  }
  .cd-checkbox-disabled.cd-checkbox-checked .cd-checkbox-inner-display,
  .cd-checkbox-disabled.cd-checkbox-indeterminate .cd-checkbox-inner-display {
    opacity: 0.75;
    background: var(--cd-color-checkbox-checked-bg-disabled);
    box-shadow: inset 0 0 0 var(--cd-size-checkbox-inner-shadow) var(--cd-color-checkbox-checked-bg-disabled);
    color: var(--cd-color-checkbox-checked-icon-disabled);
  }
  .cd-checkbox-disabled .cd-checkbox-addon,
  .cd-checkbox-disabled .cd-checkbox-extra {
    color: var(--cd-color-checkbox-label-text-disabled);
  }

  /* 焦点环：input focus-visible 时给 inner-display 描 focus ring */
  .cd-checkbox-input:focus-visible + .cd-checkbox-inner-display {
    outline: var(--cd-width-checkbox-outline) solid var(--cd-color-checkbox-primary-outline-focus);
    outline-offset: 0;
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
  .cd-checkbox-cardType .cd-checkbox-inner-display {
    background: var(--cd-color-checkbox-cardtype-inner-bg-default);
  }
  /* pureCard：隐藏勾选框但保留 input 承载 a11y 焦点（对齐 Semi checkbox.scss:204-210） */
  .cd-checkbox-inner-pureCardType {
    opacity: 0;
    width: 0;
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
    .cd-checkbox-inner-display {
      transition: none;
    }
  }
</style>
