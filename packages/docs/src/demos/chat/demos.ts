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
  entry('01-basic.svelte', '基本用法', 'chats + roleConfig，onMessageSend 里追加用户与助手消息。'),
  entry('02-status.svelte', '消息状态', 'status 支持 loading / incomplete / complete / error。'),
  entry(
    '03-dynamic.svelte',
    '动态更新数据',
    '发送后先插入 loading 消息，模拟异步回复后原地更新为完整内容。',
  ),
  entry('04-clear-context.svelte', '清除上下文', 'showClearContext 展示清除按钮，点击在末尾追加分割线。'),
  entry(
    '05-custom-render.svelte',
    '自定义渲染会话框',
    'renderChatBoxAvatar / Title / Content / Action 分别覆盖头像、标题、内容、操作区。',
  ),
  entry(
    '06-full-chatbox.svelte',
    '完全自定义会话框',
    'renderFullChatBox 提供拆分节点（avatar/title/content/action），自由组合整条消息布局。',
  ),
  entry(
    '07-custom-input.svelte',
    '自定义渲染输入框',
    'renderInputArea 包裹默认输入区（defaultNode）或用 detailProps 拆分节点自由组合。',
  ),
  entry('08-hints.svelte', '提示信息', 'hints 提供快捷提问，点击触发 onHintClick。'),
  entry(
    '09-custom-hint.svelte',
    '自定义提示信息渲染',
    'renderHintBox 自定义每个提示项的渲染（content / index / onHintClick）。',
  ),
];
