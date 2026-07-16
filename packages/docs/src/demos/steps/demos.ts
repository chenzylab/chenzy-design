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
  entry('01-fill.svelte', '默认步骤条（fill）', 'fill 为块状步骤条（默认类型），process 态整块背景高亮。'),
  entry('02-basic.svelte', '简单步骤条（basic）', '设置 type="basic" 显示为简洁风格步骤条。'),
  entry('03-nav.svelte', '导航步骤条（nav）', '设置 type="nav" 显示为导航风格步骤条，不支持交互，宽度按内容撑开。'),
  entry('04-small.svelte', '迷你尺寸', '设置 size="small" 显示迷你尺寸步骤条（basic/nav 型生效）。'),
  entry('05-process.svelte', '处理进度', '配合内容及按钮使用，表示一个流程的处理进度。'),
  entry('06-vertical.svelte', '竖直方向', '设置 direction="vertical" 使用竖直方向的步骤条。'),
  entry('07-status.svelte', '指定步骤状态', '使用 status 属性指定当前步骤的状态（如 error）。'),
  entry('08-custom-icon.svelte', '自定义图标/状态', '通过每步 status 自定义状态、icon 自定义图标（字符串或 Snippet）。'),
  entry('09-onchange.svelte', 'onChange 回调', 'onChange 接收 number 参数（等于 initial + index），用于实现处理进度。'),
  entry('10-initial.svelte', '起始序号 initial', '通过 initial 设置起始序号偏移，onChange 参数等于 initial + index。'),
  entry('11-item-style.svelte', '每步自定义 class/style', '每步支持 class / style / ariaLabel，对齐 Semi Steps.Step 的 className/style/aria-label。'),
];
