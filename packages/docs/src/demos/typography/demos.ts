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
  entry('01-title.svelte', '标题', '使用 Title 渲染 h1~h6 标题，通过 heading 控制层级。'),
  entry('02-text.svelte', '文本', '使用 Text 渲染行内文本，支持语义色与加粗、下划线、标记、code、禁用等修饰。'),
  entry('03-paragraph.svelte', '段落', '使用 Paragraph 渲染段落文本，可配合 type 与 size 调整样式。'),
  entry('04-link.svelte', '链接', '使用 Link 渲染超链接，target=_blank 自动补 rel，支持下划线与前置图标。'),
  entry('05-size.svelte', '文本大小', '通过 size 控制 small / default / large 三档字号。'),
  entry('06-italic-icon.svelte', '斜体与图标', '使用 italic 渲染斜体，icon 添加前置图标。'),
  entry('07-copyable.svelte', '可复制', '通过 copyable 开启复制，可自定义复制内容并监听 onCopy 回调。'),
  entry('08-ellipsis.svelte', '省略', '通过 ellipsis 配置单行 / 多行省略、悬浮显示全文与自定义后缀。'),
  entry('09-ellipsis-expand.svelte', '展开收起', '结合 expandable 与 collapsible，长文本可展开查看并收起折叠。'),
  entry('10-editable.svelte', '可编辑', '通过 editable 与 value / onChange 实现受控的文本编辑。'),
  entry('11-numeral.svelte', '数值格式化', '使用 Numeral 按 rule 格式化文本中的数字：取整、百分比、字节、科学计数等。'),
];
