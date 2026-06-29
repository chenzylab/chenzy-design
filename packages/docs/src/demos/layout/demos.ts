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
    '01-three-rows.svelte',
    { zh: '三行布局', en: 'Three rows' },
    {
      zh: 'Header / Content / Footer 纵向三段式，最基础的页面骨架。',
      en: 'Vertical Header / Content / Footer — the most basic page skeleton.',
    },
  ),
  entry(
    '02-left-sider.svelte',
    { zh: '左侧边栏', en: 'Left sider' },
    {
      zh: '嵌套 Layout hasSider，Sider 在左、Content 占据剩余空间。',
      en: 'Nested Layout hasSider with Sider on the left, Content filling the rest.',
    },
  ),
  entry(
    '03-right-sider.svelte',
    { zh: '右侧边栏', en: 'Right sider' },
    {
      zh: 'Sider placement="right" 置于右侧，常用于辅助信息面板。',
      en: 'Sider placement="right" on the right side, common for auxiliary panels.',
    },
  ),
  entry(
    '04-sider-layout.svelte',
    { zh: '侧边栏布局', en: 'Sider layout' },
    {
      zh: 'Sider 与含 Header/Content/Footer 的内层 Layout 并列，侧栏贯穿全高。',
      en: 'Sider beside an inner Layout (Header/Content/Footer); the sider spans full height.',
    },
  ),
  entry(
    '05-collapsible.svelte',
    { zh: '可折叠导航', en: 'Collapsible nav' },
    {
      zh: 'Sider 内嵌 Nav：logo 头部 + 子导航展开 + 底部收起按钮联动折叠。',
      en: 'Nav inside Sider: logo header + expandable sub-nav + bottom collapse button.',
    },
  ),
  entry(
    '06-top-nav.svelte',
    { zh: '顶部导航', en: 'Top nav' },
    {
      zh: 'Header 放 Nav horizontal + logo，右侧用户 Avatar，Content 放 Breadcrumb。',
      en: 'Header with horizontal Nav + logo, user Avatar on the right, Breadcrumb in Content.',
    },
  ),
  entry(
    '07-top-side-nav.svelte',
    { zh: '顶部 + 侧边导航', en: 'Top + side nav' },
    {
      zh: '完整后台骨架：顶栏全局导航 + 侧栏功能导航（可折叠）+ 内容区面包屑。',
      en: 'Full admin skeleton: top global nav + collapsible side nav + breadcrumb content.',
    },
  ),
];
