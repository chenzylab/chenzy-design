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
  entry('01-basic.svelte', '基本使用'),
  entry('02-density.svelte', '小尺寸'),
  entry('03-multiple.svelte', '多个日期选择'),
  entry('04-datetime.svelte', '日期与时间选择'),
  entry('05-range.svelte', '日期范围选择'),
  entry('06-datetime-range.svelte', '日期范围时间选择'),
  entry('07-inset-input.svelte', '内嵌输入框'),
  entry('08-sync-switch-month.svelte', '同步切换双面板月份'),
  entry('09-panel-change.svelte', '切换面板日期的回调'),
  entry('10-week-select.svelte', '周选择'),
  entry('11-month.svelte', '年月选择'),
  entry('12-month-range.svelte', '年月范围选择'),
  entry('13-need-confirm.svelte', '确认日期时间选择'),
  entry('14-presets.svelte', '带有快捷方式的日期时间选择'),
  entry('15-slots.svelte', '渲染顶部/底部额外区域'),
  entry('16-disabled.svelte', '禁用日期选择'),
  entry('17-disabled-part.svelte', '禁用部分日期或时间'),
  entry('17-disabled-dynamic.svelte', '动态禁用日期'),
  entry('17-disabled-focus.svelte', '根据 focus 状态禁用'),
  entry('18-format.svelte', '自定义显示格式'),
  entry('19-trigger-render.svelte', '自定义触发器'),
  entry('19-trigger-render-range.svelte', '自定义触发器（范围）'),
  entry('20-render-date.svelte', '自定义日期显示内容'),
  entry('21-render-full-date.svelte', '自定义日期格子渲染'),
  entry('22-methods.svelte', '命令式方法'),
];
