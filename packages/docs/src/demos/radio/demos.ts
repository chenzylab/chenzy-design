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
  entry('01-basic.svelte', '基本用法', '单个单选框的基础用法。'),
  entry('02-extra.svelte', '带辅助文本', '通过 extra 设置辅助文本，可以是任意类型的内容。'),
  entry('03-disabled.svelte', '禁用', 'disabled 禁用单选框，含默认选中的禁用态。'),
  entry('04-advanced.svelte', '高级模式', 'mode="advanced" 允许已选中项再次点击取消选择。'),
  entry('05-group.svelte', '单选组合', '一组互斥的 Radio 配合使用，onChange 返回选中值。'),
  entry('06-direction.svelte', '垂直排列', 'direction 控制组内 horizontal（默认）/ vertical 排列（仅 type=default 生效）。'),
  entry('07-button.svelte', '按钮样式', 'type="button" 渲染按钮样式单选器，buttonSize 支持 small / middle / large 三种尺寸。'),
  entry('08-card.svelte', '卡片样式', 'type="card" 实现带有背景的卡片样式。'),
  entry('09-pure-card.svelte', '无 radio 的纯卡片样式', 'type="pureCard" 实现带有背景且无 radio 的纯卡片样式。'),
  entry('10-options.svelte', '配置 options', '通过配置 options 参数来渲染单选框。'),
];
