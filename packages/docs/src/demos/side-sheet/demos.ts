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
  entry('01-basic.svelte', '基本', '默认侧边栏从右滑出，支持点击遮罩区关闭。'),
  entry('02-placement.svelte', '自定义位置', 'placement 设置滑出位置，支持 top/bottom/left/right。'),
  entry('03-size.svelte', '自定义尺寸', 'size 设置尺寸，支持 small(448px)/medium(684px)/large(920px)，仅 left/right 生效；也可用 width 自定义。'),
  entry('04-no-mask.svelte', '可操作的外部区域', 'mask=false 时允许对外部区域进行操作；disableScroll=false 保留外部滚动。'),
  entry('05-container.svelte', '渲染在指定容器', 'getPopupContainer 指定父级 DOM，弹层渲染至该 DOM；容器需设 overflow:hidden。'),
  entry('06-content.svelte', '自定义内容区域', '自定义 titleSnippet、footer、headerStyle/bodyStyle 等创建丰富内容样式。'),
];
