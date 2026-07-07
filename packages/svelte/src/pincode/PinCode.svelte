<!--
  PinCode — see specs/components/input/PinCode.spec.md
  分格验证码 / OTP：N 个受控单字符输入格的编排器。跨格键盘（←→/Backspace/Delete）、
  自动跳格、整串粘贴分发（遇非法字符停止）、受控/非受控、组合态过滤，全部委托
  @chenzy-design/core 的纯函数。单格复用 Input 家族的填充式外观 token（--cd-color-input-*）。
  a11y 增强（超越 Semi）：root role=group + aria-label；每格 aria-label 位次「第 N 位，共 M 位」、
  autoComplete="one-time-code"、inputMode 随 format、maxlength=1。
-->
<script lang="ts">
  import { useId } from '@chenzy-design/core';
  import {
    validateChar,
    inputModeForFormat,
    toValueList,
    fromValueList,
    isComplete,
    completeSingleInput,
    pinCodeHandleKeyDown,
    distributePaste,
    type PinCodeFormat,
  } from '@chenzy-design/core';
  import { useLocale } from '../locale-provider/index.js';

  type Size = 'small' | 'default' | 'large';
  type Status = 'default' | 'warning' | 'error';

  interface Props {
    /** 受控值。整串验证码字符串（如 "123456"），内部拆到各格；配合 onChange。 */
    value?: string;
    /** 非受控初始值，仅初始化时拆分。 */
    defaultValue?: string;
    /** 验证码位数（格数）。 */
    count?: number;
    /** 单字符可输入范围：number=纯数字 / mixed=数字+字母 / RegExp 逐字符 test / 函数逐字符判定。 */
    format?: PinCodeFormat;
    /** 每格尺寸。 */
    size?: Size;
    /** 禁用全部格。 */
    disabled?: boolean;
    /**
     * 挂载时聚焦第一格。默认 true（对齐 Semi）：验证码场景用户几乎总是立即输入，
     * 自动聚焦第一格符合预期；如需关闭传 autoFocus={false}。
     */
    autoFocus?: boolean;
    /** 表单字段名，透传隐藏聚合 input 提交整串值。 */
    name?: string;
    /** 根容器 id，关联 aria-labelledby；不传自动生成。 */
    id?: string;
    /** 无可视标签时分组的辅助名（i18n 默认）。 */
    ariaLabel?: string;
    /** 外部可视 label 的 id，关联为分组名（优先于 ariaLabel）。 */
    ariaLabelledby?: string;
    /** 校验态，透传各格边框语义。 */
    status?: Status;
    /** 根容器类名。 */
    className?: string;
    /** 根容器内联样式。 */
    style?: string;
    /** 任一格值变化即触发，回传各格拼接整串（含清空）。 */
    onChange?: (value: string) => void;
    /** 最后一格填入完成时触发一次，回传完整验证码；同时 blur 末格。 */
    onComplete?: (value: string) => void;
  }

  let {
    value = $bindable(),
    defaultValue = '',
    count = 6,
    format = 'number',
    size = 'default',
    disabled = false,
    autoFocus = true,
    name,
    id,
    ariaLabel,
    ariaLabelledby,
    status = 'default',
    className,
    style,
    onChange,
    onComplete,
  }: Props = $props();

  const loc = useLocale();
  const autoId = useId('cd-pincode');
  const rootId = $derived(id ?? autoId);

  const isControlled = $derived(value !== undefined);
  // 非受控内部值以整串字符串承载（受控时不写此 state，依赖外部回写）。
  // 仅捕获挂载时的 defaultValue 初值（对齐 Input/Rating 的非受控范式）。
  let inner = $state(getInitialValue());

  function getInitialValue(): string {
    return defaultValue;
  }
  const currentStr = $derived(isControlled ? (value ?? '') : inner);
  const cells = $derived(toValueList(currentStr, count));

  const inputMode = $derived(inputModeForFormat(format));
  const rtl = $derived(loc().direction === 'rtl');
  const resolvedAriaLabel = $derived(ariaLabel ?? loc().t('PinCode.ariaLabel'));

  const cls = $derived(
    ['cd-pincode', `cd-pincode--${size}`, `cd-pincode--${status}`, disabled && 'cd-pincode--disabled', className]
      .filter(Boolean)
      .join(' '),
  );

  // 各格 DOM 引用（供 focus / blur / 跳格）。普通数组簿记（非 $state，避免 effect 自循环）。
  const inputEls: (HTMLInputElement | undefined)[] = [];

  function setCells(next: string[]) {
    const str = fromValueList(next);
    if (!isControlled) inner = str;
    onChange?.(str);
  }

  function focusCell(index: number, selectEnd = true) {
    const el = inputEls[Math.max(0, Math.min(count - 1, index))];
    if (!el) return;
    el.focus();
    if (selectEnd) {
      // 将光标置于字符后（若有）。
      const len = el.value.length;
      try {
        el.setSelectionRange(len, len);
      } catch {
        // number/email 类型不支持 setSelectionRange；text 恒支持，忽略即可。
      }
    }
  }

  function blurCell(index: number) {
    inputEls[Math.max(0, Math.min(count - 1, index))]?.blur();
  }

  // —— 实例方法（供 bind:this 暴露）——
  export function focus(index = 0): void {
    focusCell(index);
  }
  export function blur(index = 0): void {
    blurCell(index);
  }

  // 组合态：中文候选期间不写入。逐格独立追踪。
  let composingIndex = $state<number | null>(null);

  function handleInput(index: number, e: Event & { currentTarget: HTMLInputElement }) {
    const el = e.currentTarget;
    if (composingIndex === index) return; // 组合中，等 compositionend
    // 取本次输入的最后一个合法字符（处理粘贴/快速输入落到 input 事件的情况由 onpaste 兜底）。
    const raw = el.value;
    const chars = [...raw];
    const char = chars[chars.length - 1] ?? '';
    if (!char || !validateChar(char, format)) {
      // 非法字符：回滚显示为当前格既有值。
      el.value = cells[index] ?? '';
      return;
    }
    const r = completeSingleInput(cells, count, index, char);
    setCells(r.list);
    if (r.completed) {
      // 填满：blur 末格并触发 onComplete。
      blurCell(count - 1);
      onComplete?.(fromValueList(r.list));
    } else {
      focusCell(r.nextIndex);
    }
  }

  function handleKeydown(index: number, e: KeyboardEvent) {
    if (composingIndex === index) return;
    const action = pinCodeHandleKeyDown(e.key, index, count, rtl);
    if (action.type === 'none') return;
    e.preventDefault();
    if (action.type === 'focus') {
      focusCell(action.index);
    } else {
      // clear：清空当前格并移动焦点。
      const next = toValueList(currentStr, count);
      next[action.index] = '';
      setCells(next);
      focusCell(action.nextIndex);
    }
  }

  function handlePaste(index: number, e: ClipboardEvent) {
    const text = e.clipboardData?.getData('text') ?? '';
    if (!text) return;
    e.preventDefault(); // 防双写
    const r = distributePaste(cells, count, index, text, format);
    if (r.written === 0) return;
    setCells(r.list);
    if (r.completed) {
      blurCell(count - 1);
      onComplete?.(fromValueList(r.list));
    } else {
      focusCell(r.nextIndex);
    }
  }

  function handleCompositionStart(index: number) {
    composingIndex = index;
  }

  function handleCompositionEnd(index: number, e: Event & { currentTarget: HTMLInputElement }) {
    composingIndex = null;
    // 组合结束后按 input 逻辑重新处理最后落定的字符。
    handleInput(index, e as Event & { currentTarget: HTMLInputElement });
  }

  function handleFocus(e: FocusEvent & { currentTarget: HTMLInputElement }) {
    // 聚焦时全选，便于覆盖输入。
    e.currentTarget.select();
  }

  // autoFocus：命令式聚焦第一格一次（红线 #3，SSR 安全，延后到下一帧）。
  $effect(() => {
    if (!autoFocus || disabled) return;
    const el = inputEls[0];
    if (!el) return;
    const raf = requestAnimationFrame(() => el.focus());
    return () => cancelAnimationFrame(raf);
  });

  function cellLabel(index: number): string {
    return loc().t('PinCode.cellAriaLabel', {
      index: loc().formatNumber(index + 1),
      count: loc().formatNumber(count),
    });
  }

  const aggregateValue = $derived(fromValueList(cells));
