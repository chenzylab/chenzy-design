<!--
  Form.Slot — see specs/components/input/Form.spec.md
  布局占位容器：与普通 Field 相同的布局，但不接管 value/onChange，纯布局占位。
  对齐 Semi slot.tsx：<div class="cd-form-field cd-form-slot" x-label-pos><Label/>
  <div class="cd-form-field-main cd-form-slot-main">{children}{error}</div></div>。
  Form 上的 labelWidth/labelAlign 自动作用于 Slot；label 支持对象形态（{text,align,width}）。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { getFormContext, type FormLabelPosition, type FormLabelAlign } from './context.js';
  import FormLabel from './FormLabel.svelte';
  import FormErrorMessage from './FormErrorMessage.svelte';

  /** Slot label 对象形态（对齐 Semi LabelProps 子集）。 */
  interface SlotLabelProps {
    text?: string;
    align?: FormLabelAlign;
    width?: number | string;
    required?: boolean;
    optional?: boolean;
    extra?: string;
  }

  interface Props {
    /** 标签：字符串或对象形态（对齐 Semi label: LabelProps）。 */
    label?: string | SlotLabelProps;
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

  // label 归一化（字符串 / 对象）。
  const labelObj = $derived(
    typeof label === 'object' && label !== null ? label : undefined,
  );
  const labelText = $derived(typeof label === 'string' ? label : labelObj?.text);
  const hasLabel = $derived(!noLabel && labelText !== undefined);

  const resolvedLabelPosition = $derived(labelPosition ?? ctx?.getLabelPosition() ?? 'top');
  // 对齐优先级：label 对象 → prop → Form context（对齐 Semi mergeLabelProps）。
  const resolvedLabelAlign = $derived(
    labelObj?.align ?? labelAlign ?? ctx?.getLabelAlign() ?? 'left',
  );
  const resolvedLabelWidth = $derived(labelObj?.width ?? ctx?.getLabelWidth());

  const cls = $derived(
    ['cd-form-field', 'cd-form-slot', className].filter(Boolean).join(' '),
  );
  // x-label-pos 镜像 Semi 供样式定位；经 attrs 对象展开，让 svelte-check 接受非标准属性名。
  const domAttrs = $derived({ 'x-label-pos': resolvedLabelPosition });
</script>

<div class={cls} {...domAttrs} {style}>
  {#if hasLabel}
    <FormLabel
      text={labelText}
      align={resolvedLabelAlign}
      {...resolvedLabelWidth !== undefined ? { width: resolvedLabelWidth } : {}}
      required={labelObj?.required ?? false}
      optional={labelObj?.optional ?? false}
      {...labelObj?.extra !== undefined ? { extra: labelObj.extra } : {}}
    />
  {/if}
  <div class="cd-form-field-main cd-form-slot-main">
    {@render children?.()}
    {#if error !== undefined}
      <FormErrorMessage {error} />
    {/if}
  </div>
</div>
