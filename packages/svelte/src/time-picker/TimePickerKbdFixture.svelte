<!--
  仅供 TimePicker.kbd.test.ts（browser project）使用的交互 e2e 夹具。
  trigger 控制 open（受控）；defaultValue=08:30:45（非受控）让点击选中真正迁移。
  三列（时/分/秒）复用 ScrollList/ScrollItem，点击 li[role=option] 选中。
-->
<script lang="ts">
  import { LocaleProvider } from '../locale-provider/index.js';
  import TimePicker from './TimePicker.svelte';

  let open = $state(false);
  const defaultValue = new Date(2024, 0, 1, 8, 30, 45);
</script>

<LocaleProvider locale="en_US">
  <button type="button" data-testid="before" onclick={() => (open = true)}>open time picker</button>
  <TimePicker
    {open}
    {defaultValue}
    locale="en-US"
    onOpenChange={(v) => (open = v)}
  />
</LocaleProvider>
