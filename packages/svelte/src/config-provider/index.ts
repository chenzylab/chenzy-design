import { getContext } from 'svelte';
import { CONFIG_CONTEXT_KEY, type ConfigContextValue, type GetPopupContainer } from './context.js';
import { DEFAULT_CONFIG, type ResolvedConfig } from '@chenzy-design/core';

export { default as ConfigProvider } from './ConfigProvider.svelte';
export {
  CONFIG_CONTEXT_KEY,
  type ConfigContextValue,
  type GetPopupContainer,
  type OnBreakpoint,
} from './context.js';
export { meta as configProviderMeta } from './meta.js';
export {
  defaultResponsiveMap,
  type ConfigDir,
  type ConfigTimeZone,
  type Breakpoint,
  type ResponsiveMap,
  type BreakpointScreens,
  type OnBreakpointScreensCallback,
  type OnBreakpointChangeCallback,
} from '@chenzy-design/core';

/**
 * 读取最近 ConfigProvider 注入的合并后配置（direction / timeZone）；无 Provider 时返回
 * DEFAULT_CONFIG。约束：getContext 只能在组件初始化期调用，故须在消费组件的
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
 * 读取 ConfigProvider 的响应式断点能力（screens / onBreakpoint / responsiveMap）。
 * 等价于 Semi 的 `ConfigConsumer` 中断点相关字段。无 Provider 时返回 undefined。
 * 约束：须在消费组件 `<script>` 顶层（初始化期）调用；订阅须在 $effect 内并返回清理。
 */
export function getConfigResponsive():
  | Pick<ConfigContextValue, 'screens' | 'onBreakpoint' | 'responsiveMap'>
  | undefined {
  const ctx = getContext<ConfigContextValue | undefined>(CONFIG_CONTEXT_KEY);
  if (!ctx) return undefined;
  return {
    get screens() {
      return ctx.screens;
    },
    get onBreakpoint() {
      return ctx.onBreakpoint;
    },
    get responsiveMap() {
      return ctx.responsiveMap;
    },
  };
}
