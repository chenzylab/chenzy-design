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
  entry('01-basic.svelte', '基础用法', '通过 imageSlot 传入插画节点，darkModeImageSlot 提供暗色适配；插画默认 150×150。'),
  entry('02-custom.svelte', '自定义', '通过 children 添加动作按钮，引导用户下一步行动。'),
  entry('03-no-image.svelte', '不使用图片', '不传插画时 title 降为 heading=6 + 常规字重，仅呈现文案。'),
  entry('04-layout.svelte', '不同布局', 'layout="horizontal" 插画在左、文案在右，适合长描述文本。'),
  entry('05-illustrations.svelte', '占位图插画', '内置 8 类扁平插画（含亮/暗两套），覆盖成功 / 失败 / 无权限 / 无内容 / 404 / 无结果 / 建设中 / 神游。'),
];
