/**
 * FormInputGroup 内部 context —— 让组内 <Form.Field> 自动进入 group 模式
 * （对齐 Semi group.tsx 的 React.cloneElement(child, { isInInputGroup: true })）。
 *
 * Semi 在 React 里靠 cloneElement 给每个子 Field 注入 isInInputGroup；Svelte 无法克隆
 * snippet 子节点注入 prop，改用 context：FormInputGroup setContext，Field 读到即：
 *   1) 走 isInInputGroup 模式（不在 Field 内插 Label/ErrorMessage）；
 *   2) 把自己的 field 名注册进来，供 GroupError 聚合组内所有字段错误。
 */
import { getContext, setContext } from 'svelte';

export interface FormInputGroupContext {
  /** 组内 Field 注册自己的 field 名（返回取消注册函数，卸载时调用）。 */
  register(field: string): () => void;
}

const KEY = Symbol('cd-form-input-group');

export function setFormInputGroupContext(ctx: FormInputGroupContext): void {
  setContext(KEY, ctx);
}

export function getFormInputGroupContext(): FormInputGroupContext | undefined {
  return getContext<FormInputGroupContext | undefined>(KEY);
}
