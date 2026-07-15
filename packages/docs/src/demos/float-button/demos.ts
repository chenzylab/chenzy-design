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
  entry('01-basic.svelte', '基础悬浮按钮', '单个悬浮按钮（纯 div + onClick，对齐 Semi），经 style 覆盖定位'),
  entry('02-size.svelte', '尺寸', 'small / default / large 三档（24 / 32 / 40px）'),
  entry('03-shape.svelte', '形状', 'round=正圆（默认）/ square=方形（8px 圆角）'),
  entry('04-href.svelte', 'href 跳转', '有 href 时点击经 JS 跳转；target=_blank 用 window.open（对齐 Semi）'),
  entry('05-colorful.svelte', 'colorful 多彩', 'AI 风格多彩渐变外观（白字压 AI 渐变）'),
  entry('06-badge.svelte', '带徽章', '传入 badge 参数时 body 外层包裹 Badge，贴形状切点定位'),
  entry('07-group.svelte', 'Group 胶囊工具条', 'FloatButtonGroup 圆角条内横排多项，点击委托直接读 e.target.dataset.value 回传（对齐 Semi）'),
];
