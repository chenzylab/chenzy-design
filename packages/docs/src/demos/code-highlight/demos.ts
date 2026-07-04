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
  entry('01-basic.svelte', '基础用法', '传入 code 与 language，基于 prismjs 输出语法高亮。'),
  entry('02-languages.svelte', '多语言', '通过 language 指定语言，prismjs 内置常见语言，其余按需引入。'),
  entry('03-line-number.svelte', '行号', 'lineNumber 控制是否显示行号（默认开启）。'),
];
