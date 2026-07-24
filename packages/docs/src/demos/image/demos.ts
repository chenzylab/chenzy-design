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
  entry('01-basic.svelte', '基本用法', '通过 src 指定图片路径，width/height 指定宽高，默认可点击预览。'),
  entry('02-fallback.svelte', '加载失败的占位图', '通过 fallback 自定义加载失败的占位图，支持 string 和 Snippet。'),
  entry('03-progressive.svelte', '渐进加载', '大图可通过 placeholder 实现渐进加载。'),
  entry('04-custom-preview-src.svelte', '自定义预览图', '缩略图与预览图分离：src 用小图，preview.src 指定高清预览图源。'),
  entry('05-group.svelte', '多图预览', '用 ImagePreview 包裹多个 Image 即可实现多图片预览，可左右切换。'),
  entry('06-standalone.svelte', '单独使用预览组件', 'ImagePreview 可独立使用，通过 visible/onVisibleChange 与 src 编程式控制。'),
  entry('07-popup-container.svelte', '渲染在指定容器', '通过 getPopupContainer 指定预览浮层父级 DOM（需 position:relative）。'),
  entry('08-render-menu.svelte', '自定义预览底部操作区', '用 renderPreviewMenu 拿到 MenuProps 完全自定义底部操作区域。'),
  entry('09-menu-items.svelte', '基于默认按钮自定义', 'renderPreviewMenu 的 menuItems 为默认按钮 Snippet 数组，可自由重组。'),
  entry('10-render-header.svelte', '自定义预览顶部展示区', '通过 renderHeader 自定义预览顶部信息，入参为当前图 previewTitle。'),
];
