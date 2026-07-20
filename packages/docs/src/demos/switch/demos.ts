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

// 章节顺序逐字对齐 Semi 官网（semi.design/zh-CN/input/switch）：
//   基本 → 尺寸 → 不可用 → 带文本(内嵌+外部) → 受控组件 → 加载中。
export const demos: DemoEntry[] = [
  entry('01-basic.svelte', '基本', '通过 onChange 监听状态变化，通过 defaultChecked 或受控的 checked 指定选中状态。'),
  entry('02-size.svelte', '尺寸', '通过 size 指定尺寸（large / default / small）。'),
  entry('03-disabled.svelte', '不可用', 'disabled 禁用开关。'),
  entry('04-text.svelte', '带文本', '通过 checkedText / uncheckedText 设置开关文本（size=small 时无效）。'),
  entry('05-text-outside.svelte', '带文本（外部）', '相比内嵌文本，更推荐将文本说明放置在 Switch 外部。'),
  entry('06-controlled.svelte', '受控组件', '组件是否选中完全取决于传入的 checked 值，配合 onChange 回调使用。'),
  entry('07-loading.svelte', '加载中', '通过设置 loading 开启加载中状态。'),
];
