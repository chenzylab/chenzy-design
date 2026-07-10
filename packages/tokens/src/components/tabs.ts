/**
 * Component tokens for Tabs（+ Dropdown 遗留段）。
 *
 * 值全量对齐 Semi Design（semi-foundation/tabs/variables.scss，121 变量）；
 * key 采用组件实际消费的简化命名（Tabs.svelte 逐一引用），去掉 Semi 命名里的冗余段
 * （如标示线 token 名带 `icon`、`line_default` 里的 default），令名值一一对应、可逐条核对。
 * 组件未消费的 Semi 中间变量一律不引入（无向后兼容包袱）。
 *
 * 值映射：`var(--semi-color-*)` → `var(--cd-color-*)`；`$spacing-*` → `var(--cd-spacing-*)`；
 * `var(--semi-border-radius-*)` → `var(--cd-border-radius-*)`；`$font-weight/size-*` → `var(--cd-font-*)`；
 * calc/减法忠实翻译（`$spacing-base - 2px` → `calc(var(--cd-spacing-base) - 2px)`）。
 *
 * size 三档全量对齐 Semi：small / medium / large（默认 large）。`-small-`/`-medium-` 段为对应档，
 * 无尺寸后缀（如 `-paddingtop`）即 large 档。
 *
 * 末尾保留 Dropdown 组件消费的遗留 token（Semi 无对应，tabs.ts 历史承载，保持不破坏消费）。
 */
import type { TokenGroup } from './token-def.js';

