import { getContext, setContext } from 'svelte';

export type CheckboxValue = string | number;
export type CheckboxSize = 'small' | 'default' | 'large';
export type CheckboxType = 'default' | 'card' | 'pureCard';
export type CheckboxStatus = 'default' | 'warning' | 'error';

export interface CheckboxGroupContext {
  isChecked: (v: CheckboxValue) => boolean;
  toggle: (v: CheckboxValue) => void;
  /** getter to stay reactive across the context boundary */
  getDisabled: () => boolean;
  /** getter to stay reactive across the context boundary */
  getSize: () => CheckboxSize;
  /** getter to stay reactive across the context boundary */
  getName: () => string | undefined;
  /** getter to stay reactive across the context boundary */
  getType: () => CheckboxType;
  /** getter to stay reactive across the context boundary */
  getStatus: () => CheckboxStatus;
}

const KEY = Symbol('cd-checkbox-group');

export function setCheckboxGroupContext(ctx: CheckboxGroupContext): void {
  setContext(KEY, ctx);
}

export function getCheckboxGroupContext(): CheckboxGroupContext | undefined {
  return getContext<CheckboxGroupContext | undefined>(KEY);
}
