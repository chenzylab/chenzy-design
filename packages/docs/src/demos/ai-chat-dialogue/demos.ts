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
  entry('01-basic.svelte', '基础用法', 'chats（OpenAI 消息格式）+ roleConfig，逐条渲染。'),
  entry('05-message-status.svelte', '消息状态', 'status 对应三种样式：成功(completed) / 请求中(in_progress) / 失败(failed)。'),
  entry('02-content-items.svelte', '消息展示', 'ContentItem 分块：思考(reasoning) / 正文 / 工具调用(function_call)。'),
  entry('06-references.svelte', '引用', 'message.references + showReference 在 user 消息展示引用，onReferenceClick 回调。'),
  entry('07-select.svelte', '选择', 'selecting 开启选择模式，onSelect 返回选中 id；selectAll / deselectAll ref 方法。'),
  entry('08-hints.svelte', '提示', 'hints 底部提示区，点击某项触发 onHintClick 成为新的用户输入。'),
  entry('09-render-hint.svelte', '自定义渲染提示', 'renderHintBox 自定义提示项渲染（content / index / onHintClick）。'),
  entry('11-render-dialogue.svelte', '自定义渲染会话框', 'dialogueRenderConfig 覆盖头像 / 标题 / 内容 / 操作各区块，或整块自定义。'),
  entry('10-render-content.svelte', '自定义渲染消息', 'renderDialogueContentItem 按 ContentItem.type 覆盖内容块渲染。'),
  entry('03-adapter.svelte', '消息数据转换', 'responseToMessage / chatCompletionToMessage 把 OpenAI 返回转成 Message。'),
  entry('12-streaming-adapter.svelte', '流式数据转换', 'streamingResponseToMessage 逐块增量归约，实现流式输出。'),
  entry('04-message-edit.svelte', '消息编辑', 'user 消息编辑按钮 → editing 态用 AIChatInput 编辑器替代内容（messageEditRender），发送保存。'),
];
