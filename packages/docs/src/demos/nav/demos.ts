import type { Component } from 'svelte';

const mods = import.meta.glob<{ default: Component }>('./*.svelte', { eager: true });
const sources = import.meta.glob('./*.svelte', {
  eager: true,
  query: '?raw',
  import: 'default',
}) as Record<string, string>;

type LocalizedText = string | { zh: string; en: string };

export interface DemoEntry {
  title: LocalizedText;
  description?: LocalizedText;
  component: Component;
  code: string;
}

function entry(file: string, title: LocalizedText, description?: LocalizedText): DemoEntry {
  return {
    title,
    description,
    component: mods[`./${file}`].default,
    code: (sources[`./${file}`] as string).trim(),
  };
}

export const demos: DemoEntry[] = [
  entry(
    '01-vertical.svelte',
    { zh: '垂直导航', en: 'Vertical' },
    {
      zh: '侧边导航：logo 头部 + 子导航展开 + 底部收起按钮。items 字段对齐 Semi（itemKey/text/icon/items）。',
      en: 'Side nav: logo header + expandable sub-nav + bottom collapse button. items aligns with Semi.',
    },
  ),
  entry(
    '02-horizontal.svelte',
    { zh: '水平导航', en: 'Horizontal' },
    {
      zh: '顶部导航：mode="horizontal"，子导航 hover 弹出浮层。',
      en: 'Top nav: mode="horizontal" with hover popup sub-nav.',
    },
  ),
];
