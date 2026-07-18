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
    '向 code 传入代码纯文本，并在 language 传入编程语言名称。支持的编程语言和对应名称在 Prismjs 官网查看。',
  ),
  entry('02-basic-css.svelte', '基本用法', 'CSS 语言的语法高亮示例。'),
  entry(
    '03-other-language.svelte',
    '支持其他语言',
    '支持 297 种语言，除 JavaScript / CSS / 类 C / html / svg 外，支持其他语言需手动引入配置。例如高亮 Vala 语言需引入 prism-vala.js。',
  ),
  entry(
    '04-custom-theme.svelte',
    '自定义主题',
    '设置 defaultTheme={false} 关闭默认主题，然后手动将需要的主题的 css 文件拷贝并放入项目中引入即可。',
  ),
];
