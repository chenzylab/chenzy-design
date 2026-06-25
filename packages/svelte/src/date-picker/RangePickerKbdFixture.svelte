<!--
  仅供 RangePicker.kbd.test.ts（browser project）使用的双面板网格键盘 e2e 夹具。
  trigger 控制 open（受控）；onChange 透传给测试（键盘两次 Enter 选区间后断言提交值）。
  defaultValue 起始月固定到 2024-03，左面板=3 月、右面板=4 月。
  非受控 value：键盘选区会真正提交（onChange 回调拿到结果）。
-->
<script lang="ts">
  import { LocaleProvider } from '../locale-provider/index.js';
  import RangePicker from './RangePicker.svelte';

  interface Props {
    onChange: (v: [Date | null, Date | null] | null) => void;
  }
  let { onChange }: Props = $props();

  let open = $state(false);
  const defaultValue: [Date | null, Date | null] = [new Date(2024, 2, 10), new Date(2024, 2, 20)];
</script>

<LocaleProvider locale="en_US">
  <button type="button" data-testid="before" onclick={() => (open = true)}>open range picker</button>
  <RangePicker
    {open}
    {defaultValue}
    locale="en-US"
    ariaLabel="pick range"
    onOpenChange={(v) => (open = v)}
    {onChange}
  />
</LocaleProvider>
