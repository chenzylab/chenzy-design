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
  entry('01-basic.svelte', '基础高亮', '传入 sourceString 与 searchWords，匹配到的文字用 <mark> 包裹高亮。'),
  entry('02-multiple.svelte', '多关键词', 'searchWords 支持字符串数组，同时高亮多个关键词。'),
  entry('03-case-sensitive.svelte', '大小写敏感', '默认忽略大小写，设置 caseSensitive 开启大小写严格匹配。'),
];
