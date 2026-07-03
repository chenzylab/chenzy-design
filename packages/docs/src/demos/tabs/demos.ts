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
  entry('01-basic.svelte', '基础用法', 'activeKey 受控，onChange 回调返回新 key，disabled 禁用单个 Tab。'),
  entry('02-type.svelte', '类型', '支持 line / card / button 三种类型，button 适合分段切换视图。'),
  entry('03-icon.svelte', '带图标', '每个 Tab 可在文字前渲染图标：声明式 <Tabs.Pane icon={...}> 或数据驱动 tabList 的 TabItem.icon。'),
];
