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
  entry('01-popup.svelte', 'Popup 分步高亮', '气泡模式逐个高亮目标元素，配合标题与描述引导用户操作'),
  entry('02-modal.svelte', 'Modal 图文引导', '居中弹窗模式，支持封面图 + 图文说明与底部指示点'),
  entry('03-controlled.svelte', '受控当前步骤', '通过 current + onChange 由外部状态托管当前步骤'),
  entry('04-no-mask.svelte', '无遮罩轻提示', 'mask={false} 只做轻量高亮，不遮挡背景内容'),
  entry('05-primary.svelte', 'Primary 主题', 'theme="primary" 让气泡与高亮采用品牌色调'),
  entry('06-custom-text.svelte', '自定义按钮', '定制 finishText 与 next/prev 按钮的外观与文案'),
];
