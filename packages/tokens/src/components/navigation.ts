/**
 * Navigation 主 token 源：命名镜像 semi-foundation/navigation/variables.scss（kebab：
 * `$xxx-navigation_yyy` → `xxx-navigation-yyy`），Menu / Nav 组件 token（menu.ts / nav.ts）
 * 转引这里作为主 token 源。
 *
 * 曾 1:1 全量镜像 Semi 的 120 个变量；后按 dsm.spec「Token 精简原则」收敛为只保留
 * Menu / Nav 实际消费的主 token，删除无任何组件消费的孤儿（含 Semi 自引用 calc 链、
 * 未落地的 itemLn / horizontal 细分态等）。值 var() 引用我们的 alias / global token 或字面量。
 */
import type { TokenGroup } from './token-def.js';

export const navigationTokens = {
  // ============================================================
  // Navigation 主 token（Menu / Nav 消费；命名对齐 Semi navigation/variables.scss）
  // ============================================================

  // —— Size ——
  'height-navigation-item-base': { value: '36px', category: 'height', label: '侧边菜单项高度', usage: '侧边导航栏菜单项高度' },
  'height-navigation-horizontal-header': { value: '60px', category: 'height', label: '顶部导航高度', usage: '顶部导航栏高度' },
  'width-navigation-item-borderradius': { value: 'var(--cd-border-radius-small)', category: 'radius', label: '菜单项圆角', usage: '导航栏菜单项圆角' },

  // —— Spacing ——
  'spacing-navigation-item-paddingx': { value: 'var(--cd-spacing-base-tight)', category: 'spacing', label: '菜单项水平内边距', usage: '侧边导航栏菜单项水平方向内边距' },
  'spacing-navigation-header-logo-marginright': { value: '8px', category: 'spacing', label: 'Logo 右外边距', usage: '侧边导航栏 Logo 右侧外边距' },
  'spacing-navigation-horizontal-paddingleft': { value: '24px', category: 'spacing', label: '顶部左内边距', usage: '顶部导航栏左侧内边距' },
  // Semi calc：(container_collapsed - collapsed_paddingX*2 - border - header_logo_collapsed) * 0.5
  'spacing-navigation-vertical-footer-paddingleft': { value: 'var(--cd-spacing-tight)', category: 'spacing', label: 'footer 左内边距', usage: '侧边导航栏 footer 左侧内边距' },

  // —— Color ——
  'color-navigation-bg-default': { value: 'var(--cd-color-nav-bg)', category: 'color', label: '导航背景色', usage: '导航栏背景色' },
  'color-navigation-border-default': { value: 'var(--cd-color-border)', category: 'color', label: '分割线色', usage: '导航栏分割线色' },
  'color-navigation-header-text-default': { value: 'var(--cd-color-text-0)', category: 'color', label: 'header 文字色', usage: '导航栏 header 文字颜色' },
  'color-navigation-footer-icon-default': { value: 'var(--cd-color-text-1)', category: 'color', label: 'footer 图标色', usage: '导航栏 footer 图标颜色' },
  'color-navigation-iteml1-text-default': { value: 'var(--cd-color-text-0)', category: 'color', label: '一级项文字色', usage: '导航栏一级菜单项文字颜色' },
  'color-navigation-iteml1-icon-default': { value: 'var(--cd-color-text-2)', category: 'color', label: '一级项图标色', usage: '导航栏一级菜单项图标颜色' },
  'color-navigation-iteml1-bg-hover': { value: 'var(--cd-color-fill-0)', category: 'color', label: '一级项悬浮背景', usage: '导航栏一级菜单项悬浮态背景色' },
  'color-navigation-iteml1-bg-active': { value: 'var(--cd-color-fill-1)', category: 'color', label: '一级项按下背景', usage: '导航栏一级菜单项按下态背景色' },
  'color-navigation-iteml1-selected-bg-default': { value: 'var(--cd-color-primary-light-default)', category: 'color', label: '一级选中背景色', usage: '导航栏一级已选中菜单项背景色' },
  'color-navigation-iteml1-selected-text-default': { value: 'var(--cd-color-text-0)', category: 'color', label: '一级选中文字色', usage: '导航栏一级已选中菜单项文字颜色' },
  'color-navigation-iteml1-selected-icon-default': { value: 'var(--cd-color-primary)', category: 'color', label: '一级选中图标色', usage: '导航栏一级已选中菜单项图标颜色' },
  'color-navigation-iteml1-disabled-text-default': { value: 'var(--cd-color-disabled-text)', category: 'color', label: '一级禁用文字色', usage: '导航栏一级菜单项禁用态文字颜色' },

  'color-navigation-horizontal-iteml1-text-default': { value: 'var(--cd-color-text-2)', category: 'color', label: '水平一级文字色', usage: '水平导航栏一级菜单项文字颜色' },
  'color-navigation-horizontal-iteml1-text-hover': { value: 'var(--cd-color-text-1)', category: 'color', label: '水平一级悬浮文字', usage: '水平导航栏一级菜单项悬浮态文字颜色' },
  'color-navigation-horizontal-iteml1-selected-text-default': { value: 'var(--cd-color-text-0)', category: 'color', label: '水平一级选中文字', usage: '水平导航栏一级菜单项选中态文字颜色' },

  // —— Font ——
  'font-navigation-header-item-fontweight': { value: 'var(--cd-font-weight-bold)', category: 'font', label: 'header 标题字重', usage: '导航栏 header 标题字重' },

} satisfies TokenGroup;
