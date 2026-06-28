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
  entry('01-basic.svelte', '基础用法', '数据驱动模式：传入 panels 数组，通过 children snippet 按 key 渲染内容。'),
  entry('02-accordion.svelte', '手风琴', '设置 accordion 后同时只能展开一个面板，常用于 FAQ 场景。'),
  entry('03-declarative.svelte', '声明式用法', '不传 panels，直接在 children 内写 <Collapse.Panel>，可内嵌任意富内容。'),
  entry('04-position.svelte', '箭头位置', '通过 expandIconPosition 将展开箭头放到左侧或右侧（默认右侧）。'),
];
