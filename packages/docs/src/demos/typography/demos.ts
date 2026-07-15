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
  entry('01-title.svelte', '标题组件', '通过 heading 展示 h1~h6 六级标题。'),
  entry(
    '02-text.svelte',
    '文本组件',
    '内置不同样式的文本：语义色 type，以及 strong / underline / delete / mark / code / disabled 等修饰。',
  ),
  entry(
    '03-link.svelte',
    '链接文本',
    '通过 link prop 渲染链接（传 object 属性透传到 <a>），可配合 icon 前置图标与 underline 下划线。',
  ),
  entry('04-paragraph.svelte', '段落组件', '通过 spacing="extended" 使用更宽松的行距，配合 Title 小标题。'),
  entry(
    '05-size.svelte',
    '文本大小',
    '通过 size 控制 normal / small 两档字号；嵌套时内层设 size="inherit" 继承外层尺寸。',
  ),
  entry(
    '06-copyable.svelte',
    '可复制文本',
    '通过 copyable 开启复制：默认图标、自定义 content、onCopy 回调、自定义 icon 与 render 完全接管渲染。',
  ),
  entry(
    '07-ellipsis.svelte',
    '省略文本',
    '通过 ellipsis 配置单行/多行省略、showTooltip 悬浮显示全文（Tooltip/Popover/自定义浮层）、中间截断 pos、后缀 suffix 与展开收起。',
  ),
  entry(
    '08-numeral.svelte',
    '数值组件',
    '使用 Numeral 按 rule 格式化文本中的数字：取整、百分比、十进制/二进制字节、科学计数等。',
  ),
  entry(
    '09-numeral-parser.svelte',
    '数值自定义解析',
    '通过 parser 自定义数值解析规则（千分位），并演示 link 链接样式的 Numeral。',
  ),
];
