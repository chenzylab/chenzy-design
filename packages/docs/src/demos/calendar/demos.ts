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
  // —— 以下 1–9 对齐 Semi 官方 9 个 demo（数据 / 样式一致）——
  entry('01-day.svelte', '日视图', 'mode="day" 日视图时间轴'),
  entry('02-week.svelte', '周视图', 'mode="week" 周视图时间轴'),
  entry('03-month.svelte', '月视图', 'mode="month" 月视图网格'),
  entry('04-week-starts-on.svelte', '设置周起始日', 'weekStartsOn 设定每周第一天（0=周日 … 6=周六），对月 / 周视图生效'),
  entry('05-multi-day.svelte', '多日视图', 'mode="range" range 必传，左闭右开'),
  entry('06-events.svelte', '事件渲染用法', 'mode 切换 + DatePicker 联动 displayValue + 10 个事件（children 内联样式块），minEventHeight 控制最小高'),
  entry('07-date-grid-event.svelte', '自定义渲染事件', 'dateGridRender 在某列绝对定位塞事件块（吃饭 / 睡觉 / 打豆豆），需绝对定位 top/height'),
  entry('08-date-grid-cell.svelte', '自定义渲染单元格样式', 'dateGridRender 给重要日期铺一层背景（需绝对定位）'),
  entry('09-render-date-display.svelte', '自定义日期文案', 'renderDateDisplay 用 Avatar 渲染周视图日期头'),
  // —— 以下为本库增强场景（Semi 未单列）——
  entry('10-onclick.svelte', '点击回调', 'onClick 回调点击的精确时间点（日 / 周精确到半小时）'),
  entry('11-more-markweekend.svelte', '周末标识与「还有 N 项」', 'markWeekend 区分周末 + Tag 上色事件 + onMoreClick 处理溢出'),
];
