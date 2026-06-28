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
  entry('01-basic.svelte', '基础标签输入', '回车或逗号添加标签，退格删除末项'),
  entry('02-separator-max.svelte', '分隔符与数量上限', '多分隔符批量添加，max 限制数量，onExceed 提示'),
  entry('03-no-duplicates.svelte', '不允许重复', 'allowDuplicates=false 时重复标签被忽略'),
  entry('04-render-tag.svelte', '自定义标签渲染', 'renderTagItem 完全接管标签外观'),
  entry('05-size-blur-disabled.svelte', '尺寸 / 失焦添加 / 禁用', 'size、addOnBlur、showClear 与 disabled'),
];
