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
  entry(
    '08-responsive-sider.svelte',
    { zh: '响应式侧栏', en: 'Responsive sider' },
    {
      zh: 'Sider breakpoint + onBreakpoint：视口跨断点（md）时自动折叠/展开并回调。',
      en: 'Sider breakpoint + onBreakpoint: auto collapse/expand across the md breakpoint with a callback.',
    },
  ),
  entry(
    '09-custom-trigger.svelte',
    { zh: '自定义折叠触发器', en: 'Custom trigger' },
    {
      zh: 'Sider collapsible + 自定义 trigger snippet（接收 collapsed/toggle），用任意组件替代默认箭头。',
      en: 'Sider collapsible + custom trigger snippet (receives collapsed/toggle), any component instead of the default arrow.',
    },
  ),
  entry(
    '10-sticky-scroll.svelte',
    { zh: '吸顶吸底滚动', en: 'Sticky header/footer' },
    {
      zh: 'Header/Footer sticky + height：内容滚动时头尾固定。',
      en: 'Header/Footer sticky + height: header and footer stay fixed while content scrolls.',
    },
  ),
  entry(
    '11-content-padding.svelte',
    { zh: '内容内边距档位', en: 'Content padding' },
    {
      zh: 'Content padding 四档：false=0 / true=token / number=px / string=原样。',
      en: 'Content padding tiers: false=0 / true=token / number=px / string=raw.',
    },
  ),
  entry(
    '12-right-collapsible.svelte',
    { zh: '右置可折叠侧栏', en: 'Right collapsible sider' },
    {
      zh: 'placement="right" + collapsible + reverseArrow：右侧辅助面板可折叠，箭头方向反转。',
      en: 'placement="right" + collapsible + reverseArrow: a collapsible right panel with flipped arrow.',
    },
  ),
  entry(
    '13-dual-sider.svelte',
    { zh: '双侧栏布局', en: 'Dual sider' },
    {
      zh: '左导航 + 中内容 + 右辅助面板：一行内双侧栏。',
      en: 'Left nav + center content + right panel: two siders in one row.',
    },
  ),
  entry(
    '14-fullscreen-app.svelte',
    { zh: '全屏应用布局', en: 'Full-screen app' },
    {
      zh: '固定头/侧/底，仅内容区滚动——典型全屏控制台外壳。',
      en: 'Fixed header/sider/footer with only the content scrolling — a typical full-screen console shell.',
    },
  ),
  entry(
    '15-docs-layout.svelte',
    { zh: '文档站布局', en: 'Docs layout' },
    {
      zh: '顶栏 + 左目录 + 中正文 + 右页内锚点：三栏文档结构，正文独立滚动。',
      en: 'Top bar + left TOC + content + right anchors: a three-column docs layout with its own scroll.',
    },
  ),
  entry(
    '16-zero-width-trigger.svelte',
    { zh: '零宽收起', en: 'Zero-width collapse' },
    {
      zh: 'collapsedWidth={0} 完全收起后，内建零宽浮动触发块逸出侧栏外缘，收起后仍可展开。',
      en: 'With collapsedWidth={0}, a floating zero-width trigger escapes the collapsed sider so it can still be expanded.',
    },
  ),
];
