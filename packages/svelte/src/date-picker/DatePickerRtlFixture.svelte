<!--
  browser project 夹具（真实 chromium）：DatePicker 在 LTR / RTL 下的镜像。
  面板（Month/Switch/Navigation/YearAndMonth/Footer/MonthsGrid/InsetInput）默认
  use:floating 挂载到 document.body，脱离 ConfigProvider 的 `.cd-rtl` 包裹层
  （与 Semi 自身 `.semi-portal-rtl` 从未真正赋值是同一已知遗留现状，见 TimePicker
  RTL 处理），故本夹具只钉触发器可达范围：根节点 direction + range 触发器
  prefix/suffix/clearbtn padding 镜像（DateInput 渲染在触发器区域，不进 portal）。
-->
<script lang="ts">
  import '@chenzy-design/tokens/tokens.css';
  import DatePicker from './DatePicker.svelte';
  import ConfigProvider from '../config-provider/ConfigProvider.svelte';

  const range = [new Date(2026, 0, 1), new Date(2026, 0, 10)] as [Date, Date];
</script>

<div data-testid="ltr">
  <DatePicker type="dateRange" defaultValue={range} insetLabel="Label" />
</div>

<ConfigProvider direction="rtl">
  <div data-testid="rtl">
    <DatePicker type="dateRange" defaultValue={range} insetLabel="Label" />
  </div>
</ConfigProvider>
