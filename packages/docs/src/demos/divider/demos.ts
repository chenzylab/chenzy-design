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
    'layout 控制方向（水平/垂直），dashed 切换实线/虚线，margin 控制分割线外边距（水平为上下、垂直为左右）。',
  ),
  entry(
    '02-with-content.svelte',
    '包含内容',
    '水平分割线可嵌入文字或图标，align 控制内容对齐方式（居左/居中/居右）。',
  ),
];
