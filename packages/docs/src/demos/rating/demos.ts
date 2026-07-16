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
  entry('BasicDemo.svelte', '基础用法', '半星评分，受控值绑定。'),
  entry('01-basic.svelte', '基础评分', 'default / small 两种尺寸。'),
  entry('02-clear.svelte', '允许清除', 'allowClear 控制再次点击当前值是否清零。'),
  entry('03-readonly-disabled.svelte', '只读', 'disabled 展示既定分值且不可交互（对齐 Semi 只读用法）。'),
  entry('04-character-tooltips.svelte', '文案展现', 'character 自定义字符/图标，tooltips 提供逐项提示。'),
  entry('05-size-count.svelte', '尺寸与数量', 'size 调整尺寸，count 自定义评分项数量。'),
  entry('06-half-custom-size.svelte', '自定义', 'allowHalf 可交互半星；size 传 number 配合自定义字符实现任意尺寸。'),
];
