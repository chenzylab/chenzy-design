/**
 * Component tokens for Tooltip. 全量对齐 Semi Design（semi-foundation/tooltip/variables.scss
 * 25 个），并升级为带元数据的 TokenDef 结构以支持 DSM。
 * 值为 var() 引用我们的 alias / global token，或字面量。
 * 末尾保留 chenzy-design Tooltip（及 Popover 复用）实际消费的补充 token（Semi 无 / 命名差异；组件消费），
 * 值对齐 Semi。
 *
 * 注：
 *  - Semi 的 rgba(var(--semi-grey-7), 1) 我们对应 var(--cd-color-grey-7)（= #41464c，palette emit 为 color）。
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

  // —— 颜色 ——
  'color-tooltip-bg-default': { value: 'var(--cd-color-grey-7)', category: 'color', label: '默认背景色', usage: '工具提示默认背景色' },
  'color-tooltip-text-default': { value: 'var(--cd-color-bg-0)', category: 'color', label: '默认文字颜色', usage: '工具提示默认文字颜色' },
  'color-tooltip-icon-default': { value: 'var(--cd-color-grey-7)', category: 'color', label: '默认图标颜色', usage: '工具提示默认图标颜色' },
  'color-tooltip-arrow-icon-default': { value: 'var(--cd-color-tooltip-icon-default)', category: 'color', label: '箭头颜色', usage: '工具提示默认小三角箭头颜色' },

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

  // —— 滤镜（Semi $filter-tooltip-bg） ——
  'filter-tooltip-bg': { value: 'none', category: 'other', label: '背景滤镜', usage: '工具提示背景滤镜' },

  // —— chenzy-design Tooltip 实际消费的补充 token（Semi 命名差异；组件消费），值对齐 Semi ——
  // Semi Tooltip 固定 dark（grey-7 背景），无 light/status/maxWidth；这些越界 token 已移除。
  'tooltip-bg': { value: 'var(--cd-color-tooltip-bg-default)', category: 'color', label: '浮层背景', usage: '浮层背景（组件消费，对齐 Semi grey-7）' },
  'tooltip-color': { value: 'var(--cd-color-tooltip-text-default)', category: 'color', label: '浮层文字', usage: '浮层文字（组件消费，对齐 Semi bg-0）' },
  'tooltip-radius': { value: 'var(--cd-radius-tooltip)', category: 'radius', label: '浮层圆角', usage: '浮层圆角（组件消费，对齐 Semi radius-medium）' },
  'tooltip-padding': { value: 'var(--cd-spacing-tooltip-content-paddingtop) var(--cd-spacing-tooltip-content-paddingright)', category: 'spacing', label: '浮层内边距', usage: '浮层内边距（组件消费，对齐 Semi 8/12）' },
  'tooltip-font-size': { value: 'var(--cd-font-tooltip-fontsize)', category: 'font', label: '浮层字号', usage: '浮层字号（组件消费，对齐 Semi regular 14）' },
  'tooltip-max-width': { value: 'var(--cd-width-tooltip)', category: 'width', label: '浮层最大宽度', usage: '浮层 max-width（组件消费，对齐 Semi 240px）' },
  'tooltip-z': { value: 'var(--cd-z-tooltip)', category: 'other', label: '浮层层级', usage: '浮层 z-index（组件消费）' },
  'tooltip-line-height': { value: 'var(--cd-line-height-regular)', category: 'font', label: '浮层行高', usage: '浮层文本行高（组件消费）' },
  'tooltip-motion-duration': { value: 'var(--cd-motion-duration-fast)', category: 'animation', label: '动画时长', usage: '显隐动画时长（组件消费）' },
  'tooltip-motion-easing': { value: 'var(--cd-motion-ease-standard)', category: 'animation', label: '动画曲线', usage: '显隐动画曲线（组件消费）' },
} satisfies TokenGroup;
