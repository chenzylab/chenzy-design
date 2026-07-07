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
  entry('01-basic.svelte', '基础栅格', '24 列栅格系统，通过 span 指定列宽，gutter 控制列间距。'),
  entry('02-gutter.svelte', '行列间距', 'gutter 传 [水平, 垂直] 数组可同时设置行列间距。'),
  entry('03-offset.svelte', '列偏移', '通过 offset 向右偏移指定列数，实现灵活的留白布局。'),
  entry('08-push-pull.svelte', '列位置微调', 'push / pull 相对移动列位置，可让 DOM 顺序与视觉顺序解耦。'),
  entry('05-flex-justify.svelte', 'Flex 水平排列', 'justify 控制水平排列：start/center/end/space-between/space-around/space-evenly（space-evenly 为本库额外提供）。'),
  entry('06-flex-align.svelte', 'Flex 垂直对齐', 'align 控制不等高列的垂直对齐：top/middle/bottom/baseline/stretch（baseline/stretch 为本库额外提供）。'),
  entry('07-order.svelte', '元素排序', '通过 order 改变列的视觉排列顺序，DOM 顺序不变。'),
  entry('09-flex-fill.svelte', 'Flex 自适应', 'Col 的 flex 按比例分配剩余空间，或固定宽 + 自动列填充（本库相较 Semi 额外提供）。'),
  entry('10-nowrap.svelte', '不换行', 'wrap={false} 强制单行不换行，列被压缩（本库相较 Semi 额外提供）。'),
  entry('04-responsive.svelte', '响应式布局', '通过 xs/sm/md/lg/xl/xxl 断点属性实现移动端到桌面端的自适应。'),
];
