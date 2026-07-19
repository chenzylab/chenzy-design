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
  entry('01-basic.svelte', '基础用法', '声明 Ctrl+Shift+A 组合，命中触发回调；修饰键精确匹配，普通键用物理键位。'),
  entry('02-content.svelte', '自定义键名', 'content 自定义提示显示文本，不影响监听匹配；默认渲染随平台显示 ⌘/Ctrl。'),
  entry('03-render.svelte', 'render 自定义', 'render 完全接管提示 UI；render 传 null 则只监听不显示。'),
  entry('04-prevent-default.svelte', '拦截默认行为', 'preventDefault 命中时阻止浏览器默认快捷键（如 Ctrl+S 保存网页）。'),
  entry('05-listener-target.svelte', '局部监听', 'getListenerTarget 返回具体元素，只在该元素作用域内监听。'),
];
