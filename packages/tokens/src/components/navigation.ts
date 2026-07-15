/**
 * Navigation 主 token 源：命名镜像 semi-foundation/navigation/variables.scss（kebab：
 * `$xxx-navigation_yyy` → `xxx-navigation-yyy`），由 Navigation 组件消费。
 *
 * 目标：1:1 全量对齐 Semi navigation/variables.scss（名与值逐一镜像，无中间变量）。
 * 当前为过渡态——旧 Menu 组件已删除，Navigation 组件待新建；期间 token 保留不作孤儿清理。
 * 值 var() 引用我们的 alias / global token 或字面量。
 */
import type { TokenGroup } from './token-def.js';

export const navigationTokens = {
  // ============================================================
  // Navigation 主 token（命名对齐 Semi navigation/variables.scss）
  // ============================================================

  // —— Size ——
  'height-navigation-item-base': { value: '36px', category: 'height', label: '侧边菜单项高度', usage: '侧边导航栏菜单项高度' },
  'height-navigation-horizontal-header': { value: '60px', category: 'height', label: '顶部导航高度', usage: '顶部导航栏高度' },
  'height-navigation-footer': { value: '48px', category: 'height', label: 'footer 高度', usage: '侧边导航栏 footer 高度' },
  'width-navigation-container-base': { value: '240px', category: 'width', label: '侧边展开宽度', usage: '侧边导航栏展开后宽度' },
  'width-navigation-container-collapsed': { value: '60px', category: 'width', label: '侧边折叠宽度', usage: '侧边导航栏收起后宽度' },
  'width-navigation-border': { value: '1px', category: 'width', label: '描边宽度', usage: '导航栏描边宽度' },
  'width-navigation-icon-text-between': { value: '12px', category: 'width', label: '图标文案间距', usage: '导航栏菜单项图标与标题间距' },
  'width-navigation-icon-left-minwidth': { value: '20px', category: 'width', label: '左图标区最小宽', usage: '导航栏菜单项左侧图标区域最小宽度' },
  'width-navigation-dropdown-item-nav-item-minwidth': { value: '150px', category: 'width', label: '浮层项最小宽', usage: '导航栏菜单项下拉菜单最小宽度' },
  'width-navigation-outline': { value: '2px', category: 'width', label: '聚焦描边宽', usage: '导航栏聚焦 outline 宽度' },
  'width-navigation-outlineoffset': { value: '-2px', category: 'width', label: '聚焦描边偏移', usage: '导航栏聚焦 outline 偏移' },
  'width-navigation-item-borderradius': { value: 'var(--cd-border-radius-small)', category: 'radius', label: '菜单项圆角', usage: '导航栏菜单项圆角' },
  'font-size-navigation-header-text': { value: 'var(--cd-font-size-header-5)', category: 'font', label: 'header 字号', usage: '导航栏 header 标题字号（对齐 Semi @include font-size-header-5）' },

  // —— Spacing ——
  'spacing-navigation-paddingx': { value: 'var(--cd-spacing-tight)', category: 'spacing', label: '容器水平内边距', usage: '侧边导航栏水平方向内边距' },
  'spacing-navigation-collapsed-paddingx': { value: 'var(--cd-spacing-tight)', category: 'spacing', label: '折叠容器水平内边距', usage: '侧边导航栏收起后水平方向内边距' },
  'spacing-navigation-item-paddingx': { value: 'var(--cd-spacing-base-tight)', category: 'spacing', label: '菜单项水平内边距', usage: '侧边导航栏菜单项水平方向内边距' },
  'spacing-navigation-item-paddingy': { value: 'var(--cd-spacing-tight)', category: 'spacing', label: '菜单项垂直内边距', usage: '侧边导航栏菜单项垂直方向内边距' },
  'spacing-navigation-item-marginbottom': { value: 'var(--cd-spacing-tight)', category: 'spacing', label: '菜单项底外边距', usage: '侧边导航栏菜单项底部外边距' },
  'spacing-navigation-list-wrapper-paddingtop': { value: '12px', category: 'spacing', label: '列表顶内边距', usage: '导航栏菜单项列表顶部内边距' },
  'spacing-navigation-header-logo-marginright': { value: '8px', category: 'spacing', label: 'Logo 右外边距', usage: '侧边导航栏 Logo 右侧外边距' },
  'spacing-navigation-horizontal-paddingleft': { value: '24px', category: 'spacing', label: '顶部左内边距', usage: '顶部导航栏左侧内边距' },
  'spacing-navigation-footer-paddingx': { value: '24px', category: 'spacing', label: 'footer 水平内边距', usage: '导航栏 footer 水平方向内边距（对齐 Semi 24px）' },
  'spacing-navigation-footer-paddingy': { value: '16px', category: 'spacing', label: 'footer 垂直内边距', usage: '导航栏 footer 垂直方向内边距（对齐 Semi 16px）' },
  'spacing-navigation-vertical-footer-collapse-text-marginleft': { value: '12px', category: 'spacing', label: '收起按钮文案左边距', usage: '收起侧边栏按钮标题左侧外边距（对齐 Semi 12px）' },

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
  'color-navigation-outline-focus': { value: 'var(--cd-color-primary-light-active)', category: 'color', label: '聚焦描边色', usage: '导航栏菜单键盘聚焦颜色' },

  'color-navigation-horizontal-iteml1-text-default': { value: 'var(--cd-color-text-2)', category: 'color', label: '水平一级文字色', usage: '水平导航栏一级菜单项文字颜色' },
  'color-navigation-horizontal-iteml1-text-hover': { value: 'var(--cd-color-text-1)', category: 'color', label: '水平一级悬浮文字', usage: '水平导航栏一级菜单项悬浮态文字颜色' },
  'color-navigation-horizontal-iteml1-selected-text-default': { value: 'var(--cd-color-text-0)', category: 'color', label: '水平一级选中文字', usage: '水平导航栏一级菜单项选中态文字颜色' },

  // —— Font ——
  'font-navigation-header-item-fontweight': { value: 'var(--cd-font-weight-bold)', category: 'font', label: 'header 标题字重', usage: '导航栏 header 标题字重' },

} satisfies TokenGroup;
