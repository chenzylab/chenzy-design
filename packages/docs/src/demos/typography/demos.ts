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
  entry('01-title.svelte', '标题', '使用 Title 渲染 h1~h6 标题，通过 heading 控制层级。'),
  entry('02-text.svelte', '文本', '使用 Text 渲染行内文本，支持语义色与加粗、下划线、标记、code、禁用等修饰。'),
  entry('03-paragraph.svelte', '段落', '使用 Paragraph 渲染段落文本，可配合 type 与 size 调整样式。'),
];
