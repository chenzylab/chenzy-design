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
  entry('BasicDemo.svelte', '基础用法', '弹出触发、内联模式、预设色板、最近用色、校验态。'),
  entry('01-basic.svelte', '基础颜色选择', '弹出触发与内联模式颜色选择，含预设色板。'),
  entry('02-format.svelte', '格式切换', '面板内切换 hex / rgb / hsv / hsl 显示与编辑，回显当前格式与色值。'),
  entry('03-alpha.svelte', '透明度 Alpha', 'alpha 开启时显示透明度滑条，关闭则强制不透明。'),
  entry('04-presets.svelte', '预设色板', 'presets 品牌色板 + recentColors 最近用色，受控值回显。'),
  entry('05-states.svelte', '尺寸与状态', 'size 三档尺寸、warning / error 校验态与 disabled 禁用态。'),
];
