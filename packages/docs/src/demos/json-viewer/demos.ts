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
  entry('01-basic.svelte', '基本用法', 'value 传入 JSON 字符串，展示与编辑（非受控）。'),
  entry('04-line-height.svelte', '设置行高', 'options.lineHeight 控制每行高度（默认 20）。'),
  entry('05-auto-wrap.svelte', '自动换行', 'options.autoWrap 控制超长内容是否折行（默认 true）。'),
  entry('03-format.svelte', '格式化配置', 'options.formatOptions 控制缩进（tabSize）与换行符（eol）。'),
  entry(
    '06-custom-render.svelte',
    '自定义渲染规则',
    'options.customRenderRule 在只读模式下匹配 key/value，命中的 token 用自定义 DOM 渲染。',
  ),
  entry('02-readonly.svelte', '只读', 'options.readOnly 开启只读模式（不可编辑）。'),
];
