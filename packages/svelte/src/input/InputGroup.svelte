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
  /* 组内直接子级：中间圆角归零，仅首尾保留；相邻控件用 ::after 画分隔线。 */
  .cd-input-group > :global(*) {
    border-radius: 0;
  }
  .cd-input-group > :global(*:first-child) {
    border-start-start-radius: var(--cd-radius-input-wrapper);
    border-end-start-radius: var(--cd-radius-input-wrapper);
  }
  .cd-input-group > :global(*:last-child) {
    border-start-end-radius: var(--cd-radius-input-wrapper);
    border-end-end-radius: var(--cd-radius-input-wrapper);
  }
  .cd-input-group > :global(*:not(:last-child)) {
    position: relative;
  }
  .cd-input-group > :global(*:not(:last-child))::after {
    content: '';
    position: absolute;
    inset-inline-end: -1px;
    inset-block-start: 1px;
    inset-block-end: 1px;
    inline-size: var(--cd-width-input-group-pseudo-border);
    background: var(--cd-color-input-group-border-default);
  }
  /* 聚焦控件抬升层级，使其完整边框覆盖相邻分隔线。 */
  .cd-input-group > :global(*:focus-within) {
    z-index: 1;
  }
  /* 圆角同步到 Input 的实际圆角承载层（.cd-input-wrapper）。 */
  .cd-input-group > :global(* .cd-input-wrapper) {
    border-radius: inherit;
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
    margin-inline-end: 4px;
    color: var(--cd-color-danger);
  }
</style>
