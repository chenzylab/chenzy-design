<!--
  RadioGroup — 严格对齐 Semi radioGroup.tsx。

  DOM：<div class="cd-radioGroup cd-radioGroup-wrapper cd-radioGroup-{direction}[-default|-card] | cd-radioGroup-buttonRadio">
  子项为同 name 的原生 radio，方向键切换即选中由浏览器接管（无 JS roving tabindex）。
  onChange 回调收到对齐 Semi 的 RadioChangeEvent（含 advanced 模式取消时 value=undefined）。
-->
<script lang="ts">
  import type { Snippet, ComponentProps } from 'svelte';
  import { useId } from '@chenzy-design/core';
  import Radio from './Radio.svelte';
  import {
    setRadioGroupContext,
    type RadioValue,
    type RadioType,
    type RadioMode,
    type RadioChangeEvent,
  } from './context.js';

  type OptionObject = {
    label: string;
    value: RadioValue;
    disabled?: boolean;
    extra?: string;
    className?: string;
    style?: string;
    addonId?: string;
    addonStyle?: string;
    addonClassName?: string;
    extraId?: string;
  };
  // 对齐 Semi：options 支持 primitive（string/number）或对象形式。
  type Option = string | number | OptionObject;

  interface Props {
    value?: RadioValue;
    defaultValue?: RadioValue;
    name?: string;
    options?: Option[];
    disabled?: boolean;
    /** 专控 type='button' 时的尺寸（对齐 Semi）；middle 为默认。 */
    buttonSize?: 'small' | 'middle' | 'large';
    type?: RadioType;
    direction?: 'horizontal' | 'vertical';
    /** 高级模式（对齐 Semi mode='advanced'），透传给子 Radio。 */
    mode?: RadioMode;
    /** 对齐 Semi：变更回调收到 RadioChangeEvent（e.target.{checked,value}）。 */
    onChange?: (e: RadioChangeEvent) => void;
    children?: Snippet;
    /** 根元素 id（对齐 Semi id）。 */
    id?: string;
    /** 根元素附加 class（对齐 Semi className；本库惯例用 class）。 */
    class?: string;
    /** 根元素内联样式（对齐 Semi style）。 */
    style?: string;
    ariaLabel?: string;
    ariaLabelledby?: string;
    ariaDescribedby?: string;
    ariaErrormessage?: string;
    ariaInvalid?: boolean;
    ariaRequired?: boolean;
    /** 其余 data-* 等属性透传到根元素。 */
    [key: string]: unknown;
  }

  let {
    value = $bindable(),
    defaultValue,
    name,
    options,
    disabled = false,
    buttonSize = 'middle',
    type = 'default',
    direction = 'horizontal',
    mode = '',
    onChange,
    children,
    id,
    class: className,
    style,
    ariaLabel,
    ariaLabelledby,
    ariaDescribedby,
    ariaErrormessage,
    ariaInvalid,
    ariaRequired,
    ...rest
  }: Props = $props();

  // name 只取初值（同 Semi：name 不应在运行时切换分组）——初值快照。
  // svelte-ignore state_referenced_locally
  const groupName = name ?? useId('cd-radio');

  const isControlled = $derived(value !== undefined);
  // defaultValue 只取初值（对齐 Semi 非受控初始态）——初值快照。
  // svelte-ignore state_referenced_locally
  let inner = $state<RadioValue | undefined>(defaultValue);
  const selected = $derived(isControlled ? value : inner);

  const isButtonRadio = $derived(type === 'button');
  const isPureCardRadio = $derived(type === 'pureCard');
  const isCardRadio = $derived(type === 'card' || isPureCardRadio);
  const isDefaultRadio = $derived(type === 'default');

  // 对齐 Semi radioGroupFoundation.handleChange：受控只 notify，非受控回写；advanced 取消时 value=undefined。
  function handleChange(evt: RadioChangeEvent) {
    if (disabled) return;
    const { checked, value: v } = evt.target;
    const lastValue = selected;
    const cbValue: RadioChangeEvent = { ...evt, target: { ...evt.target } };

    if (mode === 'advanced' && !checked) {
      cbValue.target.value = undefined;
    }

    if (!isControlled) {
      inner = mode === 'advanced' && !checked ? undefined : (v as RadioValue);
    } else {
      // 受控：value 是 $bindable，直接回写（Svelte 双向绑定；纯受控父在 onChange 里覆盖）。
      value = mode === 'advanced' && !checked ? undefined : (v as RadioValue);
    }

    if (mode === 'advanced' || lastValue !== v) {
      onChange?.(cbValue);
    }
  }

  setRadioGroupContext({
    name: groupName,
    getSelected: () => selected,
    getDisabled: () => disabled,
    getType: () => type,
    getMode: () => mode,
    getButtonSize: () => (type === 'button' ? buttonSize : undefined),
    onChange: handleChange,
  });

  // 根 class：镜像 Semi radioGroup.tsx prefixClsDisplay。
  const cls = $derived(
    [
      className,
      'cd-radioGroup',
      'cd-radioGroup-wrapper',
      direction && !isButtonRadio && `cd-radioGroup-${direction}`,
      direction && isDefaultRadio && `cd-radioGroup-${direction}-default`,
      direction && isCardRadio && `cd-radioGroup-${direction}-card`,
      isButtonRadio && 'cd-radioGroup-buttonRadio',
    ]
      .filter(Boolean)
      .join(' '),
  );

  // 对齐 Semi：primitive option 归一化为 { label, value }（label/value 同值）。
  function normalizeOption(opt: Option): OptionObject {
    return typeof opt === 'object' ? opt : { label: String(opt), value: opt };
  }
  const normalizedOptions = $derived(options?.map(normalizeOption));

  function optionRadioProps(opt: OptionObject): ComponentProps<typeof Radio> {
    const p = { value: opt.value, disabled: opt.disabled ?? disabled } as Record<string, unknown>;
    if (opt.extra !== undefined) p.extra = opt.extra;
    if (opt.className !== undefined) p.class = opt.className;
    if (opt.style !== undefined) p.style = opt.style;
    if (opt.addonId !== undefined) p.addonId = opt.addonId;
    if (opt.addonStyle !== undefined) p.addonStyle = opt.addonStyle;
    if (opt.addonClassName !== undefined) p.addonClassName = opt.addonClassName;
    if (opt.extraId !== undefined) p.extraId = opt.extraId;
    return p as unknown as ComponentProps<typeof Radio>;
  }
