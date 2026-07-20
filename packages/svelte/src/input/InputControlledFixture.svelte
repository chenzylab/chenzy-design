<!--
  受控 Input fixture：模拟 Form 的单向数据流（输入 → onChange → 回写 value prop）。
  用于回归测试：验证受控回写不清空用户输入、maxLength 截断、minLength 属性下发。
-->
<script lang="ts">
  import { untrack } from 'svelte';
  import Input from './Input.svelte';

  let {
    initialValue = '',
    maxLength = undefined,
    minLength = undefined,
    getValueLength = undefined,
  }: {
    initialValue?: string;
    maxLength?: number;
    minLength?: number;
    getValueLength?: (v: string) => number;
  } = $props();

  // 受控值：像 Form 那样，onChange 回来后写回 value prop（单向回流）。
  // 仅以 initialValue 首值播种，后续由 onChange 维护（untrack 消除 state_referenced_locally 告警）。
  let val = $state(untrack(() => initialValue));
</script>

<Input
  ariaLabel="controlled"
  value={val}
  {...(maxLength !== undefined ? { maxLength } : {})}
  {...(minLength !== undefined ? { minLength } : {})}
  {...(getValueLength !== undefined ? { getValueLength } : {})}
  onChange={(v) => (val = v)}
/>
<span data-testid="mirror">{val}</span>
