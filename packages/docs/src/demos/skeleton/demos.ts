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
  entry('01-basic.svelte', '基础用法', '通过 loading 切换骨架占位与真实内容，active 开启动画。'),
  entry('02-active.svelte', 'active 闪烁动画', 'active 开启 shimmer 流光动画，关闭则退化为静态底色。'),
  entry('03-shapes.svelte', '原子形状组合', 'Avatar / Title / Paragraph / Image / Button 各原子形状与其形态参数。'),
  entry('04-list.svelte', '列表占位', '列表项各自骨架占位，loading 切换为真实头像与文案。'),
  entry('05-card.svelte', '卡片占位', '自定义占位模板模拟卡片结构，loading 切换为真实 Card。'),
];
