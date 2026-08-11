<!--
  InputGroup — 严格对齐 Semi Design（semi-ui/input/inputGroup.tsx）。
  把多个输入类控件（Input/Select/DatePicker 等）无缝拼接为一组：相邻控件圆角合并、
  中间分隔线用 ::after 伪边框（对齐 Semi semi-input-group）。统一 size/disabled 经 context
  回退透传给组内控件（控件显式 prop 优先）。DOM 为单层 <span role="group" class="cd-input-group">。
-->
<script lang="ts">
  import { setContext, type Snippet } from 'svelte';
  import { useId } from '@chenzy-design/core';
  import { INPUT_GROUP_CTX, type InputGroupContext, type InputSize } from './context.js';

  type LabelPosition = 'top' | 'left';

  /** 组标签（对齐 Semi LabelProps 子集）。 */
  interface LabelProps {
    text?: string;
    /** 关联控件的 id（输出到 label for / group id）。 */
    name?: string;
    required?: boolean;
    width?: number | string;
  }

  export interface Props {
    /** 整组尺寸，经 context 回退透传给组内控件（控件显式 size 优先）。 */
    size?: InputSize;
    /** 整组禁用，经 context 回退透传（控件显式 disabled 优先）。 */
    disabled?: boolean;
    /** 整组标签（对齐 Semi label: LabelProps）。 */
    label?: LabelProps;
    /** 标签位置。 */
    labelPosition?: LabelPosition;
    /** 组级聚焦事件（子控件 focusin 冒泡）。 */
    onFocus?: (e: FocusEvent) => void;
    /** 组级失焦事件（子控件 focusout 冒泡）。 */
    onBlur?: (e: FocusEvent) => void;
    /** 根节点自定义类名。 */
    class?: string;
    /** 根节点自定义内联样式。 */
    style?: string;
    /** 子输入控件（Input / Select / DatePicker 等）。 */
    children?: Snippet;
  }

  let {
    size,
    disabled,
    label,
    labelPosition = 'top',
    onFocus,
    onBlur,
    class: className,
    style,
    children,
  }: Props = $props();

  const autoId = useId('cd-input-group-label');
  const hasLabel = $derived(label != null && label.text != null && label.text !== '');
  const labelId = $derived(label?.name ?? autoId);

  // 组级默认经 getter 暴露 live 值，组内控件读到最新值（context 本身不可重赋值）。
  const ctx: InputGroupContext = {
    get size() {
      return size;
    },
    get disabled() {
      return disabled;
    },
  };
  setContext(INPUT_GROUP_CTX, ctx);
</script>

