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
  entry('01-basic.svelte', '基础卡片', '基础卡片包含标题、内容等部分。'),
  entry('02-simple.svelte', '简洁卡片', '卡片可以只设置内容区域。'),
  entry('03-cover.svelte', '封面', '可以使用 cover 属性设置封面。'),
  entry('04-border.svelte', '边线和外边框', 'bordered 控制外边框，headerLine / footerLine 控制头/尾分隔线。'),
  entry('05-shadow.svelte', '阴影', 'shadows 设置阴影时机：hover（悬停显示）、always（始终显示）。'),
  entry('06-meta.svelte', '更灵活的内容展示', '用 Card.Meta 承载 title / avatar / description。'),
  entry('07-inner.svelte', '内部卡片', '卡片内部可以嵌套其他卡片。'),
  entry('08-in-grid.svelte', '栅格卡片', '在系统概览页面常常和栅格进行配合。'),
  entry('09-loading.svelte', '内置预加载', 'loading 为 true 时内容区显示骨架占位。'),
  entry('10-skeleton.svelte', '更丰富的预加载效果', '结合 Skeleton 自定义头部、封面等更丰富的预加载。'),
  entry('11-tabs.svelte', '带页签的卡片', '可以结合 Tabs 组件，实现带页签的卡片。'),
  entry('12-actions.svelte', '卡片操作区', 'actions 位于内容区底部，以 12px 水平间距排布。'),
  entry('13-group.svelte', '卡片组', 'CardGroup 中的卡片等间距排列，spacing 控制间距大小。'),
  entry('14-grid-group.svelte', '网格型卡片组', "type='grid' 把卡片组设为网格型：卡片去圆角并以边框拼接。"),
];
