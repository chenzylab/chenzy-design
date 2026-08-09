<!--
  PinCode — see specs/components/input/PinCode.spec.md
  分格验证码 / OTP：N 个受控单字符输入格的编排器。跨格键盘（←→/Backspace/Delete）、
  自动跳格、整串粘贴分发（遇非法字符停止）、受控/非受控、组合态过滤，全部委托
  @chenzy-design/core 的纯函数。单格严格复用本库 Input 组件渲染（对齐 Semi renderSingleInput
  直接 <Input>，而非另起原生 <input> 手写一套边框/背景/聚焦态）；pincode 层仅覆盖
  padding=0/text-align=center 与格宽/间距（对齐 Semi pincode.scss 只覆盖这两处）。
  a11y 增强（超越 Semi）：root role=group + aria-label；每格 aria-label 位次「第 N 位，共 M 位」、
  autoComplete="one-time-code"、inputMode 随 format、maxLength=1。
-->
<script lang="ts">
  import { useId, resolveDefault } from '@chenzy-design/core';
  import {
    validateChar,
    inputModeForFormat,
    toValueList,
    fromValueList,
    completeSingleInput,
    pinCodeHandleKeyDown,
    distributePaste,
    type PinCodeFormat,
  } from '@chenzy-design/core';
  import { useLocale } from '../locale-provider/index.js';
  import Input from '../input/Input.svelte';

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
    'aria-label'?: string;
    /** 外部可视 label 的 id，关联为分组名（优先于 ariaLabel）。 */
    ariaLabelledby?: string;
    /** 外部描述性文本 id（Form.Field 透传，超越 Semi）。 */
    ariaDescribedby?: string;
    /** 外部错误信息 id（Form.Field 透传，超越 Semi）。 */
    ariaErrormessage?: string;
    /** 必填语义（Form.Field required 透传，超越 Semi）。 */
    ariaRequired?: boolean;
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
    count: countProp,
    format: formatProp,
    size = 'default',
    disabled = false,
    autoFocus: autoFocusProp,
    name,
    id,
    'aria-label': ariaLabel,
    ariaLabelledby,
    ariaDescribedby,
    ariaErrormessage,
    ariaRequired,
    status = 'default',
    className,
    style,
    onChange,
    onComplete,
  }: Props = $props();
  // cdGlobal 全局默认 props（对齐 Semi semiGlobal.config.overrideDefaultProps）：
  // 优先级 = 显式传值 > cdGlobal['PinCode'] > 组件内置默认值。
  const count = $derived(resolveDefault(countProp, 'PinCode', 'count', 6));
  const format = $derived(resolveDefault(formatProp, 'PinCode', 'format', 'number'));
  const autoFocus = $derived(resolveDefault(autoFocusProp, 'PinCode', 'autoFocus', true));

  const loc = useLocale();
  const autoId = useId('cd-pincode');
  const rootId = $derived(id ?? autoId);

  const isControlled = $derived(value !== undefined);
  // 非受控内部值以整串字符串承载（受控时不写此 state，依赖外部回写）。
  // 仅捕获挂载时的 defaultValue 初值（对齐 Input/Rating 的非受控范式）。
  function getInitialValue(): string {
    return defaultValue;
  }
  let inner = $state(getInitialValue());
  const currentStr = $derived(isControlled ? (value ?? '') : inner);
  const cells = $derived(toValueList(currentStr, count));

  const inputMode = $derived(inputModeForFormat(format));
  const rtl = $derived(loc().direction === 'rtl');
  const resolvedAriaLabel = $derived(ariaLabel ?? loc().t('PinCode.ariaLabel'));

  const cls = $derived(['cd-pincode-wrapper', className].filter(Boolean).join(' '));

  // 各格 Input 组件实例（供 focus / blur / 跳格 —— 经 getInputElement() 拿原生 DOM）。
  // 用 $state 数组承载：bind:this={cellRefs[i]} 要求绑定目标是响应式属性，
  // 否则 Svelte 5 运行时告警 binding_property_non_reactive。
  let cellRefs = $state<(ReturnType<typeof Input> | undefined)[]>([]);

  function setCells(next: string[]) {
    const str = fromValueList(next);
    if (!isControlled) inner = str;
    onChange?.(str);
  }

  function focusCell(index: number): void {
    const ref = cellRefs[Math.max(0, Math.min(count - 1, index))];
    const el = ref?.getInputElement();
    if (!el) return;
    el.focus();
    // 对齐 Semi focus()：光标固定置于 (1,1)，非按当前内容长度动态计算。
    try {
      el.setSelectionRange(1, 1);
    } catch {
      // number/email 类型不支持 setSelectionRange；本组件恒为 text，忽略即可。
    }
  }

  function blurCell(index: number): void {
    cellRefs[Math.max(0, Math.min(count - 1, index))]?.getInputElement()?.blur();
  }

  // —— 实例方法（供 bind:this 暴露，对齐 Semi ref.focus(index) / ref.blur(index)）——
  export function focus(index = 0): void {
    focusCell(index);
  }
  export function blur(index = 0): void {
    blurCell(index);
  }

  // 组合态：中文候选期间不写入。逐格独立追踪。
  let composingIndex = $state<number | null>(null);

  function afterWrite(r: { list: string[]; nextIndex: number; completed: boolean }) {
    setCells(r.list);
    if (r.completed) {
      // 填满：blur 末格并触发 onComplete（对齐 Semi：仅当写入的是末格索引时触发）。
      blurCell(count - 1);
      onComplete?.(fromValueList(r.list));
    } else {
      focusCell(r.nextIndex);
    }
  }

  function handleCellChange(index: number, v: string) {
    if (composingIndex === index) return; // 组合中，等 compositionend
    // 取本次输入的最后一个字符（对齐 Semi `v[v.length - 1]`）。
    const char = v[v.length - 1] ?? '';
    if (!char || !validateChar(char, format)) {
      // 非法字符：不写入受控状态。Semi 靠 React 受控回写把 DOM 拉回原值；
      // 本库 Input 只在响应式 current 变化时才回写 DOM，这里状态未变不会触发，
      // 需显式把 DOM 值拉回既有格值，保持同等的“非法输入不留痕”效果。
      const el = cellRefs[index]?.getInputElement();
      if (el) el.value = cells[index] ?? '';
      return;
    }
    const r = completeSingleInput(cells, count, index, char);
    afterWrite(r);
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
    // 立即阻止默认粘贴行为（对齐 Semi 注释：Firefox 中需在函数开始时即 preventDefault，
    // 否则可能在 preventDefault 生效前已执行默认粘贴，导致双重写入）。
    e.preventDefault();
    const text = e.clipboardData?.getData('text') ?? '';
    const r = distributePaste(cells, count, index, text, format);
    if (r.written === 0) return;
    afterWrite(r);
  }

  function handleCompositionStart(index: number) {
    composingIndex = index;
  }

  function handleCompositionEnd(index: number, e: CompositionEvent) {
    composingIndex = null;
    // 组合结束后按 change 逻辑重新处理最后落定的字符。
    handleCellChange(index, (e.currentTarget as HTMLInputElement).value);
  }

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
    <Input
      bind:this={cellRefs[i]}
      class="cd-pincode-cell"
      autoFocus={autoFocus && i === 0}
      inputmode={inputMode}
      autocomplete="one-time-code"
      maxLength={1}
      value={cell}
      {size}
      {disabled}
      validateStatus={status}
      aria-label={cellLabel(i)}
      {...(i === 0 && ariaDescribedby !== undefined ? { ariaDescribedby } : {})}
      {...(i === 0 && ariaErrormessage !== undefined ? { ariaErrormessage } : {})}
      {...(i === 0 && ariaRequired !== undefined ? { ariaRequired } : {})}
      onKeyDown={(e) => handleKeydown(i, e)}
      onCompositionStart={() => handleCompositionStart(i)}
      onCompositionEnd={(e) => handleCompositionEnd(i, e)}
      onChange={(v) => handleCellChange(i, v)}
      onpaste={(e: ClipboardEvent) => handlePaste(i, e)}
    />
  {/each}
