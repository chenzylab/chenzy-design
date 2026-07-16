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
  entry('01-basic.svelte', '基础用法', '默认单选，每级菜单项均可选择。'),
  entry('02-multiple.svelte', '多选', 'multiple + checkable：子项全选自动勾选父项，部分选中显半选。'),
  entry('03-searchable.svelte', '可搜索', 'filterTreeNode 开启搜索，命中高亮 + 自动展开祖先；showFilteredOnly 只展示命中结果。'),
  entry('04-search-render.svelte', '自定义搜索框', 'searchRender 自定义搜索框渲染（复用 Input 组件）。'),
  entry('05-manual-search.svelte', '手动触发搜索', 'searchRender={false} 隐藏内置框，经组件实例 search() 由外部输入驱动。'),
  entry('06-simple-json.svelte', '简单 JSON 数据', 'treeDataSimpleJson 传入扁平键值对，自动转为树。'),
  entry('07-block-node.svelte', '行显示节点', 'blockNode（默认 true）整行高亮；false 时仅高亮 label。'),
  entry('08-custom-label.svelte', '自定义节点内容', 'renderLabel snippet 自定义节点渲染（父节点加计数标签）。'),
  entry('09-custom-icon.svelte', '自定义图标', 'icon snippet 按叶子/展开态渲染文件夹与文件图标。'),
  entry('10-directory.svelte', '目录树模式', 'directory：整行块 + 内置目录/文件图标 + 点击整行展开。'),
  entry('11-disabled.svelte', '禁用', 'disableStrictly：禁用节点勾选态不受父/子联动改变。'),
  entry('12-check-relation.svelte', '节点选中关系', "checkRelation 'related'（联动+半选）与 'unRelated'（互不影响）。"),
  entry('13-expand-all.svelte', '默认展开', 'defaultExpandAll 仅初始化生效；expandAll 数据更新后仍生效。'),
  entry('14-controlled.svelte', '受控', 'expandedKeys / value 受控，外部按钮控制展开与选中。'),
  entry('15-auto-expand-parent.svelte', '自动展开父节点', 'autoExpandParent：仅指定叶子也会展开其祖先链。'),
  entry('16-expand-icon.svelte', '自定义展开图标', 'expandIcon snippet 自定义展开/收起箭头（+/− 号）。'),
  entry('17-show-line.svelte', '连接线', 'showLine 显示节点之间的层级连接线（├ / └ / 竖线）。'),
  entry('18-virtualized.svelte', '虚拟化', '1050 节点仅渲染视口内行；scrollTo() 滚动到指定节点。'),
  entry('19-load-data.svelte', '异步加载', 'loadData 展开时动态拉取子节点，叶子需标 isLeaf。'),
  entry('20-dynamic-update.svelte', '动态更新数据', '切换数据集，expandAll 保持全展开。'),
  entry('21-draggable.svelte', '可拖拽', 'draggable + onDrop 实现节点拖拽排序（before / inside / after）。'),
  entry('22-full-label-leaf.svelte', '高级定制·叶子分组勾选', 'renderFullLabel 只在叶子渲染勾选框，父节点仅分组（leafOnly）。'),
  entry('23-full-label-highlight.svelte', '高级定制·单选高亮子节点', 'renderFullLabel + onSelect：选中父节点同时高亮其子孙。'),
  entry('24-field-names.svelte', '字段映射', 'keyMaps 把后端 id/name/sub 映射为标准字段。'),
  entry('25-custom-filter.svelte', '自定义搜索谓词', 'filterTreeNode 传函数自定义命中逻辑（按 label 前缀），命中节点祖先链自动展开。'),
  entry('26-search-controlled-expand.svelte', '开启搜索的展开受控', '受控 expandedKeys 时搜索不自动展开，用 onSearch 的 filteredKeys 回写展开集。'),
  entry('27-draggable-full-label.svelte', '可拖拽的高级定制', 'draggable + renderFullLabel 同用：整行自定义 + 拖拽排序 + 选中高亮子孙。'),
];
