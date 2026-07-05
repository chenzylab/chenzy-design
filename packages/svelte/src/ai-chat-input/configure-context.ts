/**
 * AIChatInput 配置区（Configure）的 Svelte context（阶段 4）。
 * 对齐 Semi Configure：主组件持有 value（字段名→值），通过 context 暴露给
 * renderConfigureArea 里放置的 Configure 子组件（Select/Button/RadioButton）。
 * 子组件用 field 绑定：读 value[field]、变更时 setField({[field]: v}) 写回主组件。
 */
import { getContext, setContext } from 'svelte';
import type { AIChatInputConfigureValue } from '@chenzy-design/core';

export interface AIChatInputConfigureContext {
  /** 当前配置区值（响应式：子组件在渲染期读取）。 */
  getValue: () => AIChatInputConfigureValue;
  /** 合并一个字段补丁（init=true 时不触发 onConfigureChange，用于初始值注册）。 */
  setField: (patch: AIChatInputConfigureValue, init?: boolean) => void;
  /** 移除一个字段（子组件卸载时清理）。 */
  removeField: (field: string) => void;
}

const CONFIGURE_KEY = Symbol('cd-ai-chat-input-configure');

export function setConfigureContext(ctx: AIChatInputConfigureContext): void {
  setContext(CONFIGURE_KEY, ctx);
}

export function getConfigureContext(): AIChatInputConfigureContext | undefined {
  return getContext(CONFIGURE_KEY);
}
