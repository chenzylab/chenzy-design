/**
 * Component tokens for Tag / TagGroup / SplitTagGroup。
 * 严格对齐 Semi semi-foundation/tag/variables.scss（值 1:1，逐条亲验）。
 * 单层：组件直接消费本文件 token，无「原始层 + 组件消费短名」双层中间变量。
 *
 * 映射约定（对齐 Semi variables.scss）：
 *  - Semi `$xxx_yyy` / `$xxx-yyy` → kebab（统一 `tag-` 前缀）。
 *  - `var(--semi-color-*)` → `var(--cd-color-*)`；`var(--semi-color-white)` → `var(--cd-color-white)`。
 *  - `$spacing-tight/extra-tight/super-tight` → `var(--cd-spacing-*)`。
 *  - `var(--semi-border-radius-small/full)` → `var(--cd-border-radius-small/full)`。
 *  - `$font-weight-bold` → `var(--cd-font-weight-bold)`；`font-size-small` mixin → `var(--cd-font-size-small)`。
 *  - `rgba(var(--semi-grey-2), 0.7)`：我们 grey 是 hex，用 color-mix 等价（grey-2 70% + 透明）。
 *  - `var(--semi-color-default)`（方形头像图片底）无对应 alias，用 `--cd-color-fill-1` 近似（沿用 display.ts 约定）。
 *  - Semi AI 色板（`--semi-color-ai-purple` / `--semi-color-ai-general` / `--semi-ai-*`）我们无对应 alias，
 *    与 Button/FloatButton colorful 同源，用独立可编辑渐变三色 `tag-colorful-from/via/to`（AI 视觉统一）。
 *  - 17 色 × 3 type（light/solid/ghost）不逐色入 token（会爆炸 51 项），改由组件按 `--cd-color-<c>-N`
 *    全局色阶 + color-mix 派生（对齐 Semi mixin：solid=<c>-5、ghost border=<c>-4/text=<c>-5、light bg=<c>-5@15%/text=<c>-8）。
 *    此处仅定义与色系无关的通用 token。
 */
import type { TokenGroup } from './token-def.js';

