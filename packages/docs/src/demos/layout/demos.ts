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
    { zh: '左侧边栏布局', en: 'Left sider' },
    {
      zh: '内层 Layout 含 Sider + Content，Sider 在左、Content 占据剩余空间。',
      en: 'Inner Layout with Sider + Content — sider on the left, content fills the rest.',
    },
  ),
  entry(
    '03-right-sider.svelte',
    { zh: '右侧边栏布局', en: 'Right sider' },
    {
      zh: '内层 Layout 里 Content 在前、Sider 在后，侧栏置于右侧。',
      en: 'Content before Sider in the inner Layout — the sider sits on the right.',
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
    '05-responsive.svelte',
    { zh: '响应式布局', en: 'Responsive' },
    {
      zh: 'Sider breakpoint + onBreakpoint：视口跨断点（md）时触发回调。可选 xs/sm/md/lg/xl/xxl。',
      en: 'Sider breakpoint + onBreakpoint fires when the viewport crosses the md breakpoint.',
    },
  ),
  entry(
    '06-top-nav.svelte',
    { zh: '顶部导航布局', en: 'Top nav' },
    {
      zh: 'Header 放横向 Nav + logo，右侧用户 Avatar，Content 放 Breadcrumb + 骨架卡片。',
      en: 'Header with horizontal Nav + logo, user Avatar on the right, Breadcrumb + skeleton in Content.',
    },
  ),
  entry(
    '07-top-side-nav.svelte',
    { zh: '顶部导航-侧边布局', en: 'Top + side nav' },
    {
      zh: '顶栏横向 Nav + 侧栏纵向 Nav（footer collapseButton）+ 内容区面包屑。',
      en: 'Top horizontal Nav + side vertical Nav (footer collapseButton) + breadcrumb content.',
    },
  ),
  entry(
    '08-side-nav.svelte',
    { zh: '侧边导航', en: 'Side nav' },
    {
      zh: '最外层 Sider 承载纵向 Nav（logo + collapseButton），内层 Layout 含顶栏/内容/页脚。',
      en: 'Outer Sider hosts the vertical Nav (logo + collapseButton); inner Layout holds header/content/footer.',
    },
  ),
];
