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
  entry('01-basic.svelte', '基础尺寸观察', '通过 slot 实时获取容器宽高，拖拽可调整'),
  entry(
    '02-resize-state.svelte',
    '调整中 / 调整完成',
    'onResizeStart / onResizeEnd 边界事件：拖拽时显示“调整中”，静默后提交结果',
  ),
  entry(
    '03-responsive-layout.svelte',
    '响应式切换布局',
    '按容器宽度断点在纵向堆叠与横向并排之间切换',
  ),
  entry(
    '04-multiple-targets.svelte',
    '多目标观测',
    'multiple 模式同时监听多个子元素，onResize 按 target 路由各自尺寸',
  ),
];