</script>

<div
  id={rootId}
  class={cls}
  role="group"
  aria-label={ariaLabelledby ? undefined : resolvedAriaLabel}
  aria-labelledby={ariaLabelledby}
  aria-disabled={disabled || undefined}
  {style}
>
  {#if name}<input type="hidden" {name} value={aggregateValue} />{/if}

  {#each cells as cell, i (i)}
    <input
      bind:this={inputEls[i]}
      class="cd-pincode__cell"
      class:cd-pincode__cell--warning={status === 'warning'}
      class:cd-pincode__cell--error={status === 'error'}
      type="text"
      inputmode={inputMode}
      autocomplete="one-time-code"
      maxlength="1"
      value={cell}
      {disabled}
      aria-label={cellLabel(i)}
      aria-invalid={status === 'error' || undefined}
      oninput={(e) => handleInput(i, e)}
      onkeydown={(e) => handleKeydown(i, e)}
      onpaste={(e) => handlePaste(i, e)}
      onfocus={handleFocus}
      oncompositionstart={() => handleCompositionStart(i)}
      oncompositionend={(e) => handleCompositionEnd(i, e)}
    />
  {/each}
</div>

<style>
  .cd-pincode {
    display: inline-flex;
    align-items: center;
    gap: var(--cd-pincode-gap);
  }
  /* 单格：复用 Input 家族填充式外观 token（边框 / 背景 / 聚焦 / 校验态），正方形居中。 */
  .cd-pincode__cell {
    box-sizing: border-box;
    inline-size: var(--cd-pincode-cell-width-default);
    block-size: var(--cd-height-input-wrapper-default);
    margin: 0;
    padding: 0;
    text-align: var(--cd-pincode-cell-text-align);
    font-size: var(--cd-pincode-cell-font-size);
    color: var(--cd-color-input-default-text-default);
    background: var(--cd-color-input-default-bg-default);
    border: var(--cd-width-input-wrapper-border) solid var(--cd-color-input-default-border-default);
    border-radius: var(--cd-radius-input-wrapper);
    outline: none;
    transition:
      background-color var(--cd-transition-duration-input-bg)
        var(--cd-transition-function-input-bg) var(--cd-transition-delay-input-bg),
      border var(--cd-transition-duration-input-border)
        var(--cd-transition-function-input-border) var(--cd-transition-delay-input-border);
  }
  .cd-pincode--small .cd-pincode__cell {
    inline-size: var(--cd-pincode-cell-width-small);
    block-size: var(--cd-height-input-wrapper-small);
  }
  .cd-pincode--large .cd-pincode__cell {
    inline-size: var(--cd-pincode-cell-width-large);
    block-size: var(--cd-height-input-wrapper-large);
  }
  .cd-pincode__cell:hover:not(:disabled):not(:focus) {
    background: var(--cd-color-input-default-bg-hover);
    border-color: var(--cd-color-input-default-border-hover);
  }
  .cd-pincode__cell:focus {
    background: var(--cd-color-input-default-bg-focus);
    border-color: var(--cd-color-input-default-border-focus);
  }
  /* warning / error —— 对齐 Input：浅色状态底 + 同色描边 */
  .cd-pincode__cell--warning {
    background: var(--cd-color-input-warning-bg-default);
    border-color: var(--cd-color-input-warning-border-default);
  }
  .cd-pincode__cell--warning:focus {
    background: var(--cd-color-input-warning-bg-focus);
    border-color: var(--cd-color-input-warning-border-focus);
  }
  .cd-pincode__cell--error {
    background: var(--cd-color-input-danger-bg-default);
    border-color: var(--cd-color-input-danger-border-default);
  }
  .cd-pincode__cell--error:focus {
    background: var(--cd-color-input-danger-bg-focus);
    border-color: var(--cd-color-input-danger-border-focus);
  }
  .cd-pincode--disabled .cd-pincode__cell,
  .cd-pincode__cell:disabled {
    background: var(--cd-color-input-disabled-bg-default);
    color: var(--cd-color-input-disabled-text-default);
    -webkit-text-fill-color: var(--cd-color-input-disabled-text-default);
    cursor: not-allowed;
  }
  @media (prefers-reduced-motion: reduce) {
    .cd-pincode__cell {
      transition: none;
    }
  }
</style>
