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
  entry('01-count.svelte', '数字角标', '角标显示计数，超出 overflowCount 时显示 {n}+，showZero 控制零值显示。'),
  entry('02-dot.svelte', '小圆点', '设置 dot 后忽略 count，仅显示小圆点，适合提示有新内容。'),
  entry('03-status.svelte', '状态点', '独立状态点模式：设置 status 且无 children 时进入，可附带文字说明。'),
  entry('04-type.svelte', '类型', '通过 type 控制角标语义色，支持 danger / warning / success / primary 等。'),
];
