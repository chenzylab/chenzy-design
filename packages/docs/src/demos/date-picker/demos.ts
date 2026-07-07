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
  entry('07-inset-input.svelte', '面板内嵌输入', 'insetInput 在面板顶部渲染可编辑输入框（date 日期框；dateTime 日期框+时间框），键盘可直接键入，与面板选择双向同步。'),
  entry('07-year-month-wheel.svelte', '年月滚轮快速跳转', '点头部年月标题展开年 + 月滚轮列（复用 ScrollList），快速跳转任意年月；yearAndMonthOpts 控制循环滚动。'),
  entry('08-multiple.svelte', '多选日期', 'multiple 多选（仅 type=date），value 为 Date[]，max 限制数量。'),
  entry('09-timezone.svelte', '时区显示', 'timeZone 按 IANA 时区显示同一时刻（格式化层注入，底层绝对时刻不变）。'),
  entry('10-need-confirm.svelte', '确认选择', 'needConfirm 使 dateTime 需点击确认才写入值，配合 onConfirm 回调。'),
  entry('11-slots-render.svelte', '面板插槽与自定义日期', 'topSlot/bottomSlot 面板额外区域，renderDate 自定义日期单元格内容。'),
  entry('12-trigger-render.svelte', '自定义触发器', 'triggerRender 完全自定义触发器外观。'),
  entry('13-range-presets.svelte', '范围快捷区间', 'RangePicker presets 提供最近 7 天等快捷区间，presetPosition 控制位置。'),
  entry('14-week-select.svelte', '周选择', 'RangePicker startDateOffset/endDateOffset 单击任意日期即选中整周。'),
];
