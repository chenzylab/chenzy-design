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
  entry('01-basic.svelte', '基础轮播', '受控轮播，点击箭头或指示器切换幻灯片'),
  entry('02-autoplay.svelte', '自动播放与间隔', 'autoPlay 对象形式设置 interval 与 hoverToPause，悬停暂停'),
  entry('03-indicator.svelte', '指示器样式与位置', '切换 indicatorType（dot/line/columnar）与 indicatorPosition'),
  entry('04-arrow.svelte', '箭头控制', 'showArrow 配合 arrowType（hover 悬停显示 / always 始终显示）'),
  entry('05-fade.svelte', '切换效果与自定义内容', 'animation="fade" 渐隐切换，arrowProps 自定义箭头，幻灯片放任意内容'),
];
