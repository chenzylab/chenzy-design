/**
 * Component tokens for Slider. 曾全量对齐 Semi Design（semi-foundation/slider/variables.scss），
 * 现按 DSM「Token 精简原则」清理孤儿：仅保留组件实际消费的 token 及其中间节点，删去
 * 组件未用的 Semi 定位/dot 状态态变量。带元数据的 TokenDef 结构以支持 DSM。
 * 值为 var() 引用我们的 alias / global token，或字面量。
 * 末尾为 chenzy-design Slider 实际消费的补充 token（Semi 无 / 命名差异；组件消费）。
 *
 * 注：
 *  - Semi 的 var(--semi-color-white) 我们无对应 --cd-color-white alias，
 *    用最接近的 --cd-color-text-inverse（= #ffffff）替代，未发明新 alias。
 *  - Semi $color-slider_rail: rgba(0, 0, 0, 0.65) 无注释、无 --semi 引用，忠实保留字面量。
 *  - Semi $spacing-slider-* 负值忠实翻译为 CSS calc(-1 * ...)。
 *  - Semi var(--semi-border-radius-small) → var(--cd-border-radius-small)。
 */
import type { TokenGroup } from './token-def.js';

export const sliderTokens = {
  // —— Color ——
  'color-slider-handle-bg-default': { value: 'var(--cd-color-text-inverse)', category: 'color', label: '手柄背景色', usage: '滑动条圆形按钮颜色 - 默认态' },
  'color-slider-mark-text-default': { value: 'var(--cd-color-text-2)', category: 'color', label: '刻度文字色', usage: '滑动条刻度文字颜色' },
  'color-slider-rail-bg-default': { value: 'var(--cd-color-fill-0)', category: 'color', label: '轨道背景色', usage: '滑动条轨道颜色 - 未填充' },
  'color-slider-track-bg-default': { value: 'var(--cd-color-primary)', category: 'color', label: '已填充轨道色', usage: '滑动条轨道颜色 - 已填充' },

  // —— Width / Height ——
  'height-slider-rail': { value: '4px', category: 'height', label: '未填充轨道高度', usage: '滚动条未填充轨道高度' },
  'width-slider-handle': { value: '24px', category: 'width', label: '手柄宽度', usage: '滚动条圆形按钮宽度' },
  'width-slider-dot': { value: '4px', category: 'width', label: '刻度点宽度', usage: '滚动条圆形刻度点宽度' },
  'width-slider-handle-focus': { value: '2px', category: 'width', label: '手柄聚焦轮廓宽度', usage: '圆形按钮轮廓 - 聚焦' },

  // —— chenzy-design Slider 实际消费的补充 token（Semi 无 / 命名差异；组件消费） ——
  'slider-rail-height': { value: 'var(--cd-height-slider-rail)', category: 'height', label: '轨道高度', usage: '滑块轨道高度（组件消费）' },
  'slider-rail-bg': { value: 'var(--cd-color-slider-rail-bg-default)', category: 'color', label: '轨道背景色', usage: '滑块未填充轨道背景（组件消费）' },
  'slider-track-bg': { value: 'var(--cd-color-slider-track-bg-default)', category: 'color', label: '已填充轨道色', usage: '滑块已填充轨道背景（组件消费）' },
  'slider-handle-size': { value: 'var(--cd-width-slider-handle)', category: 'width', label: '手柄尺寸', usage: '滑块手柄直径（组件消费）' },
  'slider-handle-bg': { value: 'var(--cd-color-slider-handle-bg-default)', category: 'color', label: '手柄背景色', usage: '滑块手柄背景（组件消费）' },
  'slider-handle-border': { value: 'var(--cd-color-slider-track-bg-default)', category: 'color', label: '手柄描边色', usage: '滑块手柄描边（组件消费）' },
  'slider-mark-color': { value: 'var(--cd-color-slider-mark-text-default)', category: 'color', label: '刻度文字色', usage: '滑块刻度文字颜色（组件消费）' },
  'slider-radius': { value: 'var(--cd-border-radius-full)', category: 'radius', label: '轨道圆角', usage: '滑块轨道圆角（组件消费）' },
  'slider-status-warning': { value: 'var(--cd-color-warning)', category: 'color', label: '警示态色', usage: 'warning 校验态轨道/手柄色（组件消费）' },
  'slider-status-error': { value: 'var(--cd-color-danger)', category: 'color', label: '错误态色', usage: 'error 校验态轨道/手柄色（组件消费）' },
  'slider-handle-border-width': { value: 'var(--cd-width-slider-handle-focus)', category: 'width', label: '手柄描边宽度', usage: '滑块手柄描边宽度（组件消费）' },
  'slider-handle-radius': { value: 'var(--cd-border-radius-full)', category: 'radius', label: '手柄圆角', usage: '滑块手柄圆角（组件消费）' },
  'slider-handle-shadow-hover': { value: 'var(--cd-shadow-elevated)', category: 'other', label: '手柄悬停阴影', usage: '滑块手柄悬停态阴影（组件消费）' },
  'slider-handle-focus-ring': { value: 'var(--cd-focus-ring)', category: 'other', label: '手柄聚焦轮廓', usage: '滑块手柄聚焦轮廓阴影（组件消费）' },
  'slider-handle-transition-duration': { value: 'var(--cd-motion-duration-fast)', category: 'animation', label: '手柄过渡时长', usage: '滑块手柄阴影过渡时长（组件消费）' },
  'slider-handle-transition-easing': { value: 'var(--cd-motion-ease-standard)', category: 'animation', label: '手柄过渡曲线', usage: '滑块手柄阴影过渡曲线（组件消费）' },
  'slider-dot-size': { value: 'calc(2 * var(--cd-width-slider-dot))', category: 'width', label: '刻度点尺寸', usage: '滑块步进刻度点直径（组件消费）' },
  'slider-dot-bg': { value: 'var(--cd-color-bg-0)', category: 'color', label: '刻度点背景色', usage: '滑块步进刻度点背景（组件消费）' },
  'slider-dot-border': { value: 'var(--cd-color-border)', category: 'color', label: '刻度点描边色', usage: '滑块步进刻度点默认描边（组件消费）' },
  'slider-dot-border-active': { value: 'var(--cd-color-primary)', category: 'color', label: '刻度点激活描边色', usage: '滑块段内刻度点激活描边（组件消费）' },
  'slider-track-disabled-bg': { value: 'var(--cd-color-text-3)', category: 'color', label: '禁用轨道色', usage: '禁用态已填充轨道背景（组件消费）' },
  'slider-tip-bg': { value: 'var(--cd-color-bg-inverse)', category: 'color', label: '气泡背景色', usage: '数值气泡背景（组件消费）' },
  'slider-tip-color': { value: 'var(--cd-color-text-inverse)', category: 'color', label: '气泡文案色', usage: '数值气泡文案颜色（组件消费）' },
  'slider-tip-radius': { value: 'var(--cd-border-radius-small)', category: 'radius', label: '气泡圆角', usage: '数值气泡圆角（组件消费）' },
  'slider-tip-font-size': { value: 'var(--cd-font-size-small)', category: 'font', label: '气泡字号', usage: '数值气泡字号（组件消费）' },
  'slider-mark-font-size': { value: 'var(--cd-font-size-small)', category: 'font', label: '刻度标签字号', usage: '滑块刻度标签字号（组件消费）' },
  'slider-boundary-color': { value: 'var(--cd-color-text-2)', category: 'color', label: '边界值文案色', usage: '边界值标签文案颜色（组件消费）' },
  'slider-boundary-font-size': { value: 'var(--cd-font-size-small)', category: 'font', label: '边界值字号', usage: '边界值标签字号（组件消费）' },
  'slider-padding': { value: 'var(--cd-spacing-tight)', category: 'spacing', label: '整体内边距', usage: '滑块交叉轴内边距（组件消费）' },
  'slider-gap': { value: 'var(--cd-spacing-tight)', category: 'spacing', label: '标签间距', usage: '气泡/刻度/边界与轨道的间距（组件消费）' },
  'slider-boundary-gap': { value: 'var(--cd-spacing-base)', category: 'spacing', label: '边界值间距', usage: '边界值标签与轨道的间距（组件消费）' },
} satisfies TokenGroup;
