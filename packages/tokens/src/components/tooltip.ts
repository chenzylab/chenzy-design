/**
 * Component tokens for Tooltip. 严格全量对齐 Semi Design
 * （semi-foundation/tooltip/variables.scss + animation.scss），并升级为带元数据的 TokenDef
 * 结构以支持 DSM。值为 var() 引用我们的 alias / global token，或字面量（忠实翻译 Semi）。
 *
 * 破坏性变更（对齐 Semi）：
 *  - 移除自造的中间变量层（tooltip-bg / tooltip-color / tooltip-radius / tooltip-padding /
 *    tooltip-font-size / tooltip-max-width / tooltip-line-height / tooltip-motion-* 等）。
 *    组件 CSS 直接消费 Semi 同名原始 token（color-tooltip-bg-default / radius-tooltip /
 *    width-tooltip / font-tooltip-fontsize …），与 Semi tooltip.scss 一一对应，不再多一层。
 *  - 补齐 Semi animation.scss 的 4 个动画 token（in/out 时长 100ms、in/out cubic-bezier 缓动），
 *    以及 zoom 关键帧参数。此前误用全局 --cd-motion-duration-fast / --cd-motion-ease-standard，
 *    值与 Semi 不符，已改为 Semi 字面量。
 *  - 箭头单 path + fill=currentColor（对齐 Semi TriangleArrow）：颜色走
 *    color-tooltip-arrow-icon-default（= color-tooltip-icon-default = grey-7）。
 *
 * 注：
 *  - Semi 的 rgba(var(--semi-grey-7), 1) 对应 var(--cd-color-grey-7)（= #41464c，palette emit 为 color）。
 *  - Semi 的 var(--semi-color-bg-0) 对应 var(--cd-color-bg-0)。
 *  - Semi calc（$spacing-tooltip_arrow_adjusted_offset-x = round($horizontal-rate * $width-tooltip_arrow)）
 *    忠实翻译为 CSS round(...)。
 *  - $filter-tooltip-bg: none 字面量保留。
 */
import type { TokenGroup } from './token-def.js';

