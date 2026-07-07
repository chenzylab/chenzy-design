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
  entry('01-basic.svelte', '基础用法', '输入时从候选列表中补全，onChange 同步值。'),
  entry('02-remote.svelte', '远程搜索', 'onSearch 防抖后回调由外部更新 data，配合 loading 展示加载态。'),
  entry('03-group.svelte', '分组数据', 'data 传入 { label, options } 分组项，选项可为字符串或 { value, label, disabled }。'),
  entry('04-size.svelte', '尺寸', 'size 控制 small / default / large 三档输入框尺寸。'),
  entry('05-prefix-clear.svelte', '前缀与清除', 'prefix 内嵌前缀标签，clearable 显示一键清空按钮。'),
  entry(
    '06-render.svelte',
    '自定义候选项渲染',
    'renderItem 定制下拉候选项，renderSelectedItem 定制选中后回填的文案（仅支持 string）。',
  ),
  entry('07-position.svelte', '下拉位置', 'position 控制浮层展开方向，可选 bottomLeft / bottomRight / topLeft / topRight。'),
  entry('08-disabled.svelte', '禁用', 'disabled 禁用整个组件，不可输入也不可展开下拉。'),
  entry('09-status.svelte', '校验状态', 'status 设置 warning / error 校验态，仅影响展示样式。'),
  entry('10-empty.svelte', '自定义空内容', 'emptyContent 自定义无候选时的下拉内容，配合 Empty 组件展示空态。'),
];
