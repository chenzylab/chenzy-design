/**
 * ColorPicker 常量（对齐 semi-foundation/colorPicker/constants.ts + semi-ui renderPicker 内的字面量）。
 *
 * Semi 的 constants.ts 只放 cssClasses.PREFIX，其余尺寸散写在 renderPicker 的 JSX 属性上
 * （`handleSize={20}` / 滑块 `height={10} handleSize={18}` / `width ?? 280`）。本库把这些
 * 字面量收进本文件，避免同一数字在多个组件里各写一遍。
 */

/** 面板默认宽度（对齐 Semi `this.props.width ?? 280`）。 */
export const DEFAULT_WIDTH = 280;

/** 饱和度方块默认高度（对齐 Semi `this.props.height ?? 280`）。 */
export const DEFAULT_HEIGHT = 280;

/** hue / alpha 滑块条高度（对齐 Semi 滑块 `height={10}`）。 */
export const SLIDER_HEIGHT = 10;

/** 饱和度方块把手边长（对齐 Semi `handleSize={20}`）。 */
export const AREA_HANDLE_SIZE = 20;

/** hue / alpha 滑块把手边长（对齐 Semi 滑块 `handleSize={18}`）。 */
export const SLIDER_HANDLE_SIZE = 18;

/** DataPart 输入区可切换的格式列表（对齐 Semi `['hex', 'rgba', 'hsva']`）。 */
export const FORMAT_LIST = ['hex', 'rgba', 'hsva'] as const;

/** alpha 透明度棋盘格底纹（对齐 Semi colorPicker.scss 内联的 svg data-URI）。 */
export const ALPHA_CHECKERBOARD =
  `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill-opacity=".05"><rect x="8" width="8" height="8"/><rect y="8" width="8" height="8"/></svg>')`;
