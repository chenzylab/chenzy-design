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
  entry('01-basic.svelte', '基本用法', '最简单的加载指示器。'),
  entry('02-size.svelte', '尺寸', '组件定义了三种尺寸：large、middle（默认）、small。'),
  entry(
    '03-tip.svelte',
    '带文字的',
    '通过 tip 属性可设置当 Spin 用作包裹元素时的文字。',
  ),
  entry(
    '04-indicator.svelte',
    '自定义指示符',
    '通过设置 indicator 属性自定义 Spin 的指示符样式。',
  ),
  entry(
    '05-delay.svelte',
    '延迟显示',
    '通过 delay 设置延迟显示 loading 的效果；是否处于 loading 由传入的 spinning 决定，为受控属性。',
  ),
];
