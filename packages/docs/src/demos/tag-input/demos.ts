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
  entry('01-basic.svelte', '基础标签输入', '回车或逗号添加标签，退格删除末项'),
  entry('02-separator-max.svelte', '分隔符与数量上限', '多分隔符批量添加，max 限制数量，onExceed 提示'),
  entry('03-no-duplicates.svelte', '过滤重复标签', 'allowDuplicates=false 时重复标签被忽略（默认允许重复）'),
  entry('04-render-tag.svelte', '自定义标签渲染', 'renderTagItem 完全接管标签外观'),
  entry('05-size-blur-disabled.svelte', '尺寸 / 失焦添加 / 禁用', 'size、addOnBlur、showClear 与 disabled'),
  entry('06-prefix-suffix.svelte', '前缀 / 后缀', 'prefix、suffix 展示前后缀'),
  entry('07-max-tag-count.svelte', '限制展示数量', 'maxTagCount 超出折叠为 +N，hover 查看剩余，点击展开'),
  entry('08-draggable.svelte', '拖拽排序', 'draggable 拖拽重排标签'),
  entry('09-controlled.svelte', '标签受控', 'value + onChange 受控，外部展示当前标签数组'),
  entry('10-methods-focus.svelte', '焦点管理', '通过 bind:this 获取实例，调用 focus() / blur()'),
  entry('11-callbacks.svelte', '回调', 'onAdd、onRemove、onChange 回调记录到日志'),
  entry('12-input-controlled.svelte', '输入受控', 'inputValue + onInputChange 受控输入框文本'),
  entry('13-validate-status.svelte', '校验状态样式', 'validateStatus default / warning / error 状态观感'),
  entry('14-content-tooltip.svelte', '截断提示', '标签文本过长单行省略，showContentTooltip 悬浮显示全文'),
];
