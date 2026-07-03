/**
 * Component tokens for Tag / Avatar / Badge / Card（M4 Show）。四个展示类组件共用本文件。
 * 曾全量镜像 Semi Design（tag/avatar/badge/card variables.scss），后按 dsm.spec「Token 精简原则」
 * 收敛为只保留四组件实际消费的 token（及其被消费值引用的中间节点），删除孤儿。
 * token 为带元数据的 TokenDef 结构以支持 DSM。值为 var() 引用我们的 alias / global token，
 * 或字面量。末尾保留 chenzy-design 四组件实际消费的补充 token（短名，Semi 无 / 命名差异；组件消费）。
 *
 * 映射约定：
 *  - Semi `$xxx_yyy` / `$xxx-yyy` → kebab（各组件用自己前缀 tag- / avatar- / badge- / card-）。
 *  - var(--semi-color-*) → var(--cd-color-*)；var(--semi-color-white) → var(--cd-color-text-inverse)
 *    （无 --cd-color-white alias，用最接近的 #ffffff）。
 *  - $spacing-* → var(--cd-spacing-*)；$font-size-* → var(--cd-font-size-*)；
 *    $font-weight-bold/regular → var(--cd-font-weight-bold/regular)；
 *    $border-thickness-control → var(--cd-border-thickness-control)。
 *  - var(--semi-border-radius-*) → var(--cd-border-radius-*)；var(--semi-shadow-elevated) → var(--cd-shadow-elevated)。
 *  - Semi ai 色板（--semi-color-ai-purple / --semi-color-ai-general / --semi-ai-*）我们无对应 alias，
 *    统一映射到最接近的 --cd-color-primary（AI Tag 视觉退化为主色，见报告视觉变化点）。
 *  - Semi `var(--semi-color-default)` 无对应 alias，用 --cd-color-fill-1（灰底）近似。
 *  - `rgba(var(--semi-grey-N), a)`：我们的 grey 是 hex 非 rgb 三元组，改用 color-mix / 直接取 grey-N。
 *  - 组件 token 名（color-tag-* / width-avatar-* …）与 alias / global 层不同名，var() 无自引用死循环。
 */
import type { TokenGroup } from './token-def.js';

