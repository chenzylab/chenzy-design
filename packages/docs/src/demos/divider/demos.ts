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
    '水平分割线块级占满宽度，用 margin 控制主轴外边距；dashed 切换实线/虚线。',
  ),
  entry(
    '02-vertical.svelte',
    '垂直分割线',
    'layout="vertical" 时为行内元素，占满父级行高，常用于操作链接之间的竖向分隔。',
  ),
  entry(
    '03-with-text.svelte',
    '带文字',
    '水平分割线可嵌入文字，align 控制内容居左/居中/居右；左对齐左线段短、右对齐右线段短、居中两侧等宽。',
  ),
  entry(
    '04-with-icon.svelte',
    '带图标',
    '水平分割线内容也可以是图标，用 margin 控制两侧留白。',
  ),
];
