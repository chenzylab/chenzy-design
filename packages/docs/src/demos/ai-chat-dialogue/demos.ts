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
  entry('01-basic.svelte', '基础用法', 'chats（OpenAI 消息格式）+ roleConfig，逐条渲染。'),
  entry('02-content-items.svelte', '内容块', 'ContentItem 分块：思考(reasoning) / 正文 / 工具调用(function_call)。'),
  entry('03-adapter.svelte', '数据 Adapter', 'responseToMessage / chatCompletionToMessage 把 OpenAI 返回转成 Message。'),
];
