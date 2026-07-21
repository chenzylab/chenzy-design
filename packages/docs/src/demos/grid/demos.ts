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
  entry('01-basic.svelte', '基础使用', '使用单一的一组 Row 和 Col 栅格组件即可创建基本栅格系统，所有 Col 必须放在 Row 内。'),
  entry('02-gutter.svelte', 'Gutter 间隔', 'Row 的 gutter 属性控制栅格间隔，可写成像素值或 [水平, 垂直] 数组或响应式对象。'),
  entry('03-offset.svelte', 'Offset 偏移', '通过 offset 向右偏移指定列数（间隔内不可有栅格）。'),
  entry(
    '05-flex-justify.svelte',
    'Flex 布局',
    'Row type="flex" 下 justify 控制子元素水平排列：start/center/end/space-between/space-around。',
  ),
  entry(
    '06-flex-align.svelte',
    'Flex 子元素垂直对齐',
    'Row type="flex" 下 align 控制不等高子元素的垂直对齐：top/middle/bottom。',
  ),
  entry('07-order.svelte', 'Flex 元素排序', '通过 Flex 布局的 order 改变元素的排序。'),
  entry(
    '04-responsive.svelte',
    '响应式',
    '参照 Bootstrap 响应式设计，预设六个响应尺寸：xs/sm/md/lg/xl/xxl。',
  ),
];
