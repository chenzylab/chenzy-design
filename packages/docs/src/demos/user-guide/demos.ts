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
  entry('01-basic.svelte', '基本用法', 'popup 气泡模式逐个高亮目标元素，配合标题与描述引导用户操作'),
  entry('02-theme.svelte', '主题', 'popup 气泡卡片提供 default 与 primary 两种主题，通过 theme 设置'),
  entry('03-position.svelte', '气泡卡片弹出位置', 'popup 提供 12 种弹出位置，可通过 showArrow 设置是否显示箭头'),
  entry('04-padding.svelte', '设置高亮区域大小', '通过 spotlightPadding 设置高亮区域内边距，支持 step 级覆盖'),
  entry('05-custom-button.svelte', '定制按钮', '通过 nextButtonProps / prevButtonProps 与 finishText 定制按钮样式与文案'),
  entry('06-controlled.svelte', '受控', '通过 current + onChange 由外部状态托管当前引导步骤'),
  entry('07-modal.svelte', '弹窗式引导', 'mode="modal" 开启居中弹窗式图文引导，含封面图与底部圆点指示器'),
  entry('08-no-mask.svelte', '无遮罩', 'mask={false} 开启无遮罩引导，不遮挡背景内容'),
];
