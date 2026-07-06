import { getContext } from 'svelte';

export type InputSize = 'small' | 'default' | 'large';

/**
 * InputGroup → 组内输入控件的组级默认（size / disabled）。
 * 仅作为「未显式设置」的回退：控件显式 prop 始终优先，不破坏各控件 API。
 * 用 getter 暴露 live 值，使组内控件读到最新的组级默认。
 */
export interface InputGroupContext {
  readonly size: InputSize | undefined;
  readonly disabled: boolean | undefined;
}

export const INPUT_GROUP_CTX = Symbol('cd-input-group');

export function getInputGroupContext(): InputGroupContext | undefined {
  return getContext<InputGroupContext | undefined>(INPUT_GROUP_CTX);
}
