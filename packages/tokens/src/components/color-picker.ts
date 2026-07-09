/**
 * Component tokens for ColorPicker（M4 Input）。全量对齐 Semi Design
 * （semi-foundation/colorPicker/variables.scss 20 个），并升级为带元数据的 TokenDef
 * 结构以支持 DSM。值为 var() 引用我们的 alias / global token，或字面量。
 * 末尾保留 chenzy-design ColorPicker 实际消费的补充 token（原名，Semi 无 / 命名差异；组件消费）。
 *
 * 注：
 *  - Semi $radius-colorPicker-handle: var(--semi-border-radius-full) →
 *    var(--cd-border-radius-full)；其余圆角/宽度/间距为字面量，忠实照抄。
 *  - Semi 名 colorPicker → color-picker，下划线 _ 归一为 -，全小写
 *    （对齐 checkbox/modal/slider 既有 token 命名）。
 *  - 组件 token 名（radius-color-picker-* / color-color-picker-* …）与末段消费 token
 *    名（color-picker-*）不同名，var() 无自引用死循环。
 */
import type { TokenGroup } from './token-def.js';

export const colorPickerTokens = {
  // —— 圆角（对齐 Semi $radius-colorPicker-*）——
  'radius-color-picker-topleft': { value: '8px', category: 'radius', label: '圆角-左上', usage: '圆角 - 左上' },
  'radius-color-picker-topright': { value: '8px', category: 'radius', label: '圆角-右上', usage: '圆角 - 右上' },
  'radius-color-picker-bottomleft': { value: '0px', category: 'radius', label: '圆角-左下', usage: '圆角 - 左下' },
  'radius-color-picker-bottomright': { value: '0px', category: 'radius', label: '圆角-右下', usage: '圆角 - 右下' },
  'radius-color-picker-handle': { value: 'var(--cd-border-radius-full)', category: 'radius', label: '把手圆角', usage: '圆角 - 拖拽把手' },
  'radius-color-picker-alphasliderinner': { value: '4px', category: 'radius', label: '透明度滑块圆角', usage: '圆角 - 透明度 Slider' },
  'radius-color-picker-demoblock': { value: '4px', category: 'radius', label: '当前色块圆角', usage: '圆角 - 颜色手动输入区域左侧当前选中颜色色块' },
  'radius-color-picker-defaulttrigger': { value: '4px', category: 'radius', label: '默认 trigger 圆角', usage: '默认 trigger 圆角' },

  // —— 宽度（对齐 Semi $width-colorPicker-*）——
  'width-color-picker-handle-border': { value: '2px', category: 'width', label: '把手宽度', usage: '把手宽度' },
  'width-color-picker-colorpickerinputnumber': { value: '58px', category: 'width', label: '数字输入器宽度', usage: '数组输入器宽度' },
  'width-color-picker-formatselect': { value: '80px', category: 'width', label: '格式选择宽度', usage: '格式选择下拉 Select 宽度' },
  'width-color-picker-defaulttrigger': { value: '24px', category: 'width', label: '默认 trigger 大小', usage: '默认 trigger 大小' },

  // —— 颜色（对齐 Semi $color-colorPicker-*）——
  'color-color-picker-handle-border': { value: 'var(--cd-color-white)', category: 'color', label: '把手边框颜色', usage: '把手边框颜色' },

  // —— 间距（对齐 Semi $spacing-colorPicker-*）——
  'spacing-color-picker-inputnumbersuffix-horizontal': { value: '4px', category: 'spacing', label: '百分比水平距离', usage: '数字输入框后百分比水平距离' },
  'spacing-color-picker-inputgroup-marginleft': { value: '4px', category: 'spacing', label: '输入区左距', usage: '颜色手动输入区域 左侧距离色块距离' },
  'spacing-color-picker-popover-padding': { value: '8px', category: 'spacing', label: '弹层内边距', usage: '弹层模式时整体内边距' },
  'spacing-color-picker-inputnumbersuffix-vertical': { value: '4px', category: 'spacing', label: '百分比垂直距离', usage: '数字输入框后百分比垂直距离' },
  'spacing-color-picker-slider-margintop': { value: '6px', category: 'spacing', label: '滑块上边距', usage: '滑动选择器上边距' },
  'spacing-color-picker-datapart-margintop': { value: '8px', category: 'spacing', label: '输入区上边距', usage: '颜色手动输入区域 上边距' },

  // —— 字体（对齐 Semi $font-colorPicker-*）——
  'font-color-picker-inputnumbersuffix-fontsize': { value: '14px', category: 'font', label: '百分比字号', usage: '颜色手动输入区域百分比字体大小' },

  // —— chenzy-design ColorPicker 实际消费的补充 token（Semi 无 / 命名差异；组件消费）——
  // trigger
  'color-picker-trigger-size': { value: 'var(--cd-width-color-picker-defaulttrigger)', category: 'width', label: 'trigger 尺寸', usage: 'trigger 边长（组件消费；对齐 Semi 默认 trigger 24px）' },
  'color-picker-trigger-radius': { value: 'var(--cd-radius-color-picker-defaulttrigger)', category: 'radius', label: 'trigger 圆角', usage: 'trigger 圆角（组件消费；对齐 Semi 默认 trigger 4px）' },
  'color-picker-trigger-border': { value: 'var(--cd-color-border)', category: 'color', label: 'trigger 边框色', usage: 'trigger 边框颜色（组件消费）' },
  // 校验态
  'color-picker-status-warning': { value: 'var(--cd-color-warning)', category: 'color', label: '警告边框色', usage: '校验态-警告边框颜色（组件消费）' },
  'color-picker-status-error': { value: 'var(--cd-color-danger)', category: 'color', label: '错误边框色', usage: '校验态-错误边框颜色（组件消费）' },
  // 浮层面板
  'color-picker-panel-bg': { value: 'var(--cd-color-bg-0)', category: 'color', label: '面板背景色', usage: '浮层面板背景色（组件消费）' },
  'color-picker-panel-shadow': { value: 'var(--cd-shadow-elevated)', category: 'other', label: '面板阴影', usage: '浮层面板阴影（组件消费）' },
  'color-picker-panel-radius': { value: 'var(--cd-border-radius-large)', category: 'radius', label: '面板圆角', usage: '浮层面板圆角（组件消费）' },
  'color-picker-panel-z': { value: 'var(--cd-z-popover)', category: 'other', label: '面板层级', usage: '浮层面板 z-index（组件消费）' },
  'color-picker-panel-width': { value: '240px', category: 'width', label: '面板宽度', usage: '浮层面板宽度（组件消费）' },
  'color-picker-panel-padding': { value: 'var(--cd-spacing-base-tight)', category: 'spacing', label: '面板内边距', usage: '浮层面板内边距（组件消费）' },
  'color-picker-panel-border': { value: 'var(--cd-color-border)', category: 'color', label: '内联面板边框色', usage: 'inline 面板边框颜色（组件消费）' },
  // saturation 方块
  'color-picker-saturation-height': { value: '140px', category: 'height', label: 'saturation 高度', usage: 'saturation 方块高度（组件消费）' },
  'color-picker-saturation-radius': { value: 'var(--cd-border-radius-medium)', category: 'radius', label: 'saturation 圆角', usage: 'saturation 方块圆角（组件消费）' },
  // 滑块条
  'color-picker-slider-height': { value: '10px', category: 'height', label: '滑块高度', usage: 'hue / alpha 滑块条高度（组件消费）' },
  'color-picker-slider-radius': { value: 'var(--cd-border-radius-full)', category: 'radius', label: '滑块圆角', usage: 'hue / alpha 滑块条圆角（组件消费）' },
  // 把手
  'color-picker-handle-size': { value: '12px', category: 'width', label: '把手尺寸', usage: '拖拽把手边长（组件消费）' },
  'color-picker-handle-border': { value: 'var(--cd-color-color-picker-handle-border)', category: 'color', label: '把手边框色', usage: '拖拽把手边框颜色（组件消费；对齐 Semi $color-colorPicker_handle-border）' },
  'color-picker-handle-border-width': { value: 'var(--cd-width-color-picker-handle-border)', category: 'width', label: '把手边框宽度', usage: '拖拽把手边框宽度（组件消费；对齐 Semi 2px）' },
  'color-picker-handle-radius': { value: 'var(--cd-radius-color-picker-handle)', category: 'radius', label: '把手圆角', usage: '拖拽把手圆角（组件消费；对齐 Semi full）' },
  'color-picker-handle-shadow': { value: 'var(--cd-shadow-elevated)', category: 'other', label: '把手阴影', usage: '拖拽把手阴影（组件消费）' },
  'color-picker-handle-outline': { value: 'var(--cd-color-border)', category: 'color', label: '把手轮廓色', usage: 'hue / alpha 把手描边颜色（组件消费）' },
  // 色块 / 预设
  'color-picker-swatch-size': { value: '20px', category: 'width', label: '色块尺寸', usage: '当前色块 / 预设色块边长（组件消费）' },
  'color-picker-swatch-radius': { value: 'var(--cd-border-radius-full)', category: 'radius', label: '当前色块圆角', usage: '当前选中色块圆角（组件消费）' },
  'color-picker-swatch-border': { value: 'var(--cd-color-border)', category: 'color', label: '色块边框色', usage: '当前色块 / 预设色块边框颜色（组件消费）' },
  'color-picker-preset-radius': { value: 'var(--cd-border-radius-small)', category: 'radius', label: '预设色块圆角', usage: '预设色块圆角（组件消费）' },
  // alpha 棋盘格 & 间距
  'color-picker-alpha-grid': { value: 'var(--cd-color-fill-1)', category: 'color', label: 'alpha 棋盘格色', usage: 'alpha 条透明棋盘格颜色（组件消费）' },
  'color-picker-section-gap': { value: 'var(--cd-spacing-base-tight)', category: 'spacing', label: '区块间距', usage: '面板内各区块顶部间距（组件消费）' },
  'color-picker-inner-gap': { value: 'var(--cd-spacing-tight)', category: 'spacing', label: '内部间距', usage: '滑块 / 输入区内部间距（组件消费）' },
  // 输入 / 格式区（复用 Input 共享 token）
  'color-picker-field-height': { value: 'var(--cd-height-input-small)', category: 'height', label: '输入区高度', usage: 'hex 输入 / 格式选择 / 吸管高度（组件消费）' },
  'color-picker-field-bg': { value: 'var(--cd-input-color-bg)', category: 'color', label: '输入区背景色', usage: '输入 / 选择 / 吸管背景（组件消费）' },
  'color-picker-field-border': { value: 'var(--cd-input-border)', category: 'color', label: '输入区边框色', usage: '输入 / 选择 / 吸管边框（组件消费）' },
  'color-picker-field-border-active': { value: 'var(--cd-input-border-active)', category: 'color', label: '输入区聚焦边框色', usage: '输入 / 选择 / 吸管聚焦边框（组件消费）' },
  'color-picker-field-radius': { value: 'var(--cd-input-radius)', category: 'radius', label: '输入区圆角', usage: '输入 / 选择 / 吸管圆角（组件消费）' },
  'color-picker-field-padding-x': { value: 'var(--cd-input-padding-x)', category: 'spacing', label: '输入水平内边距', usage: 'hex 输入水平内边距（组件消费）' },
  'color-picker-field-text': { value: 'var(--cd-input-color-text)', category: 'color', label: '输入文本色', usage: 'hex 输入文本颜色（组件消费）' },
  'color-picker-field-font-size': { value: 'var(--cd-font-size-small)', category: 'font', label: '输入区字号', usage: '输入 / 标签字号（组件消费）' },
  'color-picker-label-text': { value: 'var(--cd-color-text-2)', category: 'color', label: '标签文本色', usage: '格式标签 / 最近色标签文本颜色（组件消费）' },
} satisfies TokenGroup;