export const tooltipTokens = {
  // —— 定位矫正因子（Semi $horizontal-rate / $vertical-rate；平铺命名空间加 tooltip- 前缀防冲突） ——
  'tooltip-horizontal-rate': { value: '0.24', category: 'other', label: '水平矫正因子', usage: '水平方向矫正因子' },
  'tooltip-vertical-rate': { value: '0', category: 'other', label: '垂直矫正因子', usage: '垂直方向矫正因子' },

  // —— zoom 动画参数（Semi $motion-zoom_*） ——
  'tooltip-motion-zoom-scale-from': { value: '0.8', category: 'animation', label: '初始缩放', usage: '初始缩放 - 动画用' },
  'tooltip-motion-zoom-opacity-from': { value: '0', category: 'animation', label: '初始透明度', usage: '初始透明度 - 动画用' },
  'tooltip-motion-zoom-opacity-to': { value: '1', category: 'animation', label: '最终透明度', usage: '最终透明度 - 动画用' },

  // —— 进出场动画时长 / 缓动（Semi animation.scss，字面量 100ms + cubic-bezier） ——
  'animation-duration-tooltip-in': { value: '100ms', category: 'animation', label: '弹出动画时长', usage: 'tooltip-弹出动画-动画持续时间' },
  'animation-duration-tooltip-out': { value: '100ms', category: 'animation', label: '收起动画时长', usage: 'tooltip-收起动画-动画持续时间' },
  'animation-function-tooltip-in': { value: 'cubic-bezier(0.215, 0.61, 0.355, 1)', category: 'animation', label: '弹出动画曲线', usage: 'tooltip-弹出动画-动画插值函数' },
  'animation-function-tooltip-out': { value: 'cubic-bezier(0.215, 0.61, 0.355, 1)', category: 'animation', label: '收起动画曲线', usage: 'tooltip-收起动画-动画插值函数' },

  // —— 颜色 ——
  'color-tooltip-bg-default': { value: 'var(--cd-color-grey-7)', category: 'color', label: '默认背景色', usage: '工具提示默认背景色' },
  'color-tooltip-text-default': { value: 'var(--cd-color-bg-0)', category: 'color', label: '默认文字颜色', usage: '工具提示默认文字颜色' },
  'color-tooltip-icon-default': { value: 'var(--cd-color-grey-7)', category: 'color', label: '默认图标颜色', usage: '工具提示默认图标颜色' },
  'color-tooltip-arrow-icon-default': { value: 'var(--cd-color-tooltip-icon-default)', category: 'color', label: '箭头颜色', usage: '工具提示默认小三角箭头颜色（单 path fill=currentColor 走此色）' },

  // —— 圆角 ——
  'radius-tooltip': { value: 'var(--cd-border-radius-medium)', category: 'radius', label: '默认圆角', usage: '工具提示默认圆角' },

  // —— 内容内边距 ——
  'spacing-tooltip-content-paddingleft': { value: 'var(--cd-spacing-base-tight)', category: 'spacing', label: '内容左内边距', usage: '工具提示内容左侧内边距' },
  'spacing-tooltip-content-paddingright': { value: 'var(--cd-spacing-base-tight)', category: 'spacing', label: '内容右内边距', usage: '工具提示内容右侧内边距' },
  'spacing-tooltip-content-paddingtop': { value: 'var(--cd-spacing-tight)', category: 'spacing', label: '内容顶内边距', usage: '工具提示内容顶部内边距' },
  'spacing-tooltip-content-paddingbottom': { value: 'var(--cd-spacing-tight)', category: 'spacing', label: '内容底内边距', usage: '工具提示内容底部内边距' },

  // —— 字号 / 尺寸 ——
  'font-tooltip-fontsize': { value: 'var(--cd-font-size-regular)', category: 'font', label: '文本字号', usage: '工具提示文本字号' },
  'width-tooltip': { value: '240px', category: 'width', label: '默认宽度', usage: '工具提示宽度 - 默认' },
  'width-tooltip-arrow': { value: '24px', category: 'width', label: '箭头宽度(水平)', usage: '工具提示小三角箭头宽度 - 水平' },
  'height-tooltip-arrow': { value: '7px', category: 'height', label: '箭头高度(水平)', usage: '工具提示小三角箭头高度 - 水平' },

  // —— 箭头 - 垂直 ——
  'height-tooltip-arrow-vertical': { value: '24px', category: 'height', label: '箭头高度(垂直)', usage: '工具提示小三角箭头高度 - 垂直' },
  'width-tooltip-arrow-vertical': { value: '7px', category: 'width', label: '箭头宽度(垂直)', usage: '工具提示小三角箭头宽度 - 垂直' },

  // —— 箭头偏移量 ——
  'spacing-tooltip-arrow-offset-x': { value: '1px', category: 'spacing', label: '箭头水平偏移', usage: '水平方向渲染会有缝隙，所以加个偏移量' },
  'spacing-tooltip-arrow-offset-y': { value: '1px', category: 'spacing', label: '箭头垂直偏移', usage: '垂直方向渲染会有缝隙，所以加个偏移量' },
  'spacing-tooltip-arrow-adjusted-offset-y': { value: '5px', category: 'spacing', label: '箭头垂直校正偏移', usage: '垂直方向上的校正偏移量，主要修正三角形有棱角的问题' },
  'spacing-tooltip-arrow-adjusted-offset-x': { value: 'round(calc(var(--cd-tooltip-horizontal-rate) * var(--cd-width-tooltip-arrow)), 1px)', category: 'spacing', label: '箭头水平校正偏移', usage: '水平方向上的校正偏移量，主要修正三角形有棱角的问题' },

  // 层级：Semi tooltip.scss z-index 被注释（TODO 收敛），组件默认 zIndex=1060，
  // 直连全局阶名 --cd-z-tooltip（=1060，scales.zIndex emit），不另建组件中间变量。

  // —— 滤镜（Semi $filter-tooltip-bg） ——
  'filter-tooltip-bg': { value: 'none', category: 'other', label: '背景滤镜', usage: '工具提示背景滤镜' },
} satisfies TokenGroup;
