<!--
  InputGroup — see specs/components/input/InputGroup.spec.md
  把多个输入类控件（Input/Select/DatePicker 等）无缝拼接为一组：
  相邻边框合并、首尾圆角、统一 size/disabled（经 context 回退透传，控件显式 prop 优先）。
  对标 Semi InputGroup（size / label / labelPosition / onFocus / onBlur / disabled）。
-->
<script lang="ts">
  import { setContext, type Snippet } from 'svelte';
  import { useId } from '@chenzy-design/core';
  import {
    INPUT_GROUP_CTX,
    type InputGroupContext,
    type InputSize,
  } from './context.js';

  type LabelPosition = 'top' | 'left';

  export interface Props {
    /** 整组尺寸，经 context 回退透传给组内输入控件（控件显式 size 优先）。 */
    size?: InputSize;
    /** 整组禁用，经 context 回退透传（控件显式 disabled 优先）。 */
    disabled?: boolean;
    /** 整组标签文本（关联 aria-labelledby）。 */
    label?: string;
    /** 标签位置。 */
    labelPosition?: LabelPosition;
    /** 组级聚焦事件（子控件获得焦点冒泡）。 */
    onFocus?: (e: FocusEvent) => void;
    /** 组级失焦事件（子控件失去焦点冒泡）。 */
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

  const labelId = useId('cd-inputgroup-label');
  const hasLabel = $derived(label !== undefined && label !== '');

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

<div
  class={[
    'cd-inputgroup',
    hasLabel && `cd-inputgroup--label-${labelPosition}`,
    className,
  ]
    .filter(Boolean)
    .join(' ')}
  {style}
>
  {#if hasLabel}
    <span class="cd-inputgroup__label" id={labelId}>{label}</span>
  {/if}
  <!--
    role=group + aria-labelledby 关联组标签；onfocus/onblur 用冒泡阶段
    捕获子控件的焦点进出（FocusEvent 在 focusin/focusout 冒泡）。
  -->
  <div
    class="cd-inputgroup__controls"
    role="group"
    aria-labelledby={hasLabel ? labelId : undefined}
    onfocusin={onFocus}
    onfocusout={onBlur}
  >
    {@render children?.()}
  </div>
</div>

<style>
  .cd-inputgroup {
    display: inline-flex;
    flex-direction: column;
    gap: var(--cd-inputgroup-label-gap);
  }
  .cd-inputgroup--label-left {
    flex-direction: row;
    align-items: center;
  }
  .cd-inputgroup__label {
    color: var(--cd-color-text-1);
    font-size: var(--cd-font-size-regular);
  }
  .cd-inputgroup__controls {
    display: inline-flex;
    align-items: stretch;
  }
  /* 相邻控件拼接：中间圆角归零，只保留两端；相邻边框叠合避免双线。 */
  .cd-inputgroup__controls :global(> *) {
    border-radius: 0;
    position: relative;
  }
  .cd-inputgroup__controls :global(> *:first-child) {
    border-start-start-radius: var(--cd-inputgroup-radius);
    border-end-start-radius: var(--cd-inputgroup-radius);
  }
  .cd-inputgroup__controls :global(> *:last-child) {
    border-start-end-radius: var(--cd-inputgroup-radius);
    border-end-end-radius: var(--cd-inputgroup-radius);
  }
  .cd-inputgroup__controls :global(> * + *) {
    margin-inline-start: -1px;
  }
  /* 拼接内圆角同步到 Input 的实际圆角承载元素（.cd-input 包裹层）。 */
  .cd-inputgroup__controls :global(> * .cd-input) {
    border-radius: inherit;
  }
  /* 聚焦控件抬升层级，使其完整边框覆盖相邻叠合边。 */
  .cd-inputgroup__controls :global(> *:focus-within) {
    z-index: 1;
  }
</style>
