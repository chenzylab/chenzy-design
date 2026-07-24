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
  entry('01-basic.svelte', '基本使用', 'small / default / large 三种尺寸。'),
  entry('02-controlled.svelte', '受控', '使用 value 传入验证码字符串，配合 onChange 受控使用。'),
  entry('03-count.svelte', '设置位数', '通过 count 设置位数，默认 6 位，此处设置为 4 位。'),
  entry(
    '04-format.svelte',
    '设置字符范围',
    '使用 format 控制可输入的字符范围：number / mixed / 正则 / 函数。',
  ),
  entry('05-focus.svelte', '手动聚焦失焦', '通过 bind:this 拿到实例，命令式调用 focus(index) / blur(index)。'),
];
