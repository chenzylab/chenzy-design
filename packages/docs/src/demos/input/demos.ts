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

// 章节顺序逐字对齐 Semi 官网（semi.design/zh-CN/input/input）：
//   基本 → 三种大小 → 不可用 → 前缀/后缀 → 前置/后置标签 → 带移除图标 → 密码模式 →
//   校验状态 → 受控组件 → 输入框组合 → 多行输入框 → 设置 TextArea 高度 → 行号 →
//   Shift+Enter 换行 → autosize → 自定义计算字符串长度 → 输入法模式。
export const demos: DemoEntry[] = [
  entry('01-basic.svelte', '基本', '基本使用。'),
  entry('02-size.svelte', '三种大小', '默认定义了三种尺寸：大、默认、小。'),
  entry('03-disabled.svelte', '不可用', '设定 disabled 属性为 true。'),
  entry('04-prefix-suffix.svelte', '前缀/后缀', '在输入框上增加前缀、后缀图标，可以是任意节点。'),
  entry('05-addon.svelte', '前置/后置标签', '在输入框上增加前置/后置标签。'),
  entry('06-clear.svelte', '带移除图标', '点击图标删除所有内容。'),
  entry('07-password.svelte', '密码模式', '隐藏输入的具体内容。'),
  entry('08-status.svelte', '校验状态', '可设置不同校验状态，展示不同样式。'),
  entry('09-controlled.svelte', '受控组件', 'Input 值完全取决于传入的 value 值，配合 onChange 回调函数使用。'),
  entry('10-group.svelte', '输入框组合', '可以将多个输入框放入 InputGroup 的容器中，通过设置 size、disabled 统一设置组合中的输入框属性。'),
  entry('11-group-treeselect.svelte', '输入框组合（TreeSelect / Cascader）', 'InputGroup 支持 TreeSelect、Cascader 等输入类控件。'),
  entry('12-textarea.svelte', '多行输入框', '用于多行输入。通过设置 maxCount 属性可以进行字数限制并显示字数统计。支持 showClear。'),
  entry('13-textarea-height.svelte', '设置 TextArea 高度', '通过 textareaStyle 可以设置内部 textarea 元素的样式，如高度、背景色等。'),
  entry('14-textarea-linenumber.svelte', '行号', '通过设置 showLineNumber 展示行号。可用 lineNumberStart 设置起始行号。'),
  entry('15-textarea-shift-enter.svelte', '使用 Shift + Enter 换行的多行输入框', '禁用 Enter 换行，仅 Shift + Enter 才能换行。'),
  entry('16-textarea-autosize.svelte', '自动扩展的多行输入框', '通过设置 autosize 属性可设置只有高度自动随内容增加而变化。'),
  entry('17-value-length.svelte', '自定义计算字符串长度', '通过设置 getValueLength 属性可以自定义计算字符串长度，支持 emoji 按可见长度计算。'),
  entry('18-composition.svelte', '输入法模式', '通过设置 composition 属性为 true，可以开启输入法模式。Input 和 TextArea 均支持。'),
];
