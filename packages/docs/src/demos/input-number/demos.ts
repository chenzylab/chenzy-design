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
  entry('BasicDemo.svelte', '基础用法', '支持格式化、滚轮调值、strict 越界模式、两侧按钮、内嵌按钮、前后缀。'),
  entry('01-basic.svelte', '基础数字输入', '最小最大值限制、两侧按钮布局、前后缀装饰。'),
  entry('02-range-step.svelte', '范围与步进', 'min/max 限制、step/shiftStep 步进、strict 越界拒绝。'),
  entry('03-precision.svelte', '小数精度', 'precision 控制小数位数，自动四舍五入归一化。'),
  entry('04-formatter.svelte', '格式化与解析', 'formatter/parser 实现千分位、货币、百分比显示。'),
  entry('05-size-disabled.svelte', '尺寸与状态', 'small/large 尺寸、内嵌按钮、disabled/readonly 状态。'),
  entry('06-buttons.svelte', '步进器显隐', 'innerButtons 内嵌步进器（hover/focus 显示），hideButtons 彻底隐藏。'),
  entry('07-number-change.svelte', '纯数字回调', 'onNumberChange 携带 number 类型的值，配合 formatter 实现千分位纯数字输入。'),
  entry('08-scientific.svelte', '科学计数法', 'scientificNotation 失焦显示科学计数法，聚焦显示完整数字；可自定义阈值。'),
];
