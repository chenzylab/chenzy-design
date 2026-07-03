/**
 * Component tokens for Tag / Avatar / Badge / Card（M4 Show）。四个展示类组件共用本文件，
 * 全量对齐 Semi Design：
 *   - tag/variables.scss（64）
 *   - avatar/variables.scss（89）
 *   - badge/variables.scss（37）
 *   - card/variables.scss（23）
 * 并升级为带元数据的 TokenDef 结构以支持 DSM。值为 var() 引用我们的 alias / global token，
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
  // ============================== Tag（64） ==============================
  'color-tag-avatar-bg-default': { value: 'var(--cd-color-bg-4)', category: 'color', label: '头像标签背景色', usage: '头像标签背景颜色 - 默认' },
  'color-tag-avatar-border-default': { value: 'var(--cd-color-border)', category: 'color', label: '头像标签描边色', usage: '头像标签描边颜色 - 默认' },
  'color-tag-avatar-text-default': { value: 'var(--cd-color-text-0)', category: 'color', label: '头像标签文字色', usage: '头像标签文字颜色 - 默认' },

  'color-tag-white-bg-default': { value: 'var(--cd-color-bg-4)', category: 'color', label: '白色标签背景色', usage: '白色标签背景颜色 - 默认' },
  'color-tag-white-border-default': { value: 'color-mix(in srgb, var(--cd-color-grey-2) 70%, transparent)', category: 'color', label: '白色标签描边色', usage: '白色标签描边颜色 - 默认' },
  'color-tag-white-text-default': { value: 'var(--cd-color-text-0)', category: 'color', label: '白色标签文字色', usage: '白色标签文字颜色 - 默认' },
  'color-tag-white-icon-default': { value: 'var(--cd-color-text-2)', category: 'color', label: '白色标签图标色', usage: '白色标签图标颜色 - 默认' },

  'color-tag-outline-focus': { value: 'var(--cd-color-primary-light-active)', category: 'color', label: '标签轮廓聚焦色', usage: '标签轮廓 - 聚焦' },

  'color-tag-colorful-solid-bg': { value: 'var(--cd-color-primary)', category: 'color', label: 'AI标签深底背景', usage: 'AI Tag深色底色类型背景色' },
  'color-tag-colorful-solid-text': { value: 'var(--cd-color-text-inverse)', category: 'color', label: 'AI标签深底文字', usage: 'AI Tag 深色底色类型字体颜色' },
  'color-tag-colorful-solid-gradient-bg': { value: 'var(--cd-color-primary)', category: 'color', label: 'AI标签深底渐变背景', usage: 'AI Tag深色底色类型渐变背景色' },

  'color-tag-colorful-light-bg': { value: 'var(--cd-color-primary-light-default)', category: 'color', label: 'AI标签浅底背景', usage: 'AI Tag 浅色底色类型背景色' },
  'color-tag-colorful-light-text': { value: 'var(--cd-color-primary)', category: 'color', label: 'AI标签浅底文字', usage: 'AI Tag 浅色底色类型字体颜色' },
  'color-tag-colorful-light-gradient-bg': { value: 'var(--cd-color-primary-light-default)', category: 'color', label: 'AI标签浅底渐变背景', usage: 'AI Tag浅色底色类型背景色-渐变' },
  'color-tag-colorful-light-gradient-text': { value: 'var(--cd-color-primary)', category: 'color', label: 'AI标签浅底渐变文字', usage: 'AI Tag浅色底色类型字体色-渐变' },
  'color-tag-colorful-light-gradient-1': { value: 'var(--cd-color-primary)', category: 'color', label: 'AI标签浅底图标渐变1', usage: 'AI Tag 浅色底色icon渐变色1' },
  'color-tag-colorful-light-gradient-2': { value: 'var(--cd-color-primary)', category: 'color', label: 'AI标签浅底图标渐变2', usage: 'AI Tag 浅色底色icon渐变色2' },
  'color-tag-colorful-light-gradient-3': { value: 'var(--cd-color-primary)', category: 'color', label: 'AI标签浅底图标渐变3', usage: 'AI Tag 浅色底色icon渐变色3' },
  'color-tag-colorful-light-gradient-4': { value: 'var(--cd-color-primary)', category: 'color', label: 'AI标签浅底图标渐变4', usage: 'AI Tag 浅色底色icon渐变色4' },

  'color-tag-colorful-ghost-bg': { value: 'var(--cd-color-text-inverse)', category: 'color', label: 'AI标签白底背景', usage: 'AI Tag 白色底色类型背景色' },
  'color-tag-colorful-ghost-text': { value: 'var(--cd-color-primary)', category: 'color', label: 'AI标签白底文字', usage: 'AI Tag 白色底色类型字体颜色' },
  'color-tag-colorful-ghost-border': { value: 'var(--cd-color-primary)', category: 'color', label: 'AI标签白底描边', usage: 'AI Tag 白色底色类型描边颜色' },
  'color-tag-colorful-ghost-gradient-text': { value: 'var(--cd-color-primary)', category: 'color', label: 'AI标签白底渐变文字', usage: 'AI Tag 白色底色类型字体色-渐变' },
  'color-tag-colorful-ghost-gradient-1': { value: 'var(--cd-color-primary)', category: 'color', label: 'AI标签白底图标渐变1', usage: 'AI Tag 白色底色icon渐变色1' },
  'color-tag-colorful-ghost-gradient-2': { value: 'var(--cd-color-primary)', category: 'color', label: 'AI标签白底图标渐变2', usage: 'AI Tag 白色底色icon渐变色2' },
  'color-tag-colorful-ghost-gradient-3': { value: 'var(--cd-color-primary)', category: 'color', label: 'AI标签白底图标渐变3', usage: 'AI Tag 白色底色icon渐变色3' },
  'color-tag-colorful-ghost-gradient-4': { value: 'var(--cd-color-primary)', category: 'color', label: 'AI标签白底图标渐变4', usage: 'AI Tag 白色底色icon渐变色4' },

  'width-tag-avatar-circle-small': { value: '16px', category: 'width', label: '圆头像标签小圆角', usage: '头像标签圆角 - 小尺寸' },
  'width-tag-avatar-circle-large': { value: '20px', category: 'width', label: '圆头像标签大圆角', usage: '头像标签圆角 - 大尺寸' },

  'width-tag-border': { value: '1px', category: 'width', label: '标签描边宽度', usage: '标签描边宽度' },
  'width-tag-avatar-border': { value: 'var(--cd-width-tag-border)', category: 'width', label: '头像标签描边宽度', usage: '头像标签描边宽度' },

  'width-tag-outline': { value: '2px', category: 'width', label: '标签轮廓宽度', usage: '标签轮廓宽度' },

  'height-tag-small': { value: '20px', category: 'height', label: '小尺寸标签高度', usage: '小尺寸标签高度' },
  'height-tag-large': { value: '24px', category: 'height', label: '大尺寸标签高度', usage: '大尺寸标签高度' },
  'radius-tag': { value: 'var(--cd-border-radius-small)', category: 'radius', label: '标签圆角', usage: '标签圆角大小' },
  'radius-tag-circle': { value: 'var(--cd-border-radius-full)', category: 'radius', label: '胶囊标签圆角', usage: '胶囊标签圆角大小' },

  'spacing-tag-small-paddingy': { value: '2px', category: 'spacing', label: '小标签垂直内边距', usage: '小尺寸标签垂直方向内边距' },
  'spacing-tag-small-paddingx': { value: 'var(--cd-spacing-tight)', category: 'spacing', label: '小标签水平内边距', usage: '小尺寸标签水平方向内边距' },

  'spacing-tag-prefix-icon-paddingright': { value: 'var(--cd-spacing-extra-tight)', category: 'spacing', label: '前缀图标右边距', usage: '后缀图标右侧边距' },
  'spacing-tag-suffix-icon-paddingleft': { value: 'var(--cd-spacing-extra-tight)', category: 'spacing', label: '后缀图标左边距', usage: '后缀图标左侧边距' },

  'spacing-tag-large-paddingy': { value: '4px', category: 'spacing', label: '大标签垂直内边距', usage: '大尺寸标签垂直方向内边距' },
  'spacing-tag-large-paddingx': { value: 'var(--cd-spacing-tight)', category: 'spacing', label: '大标签水平内边距', usage: '大尺寸标签水平方向内边距' },

  'color-tag-close-icon-default': { value: 'var(--cd-color-text-2)', category: 'color', label: '关闭按钮色', usage: '可删除的标签删除按钮颜色' },
  'color-tag-close-icon-hover': { value: 'var(--cd-color-text-1)', category: 'color', label: '关闭按钮悬浮色', usage: '可删除的标签删除按钮颜色 - 悬浮' },
  'color-tag-close-icon-active': { value: 'var(--cd-color-text-0)', category: 'color', label: '关闭按钮按下色', usage: '可删除的标签删除按钮颜色 - 按下' },
  'color-tag-close-icon-deep-default': { value: 'var(--cd-color-text-inverse)', category: 'color', label: '深色关闭按钮色', usage: '深色模式下可删除的标签删除按钮颜色' },
  'spacing-tag-close-paddingleft': { value: 'var(--cd-spacing-extra-tight)', category: 'spacing', label: '关闭按钮左内边距', usage: '可删除的标签删除按钮左侧内边距' },
  'spacing-tag-closable-paddingtop': { value: 'var(--cd-spacing-extra-tight)', category: 'spacing', label: '可删标签上内边距', usage: '可删除的标签删除按钮顶部内边距' },
  'spacing-tag-closable-paddingright': { value: 'var(--cd-spacing-extra-tight)', category: 'spacing', label: '可删标签右内边距', usage: '可删除的标签删除按钮右侧内边距' },
  'spacing-tag-closable-paddingbottom': { value: 'var(--cd-spacing-extra-tight)', category: 'spacing', label: '可删标签下内边距', usage: '可删除的标签删除按钮底部内边距' },
  'spacing-tag-closable-paddingleft': { value: 'var(--cd-spacing-tight)', category: 'spacing', label: '可删标签左内边距', usage: '可删除的标签删除按钮左侧内边距' },

  'spacing-tag-avatar-marginright': { value: 'var(--cd-spacing-extra-tight)', category: 'spacing', label: '头像标签头像右边距', usage: '头像标签头像右侧外边距' },

  'spacing-tag-avatar-square-paddingtop': { value: '0', category: 'spacing', label: '方头像标签上内边距', usage: '方形头像标签头像顶部内边距' },
  'spacing-tag-avatar-square-paddingright': { value: 'var(--cd-spacing-extra-tight)', category: 'spacing', label: '方头像标签右内边距', usage: '方形头像标签头像右侧内边距' },
  'spacing-tag-avatar-square-paddingbottom': { value: '0', category: 'spacing', label: '方头像标签下内边距', usage: '方形头像标签头像底部内边距' },
  'spacing-tag-avatar-square-paddingleft': { value: '0', category: 'spacing', label: '方头像标签左内边距', usage: '方形头像标签头像左侧内边距' },

  'spacing-tag-avatar-circle-paddingtop': { value: 'var(--cd-spacing-super-tight)', category: 'spacing', label: '圆头像标签上内边距', usage: '圆型头像标签头像顶部内边距' },
  'spacing-tag-avatar-circle-paddingright': { value: 'var(--cd-spacing-extra-tight)', category: 'spacing', label: '圆头像标签右内边距', usage: '圆型头像标签头像右侧内边距' },
  'spacing-tag-avatar-circle-paddingbottom': { value: 'var(--cd-spacing-super-tight)', category: 'spacing', label: '圆头像标签下内边距', usage: '圆型头像标签头像底部内边距' },
  'spacing-tag-avatar-circle-paddingleft': { value: 'var(--cd-spacing-super-tight)', category: 'spacing', label: '圆头像标签左内边距', usage: '圆型头像标签头像左侧内边距' },

  'color-tag-avatar-square-img-bg-default': { value: 'var(--cd-color-fill-1)', category: 'color', label: '方头像标签图片底色', usage: '方形头像标签头像背景色 - 默认' },

  'spacing-tag-group-marginbottom': { value: '0', category: 'spacing', label: '标签组下外边距', usage: '标签组底部外边距' },
  'spacing-tag-group-marginright': { value: 'var(--cd-spacing-tight)', category: 'spacing', label: '标签组右外边距', usage: '标签组右侧外边距' },

  'font-tag-colorful-fontweight': { value: 'var(--cd-font-weight-bold)', category: 'font', label: 'AI标签字重', usage: 'AI tag的字重' },

  // ============================== Avatar（89） ==============================
  'z-avatar-default': { value: '100', category: 'other', label: '头像层级', usage: '头像 z-index' },
  'color-avatar-default-border-default': { value: 'var(--cd-color-bg-1)', category: 'color', label: '头像描边色', usage: '头像描边颜色' },
  'color-avatar-more-default-bg-default': { value: 'var(--cd-color-grey-5)', category: 'color', label: '「更多」背景色', usage: '「更多」描边颜色' },
  'color-avatar-outline-focus': { value: 'var(--cd-color-primary-light-active)', category: 'color', label: '头像聚焦轮廓色', usage: '头像聚焦轮廓颜色' },

  'width-avatar-extra-extra-small': { value: '20px', category: 'width', label: '极小头像尺寸', usage: '头像尺寸 - 极小' },
  'font-avatar-extra-extra-small-size': { value: '10px', category: 'font', label: '极小头像字号', usage: '文本字号 - 极小' },
  'font-avatar-extra-extra-small-lineheight': { value: '15px', category: 'font', label: '极小头像行高', usage: '文本行高 - 极小' },

  'width-avatar-extra-small': { value: '24px', category: 'width', label: '超小头像尺寸', usage: '头像尺寸 - 超小' },
  'font-avatar-extra-small-size': { value: '10px', category: 'font', label: '超小头像字号', usage: '文本字号 - 超小' },
  'font-avatar-extra-small-lineheight': { value: '15px', category: 'font', label: '超小头像行高', usage: '文本行高 - 超小' },

  'width-avatar-small': { value: '32px', category: 'width', label: '小头像尺寸', usage: '头像尺寸 - 小' },
  'width-avatar-default': { value: '40px', category: 'width', label: '默认头像尺寸', usage: '头像尺寸 - 默认' },
  'width-avatar-medium': { value: '48px', category: 'width', label: '中头像尺寸', usage: '头像尺寸 - 中' },
  'width-avatar-large': { value: '72px', category: 'width', label: '大头像尺寸', usage: '头像尺寸 - 大' },

  'width-avatar-extra-large': { value: '128px', category: 'width', label: '超大头像尺寸', usage: '头像尺寸 - 超大' },
  'font-avatar-extra-large-size': { value: '64px', category: 'font', label: '超大头像字号', usage: '文本字号 - 超大' },
  'font-avatar-extra-large-lineheight': { value: '77px', category: 'font', label: '超大头像行高', usage: '文本行高 - 超大' },

  'radius-avatar': { value: 'var(--cd-border-radius-circle)', category: 'radius', label: '头像圆角', usage: '头像圆角' },

  'width-avatar-extra-large-border': { value: '3px', category: 'width', label: '超大头像组描边', usage: '头像组头像描边尺寸 - 超大' },
  'spacing-avatar-extra-large-marginleft': { value: '-32px', category: 'spacing', label: '超大头像左外边距', usage: '头像组头像左侧外边距 - 超大' },

  'width-avatar-large-border': { value: '3px', category: 'width', label: '大头像组描边', usage: '头像组头像描边尺寸 - 大' },
  'spacing-avatar-large-marginleft': { value: '-18px', category: 'spacing', label: '大头像左外边距', usage: '头像左侧外边距 - 大' },

  'width-avatar-medium-border': { value: '2px', category: 'width', label: '中头像组描边', usage: '头像组头像描边尺寸 - 中' },
  'spacing-avatar-medium-marginleft': { value: '-12px', category: 'spacing', label: '中头像左外边距', usage: '头像左侧外边距 - 中' },

  'width-avatar-default-border': { value: '2px', category: 'width', label: '默认头像组描边', usage: '头像组头像描边尺寸 - 默认' },
  'spacing-avatar-default-marginleft': { value: '-12px', category: 'spacing', label: '默认头像左外边距', usage: '头像左侧外边距 - 默认' },

  'width-avatar-small-border': { value: '2px', category: 'width', label: '小头像组描边', usage: '头像组头像描边尺寸 - 小' },
  'spacing-avatar-small-marginleft': { value: '-12px', category: 'spacing', label: '小头像左外边距', usage: '头像左侧外边距 - 小' },

  'width-avatar-extra-small-border': { value: '1px', category: 'width', label: '超小头像组描边', usage: '头像组头像描边尺寸 - 超小' },
  'spacing-avatar-extra-small-marginleft': { value: '-10px', category: 'spacing', label: '超小头像左外边距', usage: '头像左侧外边距 - 超小' },

  'width-avatar-extra-extra-small-border': { value: '1px', category: 'width', label: '极小头像组描边', usage: '头像组头像描边尺寸 - 极小' },
  'spacing-avatar-extra-extra-small-marginleft': { value: '-4px', category: 'spacing', label: '极小头像左外边距', usage: '头像左侧外边距 - 极小' },
  'width-avatar-outline': { value: '2px', category: 'width', label: '头像聚焦轮廓宽度', usage: '头像聚焦轮廓宽度' },

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

  'width-avatar-bottom-slot-circle-extra-small': { value: '12px', category: 'width', label: '超小底部圆slot半径', usage: 'extra small 头像底部 slot 圆形半径' },
  'width-avatar-bottom-slot-circle-small': { value: '12px', category: 'width', label: '小底部圆slot半径', usage: 'small 头像底部 slot 圆形半径' },
  'width-avatar-bottom-slot-circle-default': { value: '16px', category: 'width', label: '默认底部圆slot半径', usage: 'default 头像底部 slot 圆形半径' },
  'width-avatar-bottom-slot-circle-medium': { value: '18px', category: 'width', label: '中底部圆slot半径', usage: 'medium 头像底部 slot 圆形半径' },
  'width-avatar-bottom-slot-circle-large': { value: '28px', category: 'width', label: '大底部圆slot半径', usage: 'large 头像底部 slot 圆形半径' },
  'width-avatar-bottom-slot-circle-extra-large': { value: '28px', category: 'width', label: '超大底部圆slot半径', usage: 'extra large 头像底部 slot 圆形半径' },
  'color-avatar-bottom-slot-bg': { value: 'var(--cd-color-primary)', category: 'color', label: '底部slot背景色', usage: '头像底部 slot 背景色' },

  'radius-avatar-bottom-slot-square': { value: '4px', category: 'radius', label: '底部方slot圆角', usage: '底部 slot square 圆角' },
  'font-avatar-bottom-slot-extra-small-fontsize': { value: '5px', category: 'font', label: '超小底部slot字号', usage: 'extra small 底部 slot 文字大小' },
  'font-avatar-bottom-slot-small-fontsize': { value: '5px', category: 'font', label: '小底部slot字号', usage: 'small 底部 slot 文字大小' },
  'font-avatar-bottom-slot-default-fontsize': { value: '12px', category: 'font', label: '默认底部slot字号', usage: 'default 底部 slot 文字大小' },
  'font-avatar-bottom-slot-medium-fontsize': { value: '12px', category: 'font', label: '中底部slot字号', usage: 'medium 底部 slot 文字大小' },
  'font-avatar-bottom-slot-large-fontsize': { value: '12px', category: 'font', label: '大底部slot字号', usage: 'large 底部 slot 文字大小' },
  'font-avatar-bottom-slot-extra-large-fontsize': { value: '14px', category: 'font', label: '超大底部slot字号', usage: 'extra large 底部 slot 文字大小' },
  'spacing-avatar-bottom-slot-square-paddingx': { value: '4px', category: 'spacing', label: '底部方slot水平内边距', usage: '底部 slot square 形状左边距' },
  'spacing-avatar-bottom-slot-square-paddingy': { value: '1px', category: 'spacing', label: '底部方slot垂直内边距', usage: '底部 slot square 形状右边距' },

  'font-avatar-top-slot-small-fontsize': { value: '5px', category: 'font', label: '小顶部slot字号', usage: 'small 顶部 slot 文字大小' },
  'font-avatar-top-slot-default-fontsize': { value: '6px', category: 'font', label: '默认顶部slot字号', usage: 'default 顶部 slot 文字大小' },
  'font-avatar-top-slot-medium-fontsize': { value: '8px', category: 'font', label: '中顶部slot字号', usage: 'medium 顶部 slot 文字大小' },
  'font-avatar-top-slot-large-fontsize': { value: '14px', category: 'font', label: '大顶部slot字号', usage: 'large 顶部 slot 文字大小' },
  'font-avatar-top-slot-extra-large-fontsize': { value: '16px', category: 'font', label: '超大顶部slot字号', usage: 'extra large 顶部 slot 文字大小' },

  'spacing-avatar-top-slot-small-content-margintop': { value: '0px', category: 'spacing', label: '小顶部文字上边距', usage: 'small 顶部文字 marginTop' },
  'spacing-avatar-top-slot-default-content-margintop': { value: '-2px', category: 'spacing', label: '默认顶部文字上边距', usage: 'default 顶部文字 marginTop' },
  'spacing-avatar-top-slot-medium-content-margintop': { value: '0px', category: 'spacing', label: '中顶部文字上边距', usage: 'medium 顶部文字 marginTop' },
  'spacing-avatar-top-slot-large-content-margintop': { value: '0px', category: 'spacing', label: '大顶部文字上边距', usage: 'large 顶部文字 marginTop' },
  'spacing-avatar-top-slot-extra-large-content-margintop': { value: '0px', category: 'spacing', label: '超大顶部文字上边距', usage: 'extra large 顶部文字 marginTop' },

  'color-avatar-bottom-slot-square-border': { value: 'var(--cd-color-bg-0)', category: 'color', label: '底部方slot边框色', usage: '底部 square 边框颜色' },
  'width-avatar-bottom-slot-square-extra-small-border': { value: '2px', category: 'width', label: '超小底部方slot边框', usage: 'small 头像底部 square 边框宽度' },
  'width-avatar-bottom-slot-square-small-border': { value: '2px', category: 'width', label: '小底部方slot边框', usage: 'small 头像底部 square 边框宽度' },
  'width-avatar-bottom-slot-square-default-border': { value: '2px', category: 'width', label: '默认底部方slot边框', usage: 'default 头像底部 square 边框宽度' },
  'width-avatar-bottom-slot-square-medium-border': { value: '2px', category: 'width', label: '中底部方slot边框', usage: 'medium 头像底部 square 边框宽度' },
  'width-avatar-bottom-slot-square-large-border': { value: '2px', category: 'width', label: '大底部方slot边框', usage: 'large 头像底部 square 边框宽度' },
  'width-avatar-bottom-slot-square-extra-large-border': { value: '2px', category: 'width', label: '超大底部方slot边框', usage: 'extra large 头像底部 square 边框宽度' },

  'color-avatar-top-slot-text': { value: 'var(--cd-color-bg-0)', category: 'color', label: '顶部slot文字色', usage: '顶部 Slot 文字颜色' },
  'color-avatar-top-slot-gradient-start': { value: 'var(--cd-color-primary)', category: 'color', label: '顶部slot渐变起始色', usage: '顶部 slot 渐变起始色' },
  'color-avatar-top-slot-gradient-end': { value: 'var(--cd-color-primary)', category: 'color', label: '顶部slot渐变结束色', usage: '顶部 slot 渐变结束色' },

  'spacing-avatar-top-slot-small-shift': { value: '-28px', category: 'spacing', label: '小顶部slot偏移', usage: 'small 顶部 slot 偏移量, 和 scale 一起控制 slot 的位置' },
  'spacing-avatar-top-slot-default-shift': { value: '-32px', category: 'spacing', label: '默认顶部slot偏移', usage: 'default 顶部 slot 偏移量, 和 scale 一起控制 slot 的位置' },
  'spacing-avatar-top-slot-medium-shift': { value: '-30px', category: 'spacing', label: '中顶部slot偏移', usage: 'medium 顶部 slot 偏移量, 和 scale 一起控制 slot 的位置' },
  'spacing-avatar-top-slot-large-shift': { value: '-30px', category: 'spacing', label: '大顶部slot偏移', usage: 'large 顶部 slot 偏移量, 和 scale 一起控制 slot 的位置' },
  'spacing-avatar-top-slot-extra-large-shift': { value: '-32px', category: 'spacing', label: '超大顶部slot偏移', usage: 'extra large 顶部 slot 偏移量, 和 scale 一起控制 slot 的位置' },

  'spacing-avatar-top-slot-small-scale': { value: '0.4', category: 'other', label: '小顶部slot缩放', usage: 'small 顶部 slot 缩放比例' },
  'spacing-avatar-top-slot-default-scale': { value: '0.7', category: 'other', label: '默认顶部slot缩放', usage: 'default 顶部 slot 缩放比例' },
  'spacing-avatar-top-slot-medium-scale': { value: '0.8', category: 'other', label: '中顶部slot缩放', usage: 'medium 顶部 slot 缩放比例' },
  'spacing-avatar-top-slot-large-scale': { value: '1.1', category: 'other', label: '大顶部slot缩放', usage: 'large 顶部 slot 缩放比例' },
  'spacing-avatar-top-slot-extra-large-scale': { value: '1.4', category: 'other', label: '超大顶部slot缩放', usage: 'large 顶部 slot 缩放比例' },

  'radius-avatar-extra-extra-small': { value: '3px', category: 'radius', label: '极小头像圆角', usage: '极小尺寸头像的圆角' },
  'radius-avatar-extra-small': { value: '3px', category: 'radius', label: '超小头像圆角', usage: '超小尺寸头像的圆角' },
  'radius-avatar-small': { value: '3px', category: 'radius', label: '小头像圆角', usage: '小尺寸头像的圆角' },
  'radius-avatar-default': { value: '3px', category: 'radius', label: '默认头像圆角', usage: '默认尺寸头像的圆角' },
  'radius-avatar-medium': { value: '3px', category: 'radius', label: '中头像圆角', usage: '中尺寸头像的圆角' },
  'radius-avatar-large': { value: '6px', category: 'radius', label: '大头像圆角', usage: '大尺寸头像的圆角' },
  'radius-avatar-extra-large': { value: '12px', category: 'radius', label: '超大头像圆角', usage: '超大尺寸头像的圆角' },

  // ============================== Badge（37） ==============================
  'color-badge-default-border-default': { value: 'var(--cd-color-bg-1)', category: 'color', label: '徽标描边色', usage: '描边颜色 - 默认' },
  'color-badge-default-bg-default': { value: 'var(--cd-color-bg-1)', category: 'color', label: '徽标背景色', usage: '背景颜色 - 默认' },
  'color-badge-default-light-bg-default': { value: 'var(--cd-color-bg-2)', category: 'color', label: '徽标浅版背景色', usage: '背景颜色 - 浅版' },

  'color-badge-default-text-default': { value: 'var(--cd-color-bg-2)', category: 'color', label: '徽标文字色', usage: '文字颜色 - 默认' },

  'color-badge-primary-solid-bg-default': { value: 'var(--cd-color-primary)', category: 'color', label: '主色徽标背景', usage: '背景颜色 - 主色' },
  'color-badge-primary-light-bg-default': { value: 'var(--cd-color-primary-light-default)', category: 'color', label: '浅主色徽标背景', usage: '背景颜色 - 浅版主色' },
  'color-badge-primary-light-text-default': { value: 'var(--cd-color-primary)', category: 'color', label: '浅主色徽标文字', usage: '文字颜色 - 浅版主色' },
  'color-badge-primary-inverted-text-default': { value: 'var(--cd-color-primary)', category: 'color', label: '白底主色徽标文字', usage: '文字颜色 - 白底' },

  'color-badge-secondary-solid-bg-default': { value: 'var(--cd-color-secondary)', category: 'color', label: '次色徽标背景', usage: '背景颜色 - 次要' },
  'color-badge-secondary-light-bg-default': { value: 'var(--cd-color-secondary-light-default)', category: 'color', label: '浅次色徽标背景', usage: '背景颜色 - 浅版次要' },
  'color-badge-secondary-light-text-default': { value: 'var(--cd-color-secondary)', category: 'color', label: '浅次色徽标文字', usage: '文字颜色 - 浅版次要' },
  'color-badge-secondary-inverted-text-default': { value: 'var(--cd-color-secondary)', category: 'color', label: '白底次色徽标文字', usage: '文字颜色 - 白底' },

  'color-badge-tertiary-solid-bg-default': { value: 'var(--cd-color-tertiary)', category: 'color', label: '三级色徽标背景', usage: '背景颜色 - 第三' },
  'color-badge-tertiary-light-bg-default': { value: 'var(--cd-color-tertiary-light-default)', category: 'color', label: '浅三级色徽标背景', usage: '背景颜色 - 第三' },
  'color-badge-tertiary-light-text-default': { value: 'var(--cd-color-tertiary)', category: 'color', label: '浅三级色徽标文字', usage: '文字颜色 - 浅版第三' },
  'color-badge-tertiary-inverted-text-default': { value: 'var(--cd-color-tertiary)', category: 'color', label: '白底三级色徽标文字', usage: '文字颜色 - 白底' },

  'color-badge-danger-solid-bg-default': { value: 'var(--cd-color-danger)', category: 'color', label: '危险徽标背景', usage: '背景颜色 - 危险' },
  'color-badge-danger-light-bg-default': { value: 'var(--cd-color-danger-light-default)', category: 'color', label: '浅危险徽标背景', usage: '背景颜色 - 浅版危险' },
  'color-badge-danger-light-text-default': { value: 'var(--cd-color-danger)', category: 'color', label: '浅危险徽标文字', usage: '文字颜色 - 浅版危险' },
  'color-badge-danger-inverted-text-default': { value: 'var(--cd-color-danger)', category: 'color', label: '白底危险徽标文字', usage: '文字颜色 - 白底' },

  'color-badge-warning-solid-bg-default': { value: 'var(--cd-color-warning)', category: 'color', label: '警告徽标背景', usage: '背景颜色 - 警告' },
  'color-badge-warning-light-bg-default': { value: 'var(--cd-color-warning-light-default)', category: 'color', label: '浅警告徽标背景', usage: '背景颜色 - 浅版警告' },
  'color-badge-warning-light-text-default': { value: 'var(--cd-color-warning)', category: 'color', label: '浅警告徽标文字', usage: '文字颜色 - 浅版危险' },
  'color-badge-warning-inverted-text-default': { value: 'var(--cd-color-warning)', category: 'color', label: '白底警告徽标文字', usage: '文字颜色 - 白底' },

  'color-badge-success-solid-bg-default': { value: 'var(--cd-color-success)', category: 'color', label: '成功徽标背景', usage: '背景颜色 - 成功' },
  'color-badge-success-light-bg-default': { value: 'var(--cd-color-success-light-default)', category: 'color', label: '浅成功徽标背景', usage: '背景颜色 - 浅版成功' },
  'color-badge-success-light-text-default': { value: 'var(--cd-color-success)', category: 'color', label: '浅成功徽标文字', usage: '文字颜色 - 浅版成功' },
  'color-badge-success-inverted-text-default': { value: 'var(--cd-color-success)', category: 'color', label: '白底成功徽标文字', usage: '文字颜色 - 白底' },

  'width-badge-dot': { value: '8px', category: 'width', label: '点状徽标宽度', usage: '点状徽标宽度' },
  'height-badge-dot': { value: '8px', category: 'height', label: '点状徽标高度', usage: '点状徽标高度' },
  'radius-badge-dot': { value: 'var(--cd-border-radius-circle)', category: 'radius', label: '点状徽标圆角', usage: '点状徽标圆角' },

  'height-badge-count': { value: '18px', category: 'height', label: '数字徽标高度', usage: '数字徽标宽度' },
  'spacing-badge-count-paddingy': { value: '0px', category: 'spacing', label: '数字徽标垂直内边距', usage: '数字徽标上下内边距' },
  'spacing-badge-count-paddingx': { value: '4px', category: 'spacing', label: '数字徽标水平内边距', usage: '数字徽标左右内边距' },

  'width-badge-border': { value: '1px', category: 'width', label: '徽标描边宽度', usage: '描边宽度' },
  'z-badge': { value: '1', category: 'other', label: '徽标层级', usage: '徽标 z-index' },
  'z-badge-light-bg': { value: '-1', category: 'other', label: '徽标浅底层级', usage: '徽标浅色背景 z-index' },

  // ============================== Card（23） ==============================
  'color-card-bg-default': { value: 'var(--cd-color-bg-0)', category: 'color', label: '卡片背景色', usage: '卡片背景颜色' },
  'color-card-border': { value: 'var(--cd-color-border)', category: 'color', label: '卡片描边色', usage: '卡片描边颜色' },
  'color-card-title-text': { value: 'var(--cd-color-text-0)', category: 'color', label: '卡片标题文字色', usage: '卡片标题文字颜色' },
  'color-card-description-text': { value: 'var(--cd-color-text-2)', category: 'color', label: '卡片描述文字色', usage: '卡片描述文字颜色' },
  'color-card-extra-text': { value: 'var(--cd-color-text-0)', category: 'color', label: '卡片附加文字色', usage: '卡片附加文字颜色' },
  'color-card-body-text': { value: 'var(--cd-color-text-1)', category: 'color', label: '卡片正文文字色', usage: '卡片正文文字颜色' },

  'font-card-default-fontweight': { value: 'var(--cd-font-weight-regular)', category: 'font', label: '卡片默认字重', usage: '卡片文字字重 - 默认' },
  'font-card-extra-fontweight': { value: '700', category: 'font', label: '卡片附加字重', usage: '卡片文字字重 - 附加文字' },
  'font-card-title-fontweight': { value: '700', category: 'font', label: '卡片标题字重', usage: '卡片文字字重 - 标题' },
  'font-card-default-lineheight': { value: '20px', category: 'font', label: '卡片默认行高', usage: '卡片文字行高 - 默认' },
  'font-card-title-lineheight': { value: '22px', category: 'font', label: '卡片标题行高', usage: '卡片文字行高 - 标题' },
  'font-card-default-fontsize': { value: 'var(--cd-font-size-regular)', category: 'font', label: '卡片默认字号', usage: '卡片文字大小 - 默认' },
  'font-card-extra-fontsize': { value: 'var(--cd-font-size-header-6)', category: 'font', label: '卡片附加字号', usage: '卡片文字大小 - 附加文字' },
  'font-card-title-fontsize': { value: 'var(--cd-font-size-header-6)', category: 'font', label: '卡片标题字号', usage: '卡片文字大小 - 标题' },

  'radius-card': { value: 'var(--cd-border-radius-medium)', category: 'radius', label: '卡片圆角', usage: '卡片圆角' },

  'motion-card-transition-duration': { value: '300ms', category: 'animation', label: '卡片悬浮动画时长', usage: '卡片悬浮动画时长' },

  'width-card-border': { value: 'var(--cd-border-thickness-control)', category: 'width', label: '卡片描边宽度', usage: '卡片描边宽度' },

  'shadow-card': { value: 'var(--cd-shadow-elevated)', category: 'other', label: '卡片阴影', usage: '卡片阴影' },

  'spacing-card-padding': { value: 'var(--cd-spacing-base-loose)', category: 'spacing', label: '卡片内边距', usage: '卡片内边距' },
  'spacing-card-margin': { value: 'var(--cd-spacing-base-loose)', category: 'spacing', label: '卡片外边距', usage: '卡片外边距' },
  'spacing-card-avatar-marginright': { value: 'var(--cd-spacing-base-tight)', category: 'spacing', label: '卡片头像右外边距', usage: '卡片头像右侧外边距' },
  'spacing-card-group-card-margin': { value: '-1px', category: 'spacing', label: '卡片组外边距', usage: '卡片组外边距' },

  'z-card-hover': { value: '1', category: 'other', label: '卡片悬浮层级', usage: '悬浮后卡片 zindex' },

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
  'tag-avatar-marginright': { value: 'var(--cd-spacing-tag-avatar-marginright)', category: 'spacing', label: '头像标签头像右边距', usage: '头像标签头像右外边距（组件消费）' },

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
