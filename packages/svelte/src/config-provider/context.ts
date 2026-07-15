import type {
  ResolvedConfig,
  ResponsiveMap,
  BreakpointScreens,
  Breakpoint,
  OnBreakpointScreensCallback,
  OnBreakpointChangeCallback,
} from '@chenzy-design/core';

/** 全局浮层挂载容器解析器：返回浮层应 portal 进的元素。对齐 Semi getPopupContainer。 */
export type GetPopupContainer = () => HTMLElement | null | undefined;

/**
 * 断点订阅函数（两种签名，均返回取消订阅函数）。对齐 Semi ConfigProvider onBreakpoint：
 * - `onBreakpoint(cb)`：cb 拿到完整 screens 映射；
 * - `onBreakpoint(['md','lg'], cb)`：只监听指定断点，cb 拿到 (screen, match)。
 * 订阅时会立即以当前状态回调一次。
 */
export interface OnBreakpoint {
  (callback: OnBreakpointScreensCallback): () => void;
  (breakpoints: Breakpoint[], callback: OnBreakpointChangeCallback): () => void;
}

/**
 * config context：下发合并后的全局配置（direction / timeZone）与运行时能力。
 * 严格对齐 Semi ConfigProvider Context：
 * - `current`：可继承的纯配置（direction / timeZone）；
 * - `getPopupContainer`：全局浮层默认容器（浮层组件自身 prop 优先，未传时回退）；
 * - `responsiveMap` / `screens` / `onBreakpoint`：响应式断点能力（非 props，经 context 读）。
 */
export type ConfigContextValue = {
  readonly current: ResolvedConfig;
  /** 全局浮层默认容器；未配置为 undefined（浮层组件回退 document.body）。 */
  readonly getPopupContainer?: GetPopupContainer | undefined;
  /** 当前生效的断点配置（未传时为 defaultResponsiveMap）。 */
  readonly responsiveMap: ResponsiveMap;
  /** 各断点当前命中情况（read-only 快照）。 */
  readonly screens: BreakpointScreens;
  /** 订阅断点变化。 */
  readonly onBreakpoint: OnBreakpoint;
};

/** config context：下发合并后的全局配置 */
export const CONFIG_CONTEXT_KEY = Symbol('cd-config');
