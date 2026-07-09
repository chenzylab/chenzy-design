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
  entry('01-basic.svelte', '基础用法', '通过 routes 数组配置面包屑路径，href 字段渲染为链接，末项为当前页不加链接。'),
  entry('02-separator.svelte', '自定义分隔符', '用 separator 替换默认的 "/"，可传入任意字符串（如 >、·、→）。'),
  entry('03-icon.svelte', '带图标', '声明式 <Breadcrumb.Item> 通过 icon snippet 在文本前渲染前置图标。'),
  entry('04-routes-active.svelte', '数据驱动与选中', 'routes 数据驱动渲染，配合 onClick 与受控 activeIndex 高亮当前选中项。'),
  entry('05-collapse.svelte', '超长折叠', 'maxItemCount（默认 4）超出时中间折叠为三点图标；moreType 控制展开方式：default 点击就地展开，popover 悬浮弹出可点击菜单。'),
  entry('06-tooltip.svelte', '截断与 Tooltip', 'showTooltip 令超长项截断，hover 显示完整名；对象配置 width（截断宽度）与 ellipsisPos（end 末尾省略 / middle 中间省略）。'),
];
