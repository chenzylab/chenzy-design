/**
 * ColorPicker 逻辑层（对齐 semi-foundation/colorPicker/foundation.ts）。
 *
 * 承担：受控/非受控值模型、按格式分派的 handleChange、仅改 alpha 的 handleChangeA。
 * 与 Semi 的差异只在框架惯用法：Semi 用 adapter.setState + notifyChange 两步，
 * 本库用 rune $state + 回调（受控时不回写，仅经 onChange 上报）。
 */

import {
  colorValueFromHsva,
  colorValueFromRgba,
  colorValueFromHex,
  colorValueRgbaToHex,
  DEFAULT_COLOR_VALUE,
  type ColorValue,
  type ColorValueFormat,
  type HsvaColor,
  type RgbaColor,
} from '@chenzy-design/core';

export interface ColorPickerFoundationProps {
  /** 受控值；undefined 表示非受控。 */
  value: ColorValue | undefined;
  /** 非受控初始值。 */
  defaultValue: ColorValue;
  /** 是否开启透明度（关闭时强制不透明，对齐 Semi handleChangeA）。 */
  alpha: boolean;
  /** 值变化回调。 */
  onChange: ((value: ColorValue) => void) | undefined;
}

export function createColorPickerFoundation(props: () => ColorPickerFoundationProps) {
  let innerValue = $state<ColorValue>(props().defaultValue ?? DEFAULT_COLOR_VALUE);

  /** 当前色（对齐 Semi getCurrentColor：受控优先，否则取内部 state）。 */
  const currentColor = $derived<ColorValue>(props().value ?? innerValue);

  /** 上报并（非受控时）落库。对齐 Semi `notifyChange` + `if (!getProp('value')) setState`。 */
  function notify(next: ColorValue) {
    if (props().value === undefined) innerValue = next;
    props().onChange?.(next);
  }

  /** 按格式提交颜色变更（对齐 Semi foundation.handleChange 三分支）。 */
  function handleChange(color: HsvaColor | RgbaColor | string, format: ColorValueFormat) {
    if (format === 'hsva') notify(colorValueFromHsva(color as HsvaColor));
    else if (format === 'rgba') notify(colorValueFromRgba(color as RgbaColor));
    else if (format === 'hex') notify(colorValueFromHex(color as string));
    else throw new Error('format error');
  }

  /** 仅改色相（对齐 Semi handleChangeH）。 */
  function handleChangeH(newH: number) {
    handleChange({ ...currentColor.hsva, h: newH }, 'hsva');
  }

  /**
   * 仅改透明度（对齐 Semi handleChangeA）：alpha 关闭时强制 1，
   * 且 hex 截断到 7 位（不带 alpha 段）。
   */
  function handleChangeA(newAlpha: number) {
    const a = props().alpha ? newAlpha : 1;
    const rgba: RgbaColor = { ...currentColor.rgba, a };
    const hex = colorValueRgbaToHex(rgba);
    notify({
      rgba,
      hex: props().alpha ? hex : hex.slice(0, 7),
      hsva: { ...currentColor.hsva, a },
    });
  }

  return {
    get currentColor() {
      return currentColor;
    },
    handleChange,
    handleChangeH,
    handleChangeA,
  };
}

export type ColorPickerFoundation = ReturnType<typeof createColorPickerFoundation>;
