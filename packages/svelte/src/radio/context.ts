import { getContext, setContext } from 'svelte';

export type RadioValue = string | number | boolean;
export type RadioType = 'default' | 'button' | 'card' | 'pureCard';
/** 高级模式：advanced 允许 checked 时点击取消（input 变 checkbox）；'' 为普通模式。 */
export type RadioMode = 'advanced' | '';

/**
 * 对齐 Semi `RadioChangeEvent`（radioInnerFoundation.ts）：onChange 回调收到的合成事件，
 * `target.checked` 表示是否选中、`target.value` 是选项值；`nativeEvent` 为触发的原生事件。
 */
export interface RadioChangeEvent {
  target: {
    checked: boolean;
    value: RadioValue | undefined;
    [x: string]: unknown;
  };
  /** 触发本次变更的原生 DOM 事件（点击 / 键盘）。 */
  nativeEvent?: Event;
  stopPropagation: () => void;
  preventDefault: () => void;
}

export interface RadioGroupContext {
  /** group name shared by all radios（同 name 的原生 radio 天然成组，方向键切换由浏览器接管）。 */
  name: string;
  getSelected: () => RadioValue | undefined;
  getDisabled: () => boolean;
  /** group-level render form (default/button/card/pureCard) */
  getType: () => RadioType;
  /** group-level advanced/normal mode */
  getMode: () => RadioMode;
  /** group-level button size, only for type='button' */
  getButtonSize: () => 'small' | 'middle' | 'large' | undefined;
  /** 子 Radio 变更时上抛，Group 内统一处理 advanced 取消 / 受控回写（对齐 radioGroupFoundation.handleChange）。 */
  onChange: (e: RadioChangeEvent) => void;
}

const KEY = Symbol('cd-radio-group');

export function setRadioGroupContext(ctx: RadioGroupContext): void {
  setContext(KEY, ctx);
}

export function getRadioGroupContext(): RadioGroupContext | undefined {
  return getContext<RadioGroupContext | undefined>(KEY);
}
