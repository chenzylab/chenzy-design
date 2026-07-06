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
  entry('01-basic.svelte', '基本用法', '通过 bind:value 双向绑定输入值，并支持 placeholder 占位提示。'),
  entry('02-size.svelte', '尺寸', '提供 large / default / small 三种尺寸。'),
  entry('03-status.svelte', '状态', '支持禁用、warning、error 等状态。'),
  entry('04-features.svelte', '功能', '可清除、字数统计 + 长度限制、密码输入等功能。'),
  entry('05-group.svelte', '输入组合', 'InputGroup 把多个输入控件拼接为一体（相邻边框合并、首尾圆角），size 经 context 回退统一透传。'),
];
