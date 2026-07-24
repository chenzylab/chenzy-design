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
  entry('01-basic.svelte', '基本用法', '可以同时展开多个面板，可以通过 defaultActiveKey 设置默认展开的面板。'),
  entry('02-accordion.svelte', '手风琴效果', '可以通过设置 accordion 使每次只允许展开一个面板。'),
  entry('03-disabled.svelte', '禁用面板', '可以通过设置 disabled 禁用面板。'),
  entry('04-no-arrow.svelte', '隐藏面板展开/收起图标', '可以通过设置 showArrow 隐藏面板展开/收起图标。'),
  entry('05-custom-icon.svelte', '自定义展开图标', '可以通过 expandIcon 设置展开图标，collapseIcon 设置折叠图标。'),
  entry('06-extra.svelte', '自定义右上角辅助区域内容', '通过 extra 设置右上角辅助区域内容，仅在 header 为 string 时生效。'),
];
