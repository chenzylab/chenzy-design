import { getContext } from 'svelte';
import { CONFIG_CONTEXT_KEY, type ConfigContextValue } from './context.js';
import { DEFAULT_CONFIG, type ResolvedConfig } from '@chenzy-design/core';

export { default as ConfigProvider } from './ConfigProvider.svelte';
export { CONFIG_CONTEXT_KEY, type ConfigContextValue } from './context.js';
export { meta as configProviderMeta } from './meta.js';

/**
 * 读取最近 ConfigProvider 注入的合并后配置（无 Provider 时返回 DEFAULT_CONFIG）。
 * 约束：getContext 只能在组件初始化期调用，故此 helper 必须在消费组件的
 * `<script>` 顶层（初始化期）调用。
 */
export function getConfigContext(): ResolvedConfig {
  const ctx = getContext<ConfigContextValue | undefined>(CONFIG_CONTEXT_KEY);
  return ctx?.current ?? DEFAULT_CONFIG;
}
