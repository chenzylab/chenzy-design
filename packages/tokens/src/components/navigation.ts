/**
 * Component tokens 分两部分：
 *
 * 1) Semi Navigation 全量对齐 —— 1:1 镜像 semi-foundation/navigation/variables.scss（120 变量），
 *    kebab 命名（`$xxx-navigation_yyy` → `xxx-navigation-yyy`），值 var() 引用我们的 alias / global
 *    token 或字面量。Menu / Nav 组件 token（menu.ts / nav.ts）转引这里作为主 token 源。
 *    Semi 的 `var(--semi-color-white)` 无对应 --cd-color-white alias，用最接近的
 *    --cd-color-text-inverse（= #ffffff）替代，未发明新 alias。
 *
 * 2) chenzy-design 既有 Breadcrumb / Pagination / Steps token（category=navigation，M3 导航族），
 *    由 Breadcrumb/Pagination/Steps 组件实际消费，保留并升级为 TokenDef 结构。
 *
 * Semi calc 忠实翻译：`$spacing-*` → `--cd-spacing-*`，字面量保留，
 * navigation 内部自引用改为引用同组 --cd-navigation-* token（build 前缀后名一致）。
 */
import type { TokenGroup } from './token-def.js';

export const navigationTokens = {
  // ============================================================
  // Semi Navigation 全量对齐（semi-foundation/navigation/variables.scss，120）
  // ============================================================

  // —— Size ——
  'height-navigation-item-base': { value: '36px', category: 'height', label: '侧边菜单项高度', usage: '侧边导航栏菜单项高度' },
  'width-navigation-container-base': { value: '240px', category: 'width', label: '展开宽度', usage: '侧边导航栏展开后宽度' },
  'width-navigation-container-collapsed': { value: '60px', category: 'width', label: '收起宽度', usage: '侧边导航栏收起后宽度' },
  'width-navigation-header-logo': { value: '36px', category: 'width', label: 'Logo 宽度', usage: '导航栏 logo 宽度' },
  'height-navigation-header-logo': { value: '36px', category: 'height', label: 'Logo 高度', usage: '导航栏 logo 高度' },
  'height-navigation-header-logo-collapsed': { value: '36px', category: 'height', label: '收起 Logo 尺寸', usage: '导航栏 Logo 收起后尺寸（高度/宽度）' },
  'height-navigation-footer': { value: '48px', category: 'height', label: 'footer 高度', usage: '侧边导航栏 footer 高度' },
  'height-navigation-horizontal-header': { value: '60px', category: 'height', label: '顶部导航高度', usage: '顶部导航栏高度' },
  'width-navigation-icon-text-between': { value: '12px', category: 'width', label: '图标标题间距', usage: '导航栏菜单项图标与标题间距' },
  'width-navigation-icon-left': { value: '20px', category: 'width', label: '图标左距', usage: '导航栏菜单项图标距左侧边距离' },
  'width-navigation-item-borderradius': { value: 'var(--cd-border-radius-small)', category: 'radius', label: '菜单项圆角', usage: '导航栏菜单项圆角' },
  'width-navigation-dropdown-item-nav-item-minwidth': { value: '150px', category: 'width', label: '下拉最小宽', usage: '导航栏菜单项下拉菜单最小宽度' },
  'width-navigation-border': { value: '1px', category: 'width', label: '描边宽度', usage: '导航栏描边宽度' },
  'width-navigation-footer-border': { value: '1px', category: 'width', label: 'footer 描边宽', usage: '导航栏 footer 描边宽度' },
  'width-navigation-icon-left-minwidth': { value: '20px', category: 'width', label: '左图标区最小宽', usage: '导航栏菜单项左侧图标区域最小宽度' },
  'width-navigation-outline': { value: '2px', category: 'width', label: 'outline 宽', usage: '导航栏聚焦 outline 宽度' },
  'width-navigation-outlineoffset': { value: '-2px', category: 'width', label: 'outline 偏移', usage: '导航栏聚焦 outline 偏移' },

  // —— Spacing ——
  'spacing-navigation-paddingx': { value: 'var(--cd-spacing-tight)', category: 'spacing', label: '侧边水平内边距', usage: '侧边导航栏水平方向内边距' },
  'spacing-navigation-collapsed-paddingx': { value: 'var(--cd-spacing-tight)', category: 'spacing', label: '收起水平内边距', usage: '侧边导航栏收起后水平方向内边距' },
  'spacing-navigation-item-paddingx': { value: 'var(--cd-spacing-base-tight)', category: 'spacing', label: '菜单项水平内边距', usage: '侧边导航栏菜单项水平方向内边距' },
  'spacing-navigation-item-paddingy': { value: 'var(--cd-spacing-tight)', category: 'spacing', label: '菜单项垂直内边距', usage: '侧边导航栏菜单项垂直方向内边距' },
  'spacing-navigation-item-marginbottom': { value: 'var(--cd-spacing-tight)', category: 'spacing', label: '菜单项下外边距', usage: '侧边导航栏菜单项底部外边距' },
  'spacing-navigation-sub-title-marginbottom': { value: '0', category: 'spacing', label: '子标题下外边距', usage: '侧边导航栏子级菜单项底部外边距' },
  'spacing-navigation-sub-wrap-margintop': { value: '0', category: 'spacing', label: '子组上外边距', usage: '侧边导航栏子级菜单组顶部外边距' },
  'spacing-navigation-sub-wrap-padding': { value: '0', category: 'spacing', label: '子组内边距', usage: '侧边导航栏子级菜单组内边距' },
  'spacing-navigation-sub-padding': { value: '0', category: 'spacing', label: '子组内边距', usage: '侧边导航栏子级菜单组内边距' },
  'spacing-navigation-item-sub-padding': { value: '0', category: 'spacing', label: '子菜单项内边距', usage: '侧边导航栏子级菜单项内边距' },
  'spacing-navigation-header-logo-marginleft': { value: '0', category: 'spacing', label: 'Logo 左外边距', usage: '侧边导航栏 Logo 左侧外边距' },
  'spacing-navigation-header-logo-marginright': { value: '8px', category: 'spacing', label: 'Logo 右外边距', usage: '侧边导航栏 Logo 右侧外边距' },
  'spacing-navigation-header-paddingtop': { value: '32px', category: 'spacing', label: 'header 上内边距', usage: '导航栏 header 顶部内边距' },
  'spacing-navigation-header-paddingbottom': { value: '36px', category: 'spacing', label: 'header 下内边距', usage: '导航栏 header 底部内边距' },
  'spacing-navigation-list-wrapper-paddingtop': { value: '12px', category: 'spacing', label: '列表上内边距', usage: '导航栏菜单项列表顶部内边距' },
  'spacing-navigation-footer-paddingx': { value: '24px', category: 'spacing', label: 'footer 水平内边距', usage: '导航栏 footer 水平方向内边距' },
  'spacing-navigation-footer-paddingy': { value: '16px', category: 'spacing', label: 'footer 垂直内边距', usage: '导航栏 footer 垂直方向内边距' },
  'spacing-navigation-footer-collapse-btn-inner-paddingx': { value: '8px', category: 'spacing', label: '收起按钮水平内边距', usage: '收起侧边栏按钮水平方向内边距' },
  'spacing-navigation-horizontal-header-logo-marginleft': { value: '24px', category: 'spacing', label: '顶部 Logo 左外边距', usage: '顶部导航栏 Logo 左侧外边距' },
  'spacing-navigation-horizontal-header-logo-marginright': { value: '24px', category: 'spacing', label: '顶部 Logo 右外边距', usage: '顶部导航栏 Logo 右侧外边距' },
  'spacing-navigation-horizontal-paddingleft': { value: '24px', category: 'spacing', label: '顶部左内边距', usage: '顶部导航栏左侧内边距' },
  'spacing-navigation-horizontal-paddingright': { value: '24px', category: 'spacing', label: '顶部右内边距', usage: '顶部导航栏右侧内边距' },
  'spacing-navigation-dropdown-item-nav-sub-title-paddingx': { value: 'var(--cd-spacing-base-tight)', category: 'spacing', label: '下拉标题水平内边距', usage: '导航栏下拉菜单标题水平方向内边距' },
  'spacing-navigation-dropdown-item-nav-sub-title-paddingy': { value: 'var(--cd-spacing-tight)', category: 'spacing', label: '下拉标题垂直内边距', usage: '导航栏下拉菜单标题垂直方向内边距' },
  'spacing-navigation-dropdown-item-nav-item-margintop': { value: '0', category: 'spacing', label: '下拉项上外边距', usage: '导航栏下拉菜单项顶部外边距' },
  'spacing-navigation-dropdown-item-nav-item-marginbottom': { value: '0', category: 'spacing', label: '下拉项下外边距', usage: '导航栏下拉菜单项底部外边距' },
  'spacing-navigation-vertical-nav-item-last-marginbottom': { value: '0', category: 'spacing', label: '侧边末项下外边距', usage: '侧边导航栏下拉最后一个菜单项底部外边距' },
  // Semi calc：(container_collapsed - collapsed_paddingX*2 - border - header_logo_collapsed) * 0.5
  'spacing-navigation-vertical-nav-header-paddingleft': { value: 'calc((var(--cd-width-navigation-container-collapsed) - var(--cd-spacing-navigation-collapsed-paddingx) * 2 - var(--cd-width-navigation-border) - var(--cd-height-navigation-header-logo-collapsed)) * 0.5)', category: 'spacing', label: 'header 左内边距', usage: '侧边导航栏 header 左侧内边距' },
  'spacing-navigation-vertical-nav-header-paddingright': { value: 'var(--cd-spacing-tight)', category: 'spacing', label: 'header 右内边距', usage: '侧边导航栏 header 右侧内边距' },
  'spacing-navigation-vertical-nav-header-collapsed-paddingleft': { value: 'calc((var(--cd-width-navigation-container-collapsed) - var(--cd-spacing-navigation-collapsed-paddingx) * 2 - var(--cd-width-navigation-border) - var(--cd-height-navigation-header-logo-collapsed)) * 0.5)', category: 'spacing', label: '收起 header 左内边距', usage: '侧边导航栏收起后 header 左侧内边距' },
  'spacing-navigation-vertical-nav-header-collapsed-paddingright': { value: '0', category: 'spacing', label: '收起 header 右内边距', usage: '侧边导航栏收起后 header 右侧内边距' },
  'spacing-navigation-vertical-footer-paddingleft': { value: 'var(--cd-spacing-tight)', category: 'spacing', label: 'footer 左内边距', usage: '侧边导航栏 footer 左侧内边距' },
  'spacing-navigation-vertical-footer-paddingright': { value: 'var(--cd-spacing-tight)', category: 'spacing', label: 'footer 右内边距', usage: '侧边导航栏 footer 右侧内边距' },
  'spacing-navigation-vertical-footer-semi-button-content-right-marginleft': { value: '12px', category: 'spacing', label: '收起按钮标题左外边距', usage: '收起侧边栏按钮标题左侧外边距' },
  'spacing-navigation-horizontal-nav-list-item-marginbottom': { value: '0', category: 'spacing', label: '顶部列表项下外边距', usage: '顶部导航栏列表项底部外边距' },
  'spacing-navigation-horizontal-nav-list-item-not-last-marginright': { value: 'var(--cd-spacing-tight)', category: 'spacing', label: '顶部项右外边距', usage: '顶部导航栏菜单项右侧外边距（非末位）' },
  'spacing-navigation-horizontal-icon-first-marginright': { value: 'var(--cd-spacing-tight)', category: 'spacing', label: '顶部首图标右外边距', usage: '顶部导航栏菜单项首位图标右侧外边距' },
  'spacing-navigation-horizontal-icon-last-marginleft': { value: 'var(--cd-spacing-tight)', category: 'spacing', label: '顶部末图标左外边距', usage: '顶部导航栏菜单项末位图标左侧外边距' },
  'spacing-navigation-sub-item-first-child-margintop': { value: 'var(--cd-spacing-tight)', category: 'spacing', label: '子首项上外边距', usage: '顶部导航栏子级首位菜单项顶部外边距' },
  'spacing-navigation-sub-item-left-toggle-marginright': { value: 'var(--cd-spacing-tight)', category: 'spacing', label: '子项左箭头右外边距', usage: '顶部导航栏菜单项末位图标右侧外边距' },

  // —— Color ——
  'color-navigation-bg-default': { value: 'var(--cd-color-nav-bg)', category: 'color', label: '导航背景色', usage: '导航栏背景色' },
  'color-navigation-border-default': { value: 'var(--cd-color-border)', category: 'color', label: '分割线色', usage: '导航栏分割线色' },
  'color-navigation-header-text-default': { value: 'var(--cd-color-text-0)', category: 'color', label: 'header 文字色', usage: '导航栏 header 文字颜色' },
  'color-navigation-footer-icon-default': { value: 'var(--cd-color-text-1)', category: 'color', label: 'footer 图标色', usage: '导航栏 footer 图标颜色' },
  'color-navigation-iteml1-bg-default': { value: 'transparent', category: 'color', label: '一级项背景色', usage: '导航栏一级菜单项背景色' },
  'color-navigation-iteml1-text-default': { value: 'var(--cd-color-text-0)', category: 'color', label: '一级项文字色', usage: '导航栏一级菜单项文字颜色' },
  'color-navigation-iteml1-icon-default': { value: 'var(--cd-color-text-2)', category: 'color', label: '一级项图标色', usage: '导航栏一级菜单项图标颜色' },
  'color-navigation-iteml1-bg-hover': { value: 'var(--cd-color-fill-0)', category: 'color', label: '一级项悬浮背景', usage: '导航栏一级菜单项悬浮态背景色' },
  'color-navigation-iteml1-text-hover': { value: 'var(--cd-color-text-0)', category: 'color', label: '一级项悬浮文字', usage: '导航栏一级菜单项悬浮态文字颜色' },
  'color-navigation-iteml1-icon-hover': { value: 'var(--cd-color-text-2)', category: 'color', label: '一级项悬浮图标', usage: '导航栏一级菜单项悬浮态图标颜色' },
  'color-navigation-iteml1-selected-text-hover': { value: 'var(--cd-color-text-0)', category: 'color', label: '一级选中悬浮文字', usage: '导航栏一级已选中菜单项悬浮态文字颜色' },
  'color-navigation-iteml1-bg-active': { value: 'var(--cd-color-fill-1)', category: 'color', label: '一级项按下背景', usage: '导航栏一级菜单项按下态背景色' },
  'color-navigation-iteml1-text-active': { value: 'var(--cd-color-text-0)', category: 'color', label: '一级项按下文字', usage: '导航栏一级菜单项按下态文字颜色' },
  'color-navigation-iteml1-icon-active': { value: 'var(--cd-color-text-2)', category: 'color', label: '一级项按下图标', usage: '导航栏一级菜单项按下态图标颜色' },
  'color-navigation-iteml1-selected-text-active': { value: 'var(--cd-color-text-0)', category: 'color', label: '一级选中按下文字', usage: '导航栏一级已选中菜单项按下态文字颜色' },
  'color-navigation-iteml1-selected-bg-default': { value: 'var(--cd-color-primary-light-default)', category: 'color', label: '一级选中背景色', usage: '导航栏一级已选中菜单项背景色' },
  'color-navigation-iteml1-selected-text-default': { value: 'var(--cd-color-text-0)', category: 'color', label: '一级选中文字色', usage: '导航栏一级已选中菜单项文字颜色' },
  'color-navigation-iteml1-selected-icon-default': { value: 'var(--cd-color-primary)', category: 'color', label: '一级选中图标色', usage: '导航栏一级已选中菜单项图标颜色' },
  'color-navigation-iteml1-disabled-bg-default': { value: 'transparent', category: 'color', label: '一级禁用背景色', usage: '导航栏一级菜单项禁用态背景色' },
  'color-navigation-iteml1-disabled-text-default': { value: 'var(--cd-color-disabled-text)', category: 'color', label: '一级禁用文字色', usage: '导航栏一级菜单项禁用态文字颜色' },
  'color-navigation-iteml1-disabled-icon-default': { value: 'var(--cd-color-disabled-text)', category: 'color', label: '一级禁用图标色', usage: '导航栏一级菜单项禁用态图标颜色' },
  'color-navigation-iteml1-selected-disabled-bg-default': { value: 'transparent', category: 'color', label: '一级选中禁用背景', usage: '导航栏一级已选中菜单项禁用态背景色' },
  'color-navigation-iteml1-selected-disabled-text-default': { value: 'var(--cd-color-primary-disabled)', category: 'color', label: '一级选中禁用文字', usage: '导航栏一级已选中菜单项禁用态文字颜色' },
  'color-navigation-iteml1-selected-disabled-icon-default': { value: 'var(--cd-color-primary-disabled)', category: 'color', label: '一级选中禁用图标', usage: '导航栏一级已选中菜单项禁用态图标颜色' },

  'color-navigation-horizontal-iteml1-text-default': { value: 'var(--cd-color-text-2)', category: 'color', label: '水平一级文字色', usage: '水平导航栏一级菜单项文字颜色' },
  'color-navigation-horizontal-iteml1-icon-default': { value: 'var(--cd-color-text-2)', category: 'color', label: '水平一级图标色', usage: '水平导航栏一级菜单项图标颜色' },
  'color-navigation-horizontal-iteml1-bg-default': { value: 'transparent', category: 'color', label: '水平一级背景色', usage: '水平导航栏一级菜单项背景颜色' },
  'color-navigation-horizontal-iteml1-text-hover': { value: 'var(--cd-color-text-1)', category: 'color', label: '水平一级悬浮文字', usage: '水平导航栏一级菜单项悬浮态文字颜色' },
  'color-navigation-horizontal-iteml1-icon-hover': { value: 'var(--cd-color-text-1)', category: 'color', label: '水平一级悬浮图标', usage: '水平导航栏一级菜单项悬浮态图标颜色' },
  'color-navigation-horizontal-iteml1-bg-hover': { value: 'transparent', category: 'color', label: '水平一级悬浮背景', usage: '水平导航栏一级菜单项悬浮态背景颜色' },
  'color-navigation-horizontal-iteml1-text-active': { value: 'var(--cd-color-text-0)', category: 'color', label: '水平一级按下文字', usage: '水平导航栏一级菜单项按下态文字颜色' },
  'color-navigation-horizontal-iteml1-icon-active': { value: 'var(--cd-color-text-0)', category: 'color', label: '水平一级按下图标', usage: '水平导航栏一级菜单项按下态图标颜色' },
  'color-navigation-horizontal-iteml1-bg-active': { value: 'transparent', category: 'color', label: '水平一级按下背景', usage: '水平导航栏一级菜单项按下态背景颜色' },
  'color-navigation-horizontal-iteml1-selected-text-default': { value: 'var(--cd-color-text-0)', category: 'color', label: '水平一级选中文字', usage: '水平导航栏一级菜单项选中态文字颜色' },
  'color-navigation-horizontal-iteml1-selected-icon-default': { value: 'var(--cd-color-text-0)', category: 'color', label: '水平一级选中图标', usage: '水平导航栏一级菜单项选中态图标颜色' },
  'color-navigation-horizontal-iteml1-selected-bg-default': { value: 'transparent', category: 'color', label: '水平一级选中背景', usage: '水平导航栏一级菜单项选中态背景颜色' },
  'color-navigation-horizontal-iteml1-disabled-text-default': { value: 'var(--cd-color-disabled-text)', category: 'color', label: '水平一级禁用文字', usage: '水平导航栏一级菜单项禁用态文字颜色' },
  'color-navigation-horizontal-iteml1-disabled-icon-default': { value: 'var(--cd-color-disabled-text)', category: 'color', label: '水平一级禁用图标', usage: '水平导航栏一级菜单项禁用态图标颜色' },
  'color-navigation-horizontal-iteml1-disabled-bg-default': { value: 'transparent', category: 'color', label: '水平一级禁用背景', usage: '水平导航栏一级菜单项禁用态背景颜色' },

  'color-navigation-itemln-bg-default': { value: 'transparent', category: 'color', label: '子级项背景色', usage: '导航栏子级菜单项背景颜色' },
  'color-navigation-itemln-text-default': { value: 'var(--cd-color-text-0)', category: 'color', label: '子级项文字色', usage: '导航栏子级菜单项文字颜色' },
  'color-navigation-itemln-bg-hover': { value: 'var(--cd-color-fill-0)', category: 'color', label: '子级悬浮背景', usage: '导航栏子级菜单项悬浮态背景颜色' },
  'color-navigation-itemln-text-hover': { value: 'var(--cd-color-text-0)', category: 'color', label: '子级悬浮文字', usage: '导航栏子级菜单项悬浮态文字颜色' },
  'color-navigation-itemln-bg-active': { value: 'var(--cd-color-fill-1)', category: 'color', label: '子级按下背景', usage: '导航栏子级菜单项按下态背景颜色' },
  'color-navigation-itemln-text-active': { value: 'var(--cd-color-text-0)', category: 'color', label: '子级按下文字', usage: '导航栏子级菜单项按下态文字颜色' },
  'color-navigation-itemln-selected-bg-default': { value: 'var(--cd-color-primary-light-default)', category: 'color', label: '子级选中背景', usage: '导航栏子级菜单项选中态背景颜色' },
  'color-navigation-outline-focus': { value: 'var(--cd-color-primary-light-active)', category: 'color', label: '键盘聚焦色', usage: '导航栏子级菜单键盘聚焦颜色' },

  // —— Transition ——
  'motion-navigation-item-title': { value: 'opacity 100ms 100s ease-out', category: 'animation', label: '标题渐隐动画', usage: '导航栏菜单项标题收起时渐隐动画' },
  'motion-navigation-padding': { value: 'padding-left 100ms ease-out', category: 'animation', label: '收起左内边距动画', usage: '侧边导航栏收起左侧内边距动画' },
  'motion-navigation-padding-rtl': { value: 'padding-right 100ms ease-out', category: 'animation', label: '收起右内边距动画', usage: '侧边导航栏收起右侧内边距(rtl)动画' },
  'motion-navigation-width': { value: 'width 200ms cubic-bezier(.62, .05, .36, .95)', category: 'animation', label: '收起宽度动画', usage: '侧边导航栏收起宽度动画' },
  'motion-navigation-collapsed-opacity': { value: 'opacity .2s cubic-bezier(.5, -.1, 1, .4)', category: 'animation', label: '收起渐隐动画', usage: '侧边导航栏收起渐隐动画' },

  // —— Font ——
  'font-navigation-item-fontweight': { value: 'var(--cd-font-weight-bold)', category: 'font', label: '菜单项字重', usage: '导航栏菜单项标题字重' },
  'font-navigation-sub-title-fontweight': { value: 'var(--cd-font-weight-bold)', category: 'font', label: '副标题字重', usage: '导航栏菜单项副标题字重' },
  'font-navigation-item-normal-fontweight': { value: 'var(--cd-font-weight-regular)', category: 'font', label: '子级项字重', usage: '导航栏子级菜单项标题字重' },
  'font-navigation-popover-nav-item-selected-fontweight': { value: 'normal', category: 'font', label: '浮层选中字重', usage: '导航栏子级菜单项标题选中态字重' },
  'font-navigation-sub-selected-fontweight': { value: 'var(--cd-font-weight-bold)', category: 'font', label: '选中标题字重', usage: '导航栏菜单项标题选中态字重' },
  'font-navigation-sub-disabled-fontweight': { value: 'var(--cd-font-weight-bold)', category: 'font', label: '禁用标题字重', usage: '导航栏菜单项标题禁用态字重' },
  'font-navigation-sub-fontweight': { value: 'var(--cd-font-weight-regular)', category: 'font', label: '子级标题字重', usage: '导航栏子级菜单项标题字重' },
  'font-navigation-sub-fontsize': { value: 'var(--cd-font-size-regular)', category: 'font', label: '子级标题字号', usage: '导航栏子级菜单项标题字体大小' },
  'font-navigation-sub-item-fontweight': { value: 'var(--cd-font-weight-regular)', category: 'font', label: '子级项标题字重', usage: '导航栏子级菜单项标题字重' },
  'font-navigation-header-item-fontweight': { value: 'var(--cd-font-weight-bold)', category: 'font', label: 'header 标题字重', usage: '导航栏 header 标题字重' },

  // ============================================================
  // chenzy-design Breadcrumb / Pagination / Steps（M3 导航族，组件消费）
  // ============================================================

  // —— Breadcrumb ——
  'breadcrumb-color': { value: 'var(--cd-color-text-2)', category: 'color', label: '面包屑文字色', usage: '面包屑普通项文字颜色' },
  'breadcrumb-color-active': { value: 'var(--cd-color-text-0)', category: 'color', label: '面包屑当前项色', usage: '面包屑当前项文字颜色' },
  'breadcrumb-color-link': { value: 'var(--cd-color-primary)', category: 'color', label: '面包屑链接色', usage: '面包屑链接文字颜色' },
  'breadcrumb-active-weight': { value: 'var(--cd-font-weight-bold)', category: 'font', label: '当前项字重', usage: '对齐 Semi 当前项字重 bold' },
  'breadcrumb-separator-color': { value: 'var(--cd-color-text-2)', category: 'color', label: '分割符色', usage: '对齐 Semi 分割符 text-2（原 text-3）' },
  'breadcrumb-gap': { value: 'var(--cd-spacing-tight)', category: 'spacing', label: '面包屑间距', usage: '面包屑项间距' },
  'breadcrumb-font-size': { value: 'var(--cd-font-size-regular)', category: 'font', label: '面包屑字号', usage: '面包屑文字大小' },

  // —— Pagination（对齐 Semi：选中态浅蓝底蓝字、无边框） ——
  'pagination-item-size': { value: '32px', category: 'width', label: '页码尺寸', usage: '页码按钮边长' },
  'pagination-item-radius': { value: 'var(--cd-border-radius-small)', category: 'radius', label: '页码圆角', usage: '对齐 Semi 页码圆角（small 3px）' },
  'pagination-item-border': { value: 'transparent', category: 'color', label: '页码边框', usage: '对齐 Semi 页码无边框（原 color-border）' },
  'pagination-item-bg-active': { value: 'var(--cd-color-primary-light-default)', category: 'color', label: '选中背景', usage: '对齐 Semi 选中背景浅蓝（原 primary 实底）' },
  'pagination-item-color-active': { value: 'var(--cd-color-primary)', category: 'color', label: '选中文字', usage: '对齐 Semi 选中文字蓝（原 text-inverse 白）' },
  'pagination-item-bg-hover': { value: 'var(--cd-color-fill-0)', category: 'color', label: '悬浮背景', usage: '页码悬浮背景颜色' },
  'pagination-gap': { value: 'var(--cd-spacing-tight)', category: 'spacing', label: '页码间距', usage: '页码项间距' },

  // —— Steps ——
  'steps-icon-size': { value: '28px', category: 'width', label: '步骤图标尺寸', usage: '步骤图标边长' },
  'steps-icon-bg': { value: 'var(--cd-color-text-2)', category: 'color', label: '未到达图标背景', usage: '对齐 Semi 未到达图标背景 text-2（原 fill-1）' },
  'steps-icon-bg-process': { value: 'var(--cd-color-primary)', category: 'color', label: '进行中图标背景', usage: '进行中步骤图标背景颜色' },
  'steps-icon-bg-finish': { value: 'var(--cd-color-primary)', category: 'color', label: '完成图标背景', usage: '已完成步骤图标背景颜色' },
  'steps-icon-bg-error': { value: 'var(--cd-color-danger)', category: 'color', label: '错误图标背景', usage: '错误步骤图标背景颜色' },
  'steps-icon-color': { value: 'var(--cd-color-text-inverse)', category: 'color', label: '图标文本色', usage: '对齐 Semi 图标文本 white（未到达底色 text-2 上用白字）' },
  'steps-icon-color-active': { value: 'var(--cd-color-text-inverse)', category: 'color', label: '激活图标文本色', usage: '激活步骤图标文本颜色' },
  'steps-title-color': { value: 'var(--cd-color-text-0)', category: 'color', label: '标题文字色', usage: '步骤标题文字颜色' },
  'steps-desc-color': { value: 'var(--cd-color-text-2)', category: 'color', label: '描述文字色', usage: '步骤描述文字颜色' },
  'steps-line-color': { value: 'var(--cd-color-fill-2)', category: 'color', label: '未完成连接线', usage: '对齐 Semi 未完成连接线 fill-2（原 border）' },
  'steps-line-color-finish': { value: 'var(--cd-color-primary)', category: 'color', label: '已完成连接线', usage: '已完成步骤连接线颜色' },
} satisfies TokenGroup;
