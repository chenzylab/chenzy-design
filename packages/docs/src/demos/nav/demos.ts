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
  entry(
    '03-declarative.svelte',
    { zh: '声明式写法', en: 'Declarative' },
    {
      zh: 'JSX 式 <Nav.Item> / <Nav.Sub> 子组件声明导航树，替代 items 数据驱动。',
      en: 'Declarative <Nav.Item> / <Nav.Sub> children instead of data-driven items.',
    },
  ),
  entry(
    '04-toggle-indent.svelte',
    { zh: '箭头位置与多级缩进', en: 'Toggle icon & indent' },
    {
      zh: 'toggleIconPosition="left" 箭头置于文案前；limitIndent=false 时多级导航按层级缩进。',
      en: 'toggleIconPosition="left" moves the arrow before text; limitIndent=false indents each nested level.',
    },
  ),
  entry(
    '05-controlled.svelte',
    { zh: '受控属性', en: 'Controlled' },
    {
      zh: 'selectedKeys / openKeys / isCollapsed 全受控，配合 onSelect / onOpenChange / onCollapseChange 回写。',
      en: 'Fully controlled selectedKeys / openKeys / isCollapsed with matching callbacks.',
    },
  ),
  entry(
    '06-multiple.svelte',
    { zh: '多选', en: 'Multiple' },
    {
      zh: 'multiple 多选：点击叠加选中，再次点击取消（onDeselect）。',
      en: 'multiple mode: click to accumulate selection, click again to deselect (onDeselect).',
    },
  ),
  entry(
    '07-body-scroll.svelte',
    { zh: '导航样式定义', en: 'Style & bodyStyle' },
    {
      zh: 'style 定外层高度、bodyStyle 定列表区高度：头部/底部固定，中间列表可滚动。',
      en: 'style sets the outer height and bodyStyle the list height: fixed header/footer with a scrollable list.',
    },
  ),
  entry(
    '08-render-wrapper.svelte',
    { zh: '配合路由', en: 'With router' },
    {
      zh: 'renderWrapper 在每个导航项外包一层自定义组件（如路由库的 Link），点击触发路由跳转。',
      en: 'renderWrapper wraps each item in a custom component (e.g. a router Link) to trigger navigation.',
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
];
