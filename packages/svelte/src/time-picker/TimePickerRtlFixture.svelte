<!--
  browser project 夹具（真实 chromium）：TimePicker 触发器在 LTR / RTL 下的 direction。
  面板 portal 到 body 后脱离 `.cd-rtl` 祖先（对齐 Semi `.semi-portal-rtl` 上游死代码现状，
  见 TimePicker.svelte RTL 注释），故本夹具只钉触发器根节点。
-->
<script lang="ts">
  import '@chenzy-design/tokens/tokens.css';
  import TimePicker from './TimePicker.svelte';
  import ConfigProvider from '../config-provider/ConfigProvider.svelte';
</script>

<div data-testid="ltr">
  <TimePicker defaultValue={new Date(2024, 0, 1, 8, 30, 45)} />
</div>

<ConfigProvider direction="rtl">
  <div data-testid="rtl">
    <TimePicker defaultValue={new Date(2024, 0, 1, 8, 30, 45)} />
  </div>
</ConfigProvider>
