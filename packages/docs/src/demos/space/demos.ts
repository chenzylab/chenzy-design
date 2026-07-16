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
  entry(
    '01-basic.svelte',
    '基本用法',
    '默认横向排列，spacing 默认 tight（8px），align 默认 center，为一组相邻子元素施加统一间距。',
  ),
  entry(
    '02-align.svelte',
    '对齐方式',
    'align 控制交叉轴对齐，可选 start / center（默认）/ end / baseline。',
  ),
  entry(
    '03-spacing.svelte',
    '间距尺寸',
    'spacing 内置三档：tight（8px，默认）、medium（16px）、loose（24px）；也支持传入 number 自定义像素，或数组 [水平, 垂直] 同时设置列间距 / 行间距（配合 wrap）。',
  ),
  entry(
    '04-vertical.svelte',
    '间距方向',
    'vertical 设置为竖向排列，此时 wrap 自动失效（竖排无需换行）。',
  ),
  entry(
    '05-wrap.svelte',
    '设置换行',
    '横向排布时 wrap 控制超出容器宽度后自动换行，换行后行间距与列间距由 gap 统一保证一致。',
  ),
];
