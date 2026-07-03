/**
 * Component tokens for Menu & Anchor（M3 Navigation）。
 * Menu 是 navigation.ts（Semi navigation/variables.scss 全量对齐）的消费方：值尽量转引
 * --cd-navigation-* 主 token，保留组件实际消费的老 token 名。Anchor token 无 Semi navigation
 * 对应，引用 alias。
 */
import type { TokenGroup } from './token-def.js';

export const menuTokens = {
  // —— Menu（转引 navigation 主 token） ——
  'menu-bg': { value: 'var(--cd-color-navigation-bg-default)', category: 'color', label: '菜单背景', usage: '菜单容器背景色（转引 navigation-bg-default）' },
  'menu-item-height': { value: 'var(--cd-height-navigation-item-base)', category: 'height', label: '菜单项高度', usage: '菜单项高度（转引 navigation-item-base = 36px）' },
  'menu-item-padding': { value: 'var(--cd-spacing-navigation-item-paddingx)', category: 'spacing', label: '菜单项水平内边距', usage: '菜单项水平内边距（转引 navigation-item-paddingX）' },
  'menu-item-radius': { value: 'var(--cd-width-navigation-item-borderradius)', category: 'radius', label: '菜单项圆角', usage: '菜单项圆角（转引 navigation-item-borderRadius）' },
  // 对齐 Semi navigation itemL1-text-default（text-0；原 text-1，视觉略深）
  'menu-item-color': { value: 'var(--cd-color-navigation-iteml1-text-default)', category: 'color', label: '菜单项文字色', usage: '菜单项默认文字颜色（转引 navigation itemL1-text-default = text-0）' },
  // 对齐 Semi：选中项文字深色 text-0，仅图标/对勾用品牌色 primary
  'menu-item-color-selected': { value: 'var(--cd-color-navigation-iteml1-selected-text-default)', category: 'color', label: '选中文字色', usage: '选中项文字颜色（转引 navigation itemL1-selected-text-default = text-0）' },
  'menu-item-icon-color-selected': { value: 'var(--cd-color-navigation-iteml1-selected-icon-default)', category: 'color', label: '选中图标色', usage: '选中项图标颜色（转引 navigation itemL1-selected-icon-default = primary）' },
  // 对齐 Semi navigation itemL1-disabled-text-default（disabled-text；原 text-3，色值一致）
  'menu-item-color-disabled': { value: 'var(--cd-color-navigation-iteml1-disabled-text-default)', category: 'color', label: '禁用文字色', usage: '禁用项文字颜色（转引 navigation itemL1-disabled-text-default）' },
  'menu-item-bg-hover': { value: 'var(--cd-color-navigation-iteml1-bg-hover)', category: 'color', label: '悬浮背景', usage: '菜单项悬浮背景（转引 navigation itemL1-bg-hover = fill-0）' },
  // 选中态浅蓝块（对齐 Semi itemL1-selected-bg = primary-light-default）
  'menu-item-bg-selected': { value: 'var(--cd-color-navigation-iteml1-selected-bg-default)', category: 'color', label: '选中背景', usage: '选中项背景（转引 navigation itemL1-selected-bg-default = primary-light-default）' },
  'menu-submenu-arrow-color': { value: 'var(--cd-color-navigation-iteml1-icon-default)', category: 'color', label: '子菜单箭头色', usage: '子菜单展开箭头颜色（转引 navigation itemL1-icon-default = text-2）' },
  'menu-border-color': { value: 'var(--cd-color-navigation-border-default)', category: 'color', label: '分割线/边框色', usage: '菜单分隔符与 horizontal 底边框颜色（转引 navigation-border-default）' },

  // —— horizontal 顶部菜单（转引 navigation horizontal itemL1） ——
  'menu-horizontal-item-color': { value: 'var(--cd-color-navigation-horizontal-iteml1-text-default)', category: 'color', label: '水平项文字色', usage: '水平菜单项默认文字色（转引 navigation horizontal itemL1-text-default = text-2）' },
  'menu-horizontal-item-color-hover': { value: 'var(--cd-color-navigation-horizontal-iteml1-text-hover)', category: 'color', label: '水平项悬浮文字色', usage: '水平菜单项悬浮文字色（转引 navigation horizontal itemL1-text-hover = text-1）' },
  'menu-horizontal-item-color-selected': { value: 'var(--cd-color-navigation-horizontal-iteml1-selected-text-default)', category: 'color', label: '水平项选中文字色', usage: '水平菜单项选中文字色（转引 navigation horizontal itemL1-selected-text-default = text-0）' },

  // —— Anchor（无 Semi navigation 对应，引用 alias） ——
  'anchor-link-color': { value: 'var(--cd-color-text-2)', category: 'color', label: '锚点文字色', usage: '锚点链接默认文字颜色' },
  'anchor-link-color-active': { value: 'var(--cd-color-text-0)', category: 'color', label: '锚点激活文字色', usage: '对齐 Semi 选中文字 text-0（原 primary；ink 滑轨仍 primary）' },
  'anchor-link-padding': { value: 'var(--cd-spacing-extra-tight) var(--cd-spacing-base-tight)', category: 'spacing', label: '锚点内边距', usage: '锚点链接内边距' },
  'anchor-rail-color': { value: 'var(--cd-color-border)', category: 'color', label: '锚点轨道色', usage: '锚点滑轨颜色' },
  'anchor-ink-color': { value: 'var(--cd-color-primary)', category: 'color', label: '锚点滑块色', usage: '锚点激活滑块颜色' },
  'anchor-ink-width': { value: '2px', category: 'width', label: '锚点滑块宽', usage: '锚点激活滑块宽度' },
} satisfies TokenGroup;
