import { getContext, setContext } from 'svelte';

export type RadioValue = string | number | boolean;
export type RadioSize = 'small' | 'default' | 'large';
export type RadioStatus = 'default' | 'warning' | 'error';

export interface RadioRegistration {
  value: RadioValue;
  disabled: boolean;
  el: HTMLInputElement;
}

export interface RadioGroupContext {
  /** group name shared by all radios */
  name: string;
  getSelected: () => RadioValue | undefined;
  getDisabled: () => boolean;
  getSize: () => RadioSize;
  /** group-level validation status; per-item non-default status overrides it */
  getStatus: () => RadioStatus;
  select: (v: RadioValue) => void;
  /** register a radio's input element + meta for roving focus management */
  register: (reg: RadioRegistration) => () => void;
  /** keydown handler implementing roving tabindex / arrow navigation */
  onKeydown: (e: KeyboardEvent, current: RadioValue) => void;
  /** whether this radio should be the roving tab stop (tabindex=0) */
  isTabStop: (v: RadioValue, disabled: boolean) => boolean;
}

const KEY = Symbol('cd-radio-group');

export function setRadioGroupContext(ctx: RadioGroupContext): void {
  setContext(KEY, ctx);
}

export function getRadioGroupContext(): RadioGroupContext | undefined {
  return getContext<RadioGroupContext | undefined>(KEY);
}
