import ColorPickerComponent from './ColorPicker.svelte';
import { colorStringToValue } from '@chenzy-design/core';

/**
 * ColorPicker 组件 + 静态方法 `ColorPicker.colorStringToValue`
 * （对齐 Semi `ColorPicker.colorStringToValue`）。
 * `Object.assign` 复合导出模式（同 HotKeys.Keys / Lottie.getLottie / Tabs.Pane）。
 * 同时保留具名导出 `colorStringToValue`，两种调用方式等价。
 */
export const ColorPicker: typeof ColorPickerComponent & {
  colorStringToValue: typeof colorStringToValue;
} = Object.assign(ColorPickerComponent, { colorStringToValue });

export { meta as colorPickerMeta } from './meta.js';
export {
  colorValueFromHex,
  colorValueFromRgba,
  colorValueFromHsva,
  colorStringToValue,
  DEFAULT_COLOR_VALUE,
  type ColorValue,
  type ColorValueFormat,
} from '@chenzy-design/core';
