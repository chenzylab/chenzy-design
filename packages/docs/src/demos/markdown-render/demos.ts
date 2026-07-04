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
  entry('01-basic.svelte', '基础用法', '传入 raw 纯文本，渲染标题、加粗、列表、链接、引用等基础 Markdown。'),
  entry('02-gfm.svelte', 'GFM 扩展', '开启 remarkGfm 后支持表格、任务列表、删除线、自动链接。'),
  entry('03-code-block.svelte', '代码块', '代码块默认接入 CodeHighlight 做语法高亮。'),
];
