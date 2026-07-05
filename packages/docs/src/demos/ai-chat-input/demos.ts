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
  entry('01-basic.svelte', '基础输入', 'tiptap 富文本输入 + Enter 发送，onMessageSend 拿到 MessageContent。'),
  entry('02-generating.svelte', '生成态与停止', 'generating 时发送键变停止键、Enter 不发送，onStopGenerate 中断。'),
  entry('03-hotkey-upload.svelte', '快捷键与附件', "sendHotKey='shift+enter' + round + Upload 附件（onUploadChange）。"),
  entry('04-references.svelte', '引用', 'references 引用条渲染于编辑区上方，可点击/删除（受控）。'),
  entry('05-suggestions.svelte', '建议', '聚焦弹出建议面板，↑↓ 导航 / Enter 选中 / Esc 关闭。'),
  entry('06-skills.svelte', '技能与模版', '按 skillHotKey 唤起技能面板，选中插入 skill-slot 节点；hasTemplate 弹模版。'),
];
