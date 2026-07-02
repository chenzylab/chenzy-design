/**
 * Component tokens for Button. 全量对齐 Semi Design（semi-foundation/button/variables.scss
 * + animation.scss 的 2 个真实值 token），并升级为带元数据的 TokenDef 结构以支持 DSM。
 * 值为 var() 引用我们的 alias / global token，或字面量。
 */
import type { TokenGroup } from './token-def.js';

export const buttonTokens = {
  // —— primary ——
  'color-button-primary-bg-default': { value: 'var(--cd-color-primary)', category: 'color', label: '主要按钮背景色', usage: '主要按钮背景颜色' },
  'color-button-primary-border-default': { value: 'transparent', category: 'color', label: '主要按钮描边色', usage: '主要按钮描边颜色' },
  'color-button-primary-text-default': { value: 'var(--cd-color-text-inverse)', category: 'color', label: '主要按钮文字色', usage: '主要按钮文字颜色 - solid 模式' },
  'color-button-primary-bg-hover': { value: 'var(--cd-color-primary-hover)', category: 'color', label: '主要按钮背景色', usage: '主要按钮背景颜色 - 悬浮' },
  'color-button-primary-border-hover': { value: 'var(--cd-color-primary-hover)', category: 'color', label: '主要按钮描边色', usage: '主要按钮描边颜色 - 悬浮' },
  'color-button-primary-text-hover': { value: 'var(--cd-color-text-inverse)', category: 'color', label: '主要按钮文字色', usage: '主要按钮文字颜色 - 悬浮' },
  'color-button-primary-bg-active': { value: 'var(--cd-color-primary-active)', category: 'color', label: '主要按钮背景色', usage: '主要按钮背景颜色 - 按下' },
  'color-button-primary-border-active': { value: 'var(--cd-color-primary-active)', category: 'color', label: '主要按钮描边色', usage: '主要按钮描边颜色 - 按下' },
  'color-button-primary-text-active': { value: 'var(--cd-color-text-inverse)', category: 'color', label: '主要按钮文字色', usage: '主要按钮文字颜色 - 按下' },
  'color-button-primary-outline-focus': { value: 'var(--cd-color-primary-light-active)', category: 'color', label: '主要按钮轮廓色', usage: '主要按钮轮廓 - 聚焦' },
  'color-button-primary-outline-border-default': { value: 'var(--cd-color-border)', category: 'color', label: '主要按钮边框色', usage: '主要按钮边框颜色 - 边框模式' },
  'color-button-primary-borderless-text-default': { value: 'var(--cd-color-primary)', category: 'color', label: '主要按钮文字色', usage: '主要按钮文字颜色 - 浅色/边框/无边框模式' },
  'color-button-primary-solid-colorful-bg-default': { value: 'var(--cd-button-colorful-from)', category: 'color', label: 'Colorful 主要按钮背景色', usage: 'Colorful 主要按钮背景颜色 - solid 主题' },
  'color-button-primary-solid-colorful-bg-hover': { value: 'var(--cd-button-colorful-via)', category: 'color', label: 'Colorful 主要按钮背景色', usage: 'Colorful 主要按钮背景颜色 - solid 主题 - 悬浮' },
  'color-button-primary-solid-colorful-bg-active': { value: 'var(--cd-button-colorful-to)', category: 'color', label: 'Colorful 主要按钮背景色', usage: 'Colorful 主要按钮背景颜色 - solid 主题 - 按下' },
  'color-button-primary-light-colorful-text-default': { value: 'var(--cd-button-colorful-from)', category: 'color', label: 'Colorful 主要按钮文字色', usage: 'Colorful 主要按钮文字填充色 - 浅色模式' },
  'color-button-primary-light-outline-text-default': { value: 'var(--cd-button-colorful-to)', category: 'color', label: 'Colorful 主要按钮文字色', usage: 'Colorful 主要按钮文字颜色 - 边框模式' },
  'color-button-primary-light-outline-border': { value: 'var(--cd-button-colorful-to)', category: 'color', label: 'Colorful 主要按钮边框色', usage: 'Colorful 主要按钮边框颜色 - 边框模式' },
  'color-button-primary-light-borderless-text-default': { value: 'var(--cd-button-colorful-from)', category: 'color', label: 'Colorful 主要按钮文字色', usage: 'Colorful 主要按钮文字填充色 - 无边框模式' },

  // —— secondary ——
  'color-button-secondary-bg-default': { value: 'var(--cd-color-secondary)', category: 'color', label: '次要按钮背景色', usage: '次要按钮背景颜色' },
  'color-button-secondary-border-default': { value: 'var(--cd-color-secondary)', category: 'color', label: '次要按钮描边色', usage: '次要按钮描边颜色' },
  'color-button-secondary-text-default': { value: 'var(--cd-color-text-inverse)', category: 'color', label: '次要按钮文字色', usage: '次要按钮文字颜色 - solid 模式' },
  'color-button-secondary-bg-hover': { value: 'var(--cd-color-secondary-hover)', category: 'color', label: '次要按钮背景色', usage: '次要按钮背景颜色 - 悬浮' },
  'color-button-secondary-border-hover': { value: 'var(--cd-color-secondary-hover)', category: 'color', label: '次要按钮描边色', usage: '次要按钮描边颜色 - 悬浮' },
  'color-button-secondary-text-hover': { value: 'var(--cd-color-text-inverse)', category: 'color', label: '次要按钮文字色', usage: '次要按钮文字颜色 - 悬浮' },
  'color-button-secondary-bg-active': { value: 'var(--cd-color-secondary-active)', category: 'color', label: '次要按钮背景色', usage: '次要按钮背景颜色 - 按下' },
  'color-button-secondary-border-active': { value: 'var(--cd-color-secondary-active)', category: 'color', label: '次要按钮描边色', usage: '次要按钮描边颜色 - 按下' },
  'color-button-secondary-text-active': { value: 'var(--cd-color-text-inverse)', category: 'color', label: '次要按钮文字色', usage: '次要按钮文字颜色 - 按下' },
  'color-button-secondary-outline-border-default': { value: 'var(--cd-color-border)', category: 'color', label: '次要按钮边框色', usage: '次要按钮边框颜色 - 边框模式' },
  'color-button-secondary-borderless-text-default': { value: 'var(--cd-color-secondary)', category: 'color', label: '次要按钮文字色', usage: '次要按钮文字颜色 - 浅色/边框/无边框模式' },

  // —— danger ——
  'color-button-danger-bg-default': { value: 'var(--cd-color-danger)', category: 'color', label: '危险按钮背景色', usage: '危险按钮背景颜色' },
  'color-button-danger-border-default': { value: 'var(--cd-color-danger)', category: 'color', label: '危险按钮描边色', usage: '危险按钮描边颜色' },
  'color-button-danger-text-default': { value: 'var(--cd-color-text-inverse)', category: 'color', label: '危险按钮文字色', usage: '危险按钮文字颜色 - solid 模式' },
  'color-button-danger-bg-hover': { value: 'var(--cd-color-danger-hover)', category: 'color', label: '危险按钮背景色', usage: '危险按钮背景颜色 - 悬浮' },
  'color-button-danger-border-hover': { value: 'var(--cd-color-danger)', category: 'color', label: '危险按钮描边色', usage: '危险按钮描边颜色 - 悬浮' },
  'color-button-danger-text-hover': { value: 'var(--cd-color-text-inverse)', category: 'color', label: '危险按钮文字色', usage: '危险按钮文字颜色 - 悬浮' },
  'color-button-danger-bg-active': { value: 'var(--cd-color-danger-active)', category: 'color', label: '危险按钮背景色', usage: '危险按钮背景颜色 - 按下' },
  'color-button-danger-border-active': { value: 'var(--cd-color-danger-active)', category: 'color', label: '危险按钮描边色', usage: '危险按钮描边颜色 - 按下' },
  'color-button-danger-text-active': { value: 'var(--cd-color-text-inverse)', category: 'color', label: '危险按钮文字色', usage: '危险按钮文字颜色 - 按下' },
  'color-button-danger-outline-focus': { value: 'var(--cd-color-danger-light-active)', category: 'color', label: '危险按钮轮廓色', usage: '危险按钮轮廓 - 聚焦' },
  'color-button-danger-outline-border-default': { value: 'var(--cd-color-danger)', category: 'color', label: '危险按钮边框色', usage: '危险按钮边框颜色 - 边框模式' },
  'color-button-danger-borderless-text-default': { value: 'var(--cd-color-danger)', category: 'color', label: '危险按钮文字色', usage: '危险按钮文字颜色 - 浅色/边框/无边框模式' },

  // —— warning ——
  'color-button-warning-bg-default': { value: 'var(--cd-color-warning)', category: 'color', label: '警告按钮背景色', usage: '警告按钮背景颜色' },
  'color-button-warning-border-default': { value: 'var(--cd-color-warning)', category: 'color', label: '警告按钮描边色', usage: '警告按钮描边颜色' },
  'color-button-warning-text-default': { value: 'var(--cd-color-text-inverse)', category: 'color', label: '警告按钮文字色', usage: '警告按钮文字颜色 - solid 模式' },
  'color-button-warning-bg-hover': { value: 'var(--cd-color-warning-hover)', category: 'color', label: '警告按钮背景色', usage: '警告按钮背景颜色 - 悬浮' },
  'color-button-warning-border-hover': { value: 'var(--cd-color-warning-hover)', category: 'color', label: '警告按钮描边色', usage: '警告按钮描边颜色 - 悬浮' },
  'color-button-warning-text-hover': { value: 'var(--cd-color-text-inverse)', category: 'color', label: '警告按钮文字色', usage: '警告按钮文字颜色 - 悬浮' },
  'color-button-warning-bg-active': { value: 'var(--cd-color-warning-active)', category: 'color', label: '警告按钮背景色', usage: '警告按钮背景颜色 - 按下' },
  'color-button-warning-border-active': { value: 'var(--cd-color-warning-active)', category: 'color', label: '警告按钮描边色', usage: '警告按钮描边颜色 - 按下' },
  'color-button-warning-text-active': { value: 'var(--cd-color-text-inverse)', category: 'color', label: '警告按钮文字色', usage: '警告按钮文字颜色 - 按下' },
  'color-button-warning-outline-focus': { value: 'var(--cd-color-warning-light-active)', category: 'color', label: '警告按钮轮廓色', usage: '警告按钮轮廓 - 聚焦' },
  'color-button-warning-outline-border-default': { value: 'var(--cd-color-warning)', category: 'color', label: '警告按钮边框色', usage: '警告按钮边框颜色 - 边框模式' },
  'color-button-warning-borderless-text-default': { value: 'var(--cd-color-warning)', category: 'color', label: '警告按钮文字色', usage: '警告按钮文字颜色 - 浅色/边框/无边框模式' },

  // —— tertiary ——
  'color-button-tertiary-bg-default': { value: 'var(--cd-color-tertiary)', category: 'color', label: '第三按钮背景色', usage: '第三按钮背景颜色' },
  'color-button-tertiary-border-default': { value: 'var(--cd-color-tertiary)', category: 'color', label: '第三按钮描边色', usage: '第三按钮描边颜色' },
  'color-button-tertiary-text-default': { value: 'var(--cd-color-text-inverse)', category: 'color', label: '第三按钮文字色', usage: '第三按钮文字颜色 - solid 模式' },
  'color-button-tertiary-solid-colorful-bg-default': { value: 'var(--cd-button-colorful-from)', category: 'color', label: 'Colorful 第三按钮背景色', usage: 'colorful 第三按钮背景颜色' },
  'color-button-tertiary-solid-colorful-bg-hover': { value: 'var(--cd-button-colorful-via)', category: 'color', label: 'Colorful 第三按钮背景色', usage: 'colorful 第三按钮背景颜色 - 悬浮' },
  'color-button-tertiary-solid-colorful-bg-active': { value: 'var(--cd-button-colorful-to)', category: 'color', label: 'Colorful 第三按钮背景色', usage: 'colorful 第三按钮背景颜色 - 按下' },
  'color-button-tertiary-solid-colorful-text-default': { value: 'var(--cd-button-colorful-from)', category: 'color', label: 'Colorful 第三按钮文字色', usage: 'Colorful 第三按钮文字填充色 - solid 主题' },
  'color-button-tertiary-bg-hover': { value: 'var(--cd-color-tertiary-hover)', category: 'color', label: '第三按钮背景色', usage: '第三按钮背景颜色 - 悬浮' },
  'color-button-tertiary-border-hover': { value: 'var(--cd-color-tertiary-hover)', category: 'color', label: '第三按钮描边色', usage: '第三按钮描边颜色 - 悬浮' },
  'color-button-tertiary-text-hover': { value: 'var(--cd-color-text-inverse)', category: 'color', label: '第三按钮文字色', usage: '第三按钮文字颜色 - 悬浮' },
  'color-button-tertiary-bg-active': { value: 'var(--cd-color-tertiary-active)', category: 'color', label: '第三按钮背景色', usage: '第三按钮背景颜色 - 按下' },
  'color-button-tertiary-border-active': { value: 'var(--cd-color-tertiary-active)', category: 'color', label: '第三按钮描边色', usage: '第三按钮描边颜色 - 按下' },
  'color-button-tertiary-text-active': { value: 'var(--cd-color-text-inverse)', category: 'color', label: '第三按钮文字色', usage: '第三按钮文字颜色 - 按下' },
  'color-button-tertiary-outline-border-default': { value: 'var(--cd-color-border)', category: 'color', label: '第三按钮边框色', usage: '第三按钮边框颜色 - 边框模式' },
  'color-button-tertiary-solid-text-default': { value: 'var(--cd-color-text-1)', category: 'color', label: '第三按钮文字色', usage: '第三按钮文字颜色 - 浅色/边框/无边框模式' },

  // —— disabled ——
  'color-button-disabled-solid-text-default': { value: 'var(--cd-color-disabled-text)', category: 'color', label: '禁用按钮文字色', usage: '禁用按钮文字颜色 - solid 主题' },
  'color-button-disabled-text-default': { value: 'var(--cd-color-disabled-text)', category: 'color', label: '禁用按钮文字色', usage: '禁用按钮文字颜色 - 浅色主题或无背景' },
  'color-button-disabled-outline-text-default': { value: 'var(--cd-color-disabled-text)', category: 'color', label: '禁用按钮文字色', usage: '禁用按钮文字颜色 - 边框模式' },
  'color-button-disabled-bg-default': { value: 'var(--cd-color-disabled-bg)', category: 'color', label: '禁用按钮背景色', usage: '禁用按钮背景颜色' },
  'color-button-disabled-text-hover': { value: 'var(--cd-color-button-disabled-text-default)', category: 'color', label: '禁用按钮文字色', usage: '禁用按钮文字颜色 - solid 主题 - 悬浮' },
  'color-button-disabled-bg-hover': { value: 'var(--cd-color-disabled-bg)', category: 'color', label: '禁用按钮背景色', usage: '禁用按钮背景颜色 - 悬浮' },
  'color-button-disabled-primary-bg-default': { value: 'var(--cd-color-button-disabled-bg-default)', category: 'color', label: '禁用主要按钮背景色', usage: '禁用 primary 按钮背景颜色' },
  'color-button-disabled-secondary-bg-default': { value: 'var(--cd-color-button-disabled-bg-default)', category: 'color', label: '禁用次要按钮背景色', usage: '禁用 secondary 按钮背景颜色' },
  'color-button-disabled-danger-bg-default': { value: 'var(--cd-color-button-disabled-bg-default)', category: 'color', label: '禁用危险按钮背景色', usage: '禁用 danger 按钮背景颜色' },
  'color-button-disabled-warning-bg-default': { value: 'var(--cd-color-button-disabled-bg-default)', category: 'color', label: '禁用警告按钮背景色', usage: '禁用 warning 按钮背景颜色' },
  'color-button-disabled-tertiary-bg-default': { value: 'var(--cd-color-button-disabled-bg-default)', category: 'color', label: '禁用第三按钮背景色', usage: '禁用 tertiary 按钮背景颜色' },
  'color-button-disabled-outline-border-default': { value: 'var(--cd-color-border)', category: 'color', label: '禁用按钮边框色', usage: '禁用按钮边框颜色 - 边框模式' },

  // —— light ——
  'color-button-light-bg-default': { value: 'var(--cd-color-fill-0)', category: 'color', label: '浅色按钮背景色', usage: '浅色按钮背景颜色' },
  'color-button-light-bg-hover': { value: 'var(--cd-color-fill-1)', category: 'color', label: '浅色按钮背景色', usage: '浅色按钮背景颜色 - 悬浮' },
  'color-button-light-bg-active': { value: 'var(--cd-color-fill-2)', category: 'color', label: '浅色按钮背景色', usage: '浅色按钮背景颜色 - 按下' },
  'color-button-light-border-default': { value: 'transparent', category: 'color', label: '浅色按钮描边色', usage: '浅色按钮描边颜色' },
  'color-button-light-border-hover': { value: 'var(--cd-color-button-light-border-default)', category: 'color', label: '浅色按钮描边色', usage: '浅色按钮描边颜色 - 悬浮' },
  'color-button-light-border-active': { value: 'var(--cd-color-button-light-border-hover)', category: 'color', label: '浅色按钮描边色', usage: '浅色按钮描边颜色 - 按下' },
  'width-button-light-border': { value: '0', category: 'width', label: '浅色按钮描边宽度', usage: '浅色按钮描边宽度' },
  'color-button-disabled-light-primary-bg-default': { value: 'var(--cd-color-button-light-bg-default)', category: 'color', label: '禁用浅色主要按钮背景色', usage: '禁用 light primary 按钮背景颜色' },
  'color-button-disabled-light-secondary-bg-default': { value: 'var(--cd-color-button-light-bg-default)', category: 'color', label: '禁用浅色次要按钮背景色', usage: '禁用 light secondary 按钮背景颜色' },
  'color-button-disabled-light-danger-bg-default': { value: 'var(--cd-color-button-light-bg-default)', category: 'color', label: '禁用浅色危险按钮背景色', usage: '禁用 light danger 按钮背景颜色' },
  'color-button-disabled-light-warning-bg-default': { value: 'var(--cd-color-button-light-bg-default)', category: 'color', label: '禁用浅色警告按钮背景色', usage: '禁用 light warning 按钮背景颜色' },
  'color-button-disabled-light-tertiary-bg-default': { value: 'var(--cd-color-button-light-bg-default)', category: 'color', label: '禁用浅色第三按钮背景色', usage: '禁用 light tertiary 按钮背景颜色' },

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

  // —— buttongroup ——
  'color-button-group-border-default': { value: 'var(--cd-color-border)', category: 'color', label: '按钮组分割线色', usage: '按钮组分割线颜色' },
  'width-button-group-border': { value: 'var(--cd-border-thickness-control)', category: 'width', label: '按钮组分割线宽度', usage: '按钮组分割线宽度' },

  // —— padding ——
  'spacing-button-default-paddingtop': { value: '6px', category: 'spacing', label: '按钮顶部内边距', usage: '按钮顶部内边距 - 默认' },
  'spacing-button-default-paddingbottom': { value: '6px', category: 'spacing', label: '按钮底部内边距', usage: '按钮底部内边距 - 默认' },
  'spacing-button-default-paddingleft': { value: 'var(--cd-spacing-base-tight)', category: 'spacing', label: '按钮左侧内边距', usage: '按钮左侧内边距 - 默认' },
  'spacing-button-default-paddingright': { value: 'var(--cd-spacing-base-tight)', category: 'spacing', label: '按钮右侧内边距', usage: '按钮右侧内边距 - 默认' },
  'spacing-button-large-paddingtop': { value: '10px', category: 'spacing', label: '按钮顶部内边距', usage: '按钮顶部内边距 - 大尺寸' },
  'spacing-button-large-paddingbottom': { value: '10px', category: 'spacing', label: '按钮底部内边距', usage: '按钮底部内边距 - 大尺寸' },
  'spacing-button-large-paddingleft': { value: 'var(--cd-spacing-base)', category: 'spacing', label: '按钮左侧内边距', usage: '按钮左侧内边距 - 大尺寸' },
  'spacing-button-large-paddingright': { value: 'var(--cd-spacing-base)', category: 'spacing', label: '按钮右侧内边距', usage: '按钮右侧内边距 - 大尺寸' },
  'spacing-button-small-paddingtop': { value: 'var(--cd-spacing-super-tight)', category: 'spacing', label: '按钮顶部内边距', usage: '按钮顶部内边距 - 小尺寸' },
  'spacing-button-small-paddingbottom': { value: 'var(--cd-spacing-super-tight)', category: 'spacing', label: '按钮底部内边距', usage: '按钮底部内边距 - 小尺寸' },
  'spacing-button-small-paddingleft': { value: 'var(--cd-spacing-base-tight)', category: 'spacing', label: '按钮左侧内边距', usage: '按钮左侧内边距 - 小尺寸' },
  'spacing-button-small-paddingright': { value: 'var(--cd-spacing-base-tight)', category: 'spacing', label: '按钮右侧内边距', usage: '按钮右侧内边距 - 小尺寸' },
  'spacing-button-icononly-default-paddingleft': { value: 'var(--cd-spacing-tight)', category: 'spacing', label: '图标按钮左侧内边距', usage: '图标按钮左侧内边距 - 默认' },
  'spacing-button-icononly-default-paddingright': { value: 'var(--cd-spacing-tight)', category: 'spacing', label: '图标按钮右侧内边距', usage: '图标按钮右侧内边距 - 默认' },
  'spacing-button-icononly-default-paddingtop': { value: 'var(--cd-spacing-tight)', category: 'spacing', label: '图标按钮顶部内边距', usage: '图标按钮顶部内边距 - 默认' },
  'spacing-button-icononly-default-paddingbottom': { value: 'var(--cd-spacing-tight)', category: 'spacing', label: '图标按钮底部内边距', usage: '图标按钮底部内边距 - 默认' },
  'spacing-button-icononly-large-paddingleft': { value: 'var(--cd-spacing-base-tight)', category: 'spacing', label: '图标按钮左侧内边距', usage: '图标按钮左侧内边距 - 大尺寸' },
  'spacing-button-icononly-large-paddingright': { value: 'var(--cd-spacing-base-tight)', category: 'spacing', label: '图标按钮右侧内边距', usage: '图标按钮右侧内边距 - 大尺寸' },
  'spacing-button-icononly-large-paddingtop': { value: 'var(--cd-spacing-base-tight)', category: 'spacing', label: '图标按钮顶部内边距', usage: '图标按钮顶部内边距 - 大尺寸' },
  'spacing-button-icononly-large-paddingbottom': { value: 'var(--cd-spacing-base-tight)', category: 'spacing', label: '图标按钮底部内边距', usage: '图标按钮底部内边距 - 大尺寸' },
  'spacing-button-icononly-small-paddingleft': { value: 'var(--cd-spacing-extra-tight)', category: 'spacing', label: '图标按钮左侧内边距', usage: '图标按钮左侧内边距 - 小尺寸' },
  'spacing-button-icononly-small-paddingright': { value: 'var(--cd-spacing-extra-tight)', category: 'spacing', label: '图标按钮右侧内边距', usage: '图标按钮右侧内边距 - 小尺寸' },
  'spacing-button-icononly-small-paddingtop': { value: 'var(--cd-spacing-extra-tight)', category: 'spacing', label: '图标按钮顶部内边距', usage: '图标按钮顶部内边距 - 小尺寸' },
  'spacing-button-icononly-small-paddingbottom': { value: 'var(--cd-spacing-extra-tight)', category: 'spacing', label: '图标按钮底部内边距', usage: '图标按钮底部内边距 - 小尺寸' },
  'height-button-icononly-small': { value: 'var(--cd-control-height-small)', category: 'height', label: '图标按钮高度', usage: '图标按钮 height - 小尺寸' },
  'width-button-icononly-small': { value: 'var(--cd-control-height-small)', category: 'width', label: '图标按钮宽度', usage: '图标按钮 width - 小尺寸' },
  'height-button-icononly-default': { value: 'var(--cd-control-height-default)', category: 'height', label: '图标按钮高度', usage: '图标按钮 height - 默认' },
  'width-button-icononly-default': { value: 'var(--cd-control-height-default)', category: 'width', label: '图标按钮宽度', usage: '图标按钮 width - 默认' },
  'height-button-icononly-large': { value: 'var(--cd-control-height-large)', category: 'height', label: '图标按钮高度', usage: '图标按钮 height - 大尺寸' },
  'width-button-icononly-large': { value: 'var(--cd-control-height-large)', category: 'width', label: '图标按钮宽度', usage: '图标按钮 width - 大尺寸' },

  // —— margin ——
  'spacing-button-icononly-content-marginleft': { value: 'var(--cd-spacing-tight)', category: 'spacing', label: '左侧图标文字间距', usage: '按钮左侧图标距离文字间距' },
  'spacing-button-icononly-content-marginright': { value: 'var(--cd-spacing-tight)', category: 'spacing', label: '右侧图标文字间距', usage: '按钮右侧图标距离文字间距' },

  // —— font ——
  'font-button-fontweight': { value: 'var(--cd-font-weight-bold)', category: 'font', label: '按钮文字字重', usage: '按钮文字字重 - 默认' },
  'font-button-fontsize': { value: 'var(--cd-font-size-regular)', category: 'font', label: '按钮文字字号', usage: '按钮文字字号- 默认' },
  'font-button-lineheight': { value: '20px', category: 'font', label: '按钮文字行高', usage: '按钮文字行高 - 默认' },
  'font-button-small-fontweight': { value: 'var(--cd-font-weight-bold)', category: 'font', label: '按钮文字字重', usage: '按钮文字字重 - 小尺寸' },
  'font-button-small-fontsize': { value: 'var(--cd-font-size-regular)', category: 'font', label: '按钮文字字号', usage: '按钮文字字号- 小尺寸' },
  'font-button-small-lineheight': { value: '20px', category: 'font', label: '按钮文字行高', usage: '按钮文字行高 - 小尺寸' },
  'font-button-large-fontweight': { value: 'var(--cd-font-weight-bold)', category: 'font', label: '按钮文字字重', usage: '默认按钮文字字重 - 大尺寸' },
  'font-button-large-fontsize': { value: 'var(--cd-font-size-regular)', category: 'font', label: '按钮文字字号', usage: '默认按钮文字字号 - 大尺寸' },
  'font-button-large-lineheight': { value: '20px', category: 'font', label: '按钮文字行高', usage: '默认按钮文字行高 - 大尺寸' },

  // —— height ——
  'height-button-large': { value: 'var(--cd-control-height-large)', category: 'height', label: '按钮高度', usage: '按钮高度 - 大尺寸' },
  'height-button-small': { value: 'var(--cd-control-height-small)', category: 'height', label: '按钮高度', usage: '按钮高度 - 小尺寸' },
  'height-button-default': { value: 'var(--cd-control-height-default)', category: 'height', label: '按钮高度', usage: '按钮高度 - 默认' },
  'height-button-group-line-default': { value: '20px', category: 'height', label: '分割线高度', usage: '分割线高度 - 默认' },

  // —— radius ——
  'width-button-border': { value: 'var(--cd-border-thickness)', category: 'width', label: '按钮描边宽度', usage: '按钮描边宽度' },
  'radius-button': { value: 'var(--cd-border-radius-small)', category: 'radius', label: '按钮圆角', usage: '按钮圆角大小' },
  'radius-button-group': { value: 'var(--cd-radius-button)', category: 'radius', label: '按钮组圆角', usage: '按钮组圆角大小' },
  'width-button-outline': { value: '2px', category: 'width', label: '按钮轮廓宽度', usage: '按钮轮廓宽度' },

  // —— splitButtonGroup ——
  'radius-button-splitbuttongroup-first-topleft': { value: 'var(--cd-border-radius-small)', category: 'radius', label: '组合按钮首个左上圆角', usage: '组合按钮(Split) - 首个按钮左上圆角' },
  'radius-button-splitbuttongroup-first-bottomleft': { value: 'var(--cd-border-radius-small)', category: 'radius', label: '组合按钮首个左下圆角', usage: '组合按钮(Split) - 首个按钮左下圆角' },
  'radius-button-splitbuttongroup-last-topright': { value: 'var(--cd-border-radius-small)', category: 'radius', label: '组合按钮末尾右上圆角', usage: '组合按钮(Split) - 末尾按钮右上圆角' },
  'radius-button-splitbuttongroup-last-bottomright': { value: 'var(--cd-border-radius-small)', category: 'radius', label: '组合按钮末尾右下圆角', usage: '组合按钮(Split) - 末尾按钮右下圆角' },

  // —— animation ——
  'animation-duration-button-icon-loading': { value: '600ms', category: 'animation', label: '加载图标旋转时长', usage: '加载图标容器旋转一周时长' },
  'animation-duration-button-icon-customicon-loading': { value: '1600ms', category: 'animation', label: '自定义指示器旋转时长', usage: '自定义指示器时旋转一周时长' },

  // —— chenzy-design 组件实际消费的补充 token（Semi 无）——
  'button-height-default': { value: 'var(--cd-control-height-default)', category: 'height', label: '按钮高度', usage: '按钮高度 - 默认（组件消费）' },
  'button-height-small': { value: 'var(--cd-control-height-small)', category: 'height', label: '按钮高度', usage: '按钮高度 - 小尺寸（组件消费）' },
  'button-height-large': { value: 'var(--cd-control-height-large)', category: 'height', label: '按钮高度', usage: '按钮高度 - 大尺寸（组件消费）' },
  'button-padding-x': { value: 'var(--cd-spacing-base-tight)', category: 'spacing', label: '按钮水平内边距', usage: '按钮水平内边距 - 默认/小尺寸（组件消费）' },
  'button-padding-x-large': { value: 'var(--cd-spacing-base)', category: 'spacing', label: '按钮水平内边距', usage: '按钮水平内边距 - 大尺寸（组件消费）' },
  'button-radius': { value: 'var(--cd-border-radius-small)', category: 'radius', label: '按钮圆角', usage: '按钮圆角（组件消费）' },
  'button-font-size': { value: 'var(--cd-font-size-regular)', category: 'font', label: '按钮字号', usage: '按钮文字字号（组件消费）' },
  'button-color-bg-primary': { value: 'var(--cd-color-primary)', category: 'color', label: '主要按钮背景色', usage: '主要按钮背景颜色（组件消费）' },
  'button-color-text-primary': { value: 'var(--cd-color-text-inverse)', category: 'color', label: '主要按钮文字色', usage: '主要按钮文字颜色（组件消费）' },
  'button-group-divider': { value: 'var(--cd-color-border)', category: 'color', label: '按钮组分隔线色', usage: '按钮组分隔线颜色（组件消费）' },
  'button-colorful-from': { value: '#4d6bff', category: 'color', label: 'Colorful 渐变起始色', usage: 'colorful（AI 多彩）蓝→紫渐变起始色', editable: true },
  'button-colorful-via': { value: '#7b5cff', category: 'color', label: 'Colorful 渐变中间色', usage: 'colorful（AI 多彩）蓝→紫渐变中间色', editable: true },
  'button-colorful-to': { value: '#a64dff', category: 'color', label: 'Colorful 渐变结束色', usage: 'colorful（AI 多彩）蓝→紫渐变结束色', editable: true },
} satisfies TokenGroup;
