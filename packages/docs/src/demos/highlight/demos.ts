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
    '通过 searchWords 指定需要高亮的关键字，通过 sourceString 指定源文本。匹配到的文字默认用 <mark> 包裹高亮。',
  ),
  entry(
    '02-highlight-style.svelte',
    '指定高亮样式',
    '默认高亮背景为 yellow-4、文字黑色（暗色为 yellow-2 + 白字）。通过 highlightClassName、highlightStyle 自定义高亮样式。',
  ),
  entry(
    '03-differentiated.svelte',
    '不同文本使用差异化样式',
    'searchWords 传入对象数组时，可通过 text 指定高亮文本，同时为每个关键词单独指定 className、style。',
  ),
  entry(
    '04-component.svelte',
    '指定高亮标签',
    '默认将命中文本用 mark 标签包裹，可通过 component 重新指定标签（如 strong）。',
  ),
  entry('05-multiple.svelte', '多关键词', 'searchWords 支持字符串数组，同时高亮多个关键词。'),
  entry(
    '06-case-sensitive.svelte',
    '大小写敏感',
    '默认忽略大小写，设置 caseSensitive 开启大小写严格匹配。',
  ),
];
