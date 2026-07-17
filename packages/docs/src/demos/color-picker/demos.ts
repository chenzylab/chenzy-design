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
  entry('01-basic.svelte', '基础颜色选择', 'usePopover 弹出触发与默认 inline 内联模式；值为 ColorValue 对象。'),
  entry('03-alpha.svelte', '透明度 Alpha', 'alpha 开启时显示透明度滑条 + 百分比数字输入，关闭则强制不透明。'),
  entry('06-eye-dropper.svelte', '滴管取色', 'eyeDropper 开启浏览器吸管，从屏幕任意位置取色（需安全上下文，不支持时自动隐藏）。'),
  entry('07-slots.svelte', '顶部/底部插槽', 'topSlot / bottomSlot 在面板顶部、底部渲染额外内容。'),
  entry('08-custom-trigger.svelte', '自定义触发器', 'usePopover 浮层模式下用 children 自定义触发器，替换默认色块。'),
  entry('09-controlled.svelte', '受控', '外部持有 ColorValue 配合 onChange，按钮编程式设置颜色。'),
];
