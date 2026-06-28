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
  entry('01-theme.svelte', '局部暗色主题', '通过 wrap + theme="dark" 在子树内建立独立暗色作用域，内部所有 token 自动切换，不影响全局。'),
  entry('02-reduced-motion.svelte', '全局动画降级', '显式开启 reducedMotion 写全局 data-reduced-motion 标记，令依赖 motion-duration token 的库内动画退化为 0ms。'),
  entry('03-direction.svelte', 'RTL 方向作用域', 'wrap + dir 在包裹元素上写 dir 属性建立方向作用域，内部组件随之镜像布局，可在 ltr / rtl 间切换。'),
  entry('04-popup-container.svelte', '统一弹层容器', 'getPopupContainer 经 context 提供全局默认浮层容器，Dropdown 等浮层未传自身 prop 时统一 portal 到此宿主。'),
];
