<script lang="ts">
  import { DatePicker, Space, Text } from '@chenzy-design/svelte';

  let dateVal = $state<Date | Date[] | [Date | null, Date | null] | null>(null);
  let dateTimeVal = $state<Date | Date[] | [Date | null, Date | null] | null>(null);
  let dateRangeVal = $state<[Date | null, Date | null] | null>(null);
  let monthVal = $state<Date | Date[] | [Date | null, Date | null] | null>(null);
  let yearVal = $state<Date | Date[] | [Date | null, Date | null] | null>(null);
  let disabledTimeVal = $state<Date | Date[] | [Date | null, Date | null] | null>(null);
  let presetVal = $state<Date | Date[] | [Date | null, Date | null] | null>(null);
  let formatVal = $state<Date | Date[] | [Date | null, Date | null] | null>(null);
  let maxRangeVal = $state<[Date | null, Date | null] | null>(null);
</script>

<Space vertical align="start">
  <Space>
    <DatePicker value={dateVal} onChange={(d) => (dateVal = d)} />
    <Text type="tertiary">
      日期：{dateVal instanceof Date ? dateVal.toLocaleDateString('zh-CN') : '（未选）'}
    </Text>
  </Space>
  <Space>
    <span data-testid="datepicker-datetime" style="width:260px; display:inline-block">
      <DatePicker type="dateTime" value={dateTimeVal} onChange={(d) => (dateTimeVal = d)} />
    </span>
    <Text type="tertiary">
      日期时间：{dateTimeVal instanceof Date ? dateTimeVal.toLocaleString('zh-CN') : '（未选）'}
    </Text>
  </Space>
  <Space>
    <span data-testid="datepicker-month" style="width:260px; display:inline-block">
      <DatePicker type="month" value={monthVal} onChange={(d) => (monthVal = d)} />
    </span>
    <Text type="tertiary">
      月份：{monthVal instanceof Date ? `${monthVal.getFullYear()}-${monthVal.getMonth() + 1}` : '（未选）'}
    </Text>
  </Space>
  <Space>
    <span data-testid="datepicker-year" style="width:260px; display:inline-block">
      <DatePicker type="year" value={yearVal} onChange={(d) => (yearVal = d)} />
    </span>
    <Text type="tertiary">
      年份：{yearVal instanceof Date ? yearVal.getFullYear() : '（未选）'}
    </Text>
  </Space>
  <Space>
    <span data-testid="datepicker-disabledtime" style="width:260px; display:inline-block">
      <DatePicker
        type="dateTime"
        value={disabledTimeVal}
        onChange={(d) => (disabledTimeVal = d)}
        disabledTime={() => ({ disabledHours: () => Array.from({ length: 12 }, (_, i) => i) })}
      />
    </span>
    <Text type="tertiary">禁用时间：上午 0-11 时不可选</Text>
  </Space>
  <Space>
    <span data-testid="datepicker-presets" style="width:260px; display:inline-block">
      <DatePicker
        value={presetVal}
        onChange={(d) => (presetVal = d)}
        presets={[
          { label: '今天', value: () => new Date() },
          { label: '昨天', value: () => new Date(Date.now() - 86400000) },
          { label: '一周后', value: () => new Date(Date.now() + 7 * 86400000) },
        ]}
      />
    </span>
    <Text type="tertiary">
      快捷：{presetVal instanceof Date ? presetVal.toLocaleDateString('zh-CN') : '（未选）'}
    </Text>
  </Space>
  <Space>
    <span data-testid="rangepicker-dual" style="width:260px; display:inline-block">
      <DatePicker type="dateRange" value={dateRangeVal} onChange={(r) => (dateRangeVal = r as [Date | null, Date | null] | null)} />
    </span>
    <Text type="tertiary">
      范围（双面板，两个月并排）：{dateRangeVal && dateRangeVal[0] && dateRangeVal[1]
        ? `${dateRangeVal[0].toLocaleDateString('zh-CN')} ~ ${dateRangeVal[1].toLocaleDateString('zh-CN')}`
        : '（未选）'}
    </Text>
  </Space>
  <Space>
    <span data-testid="datepicker-format" style="width:260px; display:inline-block">
      <DatePicker format="YYYY-MM-DD" value={formatVal} onChange={(d) => (formatVal = d)} />
    </span>
    <Text type="tertiary">
      自定义 format（可手输 YYYY-MM-DD）：{formatVal instanceof Date
        ? formatVal.toLocaleDateString('zh-CN')
        : '（未选）'}
    </Text>
  </Space>
  <Space>
    <span data-testid="rangepicker-maxrange" style="width:260px; display:inline-block">
      <DatePicker type="dateRange" maxRange={7} value={maxRangeVal} onChange={(r) => (maxRangeVal = r as [Date | null, Date | null] | null)} />
    </span>
    <Text type="tertiary">
      maxRange=7（最多 7 天跨度）：{maxRangeVal && maxRangeVal[0] && maxRangeVal[1]
        ? `${maxRangeVal[0].toLocaleDateString('zh-CN')} ~ ${maxRangeVal[1].toLocaleDateString('zh-CN')}`
        : '（未选）'}
    </Text>
  </Space>
</Space>
