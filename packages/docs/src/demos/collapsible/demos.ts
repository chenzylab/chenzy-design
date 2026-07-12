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
  entry('01-basic.svelte', '基本用法', '通过 isOpen 控制内容的展开或折叠。Collapsible 是无触发器 UI 的折叠原语，触发器由使用方提供。'),
  entry('06-duration.svelte', '自定义动画时间', '通过 duration 设置动画展开/折叠时间，也可通过 motion 关闭动画。'),
  entry('07-nested.svelte', '嵌套使用', 'Collapsible 可嵌套使用，父子各自通过 isOpen 独立控制。'),
  entry('04-collapse-height.svelte', '自定义折叠高度', '通过 collapseHeight 自定义收起的高度，配合遮罩渐隐实现「展开更多」。'),
  entry('05-fade.svelte', 'fade 渐变', 'fade=true 时折叠/展开叠加透明度渐变，过渡更柔和。'),
  entry('02-keep-dom.svelte', 'keepDOM 保留 DOM', 'keepDOM=true 时折叠后内容 DOM 不卸载，输入框内容、滚动位置等状态得以保留。'),
  entry('03-lazy-render.svelte', 'lazyRender 惰性渲染', 'lazyRender 配合 keepDOM：首次展开前不渲染内容，节省首屏成本，首展后保留 DOM。'),
  entry('08-aria.svelte', '无障碍 id 关联', 'id 会设置到内容元素，配合触发器的 aria-controls / aria-expanded 指明控制关系。'),
];
