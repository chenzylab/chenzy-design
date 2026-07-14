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
  entry('01-basic.svelte', '普通通知', '最基本的用法，3s 后自动关闭。'),
  entry('02-placement.svelte', '不同位置弹出', '可以从六个不同位置弹出：默认右上角 topRight，可选 top / bottom / topLeft / topRight / bottomLeft / bottomRight。'),
  entry('03-icon.svelte', '带有图标的通知', '成功、失败、警告、提示四种类型内置图标，也可通过 icon 传入自定义图标。'),
  entry('04-theme.svelte', '多色样式', '使用 theme=light 设置浅色填充样式提高与界面的对比，默认为 normal 的白色模式。'),
  entry('05-link.svelte', '链接文本', 'content 传入 Snippet 可自定义操作区链接文本，用来配合更复杂的场景。'),
  entry('06-duration.svelte', '修改延时', '自定义时长 10s，默认时长为 3s。'),
  entry('07-manual-close.svelte', '手动关闭', '设置 duration 为 0 时通知不会自动关闭，只能通过 notification.close(id) 手动关闭。'),
  entry('08-update.svelte', '更新内容', '可以通过唯一的 id 来更新已展示通知的内容。'),
  entry('09-hook.svelte', 'Hook 用法', 'useNotification() 返回 [api, holderStore]，将 holderStore 传给 <NotificationHolder> 渲染在组件树内，使通知继承该处上下文（如 LocaleProvider）。'),
];
