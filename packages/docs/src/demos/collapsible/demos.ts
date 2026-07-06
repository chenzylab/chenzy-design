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
  entry('01-basic.svelte', '基础用法', 'isOpen 驱动高度过渡（CSS grid 自适应折叠，内容高度无需 JS 测量）。Collapsible 是无 UI 的折叠原语，触发器由使用方提供。'),
  entry('02-keep-dom.svelte', 'keepDOM 保留 DOM', 'keepDOM=true 时折叠后内容 DOM 不卸载，输入框内容、滚动位置等状态得以保留。'),
  entry('03-lazy-render.svelte', 'lazyRender 惰性渲染', 'lazyRender 配合 keepDOM：首次展开前不渲染内容，节省首屏成本，首展后保留 DOM。'),
  entry('04-collapse-height.svelte', 'collapseHeight 展开更多', 'collapseHeight>0 时折叠保留部分高度作截断预览，点击展开全文（显式高度过渡 + JS 测高）。'),
  entry('05-fade.svelte', 'fade 渐变', 'fade=true 时折叠/展开叠加透明度渐变，过渡更柔和。'),
];
