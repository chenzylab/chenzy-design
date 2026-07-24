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
  entry('01-basic.svelte', '基本用法'),
  entry('02-icon.svelte', '带图标的', '支持标题只显示图标或者同时显示图标和文本。'),
  entry('03-sizes.svelte', '尺寸', '默认为 compact，设置属性为 false 可使图标和文字尺寸增加。'),
  entry('04-separator.svelte', '自定义的分隔符', '默认为 /。'),
  entry(
    '05-tooltip.svelte',
    '截断逻辑',
    '当级别名字溢出设定宽度后省略截断，可通过 showTooltip 设置相关参数。',
  ),
  entry('06-collapse.svelte', '超长折叠', '层级超过 4 个级别时中间省略，点击省略号展开显示全部级别。'),
  entry(
    '07-more-type.svelte',
    '自定义省略号区域',
    'moreType 可选 default / popover，控制内置省略号区域的渲染类型。',
  ),
  entry('08-render-more.svelte', 'renderMore', '使用 renderMore() 为省略号区域自定义其他形式的渲染。'),
  entry(
    '09-route-object.svelte',
    '路由对象',
    'routes 支持传入路由对象 { name, path, href, icon } 或字符串组成的数组。',
  ),
];
