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
  entry('01-basic.svelte', '基本用法'),
  entry('02-with-input.svelte', '带输入框的'),
  entry('03-tip-formatter.svelte', '自定义提示'),
  entry('04-marks.svelte', '带标签的'),
  entry('05-rail-gradient.svelte', '分段背景'),
  entry('06-controlled.svelte', '受控组件'),
  entry('07-vertical.svelte', '垂直'),
  entry('08-handle-dot.svelte', '滑块带圆点'),
];