{#if hasLabel}
  <div
    class={[
      'cd-input-group-wrapper',
      `cd-input-group-wrapper-with-${labelPosition}-label`,
      className,
    ]
      .filter(Boolean)
      .join(' ')}
    {style}
  >
    <label
      class="cd-input-group-label"
      class:cd-input-group-label-required={label?.required}
      for={labelId}
      style={label?.width != null
        ? `width:${typeof label.width === 'number' ? `${label.width}px` : label.width}`
        : undefined}
    >
      {label?.text}
    </label>
    <span
      role="group"
      id={labelId}
      class={['cd-input-group', size && size !== 'default' && `cd-input-${size}`]
        .filter(Boolean)
        .join(' ')}
      aria-disabled={disabled || undefined}
      onfocusin={onFocus}
      onfocusout={onBlur}
    >
      {@render children?.()}
    </span>
  </div>
{:else}
  <span
    role="group"
    aria-label="Input group"
    aria-disabled={disabled || undefined}
    class={[
      'cd-input-group',
      size && size !== 'default' && `cd-input-${size}`,
      className,
    ]
      .filter(Boolean)
      .join(' ')}
    {style}
    onfocusin={onFocus}
    onfocusout={onBlur}
  >
    {@render children?.()}
  </span>
{/if}

<style>
  /* 组容器 —— 对齐 Semi semi-input-group：相邻控件圆角合并 + ::after 分隔线。 */
  .cd-input-group {
    display: inline-flex;
    align-items: center;
    align-content: center;
    flex-wrap: wrap;
  }
  /* 组内子组件：中间圆角归零，仅首尾保留；相邻控件用 ::after 画分隔线。严格对齐 Semi
     input.scss &-group 两组具名选择器（非通配符）：
     - 第一组 `.semi-select, .semi-tagInput, .semi-cascader, .semi-tree-select, & > .semi-input-wrapper`
       ——前四个是**后代选择器**（不限层级，Semi Select 用 Popover 包裹、真正的 .semi-select
       是原位渲染不额外包 div，故后代=直接子级；本库 Select/TreeSelect 多包了一层
       .cd-select/.cd-tree-select 根 div、真正圆角在子级 .cd-select-trigger，用后代选择器
       同样能命中，不受这层结构差异影响），只有 `.semi-input-wrapper` 前缀 `& >`（直接子级）。
     - 第二组 `.semi-input-number, .semi-datepicker, .semi-timepicker, .semi-autocomplete`
       （直接子级）圆角画在孙级 `.semi-input-wrapper`/`.semi-datepicker-range-input`，
       但 ::after/position:relative 画在**自己身上**（直接子级），不下钻。 */
  :global(.cd-input-group .cd-select-trigger),
  :global(.cd-input-group .cd-tag-input),
  :global(.cd-input-group .cd-cascader),
  :global(.cd-input-group .cd-tree-select-trigger),
  :global(.cd-input-group > .cd-input-wrapper) {
    border-radius: 0;
  }
  :global(.cd-input-group > :first-child .cd-select-trigger),
  :global(.cd-input-group > :first-child.cd-tag-input),
  :global(.cd-input-group > :first-child.cd-cascader),
  :global(.cd-input-group > :first-child .cd-tree-select-trigger),
  :global(.cd-input-group > .cd-input-wrapper:first-child) {
    border-radius: var(--cd-radius-input-wrapper) 0 0 var(--cd-radius-input-wrapper);
  }
  :global(.cd-input-group > :last-child .cd-select-trigger),
  :global(.cd-input-group > :last-child.cd-tag-input),
  :global(.cd-input-group > :last-child.cd-cascader),
  :global(.cd-input-group > :last-child .cd-tree-select-trigger),
  :global(.cd-input-group > .cd-input-wrapper:last-child) {
    border-radius: 0 var(--cd-radius-input-wrapper) var(--cd-radius-input-wrapper) 0;
  }
  /* 第一组 direct-child 分隔线（Select/TagInput/Cascader/TreeSelect/直接子级 Input）。 */
  :global(.cd-input-group > :is(.cd-select, .cd-tag-input, .cd-cascader, .cd-tree-select, .cd-input-wrapper):not(:last-child)) {
    position: relative;
  }
  :global(.cd-input-group > :is(.cd-select, .cd-tag-input, .cd-cascader, .cd-tree-select, .cd-input-wrapper):not(:last-child))::after {
    content: '';
    position: absolute;
    right: -1px;
    top: 1px;
    bottom: 1px;
    width: var(--cd-width-input-group-pseudo-border);
    background: var(--cd-color-input-group-border-default);
  }

  /* 第二组：InputNumber/DatePicker/TimePicker/AutoComplete——圆角在孙级 .cd-input-wrapper /
     .cd-datepicker-range-input，::after/position:relative 画在自己（直接子级）身上。 */
  :global(.cd-input-group > .cd-input-number .cd-input-wrapper),
  :global(.cd-input-group > .cd-datepicker .cd-input-wrapper),
  :global(.cd-input-group > .cd-datepicker .cd-datepicker-range-input),
  :global(.cd-input-group > .cd-time-picker .cd-input-wrapper),
  :global(.cd-input-group > .cd-autocomplete .cd-input-wrapper) {
    border-radius: 0;
  }
  :global(.cd-input-group > :first-child.cd-input-number .cd-input-wrapper),
  :global(.cd-input-group > :first-child.cd-datepicker .cd-input-wrapper),
  :global(.cd-input-group > :first-child.cd-datepicker .cd-datepicker-range-input),
  :global(.cd-input-group > :first-child.cd-time-picker .cd-input-wrapper),
  :global(.cd-input-group > :first-child.cd-autocomplete .cd-input-wrapper) {
    border-radius: var(--cd-radius-input-wrapper) 0 0 var(--cd-radius-input-wrapper);
  }
  :global(.cd-input-group > :last-child.cd-input-number .cd-input-wrapper),
  :global(.cd-input-group > :last-child.cd-datepicker .cd-input-wrapper),
  :global(.cd-input-group > :last-child.cd-datepicker .cd-datepicker-range-input),
  :global(.cd-input-group > :last-child.cd-time-picker .cd-input-wrapper),
  :global(.cd-input-group > :last-child.cd-autocomplete .cd-input-wrapper) {
    border-radius: 0 var(--cd-radius-input-wrapper) var(--cd-radius-input-wrapper) 0;
  }
  :global(.cd-input-group
      > :is(.cd-input-number, .cd-datepicker, .cd-time-picker, .cd-autocomplete):not(:last-child)) {
    position: relative;
  }
  :global(.cd-input-group
      > :is(.cd-input-number, .cd-datepicker, .cd-time-picker, .cd-autocomplete):not(:last-child))::after {
    content: '';
    position: absolute;
    right: -1px;
    top: 1px;
    bottom: 1px;
    width: var(--cd-width-input-group-pseudo-border);
    background: var(--cd-color-input-group-border-default);
  }

  /* 聚焦控件抬升层级，使其完整边框覆盖相邻分隔线（对齐 Semi，通用于全部子组件）。 */
  .cd-input-group > :global(*:focus-within) {
    z-index: 1;
  }

  /* 带标签容器 —— 对齐 Semi input-group-wrapper。 */
  .cd-input-group-wrapper-with-top-label {
    display: inline-flex;
    flex-direction: column;
    gap: var(--cd-spacing-base-tight);
  }
  .cd-input-group-wrapper-with-left-label {
    display: inline-flex;
    flex-direction: row;
    align-items: center;
    gap: var(--cd-spacing-base-tight);
  }
  .cd-input-group-label {
    color: var(--cd-color-text-1);
    font-size: var(--cd-font-size-regular);
  }
  .cd-input-group-label-required::before {
    content: '*';
    margin-right: 4px;
    color: var(--cd-color-danger);
  }

  /* —— RTL（对齐 Semi input/rtl.scss &-group）—— 分隔线定位左右互换。 */
  :global(.cd-rtl) .cd-input-group > :global(*:not(:last-child))::after {
    right: auto;
    left: -1px;
  }
</style>
