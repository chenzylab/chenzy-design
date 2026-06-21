import { getContext } from 'svelte';
import {
  CONFIG_CONTEXT_KEY,
  type ConfigContextValue,
  type GetPopupContainer,
  type GetValidateMessages,
} from './context.js';
import { DEFAULT_CONFIG, type ResolvedConfig } from '@chenzy-design/core';

export { default as ConfigProvider } from './ConfigProvider.svelte';
export {
  CONFIG_CONTEXT_KEY,
  type ConfigContextValue,
  type GetPopupContainer,
  type GetValidateMessages,
  type ValidateMessages,
} from './context.js';
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

/**
 * 读取全局浮层默认容器解析器（无配置时返回 undefined，调用方回退 document.body）。
 * 浮层组件（Modal/Dropdown/Popover/Tooltip/Select 等）应把自身 getContainer/
 * getPopupContainer prop 作为优先，仅在未传时回退到这里的全局默认。
 * 约束：须在消费组件 `<script>` 顶层（初始化期）调用。
 */
export function getGlobalPopupContainer(): GetPopupContainer | undefined {
  const ctx = getContext<ConfigContextValue | undefined>(CONFIG_CONTEXT_KEY);
  return ctx?.getPopupContainer;
}

/**
 * 读取全局校验文案覆盖（无配置时返回 undefined，Form 回退 locale 内置文案）。
 * 约束：须在消费组件 `<script>` 顶层（初始化期）调用。
 */
export function getGlobalValidateMessages(): GetValidateMessages | undefined {
  const ctx = getContext<ConfigContextValue | undefined>(CONFIG_CONTEXT_KEY);
  return ctx?.getValidateMessages;
}
