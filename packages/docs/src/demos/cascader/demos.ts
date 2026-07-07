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
  entry('01-basic.svelte', '基础用法', '逐级展开树形数据，支持搜索过滤与清空'),
  entry('02-multiple.svelte', '多选', 'multiple 开启每列复选框与父子联动，maxTagCount 折叠溢出标签'),
  entry('03-default-value.svelte', '默认值与任意级选择', 'defaultValue 设置初始路径，changeOnSelect 允许选中任意层级'),
  entry('04-disabled.svelte', '禁用选项', '通过节点 disabled 字段禁用单个选项或整棵子树'),
  entry('05-load-data.svelte', '动态加载', 'loadData 在点击非叶子节点时异步拉取子级，加载中显示 spinner'),
  entry('06-max-inset-label.svelte', '数量上限与内嵌标签', 'max 限制多选可勾选数量，超出触发 onExceed 且不选入；insetLabel 在触发器值前内嵌标签'),
  entry('07-searchable-multiple.svelte', '可搜索多选', 'multiple + filterable 搜索并多选，filterSorter 对搜索结果自定义排序'),
  entry('08-filter-render.svelte', '自定义搜索结果', 'filterRender 自定义搜索命中项的整行渲染'),
  entry('09-disable-strictly.svelte', '严格禁用', 'disableStrictly 开启后，禁用节点不随父/子联动改变选中态'),
  entry('10-check-relation.svelte', '节点选中关系', 'checkRelation="unRelated" 使节点选中互不影响，可任意层级独立勾选'),
  entry('11-leaf-only.svelte', '仅叶子节点', 'leafOnly 使 value 只包含叶子节点，不折叠为父路径'),
  entry('12-display.svelte', '自定义显示', 'separator 自定义路径分隔符，displayRender 自定义触发器回填格式'),
  entry('13-hover-expand.svelte', '悬停展开与点击选中', 'showNext="hover" 悬停展开子列，clickToSelect 点击任意节点即选中'),
  entry('14-slots.svelte', '顶部/底部附加项', 'topSlot / bottomSlot 在下拉面板顶部、底部渲染固定附加内容'),
  entry('15-trigger-render.svelte', '自定义触发器', 'triggerRender 完全自定义选择框的触发器外观'),
  entry('16-remote.svelte', '远程搜索', 'remote 关闭本地过滤，onSearch 回调里异步更新 treeData'),
  entry('17-key-maps.svelte', '自定义字段映射', 'keyMaps 将 label/value/children 映射到数据中的自定义字段名'),
  entry('18-change-with-object.svelte', '回调返回对象', 'onChangeWithObject 使 onChange 入参从 value 变为完整节点对象'),
  entry('19-controlled.svelte', '受控', '外部持有 value 配合 onChange 双向同步，可编程式设置选中路径'),
];
