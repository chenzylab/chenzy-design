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
  entry('01-basic.svelte', '基础用法', 'audioUrl 传入字符串即可播放。'),
  entry('02-cover.svelte', '封面与标题', 'audioUrl 传入对象，携带 title 与 cover。'),
  entry('03-playlist.svelte', '播放列表', 'audioUrl 传入数组，支持上一曲 / 下一曲。'),
];
