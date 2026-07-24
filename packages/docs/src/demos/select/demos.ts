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
  entry('01-basic.svelte', '基本使用'),
  entry('02-option-list.svelte', '以数组形式传入 Option'),
  entry('03-multiple.svelte', '多选'),
  entry('04-group.svelte', '分组'),
  entry('05-size.svelte', '不同尺寸'),
  entry('06-status.svelte', '不同校验状态样式'),
  entry('07-prefix-suffix.svelte', '配置前缀、后缀、清除按钮'),
  entry('08-slots.svelte', '在顶部/底部渲染附加项'),
  entry('09-controlled.svelte', '受控组件'),
  entry('10-dynamic-options.svelte', '动态修改 Options'),
  entry('11-linked.svelte', '联动'),
  entry('12-filter.svelte', '开启搜索'),
  entry('13-search-position.svelte', '搜索框位置'),
  entry('14-remote.svelte', '远程搜索'),
  entry('15-filter-function.svelte', '自定义搜索逻辑'),
  entry('16-render-selected.svelte', '自定义已选项标签渲染'),
  entry('17-dropdown-style.svelte', '自定义弹出层样式'),
  entry('18-change-with-object.svelte', '获取选项的其他属性'),
  entry('19-create.svelte', '创建条目'),
  entry('20-virtualize.svelte', '虚拟化'),
  entry('21-trigger-render.svelte', '自定义触发器'),
  entry('22-render-option.svelte', '自定义候选项渲染'),
  entry('23-methods.svelte', '命令式方法'),
];
