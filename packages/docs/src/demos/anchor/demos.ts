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
  entry('01-basic.svelte', '基础锚点', '点击链接高亮当前节，onChange 同步选中值'),
  entry('02-nested.svelte', '多级嵌套锚点', 'links.children 形成树形，父子链接皆可跳转与高亮'),
  entry('03-affix.svelte', '固定位置 affix', 'affix 让锚点在滚动容器内吸顶停留'),
  entry(
    '04-target-offset.svelte',
    '滚动偏移 targetOffset',
    'targetOffset 为吸顶栏预留点击跳转间距',
  ),
  entry('05-horizontal.svelte', '横向布局', 'horizontal 横排，ink 走底部下划线，onChange 监听激活'),
];
