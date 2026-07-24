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
  entry('01-basic.svelte', '基本使用', '通过 loading 切换骨架占位与真实内容，覆盖 Avatar / Image / Title / Paragraph / Button 五种原子形状。'),
  entry('03-image-title.svelte', '组合使用：图片和标题', 'SkeletonImage + SkeletonTitle 组合成图文占位模板。'),
  entry('04-statistic.svelte', '组合使用：统计数字', 'SkeletonParagraph + SkeletonTitle 占位统计数字，loading 切换为真实 Descriptions。'),
  entry('05-avatar-title.svelte', '组合使用：头像和标题', 'SkeletonAvatar + SkeletonTitle 水平组合，loading 切换为真实头像与文案。'),
  entry('06-paragraph-button.svelte', '组合使用：居中段落和按钮', '居中排布的 SkeletonParagraph + SkeletonButton 占位模板。'),
  entry('07-avatar-title-paragraph.svelte', '组合使用：头像、标题和段落', '头像 + 标题 + 多行段落完整占位。'),
  entry('08-table.svelte', '组合使用：表格', '用 SkeletonParagraph 填充表格单元格占位，loading 切换为真实 Table。'),
  entry('02-active.svelte', '加载动画', '通过设置 active 属性可以展示动画效果。'),
];
