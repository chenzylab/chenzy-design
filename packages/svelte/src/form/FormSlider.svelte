<!--
  Form.Slider — convenience wrapper: <Form.Field> + <Slider> bound to a field.
  field-level props 经 FieldPassthroughProps 透传给 Field；控件专属给 Slider。
-->
<script lang="ts">
  import type { ComponentProps } from 'svelte';
  import Field from './Field.svelte';
  import Slider from '../slider/Slider.svelte';
  import { splitFieldProps, type FieldPassthroughProps } from './field-props.js';

  type SliderProps = ComponentProps<typeof Slider>;

  interface Props extends FieldPassthroughProps {
    min?: SliderProps['min'];
    max?: SliderProps['max'];
    step?: SliderProps['step'];
    range?: SliderProps['range'];
    marks?: SliderProps['marks'];
    disabled?: boolean;
    vertical?: SliderProps['vertical'];
    tooltipVisible?: SliderProps['tooltipVisible'];
    tipFormatter?: SliderProps['tipFormatter'];
  }

  const props: Props = $props();
  const controlKeys = [
    'min',
    'max',
    'step',
    'range',
    'marks',
    'disabled',
    'vertical',
    'tooltipVisible',
    'tipFormatter',
  ] as const;
  const split = $derived(splitFieldProps(props));
  const fieldProps = $derived(split.fieldProps);
  const control = $derived(
    Object.fromEntries(controlKeys.filter((k) => props[k] !== undefined).map((k) => [k, props[k]])),
  );
  const labelForAria = $derived(typeof props.label === 'string' ? props.label : props.label?.text);
</script>

<Field {...fieldProps}>
  {#snippet children({ value, onChange, disabled: fieldDisabled, describedBy, labelledById })}
    <Slider
      {...(value !== undefined ? { value: value as NonNullable<SliderProps['value']> } : {})}
      {...(control.min !== undefined ? { min: control.min as NonNullable<SliderProps['min']> } : {})}
      {...(control.max !== undefined ? { max: control.max as NonNullable<SliderProps['max']> } : {})}
      {...(control.step !== undefined ? { step: control.step as NonNullable<SliderProps['step']> } : {})}
      {...(control.range !== undefined ? { range: control.range as NonNullable<SliderProps['range']> } : {})}
      {...(control.marks !== undefined ? { marks: control.marks as NonNullable<SliderProps['marks']> } : {})}
      disabled={(control.disabled as boolean | undefined) ?? fieldDisabled}
      {...(control.vertical !== undefined ? { vertical: control.vertical as NonNullable<SliderProps['vertical']> } : {})}
      {...(control.tooltipVisible !== undefined ? { tooltipVisible: control.tooltipVisible as NonNullable<SliderProps['tooltipVisible']> } : {})}
      {...(control.tipFormatter !== undefined ? { tipFormatter: control.tipFormatter as NonNullable<SliderProps['tipFormatter']> } : {})}
      {...(labelledById !== undefined ? { ariaLabelledby: labelledById } : labelForAria !== undefined ? { ariaLabel: labelForAria } : {})}
      {...(describedBy !== undefined ? { ariaDescribedby: describedBy } : {})}
      onChange={(v) => onChange(v)}
    />
  {/snippet}
</Field>
