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
  entry('03-no-duplicates.svelte', '不允许重复', 'allowDuplicates=false 时重复标签被忽略'),
  entry('04-render-tag.svelte', '自定义标签渲染', 'renderTagItem 完全接管标签外观'),
  entry('05-size-blur-disabled.svelte', '尺寸 / 失焦添加 / 禁用', 'size、addOnBlur、showClear 与 disabled'),
  entry('06-prefix-suffix.svelte', '前缀 / 后缀', 'prefix、suffix 展示前后缀'),
  entry('07-max-tag-count.svelte', '限制展示数量', 'maxTagCount 超出折叠为 +N，hover 查看剩余，点击展开'),
  entry('08-draggable.svelte', '拖拽排序', 'draggable 配合 allowDuplicates=false 拖拽重排标签'),
  entry('09-controlled.svelte', '受控', 'value + onChange 受控，外部展示当前标签数组'),
  entry('10-methods-focus.svelte', '命令式聚焦', '通过 bind:this 获取实例，调用 focus() / blur()'),
  entry('11-callbacks.svelte', '事件回调', 'onAdd、onRemove、onChange 回调记录到日志'),
  entry('12-content-tooltip.svelte', '截断提示', 'maxTagTextLength 截断，showContentTooltip 悬浮显示全文'),
  entry('13-validate.svelte', '自定义校验', 'validateTag 拒绝非法标签，onInvalid 上报原因'),
  entry('14-remove-icon.svelte', '自定义删除图标', 'removeIcon 自定义默认标签的删除图标'),
  entry('15-suggestions.svelte', '建议补全', 'renderSuggestions 输入时弹建议浮层，点击添加'),
];
