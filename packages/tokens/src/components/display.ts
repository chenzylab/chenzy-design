/**
 * Component tokens for Tag / Avatar / Badge / Card（M4 Show）。四个展示类组件共用本文件。
 * 曾全量镜像 Semi Design（tag/avatar/badge/card variables.scss），后按 dsm.spec「Token 精简原则」
 * 收敛为只保留四组件实际消费的 token（及其被消费值引用的中间节点），删除孤儿。
 * token 为带元数据的 TokenDef 结构以支持 DSM。值为 var() 引用我们的 alias / global token，
 * 或字面量。末尾保留 chenzy-design 四组件实际消费的补充 token（短名，Semi 无 / 命名差异；组件消费）。
 *
 * 映射约定：
 *  - Semi `$xxx_yyy` / `$xxx-yyy` → kebab（各组件用自己前缀 tag- / avatar- / badge- / card-）。
 *  - var(--semi-color-*) → var(--cd-color-*)；var(--semi-color-white) → var(--cd-color-white)。
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
  // 原始层完整镜像 Semi avatar/variables.scss（值 1:1 对齐 2.89）。
  'color-avatar-default-border-default': { value: 'var(--cd-color-bg-1)', category: 'color', label: '头像描边色', usage: '头像组成员描边色（Semi $color-avatar_default-border-default）' },
  'color-avatar-more-bg-default': { value: 'var(--cd-color-grey-5)', category: 'color', label: '「更多」头像背景', usage: '头像组 +N 溢出头像背景（Semi grey-5）' },
  'color-avatar-outline-focus': { value: 'var(--cd-color-primary-light-active)', category: 'color', label: '聚焦轮廓色', usage: '可交互头像聚焦轮廓色（Semi $color-avatar-outline-focus）' },
  'width-avatar-outline': { value: '2px', category: 'width', label: '聚焦轮廓宽度', usage: '可交互头像聚焦轮廓宽度' },

  // 7 档尺寸（Semi 20/24/32/40/48/72/128）
  'width-avatar-extra-extra-small': { value: '20px', category: 'width', label: '极小头像尺寸', usage: '头像尺寸 - 极小' },
  'width-avatar-extra-small': { value: '24px', category: 'width', label: '超小头像尺寸', usage: '头像尺寸 - 超小' },
  'width-avatar-small': { value: '32px', category: 'width', label: '小头像尺寸', usage: '头像尺寸 - 小' },
  'width-avatar-default': { value: '40px', category: 'width', label: '默认头像尺寸', usage: '头像尺寸 - 默认' },
  'width-avatar-medium': { value: '48px', category: 'width', label: '中头像尺寸', usage: '头像尺寸 - 中' },
  'width-avatar-large': { value: '72px', category: 'width', label: '大头像尺寸', usage: '头像尺寸 - 大' },
  'width-avatar-extra-large': { value: '128px', category: 'width', label: '超大头像尺寸', usage: '头像尺寸 - 超大' },

  // 极小/超小/超大档专属字号与行高（其余档走 font-size mixin：small=header-5… 见组件）
  'font-avatar-extra-extra-small-size': { value: '10px', category: 'font', label: '极小字号', usage: '极小头像文字字号' },
  'font-avatar-extra-extra-small-lineheight': { value: '15px', category: 'font', label: '极小行高', usage: '极小头像文字行高' },
  'font-avatar-extra-small-size': { value: '10px', category: 'font', label: '超小字号', usage: '超小头像文字字号' },
  'font-avatar-extra-small-lineheight': { value: '15px', category: 'font', label: '超小行高', usage: '超小头像文字行高' },
  'font-avatar-extra-large-size': { value: '64px', category: 'font', label: '超大字号', usage: '超大头像文字字号' },
  'font-avatar-extra-large-lineheight': { value: '77px', category: 'font', label: '超大行高', usage: '超大头像文字行高' },

  // 7 档 radius（Semi：小档 3px，large 6px，extra-large 12px）
  'radius-avatar-extra-extra-small': { value: '3px', category: 'radius', label: '极小头像圆角', usage: '极小方形头像圆角' },
  'radius-avatar-extra-small': { value: '3px', category: 'radius', label: '超小头像圆角', usage: '超小方形头像圆角' },
  'radius-avatar-small': { value: '3px', category: 'radius', label: '小头像圆角', usage: '小方形头像圆角' },
  'radius-avatar-default': { value: '3px', category: 'radius', label: '默认头像圆角', usage: '默认方形头像圆角' },
  'radius-avatar-medium': { value: '3px', category: 'radius', label: '中头像圆角', usage: '中方形头像圆角' },
  'radius-avatar-large': { value: '6px', category: 'radius', label: '大头像圆角', usage: '大方形头像圆角' },
  'radius-avatar-extra-large': { value: '12px', category: 'radius', label: '超大头像圆角', usage: '超大方形头像圆角' },

  // 头像组：各档描边宽度 + 层叠 marginLeft（Semi $width-avatar_<size>-border / $spacing-avatar_<size>-marginLeft）
  'width-avatar-group-extra-extra-small-border': { value: '1px', category: 'width', label: '组极小描边宽', usage: '头像组极小成员描边宽度' },
  'width-avatar-group-extra-small-border': { value: '1px', category: 'width', label: '组超小描边宽', usage: '头像组超小成员描边宽度' },
  'width-avatar-group-small-border': { value: '2px', category: 'width', label: '组小描边宽', usage: '头像组小成员描边宽度' },
  'width-avatar-group-default-border': { value: '2px', category: 'width', label: '组默认描边宽', usage: '头像组默认成员描边宽度' },
  'width-avatar-group-medium-border': { value: '2px', category: 'width', label: '组中描边宽', usage: '头像组中成员描边宽度' },
  'width-avatar-group-large-border': { value: '3px', category: 'width', label: '组大描边宽', usage: '头像组大成员描边宽度' },
  'width-avatar-group-extra-large-border': { value: '3px', category: 'width', label: '组超大描边宽', usage: '头像组超大成员描边宽度' },
  'spacing-avatar-group-extra-extra-small-margin': { value: '-4px', category: 'spacing', label: '组极小层叠间距', usage: '头像组极小成员层叠左外边距' },
  'spacing-avatar-group-extra-small-margin': { value: '-10px', category: 'spacing', label: '组超小层叠间距', usage: '头像组超小成员层叠左外边距' },
  'spacing-avatar-group-small-margin': { value: '-12px', category: 'spacing', label: '组小层叠间距', usage: '头像组小成员层叠左外边距' },
  'spacing-avatar-group-default-margin': { value: '-12px', category: 'spacing', label: '组默认层叠间距', usage: '头像组默认成员层叠左外边距' },
  'spacing-avatar-group-medium-margin': { value: '-12px', category: 'spacing', label: '组中层叠间距', usage: '头像组中成员层叠左外边距' },
  'spacing-avatar-group-large-margin': { value: '-18px', category: 'spacing', label: '组大层叠间距', usage: '头像组大成员层叠左外边距' },
  'spacing-avatar-group-extra-large-margin': { value: '-32px', category: 'spacing', label: '组超大层叠间距', usage: '头像组超大成员层叠左外边距' },

  // 额外描边（呼吸环）
  'width-avatar-additional-border': { value: '1.5px', category: 'width', label: '额外描边尺寸', usage: '额外描边尺寸' },
  'color-avatar-additional-border': { value: 'var(--cd-color-primary)', category: 'color', label: '额外描边色', usage: '额外描边颜色' },
  'spacing-avatar-additional-bordergap': { value: '2px', category: 'spacing', label: '额外描边内间距', usage: '额外描边与内侧间距' },
  // 额外描边呼吸动画（对齐 Semi avatar/animation.scss）
  'motion-avatar-additional-border-duration': { value: '800ms', category: 'other', label: '额外描边动画时长', usage: '额外描边呼吸动画持续时间' },
  'motion-avatar-additional-border-scale-end': { value: '1.15', category: 'other', label: '额外描边动画终态缩放', usage: '额外描边呼吸动画结束缩放比例' },
  // 内容区域动效（contentMotion，对齐 Semi $animation_*-content）
  'motion-avatar-content-duration': { value: '1000ms', category: 'other', label: '内容动效时长', usage: '内容区域动效持续时间' },
  'motion-avatar-content-scale-middle': { value: '0.9', category: 'other', label: '内容动效中态缩放', usage: '内容区域动效中间态缩放' },

  // 顶部 Slot（Semi avatar top_slot：文字色/渐变/各档字号/位移/缩放/marginTop）
  'color-avatar-top-slot-text': { value: 'var(--cd-color-bg-0)', category: 'color', label: '顶部 Slot 文字色', usage: '顶部 Slot 文字颜色' },
  'color-avatar-top-slot-gradient-start': { value: 'var(--cd-color-primary)', category: 'color', label: '顶部 Slot 渐变起始', usage: '顶部 Slot 背景渐变起始色' },
  'color-avatar-top-slot-gradient-end': { value: 'var(--cd-color-primary)', category: 'color', label: '顶部 Slot 渐变结束', usage: '顶部 Slot 背景渐变结束色' },
  'font-avatar-top-slot-small-size': { value: '5px', category: 'font', label: '顶部 Slot 小字号', usage: 'small 顶部 Slot 文字字号' },
  'font-avatar-top-slot-default-size': { value: '6px', category: 'font', label: '顶部 Slot 默认字号', usage: 'default 顶部 Slot 文字字号' },
  'font-avatar-top-slot-medium-size': { value: '8px', category: 'font', label: '顶部 Slot 中字号', usage: 'medium 顶部 Slot 文字字号' },
  'font-avatar-top-slot-large-size': { value: '14px', category: 'font', label: '顶部 Slot 大字号', usage: 'large 顶部 Slot 文字字号' },
  'font-avatar-top-slot-extra-large-size': { value: '16px', category: 'font', label: '顶部 Slot 超大字号', usage: 'extra-large 顶部 Slot 文字字号' },
  'spacing-avatar-top-slot-small-margintop': { value: '0px', category: 'spacing', label: '顶部 Slot 小 marginTop', usage: 'small 顶部文字 marginTop' },
  'spacing-avatar-top-slot-default-margintop': { value: '-2px', category: 'spacing', label: '顶部 Slot 默认 marginTop', usage: 'default 顶部文字 marginTop' },
  'spacing-avatar-top-slot-medium-margintop': { value: '0px', category: 'spacing', label: '顶部 Slot 中 marginTop', usage: 'medium 顶部文字 marginTop' },
  'spacing-avatar-top-slot-large-margintop': { value: '0px', category: 'spacing', label: '顶部 Slot 大 marginTop', usage: 'large 顶部文字 marginTop' },
  'spacing-avatar-top-slot-extra-large-margintop': { value: '0px', category: 'spacing', label: '顶部 Slot 超大 marginTop', usage: 'extra-large 顶部文字 marginTop' },
  'spacing-avatar-top-slot-small-shift': { value: '-28px', category: 'spacing', label: '顶部 Slot 小位移', usage: 'small 顶部 Slot SVG 位移' },
  'spacing-avatar-top-slot-default-shift': { value: '-32px', category: 'spacing', label: '顶部 Slot 默认位移', usage: 'default 顶部 Slot SVG 位移' },
  'spacing-avatar-top-slot-medium-shift': { value: '-30px', category: 'spacing', label: '顶部 Slot 中位移', usage: 'medium 顶部 Slot SVG 位移' },
  'spacing-avatar-top-slot-large-shift': { value: '-30px', category: 'spacing', label: '顶部 Slot 大位移', usage: 'large 顶部 Slot SVG 位移' },
  'spacing-avatar-top-slot-extra-large-shift': { value: '-32px', category: 'spacing', label: '顶部 Slot 超大位移', usage: 'extra-large 顶部 Slot SVG 位移' },
  'scale-avatar-top-slot-small': { value: '0.4', category: 'other', label: '顶部 Slot 小缩放', usage: 'small 顶部 Slot SVG 缩放' },
  'scale-avatar-top-slot-default': { value: '0.7', category: 'other', label: '顶部 Slot 默认缩放', usage: 'default 顶部 Slot SVG 缩放' },
  'scale-avatar-top-slot-medium': { value: '0.8', category: 'other', label: '顶部 Slot 中缩放', usage: 'medium 顶部 Slot SVG 缩放' },
  'scale-avatar-top-slot-large': { value: '1.1', category: 'other', label: '顶部 Slot 大缩放', usage: 'large 顶部 Slot SVG 缩放' },
  'scale-avatar-top-slot-extra-large': { value: '1.4', category: 'other', label: '顶部 Slot 超大缩放', usage: 'extra-large 顶部 Slot SVG 缩放' },

  // 底部 Slot（Semi avatar bottom_slot：背景/圆形直径/方形圆角内距边框/各档字号）
  'color-avatar-bottom-slot-bg': { value: 'var(--cd-color-primary)', category: 'color', label: '底部 Slot 背景', usage: '底部 Slot 默认背景色' },
  'color-avatar-bottom-slot-text': { value: 'var(--cd-color-bg-0)', category: 'color', label: '底部 Slot 文字色', usage: '底部 Slot 文字颜色' },
  'color-avatar-bottom-slot-square-border': { value: 'var(--cd-color-bg-0)', category: 'color', label: '底部方形 Slot 边框色', usage: '底部方形 Slot 边框颜色' },
  'radius-avatar-bottom-slot-square': { value: '4px', category: 'radius', label: '底部方形 Slot 圆角', usage: '底部方形 Slot 圆角' },
  'spacing-avatar-bottom-slot-square-paddingx': { value: '4px', category: 'spacing', label: '底部方形 Slot 横内距', usage: '底部方形 Slot 水平内边距' },
  'spacing-avatar-bottom-slot-square-paddingy': { value: '1px', category: 'spacing', label: '底部方形 Slot 纵内距', usage: '底部方形 Slot 垂直内边距' },
  'width-avatar-bottom-slot-square-border': { value: '2px', category: 'width', label: '底部方形 Slot 边框宽', usage: '底部方形 Slot 边框宽度' },
  'width-avatar-bottom-slot-circle-extra-small': { value: '12px', category: 'width', label: '底部圆 Slot 超小直径', usage: 'extra-small 底部圆形 Slot 直径' },
  'width-avatar-bottom-slot-circle-small': { value: '12px', category: 'width', label: '底部圆 Slot 小直径', usage: 'small 底部圆形 Slot 直径' },
  'width-avatar-bottom-slot-circle-default': { value: '16px', category: 'width', label: '底部圆 Slot 默认直径', usage: 'default 底部圆形 Slot 直径' },
  'width-avatar-bottom-slot-circle-medium': { value: '18px', category: 'width', label: '底部圆 Slot 中直径', usage: 'medium 底部圆形 Slot 直径' },
  'width-avatar-bottom-slot-circle-large': { value: '28px', category: 'width', label: '底部圆 Slot 大直径', usage: 'large 底部圆形 Slot 直径' },
  'width-avatar-bottom-slot-circle-extra-large': { value: '28px', category: 'width', label: '底部圆 Slot 超大直径', usage: 'extra-large 底部圆形 Slot 直径' },
  'font-avatar-bottom-slot-extra-small-size': { value: '5px', category: 'font', label: '底部 Slot 超小字号', usage: 'extra-small 底部 Slot 字号' },
  'font-avatar-bottom-slot-small-size': { value: '5px', category: 'font', label: '底部 Slot 小字号', usage: 'small 底部 Slot 字号' },
  'font-avatar-bottom-slot-default-size': { value: '12px', category: 'font', label: '底部 Slot 默认字号', usage: 'default 底部 Slot 字号' },
  'font-avatar-bottom-slot-medium-size': { value: '12px', category: 'font', label: '底部 Slot 中字号', usage: 'medium 底部 Slot 字号' },
  'font-avatar-bottom-slot-large-size': { value: '12px', category: 'font', label: '底部 Slot 大字号', usage: 'large 底部 Slot 字号' },
  'font-avatar-bottom-slot-extra-large-size': { value: '14px', category: 'font', label: '底部 Slot 超大字号', usage: 'extra-large 底部 Slot 字号' },

  // —— Avatar 16 档语义色板（对齐 Semi avatar/mixin.scss：bg=<color>-3, text=white）——
  // 全部引用全局色阶 --cd-color-<c>-3（暗色模式随 global palette 切换）。
  'color-avatar-amber-bg': { value: 'var(--cd-color-amber-3)', category: 'color', label: 'amber 头像背景', usage: 'amber 头像背景色（Semi amber-3）' },
  'color-avatar-blue-bg': { value: 'var(--cd-color-blue-3)', category: 'color', label: 'blue 头像背景', usage: 'blue 头像背景色（blue-3）' },
  'color-avatar-cyan-bg': { value: 'var(--cd-color-cyan-3)', category: 'color', label: 'cyan 头像背景', usage: 'cyan 头像背景色（Semi cyan-3）' },
  'color-avatar-green-bg': { value: 'var(--cd-color-green-3)', category: 'color', label: 'green 头像背景', usage: 'green 头像背景色（green-3）' },
  'color-avatar-grey-bg': { value: 'var(--cd-color-grey-3)', category: 'color', label: 'grey 头像背景', usage: 'grey 头像背景色（grey-3）' },
  'color-avatar-indigo-bg': { value: 'var(--cd-color-indigo-3)', category: 'color', label: 'indigo 头像背景', usage: 'indigo 头像背景色（Semi indigo-3）' },
  'color-avatar-light-blue-bg': { value: 'var(--cd-color-light-blue-3)', category: 'color', label: 'light-blue 头像背景', usage: 'light-blue 头像背景色（Semi light-blue-3）' },
  'color-avatar-light-green-bg': { value: 'var(--cd-color-light-green-3)', category: 'color', label: 'light-green 头像背景', usage: 'light-green 头像背景色（Semi light-green-3）' },
  'color-avatar-lime-bg': { value: 'var(--cd-color-lime-3)', category: 'color', label: 'lime 头像背景', usage: 'lime 头像背景色（Semi lime-3）' },
  'color-avatar-orange-bg': { value: 'var(--cd-color-orange-3)', category: 'color', label: 'orange 头像背景', usage: 'orange 头像背景色（orange-3）' },
  'color-avatar-pink-bg': { value: 'var(--cd-color-pink-3)', category: 'color', label: 'pink 头像背景', usage: 'pink 头像背景色（Semi pink-3）' },
  'color-avatar-purple-bg': { value: 'var(--cd-color-purple-3)', category: 'color', label: 'purple 头像背景', usage: 'purple 头像背景色（Semi purple-3）' },
  'color-avatar-red-bg': { value: 'var(--cd-color-red-3)', category: 'color', label: 'red 头像背景', usage: 'red 头像背景色（red-3）' },
  'color-avatar-teal-bg': { value: 'var(--cd-color-teal-3)', category: 'color', label: 'teal 头像背景', usage: 'teal 头像背景色（Semi teal-3）' },
  'color-avatar-violet-bg': { value: 'var(--cd-color-violet-3)', category: 'color', label: 'violet 头像背景', usage: 'violet 头像背景色（Semi violet-3）' },
  'color-avatar-yellow-bg': { value: 'var(--cd-color-yellow-3)', category: 'color', label: 'yellow 头像背景', usage: 'yellow 头像背景色（yellow-3）' },
  'color-avatar-palette-text': { value: '#fff', category: 'color', label: '语义色板头像文字色', usage: '16 档语义色头像文字色（对齐 Semi：统一白字）' },
  'color-avatar-white-bg': { value: 'var(--cd-color-white)', category: 'color', label: 'white 头像背景', usage: 'white 头像背景色（Semi color=white）' },

  // ============================== Badge ==============================
  // 原始层完整镜像 Semi badge/variables.scss（值 1:1 对齐 2.89）。

  // default（无 type：custom / 独立使用）
  'color-badge-default-border-default': { value: 'var(--cd-color-bg-1)', category: 'color', label: '徽标描边色', usage: '描边颜色 - 默认' },
  'color-badge-default-bg-default': { value: 'var(--cd-color-bg-1)', category: 'color', label: '徽标背景色', usage: '背景颜色 - 默认' },
  'color-badge-default-light-bg-default': { value: 'var(--cd-color-bg-2)', category: 'color', label: '徽标浅版背景色', usage: '背景颜色 - 浅版' },
  'color-badge-default-text-default': { value: 'var(--cd-color-bg-2)', category: 'color', label: '徽标文字色', usage: '文字颜色 - 默认' },

  // primary
  'color-badge-primary-solid-bg-default': { value: 'var(--cd-color-primary)', category: 'color', label: '主色徽标背景', usage: '背景颜色 - 主色' },
  'color-badge-primary-light-bg-default': { value: 'var(--cd-color-primary-light-default)', category: 'color', label: '浅版主色徽标背景', usage: '背景颜色 - 浅版主色' },
  'color-badge-primary-light-text-default': { value: 'var(--cd-color-primary)', category: 'color', label: '浅版主色徽标文字', usage: '文字颜色 - 浅版主色' },
  'color-badge-primary-inverted-text-default': { value: 'var(--cd-color-primary)', category: 'color', label: '白底主色徽标文字', usage: '文字颜色 - 白底' },

  // secondary
  'color-badge-secondary-solid-bg-default': { value: 'var(--cd-color-secondary)', category: 'color', label: '次要徽标背景', usage: '背景颜色 - 次要' },
  'color-badge-secondary-light-bg-default': { value: 'var(--cd-color-secondary-light-default)', category: 'color', label: '浅版次要徽标背景', usage: '背景颜色 - 浅版次要' },
  'color-badge-secondary-light-text-default': { value: 'var(--cd-color-secondary)', category: 'color', label: '浅版次要徽标文字', usage: '文字颜色 - 浅版次要' },
  'color-badge-secondary-inverted-text-default': { value: 'var(--cd-color-secondary)', category: 'color', label: '白底次要徽标文字', usage: '文字颜色 - 白底' },

  // tertiary
  'color-badge-tertiary-solid-bg-default': { value: 'var(--cd-color-tertiary)', category: 'color', label: '第三徽标背景', usage: '背景颜色 - 第三' },
  'color-badge-tertiary-light-bg-default': { value: 'var(--cd-color-tertiary-light-default)', category: 'color', label: '浅版第三徽标背景', usage: '背景颜色 - 第三' },
  'color-badge-tertiary-light-text-default': { value: 'var(--cd-color-tertiary)', category: 'color', label: '浅版第三徽标文字', usage: '文字颜色 - 浅版第三' },
  'color-badge-tertiary-inverted-text-default': { value: 'var(--cd-color-tertiary)', category: 'color', label: '白底第三徽标文字', usage: '文字颜色 - 白底' },

  // danger
  'color-badge-danger-solid-bg-default': { value: 'var(--cd-color-danger)', category: 'color', label: '危险徽标背景', usage: '背景颜色 - 危险' },
  'color-badge-danger-light-bg-default': { value: 'var(--cd-color-danger-light-default)', category: 'color', label: '浅版危险徽标背景', usage: '背景颜色 - 浅版危险' },
  'color-badge-danger-light-text-default': { value: 'var(--cd-color-danger)', category: 'color', label: '浅版危险徽标文字', usage: '文字颜色 - 浅版危险' },
  'color-badge-danger-inverted-text-default': { value: 'var(--cd-color-danger)', category: 'color', label: '白底危险徽标文字', usage: '文字颜色 - 白底' },

  // warning
  'color-badge-warning-solid-bg-default': { value: 'var(--cd-color-warning)', category: 'color', label: '警告徽标背景', usage: '背景颜色 - 警告' },
  'color-badge-warning-light-bg-default': { value: 'var(--cd-color-warning-light-default)', category: 'color', label: '浅版警告徽标背景', usage: '背景颜色 - 浅版警告' },
  'color-badge-warning-light-text-default': { value: 'var(--cd-color-warning)', category: 'color', label: '浅版警告徽标文字', usage: '文字颜色 - 浅版警告' },
  'color-badge-warning-inverted-text-default': { value: 'var(--cd-color-warning)', category: 'color', label: '白底警告徽标文字', usage: '文字颜色 - 白底' },

  // success
  'color-badge-success-solid-bg-default': { value: 'var(--cd-color-success)', category: 'color', label: '成功徽标背景', usage: '背景颜色 - 成功' },
  'color-badge-success-light-bg-default': { value: 'var(--cd-color-success-light-default)', category: 'color', label: '浅版成功徽标背景', usage: '背景颜色 - 浅版成功' },
  'color-badge-success-light-text-default': { value: 'var(--cd-color-success)', category: 'color', label: '浅版成功徽标文字', usage: '文字颜色 - 浅版成功' },
  'color-badge-success-inverted-text-default': { value: 'var(--cd-color-success)', category: 'color', label: '白底成功徽标文字', usage: '文字颜色 - 白底' },

  // 尺寸 / 描边 / 层级
  'width-badge-dot': { value: '8px', category: 'width', label: '点状徽标宽度', usage: '点状徽标宽度' },
  'height-badge-dot': { value: '8px', category: 'height', label: '点状徽标高度', usage: '点状徽标高度' },
  'radius-badge-dot': { value: 'var(--cd-border-radius-circle)', category: 'radius', label: '点状徽标圆角', usage: '点状徽标圆角' },
  'height-badge-count': { value: '18px', category: 'height', label: '数字徽标高度', usage: '数字徽标高度' },
  'spacing-badge-count-paddingy': { value: '0px', category: 'spacing', label: '数字徽标垂直内边距', usage: '数字徽标上下内边距' },
  'spacing-badge-count-paddingx': { value: '4px', category: 'spacing', label: '数字徽标水平内边距', usage: '数字徽标左右内边距' },
  'width-badge-border': { value: '1px', category: 'width', label: '徽标描边宽度', usage: '描边宽度' },
  'z-badge': { value: '1', category: 'other', label: '徽标层级', usage: '徽标 z-index' },
  'z-badge-light-bg': { value: '-1', category: 'other', label: '徽标浅色背景层级', usage: '徽标浅色背景 z-index' },

  // ============================== Card ==============================
  // 原始层 1:1 镜像 Semi card/variables.scss（值对齐 2.89）。
  'color-card-bg-default': { value: 'var(--cd-color-bg-0)', category: 'color', label: '卡片背景色', usage: '卡片背景颜色（Semi $color-card-bg-default）' },
  'color-card-border': { value: 'var(--cd-color-border)', category: 'color', label: '卡片描边色', usage: '卡片描边颜色（Semi $color-card-border）' },
  'color-card-title-text': { value: 'var(--cd-color-text-0)', category: 'color', label: '卡片标题文字色', usage: '卡片标题文字颜色（Semi $color-card_title-text）' },
  'color-card-description-text': { value: 'var(--cd-color-text-2)', category: 'color', label: '卡片描述文字色', usage: '卡片描述文字颜色（Semi $color-card_description-text）' },
  'color-card-extra-text': { value: 'var(--cd-color-text-0)', category: 'color', label: '卡片附加文字色', usage: '卡片附加文字颜色（Semi $color-card_extra-text）' },
  'color-card-body-text': { value: 'var(--cd-color-text-1)', category: 'color', label: '卡片正文文字色', usage: '卡片正文文字颜色（Semi $color-card_body-text）' },

  'font-card-default-fontweight': { value: 'var(--cd-font-weight-regular)', category: 'font', label: '卡片默认字重', usage: '卡片文字字重 - 默认（Semi $font-card_default-fontWeight）' },
  'font-card-extra-fontweight': { value: '700', category: 'font', label: '卡片附加字重', usage: '卡片文字字重 - 附加（Semi $font-card_extra-fontWeight）' },
  'font-card-title-fontweight': { value: '700', category: 'font', label: '卡片标题字重', usage: '卡片文字字重 - 标题（Semi $font-card_title-fontWeight）' },
  'font-card-default-lineheight': { value: '20px', category: 'font', label: '卡片默认行高', usage: '卡片文字行高 - 默认（Semi $font-card_default-lineHeight）' },
  'font-card-title-lineheight': { value: '22px', category: 'font', label: '卡片标题行高', usage: '卡片文字行高 - 标题（Semi $font-card_title-lineHeight）' },
  'font-card-default-fontsize': { value: 'var(--cd-font-size-regular)', category: 'font', label: '卡片默认字号', usage: '卡片文字大小 - 默认（Semi $font-card_default-fontSize）' },
  'font-card-extra-fontsize': { value: 'var(--cd-font-size-header-6)', category: 'font', label: '卡片附加字号', usage: '卡片文字大小 - 附加（Semi $font-card_extra-fontSize）' },
  'font-card-title-fontsize': { value: 'var(--cd-font-size-header-6)', category: 'font', label: '卡片标题字号', usage: '卡片文字大小 - 标题（Semi $font-card_title-fontSize）' },

  'radius-card': { value: 'var(--cd-border-radius-medium)', category: 'radius', label: '卡片圆角', usage: '卡片圆角（Semi $radius-card）' },

  'motion-card-transition-duration': { value: '300ms', category: 'other', label: '卡片悬浮动画时长', usage: '卡片悬浮阴影过渡时长（Semi $motion-card-transition_duration）' },

  'width-card-border': { value: 'var(--cd-border-thickness-control)', category: 'width', label: '卡片描边宽度', usage: '卡片描边宽度（Semi $width-card-border）' },

  'shadow-card': { value: 'var(--cd-shadow-elevated)', category: 'other', label: '卡片阴影', usage: '卡片阴影（Semi $shadow-card）' },

  'spacing-card-padding': { value: 'var(--cd-spacing-base-loose)', category: 'spacing', label: '卡片内边距', usage: '卡片内边距（Semi $spacing-card-padding）' },
  'spacing-card-margin': { value: 'var(--cd-spacing-base-loose)', category: 'spacing', label: '卡片外边距', usage: '卡片外边距/间距（Semi $spacing-card-margin）' },
  'spacing-card-avatar-marginright': { value: 'var(--cd-spacing-base-tight)', category: 'spacing', label: '卡片头像右外边距', usage: 'Meta 头像右侧外边距（Semi $spacing-card_avatar-marginRight）' },
  'spacing-cardgroup-card-margin': { value: '-1px', category: 'spacing', label: '卡片组拼接负边距', usage: '网格卡片组相邻卡片边框拼接负外边距（Semi $spacing-cardGroup_card-margin）' },

  'z-card-hover': { value: '1', category: 'other', label: '卡片悬浮层级', usage: '悬浮后卡片 z-index，避免网格阴影被覆盖（Semi $z-card_hover）' },

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
  // colorful（AI 多彩标签）：蓝→紫渐变，与 Button/FloatButton colorful 同源，保持 AI 视觉统一。
  'tag-colorful-from': { value: '#4d6bff', category: 'color', label: 'Colorful 渐变起始色', usage: 'colorful（AI 多彩）蓝→紫渐变起始色', editable: true },
  'tag-colorful-via': { value: '#7b5cff', category: 'color', label: 'Colorful 渐变中间色', usage: 'colorful（AI 多彩）蓝→紫渐变中间色', editable: true },
  'tag-colorful-to': { value: '#a64dff', category: 'color', label: 'Colorful 渐变结束色', usage: 'colorful（AI 多彩）蓝→紫渐变结束色', editable: true },

  // —— Avatar（组件消费；短名映射到 width-avatar-*） ——
  'avatar-size-extra-extra-small': { value: 'var(--cd-width-avatar-extra-extra-small)', category: 'width', label: '极小头像尺寸', usage: '极小头像尺寸（组件消费）' },
  'avatar-size-extra-small': { value: 'var(--cd-width-avatar-extra-small)', category: 'width', label: '超小头像尺寸', usage: '超小头像尺寸（组件消费）' },
  'avatar-size-small': { value: 'var(--cd-width-avatar-small)', category: 'width', label: '小头像尺寸', usage: '小头像尺寸（组件消费）' },
  'avatar-size-default': { value: 'var(--cd-width-avatar-default)', category: 'width', label: '默认头像尺寸', usage: '默认头像尺寸（组件消费）' },
  'avatar-size-medium': { value: 'var(--cd-width-avatar-medium)', category: 'width', label: '中头像尺寸', usage: '中头像尺寸（组件消费）' },
  'avatar-size-large': { value: 'var(--cd-width-avatar-large)', category: 'width', label: '大头像尺寸', usage: '大头像尺寸（组件消费）' },
  'avatar-size-extra-large': { value: 'var(--cd-width-avatar-extra-large)', category: 'width', label: '超大头像尺寸', usage: '超大头像尺寸（组件消费）' },
  'avatar-bg': { value: 'var(--cd-color-fill-1)', category: 'color', label: '头像背景色', usage: '文字/缺省头像背景（组件消费；Semi 头像文字底为 fill）' },
  'avatar-color': { value: 'var(--cd-color-text-1)', category: 'color', label: '头像文字色', usage: '头像文字颜色（组件消费）' },
  'avatar-border': { value: 'var(--cd-color-avatar-default-border-default)', category: 'color', label: '头像描边色', usage: '头像组描边颜色（组件消费）' },
  'avatar-more-bg': { value: 'var(--cd-color-avatar-more-bg-default)', category: 'color', label: '「更多」头像背景', usage: '头像组 +N 溢出头像背景（组件消费）' },
  'avatar-outline-color': { value: 'var(--cd-color-avatar-outline-focus)', category: 'color', label: '聚焦轮廓色', usage: '可交互头像聚焦轮廓色（组件消费）' },
  'avatar-outline-width': { value: 'var(--cd-width-avatar-outline)', category: 'width', label: '聚焦轮廓宽度', usage: '可交互头像聚焦轮廓宽度（组件消费）' },
  // 各档方形圆角（组件消费；短名映射到 radius-avatar-<size>）
  'avatar-radius-extra-extra-small': { value: 'var(--cd-radius-avatar-extra-extra-small)', category: 'radius', label: '极小方形圆角', usage: '极小方形头像圆角（组件消费）' },
  'avatar-radius-extra-small': { value: 'var(--cd-radius-avatar-extra-small)', category: 'radius', label: '超小方形圆角', usage: '超小方形头像圆角（组件消费）' },
  'avatar-radius-small': { value: 'var(--cd-radius-avatar-small)', category: 'radius', label: '小方形圆角', usage: '小方形头像圆角（组件消费）' },
  'avatar-radius-default': { value: 'var(--cd-radius-avatar-default)', category: 'radius', label: '默认方形圆角', usage: '默认方形头像圆角（组件消费）' },
  'avatar-radius-medium': { value: 'var(--cd-radius-avatar-medium)', category: 'radius', label: '中方形圆角', usage: '中方形头像圆角（组件消费）' },
  'avatar-radius-large': { value: 'var(--cd-radius-avatar-large)', category: 'radius', label: '大方形圆角', usage: '大方形头像圆角（组件消费）' },
  'avatar-radius-extra-large': { value: 'var(--cd-radius-avatar-extra-large)', category: 'radius', label: '超大方形圆角', usage: '超大方形头像圆角（组件消费）' },
  // 各档字号/行高（组件消费；小档专属，其余走 alias font-size）
  'avatar-font-extra-extra-small-size': { value: 'var(--cd-font-avatar-extra-extra-small-size)', category: 'font', label: '极小字号', usage: '极小头像文字字号（组件消费）' },
  'avatar-font-extra-extra-small-lineheight': { value: 'var(--cd-font-avatar-extra-extra-small-lineheight)', category: 'font', label: '极小行高', usage: '极小头像文字行高（组件消费）' },
  'avatar-font-extra-small-size': { value: 'var(--cd-font-avatar-extra-small-size)', category: 'font', label: '超小字号', usage: '超小头像文字字号（组件消费）' },
  'avatar-font-extra-small-lineheight': { value: 'var(--cd-font-avatar-extra-small-lineheight)', category: 'font', label: '超小行高', usage: '超小头像文字行高（组件消费）' },
  'avatar-font-small-size': { value: 'var(--cd-font-size-small)', category: 'font', label: '小字号', usage: '小头像文字字号（组件消费；alias small）' },
  'avatar-font-default-size': { value: 'var(--cd-font-size-header-5)', category: 'font', label: '默认字号', usage: '默认头像文字字号（组件消费；alias header-5）' },
  'avatar-font-medium-size': { value: 'var(--cd-font-size-header-4)', category: 'font', label: '中字号', usage: '中头像文字字号（组件消费；alias header-4）' },
  'avatar-font-large-size': { value: 'var(--cd-font-size-header-1)', category: 'font', label: '大字号', usage: '大头像文字字号（组件消费；alias header-1）' },
  'avatar-font-extra-large-size': { value: 'var(--cd-font-avatar-extra-large-size)', category: 'font', label: '超大字号', usage: '超大头像文字字号（组件消费）' },
  'avatar-font-extra-large-lineheight': { value: 'var(--cd-font-avatar-extra-large-lineheight)', category: 'font', label: '超大行高', usage: '超大头像文字行高（组件消费）' },
  // 头像组各档描边宽 + 层叠间距（组件消费）
  'avatar-group-extra-extra-small-border': { value: 'var(--cd-width-avatar-group-extra-extra-small-border)', category: 'width', label: '组极小描边宽', usage: '头像组极小成员描边宽度（组件消费）' },
  'avatar-group-extra-small-border': { value: 'var(--cd-width-avatar-group-extra-small-border)', category: 'width', label: '组超小描边宽', usage: '头像组超小成员描边宽度（组件消费）' },
  'avatar-group-small-border': { value: 'var(--cd-width-avatar-group-small-border)', category: 'width', label: '组小描边宽', usage: '头像组小成员描边宽度（组件消费）' },
  'avatar-group-default-border': { value: 'var(--cd-width-avatar-group-default-border)', category: 'width', label: '组默认描边宽', usage: '头像组默认成员描边宽度（组件消费）' },
  'avatar-group-medium-border': { value: 'var(--cd-width-avatar-group-medium-border)', category: 'width', label: '组中描边宽', usage: '头像组中成员描边宽度（组件消费）' },
  'avatar-group-large-border': { value: 'var(--cd-width-avatar-group-large-border)', category: 'width', label: '组大描边宽', usage: '头像组大成员描边宽度（组件消费）' },
  'avatar-group-extra-large-border': { value: 'var(--cd-width-avatar-group-extra-large-border)', category: 'width', label: '组超大描边宽', usage: '头像组超大成员描边宽度（组件消费）' },
  'avatar-group-extra-extra-small-margin': { value: 'var(--cd-spacing-avatar-group-extra-extra-small-margin)', category: 'spacing', label: '组极小层叠间距', usage: '头像组极小成员层叠间距（组件消费）' },
  'avatar-group-extra-small-margin': { value: 'var(--cd-spacing-avatar-group-extra-small-margin)', category: 'spacing', label: '组超小层叠间距', usage: '头像组超小成员层叠间距（组件消费）' },
  'avatar-group-small-margin': { value: 'var(--cd-spacing-avatar-group-small-margin)', category: 'spacing', label: '组小层叠间距', usage: '头像组小成员层叠间距（组件消费）' },
  'avatar-group-default-margin': { value: 'var(--cd-spacing-avatar-group-default-margin)', category: 'spacing', label: '组默认层叠间距', usage: '头像组默认成员层叠间距（组件消费）' },
  'avatar-group-medium-margin': { value: 'var(--cd-spacing-avatar-group-medium-margin)', category: 'spacing', label: '组中层叠间距', usage: '头像组中成员层叠间距（组件消费）' },
  'avatar-group-large-margin': { value: 'var(--cd-spacing-avatar-group-large-margin)', category: 'spacing', label: '组大层叠间距', usage: '头像组大成员层叠间距（组件消费）' },
  'avatar-group-extra-large-margin': { value: 'var(--cd-spacing-avatar-group-extra-large-margin)', category: 'spacing', label: '组超大层叠间距', usage: '头像组超大成员层叠间距（组件消费）' },
  // contentMotion 动效（组件消费）
  'avatar-content-motion-duration': { value: 'var(--cd-motion-avatar-content-duration)', category: 'other', label: '内容动效时长', usage: '内容区域动效时长（组件消费）' },
  'avatar-content-motion-scale-middle': { value: 'var(--cd-motion-avatar-content-scale-middle)', category: 'other', label: '内容动效中态缩放', usage: '内容区域动效中间态缩放（组件消费）' },
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
  'avatar-white-bg': { value: 'var(--cd-color-avatar-white-bg)', category: 'color', label: 'white 头像背景', usage: 'white 头像背景（组件消费）' },
  // 顶部 Slot（组件消费）
  'avatar-top-slot-text': { value: 'var(--cd-color-avatar-top-slot-text)', category: 'color', label: '顶部 Slot 文字色', usage: '顶部 Slot 文字色（组件消费）' },
  'avatar-top-slot-gradient-start': { value: 'var(--cd-color-avatar-top-slot-gradient-start)', category: 'color', label: '顶部 Slot 渐变起始', usage: '顶部 Slot 渐变起始色（组件消费）' },
  'avatar-top-slot-gradient-end': { value: 'var(--cd-color-avatar-top-slot-gradient-end)', category: 'color', label: '顶部 Slot 渐变结束', usage: '顶部 Slot 渐变结束色（组件消费）' },
  // 顶部 Slot 各档字号（组件消费）
  'avatar-top-slot-small-size': { value: 'var(--cd-font-avatar-top-slot-small-size)', category: 'font', label: '顶部 Slot 小字号', usage: 'small 顶部 Slot 字号（组件消费）' },
  'avatar-top-slot-default-size': { value: 'var(--cd-font-avatar-top-slot-default-size)', category: 'font', label: '顶部 Slot 默认字号', usage: 'default 顶部 Slot 字号（组件消费）' },
  'avatar-top-slot-medium-size': { value: 'var(--cd-font-avatar-top-slot-medium-size)', category: 'font', label: '顶部 Slot 中字号', usage: 'medium 顶部 Slot 字号（组件消费）' },
  'avatar-top-slot-large-size': { value: 'var(--cd-font-avatar-top-slot-large-size)', category: 'font', label: '顶部 Slot 大字号', usage: 'large 顶部 Slot 字号（组件消费）' },
  'avatar-top-slot-extra-large-size': { value: 'var(--cd-font-avatar-top-slot-extra-large-size)', category: 'font', label: '顶部 Slot 超大字号', usage: 'extra-large 顶部 Slot 字号（组件消费）' },
  // 顶部 Slot 各档文字 marginTop（组件消费）
  'avatar-top-slot-small-margintop': { value: 'var(--cd-spacing-avatar-top-slot-small-margintop)', category: 'spacing', label: '顶部 Slot 小 marginTop', usage: 'small 顶部文字 marginTop（组件消费）' },
  'avatar-top-slot-default-margintop': { value: 'var(--cd-spacing-avatar-top-slot-default-margintop)', category: 'spacing', label: '顶部 Slot 默认 marginTop', usage: 'default 顶部文字 marginTop（组件消费）' },
  'avatar-top-slot-medium-margintop': { value: 'var(--cd-spacing-avatar-top-slot-medium-margintop)', category: 'spacing', label: '顶部 Slot 中 marginTop', usage: 'medium 顶部文字 marginTop（组件消费）' },
  'avatar-top-slot-large-margintop': { value: 'var(--cd-spacing-avatar-top-slot-large-margintop)', category: 'spacing', label: '顶部 Slot 大 marginTop', usage: 'large 顶部文字 marginTop（组件消费）' },
  'avatar-top-slot-extra-large-margintop': { value: 'var(--cd-spacing-avatar-top-slot-extra-large-margintop)', category: 'spacing', label: '顶部 Slot 超大 marginTop', usage: 'extra-large 顶部文字 marginTop（组件消费）' },
  // 顶部 Slot 各档 SVG 位移（组件消费）
  'avatar-top-slot-small-shift': { value: 'var(--cd-spacing-avatar-top-slot-small-shift)', category: 'spacing', label: '顶部 Slot 小位移', usage: 'small 顶部 Slot SVG 位移（组件消费）' },
  'avatar-top-slot-default-shift': { value: 'var(--cd-spacing-avatar-top-slot-default-shift)', category: 'spacing', label: '顶部 Slot 默认位移', usage: 'default 顶部 Slot SVG 位移（组件消费）' },
  'avatar-top-slot-medium-shift': { value: 'var(--cd-spacing-avatar-top-slot-medium-shift)', category: 'spacing', label: '顶部 Slot 中位移', usage: 'medium 顶部 Slot SVG 位移（组件消费）' },
  'avatar-top-slot-large-shift': { value: 'var(--cd-spacing-avatar-top-slot-large-shift)', category: 'spacing', label: '顶部 Slot 大位移', usage: 'large 顶部 Slot SVG 位移（组件消费）' },
  'avatar-top-slot-extra-large-shift': { value: 'var(--cd-spacing-avatar-top-slot-extra-large-shift)', category: 'spacing', label: '顶部 Slot 超大位移', usage: 'extra-large 顶部 Slot SVG 位移（组件消费）' },
  // 顶部 Slot 各档 SVG 缩放（组件消费）
  'avatar-top-slot-small-scale': { value: 'var(--cd-scale-avatar-top-slot-small)', category: 'other', label: '顶部 Slot 小缩放', usage: 'small 顶部 Slot SVG 缩放（组件消费）' },
  'avatar-top-slot-default-scale': { value: 'var(--cd-scale-avatar-top-slot-default)', category: 'other', label: '顶部 Slot 默认缩放', usage: 'default 顶部 Slot SVG 缩放（组件消费）' },
  'avatar-top-slot-medium-scale': { value: 'var(--cd-scale-avatar-top-slot-medium)', category: 'other', label: '顶部 Slot 中缩放', usage: 'medium 顶部 Slot SVG 缩放（组件消费）' },
  'avatar-top-slot-large-scale': { value: 'var(--cd-scale-avatar-top-slot-large)', category: 'other', label: '顶部 Slot 大缩放', usage: 'large 顶部 Slot SVG 缩放（组件消费）' },
  'avatar-top-slot-extra-large-scale': { value: 'var(--cd-scale-avatar-top-slot-extra-large)', category: 'other', label: '顶部 Slot 超大缩放', usage: 'extra-large 顶部 Slot SVG 缩放（组件消费）' },
  // 底部 Slot（组件消费）
  'avatar-bottom-slot-bg': { value: 'var(--cd-color-avatar-bottom-slot-bg)', category: 'color', label: '底部 Slot 背景', usage: '底部 Slot 背景色（组件消费）' },
  'avatar-bottom-slot-text': { value: 'var(--cd-color-avatar-bottom-slot-text)', category: 'color', label: '底部 Slot 文字色', usage: '底部 Slot 文字色（组件消费）' },
  'avatar-bottom-slot-square-border': { value: 'var(--cd-color-avatar-bottom-slot-square-border)', category: 'color', label: '底部方形 Slot 边框色', usage: '底部方形 Slot 边框色（组件消费）' },
  'avatar-bottom-slot-square-radius': { value: 'var(--cd-radius-avatar-bottom-slot-square)', category: 'radius', label: '底部方形 Slot 圆角', usage: '底部方形 Slot 圆角（组件消费）' },
  'avatar-bottom-slot-square-border-width': { value: 'var(--cd-width-avatar-bottom-slot-square-border)', category: 'width', label: '底部方形 Slot 边框宽', usage: '底部方形 Slot 边框宽度（组件消费）' },
  'avatar-bottom-slot-square-paddingx': { value: 'var(--cd-spacing-avatar-bottom-slot-square-paddingx)', category: 'spacing', label: '底部方形 Slot 横内距', usage: '底部方形 Slot 水平内边距（组件消费）' },
  'avatar-bottom-slot-square-paddingy': { value: 'var(--cd-spacing-avatar-bottom-slot-square-paddingy)', category: 'spacing', label: '底部方形 Slot 纵内距', usage: '底部方形 Slot 垂直内边距（组件消费）' },
  // 底部圆形 Slot 各档直径（组件消费）
  'avatar-bottom-slot-circle-extra-small': { value: 'var(--cd-width-avatar-bottom-slot-circle-extra-small)', category: 'width', label: '底部圆 Slot 超小直径', usage: 'extra-small 底部圆形 Slot 直径（组件消费）' },
  'avatar-bottom-slot-circle-small': { value: 'var(--cd-width-avatar-bottom-slot-circle-small)', category: 'width', label: '底部圆 Slot 小直径', usage: 'small 底部圆形 Slot 直径（组件消费）' },
  'avatar-bottom-slot-circle-default': { value: 'var(--cd-width-avatar-bottom-slot-circle-default)', category: 'width', label: '底部圆 Slot 默认直径', usage: 'default 底部圆形 Slot 直径（组件消费）' },
  'avatar-bottom-slot-circle-medium': { value: 'var(--cd-width-avatar-bottom-slot-circle-medium)', category: 'width', label: '底部圆 Slot 中直径', usage: 'medium 底部圆形 Slot 直径（组件消费）' },
  'avatar-bottom-slot-circle-large': { value: 'var(--cd-width-avatar-bottom-slot-circle-large)', category: 'width', label: '底部圆 Slot 大直径', usage: 'large 底部圆形 Slot 直径（组件消费）' },
  'avatar-bottom-slot-circle-extra-large': { value: 'var(--cd-width-avatar-bottom-slot-circle-extra-large)', category: 'width', label: '底部圆 Slot 超大直径', usage: 'extra-large 底部圆形 Slot 直径（组件消费）' },
  // 底部 Slot 各档字号（组件消费）
  'avatar-bottom-slot-extra-small-size': { value: 'var(--cd-font-avatar-bottom-slot-extra-small-size)', category: 'font', label: '底部 Slot 超小字号', usage: 'extra-small 底部 Slot 字号（组件消费）' },
  'avatar-bottom-slot-small-size': { value: 'var(--cd-font-avatar-bottom-slot-small-size)', category: 'font', label: '底部 Slot 小字号', usage: 'small 底部 Slot 字号（组件消费）' },
  'avatar-bottom-slot-default-size': { value: 'var(--cd-font-avatar-bottom-slot-default-size)', category: 'font', label: '底部 Slot 默认字号', usage: 'default 底部 Slot 字号（组件消费）' },
  'avatar-bottom-slot-medium-size': { value: 'var(--cd-font-avatar-bottom-slot-medium-size)', category: 'font', label: '底部 Slot 中字号', usage: 'medium 底部 Slot 字号（组件消费）' },
  'avatar-bottom-slot-large-size': { value: 'var(--cd-font-avatar-bottom-slot-large-size)', category: 'font', label: '底部 Slot 大字号', usage: 'large 底部 Slot 字号（组件消费）' },
  'avatar-bottom-slot-extra-large-size': { value: 'var(--cd-font-avatar-bottom-slot-extra-large-size)', category: 'font', label: '底部 Slot 超大字号', usage: 'extra-large 底部 Slot 字号（组件消费）' },

  // —— Card（组件消费；短名 var() 到上方镜像 Semi 的 card 原始层，DOM 消费点 1:1 对齐 card.scss） ——
  'card-bg': { value: 'var(--cd-color-card-bg-default)', category: 'color', label: '卡片背景色', usage: '卡片根背景（组件消费）' },
  'card-border-color': { value: 'var(--cd-color-card-border)', category: 'color', label: '卡片描边色', usage: '卡片外框/头尾分隔线颜色（组件消费）' },
  'card-border-width': { value: 'var(--cd-width-card-border)', category: 'width', label: '卡片描边宽度', usage: '卡片外框/分隔线宽度（组件消费）' },
  'card-radius': { value: 'var(--cd-radius-card)', category: 'radius', label: '卡片圆角', usage: '卡片圆角（组件消费）' },
  'card-padding': { value: 'var(--cd-spacing-card-padding)', category: 'spacing', label: '卡片内边距', usage: 'header/body/footer 内边距（组件消费）' },
  'card-margin': { value: 'var(--cd-spacing-card-margin)', category: 'spacing', label: '卡片间距', usage: 'actions 顶距 / extra 与 title 间距（组件消费）' },
  'card-title-color': { value: 'var(--cd-color-card-title-text)', category: 'color', label: '卡片标题色', usage: 'Meta 标题文字（组件消费）' },
  'card-title-weight': { value: 'var(--cd-font-card-title-fontweight)', category: 'font', label: '卡片标题字重', usage: 'Meta 标题字重（组件消费）' },
  'card-title-size': { value: 'var(--cd-font-card-title-fontsize)', category: 'font', label: '卡片标题字号', usage: 'Meta 标题字号（组件消费）' },
  'card-title-lineheight': { value: 'var(--cd-font-card-title-lineheight)', category: 'font', label: '卡片标题行高', usage: 'Meta 标题行高（组件消费）' },
  'card-extra-color': { value: 'var(--cd-color-card-extra-text)', category: 'color', label: '卡片附加文字色', usage: 'header 右侧 extra 文字（组件消费）' },
  'card-extra-weight': { value: 'var(--cd-font-card-extra-fontweight)', category: 'font', label: '卡片附加字重', usage: 'header extra 字重（组件消费）' },
  'card-extra-size': { value: 'var(--cd-font-card-extra-fontsize)', category: 'font', label: '卡片附加字号', usage: 'header extra 字号（组件消费）' },
  'card-desc-color': { value: 'var(--cd-color-card-description-text)', category: 'color', label: '卡片描述色', usage: 'Meta 描述文字（组件消费）' },
  'card-body-color': { value: 'var(--cd-color-card-body-text)', category: 'color', label: '卡片正文色', usage: 'body 正文文字（组件消费）' },
  'card-default-weight': { value: 'var(--cd-font-card-default-fontweight)', category: 'font', label: '卡片默认字重', usage: '卡片/正文默认字重（组件消费）' },
  'card-default-size': { value: 'var(--cd-font-card-default-fontsize)', category: 'font', label: '卡片默认字号', usage: '卡片/正文默认字号（组件消费）' },
  'card-default-lineheight': { value: 'var(--cd-font-card-default-lineheight)', category: 'font', label: '卡片默认行高', usage: '卡片/正文/描述默认行高（组件消费）' },
  'card-avatar-marginright': { value: 'var(--cd-spacing-card-avatar-marginright)', category: 'spacing', label: 'Meta 头像右边距', usage: 'Meta 头像右侧外边距（组件消费）' },
  'card-shadow': { value: 'var(--cd-shadow-card)', category: 'other', label: '卡片阴影', usage: 'shadows=hover/always 阴影（组件消费；Semi 单档 elevated）' },
  'card-transition-duration': { value: 'var(--cd-motion-card-transition-duration)', category: 'other', label: '卡片阴影过渡时长', usage: 'shadows 悬浮阴影过渡时长（组件消费）' },
  'card-z-hover': { value: 'var(--cd-z-card-hover)', category: 'other', label: '卡片悬浮层级', usage: '悬浮后 z-index，避免网格阴影被邻卡覆盖（组件消费）' },

  // —— CardGroup（组件消费） ——
  'cardgroup-spacing': { value: 'var(--cd-spacing-card-margin)', category: 'spacing', label: '卡片组间距', usage: 'CardGroup 默认卡片间距（组件消费；Semi 默认 16 = spacing-base-loose）' },
  'cardgroup-card-margin': { value: 'var(--cd-spacing-cardgroup-card-margin)', category: 'spacing', label: '卡片组拼接负边距', usage: '网格型相邻卡片边框拼接负外边距（组件消费）' },
} satisfies TokenGroup;
