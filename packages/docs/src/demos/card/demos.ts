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
  entry('01-basic.svelte', '基础用法', '最简单的卡片，包含标题与内容区。'),
  entry('02-extra.svelte', '额外操作', '通过 extra 插槽在 header 右侧放置操作按钮或链接。'),
  entry('03-shadow.svelte', '阴影效果', '支持 never / hover / always 三种阴影模式，hoverable 等效于 shadow="hover"。'),
  entry('04-loading.svelte', '加载状态', '设置 loading 时 body 区展示骨架占位，loadingRows 控制骨架行数。'),
  entry('05-actions.svelte', '底部操作', '通过 actions 插槽在卡片底部放置等分操作按钮。'),
  entry('06-group.svelte', '卡片组', 'CardGroup 以网格排布多个 Card，spacing 统一间距（number 一致，[x,y] 分别指定水平/垂直）。'),
];
