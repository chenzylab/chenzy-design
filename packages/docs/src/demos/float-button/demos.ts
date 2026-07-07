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
  entry('01-basic.svelte', '基础悬浮按钮', '单个悬浮按钮，icon-only 需提供 ariaLabel，经 style 逻辑属性定位'),
  entry('02-badge.svelte', '带徽章', '传入 badge 参数时外层包裹 Badge，可访问名并入按钮 label'),
  entry('03-colorful.svelte', 'colorful 多彩', 'AI 风格品牌蓝→紫渐变外观'),
  entry('04-shape-size.svelte', '形状与尺寸', 'round=正圆 / square=方形 两形状 × small/default/large 三尺寸'),
  entry('08-custom-shape.svelte', '自定义圆角', 'shape 接受任意 border-radius 字符串（8px / 30% 等），本库相较 Semi 额外提供'),
  entry('05-href.svelte', 'href 链接', '有 href 渲染原生链接；target=_blank 自动补 rel=noopener noreferrer'),
  entry('06-group.svelte', 'Group 平铺', 'FloatButtonGroup 平铺一组，事件委托回传被点项 value'),
  entry('07-back-to-top.svelte', '回到顶部 recipe', '用 FloatButton 作回到顶部底座（仅需滚动监听时优先用 BackTop）'),
];
