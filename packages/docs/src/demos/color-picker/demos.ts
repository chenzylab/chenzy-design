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
  entry('01-popover.svelte', '放在弹层', 'usePopover 放入 Popover 渲染，children 可自定义 trigger。'),
  entry('02-inline.svelte', '正常展示', '默认直接内联渲染选色面板。'),
  entry('03-eye-dropper.svelte', '滴管取色器', 'eyeDropper 开启滴管功能，支持从浏览器内或外部软件屏幕取色。'),
  entry('04-default-value.svelte', '默认值', 'colorStringToValue 把常见颜色字符串转成 ColorValue 三态对象。'),
  entry('05-controlled.svelte', '受控', '通过传入 value 来受控使用。'),
  entry('06-slots.svelte', '顶部和底部渲染额外元素', 'topSlot / bottomSlot 在顶部和底部渲染额外元素。'),
];
