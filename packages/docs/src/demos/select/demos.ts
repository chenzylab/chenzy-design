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
  entry('01-basic.svelte', '基础用法', '受控单选，onChange 回调返回选中值，disabled 项不可选。'),
  entry('02-multiple.svelte', '多选', '设置 multiple 开启多选，选中项以 Tag 形式展示。'),
  entry('03-filter.svelte', '可搜索', '设置 filter 开启输入过滤，适合选项较多的场景。'),
];
