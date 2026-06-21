import type { ResolvedConfig } from '@chenzy-design/core';

/** 全局浮层挂载容器解析器：返回浮层应 portal 进的元素。 */
export type GetPopupContainer = () => HTMLElement | null | undefined;

/**
 * 全局表单校验文案覆盖：按 `Form.*` 键返回模板字符串（支持 {label}/{min}/{max} 等
 * 占位符插值）。仅覆盖列出的键，未列出的回退到 locale 内置文案。
 */
export type ValidateMessages = Record<string, string>;
export type GetValidateMessages = () => ValidateMessages;

/**
 * config context：下发合并后的全局配置。
 *
 * `current` 是可序列化的纯配置（来自 core 的 mergeConfig）；而函数型配置
 * （getPopupContainer / getValidateMessages）不参与 core 合并，单独挂在 context
 * 上，并在嵌套时由 ConfigProvider 自行做「就近 wins、未提供继承父级」合并。
 */
export type ConfigContextValue = {
  readonly current: ResolvedConfig;
  /** 全局浮层默认容器；未配置为 undefined（浮层组件回退 document.body）。 */
  readonly getPopupContainer?: GetPopupContainer | undefined;
  /** 全局校验文案覆盖；未配置为 undefined（回退 locale 内置文案）。 */
  readonly getValidateMessages?: GetValidateMessages | undefined;
};

/** config context：下发合并后的全局配置 */
export const CONFIG_CONTEXT_KEY = Symbol('cd-config');
