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
  entry(
    '10-disabled.svelte',
    { zh: '禁用项', en: 'Disabled' },
    {
      zh: 'disabled 覆盖三种粒度：一级项禁用、子导航禁用、子项禁用；禁用项不可点击、不可选中。',
      en: 'disabled at three levels: top-level item, sub-nav, and leaf item; disabled entries are not clickable or selectable.',
    },
  ),
  entry(
    '11-custom-expand-icon.svelte',
    { zh: '自定义展开箭头', en: 'Custom expand icon' },
    {
      zh: 'expandIcon 传入自定义 snippet，替换子导航默认的展开箭头（此处用 IconTriangleDown）。',
      en: 'expandIcon takes a custom snippet to replace the default sub-nav arrow (here IconTriangleDown).',
    },
  ),
  entry(
    '12-link.svelte',
    { zh: '原生链接导航', en: 'Link' },
    {
      zh: '叶子项用 link + linkOptions 渲染为原生 <a href>，头部同样支持 link/linkOptions。',
      en: 'Leaf items render as native <a href> via link + linkOptions; the header supports link/linkOptions too.',
    },
  ),
  entry(
    '13-popup-container.svelte',
    { zh: '浮层挂载容器', en: 'Popup container' },
    {
      zh: 'mode="horizontal" 子导航以浮层弹出，getPopupContainer 指定浮层挂载到自定义容器。',
      en: 'In mode="horizontal" sub-navs pop up; getPopupContainer mounts the popup into a custom container.',
    },
  ),
  entry(
    '14-number-key.svelte',
    { zh: '数字类型 itemKey', en: 'Number itemKey' },
    {
      zh: 'itemKey 使用数字，覆盖 NavKey 的 number 分支；选中/展开回调回写 number 数组。',
      en: 'itemKey uses numbers, exercising the number branch of NavKey; callbacks write back number arrays.',
    },
  ),
  entry(
    '15-collapse-text.svelte',
    { zh: '自定义收起文案', en: 'Collapse text' },
    {
      zh: 'footer.collapseText 按当前收起状态返回不同文案（展开侧栏 / 收起侧栏）。',
      en: 'footer.collapseText returns different labels based on the collapsed state.',
    },
  ),
];
