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
  entry('01-basic.svelte', '基础用法', '默认开启懒加载，加载过程中显示骨架占位。'),
  entry('02-preview.svelte', '图片预览', '设置 preview 后点击图片进入全屏预览，支持缩放和旋转。'),
  entry('03-fit.svelte', 'object-fit', '通过 fit 控制图片填充方式，对应 CSS object-fit 属性。'),
];
