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
  entry('01-basic.svelte', '基础拖动', '包裹子元素即可拖动到任意位置（无约束）'),
  entry('02-constrainer.svelte', '约束在父容器', 'constrainer="parent"，clamp 到父元素边界内'),
  entry('03-handler.svelte', 'handler 指定把手', '仅标题栏可发起拖拽（Modal 可拖拽标题栏 recipe）'),
  entry('04-custom-move.svelte', '自定义拖动后的位置处理', 'customMove 后组件不写 top/left，由回调自定义应用位置（这里用 transform 平移）'),
];
