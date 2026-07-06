import { HotKeysKeys, type HotKey } from '@chenzy-design/core';
import HotKeysComponent from './HotKeys.svelte';

/**
 * HotKeys 组件 + 静态 `HotKeys.Keys` 键名常量枚举（对齐 spec §4 静态导出）。
 * `Object.assign` 复合导出模式（同 Tabs.Pane / Form.Field）。
 */
export const HotKeys: typeof HotKeysComponent & { Keys: typeof HotKeysKeys } = Object.assign(
  HotKeysComponent,
  { Keys: HotKeysKeys },
);
export { meta as hotKeysMeta } from './meta.js';
export type { HotKey };
