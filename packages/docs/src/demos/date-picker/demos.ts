import type { Component } from 'svelte';

const mods = import.meta.glob<{ default: Component }>('./*.svelte', { eager: true });
const sources = import.meta.glob('./*.svelte', {
  eager: true,
  query: '?raw',
  import: 'default',
}) as Record<string, string>;

export interface DemoEntry {
  title: string;
  description?: string;
  component: Component;
  code: string;
}

function entry(file: string, title: string, description?: string): DemoEntry {
  return {
    title,
    description,
    component: mods[`./${file}`].default,
    code: (sources[`./${file}`] as string).trim(),
  };
}

export const demos: DemoEntry[] = [
  entry('BasicDemo.svelte', '基础用法', '支持日期、日期时间、月份、年份类型，含范围选择、快捷预设、禁用时间。'),
  entry('01-basic.svelte', '基础日期选择', '单日期选择与范围选择器的基础用法。'),
  entry('02-type.svelte', '日期类型', 'type 切换日期时间、月份、年份选择。'),
  entry('03-range.svelte', '范围选择', 'RangePicker 配合 disabledDate 与 maxRange 限制可选区间。'),
  entry('04-disabled-presets.svelte', '禁用日期与快捷预设', 'disabledDate 禁用周末，presets/presetPosition 提供快捷选项。'),
  entry('05-format-appearance.svelte', '自定义格式与外观', 'format 自定义解析格式，size/status/disabled 控制外观状态。'),
  entry('06-datetime-range.svelte', '带时间范围选择', 'RangePicker type=dateTimeRange 双面板 + 起止时/分/秒列 + 确认提交，支持 showSecond、disabledTime。'),
  entry('07-month-range.svelte', '月份范围选择', 'RangePicker type=monthRange 双月份面板（头部年份 + 左右切年）选起止月，value 为 [起始月, 结束月]。'),
];
