import { getContext, setContext } from 'svelte';

const KEY = Symbol('cd-tabs');

export interface TabsContext {
  /** 当前激活 key 的 getter（响应式，TabPane 读取以决定显隐） */
  getActiveKey: () => string | number | undefined;
}

export function setTabsContext(ctx: TabsContext): void {
  setContext(KEY, ctx);
}

export function getTabsContext(): TabsContext | undefined {
  return getContext<TabsContext | undefined>(KEY);
}
