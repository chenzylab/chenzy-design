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
  entry('01-basic.svelte', '基本用法', '同时展开多个面板，可通过 defaultActiveKey 设置默认展开项。'),
  entry('02-accordion.svelte', '手风琴效果', '设置 accordion 后每次只允许展开一个面板，常用于 FAQ 场景。'),
  entry('03-disabled.svelte', '禁用面板', '通过 disabled 禁用面板，禁用项不可展开/收起。'),
  entry('04-no-arrow.svelte', '隐藏展开/收起图标', '通过 showArrow={false} 隐藏单个面板的展开/收起箭头。'),
  entry('05-custom-icon.svelte', '自定义展开图标', '通过 expandIcon（收起态）与 collapseIcon（展开态）自定义两个图标。'),
  entry('06-extra.svelte', '右上角辅助内容', '通过 extra 设置右上角辅助内容，仅在 header 为字符串时生效。'),
  entry('07-icon-position.svelte', '箭头位置', '通过 expandIconPosition 将展开箭头放到左侧（默认右侧）。'),
  entry('08-click-arrow-only.svelte', '仅点击箭头展开', 'clickHeaderToExpand={false} 时 Header 不再是热区，仅点击箭头才切换，便于在 Header 内放置交互元素。'),
];
