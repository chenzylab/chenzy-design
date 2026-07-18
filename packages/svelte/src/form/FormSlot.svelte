<!--
  Form.Slot — see specs/components/input/Form.spec.md
  布局占位容器：与普通 Field 相同的布局，但不接管 value/onChange，纯布局占位。
  对齐 Semi slot.tsx：.cd-form-field.cd-slot + .cd-slot-main，可直接渲染 error。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { getFormContext, type FormLabelPosition, type FormLabelAlign } from './context.js';
  import FormLabel from './FormLabel.svelte';
  import FormErrorMessage from './FormErrorMessage.svelte';

  interface Props {
    /** 标签文本。 */
    label?: string;
    /** 标签位置覆盖（不传则继承 Form 配置）。 */
    labelPosition?: FormLabelPosition;
    /** 标签对齐覆盖（不传则继承 Form 配置）。 */
    labelAlign?: FormLabelAlign;
    /** 隐藏标签区域（仍保留布局对齐占位）。 */
    noLabel?: boolean;
    /** 直接渲染错误信息（字符串、字符串数组或 Snippet）。 */
    error?: string | string[] | Snippet;
    className?: string;
    /** 透传到容器的内联样式。 */
    style?: string;
    children?: Snippet;
  }

  let {
    label,
    labelPosition,
    labelAlign,
    noLabel = false,
    error,
    className,
    style,
    children,
  }: Props = $props();

  const ctx = getFormContext();

  const resolvedLabelPosition = $derived(labelPosition ?? ctx?.getLabelPosition() ?? 'top');
  const resolvedLabelAlign = $derived(labelAlign ?? ctx?.getLabelAlign() ?? 'left');
  const resolvedLabelWidth = $derived(ctx?.getLabelWidth());

  const cls = $derived(
    [
      'cd-form-field',
      'cd-slot',
      `cd-form-field--label-${resolvedLabelPosition}`,
      className,
    ]
      .filter(Boolean)
      .join(' '),
  );
</script>

<div class={cls} {style}>
  {#if !noLabel}
    <FormLabel text={label} align={resolvedLabelAlign} width={resolvedLabelWidth} />
  {/if}
  <div class="cd-form-field__control cd-slot-main">
    {@render children?.()}
    {#if error !== undefined}
      <FormErrorMessage {error} />
    {/if}
  </div>
</div>
