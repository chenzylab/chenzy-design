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
  entry('01-basic.svelte', '基础用法', '四种通知类型：success / info / warning / error，支持常驻（duration: 0）。'),
  entry('02-placement.svelte', '弹出位置', '通过 placement 在六个方位弹出：topLeft / top / topRight / bottomLeft / bottom / bottomRight。'),
  entry('03-duration.svelte', '自动关闭与进度条', 'duration 控制自动关闭秒数（0 为常驻），showProgress 显示倒计时进度条，pauseOnHover 控制悬停是否暂停。'),
  entry('04-footer.svelte', '带操作按钮', '通过 footer 传入 Snippet 渲染底部操作区，可放置「接受 / 忽略」等操作按钮。'),
  entry('05-update.svelte', '原地更新与深色主题', 'notification.update(id) 按 id 原地更新同一条通知（如上传进度），theme: dark 渲染深色卡片。'),
];