</script>

<div
  {...rest}
  class={cls}
  {id}
  {style}
  role="radiogroup"
  aria-label={ariaLabelledby ? undefined : ariaLabel}
  aria-labelledby={ariaLabelledby}
  aria-describedby={ariaDescribedby}
  aria-errormessage={ariaErrormessage}
  aria-invalid={ariaInvalid}
  aria-required={ariaRequired}
>
  {#if normalizedOptions}
    {#each normalizedOptions as opt (opt.value)}
      <Radio {...optionRadioProps(opt)}>{opt.label}</Radio>
    {/each}
  {:else}
    {@render children?.()}
  {/if}
</div>

<style>
  /* 对齐 Semi .semi-radioGroup */
  .cd-radioGroup {
    font-size: var(--cd-font-size-regular);
  }

  /* 垂直排列（default / card 各自让子 radio display:flex 撑满） */
  .cd-radioGroup-vertical {
    display: flex;
    flex-direction: column;
    row-gap: var(--cd-spacing-radio-group-vertical-marginbottom);
  }
  .cd-radioGroup-vertical-default :global(.cd-radio),
  .cd-radioGroup-vertical-card :global(.cd-radio) {
    display: flex;
  }
  /* 垂直卡片组：底部外距用卡片专用值 */
  .cd-radioGroup-vertical-card {
    row-gap: var(--cd-spacing-radio-card-group-vertical-marginbottom);
  }

  /* 水平排列 */
  .cd-radioGroup-horizontal {
    display: inline-flex;
    flex-wrap: wrap;
    vertical-align: bottom;
    gap: var(--cd-spacing-radio-group-horizontal-marginright);
  }

  /* button 型：灰底容器包裹（对齐 Semi .semi-radioGroup-buttonRadio） */
  .cd-radioGroup-buttonRadio {
    display: inline-block;
    background: var(--cd-color-radio-buttonradio-bg-default);
    border-radius: var(--cd-radius-radio-buttonradio);
    vertical-align: middle;
  }
</style>
