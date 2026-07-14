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
  // 注：Semi popover/variables.scss 有 `$color-tooltip_arrow-icon-default: unset` override，
  // 但那是 Semi 各组件 scss 独立编译的局部覆盖；我们是全局平铺 CSS 变量，若在此重定义同名
  // token 会全局污染 Tooltip 的箭头色（把 grey-7 冲成 unset → 单 path 箭头不可见）。
  // Popover 箭头走双 path（color-popover-arrow-border/bg），不消费 tooltip-arrow-icon-default，
  // 故此处不再重定义该 token（对齐 Semi 语义：Popover 箭头颜色独立于 Tooltip）。
  'color-popover-bg-default': { value: 'var(--cd-color-bg-3)', category: 'color', label: '默认背景色', usage: '默认背景色' },
  'color-popover-border-default': { value: 'var(--cd-color-border)', category: 'color', label: '默认描边颜色', usage: '默认描边颜色' },
  'color-popover-arrow-border': { value: 'var(--cd-color-border)', category: 'color', label: '箭头描边颜色', usage: '箭头描边颜色' },
  'color-popover-arrow-bg': { value: 'var(--cd-color-bg-3)', category: 'color', label: '箭头默认背景色', usage: '箭头默认背景色' },

  // —— Width/Height ——
  // Popover 箭头尺寸 8px（Semi popover 覆写 tooltip 箭头为 8px）。Popover 用独立双 path Arrow，
  // 只消费 popover-arrow-* 尺寸，不再回写 tooltip-arrow-*（避免全局污染 Tooltip 的 7px 原值）。
  'width-popover-arrow': { value: '24px', category: 'width', label: '水平箭头宽度', usage: '水平箭头宽度' },
  'height-popover-arrow': { value: '8px', category: 'height', label: '水平箭头高度', usage: '水平箭头高度' },
  'height-popover-arrow-vertical': { value: '24px', category: 'height', label: '垂直箭头高度', usage: '垂直箭头高度' },
  'width-popover-arrow-vertical': { value: '8px', category: 'width', label: '垂直箭头宽度', usage: '垂直箭头宽度' },
  'width-popover-title-border': { value: '1px', category: 'width', label: '标题下边框宽度', usage: '标题下边框宽度' },

  // —— Spacing ——
  'spacing-popover-title-padding': { value: 'var(--cd-spacing-tight)', category: 'spacing', label: '标题内边距', usage: '气泡卡片标题内边距' },
  'spacing-popover-witharrow-padding': { value: 'var(--cd-spacing-base-tight)', category: 'spacing', label: '带箭头标题内边距', usage: '带箭头的气泡卡片标题内边距' },
  // Popover 垂直校正偏移 6px（Semi popover 覆写 tooltip 的 5px）。仅 Popover 消费，不回写 tooltip-*。
  'spacing-popover-arrow-adjusted-offset-y': { value: '6px', category: 'spacing', label: '垂直校正偏移量', usage: '垂直方向上的校正偏移量，主要修正三角形有棱角的问题' },
  // 水平校正偏移 round(0.24 * 24px) = 6px（Popover 专用；tooltip 侧用自己的 calc round 版本）。
  'spacing-popover-arrow-adjusted-offset-x': { value: '6px', category: 'spacing', label: '水平校正偏移量', usage: '水平方向上的校正偏移量（round(0.24 * 24px) = 6px），主要修正三角形有棱角的问题' },

  // —— Radius ——
  'radius-popover': { value: 'var(--cd-border-radius-medium)', category: 'radius', label: '气泡卡片圆角', usage: '气泡卡片的圆角大小' },

  // —— Filter ——
  'filter-popover-bg': { value: 'none', category: 'other', label: '背景滤镜', usage: '背景滤镜' },

  // 破坏性变更（对齐 Semi）：移除自造的 popover-bg/border/radius/shadow/z/title-color/
  // arrow-bg/arrow-border/witharrow-padding/title-padding/motion-* 中间变量层。
  // Popover.svelte 直接消费 Semi 同名原始 token（color-popover-bg-default / radius-popover /
  // shadow-elevated / z-popover / spacing-popover-* / color-popover-arrow-* 等），不再多一层。
  // 动画复用 Tooltip zoomIn（100ms + cubic-bezier，与 Semi popover animation.scss 值一致）。
} satisfies TokenGroup;
