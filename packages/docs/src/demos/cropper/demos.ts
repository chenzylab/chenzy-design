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
  entry('01-basic.svelte', '基础用法', '传入 src，拖动裁切框裁切，getCropperCanvas 取结果。'),
  entry('02-shape.svelte', '裁切框形状', 'shape 支持 rect / round / roundRect。'),
  entry('03-zoom.svelte', '受控缩放', 'zoom 控制缩放，onZoomChange 回传最新值。'),
];