export const tagTokens = {
  // —— 尺寸（Semi $height-tag_small/large；default 复用 small=20px）——
  'tag-height-small': { value: '20px', category: 'height', label: '小尺寸标签高度', usage: '小尺寸标签高度（Semi $height-tag_small）' },
  'tag-height-large': { value: '24px', category: 'height', label: '大尺寸标签高度', usage: '大尺寸标签高度（Semi $height-tag_large）' },

  // —— 圆角（Semi $radius-tag / $radius-tag_circle）——
  'tag-radius': { value: 'var(--cd-border-radius-small)', category: 'radius', label: '标签圆角', usage: '标签圆角大小（Semi $radius-tag）' },
  'tag-radius-circle': { value: 'var(--cd-border-radius-full)', category: 'radius', label: '胶囊标签圆角', usage: '胶囊标签圆角大小（Semi $radius-tag_circle）' },

  // —— 描边宽度（Semi $width-tag-border / $width-tag-outline）——
  'tag-border-width': { value: '1px', category: 'width', label: '标签描边宽度', usage: '标签描边宽度（Semi $width-tag-border）' },
  'tag-outline-width': { value: '2px', category: 'width', label: '标签轮廓宽度', usage: '聚焦轮廓宽度（Semi $width-tag-outline）' },
  'tag-outline-color': { value: 'var(--cd-color-primary-light-active)', category: 'color', label: '聚焦轮廓色', usage: '标签轮廓聚焦色（Semi $color-tag-outline-focus）' },

  // —— 内边距（Semi $spacing-tag_small/large-paddingX/Y）——
  'tag-small-padding-y': { value: '2px', category: 'spacing', label: '小标签垂直内边距', usage: '小尺寸标签垂直方向内边距（Semi $spacing-tag_small-paddingY）' },
  'tag-small-padding-x': { value: 'var(--cd-spacing-tight)', category: 'spacing', label: '小标签水平内边距', usage: '小尺寸标签水平方向内边距（Semi $spacing-tag_small-paddingX）' },
  'tag-large-padding-y': { value: '4px', category: 'spacing', label: '大标签垂直内边距', usage: '大尺寸标签垂直方向内边距（Semi $spacing-tag_large-paddingY）' },
  'tag-large-padding-x': { value: 'var(--cd-spacing-tight)', category: 'spacing', label: '大标签水平内边距', usage: '大尺寸标签水平方向内边距（Semi $spacing-tag_large-paddingX）' },

  // —— prefix/suffix 图标间距（Semi $spacing-tag_prefix/suffix_icon_padding）——
  'tag-prefix-icon-padding-right': { value: 'var(--cd-spacing-extra-tight)', category: 'spacing', label: '前缀图标右间距', usage: '前缀图标右侧边距（Semi $spacing-tag_prefix_icon_paddingRight）' },
  'tag-suffix-icon-padding-left': { value: 'var(--cd-spacing-extra-tight)', category: 'spacing', label: '后缀图标左间距', usage: '后缀图标左侧边距（Semi $spacing-tag_suffix_icon_paddingLeft）' },

  // —— 字号 / 字重 ——
  'tag-font-size': { value: 'var(--cd-font-size-small)', category: 'font', label: '标签字号', usage: '标签字号（Semi font-size-small mixin）' },
  'tag-colorful-font-weight': { value: 'var(--cd-font-weight-bold)', category: 'font', label: '多彩标签字重', usage: 'AI 多彩标签字重（Semi $font-tag_colorful-fontWeight）' },

  // —— 关闭按钮（Semi $color-tag_close-icon-default/hover/active + 内边距）——
  'tag-close-icon-default': { value: 'var(--cd-color-text-2)', category: 'color', label: '关闭按钮色', usage: '可删除标签删除按钮颜色（Semi $color-tag_close-icon-default）' },
  'tag-close-icon-hover': { value: 'var(--cd-color-text-1)', category: 'color', label: '关闭按钮悬浮色', usage: '关闭按钮悬浮颜色（Semi $color-tag_close-icon-hover）' },
  'tag-close-icon-active': { value: 'var(--cd-color-text-0)', category: 'color', label: '关闭按钮按下色', usage: '关闭按钮按下颜色（Semi $color-tag_close-icon-active）' },
  'tag-close-padding-left': { value: 'var(--cd-spacing-extra-tight)', category: 'spacing', label: '关闭按钮左内距', usage: '关闭按钮左侧内边距（Semi $spacing-tag_close-paddingLeft）' },
  'tag-closable-padding-top': { value: 'var(--cd-spacing-extra-tight)', category: 'spacing', label: '可删除标签上内距', usage: '可删除标签顶部内边距（Semi $spacing-tag_closable-paddingTop）' },
  'tag-closable-padding-right': { value: 'var(--cd-spacing-extra-tight)', category: 'spacing', label: '可删除标签右内距', usage: '可删除标签右侧内边距（Semi $spacing-tag_closable-paddingRight）' },
  'tag-closable-padding-bottom': { value: 'var(--cd-spacing-extra-tight)', category: 'spacing', label: '可删除标签下内距', usage: '可删除标签底部内边距（Semi $spacing-tag_closable-paddingBottom）' },
  'tag-closable-padding-left': { value: 'var(--cd-spacing-tight)', category: 'spacing', label: '可删除标签左内距', usage: '可删除标签左侧内边距（Semi $spacing-tag_closable-paddingLeft）' },

  // —— white 色（Semi $color-tag_white-*，单独定义，非 mixin 派生）——
  'tag-white-bg': { value: 'var(--cd-color-bg-4)', category: 'color', label: 'white 标签背景', usage: 'white 标签背景色（Semi $color-tag_white-bg-default）' },
  'tag-white-border': { value: 'color-mix(in srgb, var(--cd-color-grey-2) 70%, transparent)', category: 'color', label: 'white 标签描边', usage: 'white 标签描边色（Semi rgba(--semi-grey-2, 0.7)）' },
  'tag-white-text': { value: 'var(--cd-color-text-0)', category: 'color', label: 'white 标签文字', usage: 'white 标签文字色（Semi $color-tag_white-text-default）' },
  'tag-white-icon': { value: 'var(--cd-color-text-2)', category: 'color', label: 'white 标签图标', usage: 'white 标签图标色（Semi $color-tag_white-icon-default）' },

  // —— 头像标签（Semi $color-tag_avatar-* + 圆角尺寸 + 内边距 + 外边距）——
  'tag-avatar-bg': { value: 'var(--cd-color-bg-4)', category: 'color', label: '头像标签背景', usage: '头像标签背景色（Semi $color-tag_avatar-bg-default）' },
  'tag-avatar-border': { value: 'var(--cd-color-border)', category: 'color', label: '头像标签描边', usage: '头像标签描边色（Semi $color-tag_avatar-border-default）' },
  'tag-avatar-text': { value: 'var(--cd-color-text-0)', category: 'color', label: '头像标签文字', usage: '头像标签文字色（Semi $color-tag_avatar-text-default）' },
  'tag-avatar-square-img-bg': { value: 'var(--cd-color-fill-1)', category: 'color', label: '方形头像图片底', usage: '方形头像图片背景色（Semi $color-tag_avatar_square_img-bg-default，近似 color-default）' },
  'tag-avatar-circle-small': { value: '16px', category: 'width', label: '圆头像小尺寸', usage: '小尺寸圆形头像标签头像宽高（Semi $width-tag_avatar_circle_small）' },
  'tag-avatar-circle-large': { value: '20px', category: 'width', label: '圆头像大尺寸', usage: '大尺寸圆形头像标签头像宽高（Semi $width-tag_avatar_circle_large）' },
  'tag-avatar-margin-right': { value: 'var(--cd-spacing-extra-tight)', category: 'spacing', label: '头像右外距', usage: '头像右侧外边距（Semi $spacing-tag_avatar-marginRight）' },
  'tag-avatar-square-padding-x': { value: 'var(--cd-spacing-extra-tight)', category: 'spacing', label: '方形头像右内距', usage: '方形头像标签右侧内边距（Semi $spacing-tag_avatar_square-paddingRight）' },
  'tag-avatar-circle-padding-y': { value: 'var(--cd-spacing-super-tight)', category: 'spacing', label: '圆头像纵内距', usage: '圆形头像标签垂直内边距（Semi $spacing-tag_avatar_circle-paddingTop/Bottom）' },
  'tag-avatar-circle-padding-x': { value: 'var(--cd-spacing-extra-tight)', category: 'spacing', label: '圆头像右内距', usage: '圆形头像标签右侧内边距（Semi $spacing-tag_avatar_circle-paddingRight）' },
  'tag-avatar-circle-padding-left': { value: 'var(--cd-spacing-super-tight)', category: 'spacing', label: '圆头像左内距', usage: '圆形头像标签左侧内边距（Semi $spacing-tag_avatar_circle-paddingLeft）' },

  // —— AI 多彩标签（colorful/gradient）：与 Button/FloatButton colorful 同源可编辑渐变三色 ——
  'tag-colorful-from': { value: '#4d6bff', category: 'color', label: 'Colorful 渐变起始色', usage: 'colorful（AI 多彩）蓝→紫渐变起始色', editable: true },
  'tag-colorful-via': { value: '#7b5cff', category: 'color', label: 'Colorful 渐变中间色', usage: 'colorful（AI 多彩）蓝→紫渐变中间色', editable: true },
  'tag-colorful-to': { value: '#a64dff', category: 'color', label: 'Colorful 渐变结束色', usage: 'colorful（AI 多彩）蓝→紫渐变结束色', editable: true },

  // —— TagGroup（Semi $spacing-tag_group-marginRight；折叠高度 = tag 高 + 2px）——
  'tag-group-margin-right': { value: 'var(--cd-spacing-tight)', category: 'spacing', label: '组内标签右外距', usage: '标签组内相邻标签右侧外边距（Semi $spacing-tag_group-marginRight）' },

  // —— SplitTagGroup（Semi tag.scss .semi-tag-split：相邻 margin-right 1px 合并边）——
  'tag-split-gap': { value: '1px', category: 'spacing', label: '分段标签间距', usage: '分段标签相邻间距（Semi .semi-tag-split .semi-tag margin-right: 1px）' },
} satisfies TokenGroup;
