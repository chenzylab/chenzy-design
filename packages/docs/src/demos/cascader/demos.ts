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
  entry('01-basic.svelte', '基础用法', '逐级展开树形数据，支持搜索过滤与清空'),
  entry('02-multiple.svelte', '多选', 'multiple 开启每列复选框与父子联动，maxTagCount 折叠溢出标签'),
  entry('03-default-value.svelte', '默认值与任意级选择', 'defaultValue 设置初始路径，changeOnSelect 允许选中任意层级'),
  entry('04-disabled.svelte', '禁用选项', '通过节点 disabled 字段禁用单个选项或整棵子树'),
  entry('05-load-data.svelte', '动态加载', 'loadData 在点击非叶子节点时异步拉取子级，加载中显示 spinner'),
  entry('06-max-inset-label.svelte', '数量上限与内嵌标签', 'max 限制多选可勾选数量，超出触发 onExceed 且不选入；insetLabel 在触发器值前内嵌标签'),
];
