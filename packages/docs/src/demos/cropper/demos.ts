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
  entry('01-basic.svelte', '基础用法', '传入 src；shape 切换 rect / round / roundRect；getCropperCanvas 取结果。'),
  entry('02-aspect-ratio.svelte', '自定义裁切框比例', 'aspectRatio 固定裁切框比例（此处 3:4），拖动时以此比例变化。'),
  entry('03-rotate-zoom.svelte', '受控旋转 / 缩放', 'rotate、zoom 受控旋转缩放，onZoomChange 回传最新缩放值。'),
  entry('04-cropper-box.svelte', '裁切框设置', 'cropperBoxStyle 自定义裁切框样式，showResizeBox 控制调整块显隐。'),
  entry('05-preview.svelte', '实时预览裁切效果', 'preview 指定预览容器，裁切态变化时实时渲染预览。'),
];
