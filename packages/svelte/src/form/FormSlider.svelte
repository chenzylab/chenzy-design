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
  const split = $derived(splitFieldProps(props));
  const fieldProps = $derived(split.fieldProps);
  const rest = $derived(split.rest as Record<string, unknown>);
  const labelForAria = $derived(typeof props.label === 'string' ? props.label : props.label?.text);
</script>

<Field {...fieldProps}>
  {#snippet children({ value, onChange, disabled: fieldDisabled, describedBy, labelledById })}
    <Slider
      {...rest}
      {...(value !== undefined ? { value: value as NonNullable<SliderProps['value']> } : {})}
      disabled={(rest.disabled as boolean | undefined) ?? fieldDisabled}
      {...(labelledById !== undefined ? { ariaLabelledby: labelledById } : labelForAria !== undefined ? { 'aria-label': labelForAria } : {})}
      {...(describedBy !== undefined ? { ariaDescribedby: describedBy } : {})}
      onChange={(v) => onChange(v)}
    />
  {/snippet}
</Field>
