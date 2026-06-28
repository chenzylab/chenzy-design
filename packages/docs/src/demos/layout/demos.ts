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
  entry('01-basic.svelte', '基础布局', 'Layout 根容器配合 Header / Sider / Content / Footer 子组件构成完整页面框架，hasSider 自动切换为横向排列。'),
  entry('02-header-content-footer.svelte', '上中下结构', 'Header / Content / Footer 纵向三段式：Content 用 padding 撑出内边距，自动占满中间空间。'),
  entry('03-sidebar.svelte', '含侧边栏', '通过嵌套 Layout hasSider 引入 Sider，width 设定固定侧栏宽度，Content 占据剩余空间。'),
  entry('04-collapsible-sider.svelte', '可折叠侧边栏', 'Sider collapsible 启用内置折叠触发器，collapsed + onCollapse 受控驱动折叠态与内容切换。'),
  entry('05-admin-fixed.svelte', '后台固定布局', '典型后台框架：左侧固定 Sider，右侧 Header sticky 固定，主内容区独立滚动，Footer 贴底。'),
];
