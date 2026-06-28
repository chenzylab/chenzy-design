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
  entry('01-basic.svelte', '基础虚拟列表', '万行数据仅渲染视口行，固定行高模式'),
  entry(
    '02-dynamic-height.svelte',
    '动态/不定高',
    "itemSize='auto'，ResizeObserver 实测每行真实高度并修正偏移",
  ),
  entry(
    '03-scroll-to-index.svelte',
    '滚动到指定项',
    '通过 bind:this 拿组件实例，命令式调用 scrollToIndex(index, { align })',
  ),
  entry(
    '04-horizontal.svelte',
    '横向虚拟化',
    'horizontal 沿 x 轴排列，itemSize 作列宽（仅 fixed 定宽）',
  ),
  entry(
    '05-custom-item.svelte',
    '自定义项渲染',
    'renderItem 内组合 Tag 与富结构，渲染任务列表',
  ),
];
