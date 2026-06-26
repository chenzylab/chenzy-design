<!--
  Form.Slider — convenience wrapper: <Form.Field> + <Slider> bound to a field.
-->
<script lang="ts">
  import type { Rule, ValidateTrigger } from '@chenzy-design/core';
  import type { ComponentProps } from 'svelte';
  import Field from './Field.svelte';
  import Slider from '../slider/Slider.svelte';

  type SliderProps = ComponentProps<typeof Slider>;

  interface Props {
    field: string;
    label?: string;
    rules?: Rule[];
    initValue?: unknown;
    required?: boolean;
    validateStatus?: 'default' | 'warning' | 'error';
    extraText?: string;
    span?: number;
    transform?: (value: unknown, values: Record<string, unknown>) => unknown;
    dependencies?: string[];
    trigger?: ValidateTrigger | ValidateTrigger[];
    // Slider-specific props
    min?: SliderProps['min'];
    max?: SliderProps['max'];
    step?: SliderProps['step'];
    range?: SliderProps['range'];
    marks?: SliderProps['marks'];
    disabled?: boolean;
    vertical?: SliderProps['vertical'];
    size?: SliderProps['size'];
    tooltipVisible?: SliderProps['tooltipVisible'];
    tipFormatter?: SliderProps['tipFormatter'];
  }

  let {
    field,
    label,
    rules = [],
    initValue,
    required = false,
    validateStatus,
    extraText,
    span,
    transform,
    dependencies,
    trigger,
    min,
    max,
    step,
    range,
    marks,
    disabled,
    vertical,
    size,
    tooltipVisible,
    tipFormatter,
  }: Props = $props();

  const fieldProps = $derived<ComponentProps<typeof Field>>({
    field,
    rules,
    required,
    ...(label !== undefined ? { label } : {}),
    ...(initValue !== undefined ? { initValue } : {}),
    ...(validateStatus !== undefined ? { validateStatus } : {}),
    ...(extraText !== undefined ? { extraText } : {}),
    ...(span !== undefined ? { span } : {}),
    ...(transform !== undefined ? { transform } : {}),
    ...(dependencies !== undefined ? { dependencies } : {}),
    ...(trigger !== undefined ? { trigger } : {}),
  });
</script>

<Field {...fieldProps}>
  {#snippet children({ value, onChange, onBlur, status, disabled: fieldDisabled })}
    <Slider
      value={value as SliderProps['value']}
      {min}
      {max}
      {step}
      {range}
      {marks}
      disabled={disabled ?? fieldDisabled}
      {vertical}
      {size}
      {tooltipVisible}
      {tipFormatter}
      status={status === 'error' ? 'error' : 'default'}
      onChange={(v) => onChange(v)}
      onBlur={() => onBlur()}
    />
  {/snippet}
</Field>
