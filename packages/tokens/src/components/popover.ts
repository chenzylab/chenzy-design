/**
 * Component tokens for Popover. 全量对齐 Semi Design（semi-foundation/popover/variables.scss，22 变量），
 * 并升级为带元数据的 TokenDef 结构以支持 DSM。
 * 值为 var() 引用我们的 alias / global token，或字面量（忠实翻译 Semi）。
 *
 * 命名规则：Semi `$` 前缀去除、下划线 `_` kebab 化、camelCase 小写收敛
 * （如 popover_withArrow → popover-witharrow）。
 * 映射：--semi-color-* → --cd-color-*；var(--semi-border-radius-*) → var(--cd-border-radius-*)；
 * $spacing 字面量映射到最近的 --cd-spacing-* 全局档（无对应档的保留字面量，如 6px）。
 * 箭头偏移的 Semi 计算 round($horizontal-rate * $width-tooltip_arrow) = round(0.24 * 24px)
 * = 6px，忠实翻译为字面量 6px（矫正因子本身非 CSS 变量，不建 token；tooltip 侧另有
 * tooltip-horizontal-rate 参与 calc）。
 */
import type { TokenGroup } from './token-def.js';

export const popoverTokens = {
  // —— Color ——
  'color-tooltip-arrow-icon-default': { value: 'unset', category: 'color', label: '箭头图标色', usage: '箭头图标' },
  'color-popover-bg-default': { value: 'var(--cd-color-bg-3)', category: 'color', label: '默认背景色', usage: '默认背景色' },
  'color-popover-border-default': { value: 'var(--cd-color-border)', category: 'color', label: '默认描边颜色', usage: '默认描边颜色' },
  'color-popover-arrow-border': { value: 'var(--cd-color-border)', category: 'color', label: '箭头描边颜色', usage: '箭头描边颜色' },
  'color-popover-arrow-bg': { value: 'var(--cd-color-bg-3)', category: 'color', label: '箭头默认背景色', usage: '箭头默认背景色' },

  // —— Width/Height ——
  'width-popover-arrow': { value: '24px', category: 'width', label: '水平箭头宽度', usage: '水平箭头宽度' },
  'height-popover-arrow': { value: '8px', category: 'height', label: '水平箭头高度', usage: '水平箭头高度' },
  'height-popover-arrow-vertical': { value: '24px', category: 'height', label: '垂直箭头高度', usage: '垂直箭头高度' },
  'width-popover-arrow-vertical': { value: '8px', category: 'width', label: '垂直箭头宽度', usage: '垂直箭头宽度' },
  'height-tooltip-arrow': { value: '8px', category: 'height', label: '水平箭头高度', usage: '（= height-popover-arrow）水平箭头高度' },
  'width-tooltip-arrow': { value: '24px', category: 'width', label: '水平箭头宽度', usage: '（= width-popover-arrow）水平箭头宽度' },
  'width-tooltip-arrow-vertical': { value: '8px', category: 'width', label: '垂直箭头宽度', usage: '（= width-popover-arrow-vertical）垂直箭头宽度' },
  'height-tooltip-arrow-vertical': { value: '24px', category: 'height', label: '垂直箭头高度', usage: '（= height-popover-arrow-vertical）垂直箭头高度' },
  'width-popover-title-border': { value: '1px', category: 'width', label: '标题下边框宽度', usage: '标题下边框宽度' },

  // —— Spacing ——
  'spacing-popover-title-padding': { value: 'var(--cd-spacing-tight)', category: 'spacing', label: '标题内边距', usage: '气泡卡片标题内边距' },
  'spacing-popover-witharrow-padding': { value: 'var(--cd-spacing-base-tight)', category: 'spacing', label: '带箭头标题内边距', usage: '带箭头的气泡卡片标题内边距' },
  'spacing-popover-arrow-adjusted-offset-y': { value: '6px', category: 'spacing', label: '垂直校正偏移量', usage: '垂直方向上的校正偏移量，主要修正三角形有棱角的问题' },
  'spacing-tooltip-arrow-adjusted-offset-y': { value: '6px', category: 'spacing', label: '垂直校正偏移量', usage: '（= popover-arrow-adjusted-offset-y）垂直方向上的校正偏移量，主要修正三角形有棱角的问题' },
  'spacing-tooltip-arrow-adjusted-offset-x': { value: '6px', category: 'spacing', label: '水平校正偏移量', usage: '水平方向上的校正偏移量（round(0.24 * 24px) = 6px），主要修正三角形有棱角的问题' },

  // —— Radius ——
  'radius-popover': { value: 'var(--cd-border-radius-medium)', category: 'radius', label: '气泡卡片圆角', usage: '气泡卡片的圆角大小' },

  // —— Filter ——
  'filter-popover-bg': { value: 'none', category: 'other', label: '背景滤镜', usage: '背景滤镜' },
} satisfies TokenGroup;
