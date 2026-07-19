/**
 * Component tokens for Button / IconButton / ButtonGroup / SplitButtonGroup。
 * 严格对齐 Semi semi-foundation/button/{variables,animation}.scss（值 1:1 逐条亲验）。
 * 单层：组件直接消费本文件 token，无「原始层 + 组件消费短名」双层中间变量。
 *
 * 映射约定（对齐 tag.ts 惯例）：
 *  - `var(--semi-color-*)` → `var(--cd-color-*)`；`rgba(var(--semi-white),1)` → `var(--cd-color-white)`。
 *  - `$spacing-tight/extra-tight/super-tight/base-tight/base` → `var(--cd-spacing-*)`。
 *  - `$height-control-*` → `var(--cd-control-height-*)`；`$border-thickness*` → `var(--cd-border-thickness*)`。
 *  - `var(--semi-border-radius-small)` → `var(--cd-border-radius-small)`。
 *  - `$font-weight-bold` → `var(--cd-font-weight-bold)`；`$font-size-regular` → `var(--cd-font-size-regular)`。
 *  - Semi AI 色板（`--semi-color-ai-*`）→ alias `--cd-color-ai-general/-hover/-active/-light`
 *    与 `--cd-color-ai-purple`（4 色 278° 渐变，亮暗双套，值 1:1 镜像 Semi general-5/6/7/0 与 purple-5）。
 *    colorful token 直接消费这些语义色，与 FloatButton colorful 同源。
 */
import type { TokenGroup } from './token-def.js';

