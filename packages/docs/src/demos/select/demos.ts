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
  entry('01-basic.svelte', '基础用法', '受控单选，onChange 回调返回选中值，disabled 项不可选。'),
  entry('02-multiple.svelte', '多选', '设置 multiple 开启多选，选中项以 Tag 形式展示。'),
  entry('03-filter.svelte', '可搜索', '设置 filter 开启输入过滤，适合选项较多的场景。'),
  entry('04-group.svelte', '分组', 'options 含 { label, options } 即渲染为分组下拉。'),
  entry('05-size-status.svelte', '尺寸与状态', 'size 三档尺寸，status 标记 warning / error 校验态。'),
  entry('06-prefix-clear.svelte', '前缀与清除', 'prefix 前缀内容，clearable 清除按钮，showArrow 控制下拉箭头。'),
  entry('07-remote.svelte', '远程搜索', 'onSearch 防抖回调外部更新 options，配合 loading 展示加载态。'),
  entry('08-create.svelte', '创建条目', 'allowCreate 允许在 filter 无匹配时创建并选中新选项，onCreate 回调。'),
  entry('09-max-tag.svelte', '标签折叠', '多选 maxTagCount 超出折叠为 +N，showRestTagsPopover 悬浮展示剩余。'),
  entry('10-virtualize.svelte', '虚拟化', 'virtualized 开启列表虚拟化，2000 项仅渲染视口内选项。'),
  entry('11-methods.svelte', '命令式方法', 'bind:this 拿实例调 open/close/focus/selectAll/deselectAll 等命令式方法。'),
];
