<!--
  CheckboxGroup — 严格对齐 Semi（checkboxGroup.tsx）。
  Provides context to child Checkboxes; controlled / uncontrolled set of values.
  DOM class 镜像 Semi：cd-checkboxGroup cd-checkboxGroup-wrapper cd-checkboxGroup-{direction}，role=list/listitem。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import Checkbox from './Checkbox.svelte';
  import {
    setCheckboxGroupContext,
    type CheckboxValue,
    type CheckboxType,
  } from './context.js';

  type OptionObject = { label: string; value: CheckboxValue; disabled?: boolean; extra?: string };
  type Option = string | number | OptionObject;

  interface Props {
    value?: CheckboxValue[];
    defaultValue?: CheckboxValue[];
    options?: Option[];
    disabled?: boolean;
    type?: CheckboxType;
    name?: string;
    direction?: 'horizontal' | 'vertical';
    onChange?: (v: CheckboxValue[]) => void;
    children?: Snippet;
    id?: string;
    /** 无可见标题时的可访问名称（role=list）。 */
    ariaLabel?: string;
    /** 关联组的可见标题元素 id（优先于 ariaLabel 体现可访问名）。 */
    ariaLabelledby?: string;
    /** 根容器内联样式（对齐 Semi style，可设 width 等）。 */
    style?: string;
    /** 根容器自定义类名（与内置 cd-checkboxGroup 并存，对齐 Semi className）。 */
    class?: string;
  }

  let {
    value = $bindable(),
    defaultValue = [],
    options,
    disabled = false,
    type = 'default',
    name,
    direction = 'vertical',
    onChange,
    children,
    id,
    ariaLabel,
    ariaLabelledby,
    style,
    class: className,
  }: Props = $props();

  const isControlled = $derived(value !== undefined);
  let inner = $state<CheckboxValue[]>(getInitialValue());

  function getInitialValue(): CheckboxValue[] {
    return [...defaultValue];
  }

  const selected = $derived(isControlled ? (value ?? []) : inner);

  function commit(next: CheckboxValue[]) {
    // Controlled (`value=` / `bind:value`): parent owns `value`; propagate only
    // via `onChange`. Writing the prop AND firing `onChange` loops.
    // Uncontrolled: keep our own state in sync.
    if (!isControlled) inner = next;
    onChange?.(next);
  }

  function normalize(opt: Option): OptionObject {
    return typeof opt === 'object' ? opt : { label: String(opt), value: opt };
  }

  const isCardType = $derived(type === 'card' || type === 'pureCard');
  const isPureCardType = $derived(type === 'pureCard');

  setCheckboxGroupContext({
    isChecked: (v) => selected.includes(v),
    toggle: (v) => {
      const next = selected.includes(v)
        ? selected.filter((item) => item !== v)
        : [...selected, v];
      commit(next);
    },
    getDisabled: () => disabled,
    getName: () => name,
    getType: () => type,
  });

  const cls = $derived(
    [
      'cd-checkboxGroup',
      'cd-checkboxGroup-wrapper',
      `cd-checkboxGroup-${direction}`,
      isCardType && `cd-checkboxGroup-${direction}-cardType`,
      isPureCardType && `cd-checkboxGroup-${direction}-pureCardType`,
      className,
    ]
      .filter(Boolean)
      .join(' '),
  );
</script>

<div
  class={cls}
  {style}
  {id}
  role="list"
  aria-labelledby={ariaLabelledby}
  aria-label={ariaLabelledby ? undefined : ariaLabel}
>
  {#if options}
    {#each options as opt (normalize(opt).value)}
      {@const o = normalize(opt)}
      <Checkbox
        role="listitem"
        value={o.value}
        disabled={o.disabled ?? false}
        {...(o.extra !== undefined ? { extra: o.extra } : {})}>{o.label}</Checkbox
      >
    {/each}
  {:else}
    {@render children?.()}
  {/if}
</div>

<style>
  .cd-checkboxGroup {
    line-height: var(--cd-font-size-small);
  }
  .cd-checkboxGroup-horizontal {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    /* 对齐 Semi 水平组间距 spacing-base */
    gap: var(--cd-spacing-checkbox-group-horizontal-marginright);
  }
  .cd-checkboxGroup-vertical {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    /* 对齐 Semi 垂直组项间距 spacing-base-tight */
    row-gap: var(--cd-spacing-checkbox-group-vertical-item-marginbottom);
  }
  .cd-checkboxGroup-vertical-cardType {
    row-gap: var(--cd-spacing-checkbox-card-group-vertical-marginbottom);
  }
  .cd-checkboxGroup-vertical-pureCardType :global(.cd-checkbox) {
    column-gap: 0;
  }
</style>
