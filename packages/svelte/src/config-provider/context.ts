import type { ResolvedConfig } from '@chenzy-design/core';

/** config context：下发合并后的全局配置 */
export const CONFIG_CONTEXT_KEY = Symbol('cd-config');

export type ConfigContextValue = { readonly current: ResolvedConfig };
