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
  entry('01-basic.svelte', '基础日历', '月视图展示事件，点击日期触发 onSelect'),
  entry('02-modes.svelte', '视图切换', '通过 mode 在月 / 周 / 日视图间切换'),
  entry('03-day-timeline.svelte', '日视图时间轴', 'mode="day" 按小时分段展示定时事件与全天事件'),
  entry('04-range-selection.svelte', '范围选择', 'selectionMode="range" 选择起止日期，区间高亮'),
  entry('05-disabled-custom.svelte', '禁用日期与自定义单元格', 'disabledDate 禁用周末/月末，dateCell 自定义单元格内容'),
];