export const displayTokens = {
  // ============================== Tag ==============================

  'height-tag-small': { value: '20px', category: 'height', label: '小尺寸标签高度', usage: '小尺寸标签高度' },
  'height-tag-large': { value: '24px', category: 'height', label: '大尺寸标签高度', usage: '大尺寸标签高度' },
  'radius-tag': { value: 'var(--cd-border-radius-small)', category: 'radius', label: '标签圆角', usage: '标签圆角大小' },

  'spacing-tag-small-paddingy': { value: '2px', category: 'spacing', label: '小标签垂直内边距', usage: '小尺寸标签垂直方向内边距' },
  'spacing-tag-small-paddingx': { value: 'var(--cd-spacing-tight)', category: 'spacing', label: '小标签水平内边距', usage: '小尺寸标签水平方向内边距' },

  'spacing-tag-large-paddingy': { value: '4px', category: 'spacing', label: '大标签垂直内边距', usage: '大尺寸标签垂直方向内边距' },

  'color-tag-close-icon-default': { value: 'var(--cd-color-text-2)', category: 'color', label: '关闭按钮色', usage: '可删除的标签删除按钮颜色' },
  'color-tag-close-icon-hover': { value: 'var(--cd-color-text-1)', category: 'color', label: '关闭按钮悬浮色', usage: '可删除的标签删除按钮颜色 - 悬浮' },

  // ============================== Avatar ==============================
  'color-avatar-default-border-default': { value: 'var(--cd-color-bg-1)', category: 'color', label: '头像描边色', usage: '头像描边颜色' },

  'width-avatar-extra-small': { value: '24px', category: 'width', label: '超小头像尺寸', usage: '头像尺寸 - 超小' },

  'width-avatar-small': { value: '32px', category: 'width', label: '小头像尺寸', usage: '头像尺寸 - 小' },
  'width-avatar-default': { value: '40px', category: 'width', label: '默认头像尺寸', usage: '头像尺寸 - 默认' },
  'width-avatar-medium': { value: '48px', category: 'width', label: '中头像尺寸', usage: '头像尺寸 - 中' },
  'width-avatar-large': { value: '72px', category: 'width', label: '大头像尺寸', usage: '头像尺寸 - 大' },

  'width-avatar-extra-large': { value: '128px', category: 'width', label: '超大头像尺寸', usage: '头像尺寸 - 超大' },

  'width-avatar-additional-border': { value: '1.5px', category: 'width', label: '额外描边尺寸', usage: '额外描边尺寸' },
  'color-avatar-additional-border': { value: 'var(--cd-color-primary)', category: 'color', label: '额外描边色', usage: '额外描边颜色' },
  'spacing-avatar-additional-bordergap': { value: '2px', category: 'spacing', label: '额外描边内间距', usage: '额外描边与内侧间距' },
  // 额外描边呼吸动画（对齐 Semi avatar/animation.scss）
  'motion-avatar-additional-border-duration': { value: '800ms', category: 'other', label: '额外描边动画时长', usage: '额外描边呼吸动画持续时间' },
  'motion-avatar-additional-border-scale-end': { value: '1.15', category: 'other', label: '额外描边动画终态缩放', usage: '额外描边呼吸动画结束缩放比例' },

  // —— Avatar 16 档语义色板（对齐 Semi avatar/mixin.scss：bg=<color>-3, text=white）——
  // 已有的全局色阶直接引用 --cd-color-<c>-3；Semi 独有的 10 档以 Semi -3 实测 hex 内联。
  'color-avatar-amber-bg': { value: '#f6d86f', category: 'color', label: 'amber 头像背景', usage: 'amber 头像背景色（Semi amber-3）' },
  'color-avatar-blue-bg': { value: 'var(--cd-color-blue-3)', category: 'color', label: 'blue 头像背景', usage: 'blue 头像背景色（blue-3）' },
  'color-avatar-cyan-bg': { value: '#58cbd3', category: 'color', label: 'cyan 头像背景', usage: 'cyan 头像背景色（Semi cyan-3）' },
  'color-avatar-green-bg': { value: 'var(--cd-color-green-3)', category: 'color', label: 'green 头像背景', usage: 'green 头像背景色（green-3）' },
  'color-avatar-grey-bg': { value: 'var(--cd-color-grey-3)', category: 'color', label: 'grey 头像背景', usage: 'grey 头像背景色（grey-3）' },
  'color-avatar-indigo-bg': { value: '#8090d3', category: 'color', label: 'indigo 头像背景', usage: 'indigo 头像背景色（Semi indigo-3）' },
  'color-avatar-light-blue-bg': { value: '#62c3f5', category: 'color', label: 'light-blue 头像背景', usage: 'light-blue 头像背景色（Semi light-blue-3）' },
  'color-avatar-light-green-bg': { value: '#add37e', category: 'color', label: 'light-green 头像背景', usage: 'light-green 头像背景色（Semi light-green-3）' },
  'color-avatar-lime-bg': { value: '#b7e35b', category: 'color', label: 'lime 头像背景', usage: 'lime 头像背景色（Semi lime-3）' },
  'color-avatar-orange-bg': { value: 'var(--cd-color-orange-3)', category: 'color', label: 'orange 头像背景', usage: 'orange 头像背景色（orange-3）' },
  'color-avatar-pink-bg': { value: '#f27396', category: 'color', label: 'pink 头像背景', usage: 'pink 头像背景色（Semi pink-3）' },
  'color-avatar-purple-bg': { value: '#c96fd1', category: 'color', label: 'purple 头像背景', usage: 'purple 头像背景色（Semi purple-3）' },
  'color-avatar-red-bg': { value: 'var(--cd-color-red-3)', category: 'color', label: 'red 头像背景', usage: 'red 头像背景色（red-3）' },
  'color-avatar-teal-bg': { value: '#54d1c1', category: 'color', label: 'teal 头像背景', usage: 'teal 头像背景色（Semi teal-3）' },
  'color-avatar-violet-bg': { value: '#a67fdd', category: 'color', label: 'violet 头像背景', usage: 'violet 头像背景色（Semi violet-3）' },
  'color-avatar-yellow-bg': { value: 'var(--cd-color-yellow-3)', category: 'color', label: 'yellow 头像背景', usage: 'yellow 头像背景色（yellow-3）' },
  'color-avatar-palette-text': { value: '#fff', category: 'color', label: '语义色板头像文字色', usage: '16 档语义色头像文字色（对齐 Semi：统一白字）' },

  'radius-avatar-default': { value: '3px', category: 'radius', label: '默认头像圆角', usage: '默认尺寸头像的圆角' },

  // ============================== Badge ==============================

  'color-badge-danger-solid-bg-default': { value: 'var(--cd-color-danger)', category: 'color', label: '危险徽标背景', usage: '背景颜色 - 危险' },

  'width-badge-dot': { value: '8px', category: 'width', label: '点状徽标宽度', usage: '点状徽标宽度' },

  'height-badge-count': { value: '18px', category: 'height', label: '数字徽标高度', usage: '数字徽标宽度' },

  // ============================== Card ==============================
  'color-card-bg-default': { value: 'var(--cd-color-bg-0)', category: 'color', label: '卡片背景色', usage: '卡片背景颜色' },
  'color-card-border': { value: 'var(--cd-color-border)', category: 'color', label: '卡片描边色', usage: '卡片描边颜色' },
  'color-card-title-text': { value: 'var(--cd-color-text-0)', category: 'color', label: '卡片标题文字色', usage: '卡片标题文字颜色' },
  'color-card-description-text': { value: 'var(--cd-color-text-2)', category: 'color', label: '卡片描述文字色', usage: '卡片描述文字颜色' },
  'color-card-body-text': { value: 'var(--cd-color-text-1)', category: 'color', label: '卡片正文文字色', usage: '卡片正文文字颜色' },

  'font-card-title-fontweight': { value: '700', category: 'font', label: '卡片标题字重', usage: '卡片文字字重 - 标题' },
  'font-card-title-fontsize': { value: 'var(--cd-font-size-header-6)', category: 'font', label: '卡片标题字号', usage: '卡片文字大小 - 标题' },

  'radius-card': { value: 'var(--cd-border-radius-medium)', category: 'radius', label: '卡片圆角', usage: '卡片圆角' },

  'shadow-card': { value: 'var(--cd-shadow-elevated)', category: 'other', label: '卡片阴影', usage: '卡片阴影' },

  'spacing-card-padding': { value: 'var(--cd-spacing-base-loose)', category: 'spacing', label: '卡片内边距', usage: '卡片内边距' },

  // ====================================================================
  // chenzy-design 四组件实际消费的补充 token（短名，Semi 无 / 命名差异；组件消费）。
  // 值 var() 到上方对齐 Semi 的组件 token 或 alias，形成单向引用（无自引用死循环）。
  // ====================================================================
  // —— Tag（组件消费） ——
  'tag-height-default': { value: 'var(--cd-height-tag-small)', category: 'height', label: '默认标签高度', usage: '默认标签高度（组件消费；对齐 Semi small=20px）' },
  'tag-height-small': { value: 'var(--cd-height-tag-small)', category: 'height', label: '小标签高度', usage: '小标签高度（组件消费）' },
  'tag-height-large': { value: 'var(--cd-height-tag-large)', category: 'height', label: '大标签高度', usage: '大标签高度（组件消费）' },
  'tag-padding-x': { value: 'var(--cd-spacing-tag-small-paddingx)', category: 'spacing', label: '标签水平内边距', usage: '标签水平内边距（组件消费）' },
  'tag-padding-y': { value: 'var(--cd-spacing-tag-small-paddingy)', category: 'spacing', label: '标签垂直内边距', usage: 'default/small 垂直内边距（组件消费）' },
  'tag-padding-y-large': { value: 'var(--cd-spacing-tag-large-paddingy)', category: 'spacing', label: '大标签垂直内边距', usage: 'large 垂直内边距（组件消费）' },
  'tag-radius': { value: 'var(--cd-radius-tag)', category: 'radius', label: '标签圆角', usage: '标签圆角（组件消费）' },
  'tag-font-size': { value: 'var(--cd-font-size-small)', category: 'font', label: '标签字号', usage: '标签字号（组件消费）' },
  'tag-gap': { value: 'var(--cd-spacing-extra-tight)', category: 'spacing', label: '标签内元素间距', usage: '标签内 icon/文本间距（组件消费）' },
  'tag-close-color': { value: 'var(--cd-color-tag-close-icon-default)', category: 'color', label: '关闭按钮色', usage: '关闭按钮颜色（组件消费）' },
  'tag-close-color-hover': { value: 'var(--cd-color-tag-close-icon-hover)', category: 'color', label: '关闭按钮悬浮色', usage: '关闭按钮悬浮颜色（组件消费）' },

  // —— Avatar（组件消费；短名映射到 width-avatar-*） ——
  'avatar-size-extra-small': { value: 'var(--cd-width-avatar-extra-small)', category: 'width', label: '超小头像尺寸', usage: '超小头像尺寸（组件消费）' },
  'avatar-size-small': { value: 'var(--cd-width-avatar-small)', category: 'width', label: '小头像尺寸', usage: '小头像尺寸（组件消费）' },
  'avatar-size-default': { value: 'var(--cd-width-avatar-default)', category: 'width', label: '默认头像尺寸', usage: '默认头像尺寸（组件消费）' },
  'avatar-size-medium': { value: 'var(--cd-width-avatar-medium)', category: 'width', label: '中头像尺寸', usage: '中头像尺寸（组件消费）' },
  'avatar-size-large': { value: 'var(--cd-width-avatar-large)', category: 'width', label: '大头像尺寸', usage: '大头像尺寸（组件消费）' },
  'avatar-size-extra-large': { value: 'var(--cd-width-avatar-extra-large)', category: 'width', label: '超大头像尺寸', usage: '超大头像尺寸（组件消费）' },
  'avatar-bg': { value: 'var(--cd-color-fill-1)', category: 'color', label: '头像背景色', usage: '文字/缺省头像背景（组件消费；Semi 头像文字底为 fill）' },
  'avatar-color': { value: 'var(--cd-color-text-1)', category: 'color', label: '头像文字色', usage: '头像文字颜色（组件消费）' },
  'avatar-border': { value: 'var(--cd-color-avatar-default-border-default)', category: 'color', label: '头像描边色', usage: '头像组描边颜色（组件消费）' },
  'avatar-radius': { value: 'var(--cd-radius-avatar-default)', category: 'radius', label: '方形头像圆角', usage: '方形 avatar 圆角（组件消费；圆形由 --circle 规则用 full）' },
  // border 呼吸描边环（组件消费；短名映射到 *-additional-border-*）
  'avatar-additional-border-width': { value: 'var(--cd-width-avatar-additional-border)', category: 'width', label: '呼吸描边宽度', usage: '额外描边环宽度（组件消费）' },
  'avatar-additional-border-color': { value: 'var(--cd-color-avatar-additional-border)', category: 'color', label: '呼吸描边色', usage: '额外描边环颜色（组件消费）' },
  'avatar-additional-border-gap': { value: 'var(--cd-spacing-avatar-additional-bordergap)', category: 'spacing', label: '呼吸描边内间距', usage: '额外描边环与头像间距（组件消费）' },
  'avatar-additional-border-duration': { value: 'var(--cd-motion-avatar-additional-border-duration)', category: 'other', label: '呼吸动画时长', usage: '额外描边环呼吸动画时长（组件消费）' },
  'avatar-additional-border-scale-end': { value: 'var(--cd-motion-avatar-additional-border-scale-end)', category: 'other', label: '呼吸动画终态缩放', usage: '额外描边环呼吸动画结束缩放（组件消费）' },
  // 16 档语义色板（组件消费；短名映射到 color-avatar-<c>-bg）
  'avatar-amber-bg': { value: 'var(--cd-color-avatar-amber-bg)', category: 'color', label: 'amber 头像背景', usage: 'amber 头像背景（组件消费）' },
  'avatar-blue-bg': { value: 'var(--cd-color-avatar-blue-bg)', category: 'color', label: 'blue 头像背景', usage: 'blue 头像背景（组件消费）' },
  'avatar-cyan-bg': { value: 'var(--cd-color-avatar-cyan-bg)', category: 'color', label: 'cyan 头像背景', usage: 'cyan 头像背景（组件消费）' },
  'avatar-green-bg': { value: 'var(--cd-color-avatar-green-bg)', category: 'color', label: 'green 头像背景', usage: 'green 头像背景（组件消费）' },
  'avatar-grey-bg': { value: 'var(--cd-color-avatar-grey-bg)', category: 'color', label: 'grey 头像背景', usage: 'grey 头像背景（组件消费）' },
  'avatar-indigo-bg': { value: 'var(--cd-color-avatar-indigo-bg)', category: 'color', label: 'indigo 头像背景', usage: 'indigo 头像背景（组件消费）' },
  'avatar-light-blue-bg': { value: 'var(--cd-color-avatar-light-blue-bg)', category: 'color', label: 'light-blue 头像背景', usage: 'light-blue 头像背景（组件消费）' },
  'avatar-light-green-bg': { value: 'var(--cd-color-avatar-light-green-bg)', category: 'color', label: 'light-green 头像背景', usage: 'light-green 头像背景（组件消费）' },
  'avatar-lime-bg': { value: 'var(--cd-color-avatar-lime-bg)', category: 'color', label: 'lime 头像背景', usage: 'lime 头像背景（组件消费）' },
  'avatar-orange-bg': { value: 'var(--cd-color-avatar-orange-bg)', category: 'color', label: 'orange 头像背景', usage: 'orange 头像背景（组件消费）' },
  'avatar-pink-bg': { value: 'var(--cd-color-avatar-pink-bg)', category: 'color', label: 'pink 头像背景', usage: 'pink 头像背景（组件消费）' },
  'avatar-purple-bg': { value: 'var(--cd-color-avatar-purple-bg)', category: 'color', label: 'purple 头像背景', usage: 'purple 头像背景（组件消费）' },
  'avatar-red-bg': { value: 'var(--cd-color-avatar-red-bg)', category: 'color', label: 'red 头像背景', usage: 'red 头像背景（组件消费）' },
  'avatar-teal-bg': { value: 'var(--cd-color-avatar-teal-bg)', category: 'color', label: 'teal 头像背景', usage: 'teal 头像背景（组件消费）' },
  'avatar-violet-bg': { value: 'var(--cd-color-avatar-violet-bg)', category: 'color', label: 'violet 头像背景', usage: 'violet 头像背景（组件消费）' },
  'avatar-yellow-bg': { value: 'var(--cd-color-avatar-yellow-bg)', category: 'color', label: 'yellow 头像背景', usage: 'yellow 头像背景（组件消费）' },
  'avatar-palette-text': { value: 'var(--cd-color-avatar-palette-text)', category: 'color', label: '语义色板文字色', usage: '16 档语义色头像文字色（组件消费）' },

  // —— Badge（组件消费） ——
  'badge-size': { value: 'var(--cd-height-badge-count)', category: 'height', label: '数字徽标尺寸', usage: '数字徽标最小宽/高（组件消费）' },
  'badge-size-small': { value: '14px', category: 'height', label: '小数字徽标尺寸', usage: '小数字徽标尺寸（组件消费；Semi 无小档，保留 14px）' },
  'badge-dot-size': { value: 'var(--cd-width-badge-dot)', category: 'width', label: '点状徽标尺寸', usage: '点状徽标尺寸（组件消费）' },
  'badge-bg': { value: 'var(--cd-color-badge-danger-solid-bg-default)', category: 'color', label: '徽标背景色', usage: '徽标默认背景（组件消费；默认危险红）' },
  'badge-color': { value: 'var(--cd-color-text-inverse)', category: 'color', label: '徽标文字色', usage: '徽标文字颜色（组件消费）' },
  'badge-font-size': { value: 'var(--cd-font-size-small)', category: 'font', label: '徽标字号', usage: '徽标字号（组件消费）' },

  // —— Card（组件消费） ——
  'card-bg': { value: 'var(--cd-color-card-bg-default)', category: 'color', label: '卡片背景色', usage: '卡片背景（组件消费）' },
  'card-border': { value: 'var(--cd-color-card-border)', category: 'color', label: '卡片描边色', usage: '卡片描边（组件消费）' },
  'card-radius': { value: 'var(--cd-radius-card)', category: 'radius', label: '卡片圆角', usage: '卡片圆角（组件消费）' },
  'card-padding': { value: 'var(--cd-spacing-card-padding)', category: 'spacing', label: '卡片内边距', usage: '卡片内边距（组件消费）' },
  'card-padding-small': { value: 'var(--cd-spacing-base-tight)', category: 'spacing', label: '小卡片内边距', usage: '小尺寸卡片内边距（组件消费）' },
  'card-header-border': { value: 'var(--cd-color-card-border)', category: 'color', label: '卡片分隔线色', usage: '卡片头/尾分隔线（组件消费）' },
  'card-title-color': { value: 'var(--cd-color-card-title-text)', category: 'color', label: '卡片标题色', usage: '卡片标题文字（组件消费）' },
  'card-title-weight': { value: 'var(--cd-font-card-title-fontweight)', category: 'font', label: '卡片标题字重', usage: '卡片标题字重（组件消费）' },
  'card-title-size': { value: 'var(--cd-font-card-title-fontsize)', category: 'font', label: '卡片标题字号', usage: '卡片标题字号（组件消费）' },
  'card-desc-color': { value: 'var(--cd-color-card-description-text)', category: 'color', label: '卡片描述色', usage: '卡片描述文字（组件消费）' },
  'card-body-color': { value: 'var(--cd-color-card-body-text)', category: 'color', label: '卡片正文色', usage: '卡片正文文字（组件消费）' },
  'card-shadow': { value: 'var(--cd-shadow-card)', category: 'other', label: '卡片阴影', usage: '卡片阴影（组件消费）' },
  'card-shadow-hover': { value: 'var(--cd-shadow-card)', category: 'other', label: '卡片悬浮阴影', usage: '卡片悬浮阴影（组件消费；对齐 Semi 单档 elevated）' },
} satisfies TokenGroup;
