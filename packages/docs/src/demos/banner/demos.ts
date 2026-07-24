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
    '横幅常驻，需用户主动关闭；onClose 回调可用于同步外部显隐状态。',
  ),
  entry('02-type.svelte', '不同类型', '支持 4 种类型：info / warning / danger / success，默认为 info。'),
  entry(
    '03-full-mode.svelte',
    '非全屏模式',
    '设置 fullMode={false} 使用非全屏模式；bordered 显示边框，icon / closeIcon 传 null 隐藏图标与关闭按钮。',
  ),
  entry(
    '04-custom-content.svelte',
    '自定义内容',
    '可以通过 children 自定义其他渲染内容。',
  ),
];