export const buttonTokens = {
  // —— primary ——
  'color-button-primary-bg-default': { value: 'var(--cd-color-primary)', category: 'color', label: '主要按钮背景色', usage: '主要按钮背景颜色' },
  'color-button-primary-text-default': { value: 'var(--cd-color-white)', category: 'color', label: '主要按钮文字色', usage: '主要按钮文字颜色 - solid 模式' },
  'color-button-primary-bg-hover': { value: 'var(--cd-color-primary-hover)', category: 'color', label: '主要按钮背景色', usage: '主要按钮背景颜色 - 悬浮' },
  'color-button-primary-text-hover': { value: 'var(--cd-color-white)', category: 'color', label: '主要按钮文字色', usage: '主要按钮文字颜色 - 悬浮' },
  'color-button-primary-bg-active': { value: 'var(--cd-color-primary-active)', category: 'color', label: '主要按钮背景色', usage: '主要按钮背景颜色 - 按下' },
  'color-button-primary-text-active': { value: 'var(--cd-color-white)', category: 'color', label: '主要按钮文字色', usage: '主要按钮文字颜色 - 按下' },
  'color-button-primary-outline-focus': { value: 'var(--cd-color-primary-light-active)', category: 'color', label: '主要按钮轮廓色', usage: '主要按钮轮廓 - 聚焦' },
  'color-button-primary-outline-border-default': { value: 'var(--cd-color-border)', category: 'color', label: '主要按钮边框色', usage: '主要按钮边框颜色 - 边框模式' },
  'color-button-primary-borderless-text-default': { value: 'var(--cd-color-primary)', category: 'color', label: '主要按钮文字色', usage: '主要按钮文字颜色 - 浅色/边框/无边框模式' },

  // —— secondary ——
  'color-button-secondary-bg-default': { value: 'var(--cd-color-secondary)', category: 'color', label: '次要按钮背景色', usage: '次要按钮背景颜色' },
  'color-button-secondary-text-default': { value: 'var(--cd-color-white)', category: 'color', label: '次要按钮文字色', usage: '次要按钮文字颜色 - solid 模式' },
  'color-button-secondary-bg-hover': { value: 'var(--cd-color-secondary-hover)', category: 'color', label: '次要按钮背景色', usage: '次要按钮背景颜色 - 悬浮' },
  'color-button-secondary-text-hover': { value: 'var(--cd-color-white)', category: 'color', label: '次要按钮文字色', usage: '次要按钮文字颜色 - 悬浮' },
  'color-button-secondary-bg-active': { value: 'var(--cd-color-secondary-active)', category: 'color', label: '次要按钮背景色', usage: '次要按钮背景颜色 - 按下' },
  'color-button-secondary-text-active': { value: 'var(--cd-color-white)', category: 'color', label: '次要按钮文字色', usage: '次要按钮文字颜色 - 按下' },
  'color-button-secondary-outline-border-default': { value: 'var(--cd-color-border)', category: 'color', label: '次要按钮边框色', usage: '次要按钮边框颜色 - 边框模式' },
  'color-button-secondary-borderless-text-default': { value: 'var(--cd-color-secondary)', category: 'color', label: '次要按钮文字色', usage: '次要按钮文字颜色 - 浅色/边框/无边框模式' },

  // —— danger ——
  'color-button-danger-bg-default': { value: 'var(--cd-color-danger)', category: 'color', label: '危险按钮背景色', usage: '危险按钮背景颜色' },
  'color-button-danger-text-default': { value: 'var(--cd-color-white)', category: 'color', label: '危险按钮文字色', usage: '危险按钮文字颜色 - solid 模式' },
  'color-button-danger-bg-hover': { value: 'var(--cd-color-danger-hover)', category: 'color', label: '危险按钮背景色', usage: '危险按钮背景颜色 - 悬浮' },
  'color-button-danger-text-hover': { value: 'var(--cd-color-white)', category: 'color', label: '危险按钮文字色', usage: '危险按钮文字颜色 - 悬浮' },
  'color-button-danger-bg-active': { value: 'var(--cd-color-danger-active)', category: 'color', label: '危险按钮背景色', usage: '危险按钮背景颜色 - 按下' },
  'color-button-danger-text-active': { value: 'var(--cd-color-white)', category: 'color', label: '危险按钮文字色', usage: '危险按钮文字颜色 - 按下' },
  'color-button-danger-outline-focus': { value: 'var(--cd-color-danger-light-active)', category: 'color', label: '危险按钮轮廓色', usage: '危险按钮轮廓 - 聚焦' },
  'color-button-danger-outline-border-default': { value: 'var(--cd-color-danger)', category: 'color', label: '危险按钮边框色', usage: '危险按钮边框颜色 - 边框模式' },
  'color-button-danger-borderless-text-default': { value: 'var(--cd-color-danger)', category: 'color', label: '危险按钮文字色', usage: '危险按钮文字颜色 - 浅色/边框/无边框模式' },

  // —— warning ——
  'color-button-warning-bg-default': { value: 'var(--cd-color-warning)', category: 'color', label: '警告按钮背景色', usage: '警告按钮背景颜色' },
  'color-button-warning-text-default': { value: 'var(--cd-color-white)', category: 'color', label: '警告按钮文字色', usage: '警告按钮文字颜色 - solid 模式' },
  'color-button-warning-bg-hover': { value: 'var(--cd-color-warning-hover)', category: 'color', label: '警告按钮背景色', usage: '警告按钮背景颜色 - 悬浮' },
  'color-button-warning-text-hover': { value: 'var(--cd-color-white)', category: 'color', label: '警告按钮文字色', usage: '警告按钮文字颜色 - 悬浮' },
  'color-button-warning-bg-active': { value: 'var(--cd-color-warning-active)', category: 'color', label: '警告按钮背景色', usage: '警告按钮背景颜色 - 按下' },
  'color-button-warning-text-active': { value: 'var(--cd-color-white)', category: 'color', label: '警告按钮文字色', usage: '警告按钮文字颜色 - 按下' },
  'color-button-warning-outline-focus': { value: 'var(--cd-color-warning-light-active)', category: 'color', label: '警告按钮轮廓色', usage: '警告按钮轮廓 - 聚焦' },
  'color-button-warning-outline-border-default': { value: 'var(--cd-color-warning)', category: 'color', label: '警告按钮边框色', usage: '警告按钮边框颜色 - 边框模式' },
  'color-button-warning-borderless-text-default': { value: 'var(--cd-color-warning)', category: 'color', label: '警告按钮文字色', usage: '警告按钮文字颜色 - 浅色/边框/无边框模式' },

  // —— tertiary ——
  'color-button-tertiary-bg-default': { value: 'var(--cd-color-tertiary)', category: 'color', label: '第三按钮背景色', usage: '第三按钮背景颜色' },
  'color-button-tertiary-text-default': { value: 'var(--cd-color-white)', category: 'color', label: '第三按钮文字色', usage: '第三按钮文字颜色 - solid 模式' },
  'color-button-tertiary-bg-hover': { value: 'var(--cd-color-tertiary-hover)', category: 'color', label: '第三按钮背景色', usage: '第三按钮背景颜色 - 悬浮' },
  'color-button-tertiary-text-hover': { value: 'var(--cd-color-white)', category: 'color', label: '第三按钮文字色', usage: '第三按钮文字颜色 - 悬浮' },
  'color-button-tertiary-bg-active': { value: 'var(--cd-color-tertiary-active)', category: 'color', label: '第三按钮背景色', usage: '第三按钮背景颜色 - 按下' },
  'color-button-tertiary-text-active': { value: 'var(--cd-color-white)', category: 'color', label: '第三按钮文字色', usage: '第三按钮文字颜色 - 按下' },
  'color-button-tertiary-outline-border-default': { value: 'var(--cd-color-border)', category: 'color', label: '第三按钮边框色', usage: '第三按钮边框颜色 - 边框模式' },
  'color-button-tertiary-solid-text-default': { value: 'var(--cd-color-text-1)', category: 'color', label: '第三按钮文字色', usage: '第三按钮文字颜色 - 浅色/边框/无边框模式' },

  // —— disabled（对齐 Semi $color-button_disabled*：底灰 + 灰文字，而非纯透明）——
  'color-button-disabled-solid-text-default': { value: 'var(--cd-color-disabled-text)', category: 'color', label: '禁用按钮文字色', usage: '禁用按钮文字颜色 - solid 主题' },
  'color-button-disabled-text-default': { value: 'var(--cd-color-disabled-text)', category: 'color', label: '禁用按钮文字色', usage: '禁用按钮文字颜色 - 浅色主题或无背景' },
  'color-button-disabled-outline-text-default': { value: 'var(--cd-color-disabled-text)', category: 'color', label: '禁用按钮文字色', usage: '禁用按钮文字颜色 - 边框模式' },
  'color-button-disabled-text-hover': { value: 'var(--cd-color-disabled-text)', category: 'color', label: '禁用按钮文字色', usage: '禁用按钮文字颜色 - solid 主题 - 悬浮' },
  'color-button-disabled-bg-default': { value: 'var(--cd-color-disabled-bg)', category: 'color', label: '禁用按钮背景色', usage: '禁用按钮背景颜色' },
  'color-button-disabled-bg-hover': { value: 'var(--cd-color-disabled-bg)', category: 'color', label: '禁用按钮背景色', usage: '禁用按钮背景颜色 - 悬浮' },
  'color-button-disabled-outline-border-default': { value: 'var(--cd-color-border)', category: 'color', label: '禁用按钮边框色', usage: '禁用按钮边框颜色 - 边框模式' },
  // disabled × type 底色（Semi 全部 = $color-button_disabled-bg-default）
  'color-button-disabled-primary-bg-default': { value: 'var(--cd-color-disabled-bg)', category: 'color', label: '禁用主要按钮背景色', usage: '禁用 primary 按钮背景颜色' },
  'color-button-disabled-secondary-bg-default': { value: 'var(--cd-color-disabled-bg)', category: 'color', label: '禁用次要按钮背景色', usage: '禁用 secondary 按钮背景颜色' },
  'color-button-disabled-danger-bg-default': { value: 'var(--cd-color-disabled-bg)', category: 'color', label: '禁用危险按钮背景色', usage: '禁用 danger 按钮背景颜色' },
  'color-button-disabled-warning-bg-default': { value: 'var(--cd-color-disabled-bg)', category: 'color', label: '禁用警告按钮背景色', usage: '禁用 warning 按钮背景颜色' },
  'color-button-disabled-tertiary-bg-default': { value: 'var(--cd-color-disabled-bg)', category: 'color', label: '禁用第三按钮背景色', usage: '禁用 tertiary 按钮背景颜色' },
  // disabled × light × type 底色（Semi 全部 = $color-button_light-bg-default）
  'color-button-disabled-light-primary-bg-default': { value: 'var(--cd-color-fill-0)', category: 'color', label: '禁用浅色主要按钮背景色', usage: '禁用 light primary 按钮背景颜色' },
  'color-button-disabled-light-secondary-bg-default': { value: 'var(--cd-color-fill-0)', category: 'color', label: '禁用浅色次要按钮背景色', usage: '禁用 light secondary 按钮背景颜色' },
  'color-button-disabled-light-danger-bg-default': { value: 'var(--cd-color-fill-0)', category: 'color', label: '禁用浅色危险按钮背景色', usage: '禁用 light danger 按钮背景颜色' },
  'color-button-disabled-light-warning-bg-default': { value: 'var(--cd-color-fill-0)', category: 'color', label: '禁用浅色警告按钮背景色', usage: '禁用 light warning 按钮背景颜色' },
  'color-button-disabled-light-tertiary-bg-default': { value: 'var(--cd-color-fill-0)', category: 'color', label: '禁用浅色第三按钮背景色', usage: '禁用 light tertiary 按钮背景颜色' },

  // —— light ——
  'color-button-light-bg-default': { value: 'var(--cd-color-fill-0)', category: 'color', label: '浅色按钮背景色', usage: '浅色按钮背景颜色' },
  'color-button-light-bg-hover': { value: 'var(--cd-color-fill-1)', category: 'color', label: '浅色按钮背景色', usage: '浅色按钮背景颜色 - 悬浮' },
  'color-button-light-bg-active': { value: 'var(--cd-color-fill-2)', category: 'color', label: '浅色按钮背景色', usage: '浅色按钮背景颜色 - 按下' },
  'color-button-light-border-default': { value: 'transparent', category: 'color', label: '浅色按钮描边色', usage: '浅色按钮描边颜色' },
  'color-button-light-border-hover': { value: 'var(--cd-color-button-light-border-default)', category: 'color', label: '浅色按钮描边色', usage: '浅色按钮描边颜色 - 悬浮' },
  'color-button-light-border-active': { value: 'var(--cd-color-button-light-border-hover)', category: 'color', label: '浅色按钮描边色', usage: '浅色按钮描边颜色 - 按下' },
  'width-button-light-border': { value: '0', category: 'width', label: '浅色按钮描边宽度', usage: '浅色按钮描边宽度' },

  // —— borderless ——
  'color-button-borderless-text-default': { value: 'var(--cd-color-primary)', category: 'color', label: '无背景按钮文字色', usage: '无背景按钮文字颜色' },
  'color-button-borderless-bg-hover': { value: 'var(--cd-color-fill-0)', category: 'color', label: '无背景按钮背景色', usage: '无背景按钮背景颜色 - 悬浮' },
  'color-button-borderless-bg-active': { value: 'var(--cd-color-fill-1)', category: 'color', label: '无背景按钮背景色', usage: '无背景按钮背景颜色 - 按下' },
  'color-button-borderless-border-default': { value: 'transparent', category: 'color', label: '无背景按钮描边色', usage: '无背景按钮描边颜色' },
  'color-button-borderless-border-hover': { value: 'var(--cd-color-button-borderless-border-default)', category: 'color', label: '无背景按钮描边色', usage: '无背景按钮描边颜色 - 悬浮' },
  'color-button-borderless-border-active': { value: 'var(--cd-color-button-borderless-border-hover)', category: 'color', label: '无背景按钮描边色', usage: '无背景按钮描边颜色 - 按下' },
  'width-button-borderless-border': { value: '0', category: 'width', label: '无背景按钮描边宽度', usage: '无背景按钮描边宽度' },

  // —— outline ——
  'width-button-outline-border': { value: '1px', category: 'width', label: '边框模式边框宽度', usage: '边框模式按钮边框宽度' },
  'color-button-outline-bg-hover': { value: 'var(--cd-color-fill-0)', category: 'color', label: '边框模式背景色', usage: '边框模式按钮背景颜色 - 悬浮' },
  'color-button-outline-bg-active': { value: 'var(--cd-color-fill-1)', category: 'color', label: '边框模式背景色', usage: '边框模式按钮背景颜色 - 按下' },

  // —— buttongroup（对齐 Semi $color-button_group* / $width-button_group-border / $height-button_group_line）——
  'color-button-group-border-default': { value: 'var(--cd-color-border)', category: 'color', label: '按钮组分割线色', usage: '按钮组相邻按钮分割线颜色' },
  'width-button-group-border': { value: 'var(--cd-border-thickness-control)', category: 'width', label: '按钮组分割线宽度', usage: '按钮组相邻按钮分割线宽度' },
  'height-button-group-line-default': { value: '20px', category: 'height', label: '按钮组分割线高度', usage: '按钮组分割线高度 - 默认（对齐 Semi 20px）' },
  'radius-button-group': { value: 'var(--cd-border-radius-small)', category: 'radius', label: '按钮组圆角', usage: '按钮组两端圆角大小（对齐 Semi $radius-button_group）' },

  // —— splitButtonGroup（对齐 Semi $radius-button_splitButtonGroup_*，4 个角均 = border-radius-small）——
  'radius-button-splitbuttongroup-first-topleft': { value: 'var(--cd-border-radius-small)', category: 'radius', label: '分裂按钮首左上圆角', usage: '分裂按钮组首个按钮左上圆角' },
  'radius-button-splitbuttongroup-first-bottomleft': { value: 'var(--cd-border-radius-small)', category: 'radius', label: '分裂按钮首左下圆角', usage: '分裂按钮组首个按钮左下圆角' },
  'radius-button-splitbuttongroup-last-topright': { value: 'var(--cd-border-radius-small)', category: 'radius', label: '分裂按钮末右上圆角', usage: '分裂按钮组末尾按钮右上圆角' },
  'radius-button-splitbuttongroup-last-bottomright': { value: 'var(--cd-border-radius-small)', category: 'radius', label: '分裂按钮末右下圆角', usage: '分裂按钮组末尾按钮右下圆角' },

  // —— padding（对齐 Semi $spacing-button_*-padding{Top,Bottom,Left,Right}）——
  'spacing-button-default-paddingtop': { value: '6px', category: 'spacing', label: '按钮上内边距', usage: '按钮顶部内边距 - 默认（对齐 Semi 6px）' },
  'spacing-button-default-paddingbottom': { value: '6px', category: 'spacing', label: '按钮下内边距', usage: '按钮底部内边距 - 默认（对齐 Semi 6px）' },
  'spacing-button-default-paddingleft': { value: 'var(--cd-spacing-base-tight)', category: 'spacing', label: '按钮左内边距', usage: '按钮左侧内边距 - 默认' },
  'spacing-button-default-paddingright': { value: 'var(--cd-spacing-base-tight)', category: 'spacing', label: '按钮右内边距', usage: '按钮右侧内边距 - 默认' },
  'spacing-button-large-paddingtop': { value: '10px', category: 'spacing', label: '大按钮上内边距', usage: '按钮顶部内边距 - 大尺寸（对齐 Semi 10px）' },
  'spacing-button-large-paddingbottom': { value: '10px', category: 'spacing', label: '大按钮下内边距', usage: '按钮底部内边距 - 大尺寸（对齐 Semi 10px）' },
  'spacing-button-large-paddingleft': { value: 'var(--cd-spacing-base)', category: 'spacing', label: '大按钮左内边距', usage: '按钮左侧内边距 - 大尺寸' },
  'spacing-button-large-paddingright': { value: 'var(--cd-spacing-base)', category: 'spacing', label: '大按钮右内边距', usage: '按钮右侧内边距 - 大尺寸' },
  'spacing-button-small-paddingtop': { value: 'var(--cd-spacing-super-tight)', category: 'spacing', label: '小按钮上内边距', usage: '按钮顶部内边距 - 小尺寸' },
  'spacing-button-small-paddingbottom': { value: 'var(--cd-spacing-super-tight)', category: 'spacing', label: '小按钮下内边距', usage: '按钮底部内边距 - 小尺寸' },
  'spacing-button-small-paddingleft': { value: 'var(--cd-spacing-base-tight)', category: 'spacing', label: '小按钮左内边距', usage: '按钮左侧内边距 - 小尺寸' },
  'spacing-button-small-paddingright': { value: 'var(--cd-spacing-base-tight)', category: 'spacing', label: '小按钮右内边距', usage: '按钮右侧内边距 - 小尺寸' },

  // —— iconOnly padding（对齐 Semi $spacing-button_iconOnly_*-padding*）——
  'spacing-button-icononly-default-paddingleft': { value: 'var(--cd-spacing-tight)', category: 'spacing', label: '图标按钮左内边距', usage: '图标按钮左侧内边距 - 默认' },
  'spacing-button-icononly-default-paddingright': { value: 'var(--cd-spacing-tight)', category: 'spacing', label: '图标按钮右内边距', usage: '图标按钮右侧内边距 - 默认' },
  'spacing-button-icononly-default-paddingtop': { value: 'var(--cd-spacing-tight)', category: 'spacing', label: '图标按钮上内边距', usage: '图标按钮顶部内边距 - 默认' },
  'spacing-button-icononly-default-paddingbottom': { value: 'var(--cd-spacing-tight)', category: 'spacing', label: '图标按钮下内边距', usage: '图标按钮底部内边距 - 默认' },
  'spacing-button-icononly-large-paddingleft': { value: 'var(--cd-spacing-base-tight)', category: 'spacing', label: '大图标按钮左内边距', usage: '图标按钮左侧内边距 - 大尺寸' },
  'spacing-button-icononly-large-paddingright': { value: 'var(--cd-spacing-base-tight)', category: 'spacing', label: '大图标按钮右内边距', usage: '图标按钮右侧内边距 - 大尺寸' },
  'spacing-button-icononly-large-paddingtop': { value: 'var(--cd-spacing-base-tight)', category: 'spacing', label: '大图标按钮上内边距', usage: '图标按钮顶部内边距 - 大尺寸' },
  'spacing-button-icononly-large-paddingbottom': { value: 'var(--cd-spacing-base-tight)', category: 'spacing', label: '大图标按钮下内边距', usage: '图标按钮底部内边距 - 大尺寸' },
  'spacing-button-icononly-small-paddingleft': { value: 'var(--cd-spacing-extra-tight)', category: 'spacing', label: '小图标按钮左内边距', usage: '图标按钮左侧内边距 - 小尺寸' },
  'spacing-button-icononly-small-paddingright': { value: 'var(--cd-spacing-extra-tight)', category: 'spacing', label: '小图标按钮右内边距', usage: '图标按钮右侧内边距 - 小尺寸' },
  'spacing-button-icononly-small-paddingtop': { value: 'var(--cd-spacing-extra-tight)', category: 'spacing', label: '小图标按钮上内边距', usage: '图标按钮顶部内边距 - 小尺寸' },
  'spacing-button-icononly-small-paddingbottom': { value: 'var(--cd-spacing-extra-tight)', category: 'spacing', label: '小图标按钮下内边距', usage: '图标按钮底部内边距 - 小尺寸' },

  // —— iconOnly 尺寸（对齐 Semi $height/width-button_iconOnly_*）——
  'height-button-icononly-small': { value: 'var(--cd-control-height-small)', category: 'height', label: '小图标按钮高度', usage: '图标按钮 height - 小尺寸' },
  'width-button-icononly-small': { value: 'var(--cd-control-height-small)', category: 'width', label: '小图标按钮宽度', usage: '图标按钮 width - 小尺寸' },
  'height-button-icononly-default': { value: 'var(--cd-control-height-default)', category: 'height', label: '图标按钮高度', usage: '图标按钮 height - 默认' },
  'width-button-icononly-default': { value: 'var(--cd-control-height-default)', category: 'width', label: '图标按钮宽度', usage: '图标按钮 width - 默认' },
  'height-button-icononly-large': { value: 'var(--cd-control-height-large)', category: 'height', label: '大图标按钮高度', usage: '图标按钮 height - 大尺寸' },
  'width-button-icononly-large': { value: 'var(--cd-control-height-large)', category: 'width', label: '大图标按钮宽度', usage: '图标按钮 width - 大尺寸' },

  // —— iconOnly 图标↔文字间距（对齐 Semi $spacing-button_iconOnly_content-margin*）——
  'spacing-button-icononly-content-marginleft': { value: 'var(--cd-spacing-tight)', category: 'spacing', label: '图标右侧文字间距', usage: '按钮右侧图标距离文字间距' },
  'spacing-button-icononly-content-marginright': { value: 'var(--cd-spacing-tight)', category: 'spacing', label: '图标左侧文字间距', usage: '按钮左侧图标距离文字间距' },

  // —— font ——
  'font-button-fontweight': { value: 'var(--cd-font-weight-bold)', category: 'font', label: '按钮文字字重', usage: '按钮文字字重 - 默认' },
  'font-button-fontsize': { value: 'var(--cd-font-size-regular)', category: 'font', label: '按钮文字字号', usage: '按钮文字字号- 默认' },
  'font-button-lineheight': { value: 'var(--cd-line-height-regular)', category: 'font', label: '按钮文字行高', usage: '按钮文字行高 - 默认（对齐 Semi $font-button-lineHeight 20px）' },

  // —— height ——
  'height-button-large': { value: 'var(--cd-control-height-large)', category: 'height', label: '按钮高度', usage: '按钮高度 - 大尺寸' },
  'height-button-small': { value: 'var(--cd-control-height-small)', category: 'height', label: '按钮高度', usage: '按钮高度 - 小尺寸' },
  'height-button-default': { value: 'var(--cd-control-height-default)', category: 'height', label: '按钮高度', usage: '按钮高度 - 默认' },

  // —— radius / border ——
  'width-button-border': { value: 'var(--cd-border-thickness)', category: 'width', label: '按钮描边宽度', usage: '按钮描边宽度' },
  'radius-button': { value: 'var(--cd-border-radius-small)', category: 'radius', label: '按钮圆角', usage: '按钮圆角大小' },
  'width-button-outline': { value: '2px', category: 'width', label: '按钮轮廓宽度', usage: '按钮轮廓宽度（focus-visible outline）' },

  // —— animation：背景色过渡（7 类型 × duration/function/delay，对齐 Semi animation.scss）——
  // 默认无动画（duration/delay=0ms），主题或 DSM 可按类型单独开启过渡。
  'transition-duration-button-primary-bg': { value: 'var(--cd-motion-duration-none)', category: 'animation', label: '主要按钮背景过渡时长', usage: '主要按钮-背景色-动画持续时间' },
  'transition-function-button-primary-bg': { value: 'var(--cd-motion-ease-in)', category: 'animation', label: '主要按钮背景过渡曲线', usage: '主要按钮-背景色-过渡曲线' },
  'transition-delay-button-primary-bg': { value: 'var(--cd-motion-delay-none)', category: 'animation', label: '主要按钮背景过渡延迟', usage: '主要按钮-背景色-延迟时间' },
  'transition-duration-button-secondary-bg': { value: 'var(--cd-motion-duration-none)', category: 'animation', label: '次要按钮背景过渡时长', usage: '次要按钮-背景色-动画持续时间' },
  'transition-function-button-secondary-bg': { value: 'var(--cd-motion-ease-in)', category: 'animation', label: '次要按钮背景过渡曲线', usage: '次要按钮-背景色-过渡曲线' },
  'transition-delay-button-secondary-bg': { value: 'var(--cd-motion-delay-none)', category: 'animation', label: '次要按钮背景过渡延迟', usage: '次要按钮-背景色-延迟时间' },
  'transition-duration-button-tertiary-bg': { value: 'var(--cd-motion-duration-none)', category: 'animation', label: '三级按钮背景过渡时长', usage: '三级按钮-背景色-动画持续时间' },
  'transition-function-button-tertiary-bg': { value: 'var(--cd-motion-ease-in)', category: 'animation', label: '三级按钮背景过渡曲线', usage: '三级按钮-背景色-过渡曲线' },
  'transition-delay-button-tertiary-bg': { value: 'var(--cd-motion-delay-none)', category: 'animation', label: '三级按钮背景过渡延迟', usage: '三级按钮-背景色-延迟时间' },
  'transition-duration-button-light-bg': { value: 'var(--cd-motion-duration-none)', category: 'animation', label: '浅色按钮背景过渡时长', usage: '浅色按钮-背景色-动画持续时间' },
  'transition-function-button-light-bg': { value: 'var(--cd-motion-ease-in)', category: 'animation', label: '浅色按钮背景过渡曲线', usage: '浅色按钮-背景色-过渡曲线' },
  'transition-delay-button-light-bg': { value: 'var(--cd-motion-delay-none)', category: 'animation', label: '浅色按钮背景过渡延迟', usage: '浅色按钮-背景色-延迟时间' },
  'transition-duration-button-warning-bg': { value: 'var(--cd-motion-duration-none)', category: 'animation', label: '警告按钮背景过渡时长', usage: '警告按钮-背景色-动画持续时间' },
  'transition-function-button-warning-bg': { value: 'var(--cd-motion-ease-in)', category: 'animation', label: '警告按钮背景过渡曲线', usage: '警告按钮-背景色-过渡曲线' },
  'transition-delay-button-warning-bg': { value: 'var(--cd-motion-delay-none)', category: 'animation', label: '警告按钮背景过渡延迟', usage: '警告按钮-背景色-延迟时间' },
  'transition-duration-button-danger-bg': { value: 'var(--cd-motion-duration-none)', category: 'animation', label: '危险按钮背景过渡时长', usage: '危险按钮-背景色-动画持续时间' },
  'transition-function-button-danger-bg': { value: 'var(--cd-motion-ease-in)', category: 'animation', label: '危险按钮背景过渡曲线', usage: '危险按钮-背景色-过渡曲线' },
  'transition-delay-button-danger-bg': { value: 'var(--cd-motion-delay-none)', category: 'animation', label: '危险按钮背景过渡延迟', usage: '危险按钮-背景色-延迟时间' },
  'transition-duration-button-borderless-bg': { value: 'var(--cd-motion-duration-none)', category: 'animation', label: '无边框按钮背景过渡时长', usage: '无边框按钮-背景色-动画持续时间' },
  'transition-function-button-borderless-bg': { value: 'var(--cd-motion-ease-in)', category: 'animation', label: '无边框按钮背景过渡曲线', usage: '无边框按钮-背景色-过渡曲线' },
  'transition-delay-button-borderless-bg': { value: 'var(--cd-motion-delay-none)', category: 'animation', label: '无边框按钮背景过渡延迟', usage: '无边框按钮-背景色-延迟时间' },

  // —— animation：边框过渡（6 类型 × duration/function/delay）——
  'transition-duration-button-primary-border': { value: 'var(--cd-motion-duration-none)', category: 'animation', label: '主要按钮边框过渡时长', usage: '主要按钮-边框-动画持续时间' },
  'transition-function-button-primary-border': { value: 'var(--cd-motion-ease-in)', category: 'animation', label: '主要按钮边框过渡曲线', usage: '主要按钮-边框-过渡曲线' },
  'transition-delay-button-primary-border': { value: 'var(--cd-motion-delay-none)', category: 'animation', label: '主要按钮边框过渡延迟', usage: '主要按钮-边框-延迟时间' },
  'transition-duration-button-secondary-border': { value: 'var(--cd-motion-duration-none)', category: 'animation', label: '次要按钮边框过渡时长', usage: '次要按钮-边框-动画持续时间' },
  'transition-function-button-secondary-border': { value: 'var(--cd-motion-ease-in)', category: 'animation', label: '次要按钮边框过渡曲线', usage: '次要按钮-边框-过渡曲线' },
  'transition-delay-button-secondary-border': { value: 'var(--cd-motion-delay-none)', category: 'animation', label: '次要按钮边框过渡延迟', usage: '次要按钮-边框-延迟时间' },
  'transition-duration-button-tertiary-border': { value: 'var(--cd-motion-duration-none)', category: 'animation', label: '三级按钮边框过渡时长', usage: '三级按钮-边框-动画持续时间' },
  'transition-function-button-tertiary-border': { value: 'var(--cd-motion-ease-in)', category: 'animation', label: '三级按钮边框过渡曲线', usage: '三级按钮-边框-过渡曲线' },
  'transition-delay-button-tertiary-border': { value: 'var(--cd-motion-delay-none)', category: 'animation', label: '三级按钮边框过渡延迟', usage: '三级按钮-边框-延迟时间' },
  'transition-duration-button-light-border': { value: 'var(--cd-motion-duration-none)', category: 'animation', label: '浅色按钮边框过渡时长', usage: '浅色按钮-边框-动画持续时间' },
  'transition-function-button-light-border': { value: 'var(--cd-motion-ease-in)', category: 'animation', label: '浅色按钮边框过渡曲线', usage: '浅色按钮-边框-过渡曲线' },
  'transition-delay-button-light-border': { value: 'var(--cd-motion-delay-none)', category: 'animation', label: '浅色按钮边框过渡延迟', usage: '浅色按钮-边框-延迟时间' },
  'transition-duration-button-warning-border': { value: 'var(--cd-motion-duration-none)', category: 'animation', label: '警告按钮边框过渡时长', usage: '警告按钮-边框-动画持续时间' },
  'transition-function-button-warning-border': { value: 'var(--cd-motion-ease-in)', category: 'animation', label: '警告按钮边框过渡曲线', usage: '警告按钮-边框-过渡曲线' },
  'transition-delay-button-warning-border': { value: 'var(--cd-motion-delay-none)', category: 'animation', label: '警告按钮边框过渡延迟', usage: '警告按钮-边框-延迟时间' },
  'transition-duration-button-danger-border': { value: 'var(--cd-motion-duration-none)', category: 'animation', label: '危险按钮边框过渡时长', usage: '危险按钮-边框-动画持续时间' },
  'transition-function-button-danger-border': { value: 'var(--cd-motion-ease-in)', category: 'animation', label: '危险按钮边框过渡曲线', usage: '危险按钮-边框-过渡曲线' },
  'transition-delay-button-danger-border': { value: 'var(--cd-motion-delay-none)', category: 'animation', label: '危险按钮边框过渡延迟', usage: '危险按钮-边框-延迟时间' },

  // —— other：按压放大（7 类型，对齐 Semi transform token；归 other tab 对齐 Semi）——
  'transform-scale-button-primary': { value: 'var(--cd-motion-scale-none)', category: 'other', label: '主要按钮放大', usage: '主要按钮-放大' },
  'transform-scale-button-secondary': { value: 'var(--cd-motion-scale-none)', category: 'other', label: '次要按钮放大', usage: '次要按钮-放大' },
  'transform-scale-button-tertiary': { value: 'var(--cd-motion-scale-none)', category: 'other', label: '三级按钮放大', usage: '三级按钮-放大' },
  'transform-scale-button-light': { value: 'var(--cd-motion-scale-none)', category: 'other', label: '浅色按钮放大', usage: '浅色按钮-放大' },
  'transform-scale-button-warning': { value: 'var(--cd-motion-scale-none)', category: 'other', label: '警告按钮放大', usage: '警告按钮-放大' },
  'transform-scale-button-danger': { value: 'var(--cd-motion-scale-none)', category: 'other', label: '危险按钮放大', usage: '危险按钮-放大' },
  'transform-scale-button-borderless': { value: 'var(--cd-motion-scale-none)', category: 'other', label: '无边框按钮放大', usage: '无边框按钮-放大' },

  // —— animation：图标旋转（对齐 Semi $animation_duration-button_icon_loading 600ms）——
  'animation-duration-button-icon-loading': { value: '600ms', category: 'animation', label: '加载图标旋转时长', usage: '加载图标容器旋转一周时长（对齐 Semi 600ms）' },
  'animation-duration-button-icon-custom-loading': { value: '1600ms', category: 'animation', label: '自定义加载图标旋转时长', usage: '自定义指示器旋转一周时长（对齐 Semi 1600ms）' },

  // —— colorful（AI 多彩）：严格对齐 Semi button/variables.scss，消费 alias AI 语义色 ——
  //   primary solid   → --semi-color-ai-general(-hover/-active)（4 色 278° 渐变实心底）
  //   primary light/borderless → --semi-color-ai-general（渐变文字）
  //   primary outline → --semi-color-ai-purple（紫色单色文字 + 边框）
  //   tertiary solid  → --semi-ai-general-0（极浅淡彩底）+ --semi-color-ai-general（渐变文字）
  'color-button-primary-solid-colorful-bg-default': { value: 'var(--cd-color-ai-general)', category: 'color', label: 'Colorful 主要按钮背景', usage: 'colorful primary solid 背景 - 默认' },
  'color-button-primary-solid-colorful-bg-hover': { value: 'var(--cd-color-ai-general-hover)', category: 'color', label: 'Colorful 主要按钮背景', usage: 'colorful primary solid 背景 - 悬浮' },
  'color-button-primary-solid-colorful-bg-active': { value: 'var(--cd-color-ai-general-active)', category: 'color', label: 'Colorful 主要按钮背景', usage: 'colorful primary solid 背景 - 按下' },
  'color-button-primary-light-colorful-text-default': { value: 'var(--cd-color-ai-general)', category: 'color', label: 'Colorful 主要按钮文字填充', usage: 'colorful primary light/borderless 渐变文字填充' },
  'color-button-primary-outline-colorful-text-default': { value: 'var(--cd-color-ai-purple)', category: 'color', label: 'Colorful 主要按钮文字色', usage: 'colorful primary outline 文字/边框（紫色单色）' },
  'color-button-tertiary-solid-colorful-bg-default': { value: 'var(--cd-color-ai-general-light)', category: 'color', label: 'Colorful 第三按钮背景', usage: 'colorful tertiary solid 极浅淡彩底' },
  'color-button-tertiary-solid-colorful-text-default': { value: 'var(--cd-color-ai-general)', category: 'color', label: 'Colorful 第三按钮文字填充', usage: 'colorful tertiary solid 渐变文字填充' },
} satisfies TokenGroup;
