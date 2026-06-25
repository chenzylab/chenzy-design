<!--
  仅供 DatePicker.kbd.test.ts（browser project）使用的网格键盘 e2e 夹具。
  trigger 按钮控制 open（受控）；测试先聚焦 trigger 再点开面板，
  验证：打开后焦点落在 role=grid 容器（aria-activedescendant 模型），方向键移动
  aria-activedescendant 指向的日期格；Esc 关闭归还焦点到 trigger。
  固定 value（2024-03-15）让初始高亮稳定（aria-activedescendant 指向该日）。
-->
<script lang="ts">
  import { LocaleProvider } from '../locale-provider/index.js';
  import DatePicker from './DatePicker.svelte';

  let open = $state(false);
  // 固定锚点日期：2024-03-15（周五）。面板打开时高亮对齐该日，方向键移动可预期。
  const value = new Date(2024, 2, 15);
</script>

<LocaleProvider locale="en_US">
  <button type="button" data-testid="before" onclick={() => (open = true)}>open date picker</button>
  <DatePicker
    {open}
    {value}
    locale="en-US"
    ariaLabel="pick date"
    onOpenChange={(v) => (open = v)}
  />
</LocaleProvider>
