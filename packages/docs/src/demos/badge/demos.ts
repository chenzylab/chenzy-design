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
  entry(
    '01-basic.svelte',
    '基本用法',
    'count 为基本类型；dot 显示小圆点（优先于 count）；count 为节点时直接渲染；也可传字符串。',
  ),
  entry(
    '02-overflow.svelte',
    '显示最大值',
    '设置 overflowCount，实际数值超过时以 {overflowCount}+ 格式显示。',
  ),
  entry(
    '03-position.svelte',
    '徽标位置',
    'position 支持 leftTop / leftBottom / rightTop（默认）/ rightBottom。',
  ),
  entry(
    '04-theme.svelte',
    '徽标样式',
    'theme 支持 solid（默认）/ light / inverted，作用于 count 与 dot。',
  ),
  entry(
    '05-type.svelte',
    '徽标类型',
    'type 支持 primary（默认）/ secondary / tertiary / warning / danger / success。',
  ),
  entry(
    '06-standalone.svelte',
    '独立使用',
    'Badge 作为独立元素时可单独使用，常与文字组合表达状态。',
  ),
];
