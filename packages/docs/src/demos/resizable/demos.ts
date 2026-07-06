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
  entry('01-single-edge.svelte', '单体右边缘调宽', 'enable={{ right: true }} + minWidth/maxWidth clamp'),
  entry('02-corners.svelte', '四角自由缩放', '四个角把手，宽高各自 min/max 约束'),
  entry('03-lock-grid.svelte', '锁比例 / 网格吸附', 'lockAspectRatio 锁定宽高比；grid 吸附步长'),
  entry('04-group-horizontal.svelte', '水平分栏', 'ResizeGroup direction="horizontal"，相邻两项联动一增一减、总和守恒'),
  entry('05-group-vertical.svelte', '垂直分栏', 'direction="vertical"，拖把手上下面板联动'),
];
