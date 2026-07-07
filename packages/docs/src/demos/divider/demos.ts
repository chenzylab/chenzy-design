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
    '带内容',
    '水平分割线可嵌入文字/图标，align 控制内容居左/居中/居右。',
  ),
  entry(
    '04-plain.svelte',
    '文字字重',
    'plain 默认 true 为常规字重；plain=false 时文字加粗，用于更强的区块标题。',
  ),
  entry(
    '05-thickness.svelte',
    '线宽',
    'thickness 自定义线宽（px），默认 1px，用于强调更粗的结构分隔。',
  ),
];
