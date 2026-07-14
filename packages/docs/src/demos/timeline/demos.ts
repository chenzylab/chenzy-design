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
  entry('01-basic.svelte', '基本用法', '在 children 内写 <Timeline.Item>，通过 time 设置时间文本。'),
  entry(
    '02-type.svelte',
    '节点类型',
    '通过 type 设置节点类型，对应圆点变为相应颜色，可选：default / ongoing / success / warning / error。',
  ),
  entry(
    '03-custom-node.svelte',
    '自定义节点',
    '通过 dot 自定义图标、color 自定义圆点色值；通过设置 children 样式可自定义节点样式。',
  ),
  entry('04-mode-left.svelte', '时间轴在左侧（默认）', '通过 mode="left" 时间轴与内容排在左侧（默认）。'),
  entry('05-mode-center.svelte', '时间节点居中', '通过 mode="center" 时间轴居中、时间文本在轴另一侧。'),
  entry('06-mode-alternate.svelte', '交替展现', '通过 mode="alternate" 节点内容左右交替排列。'),
  entry('07-mode-right.svelte', '时间轴在右侧', '通过 mode="right" 时间轴与内容排在右侧。'),
  entry(
    '08-datasource.svelte',
    '使用 dataSource',
    '传入 dataSource 数组数据驱动，支持 content 属性及 Timeline.Item 的所有属性；content/dot 可为字符串或 Snippet。',
  ),
  entry(
    '09-clickable.svelte',
    '可点击节点',
    '通过 Timeline.Item 的 onClick 监听节点点击（Semi 无此 demo，补全交互场景）。',
  ),
  entry(
    '10-aria-label.svelte',
    '无障碍标签',
    '通过 aria-label 为时间轴整体设置标签，圆点与连线均 aria-hidden（Semi 无此 demo，补全可访问性场景）。',
  ),
];
