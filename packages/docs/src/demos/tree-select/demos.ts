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
  highlightLines?: number[];
}

function entry(
  file: string,
  title: string,
  description?: string,
  highlightLines?: number[],
): DemoEntry {
  return {
    title,
    description,
    component: mods[`./${file}`].default,
    code: (sources[`./${file}`] as string).trim(),
    highlightLines,
  };
}

export const demos: DemoEntry[] = [
  entry('01-basic.svelte', '基础树形选择', '在树形结构中选择节点，支持搜索过滤与清空'),
  entry('02-multiple.svelte', '多选与折叠', 'multiple 开启 checkbox 多选与父子联动，maxTagCount 折叠超出标签'),
  entry('03-leaf-only.svelte', '仅选叶子节点', 'leafOnly 让父节点只展开不选中，仅叶子可作为最终值'),
  entry('04-disabled.svelte', '禁用状态', '禁用单个节点（disabled 字段）或整体禁用选择器'),
  entry('05-prefix-clear.svelte', '前缀与清除', '自定义 prefix 图标、large 尺寸、默认展开指定节点并可一键清除'),
  entry('06-inset-trigger.svelte', '内嵌标签与自定义触发器', 'insetLabel 触发器内嵌标签；triggerRender 完全替换默认选择框（与 Cascader 一致）'),
  entry('07-search-trigger.svelte', '搜索框在触发器', "searchPosition='trigger' 配 filterTreeNode，把搜索输入框内嵌到触发器内而非浮层顶部"),
  entry('08-disable-strictly.svelte', '严格禁用', 'multiple + disableStrictly：勾选父节点不影响 disabled 子节点，禁用态独立'),
  entry('09-render-selected.svelte', '自定义已选项', 'renderSelectedItem 具名 snippet 自定义已选 tag 渲染（图标 + 自定义样式）'),
  entry('10-search-method.svelte', '命令式搜索', 'bind:this 拿实例，调用 ref.search(...) 命令式触发面板内搜索'),
  entry('11-virtualize.svelte', '虚拟化', 'virtualize 对象开启大数据树虚拟滚动'),
  entry('12-remote-search.svelte', '远程搜索', 'remote 开启后输入仅触发 onSearch，由外部更新 treeData'),
  entry('13-trigger-tag-wrap.svelte', '标签换行', 'triggerTagWrap 让 trigger 内多选标签自动换行'),
  entry('14-default-expand.svelte', '默认展开', 'defaultExpandAll 初始化展开；expandAll 动态展开', [32, 42]),
  entry('15-controlled.svelte', '受控', 'value 完全受控，配合 onChange'),
  entry('16-check-relation.svelte', '选中关系', 'checkRelation=unRelated 时父子选中互不影响'),
  entry('17-load-data.svelte', '异步加载', 'loadData 展开时动态加载子节点'),
  entry('18-size.svelte', '尺寸大小', 'size 设置 small / default / large 三种尺寸'),
  entry('19-search-expand-controlled.svelte', '开启搜索的展开受控', 'expandedKeys 展开受控 + onSearch 的 filteredExpandedKeys 实现搜索展开'),
  entry('20-dynamic-data.svelte', '动态更新数据', '运行时替换 treeData，选择器随数据源切换更新'),
];
