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
  entry('01-basic.svelte', '基本用法'),
  entry('02-multiple.svelte', '多选'),
  entry('03-searchable.svelte', '可搜索的'),
  entry('04-searchable-multiple.svelte', '可搜索的多选'),
  entry('05-max-tag-count.svelte', '限制标签展示数量'),
  entry('06-max.svelte', '限制选中数量'),
  entry('07-change-on-select.svelte', '选择即改变'),
  entry('08-display.svelte', '自定义显示'),
  entry('09-disabled.svelte', '禁用'),
  entry('10-disable-strictly.svelte', '严格禁用'),
  entry('11-show-next.svelte', '展示子菜单的时机与点击选中'),
  entry('12-slots.svelte', '在顶部/底部渲染附加项'),
  entry('13-controlled.svelte', '受控'),
  entry('14-auto-merge-value.svelte', '自动合并 value'),
  entry('15-leaf-only.svelte', '仅叶子节点'),
  entry('16-check-relation.svelte', '节点选中关系'),
  entry('17-dynamic-data.svelte', '动态更新数据'),
  entry('18-load-data.svelte', '异步加载数据'),
  entry('19-remote.svelte', '远程搜索'),
  entry('20-virtualized-search.svelte', '超长列表'),
  entry('21-trigger-render.svelte', '自定义 Trigger'),
  entry('22-key-maps.svelte', '自定义字段映射'),
  entry('23-change-with-object.svelte', '获取选项的其他属性'),
];
