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
  entry('03-status.svelte', '状态', '支持禁用、warning、error 等校验状态（validateStatus）。'),
  entry('04-features.svelte', '功能', 'showClear 清除、showCount 字数统计 + 长度限制、mode=password 密码显隐。'),
  entry('06-prefix-suffix.svelte', '前后缀', 'prefix / suffix 在输入框内渲染前后缀内容（图标、单位等）。'),
  entry('07-addon.svelte', '前后置标签', 'addonBefore / addonAfter 拼接前置/后置标签（如协议、域名后缀）。'),
  entry('05-group.svelte', '输入组合', 'InputGroup 把多个输入控件拼接为一体（相邻圆角合并、分隔线），size 经 context 回退统一透传。'),
  entry('11-textarea.svelte', '多行输入框', 'TextArea 多行输入，maxCount 字数限制并显示计数，支持 showClear。'),
  entry('15-textarea-autosize.svelte', '自动扩展的多行输入框', 'autosize 高度随内容自动增长，可配置 minRows / maxRows。'),
  entry('12-textarea-height.svelte', '设置 TextArea 高度', 'textareaStyle 设置内部 textarea 元素样式（如高度），style 控制外层容器。'),
  entry('13-textarea-linenumber.svelte', '行号', 'showLineNumber 展示行号，lineNumberStart 设置起始行号，软换行自动对齐。'),
  entry('14-textarea-shift-enter.svelte', 'Shift + Enter 换行', 'disabledEnterStartNewLine 禁用 Enter 换行，仅 Shift + Enter 才换行。'),
  entry('08-controlled.svelte', '受控', 'value 完全由外部持有，配合 onChange，可编程式设置。'),
  entry('09-value-length.svelte', '自定义计算字符串长度', 'getValueLength 自定义字符计数（emoji 按可见长度计），配合 showCount / maxLength。'),
  entry('10-composition.svelte', '输入法模式', 'composition 开启后，输入法未确认期间不触发 onChange，确认后触发一次。Input 与 TextArea 均支持。'),
];
