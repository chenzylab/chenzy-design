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
    '03-spacing-preset.svelte',
    '间距尺寸',
    'spacing 内置三档：tight（8px，默认）、medium（16px）、loose（24px），映射全局间距 token。',
  ),
  entry(
    '04-spacing-custom.svelte',
    '自定义间距',
    'spacing 支持传入 number 自定义像素，或数组 [水平, 垂直] 分别控制列间距 / 行间距（配合 wrap）。',
  ),
  entry(
    '05-vertical.svelte',
    '垂直方向',
    'vertical 设置为竖向排列，此时 wrap 自动失效（竖排无需换行）。',
  ),
  entry(
    '06-wrap.svelte',
    '自动换行',
    '横向排布时 wrap 控制超出容器宽度后自动换行，换行后行间距与列间距由 gap 统一保证一致。',
  ),
  entry(
    '07-block-tag.svelte',
    '块级与语义标签',
    'block 让容器占满父宽（display:flex 而非 inline-flex）；tag 自定义根元素标签（如 nav / ul），均为对 Semi 的能力扩展。',
  ),
];
