<!--
  RadioGroup — 严格对齐 Semi radioGroup.tsx。
  WAI-ARIA radiogroup pattern: roving tabindex + arrow-key navigation.
  onChange 回调收到对齐 Semi 的 RadioChangeEvent（e.target.{checked,value}）。
-->
<script lang="ts">
  import type { Snippet, ComponentProps } from 'svelte';
  import { useId } from '@chenzy-design/core';
  import Radio from './Radio.svelte';
  import {
    setRadioGroupContext,
    type RadioValue,
    type RadioType,
    type RadioChangeEvent,
    type RadioRegistration,
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
    /** 关联组的可见标题元素 id（无内置标题时用，优先于 ariaLabel 体现可访问名）。 */
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

  let rootEl = $state<HTMLDivElement | null>(null);

  const groupName = resolveName();

  function resolveName(): string {
    return name ?? useId('cd-radio');
  }

  const isControlled = $derived(value !== undefined);
  let inner = $state<RadioValue | undefined>(getInitialValue());

  function getInitialValue(): RadioValue | undefined {
    return defaultValue;
  }

  const selected = $derived(isControlled ? value : inner);

  // Insertion-ordered registry of radios (matches DOM order). PLAIN (non-reactive)
  // on purpose: radios push to it while mounting. It is read ONLY inside keyboard
  // event handlers (moveTo) — never during render — so registration never feeds
  // back into a render-read. This is what keeps the component loop-free
  // (effect_update_depth_exceeded comes from render reading state that mount writes).
  const registry: RadioRegistration[] = [];

  function select(v: RadioValue, e?: RadioChangeEvent) {
    if (disabled) return;
    // `value` 是 $bindable：受控时直接写回（Svelte 5 双向绑定核心，不像 React 会 loop）。
    // 这样 `bind:value` 无需额外 onChange 即可更新；纯受控（父只传 value 不传 bind）时，
    // 父在 onChange 里重新赋 value 覆盖即可。未传 value（非受控）时维护内部 inner。
    if (isControlled) value = v;
    else inner = v;
    onChange?.(e ?? makeEvent(v));
  }

  /** 构造对齐 Semi 的 RadioChangeEvent（键盘方向键无原生事件时用）。 */
  function makeEvent(v: RadioValue, nativeEvent?: Event): RadioChangeEvent {
    return {
      target: { checked: true, value: v, name: groupName },
      ...(nativeEvent ? { nativeEvent } : {}),
      stopPropagation: () => nativeEvent?.stopPropagation(),
      preventDefault: () => nativeEvent?.preventDefault(),
    };
  }

  function register(reg: RadioRegistration): () => void {
    registry.push(reg);
    return () => {
      const i = registry.indexOf(reg);
      if (i !== -1) registry.splice(i, 1);
    };
  }

  // Roving tabindex tab stop, computed from `selected` ALONE (no registry read
  // during render → no loop). Per WAI-ARIA APG: when a radio is selected it owns
  // the tab stop; when nothing is selected every radio is reachable by Tab
  // (tabindex=0) and Arrow keys then select one. `selected` is the only reactive
  // input, so this is render-safe.
  function isTabStop(v: RadioValue, radioDisabled: boolean): boolean {
    if (radioDisabled || disabled) return false;
    if (selected === undefined) return true; // none selected → all are tab stops
    return v === selected;
  }

  function moveTo(index: number, nativeEvent?: Event) {
    const enabled = registry.filter((r) => !r.disabled);
    if (enabled.length === 0) return;
    const target = enabled[(index + enabled.length) % enabled.length];
    if (!target) return;
    select(target.value, makeEvent(target.value, nativeEvent));
    target.el.focus();
  }

  function onKeydown(e: KeyboardEvent, current: RadioValue) {
    if (disabled) return;
    const enabled = registry.filter((r) => !r.disabled);
    const idx = enabled.findIndex((r) => r.value === current);
    if (idx === -1) return;
    // RTL：水平方向键语义翻转（左右镜像）。读 getComputedStyle 仅在事件里，render 不依赖。
    const rtl =
      rootEl != null && getComputedStyle(rootEl).direction === 'rtl';
    let key = e.key;
    if (rtl && key === 'ArrowRight') key = 'ArrowLeft';
    else if (rtl && key === 'ArrowLeft') key = 'ArrowRight';
    switch (key) {
      case 'ArrowDown':
      case 'ArrowRight':
        e.preventDefault();
        moveTo(idx + 1, e);
        break;
      case 'ArrowUp':
      case 'ArrowLeft':
        e.preventDefault();
        moveTo(idx - 1, e);
        break;
      case 'Home':
        e.preventDefault();
        moveTo(0, e);
        break;
      case 'End':
        e.preventDefault();
        moveTo(enabled.length - 1, e);
        break;
      default:
        break;
    }
  }

  setRadioGroupContext({
    name: groupName,
    getSelected: () => selected,
    getDisabled: () => disabled,
    getType: () => type,
    getButtonSize: () => (type === 'button' ? buttonSize : undefined),
    select,
    register,
    onKeydown,
    isTabStop,
  });

  const cls = $derived(
    [
      'cd-radio-group',
      `cd-radio-group--${direction}`,
      `cd-radio-group--${type}`,
      className,
    ]
      .filter(Boolean)
      .join(' '),
  );

  // 对齐 Semi：primitive option 归一化为 { label, value }（label/value 同值）。
  function normalizeOption(opt: Option): OptionObject {
    return typeof opt === 'object' ? opt : { label: String(opt), value: opt };
  }
  const normalizedOptions = $derived(options?.map(normalizeOption));

  // 归一化 option 转成传给 Radio 的 props（仅带上已定义字段，兼容 exactOptionalPropertyTypes）。
  function optionRadioProps(opt: OptionObject): ComponentProps<typeof Radio> {
    const p = { value: opt.value, disabled: opt.disabled ?? false } as Record<string, unknown>;
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
  bind:this={rootEl}
  role="radiogroup"
  aria-labelledby={ariaLabelledby}
  aria-label={ariaLabelledby ? undefined : ariaLabel}
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
  .cd-radio-group {
    display: inline-flex;
    gap: var(--cd-spacing-radio-group-horizontal-marginright);
  }
  .cd-radio-group--horizontal {
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
  }
  .cd-radio-group--vertical {
    flex-direction: column;
    align-items: flex-start;
  }
</style>
