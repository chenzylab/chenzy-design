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
  entry('01-basic.svelte', '基本演示'),
  entry('02-separator.svelte', '批量添加'),
  entry('03-show-clear.svelte', '批量删除'),
  entry('04-disabled.svelte', '禁用'),
  entry('05-size.svelte', '尺寸大小'),
  entry('06-validate-status.svelte', '不同校验状态样式'),
  entry('07-prefix-suffix.svelte', '前缀 / 后缀'),
  entry('08-add-on-blur.svelte', '失焦后自动创建标签'),
  entry('09-no-duplicates.svelte', '过滤重复标签'),
  entry('10-max.svelte', '输入限制'),
  entry('11-max-tag-count.svelte', '限制标签展示数量'),
  entry('12-controlled.svelte', '标签受控'),
  entry('13-input-controlled.svelte', '输入受控'),
  entry('14-callbacks.svelte', '回调'),
  entry('15-methods-focus.svelte', '焦点管理'),
  entry('16-render-tag.svelte', '自定义标签渲染'),
  entry('17-draggable.svelte', '拖拽排序'),
];
