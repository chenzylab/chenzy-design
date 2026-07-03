/**
 * Component tokens for Nav。See specs/components/navigation/Nav.spec.md。
 * Nav 内部委托 Menu 渲染，是 navigation.ts（Semi navigation/variables.scss 全量对齐）的消费方：
 * 值尽量转引 --cd-navigation-* 主 token，保留组件实际消费的老 token 名。
 */
import type { TokenGroup } from './token-def.js';

export const navTokens = {
  // 背景透明：容器背景由内部 Menu（menu-bg = navigation-bg-default）提供，避免双层底色
  'nav-bg': { value: 'transparent', category: 'color', label: '导航背景', usage: '导航根容器背景（透明，底色由内部 Menu 提供）' },
  'nav-color': { value: 'inherit', category: 'color', label: '导航文字色', usage: '导航根容器继承文字色' },
  'nav-horizontal-height': { value: 'var(--cd-height-navigation-horizontal-header)', category: 'height', label: '顶部导航高度', usage: '顶部导航栏高度（转引 navigation-horizontal-header = 60px）' },
  'nav-header-height': { value: 'var(--cd-height-navigation-horizontal-header)', category: 'height', label: '头部高度', usage: '导航头部高度（转引 navigation-horizontal-header = 60px）' },
  'nav-header-padding-x': { value: 'var(--cd-spacing-navigation-horizontal-paddingleft)', category: 'spacing', label: '头部水平内边距', usage: '导航头部水平内边距（转引 navigation-horizontal-paddingLeft = 24px）' },
  'nav-header-gap': { value: 'var(--cd-spacing-navigation-header-logo-marginright)', category: 'spacing', label: '头部间距', usage: 'Logo 与标题间距（转引 navigation-header-logo-marginRight = 8px）' },
  'nav-header-text-size': { value: 'var(--cd-font-size-header-6)', category: 'font', label: '头部字号', usage: '导航头部标题字号' },
  'nav-header-text-color': { value: 'var(--cd-color-navigation-header-text-default)', category: 'color', label: '头部文字色', usage: '导航头部文字颜色（转引 navigation-header-text-default = text-0）' },
  'nav-header-text-weight': { value: 'var(--cd-font-navigation-header-item-fontweight)', category: 'font', label: '头部字重', usage: '导航头部标题字重（转引 navigation-header-item-fontWeight = bold）' },
  'nav-footer-padding': { value: 'var(--cd-spacing-navigation-vertical-footer-paddingleft)', category: 'spacing', label: 'footer 内边距', usage: 'footer 内边距（转引 navigation-vertical-footer-paddingLeft = tight）' },
  'nav-footer-border': { value: 'var(--cd-color-navigation-border-default)', category: 'color', label: 'footer 分割线', usage: 'footer 分割线颜色（转引 navigation-border-default）' },
  'nav-collapse-btn-height': { value: 'var(--cd-height-navigation-item-base)', category: 'height', label: '收起按钮高度', usage: '收起按钮高度（转引 navigation-item-base = 36px）' },
  'nav-collapse-btn-radius': { value: 'var(--cd-width-navigation-item-borderradius)', category: 'radius', label: '收起按钮圆角', usage: '收起按钮圆角（转引 navigation-item-borderRadius = radius-small）' },
  // 对齐 Semi navigation footer-icon-default（text-1；原 text-2，视觉略深）
  'nav-collapse-btn-color': { value: 'var(--cd-color-navigation-footer-icon-default)', category: 'color', label: '收起按钮色', usage: '收起按钮图标颜色（转引 navigation-footer-icon-default = text-1）' },
  'nav-collapse-btn-hover-bg': { value: 'var(--cd-color-navigation-iteml1-bg-active)', category: 'color', label: '收起按钮悬浮背景', usage: '收起按钮悬浮背景（转引 navigation itemL1-bg-active = fill-1）' },
} satisfies TokenGroup;
