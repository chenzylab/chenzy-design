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
  entry('10-virtualize.svelte', '虚拟化', 'virtualize 对象开启列表虚拟化，2000 项仅渲染视口内选项。'),
  entry('11-methods.svelte', '命令式方法', 'bind:this 拿实例调 open/close/focus/selectAll/deselectAll 等命令式方法。'),
  entry('12-slots.svelte', '顶部/底部附加项', 'inner*Slot 随列表滚动、outer*Slot 固定在滚动区外，渲染浮层附加内容。'),
  entry('13-search-position.svelte', '搜索框位置', 'searchPosition 控制搜索框在触发器（默认）或浮层顶部。'),
  entry('14-filter-function.svelte', '自定义搜索逻辑', 'filter 传函数 (input, option) => boolean，自定义过滤逻辑（如匹配拼音）。'),
  entry('15-render-selected.svelte', '自定义已选标签', 'renderSelectedItem 自定义多选 Tag / 单选回显内容。'),
  entry('16-render-option.svelte', '自定义候选项', 'renderOptionItem 完全自定义候选项渲染，自行绑定 onMouseEnter/onClick。'),
  entry('17-trigger-render.svelte', '自定义触发器', 'triggerRender 替换默认触发框，复用 toggle/onTriggerKeydown 保持键盘可达。'),
  entry('18-change-with-object.svelte', '获取选项其他属性', 'onChangeWithObject 回调携带完整 option 对象，读取 value 外的自定义字段。'),
  entry('19-linked.svelte', '联动', '省市联动：上级变更后清空并动态更新下级 optionList。'),
  entry('20-dynamic-options.svelte', '动态修改 Options', '运行时增删 optionList，选择器实时反映最新选项集。'),
  entry('21-dropdown-style.svelte', '自定义弹出层样式', 'dropdownStyle / dropdownClassName 自定义浮层样式（勿含 position/transform）。'),
  entry('22-controlled.svelte', '受控组件', 'value 由外部 state 驱动、onChange 回填；受控组件不 bind:。'),
];
