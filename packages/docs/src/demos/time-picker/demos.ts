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
  entry('01-basic.svelte', '基础时间选择', '滚动列选择时、分、秒，onChange 返回 Date'),
  entry('02-use12hours.svelte', '12 小时制', 'use12Hours + format="hh:mm:ss A"，带 AM/PM 列'),
  entry('03-format.svelte', '自定义格式', 'format 决定显示哪些列，如 "HH:mm" 仅时、分'),
  entry('04-step-disabled.svelte', '步长与禁用时段', 'minuteStep 步长 + disabledHours/hideDisabledOptions 限制可选范围'),
  entry('05-size-status.svelte', '尺寸 / 状态 / 禁用', 'size、status、clearable、disabled 等触发器形态'),
  entry('06-time-range.svelte', '时间范围', 'type=timeRange 选择起止时间'),
  entry('07-panel-header-footer.svelte', '面板头部/底部', 'panelHeader、panelFooter 自定义面板顶部与底部内容'),
  entry('08-controlled-open.svelte', '受控面板', '受控 open + onOpenChange，用 Button 切换面板开合'),
  entry('09-trigger-render.svelte', '自定义触发器', 'triggerRender 完全替换默认触发器渲染'),
  entry('10-disabled-time.svelte', '禁用时段', 'disabledTime 按已选时间动态返回禁用规则，覆盖顶层 disabledHours/Minutes/Seconds'),
  entry('11-timezone.svelte', '时区', 'timeZone 按指定时区呈现显示文案'),
];
