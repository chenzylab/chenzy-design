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
  entry('01-basic.svelte', '基础用法', '单个单选框，通过 checked 与 onChange 控制状态，支持禁用。'),
  entry('02-group.svelte', '单选框组', 'RadioGroup 以数据驱动渲染多个单选项，onChange 返回选中值。'),
  entry('03-button.svelte', '按钮形态', '设置 type="button" 渲染为按钮组形态，常用于切换视图或筛选。'),
];
