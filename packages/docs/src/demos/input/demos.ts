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
  entry('01-basic.svelte', '基本用法', '通过 bind:value 双向绑定输入值，并支持 placeholder 占位提示。'),
  entry('02-size.svelte', '尺寸', '提供 large / default / small 三种尺寸。'),
  entry('03-status.svelte', '状态', '支持禁用、warning、error 等状态。'),
  entry('04-features.svelte', '功能', '可清除、字数统计 + 长度限制、密码输入等功能。'),
  entry('05-group.svelte', '输入组合', 'InputGroup 把多个输入控件拼接为一体（相邻边框合并、首尾圆角），size 经 context 回退统一透传。'),
  entry('06-prefix-suffix.svelte', '前后缀', 'prefix / suffix 在输入框内渲染前后缀内容（图标、单位等）。'),
  entry('07-addon.svelte', '前后置标签', 'addonBefore / addonAfter 在输入框外拼接前置/后置标签（如协议、域名后缀）。'),
  entry('08-controlled.svelte', '受控', 'value 完全由外部持有，配合 onChange，可编程式设置。'),
  entry('09-value-length.svelte', '自定义计数', 'getValueLength 自定义字符计数（emoji 按可见长度计），配合 showCount / maxLength。'),
  entry('10-composition.svelte', '输入法模式', 'composition 开启后，输入法未确认期间不触发 onChange，确认后触发一次。'),
];
