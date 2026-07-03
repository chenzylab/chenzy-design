/**
 * Component tokens for Pagination（M navigation）。全量对齐 Semi Design
 * （semi-foundation/pagination/variables.scss 41 个），并升级为带元数据的 TokenDef
 * 结构以支持 DSM。值为 var() 引用我们的 alias / global token，或字面量。
 *
 * 注：
 *  - Semi 的 var(--semi-color-*) 一一对应 var(--cd-color-*)。
 *  - $spacing-extra-tight → var(--cd-spacing-extra-tight)（4px）。
 *  - var(--semi-border-radius-small) → var(--cd-border-radius-small)。
 *  - $font-weight-regular → var(--cd-font-weight-regular)；$font-weight-bold →
 *    var(--cd-font-weight-bold)。
 *  - Semi 命名下划线 `_` 化为 `-`、camelCase 全小写（minWidth→minwidth、paddingY→paddingy…）。
 *  - 组件 token 名（color-pagination-* / spacing-pagination-* …）与 alias / global 层不同名，
 *    var() 无自引用死循环。
 *  - 每页条数下拉复用 Select（--cd-select-*），非本文件职责。
 */
import type { TokenGroup } from './token-def.js';

export const paginationTokens = {
  // —— Color ——
  'color-pagination-text-default': { value: 'var(--cd-color-text-2)', category: 'color', label: '总页数文本颜色', usage: '翻页器总页数文本颜色' },
  'color-pagination-item-text-default': { value: 'var(--cd-color-text-0)', category: 'color', label: '页码文本颜色', usage: '翻页器 页码 文本颜色' },
  'color-pagination-item-bg-default': { value: 'transparent', category: 'color', label: '页码背景颜色', usage: '翻页器 页码 背景颜色' },
  'color-pagination-item-icon-default': { value: 'var(--cd-color-tertiary)', category: 'color', label: '页码图标颜色', usage: '翻页器 页码 图标颜色' },
  'color-pagination-item-text-hover': { value: 'var(--cd-color-text-0)', category: 'color', label: '页码悬浮态文本颜色', usage: '翻页器 页码 悬浮态文本颜色' },
  'color-pagination-item-bg-hover': { value: 'var(--cd-color-fill-0)', category: 'color', label: '页码悬浮态背景颜色', usage: '翻页器 页码 悬浮态背景颜色' },
  'color-pagination-item-text-active': { value: 'var(--cd-color-text-0)', category: 'color', label: '页码按下态文字颜色', usage: '翻页器 页码 按下态文字颜色' },
  'color-pagination-item-bg-active': { value: 'var(--cd-color-fill-1)', category: 'color', label: '页码按下态背景颜色', usage: '翻页器 页码 按下态背景颜色' },
  'color-pagination-item-text-disabled': { value: 'var(--cd-color-disabled-text)', category: 'color', label: '页码禁用态文字颜色', usage: '翻页器 页码 禁用态文字颜色' },
  'color-pagination-item-icon-disabled': { value: 'var(--cd-color-disabled-text)', category: 'color', label: '页码禁用态图标颜色', usage: '翻页器 页码 禁用态图标颜色' },
  'color-pagination-item-bg-disabled': { value: 'transparent', category: 'color', label: '页码禁用态背景颜色', usage: '翻页器 页码 禁用态背景颜色' },
  'color-pagination-item-bg-selected-disabled': { value: 'var(--cd-color-disabled-fill)', category: 'color', label: '页码选中禁用态背景颜色', usage: '翻页器 页码 选中禁用态背景颜色' },
  'color-pagination-item-text-selected': { value: 'var(--cd-color-primary)', category: 'color', label: '页码选中态文字颜色', usage: '翻页器 页码 选中态文字颜色' },
  'color-pagination-item-bg-selected': { value: 'var(--cd-color-primary-light-default)', category: 'color', label: '页码选中态背景颜色', usage: '翻页器 页码 选中态背景颜色' },
  'color-pagination-quickjump-text-disabled': { value: 'var(--cd-color-disabled-text)', category: 'color', label: '快速跳转禁用态文字颜色', usage: '翻页器 快速跳转禁用态文字颜色' },
  'color-pagination-item-border-default': { value: 'transparent', category: 'color', label: '页码默认边框颜色', usage: '翻页器 页码 默认边框颜色' },
  'color-pagination-item-border-hover': { value: 'transparent', category: 'color', label: '页码悬浮边框颜色', usage: '翻页器 页码 悬浮边框颜色' },
  'color-pagination-item-border-active': { value: 'transparent', category: 'color', label: '页码激活边框颜色', usage: '翻页器 页码 激活边框颜色' },
  'color-pagination-item-border-selected': { value: 'transparent', category: 'color', label: '页码选中边框颜色', usage: '翻页器 页码 选中边框颜色' },
  'color-pagination-item-border-disabled': { value: 'transparent', category: 'color', label: '页码禁用边框颜色', usage: '翻页器 页码 禁用边框颜色' },

  // —— Width / Height ——
  'height-pagination-item': { value: '32px', category: 'height', label: '页码高度', usage: '翻页器 页码高度' },
  'width-pagination-item-minwidth': { value: '32px', category: 'width', label: '页码最小宽度', usage: '翻页器 页码最小宽度' },
  'width-pagination-item-small-minwidth': { value: '44px', category: 'width', label: '迷你页码最小宽度', usage: '迷你翻页器 页码最小宽度' },
  'width-pagination-quickjump-input-width': { value: '50px', category: 'width', label: '快速跳转输入框宽度', usage: '快速跳转输入框宽度' },
  'width-pagination-item-border': { value: '0px', category: 'width', label: '页码默认边框宽度', usage: '翻页器 页码 默认边框宽度' },

  // —— Spacing ——
  'spacing-pagination-padding': { value: '0', category: 'spacing', label: '内边距', usage: '翻页器内边距' },
  'spacing-pagination-small-paddingy': { value: '0', category: 'spacing', label: '迷你垂直内边距', usage: '迷你翻页器垂直内边距' },
  'spacing-pagination-small-paddingx': { value: '0', category: 'spacing', label: '迷你水平内边距', usage: '迷你翻页器水平内边距' },
  'spacing-pagination-item-marginleft': { value: 'var(--cd-spacing-extra-tight)', category: 'spacing', label: '页码左侧外边距', usage: '翻页器页码左侧外边距' },
  'spacing-pagination-item-marginright': { value: 'var(--cd-spacing-extra-tight)', category: 'spacing', label: '页码右侧外边距', usage: '翻页器页码右侧外边距' },
  'spacing-pagination-item-small-margin': { value: '0', category: 'spacing', label: '迷你页码外边距', usage: '迷你翻页器页码外边距' },
  'spacing-pagination-reset-list-paddingtop': { value: 'var(--cd-spacing-extra-tight)', category: 'spacing', label: '列表上内边距', usage: '翻页器列表上内边距' },
  'spacing-pagination-reset-list-paddingbottom': { value: 'var(--cd-spacing-extra-tight)', category: 'spacing', label: '列表下内边距', usage: '翻页器列表下内边距' },
  'spacing-pagination-quickjump-marginleft': { value: '24px', category: 'spacing', label: '快速跳转左侧外边距', usage: '快速跳转左侧外边距' },
  'spacing-pagination-quickjump-input-marginleft': { value: '4px', category: 'spacing', label: '快速跳转输入框左外边距', usage: '快速跳转输入框左侧外边距' },
  'spacing-pagination-quickjump-input-marginright': { value: '4px', category: 'spacing', label: '快速跳转输入框右外边距', usage: '快速跳转输入框右侧外边距' },

  // —— Radius ——
  'radius-pagination-item': { value: 'var(--cd-border-radius-small)', category: 'radius', label: '页码圆角大小', usage: '翻页器页码圆角大小' },

  // —— Font ——
  'font-pagination-small-fontweight': { value: 'var(--cd-font-weight-regular)', category: 'font', label: '迷你字重', usage: '迷你翻页器字重' },
  'font-pagination-item-fontweight': { value: 'var(--cd-font-weight-regular)', category: 'font', label: '页码字重', usage: '翻页器页码字重' },
  'font-pagination-item-active-fontweight': { value: 'var(--cd-font-weight-bold)', category: 'font', label: '页码选中态字重', usage: '翻页器页码选中态字重' },
  'font-pagination-quickjump-fontweight': { value: 'var(--cd-font-weight-regular)', category: 'font', label: '快速跳转输入框字重', usage: '快速跳转输入框字重' },
} satisfies TokenGroup;
