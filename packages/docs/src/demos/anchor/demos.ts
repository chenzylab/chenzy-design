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
  entry('01-basic.svelte', '基本示例', '用 <Anchor.Link> 创建锚点，点击跳转到指定位置（对齐 Semi）'),
  entry(
    '02-comprehensive.svelte',
    '综合使用',
    'getContainer + offsetTop + targetOffset + 嵌套子链接，开箱即用的目录导航（对齐 Semi）',
  ),
  entry('03-size-default.svelte', '尺寸 default', 'size="default"（默认尺寸）'),
  entry('04-size-small.svelte', '尺寸 small', 'size="small" 紧凑锚点'),
  entry('05-rail-primary.svelte', '滑轨主题 primary', 'railTheme="primary"（默认）'),
  entry('06-rail-tertiary.svelte', '滑轨主题 tertiary', 'railTheme="tertiary"'),
  entry('07-rail-muted.svelte', '滑轨主题 muted', 'railTheme="muted" 隐藏滑轨'),
  entry(
    '08-collapse-on.svelte',
    '动态展示 autoCollapse',
    'autoCollapse=true：滚动时仅展开激活路径的子级、折叠其它（对齐 Semi）',
  ),
  entry(
    '09-collapse-off.svelte',
    '动态展示 autoCollapse=false',
    'autoCollapse=false（默认）：始终全展开（对齐 Semi）',
  ),
  entry(
    '10-tooltip.svelte',
    '显示工具提示',
    'showTooltip：Link 超出 maxWidth 时 hover 显示完整文字（对齐 Semi）',
  ),
  entry(
    '11-tooltip-position.svelte',
    '工具提示位置',
    'position 设置 Tooltip 显示位置，仅 showTooltip=true 时生效（对齐 Semi）',
  ),
  entry(
    '12-max-height.svelte',
    'max-height',
    '设置 maxHeight 控制 Anchor 高度，内容超出时 Anchor 自身滚动显示（对齐 Semi）',
  ),
];
