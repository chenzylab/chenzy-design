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
  entry('01-basic.svelte', '基本用法', '单个悬浮按钮，通过 style 覆盖 fixed 定位。'),
  entry('02-size.svelte', '尺寸', '支持三种尺寸：默认，小，大。'),
  entry('03-shape.svelte', '形状', '默认定义了两种形状：round（默认）、square。'),
  entry('04-href.svelte', '点击跳转', '通过 href 设置跳转地址，target 指定目标网页应该在哪个窗口或框架中打开。'),
  entry('05-colorful.svelte', 'AI 风格 - 多彩悬浮按钮', '可设置 colorful 为 true，展示多彩的悬浮按钮。'),
  entry('06-badge.svelte', '带徽章的', '传入 badge 参数时外层包裹 Badge，支持 dot / count / overflowCount / type。'),
  entry('07-group.svelte', '悬浮按钮组', '可通过 items 传入子项，点击回调回传被点项 value。'),
];
