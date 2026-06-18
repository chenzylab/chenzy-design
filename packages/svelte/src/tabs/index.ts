import TabsComponent from './Tabs.svelte';
import TabPane from './TabPane.svelte';

/**
 * 命名空间聚合导出：支持 <Tabs.Pane />。
 * 显式类型注解避免泄漏组件内部 Props 类型导致的声明 emit 报错。
 */
export const Tabs: typeof TabsComponent & {
  Pane: typeof TabPane;
} = Object.assign(TabsComponent, { Pane: TabPane });

export { default as TabPane } from './TabPane.svelte';
export { meta as tabsMeta } from './meta.js';
export type { TabItem } from './types.js';
