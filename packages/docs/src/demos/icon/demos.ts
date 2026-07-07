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
  entry('01-basic.svelte', '尺寸', '支持 extra-small / small / default / large / extra-large 五个枚举尺寸，也可传数字直接指定 px。'),
  entry('02-color-spin.svelte', '语义色与旋转', '通过 status 应用预设语义色；spin 属性使图标持续旋转，受 reduced-motion 抑制。'),
  entry('03-color.svelte', '颜色', '单色图标自动继承外层容器 color；也可通过 color prop 显式覆盖（优先级高于 status）。'),
  entry('04-rotate.svelte', '静态旋转', 'rotate 设置静态旋转角度（deg），不同于 spin 的持续动画。'),
  entry('05-source-a11y.svelte', '自定义源与无障碍', 'svg 字符串作渲染源（来源须可信）；提供 label 后 role=img + aria-label，供屏幕阅读器读出。'),
];
