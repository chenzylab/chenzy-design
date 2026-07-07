<script lang="ts">
  import { DatePicker, Space, Text } from '@chenzy-design/svelte';

  let disabledDateVal = $state<Date | Date[] | null>(null);
  let presetVal = $state<Date | Date[] | null>(null);

  // 禁用周末
  const disableWeekend = (date: Date) => {
    const day = date.getDay();
    return day === 0 || day === 6;
  };

  const presets = [
    { label: '今天', value: () => new Date() },
    { label: '昨天', value: () => new Date(Date.now() - 86400000) },
    { label: '一周后', value: () => new Date(Date.now() + 7 * 86400000) },
    { label: '一个月后', value: () => new Date(Date.now() + 30 * 86400000) },
  ];
</script>

<Space vertical align="start">
  <Space>
    <span style="width:240px; display:inline-block">
      <DatePicker value={disabledDateVal} disabledDate={disableWeekend} onChange={(d) => (disabledDateVal = d)} />
    </span>
    <Text type="tertiary">
      禁用周末：{disabledDateVal instanceof Date ? disabledDateVal.toLocaleDateString('zh-CN') : '（未选）'}
    </Text>
  </Space>
  <Space>
    <span style="width:240px; display:inline-block">
      <DatePicker {presets} presetPosition="left" value={presetVal} onChange={(d) => (presetVal = d)} />
    </span>
    <Text type="tertiary">
      快捷预设（左侧）：{presetVal instanceof Date ? presetVal.toLocaleDateString('zh-CN') : '（未选）'}
    </Text>
  </Space>
</Space>
