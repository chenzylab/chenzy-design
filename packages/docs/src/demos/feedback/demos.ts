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
  entry('01-emoji.svelte', 'emoji 满意度', 'type=emoji：表情评分行（role=radiogroup），方向键选择。'),
  entry('02-text.svelte', '文本反馈', 'type=text：TextArea 收集文字，textAreaProps 透传字数统计等。'),
  entry('03-radio.svelte', '单选原因', 'type=radio：options 提供单选项，收集单一原因。'),
  entry('04-checkbox.svelte', '多选亮点', 'type=checkbox：options 提供多选项，收集多个标签。'),
  entry('05-popup.svelte', '抽屉形态', 'mode=popup：以 SideSheet 抽屉呈现；onOk 异步提交时按钮 loading。'),
  entry('06-custom.svelte', '自定义内容', 'type=custom：renderContent 自绘内容区（如内嵌星级评分）。'),
];
