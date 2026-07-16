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
    '01-basic.svelte',
    { zh: '基本使用', en: 'Basic usage' },
    {
      zh: '传入 items 快速得到导航栏：header 定义 logo 头部、footer.collapseButton 开启底部收起按钮。子导航用 string[] 简写。',
      en: 'Pass items to get a nav quickly: header defines the logo, footer.collapseButton enables the collapse button. Sub-nav uses string[] shorthand.',
    },
  ),
  entry(
    '02-style.svelte',
    { zh: '导航样式定义', en: 'Style & bodyStyle' },
    {
      zh: 'style 定外层高度、bodyStyle 定列表区高度：头部/底部固定，中间列表可滚动。',
      en: 'style sets the outer height and bodyStyle the list height: fixed header/footer with a scrollable list.',
    },
  ),
  entry(
    '03-declarative.svelte',
    { zh: 'JSX 写法', en: 'Declarative (JSX)' },
    {
      zh: '声明式 <Nav.Item> / <Nav.Sub> 子组件定义导航树，替代 items 数据驱动。',
      en: 'Declarative <Nav.Item> / <Nav.Sub> children instead of data-driven items.',
    },
  ),
  entry(
    '04-router.svelte',
    { zh: '配合路由', en: 'With router' },
    {
      zh: 'renderWrapper 在每个导航项外包一层自定义组件（如路由库的 Link），点击触发路由跳转。',
      en: 'renderWrapper wraps each item in a custom component (e.g. a router Link) to trigger navigation.',
    },
  ),
  entry(
    '05-vertical.svelte',
    { zh: '垂直布局', en: 'Vertical' },
    {
      zh: '默认 mode="vertical"：侧边导航，子导航内联展开，底部可收起。',
      en: 'Default mode="vertical": side nav with inline sub-nav expansion and a collapsible footer.',
    },
  ),
  entry(
    '06-horizontal.svelte',
    { zh: '水平布局', en: 'Horizontal' },
    {
      zh: 'mode="horizontal"：顶部导航，子导航 hover 弹出浮层。',
      en: 'mode="horizontal": top nav with hover popup sub-nav.',
    },
  ),
  entry(
    '07-toggle-icon.svelte',
    { zh: '展开收起箭头位置', en: 'Toggle icon position' },
    {
      zh: 'toggleIconPosition="left" 将子导航展开箭头置于文案前（默认 "right"）。',
      en: 'toggleIconPosition="left" moves the sub-nav arrow before the text (default "right").',
    },
  ),
  entry(
    '08-indent.svelte',
    { zh: '导航缩进', en: 'Indent' },
    {
      zh: '默认仅一级导航缩进；limitIndent=false 时多级导航按层级逐级缩进（仅垂直生效）。',
      en: 'By default only the first level indents; limitIndent=false indents each nested level (vertical only).',
    },
  ),
  entry(
    '09-uncontrolled.svelte',
    { zh: '非受控属性', en: 'Uncontrolled' },
    {
      zh: 'defaultSelectedKeys / defaultOpenKeys 仅设初值，之后由组件内部维护状态。',
      en: 'defaultSelectedKeys / defaultOpenKeys set initial state only; the component manages it thereafter.',
    },
  ),
  entry(
    '10-controlled.svelte',
    { zh: '受控属性', en: 'Controlled' },
    {
      zh: 'selectedKeys / openKeys / isCollapsed 全受控，配合 onSelect / onOpenChange / onCollapseChange 回写。',
      en: 'Fully controlled selectedKeys / openKeys / isCollapsed with matching callbacks.',
    },
  ),
];
