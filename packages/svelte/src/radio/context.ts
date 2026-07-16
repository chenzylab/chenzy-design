import { getContext, setContext } from 'svelte';

export type RadioValue = string | number | boolean;
export type RadioType = 'default' | 'button' | 'card' | 'pureCard';

/**
 * 对齐 Semi `RadioChangeEvent`（radioInnerFoundation.ts）：onChange 回调收到的合成事件，
 * `target.checked` 表示是否选中、`target.value` 是选项值；`nativeEvent` 为触发的原生事件。
 */
export interface RadioChangeEvent {
  target: {
    checked: boolean;
    value: RadioValue;
    [x: string]: unknown;
  };
  /** 触发本次变更的原生 DOM 事件（点击 / 键盘）。 */
  nativeEvent?: Event;
  stopPropagation: () => void;
  preventDefault: () => void;
}

export interface RadioRegistration {
  value: RadioValue;
  disabled: boolean;
  /** focusable element to receive roving focus: native input (default) or role=radio container (button/card) */
  el: HTMLElement;
}

export interface RadioGroupContext {
  /** group name shared by all radios */
  name: string;
  getSelected: () => RadioValue | undefined;
  getDisabled: () => boolean;
  /** group-level render form (default/button/card/pureCard) */
  getType: () => RadioType;
  /** group-level button size, only for type='button' */
  getButtonSize: () => 'small' | 'middle' | 'large' | undefined;
  select: (v: RadioValue, e: RadioChangeEvent) => void;
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
