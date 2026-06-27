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
  entry('01-type.svelte', '类型', '支持 light / solid / ghost 三种类型。'),
  entry('02-color.svelte', '颜色', '内置 grey / primary / success / warning / danger 等语义色。'),
  entry('03-closable.svelte', '可关闭', '设置 closable 显示关闭按钮，配合 onClose 事件移除标签。'),
  entry('04-shape.svelte', '形状', '支持 square 直角与 circle 圆角两种形状。'),
];
