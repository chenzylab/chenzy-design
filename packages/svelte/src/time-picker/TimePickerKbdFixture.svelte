<!--
  仅供 TimePicker.kbd.test.ts（browser project）使用的列内 roving 键盘 e2e 夹具。
  trigger 控制 open（受控）；固定 value=08:30:45 让各列选中项稳定（停靠点 = 选中项）。
  三列（时/分/秒）listbox，列内 ↑↓ roving + Home/End，列间 Tab。
-->
<script lang="ts">
  import { LocaleProvider } from '../locale-provider/index.js';
  import TimePicker from './TimePicker.svelte';

  let open = $state(false);
  const value = new Date(2024, 0, 1, 8, 30, 45);
</script>

<LocaleProvider locale="en_US">
  <button type="button" data-testid="before" onclick={() => (open = true)}>open time picker</button>
  <TimePicker
    {open}
    {value}
    locale="en-US"
    ariaLabel="pick time"
    onOpenChange={(v) => (open = v)}
  />
</LocaleProvider>
