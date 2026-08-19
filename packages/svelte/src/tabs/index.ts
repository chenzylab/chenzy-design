import TabsComponent from './Tabs.svelte';
import TabPaneComponent from './TabPane.svelte';
import TabItemComponent from './TabItem.svelte';

/**
 * 命名空间聚合导出：支持 <Tabs.Pane /> 与 <Tabs.TabItem />（对齐 Semi
 * `static TabPane = TabPane; static TabItem = TabItem;`）。
 * 显式类型注解避免泄漏组件内部 Props 类型导致的声明 emit 报错。
 */
export const Tabs: typeof TabsComponent & {
  Pane: typeof TabPaneComponent;
  TabItem: typeof TabItemComponent;
} = Object.assign(TabsComponent, { Pane: TabPaneComponent, TabItem: TabItemComponent });

export { default as TabPane } from './TabPane.svelte';
export { default as TabItem } from './TabItem.svelte';
export { meta as tabsMeta } from './meta.js';
export type { PlainTab, TabsProps, TabPaneProps } from './interface.js';
