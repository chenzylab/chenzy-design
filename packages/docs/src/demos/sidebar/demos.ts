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
  entry('01-basic-container.svelte', '基础容器', 'SideBarContainer 贴右浮层壳：role=dialog + focus-trap + Esc 关闭'),
  entry('02-resizable.svelte', '可伸缩', '左边缘拖拽调宽（复用 Resizable createResizeDrag + 键盘 ←→/Home/End）'),
  entry('03-main-options.svelte', '主视图 Options 切换', 'SideBar mode=main + 顶部 Options 图标 tab 组（roving tabindex）'),
  entry('04-detail-back.svelte', '详情返回', 'mode 路由 main↔detail，详情返回按钮 onBackWard（可异步）'),
  entry('05-annotation.svelte', '参考来源溯源', 'SideBarAnnotation：Collapse 分组折叠 + video/text 引用卡片（可点击打开来源，时长/序号本地化）'),
  entry('05-code-content.svelte', '代码/JSON 预览', 'SideBarCodeContent 折叠列表：isJson 用 JsonViewer，否则 CodeHighlight；onExpand 全屏回调'),
];
