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
  entry('01-collapse.svelte', '折叠模式（默认）', 'renderMode="collapse"：容器放不下时把溢出项收纳为 +N'),
  entry('02-collapse-from.svelte', '折叠方向', 'collapseFrom="start" 从头部折叠，尾部项保持可见'),
  entry('03-min-visible-items.svelte', '最小展示数目', 'minVisibleItems 保证至少展示 N 个可见项'),
  entry('04-scroll.svelte', '滚动模式', 'renderMode="scroll" 不折叠，容器内横向滚动查看溢出项'),
  entry('05-on-overflow.svelte', '溢出回调', 'onOverflow 上报当前被折叠的项集合（去重）'),
  entry('06-custom-overflow.svelte', '自定义折叠节点', 'overflowRenderer 返回下拉菜单，点击 +N 展开被折叠项'),
  entry('07-scroll-intersect.svelte', '滚动相交回调', 'scroll 模式下 onVisibleStateChange + threshold 上报可见项'),
  entry('08-dynamic-items.svelte', '动态切换数据', 'items 引用变化后重新测量并重算折叠结果'),
];
