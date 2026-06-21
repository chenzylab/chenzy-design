import { getContext, setContext } from 'svelte';

const KEY = Symbol('cd-tabs');

/** 声明式 <Tabs.Pane> 向父 Tabs 注册时上报的标签元数据（推导 tabList 用）。 */
export interface TabPaneRegistration {
  itemKey: string | number;
  tab: string;
  disabled?: boolean;
  closable?: boolean;
}

export interface TabsContext {
  /** 当前激活 key 的 getter（响应式，TabPane 读取以决定显隐） */
  getActiveKey: () => string | number | undefined;
  /** 是否懒加载（首次激活才挂载） */
  getLazy: () => boolean;
  /** 是否保留激活过的面板 DOM（display:none 隐藏而非卸载） */
  getKeepDOM: () => boolean;
  /**
   * 纯声明式自动收集：父未传 tabList 时，TabPane 挂载时注册自身标签元数据（按源码顺序）。
   * 返回稳定 id，TabPane 卸载时用它注销；元数据变化时调用 update 同步。
   *
   * 红线 #2：注册/注销/更新均发生在 TabPane 的 mount/unmount/同步 $effect（副作用），
   * 写父级簿记普通数组 + 仅 bump 一个 version $state；父 render 派生只读 version 重建快照，
   * 子 effect 绝不读该快照 → 副作用写 / 渲染读分离，无 effect 自循环。
   */
  registerPane?: (reg: TabPaneRegistration) => number;
  updatePane?: (id: number, reg: TabPaneRegistration) => void;
  unregisterPane?: (id: number) => void;
}

export function setTabsContext(ctx: TabsContext): void {
  setContext(KEY, ctx);
}

export function getTabsContext(): TabsContext | undefined {
  return getContext<TabsContext | undefined>(KEY);
}
