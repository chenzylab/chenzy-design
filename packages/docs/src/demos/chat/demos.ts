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
  entry('01-basic.svelte', '基础对话', 'chats + roleConfig，onMessageSend 里追加用户与助手消息。'),
  entry('02-status.svelte', '消息状态', 'status 支持 loading / incomplete / complete / error。'),
  entry('03-hints.svelte', '提示区', 'hints 提供快捷提问，点击触发 onHintClick。'),
];
