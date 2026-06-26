<script lang="ts">
  import { TimePicker, Space, Text } from '@chenzy-design/svelte';

  // 基础单选
  let timeVal = $state<Date | null>(null);
  // 12 小时制
  let timeVal12 = $state<Date | null>(null);
  // 禁用项
  let timeValDisabled = $state<Date | null>(null);
  // 范围选择
  let timeRangeVal = $state<[Date | null, Date | null]>([null, null]);
  // 自定义 format
  let timeFormatVal = $state<Date | null>(null);
</script>

<Space direction="vertical" align="start">
  <Space>
    <TimePicker value={timeVal} onChange={(t) => (timeVal = Array.isArray(t) ? t[0] : t)} />
    <Text type="tertiary">
      时间：{timeVal ? timeVal.toLocaleTimeString('zh-CN') : '（未选）'}
    </Text>
  </Space>

  <Space>
    <TimePicker use12Hours value={timeVal12} onChange={(t) => (timeVal12 = Array.isArray(t) ? t[0] : t)} />
    <Text type="tertiary">
      12h（AM/PM）：{timeVal12 ? timeVal12.toLocaleTimeString('en-US') : '（未选）'}
    </Text>
  </Space>

  <Space>
    <TimePicker
      value={timeValDisabled}
      onChange={(t) => (timeValDisabled = Array.isArray(t) ? t[0] : t)}
      disabledHours={() => [0, 1, 2, 3, 4, 5, 6]}
      disabledMinutes={(h) => (h === 9 ? [0, 15, 30] : [])}
    />
    <Text type="tertiary">
      禁用 0-6 时、9 时的 0/15/30 分（置灰）：{timeValDisabled
        ? timeValDisabled.toLocaleTimeString('zh-CN')
        : '（未选）'}
    </Text>
  </Space>

  <Space>
    <TimePicker
      defaultValue={null}
      hideDisabledOptions
      disabledHours={() => [0, 1, 2, 3, 4, 5, 6]}
    />
    <Text type="tertiary">hideDisabledOptions：禁用的 0-6 时直接从列中隐藏</Text>
  </Space>

  <Space>
    <div data-testid="timepicker-range">
      <TimePicker
        type="timeRange"
        value={timeRangeVal}
        onChange={(v) => (timeRangeVal = Array.isArray(v) ? v : [v, null])}
      />
    </div>
    <Text type="tertiary">
      timeRange：起 {timeRangeVal[0] ? timeRangeVal[0].toLocaleTimeString('zh-CN') : '--'} / 止
      {timeRangeVal[1] ? timeRangeVal[1].toLocaleTimeString('zh-CN') : '--'}
    </Text>
  </Space>

  <Space>
    <div data-testid="timepicker-format">
      <TimePicker
        format="hh:mm A"
        value={timeFormatVal}
        onChange={(t) => (timeFormatVal = Array.isArray(t) ? t[0] : t)}
      />
    </div>
    <Text type="tertiary">format="hh:mm A"：仅时分 + 12h（不显示秒列）</Text>
  </Space>

  <Space>
    <div data-testid="timepicker-string">
      <TimePicker defaultValue="12:30:45" format="HH:mm:ss" />
    </div>
    <Text type="tertiary">字符串入参 defaultValue="12:30:45"（经 core parseTimeString 解析）</Text>
  </Space>
</Space>