export const tabsTokens = {
  // ======== 页签聚合字体（组件层：line/card/button 共用的字号/字重）========
  'font-tabs-tab-fontsize': { value: 'var(--cd-font-size-regular)', category: 'font', label: '页签字号', usage: '页签文本字号' },
  'font-tabs-tab-fontweight': { value: 'var(--cd-font-weight-regular)', category: 'font', label: '页签字重', usage: '页签文本字重 - 默认' },
  'font-tabs-tab-active-fontweight': { value: 'var(--cd-font-weight-bold)', category: 'font', label: '页签选中字重', usage: '页签文本字重 - 选中' },

  // ======== line 线条式：颜色 ========
  'color-tabs-tab-line-text-default': { value: 'var(--cd-color-text-2)', category: 'color', label: '线条式文本色', usage: '线条式页签文本颜色 - 默认' },
  'color-tabs-tab-line-text-hover': { value: 'var(--cd-color-text-0)', category: 'color', label: '线条式文本色', usage: '线条式页签文本颜色 - 悬浮' },
  'color-tabs-tab-line-text-active': { value: 'var(--cd-color-text-0)', category: 'color', label: '线条式文本色', usage: '线条式页签文本颜色 - 按下' },
  'color-tabs-tab-line-selected-text-default': { value: 'var(--cd-color-text-0)', category: 'color', label: '线条式选中文本色', usage: '线条式页签文本颜色 - 选中' },
  'color-tabs-tab-line-border-default': { value: 'var(--cd-color-border)', category: 'color', label: '线条式轨道色', usage: '线条式页签底部轨道颜色 - 默认' },
  'color-tabs-tab-line-border-hover': { value: 'var(--cd-color-fill-0)', category: 'color', label: '线条式标示线色', usage: '线条式页签标示线颜色 - 悬浮' },
  'color-tabs-tab-line-border-active': { value: 'var(--cd-color-fill-1)', category: 'color', label: '线条式标示线色', usage: '线条式页签标示线颜色 - 按下' },
  'color-tabs-tab-line-selected-indicator-default': { value: 'var(--cd-color-primary)', category: 'color', label: '线条式选中标示线色', usage: '线条式页签标示线颜色 - 选中' },
  'color-tabs-tab-line-disabled-text-default': { value: 'var(--cd-color-disabled-text)', category: 'color', label: '线条式禁用文本色', usage: '禁用线条式页签文本颜色' },
  // line 垂直态
  'color-tabs-tab-line-vertical-bg-hover': { value: 'var(--cd-color-fill-0)', category: 'color', label: '垂直线条式悬浮背景色', usage: '垂直线条式页签背景颜色 - 悬浮' },
  'color-tabs-tab-line-vertical-bg-active': { value: 'var(--cd-color-fill-1)', category: 'color', label: '垂直线条式按下背景色', usage: '垂直线条式页签背景颜色 - 按下' },
  'color-tabs-tab-line-vertical-selected-bg-default': { value: 'var(--cd-color-primary-light-default)', category: 'color', label: '垂直线条式选中背景色', usage: '垂直线条式页签背景颜色 - 选中' },

  // ======== card 卡片式：颜色 ========
  'color-tabs-tab-card-border-default': { value: 'var(--cd-color-border)', category: 'color', label: '卡片式轨道色', usage: '卡片式页签容器底部长线颜色 - 默认' },
  'color-tabs-tab-card-bg-hover': { value: 'var(--cd-color-fill-0)', category: 'color', label: '卡片式悬浮背景色', usage: '卡片式页签背景颜色 - 悬浮' },
  'color-tabs-tab-card-bg-active': { value: 'var(--cd-color-fill-1)', category: 'color', label: '卡片式按下背景色', usage: '卡片式页签背景颜色 - 按下' },
  'color-tabs-tab-card-selected-bg-default': { value: 'var(--cd-color-bg-1)', category: 'color', label: '卡片式选中背景色', usage: '卡片式页签背景颜色 - 选中' },
  'color-tabs-tab-card-selected-indicator-default': { value: 'var(--cd-color-border)', category: 'color', label: '卡片式选中描边色', usage: '卡片式页签选中页签描边' },

  // ======== button 按钮式：颜色 ========
  'color-tabs-tab-button-text-default': { value: 'var(--cd-color-text-2)', category: 'color', label: '按钮式文本色', usage: '按钮式页签文本颜色 - 默认' },
  'color-tabs-tab-button-bg-hover': { value: 'var(--cd-color-fill-0)', category: 'color', label: '按钮式悬浮背景色', usage: '按钮式页签背景颜色 - 悬浮' },
  'color-tabs-tab-button-bg-active': { value: 'var(--cd-color-fill-1)', category: 'color', label: '按钮式按下背景色', usage: '按钮式页签背景颜色 - 按下' },
  'color-tabs-tab-button-selected-bg-default': { value: 'var(--cd-color-primary-light-default)', category: 'color', label: '按钮式选中背景色', usage: '按钮式页签背景颜色 - 选中' },
  'color-tabs-tab-button-selected-text-default': { value: 'var(--cd-color-primary)', category: 'color', label: '按钮式选中文本色', usage: '按钮式页签文本颜色 - 选中' },

  // ======== 图标 ========
  'color-tabs-tab-icon-default': { value: 'var(--cd-color-text-2)', category: 'color', label: '图标色', usage: '页签图标颜色 - 默认' },
  'color-tabs-tab-icon-hover': { value: 'var(--cd-color-text-0)', category: 'color', label: '图标色', usage: '页签图标颜色 - 悬浮' },
  'color-tabs-tab-icon-active': { value: 'var(--cd-color-text-0)', category: 'color', label: '图标色', usage: '页签图标颜色 - 按下' },
  'color-tabs-tab-selected-icon-default': { value: 'var(--cd-color-primary)', category: 'color', label: '选中图标色', usage: '页签图标颜色 - 选中' },

  // ======== 内容区 / 滚动折叠箭头 / 斜线 ========
  'color-tabs-tab-pane-text-default': { value: 'var(--cd-color-text-0)', category: 'color', label: '内容文本色', usage: '标签页内容文本颜色 - 默认' },
  'color-tabs-tab-pane-arrow-text-default': { value: 'var(--cd-color-primary)', category: 'color', label: '折叠箭头色', usage: '滚动折叠箭头颜色 - 默认' },
  'color-tabs-tab-pane-arrow-bg-hover': { value: 'var(--cd-color-fill-0)', category: 'color', label: '折叠箭头背景色', usage: '滚动折叠箭头背景色 - 悬浮' },
  'color-tabs-tab-pane-arrow-bg-active': { value: 'var(--cd-color-fill-1)', category: 'color', label: '折叠箭头背景色', usage: '滚动折叠箭头背景色 - 按下' },
  'color-tabs-tab-pane-arrow-disabled-text-default': { value: 'var(--cd-color-disabled-text)', category: 'color', label: '折叠箭头禁用色', usage: '滚动折叠箭头禁用颜色' },
  'color-tabs-tab-slash-line': { value: 'var(--cd-color-text-2)', category: 'color', label: '斜线分割线色', usage: '斜线式页签分割线颜色' },

  // ======== 线宽 / 斜线尺寸 ========
  'width-tabs-bar-line-border': { value: 'var(--cd-border-thickness-control)', category: 'width', label: '线条式轨道宽度', usage: '线条式页签底部分割线宽度' },
  'width-tabs-bar-line-tab-border': { value: '2px', category: 'width', label: '标示线宽度', usage: '页签标示线宽度' },
  'width-tabs-bar-card-border': { value: 'var(--cd-border-thickness-control)', category: 'width', label: '卡片式轨道宽度', usage: '卡片式页签容器底部长线宽度' },
  'width-tabs-tab-slash-line': { value: '8px', category: 'width', label: '斜线分割线宽度', usage: '斜线式页签分割线宽度' },
  'height-tabs-tab-slash-line': { value: '14px', category: 'height', label: '斜线分割线高度', usage: '斜线式页签分割线高度' },

  // ======== 圆角 ========
  'radius-tabs-tab-card': { value: 'var(--cd-border-radius-small) var(--cd-border-radius-small) 0 0', category: 'radius', label: '卡片式圆角', usage: '卡片式页签四向圆角' },
  'radius-tabs-tab-card-left': { value: 'var(--cd-border-radius-small) 0 0 var(--cd-border-radius-small)', category: 'radius', label: '垂直卡片式圆角', usage: '垂直卡片式页签四向圆角' },
  'radius-tabs-tab-button': { value: 'var(--cd-border-radius-small)', category: 'radius', label: '按钮式圆角', usage: '按钮式页签圆角' },

  // ======== 折叠箭头 / 附加操作 / 图标间距 ========
  'spacing-tabs-tab-pane-arrow': { value: '8px', category: 'spacing', label: '折叠箭头内边距', usage: '滚动折叠箭头内边距' },
  'spacing-tabs-bar-extra-paddingy': { value: '0px', category: 'spacing', label: '附加操作垂直内边距', usage: '附加操作垂直内边距' },
  'spacing-tabs-bar-extra-paddingx': { value: '5px', category: 'spacing', label: '附加操作水平内边距', usage: '附加操作水平内边距' },
  'spacing-tabs-tab-icon-marginright': { value: 'var(--cd-spacing-tight)', category: 'spacing', label: '图标右外边距', usage: '页签图标右外边距' },
  'spacing-tabs-overflow-icon-marginright': { value: '4px', category: 'spacing', label: '折叠切换按钮右外边距', usage: '页签折叠切换按钮右侧外边距' },
  'spacing-tabs-overflow-icon-marginleft': { value: '4px', category: 'spacing', label: '折叠切换按钮左外边距', usage: '页签折叠切换按钮左侧外边距' },

  // ======== line 横向内/外边距（默认档 = Semi large 基础档）========
  'spacing-tabs-bar-line-tab-paddingtop': { value: 'var(--cd-spacing-base)', category: 'spacing', label: '线条式上内边距', usage: '线条式页签顶部内边距' },
  'spacing-tabs-bar-line-tab-paddingx': { value: 'var(--cd-spacing-extra-tight)', category: 'spacing', label: '线条式水平内边距', usage: '线条式页签左右内边距' },
  'spacing-tabs-bar-line-tab-paddingbottom': { value: 'calc(var(--cd-spacing-base) - 2px)', category: 'spacing', label: '线条式下内边距', usage: '线条式页签底部内边距（扣标示线宽）' },
  'spacing-tabs-bar-line-tab-marginright': { value: 'var(--cd-spacing-loose)', category: 'spacing', label: '线条式右外边距', usage: '线条式页签右侧外边距' },
  // line 横向（small 档）
  'spacing-tabs-bar-line-tab-small-paddingtop': { value: 'var(--cd-spacing-tight)', category: 'spacing', label: '小尺寸线条式上内边距', usage: '小尺寸线条式页签顶部内边距' },
  'spacing-tabs-bar-line-tab-small-paddingbottom': { value: 'calc(var(--cd-spacing-tight) - 2px)', category: 'spacing', label: '小尺寸线条式下内边距', usage: '小尺寸线条式页签底部内边距（扣标示线宽）' },
  // line 横向（default 档，对应 Semi medium）
  'spacing-tabs-bar-line-tab-medium-paddingtop': { value: 'var(--cd-spacing-base-tight)', category: 'spacing', label: '中尺寸线条式上内边距', usage: '中尺寸线条式页签顶部内边距' },
  'spacing-tabs-bar-line-tab-medium-paddingbottom': { value: 'calc(var(--cd-spacing-base-tight) - 2px)', category: 'spacing', label: '中尺寸线条式下内边距', usage: '中尺寸线条式页签底部内边距（扣标示线宽）' },

  // ======== line 垂直左内边距 ========
  'spacing-tabs-bar-line-tab-left-padding': { value: '12px', category: 'spacing', label: '垂直线条式内边距', usage: '垂直线条式页签左侧内边距' },
  'spacing-tabs-bar-line-tab-left-small-padding': { value: 'calc(var(--cd-spacing-tight) - 2px)', category: 'spacing', label: '小尺寸垂直线条式内边距', usage: '小尺寸垂直线条式页签左侧内边距' },
  'spacing-tabs-bar-line-tab-left-medium-padding': { value: 'calc(var(--cd-spacing-base-tight) - 2px)', category: 'spacing', label: '中尺寸垂直线条式内边距', usage: '中尺寸垂直线条式页签左侧内边距' },

  // ======== 斜线式内/外边距 ========
  'spacing-tabs-bar-slash-tab-paddingy': { value: '12px', category: 'spacing', label: '斜线式垂直内边距', usage: '斜线式页签上下内边距' },
  'spacing-tabs-bar-slash-tab-paddingx': { value: '0px', category: 'spacing', label: '斜线式水平内边距', usage: '斜线式页签水平内边距' },
  'spacing-tabs-bar-slash-marginright': { value: '16px', category: 'spacing', label: '斜线式右外边距', usage: '斜线式页签右侧外边距' },
  'spacing-tabs-bar-slash-line-marginleft': { value: '16px', category: 'spacing', label: '斜线左外边距', usage: '斜线式页签斜线左侧外边距' },
  'spacing-tabs-bar-slash-line-marginy': { value: '3px', category: 'spacing', label: '斜线垂直外边距', usage: '斜线式页签斜线上下外边距（对齐 Semi top/bottom 均 3px）' },

  // ======== 内容区内边距 ========
  'spacing-tabs-content-paddingy': { value: '5px', category: 'spacing', label: '内容区垂直内边距', usage: '页签内容区垂直方向内边距' },
  'spacing-tabs-content-paddingx': { value: '0', category: 'spacing', label: '内容区水平内边距', usage: '页签内容区水平方向内边距' },
  'spacing-tabs-content-left-paddingx': { value: '5px', category: 'spacing', label: '垂直内容区水平内边距', usage: '垂直页签内容区水平方向内边距' },

  // ======== card 内/外边距 ========
  'spacing-tabs-bar-card-tab-paddingy': { value: 'var(--cd-spacing-tight)', category: 'spacing', label: '卡片式垂直内边距', usage: '卡片式页签垂直内边距' },
  'spacing-tabs-bar-card-tab-paddingx': { value: 'var(--cd-spacing-base-tight)', category: 'spacing', label: '卡片式水平内边距', usage: '卡片式页签水平内边距' },
  'spacing-tabs-bar-card-tab-marginright': { value: 'var(--cd-spacing-tight)', category: 'spacing', label: '卡片式右外边距', usage: '卡片式页签右侧外边距' },
  'spacing-tabs-bar-card-tab-active-paddingbottom': { value: 'calc(var(--cd-spacing-tight) - 1px)', category: 'spacing', label: '卡片式选中下内边距', usage: '卡片式选中页签底部内边距' },
  'spacing-tabs-bar-card-tab-left-marginbottom': { value: 'var(--cd-spacing-tight)', category: 'spacing', label: '垂直卡片式下外边距', usage: '垂直卡片式页签底部外边距' },

  // ======== button 内/外边距 ========
  'spacing-tabs-bar-button-tab-paddingy': { value: 'var(--cd-spacing-tight)', category: 'spacing', label: '按钮式垂直内边距', usage: '按钮式页签垂直内边距' },
  'spacing-tabs-bar-button-tab-paddingx': { value: 'var(--cd-spacing-base-tight)', category: 'spacing', label: '按钮式水平内边距', usage: '按钮式页签水平内边距' },
  'spacing-tabs-bar-button-tab-marginright': { value: 'var(--cd-spacing-tight)', category: 'spacing', label: '按钮式右外边距', usage: '按钮式页签右侧外边距' },
  'spacing-tabs-bar-button-tab-marginbottom': { value: 'var(--cd-spacing-tight)', category: 'spacing', label: '垂直按钮式下外边距', usage: '垂直按钮式页签底部外边距' },

  // ======== Dropdown 组件消费的遗留 token（Semi 无对应；tabs.ts 历史承载，保持不破坏消费）========
  'dropdown-bg': 'var(--cd-color-bg-0)',
  'dropdown-shadow': 'var(--cd-shadow-elevated)',
  'dropdown-radius': 'var(--cd-border-radius-medium)',
  'dropdown-z': 'var(--cd-z-dropdown)',
  'dropdown-min-width': '120px',
  'dropdown-item-padding': 'var(--cd-spacing-tight) var(--cd-spacing-base)',
  'dropdown-item-bg-hover': 'var(--cd-color-fill-0)',
  'dropdown-item-color-disabled': 'var(--cd-color-text-3)',
} satisfies TokenGroup;
