import { getContext, setContext } from 'svelte';
import type { TabContextValue } from './interface.js';

const KEY = Symbol('cd-tabs');

export function setTabsContext(ctx: TabContextValue): void {
  setContext(KEY, ctx);
}

export function getTabsContext(): TabContextValue | undefined {
  return getContext<TabContextValue | undefined>(KEY);
}
