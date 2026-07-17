/**
 * Component tokens for ColorPicker，严格对齐 Semi Design
 * （semi-foundation/colorPicker/variables.scss 20 个），带元数据 TokenDef 结构以支持 DSM。
 * 全部 20 个 Semi token 均被组件真消费（非死中间层）；另加 3 个 chenzy 补充 token
 * （Semi 无对应字面量：把手尺寸/阴影、滑块高度）。
 *
 * 注：
 *  - Semi $radius-colorPicker-handle: var(--semi-border-radius-full) →
 *    var(--cd-border-radius-full)；其余圆角/宽度/间距/字号为字面量，忠实照抄。
 *  - Semi 名 colorPicker → color-picker，下划线 _ 归一为 -，全小写。
 */
import type { TokenGroup } from './token-def.js';

export const colorPickerTokens = {
  // —— 圆角（对齐 Semi $radius-colorPicker-*）——
  'radius-color-picker-topleft': { value: '8px', category: 'radius', label: '圆角-左上', usage: '圆角 - 左上（saturation 方块）' },
  'radius-color-picker-topright': { value: '8px', category: 'radius', label: '圆角-右上', usage: '圆角 - 右上（saturation 方块）' },
  'radius-color-picker-bottomleft': { value: '0px', category: 'radius', label: '圆角-左下', usage: '圆角 - 左下（saturation 方块）' },
  'radius-color-picker-bottomright': { value: '0px', category: 'radius', label: '圆角-右下', usage: '圆角 - 右下（saturation 方块）' },
  'radius-color-picker-handle': { value: 'var(--cd-border-radius-full)', category: 'radius', label: '把手圆角', usage: '圆角 - 拖拽把手 / 滑块条' },
  'radius-color-picker-alphasliderinner': { value: '4px', category: 'radius', label: '透明度滑块圆角', usage: '圆角 - 透明度 Slider inner' },
  'radius-color-picker-demoblock': { value: '4px', category: 'radius', label: '当前色块圆角', usage: '圆角 - 颜色手动输入区域左侧当前选中颜色色块' },
  'radius-color-picker-defaulttrigger': { value: '4px', category: 'radius', label: '默认 trigger 圆角', usage: 'popover 模式默认 trigger 圆角' },

  // —— 宽度（对齐 Semi $width-colorPicker-*）——
  'width-color-picker-handle-border': { value: '2px', category: 'width', label: '把手边框宽度', usage: '把手边框宽度' },
  'width-color-picker-colorpickerinputnumber': { value: '58px', category: 'width', label: '数字输入器宽度', usage: 'alpha 数字输入器宽度' },
  'width-color-picker-formatselect': { value: '80px', category: 'width', label: '格式选择宽度', usage: '格式选择下拉 Select 宽度' },
  'width-color-picker-defaulttrigger': { value: '24px', category: 'width', label: '默认 trigger 大小', usage: 'popover 模式默认 trigger 边长' },

  // —— 颜色（对齐 Semi $color-colorPicker-*）——
  'color-color-picker-handle-border': { value: 'var(--cd-color-white)', category: 'color', label: '把手边框颜色', usage: '拖拽把手 / 滑块把手边框颜色' },

  // —— 间距（对齐 Semi $spacing-colorPicker-*）——
  'spacing-color-picker-inputnumbersuffix-horizontal': { value: '4px', category: 'spacing', label: '百分比水平距离', usage: 'alpha 数字输入框后百分比水平内边距' },
  'spacing-color-picker-inputgroup-marginleft': { value: '4px', category: 'spacing', label: '输入区左距', usage: '颜色手动输入区域左侧距离色块距离' },
  'spacing-color-picker-popover-padding': { value: '8px', category: 'spacing', label: '弹层内边距', usage: 'popover 模式浮层整体内边距' },
  'spacing-color-picker-inputnumbersuffix-vertical': { value: '4px', category: 'spacing', label: '百分比垂直距离', usage: 'alpha 数字输入框后百分比垂直内边距' },
  'spacing-color-picker-slider-margintop': { value: '6px', category: 'spacing', label: '滑块上边距', usage: 'hue / alpha 滑动选择器上边距' },
  'spacing-color-picker-datapart-margintop': { value: '8px', category: 'spacing', label: '输入区上边距', usage: '颜色手动输入区域上边距' },

  // —— 字体（对齐 Semi $font-colorPicker-*）——
  'font-color-picker-inputnumbersuffix-fontsize': { value: '14px', category: 'font', label: '百分比字号', usage: 'alpha 数字输入框后百分比字体大小' },

  // —— chenzy 补充（Semi 靠 renderPicker 传入 handleSize/height，无对应字面量 token；组件消费）——
  'color-picker-handle-size': { value: '20px', category: 'width', label: '色板把手尺寸', usage: '色板（colorChooseArea）拖拽把手边长（组件消费；对齐 Semi handleSize={20}）' },
  'color-picker-slider-handle-size': { value: '18px', category: 'width', label: '滑块把手尺寸', usage: 'hue / alpha 滑块把手边长（组件消费；对齐 Semi slider handleSize={18}）' },
  'color-picker-handle-shadow': { value: 'var(--cd-shadow-elevated)', category: 'other', label: '把手阴影', usage: '拖拽把手阴影（组件消费）' },
  'color-picker-slider-height': { value: '10px', category: 'height', label: '滑块高度', usage: 'hue / alpha 滑块条高度（组件消费；对齐 Semi height=10）' },
} satisfies TokenGroup;
