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
  entry('01-basic.svelte', '基础用法', '点击触发器唤起一组可操作命令项，danger 项高亮为危险色。'),
  entry('02-trigger.svelte', '触发方式', 'trigger 支持 hover 悬浮、click 点击、contextMenu 右键三种唤起方式。'),
  entry('03-position.svelte', '弹出位置', 'position 控制浮层相对触发器的方位，空间不足时自动翻转。'),
  entry('04-nested.svelte', '嵌套子菜单', '菜单项含 children 即展开为子菜单，支持多层嵌套，→ 进入、← / Esc 返回。'),
  entry('05-group.svelte', '分组与分隔', 'type:"group" 分组标题、type:"divider" 分隔符组合出结构化菜单。'),
];
