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
  entry('01-basic.svelte', '基础用法', '通过 data 以键值对数组传入数据，value 支持字符串或富内容 Snippet。'),
  entry('02-align.svelte', '设置对齐方式', 'align 支持 center（默认）、justify、left、plain 四种对齐；row 为 true 时失效。'),
  entry('03-jsx.svelte', 'JSX 写法', '除 data 外可用 <Descriptions.Item> 声明式写法，须为直接子元素。'),
  entry('04-layout.svelte', '设置布局模式', 'layout 支持 vertical（默认）与 horizontal；横向布局配合 column 指定每行最大列数。'),
  entry('05-double.svelte', '双行显示', 'row 双行显示，支持 small、medium（默认）、large 三种大小，此时 align 失效。'),
  entry('06-keystyle.svelte', '自定义 Key 样式', '通过 keyStyle 自定义 key 样式，如固定宽度实现对齐，data 与声明式写法均支持。'),
];