</div>

<style>
  /* wrapper 严格对齐 Semi pincode.scss：flex 排列，间距用 margin-inline-end（非 gap），
     最后一格 margin 归零。 */
  .cd-pincode-wrapper {
    display: flex;
  }
  /* 单格：覆盖 Input 内部 padding/text-align（对齐 Semi `.semi-input-wrapper input { padding: 0; text-align: center }`），
     格宽 / 格间距按 size 逐档取固定 token 值（对齐 Semi variables.scss 的独立常量，非派生）。 */
  :global(.cd-pincode-wrapper .cd-pincode-cell) {
    margin-inline-end: var(--cd-pincode-gap-default);
  }
  :global(.cd-pincode-wrapper .cd-pincode-cell:last-child) {
    margin-inline-end: 0;
  }
  :global(.cd-pincode-wrapper .cd-input-wrapper-small.cd-pincode-cell) {
    inline-size: var(--cd-pincode-cell-width-small);
  }
  :global(.cd-pincode-wrapper .cd-input-wrapper-default.cd-pincode-cell) {
    inline-size: var(--cd-pincode-cell-width-default);
  }
  :global(.cd-pincode-wrapper .cd-input-wrapper-large.cd-pincode-cell) {
    inline-size: var(--cd-pincode-cell-width-large);
  }
  :global(.cd-pincode-wrapper .cd-input-wrapper-small.cd-pincode-cell) {
    margin-inline-end: var(--cd-pincode-gap-small);
  }
  :global(.cd-pincode-wrapper .cd-input-wrapper-large.cd-pincode-cell) {
    margin-inline-end: var(--cd-pincode-gap-large);
  }
  :global(.cd-pincode-cell .cd-input) {
    padding: 0;
    text-align: var(--cd-pincode-cell-text-align);
  }
</style>
