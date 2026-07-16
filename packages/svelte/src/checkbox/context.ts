import { getContext, setContext } from 'svelte';

export type CheckboxValue = string | number;
export type CheckboxType = 'default' | 'card' | 'pureCard';

/**
 * Semi 对齐的 CheckboxEvent：onChange 回调收到事件对象而非裸 boolean。
 * `target.checked` 为切换后的选中态，`target.value` 为该项标识值（Group 内有意义）。
 * 提供 stopPropagation/preventDefault 与 nativeEvent 以对齐 Semi 签名（checkbox.tsx:104-126）。
 */
export interface CheckboxEvent {
  target: { checked: boolean; value: CheckboxValue | undefined };
  stopPropagation: () => void;
  preventDefault: () => void;
  nativeEvent: { stopImmediatePropagation: () => void };
}

export interface CheckboxGroupContext {
  isChecked: (v: CheckboxValue) => boolean;
  toggle: (v: CheckboxValue, e: CheckboxEvent) => void;
  /** getter to stay reactive across the context boundary */
  getDisabled: () => boolean;
  /** getter to stay reactive across the context boundary */
  getName: () => string | undefined;
  /** getter to stay reactive across the context boundary */
  getType: () => CheckboxType;
}

const KEY = Symbol('cd-checkbox-group');

export function setCheckboxGroupContext(ctx: CheckboxGroupContext): void {
  setContext(KEY, ctx);
}

export function getCheckboxGroupContext(): CheckboxGroupContext | undefined {
  return getContext<CheckboxGroupContext | undefined>(KEY);
}
