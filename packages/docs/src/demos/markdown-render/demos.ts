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
  entry(
    '01-basic.svelte',
    '基本用法',
    '传入 raw 纯文本即可渲染。支持加粗/删除线/链接/emoji 等富文本，多级标题、列表、表格。',
  ),
  entry(
    '02-custom-element.svelte',
    '修改元素样式',
    '向 components 传入渲染组件覆盖任意元素。这里把 h2 标题替换为自定义颜色的 Title。',
  ),
  entry(
    '03-plain-markdown.svelte',
    '仅纯 Markdown',
    'format="md" 开启仅 Markdown 模式，无需转义特殊字符；同时覆盖 h1 为主色标题。',
  ),
  entry(
    '04-custom-component.svelte',
    '添加自定义组件',
    '通过 components 注册自定义组件，在 Markdown 中渲染带 JS 事件的元素（Svelte 用 rehype 插件 + components 替代 MDX 的正文 JSX）。',
  ),
];
