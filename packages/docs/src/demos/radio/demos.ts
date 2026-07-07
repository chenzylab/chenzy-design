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
  entry('01-basic.svelte', '基础用法', '单个单选框，通过 checked 与 onChange 控制状态，支持禁用。'),
  entry('02-group.svelte', '单选框组', 'RadioGroup 以数据驱动渲染多个单选项，onChange 返回选中值。'),
  entry('03-button.svelte', '按钮形态', '设置 type="button" 渲染为按钮组形态，常用于切换视图或筛选。'),
  entry('04-extra-disabled.svelte', '辅助文本与禁用', 'extra 副文本（仅 type=default 生效），disabled 禁用（含默认选中的禁用态）。'),
  entry('05-advanced.svelte', '高级模式', 'mode="advanced" 允许已选中项再次点击取消选择。'),
  entry('06-direction.svelte', '排列方向', 'direction 控制组内 horizontal（默认）/ vertical 排列。'),
  entry('07-card.svelte', '卡片形态', 'type="card" 带背景卡片，type="pureCard" 无 radio 的纯卡片，配合 extra 副文本。'),
  entry('08-button-size.svelte', '按钮尺寸', 'buttonSize 控制 type="button" 的 small / middle / large 三种尺寸。'),
];
