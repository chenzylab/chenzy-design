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
  entry('01-basic.svelte', '基本用法', 'render 用 Dropdown.Menu 组合 Title / Item / Divider；Item 支持 icon、disabled、type 五色。'),
  entry('02-nested.svelte', '嵌套使用', '在 render 内手动嵌套 <Dropdown>，其 children 为 Dropdown.Item 作子菜单触发器。'),
  entry('03-position.svelte', '弹出位置', 'position 支持 12 方位，语义对齐 Semi（bottomStart≈bottomLeft），空间不足时自动翻转。'),
  entry('04-trigger.svelte', '触发方式', 'trigger 支持 hover 悬浮、focus 聚焦、click 点击、contextMenu 右键四种唤起方式。'),
  entry('05-events.svelte', '触发事件', '菜单项支持 onClick / onMouseEnter / onMouseLeave / onContextMenu 四类鼠标事件。'),
  entry('06-menu-json.svelte', 'JSON 用法', '通过 menu 属性传入 JSON Array 快速配置下拉框；showTick 时 active 项左侧显示对勾。'),
];
