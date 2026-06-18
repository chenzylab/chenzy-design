<!--
  CheckboxGroup — see specs/components/input/Checkbox.spec.md
  Provides context to child Checkboxes; controlled / uncontrolled set of values.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import Checkbox from './Checkbox.svelte';
  import { setCheckboxGroupContext, type CheckboxValue, type CheckboxSize } from './context.js';

  type OptionObject = { label: string; value: CheckboxValue; disabled?: boolean; extra?: string };
  type Option = string | number | OptionObject;

  interface Props {
    value?: CheckboxValue[];
    defaultValue?: CheckboxValue[];
    options?: Option[];
    disabled?: boolean;
    size?: CheckboxSize;
    name?: string;
    direction?: 'horizontal' | 'vertical';
    onChange?: (v: CheckboxValue[]) => void;
    children?: Snippet;
  }

  let {
    value = $bindable(),
    defaultValue = [],
    options,
    disabled = false,
    size = 'default',
    name,
    direction = 'horizontal',
    onChange,
    children,
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

  setCheckboxGroupContext({
    isChecked: (v) => selected.includes(v),
    toggle: (v) => {
      const next = selected.includes(v)
        ? selected.filter((item) => item !== v)
        : [...selected, v];
      commit(next);
    },
    getDisabled: () => disabled,
    getSize: () => size,
    getName: () => name,
  });

  const cls = $derived(`cd-checkbox-group cd-checkbox-group--${direction}`);
</script>

<div class={cls} role="group">
  {#if options}
    {#each options as opt (normalize(opt).value)}
      {@const o = normalize(opt)}
      <Checkbox value={o.value} disabled={o.disabled ?? false} extra={o.extra}>{o.label}</Checkbox>
    {/each}
  {:else}
    {@render children?.()}
  {/if}
</div>

<style>
  .cd-checkbox-group {
    display: inline-flex;
    gap: var(--cd-spacing-4);
  }
  .cd-checkbox-group--horizontal {
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
  }
  .cd-checkbox-group--vertical {
    flex-direction: column;
    align-items: flex-start;
  }
</style>
