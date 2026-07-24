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
  highlightLines?: number[];
}

function entry(
  file: string,
  title: string,
  description?: string,
  highlightLines?: number[],
): DemoEntry {
  return {
    title,
    description,
    component: mods[`./${file}`].default,
    code: (sources[`./${file}`] as string).trim(),
    highlightLines,
  };
}

export const demos: DemoEntry[] = [
  entry('01-basic.svelte', '基本用法'),
  entry('02-multiple.svelte', '多选'),
  entry('03-max-tag-count.svelte', '限制标签展示数量'),
  entry('04-searchable.svelte', '可搜索的'),
  entry('05-remote-search.svelte', '远程搜索'),
  entry('06-search-position.svelte', '搜索框位置'),
  entry('07-trigger-tag-wrap.svelte', 'Trigger 内多行换行'),
  entry('08-size.svelte', '尺寸大小'),
  entry('09-default-expand.svelte', '默认展开'),
  entry('10-disabled.svelte', '禁用'),
  entry('11-disable-strictly.svelte', '严格禁用'),
  entry('12-controlled.svelte', '受控'),
  entry('13-check-relation.svelte', '节点选中关系'),
  entry('14-search-expand-controlled.svelte', '开启搜索的展开受控'),
  entry('15-virtualize.svelte', '虚拟化'),
  entry('16-dynamic-data.svelte', '动态更新数据'),
  entry('17-load-data.svelte', '异步加载数据'),
  entry('18-trigger-render.svelte', '自定义 Trigger'),
  entry('19-render-selected.svelte', '自定义渲染已选项'),
  entry('20-search-method.svelte', '命令式搜索'),
];
