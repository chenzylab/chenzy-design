<!--
  TimeInput — 默认时间触发器视图，对齐 Semi timePicker/TimeInput.tsx（消费 inputFoundation）。
  职责边界严格对齐 Semi：只管默认触发器 DOM（Input + IconClock）+ 输入事件转发（focus/blur/change）
  + 光标恢复；不含时间串解析/值模型（那在 TimePicker 层）。triggerRender 自定义触发器需父层数据
  （value 为 Date 等），留在 TimePicker 层，不进本组件。
  value 为展示串（父组件算好的 displayText 或 inputDraft），本组件受控回填后恢复光标位置
  （storeCursor/restoreCursor，镜像 Semi 避免键入时光标弹到末尾）。
-->
<script lang="ts">
  import { IconClock } from '@chenzy-design/icons';
  import Input from '../input/Input.svelte';
  import { createTimeInputFoundation } from './time-input-foundation.js';

  type Size = 'small' | 'default' | 'large';
  type ValidateStatus = 'default' | 'warning' | 'error';

  interface Props {
    /** 展示串（父组件算好的 displayText 或键入草稿）。 */
    value: string;
    placeholder: string;
    size?: Size;
    disabled?: boolean;
    borderless?: boolean;
    validateStatus?: ValidateStatus;
    /** 校验失败态（对齐 Semi invalid）：true → Input 强制 error。 */
    invalid?: boolean;
    showClear?: boolean;
    /** 仅面板选择、不可键入（对齐 Semi inputReadOnly）。 */
    readonly?: boolean;
    /** 面板 id（aria-controls）。 */
    ariaControls?: string;
    /** 面板是否展开（aria-expanded）。 */
    expanded?: boolean;
    /** 只在定义时透传给 Input 的可选属性（inputStyle/insetLabel/id/aria* 等，父组件按 exactOptionalPropertyTypes 组装）。 */
    inputOptionalProps?: Record<string, unknown>;
    // 回调显式带 | undefined：父组件（TimePicker）传入的可选回调可能是 undefined，
    // exactOptionalPropertyTypes:true 下必须让目标属性类型接受 undefined（对齐 memory exactOptional 修法）。
    /** 输入串变化（键入）。对齐 Semi TimeInput onChange。 */
    onChange?: ((v: string) => void) | undefined;
    /** 触发器聚焦。对齐 Semi onFocus。 */
    onFocus?: ((e: FocusEvent) => void) | undefined;
    /** 触发器失焦。对齐 Semi onBlur。 */
    onBlur?: ((e: FocusEvent) => void) | undefined;
    /** 键盘（Enter/ArrowDown/Escape 由父组件处理开关面板与提交）。 */
    onKeydown?: ((e: KeyboardEvent) => void) | undefined;
    /** 清除。 */
    onClear?: (() => void) | undefined;
    /** 点击触发器容器（切换面板开合）。对齐 Semi handleClick。 */
    onClick?: (() => void) | undefined;
  }

  let {
    value,
    placeholder,
    size = 'default',
    disabled = false,
    borderless = false,
    validateStatus = 'default',
    invalid = false,
    showClear = true,
    readonly = false,
    ariaControls,
    expanded = false,
    inputOptionalProps = {},
    onChange,
    onFocus,
    onBlur,
    onKeydown,
    onClear,
    onClick,
  }: Props = $props();

  let inputComp = $state<{
    focus: () => void;
    blur: () => void;
    getInputElement: () => HTMLInputElement | null;
  } | null>(null);

  const foundation = createTimeInputFoundation({
    getInputNode: () => inputComp?.getInputElement() ?? null,
    notifyChange: (v) => onChange?.(v),
    notifyFocus: (e) => onFocus?.(e),
    notifyBlur: (e) => onBlur?.(e),
  });

  // 受控回填后恢复光标（对齐 Semi componentDidUpdate: value 变 → restoreCursor）。
  $effect(() => {
    // 读 value 建立依赖：父组件受控更新展示串后，把光标还原到键入前位置。
    void value;
    foundation.restoreCursor();
  });

  /** 命令式聚焦触发器（父组件 autoFocus/focusOnOpen/focus() 复用）。 */
  export function focus(): void {
    inputComp?.focus();
  }
  /** 命令式移除焦点。 */
  export function blur(): void {
    inputComp?.blur();
  }
</script>

<!-- 默认触发器：复用 Input（镜像 Semi TimeInput：<Input hideSuffix suffix={IconClock}>）：可键入时间串 -->
<div class="cd-time-picker__control" onclick={onClick} role="presentation">
  <Input
    bind:this={inputComp}
    class="cd-time-picker__input"
    {value}
    {placeholder}
    {size}
    {disabled}
    {borderless}
    validateStatus={invalid ? 'error' : validateStatus}
    {showClear}
    {readonly}
    hideSuffix
    role="combobox"
    aria-haspopup="dialog"
    aria-expanded={expanded}
    aria-controls={ariaControls}
    {...inputOptionalProps}
    onChange={(v) => foundation.handleChange(v)}
    onClear={() => onClear?.()}
    onFocus={(e) => foundation.handleFocus(e)}
    onBlur={(e) => foundation.handleBlur(e)}
    onKeyDown={(e) => onKeydown?.(e)}
  >
    {#snippet suffix()}
      <span class="cd-time-picker__icon" aria-hidden="true"><IconClock /></span>
    {/snippet}
  </Input>
</div>

<style>
  .cd-time-picker__control {
    position: relative;
    inline-size: 100%;
  }
  /* 触发器输入框圆角对齐 Semi $radius-timePicker_input。
     以 TimeInput 根 .cd-time-picker__control 为锚点（本组件内无 .cd-time-picker 祖先，那是 TimePicker 根），
     .cd-time-picker__input 是传给本库 Input 的 class（子组件内部元素），按本库惯例用 :global 打洞。 */
  .cd-time-picker__control :global(.cd-time-picker__input) {
    border-radius: var(--cd-radius-time-picker-input);
  }
  .cd-time-picker__icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: var(--cd-color-text-2);
  }
</style>
