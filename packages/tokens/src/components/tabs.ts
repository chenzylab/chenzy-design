/**
 * Component tokens for Tabs（+ Dropdown 遗留段）。全量对齐 Semi Design
 * （semi-foundation/tabs/variables.scss 121 个变量），升级为带元数据的 TokenDef
 * 结构以支持 DSM。值为 var() 引用我们的 alias / global token，或字面量 / calc()。
 *
 * 映射规则：
 * - Semi `$xxx-tabs_yyy` → kebab 小写：`color-tabs-tab-line-default-border-default` 等。
 * - `--semi-color-*` → `--cd-color-*` 一一对应；Semi 无 `--semi-color-white`（本表未用）。
 * - `$spacing-*` → `--cd-spacing-*`（同名）；`var(--semi-border-radius-*)` → `var(--cd-border-radius-*)`；
 *   `$font-weight-*` → `--cd-font-weight-*`；`$font-size-*` → `--cd-font-size-*`；
 *   `$border-thickness-control` → `--cd-border-thickness-control`。
 * - calc/减法忠实翻译成 CSS calc()（如 `$spacing-base - 2px` → `calc(var(--cd-spacing-base) - 2px)`）。
 * - 负值 → `calc(-1 * var(...))`。
 *
 * 末尾保留 chenzy-design Tabs 组件实际消费的老 token（原名不动，值对齐 Semi），
 * 以及 Dropdown 组件消费的遗留 token（tabs.ts 历史承载，Semi 无对应；保持裸值不破坏消费）。
 */
import type { TokenGroup } from './token-def.js';

export const tabsTokens = {
  // —— line 线条式：默认态 ——
  'color-tabs-tab-line-default-border-default': { value: 'var(--cd-color-border)', category: 'color', label: '线条式轨道色', usage: '线条式页签轨道颜色 - 默认' },
  'color-tabs-tab-line-default-bg-default': { value: 'transparent', category: 'color', label: '线条式背景色', usage: '线条式页签背景颜色 - 默认' },
  'color-tabs-tab-line-default-text-default': { value: 'var(--cd-color-text-2)', category: 'color', label: '线条式文本色', usage: '线条式页签文本颜色 - 默认' },
  // —— line 线条式：悬浮态 ——
  'color-tabs-tab-line-default-bg-hover': { value: 'transparent', category: 'color', label: '线条式背景色', usage: '线条式页签背景颜色 - 悬浮' },
  'color-tabs-tab-line-default-text-hover': { value: 'var(--cd-color-text-0)', category: 'color', label: '线条式文本色', usage: '线条式页签文本颜色 - 悬浮' },
  'color-tabs-tab-line-default-border-hover': { value: 'var(--cd-color-fill-0)', category: 'color', label: '线条式标示线色', usage: '线条式页签标示线颜色 - 悬浮' },
  // —— line 线条式：按下态 ——
  'color-tabs-tab-line-default-bg-active': { value: 'transparent', category: 'color', label: '线条式背景色', usage: '线条式页签背景颜色 - 按下' },
  'color-tabs-tab-line-default-text-active': { value: 'var(--cd-color-text-0)', category: 'color', label: '线条式文本色', usage: '线条式页签文本颜色 - 按下' },
  'color-tabs-tab-line-default-border-active': { value: 'var(--cd-color-fill-1)', category: 'color', label: '线条式标示线色', usage: '线条式页签标示线颜色 - 按下' },
  // —— line 线条式：选中态 ——
  'color-tabs-tab-line-selected-bg-default': { value: 'transparent', category: 'color', label: '线条式选中背景色', usage: '线条式页签背景颜色 - 选中' },
  'color-tabs-tab-line-selected-text-default': { value: 'var(--cd-color-text-0)', category: 'color', label: '线条式选中文本色', usage: '线条式页签文本颜色 - 选中' },
  'color-tabs-tab-line-indicator-selected-icon-default': { value: 'var(--cd-color-primary)', category: 'color', label: '线条式标示线色', usage: '线条式页签标示线颜色 - 选中' },
  'color-tabs-tab-line-selected-icon-default': { value: 'var(--cd-color-primary)', category: 'color', label: '线条式选中图标色', usage: '线条式页签图标颜色 - 选中' },
  // —— line 线条式：垂直 ——
  'color-tabs-tab-line-vertical-selected-bg-default': { value: 'var(--cd-color-primary-light-default)', category: 'color', label: '垂直线条式选中背景色', usage: '垂直线条式页签背景颜色 - 选中' },
  'color-tabs-tab-line-vertical-bg-hover': { value: 'var(--cd-color-fill-0)', category: 'color', label: '垂直线条式背景色', usage: '垂直线条式页签背景颜色 - 悬浮' },
  'color-tabs-tab-line-vertical-bg-active': { value: 'var(--cd-color-fill-1)', category: 'color', label: '垂直线条式背景色', usage: '垂直线条式页签背景颜色 - 按下' },
  // —— line 线条式：禁用态 ——
  'color-tabs-tab-line-disabled-text-default': { value: 'var(--cd-color-disabled-text)', category: 'color', label: '禁用线条式文本色', usage: '禁用线条式页签文本颜色 - 默认' },
  'color-tabs-tab-line-disabled-text-hover': { value: 'var(--cd-color-disabled-text)', category: 'color', label: '禁用线条式文本色', usage: '禁用线条式页签文本颜色 - 悬浮' },

  // —— card 卡片式 ——
  'color-tabs-tab-card-default-border-default': { value: 'var(--cd-color-border)', category: 'color', label: '卡片式底部长线色', usage: '卡片式页签容器底部长线颜色 - 默认' },
  'color-tabs-tab-card-indicator-selected-icon-default': { value: 'var(--cd-color-border)', category: 'color', label: '卡片式选中描边色', usage: '卡片式页签选中页签描边' },
  'color-tabs-tab-card-bg-hover': { value: 'var(--cd-color-fill-0)', category: 'color', label: '卡片式背景色', usage: '卡片式页签背景颜色 - 悬浮' },
  'color-tabs-tab-card-selected-bg-default': { value: 'var(--cd-color-bg-1)', category: 'color', label: '卡片式选中背景色', usage: '卡片式页签背景颜色 - 选中' },
  'color-tabs-tab-card-bg-active': { value: 'var(--cd-color-fill-1)', category: 'color', label: '卡片式背景色', usage: '卡片式页签背景颜色 - 按下' },

  // —— button 按钮式 ——
  'color-tabs-tab-button-selected-bg-default': { value: 'var(--cd-color-primary-light-default)', category: 'color', label: '按钮式选中背景色', usage: '按钮式页签背景颜色 - 选中' },
  'color-tabs-tab-button-selected-text-default': { value: 'var(--cd-color-primary)', category: 'color', label: '按钮式选中文本色', usage: '按钮式页签文本颜色 - 选中' },
  'color-tabs-tab-button-text-default': { value: 'var(--cd-color-text-2)', category: 'color', label: '按钮式文本色', usage: '按钮式页签文本颜色 - 默认' },
  'color-tabs-tab-button-bg-hover': { value: 'var(--cd-color-fill-0)', category: 'color', label: '按钮式背景色', usage: '按钮式页签背景颜色 - 悬浮' },
  'color-tabs-tab-button-bg-active': { value: 'var(--cd-color-fill-1)', category: 'color', label: '按钮式背景色', usage: '按钮式页签背景颜色 - 按下' },

  // —— 图标 ——
  'color-tabs-tab-icon-default': { value: 'var(--cd-color-text-2)', category: 'color', label: '图标色', usage: '页签图标颜色 - 默认' },
  'color-tabs-tab-icon-hover': { value: 'var(--cd-color-text-0)', category: 'color', label: '图标色', usage: '页签图标颜色 - 悬浮' },
  'color-tabs-tab-icon-active': { value: 'var(--cd-color-text-0)', category: 'color', label: '图标色', usage: '页签图标颜色 - 按下' },
  'color-tabs-tab-selected-icon-default': { value: 'var(--cd-color-primary)', category: 'color', label: '选中图标色', usage: '页签图标颜色 - 选中' },

  // —— 聚焦轮廓 ——
  'color-tabs-tab-outline-focus': { value: 'var(--cd-color-primary-light-active)', category: 'color', label: '轮廓聚焦色', usage: '页签轮廓 - 聚焦' },

  // —— 内容区 ——
  'color-tabs-tab-pane-text-default': { value: 'var(--cd-color-text-0)', category: 'color', label: '内容文本色', usage: '标签页内容文本颜色 - 默认' },

  // —— 滚动折叠箭头 ——
  'color-tabs-tab-pane-arrow-text-default': { value: 'var(--cd-color-primary)', category: 'color', label: '折叠箭头色', usage: '滚动折叠箭头颜色 - 默认' },
  'color-tabs-tab-pane-arrow-border-default': { value: 'transparent', category: 'color', label: '折叠箭头边框色', usage: '滚动折叠箭头边框颜色 - 默认' },
  'color-tabs-tab-pane-arrow-bg-default': { value: 'transparent', category: 'color', label: '折叠箭头背景色', usage: '滚动折叠箭头背景色 - 默认' },
  'color-tabs-tab-pane-arrow-text-hover': { value: 'var(--cd-color-primary)', category: 'color', label: '折叠箭头色', usage: '滚动折叠箭头颜色 - 悬浮' },
  'color-tabs-tab-pane-arrow-border-hover': { value: 'transparent', category: 'color', label: '折叠箭头边框色', usage: '滚动折叠箭头边框颜色 - 悬浮' },
  'color-tabs-tab-pane-arrow-bg-hover': { value: 'var(--cd-color-fill-0)', category: 'color', label: '折叠箭头背景色', usage: '滚动折叠箭头背景色 - 悬浮' },
  'color-tabs-tab-pane-arrow-text-active': { value: 'var(--cd-color-primary)', category: 'color', label: '折叠箭头色', usage: '滚动折叠箭头颜色 - 按下' },
  'color-tabs-tab-pane-arrow-border-active': { value: 'transparent', category: 'color', label: '折叠箭头边框色', usage: '滚动折叠箭头边框颜色 - 按下' },
  'color-tabs-tab-pane-arrow-bg-active': { value: 'var(--cd-color-fill-1)', category: 'color', label: '折叠箭头背景色', usage: '滚动折叠箭头背景色 - 按下' },
  'color-tabs-tab-pane-arrow-disabled-bg-default': { value: 'transparent', category: 'color', label: '禁用折叠箭头背景色', usage: '禁用滚动折叠箭头背景色 - 默认' },
  'color-tabs-tab-pane-arrow-disabled-bg-hover': { value: 'transparent', category: 'color', label: '禁用折叠箭头背景色', usage: '禁用滚动折叠箭头背景色 - 悬浮' },
  'color-tabs-tab-pane-arrow-disabled-text-default': { value: 'var(--cd-color-disabled-text)', category: 'color', label: '禁用折叠箭头色', usage: '禁用滚动折叠箭头颜色 - 默认' },
  'color-tabs-tab-pane-arrow-disabled-text-hover': { value: 'var(--cd-color-disabled-text)', category: 'color', label: '禁用折叠箭头色', usage: '禁用滚动折叠箭头颜色 - 悬浮' },

  // —— 斜线式分割线 ——
  'color-tabs-tab-slash-line': { value: 'var(--cd-color-text-2)', category: 'color', label: '斜线分割线色', usage: '斜线式页签分割线颜色' },

  // —— 字重 ——
  'font-tabs-tab-fontweight': { value: 'var(--cd-font-weight-regular)', category: 'font', label: '文本字重', usage: '页签文本字重 - 默认' },
  'font-tabs-tab-active-fontweight': { value: 'var(--cd-font-weight-bold)', category: 'font', label: '选中文本字重', usage: '页签文本字重 - 选中' },

  // —— 折叠菜单高度 ——
  'height-tabs-overflow-list': { value: '300px', category: 'height', label: '折叠菜单高度', usage: '页签折叠收起菜单高度' },

  // —— 线宽 / 轮廓宽度 ——
  'width-tabs-bar-line-border': { value: 'var(--cd-border-thickness-control)', category: 'width', label: '底部分割线宽', usage: '线条式页签底部分割线宽度' },
  'width-tabs-bar-line-tab-border': { value: '2px', category: 'width', label: '标示线宽', usage: '页签标示线宽度' },
  'width-tabs-bar-card-border': { value: 'var(--cd-border-thickness-control)', category: 'width', label: '卡片底部长线宽', usage: '卡片式页签容器底部长线宽度' },
  'width-tabs-outline': { value: '2px', category: 'width', label: '聚焦轮廓宽', usage: '聚焦轮廓宽度' },
  'width-tabs-outline-offset': { value: '-2px', category: 'width', label: '聚焦轮廓偏移', usage: '聚焦轮廓偏移宽度' },
  'width-tabs-bar-line-outline-offset': { value: '-1px', category: 'width', label: '线条式聚焦轮廓偏移', usage: '线条式页签聚焦轮廓偏移宽度' },
  'width-tabs-tab-pane-arrow-border': { value: '0px', category: 'width', label: '折叠箭头边框宽', usage: '滚动折叠箭头边框宽度' },
  'width-tabs-tab-slash-line': { value: '8px', category: 'width', label: '斜线分割线宽', usage: '斜线式页签分割线宽度' },
  'height-tabs-tab-slash-line': { value: '14px', category: 'height', label: '斜线分割线高', usage: '斜线式页签分割线高度' },

  // —— 尺寸档：高度 / 行高 ——
  'height-tabs-bar-extra-large': { value: '50px', category: 'height', label: '大尺寸页签高', usage: '大尺寸页签高度' },
  'font-tabs-bar-extra-large-lineheight': { value: '50px', category: 'font', label: '大尺寸行高', usage: '大尺寸页签文字行高' },
  'height-tabs-bar-extra-small': { value: '36px', category: 'height', label: '小尺寸页签高', usage: '小尺寸页签高度' },
  'font-tabs-bar-extra-small-lineheight': { value: '36px', category: 'font', label: '小尺寸行高', usage: '小尺寸页签文字行高' },

  // —— 「更多」触发器图标外边距 ——
  'spacing-tabs-tab-more-trigger-icon-marginleft': { value: '8px', category: 'spacing', label: '更多图标左外边距', usage: '页签「更多」触发器图标左外边距' },
  'spacing-tabs-tab-more-trigger-icon-marginright': { value: '8px', category: 'spacing', label: '更多图标右外边距', usage: '页签「更多」触发器图标右外边距' },
  'spacing-tabs-tab-more-trigger-icon-margintop': { value: '0px', category: 'spacing', label: '更多图标上外边距', usage: '页签「更多」触发器图标上外边距' },
  'spacing-tabs-tab-more-trigger-icon-marginbottom': { value: '0px', category: 'spacing', label: '更多图标下外边距', usage: '页签「更多」触发器图标下外边距' },

  // —— 折叠箭头 / 附加操作 / 图标间距 ——
  'spacing-tabs-tab-pane-arrow': { value: '8px', category: 'spacing', label: '折叠箭头内边距', usage: '滚动折叠箭头内边距' },
  'spacing-tabs-bar-extra-paddingy': { value: '0px', category: 'spacing', label: '附加操作垂直内边距', usage: '附加操作垂直内边距' },
  'spacing-tabs-bar-extra-paddingx': { value: '5px', category: 'spacing', label: '附加操作水平内边距', usage: '附加操作水平内边距' },
  'spacing-tabs-tab-icon-marginright': { value: 'var(--cd-spacing-tight)', category: 'spacing', label: '图标右外边距', usage: '页签图标右外边距' },
  'spacing-tabs-tab-icon-top': { value: '3px', category: 'spacing', label: '图标顶部位置', usage: '页签图标顶部位置' },
  'spacing-tabs-overflow-icon-marginright': { value: '4px', category: 'spacing', label: '折叠切换按钮右外边距', usage: '页签折叠切换按钮右侧外边距' },
  'spacing-tabs-overflow-icon-marginleft': { value: '4px', category: 'spacing', label: '折叠切换按钮左外边距', usage: '页签折叠切换按钮左侧外边距' },

  // —— line 横向内/外边距（默认档）——
  'spacing-tabs-bar-line-tab-paddingtop': { value: 'var(--cd-spacing-base)', category: 'spacing', label: '线条式顶内边距', usage: '线条式页签顶部内边距' },
  'spacing-tabs-bar-line-tab-paddingright': { value: 'var(--cd-spacing-extra-tight)', category: 'spacing', label: '线条式右内边距', usage: '线条式页签右侧内边距' },
  'spacing-tabs-bar-line-tab-paddingbottom': { value: 'calc(var(--cd-spacing-base) - 2px)', category: 'spacing', label: '线条式底内边距', usage: '线条式页签底部内边距（base - 标示线宽 2px）' },
  'spacing-tabs-bar-line-tab-paddingleft': { value: 'var(--cd-spacing-extra-tight)', category: 'spacing', label: '线条式左内边距', usage: '线条式页签左侧内边距' },
  'spacing-tabs-bar-line-tab-marginright': { value: 'var(--cd-spacing-loose)', category: 'spacing', label: '线条式右外边距', usage: '线条式页签右侧外边距' },

  // —— line 横向（小尺寸档）——
  'spacing-tabs-bar-line-tab-small-paddingtop': { value: 'var(--cd-spacing-tight)', category: 'spacing', label: '小尺寸线条式顶内边距', usage: '小尺寸线条式页签顶部内边距' },
  'spacing-tabs-bar-line-tab-small-paddingright': { value: 'var(--cd-spacing-extra-tight)', category: 'spacing', label: '小尺寸线条式右内边距', usage: '小尺寸线条式页签右侧内边距' },
  'spacing-tabs-bar-line-tab-small-paddingbottom': { value: 'calc(var(--cd-spacing-tight) - 2px)', category: 'spacing', label: '小尺寸线条式底内边距', usage: '小尺寸线条式页签底部内边距（tight - 标示线宽 2px）' },
  'spacing-tabs-bar-line-tab-small-paddingleft': { value: 'var(--cd-spacing-extra-tight)', category: 'spacing', label: '小尺寸线条式左内边距', usage: '小尺寸线条式页签左侧内边距' },

  // —— line 横向（中等尺寸档）——
  'spacing-tabs-bar-line-tab-medium-paddingtop': { value: 'var(--cd-spacing-base-tight)', category: 'spacing', label: '中尺寸线条式顶内边距', usage: '中等尺寸线条式页签顶部内边距' },
  'spacing-tabs-bar-line-tab-medium-paddingright': { value: 'var(--cd-spacing-extra-tight)', category: 'spacing', label: '中尺寸线条式右内边距', usage: '中等尺寸线条式页签右侧内边距' },
  'spacing-tabs-bar-line-tab-medium-paddingbottom': { value: 'calc(var(--cd-spacing-base-tight) - 2px)', category: 'spacing', label: '中尺寸线条式底内边距', usage: '中等尺寸线条式页签底部内边距（base-tight - 标示线宽 2px）' },
  'spacing-tabs-bar-line-tab-medium-paddingleft': { value: 'var(--cd-spacing-extra-tight)', category: 'spacing', label: '中尺寸线条式左内边距', usage: '中等尺寸线条式页签左侧内边距' },

  // —— line 垂直左内边距 ——
  'spacing-tabs-bar-line-tab-left-padding': { value: '12px', category: 'spacing', label: '垂直线条式左内边距', usage: '垂直线条式页签左侧内边距' },
  'spacing-tabs-bar-line-tab-left-small-padding': { value: 'calc(var(--cd-spacing-tight) - 2px)', category: 'spacing', label: '小尺寸垂直线条式左内边距', usage: '小尺寸垂直线条式页签左侧内边距（tight - 2px）' },
  'spacing-tabs-bar-line-tab-left-medium-padding': { value: 'calc(var(--cd-spacing-base-tight) - 2px)', category: 'spacing', label: '中尺寸垂直线条式左内边距', usage: '中等尺寸垂直线条式页签左侧内边距（base-tight - 2px）' },

  // —— 斜线式内/外边距 ——
  'spacing-tabs-bar-slash-tab-paddingy': { value: '12px', category: 'spacing', label: '斜线式垂直内边距', usage: '斜线式页签上下内边距' },
  'spacing-tabs-bar-slash-tab-paddingx': { value: '0px', category: 'spacing', label: '斜线式水平内边距', usage: '斜线式页签水平内边距' },
  'spacing-tabs-bar-slash-marginright': { value: '16px', category: 'spacing', label: '斜线式右外边距', usage: '斜线式页签右侧外边距' },
  'spacing-tabs-bar-slash-line-marginleft': { value: '16px', category: 'spacing', label: '斜线左外边距', usage: '斜线式页签斜线左侧外边距' },
  'spacing-tabs-bar-slash-line-margintop': { value: '3px', category: 'spacing', label: '斜线顶外边距', usage: '斜线式页签斜线顶部外边距' },
  'spacing-tabs-bar-slash-line-marginbottom': { value: '3px', category: 'spacing', label: '斜线底外边距', usage: '斜线式页签斜线底部外边距' },

  // —— 内容区内边距 ——
  'spacing-tabs-content-paddingy': { value: '5px', category: 'spacing', label: '内容区垂直内边距', usage: '页签内容区垂直方向内边距' },
  'spacing-tabs-content-paddingx': { value: '0', category: 'spacing', label: '内容区水平内边距', usage: '页签内容区水平方向内边距' },
  'spacing-tabs-content-left-paddingx': { value: '5px', category: 'spacing', label: '垂直内容区水平内边距', usage: '垂直页签内容区水平方向内边距' },
  'spacing-tabs-content-left-paddingy': { value: '0', category: 'spacing', label: '垂直内容区垂直内边距', usage: '垂直页签内容区垂直方向内边距' },

  // —— card 内/外边距 ——
  'spacing-tabs-bar-card-tab-marginright': { value: 'var(--cd-spacing-tight)', category: 'spacing', label: '卡片式右外边距', usage: '卡片式页签右侧外边距' },
  'spacing-tabs-bar-card-tab-active-paddingtop': { value: 'var(--cd-spacing-tight)', category: 'spacing', label: '卡片式选中顶内边距', usage: '卡片式选中页签顶部内边距' },
  'spacing-tabs-bar-card-tab-active-paddingbottom': { value: 'calc(var(--cd-spacing-tight) - 1px)', category: 'spacing', label: '卡片式选中底内边距', usage: '卡片式选中页签底部内边距（tight - 1px）' },
  'spacing-tabs-bar-card-tab-active-paddingleft': { value: 'var(--cd-spacing-base-tight)', category: 'spacing', label: '卡片式选中左内边距', usage: '卡片式选中页签左侧内边距' },
  'spacing-tabs-bar-card-tab-active-paddingright': { value: 'var(--cd-spacing-base-tight)', category: 'spacing', label: '卡片式选中右内边距', usage: '卡片式选中页签右侧内边距' },
  'spacing-tabs-bar-card-tab-left-marginbottom': { value: 'var(--cd-spacing-tight)', category: 'spacing', label: '垂直卡片式底外边距', usage: '垂直卡片式页签底部外边距' },
  'spacing-tabs-bar-card-tab-left-active-paddingy': { value: 'var(--cd-spacing-tight)', category: 'spacing', label: '垂直卡片式选中垂直内边距', usage: '垂直卡片式选中页签垂直内边距' },
  'spacing-tabs-bar-card-tab-left-active-paddingx': { value: 'var(--cd-spacing-base-tight)', category: 'spacing', label: '垂直卡片式选中水平内边距', usage: '垂直卡片式选中页签水平内边距' },
  'spacing-tabs-bar-card-tab-paddingy': { value: 'var(--cd-spacing-tight)', category: 'spacing', label: '卡片式垂直内边距', usage: '卡片式页签垂直内边距' },
  'spacing-tabs-bar-card-tab-paddingx': { value: 'var(--cd-spacing-base-tight)', category: 'spacing', label: '卡片式水平内边距', usage: '卡片式页签水平内边距' },

  // —— button 内/外边距 ——
  'spacing-tabs-bar-button-tab-left-marginbottom': { value: 'var(--cd-spacing-tight)', category: 'spacing', label: '垂直按钮式底外边距', usage: '垂直按钮式页签底部外边距' },
  'spacing-tabs-bar-button-tab-marginright': { value: 'var(--cd-spacing-tight)', category: 'spacing', label: '按钮式右外边距', usage: '按钮式页签右侧外边距' },
  'spacing-tabs-bar-button-tab-paddingy': { value: 'var(--cd-spacing-tight)', category: 'spacing', label: '按钮式垂直内边距', usage: '按钮式页签垂直内边距' },
  'spacing-tabs-bar-button-tab-paddingx': { value: 'var(--cd-spacing-base-tight)', category: 'spacing', label: '按钮式水平内边距', usage: '按钮式页签水平内边距' },

  // —— 圆角 ——
  'radius-tabs-tab-card': { value: 'var(--cd-border-radius-small) var(--cd-border-radius-small) 0 0', category: 'radius', label: '卡片式圆角', usage: '卡片式页签四向圆角（顶部圆角）' },
  'radius-tabs-tab-card-left': { value: 'var(--cd-border-radius-small) 0 0 var(--cd-border-radius-small)', category: 'radius', label: '垂直卡片式圆角', usage: '垂直卡片式页签四向圆角（左侧圆角）' },
  'radius-tabs-tab-button': { value: 'var(--cd-border-radius-small)', category: 'radius', label: '按钮式圆角', usage: '按钮式页签圆角' },

  // —— 字号 ——
  'font-tabs-bar-large-fontsize': { value: 'var(--cd-font-size-regular)', category: 'font', label: '大号字号', usage: '大号模式字体大小' },
  'font-tabs-bar-small-fontsize': { value: 'var(--cd-font-size-regular)', category: 'font', label: '小号字号', usage: '小号模式字体大小' },
  'font-tabs-bar-medium-fontsize': { value: 'var(--cd-font-size-regular)', category: 'font', label: '中号字号', usage: '中等模式字体大小' },

  // —— chenzy-design Tabs 组件实际消费的老 token（原名不动，值对齐 Semi；组件消费）——
  // line 默认 text-2、选中 text-0 深字，标示线（ink）才是 primary。
  'tabs-tab-color': { value: 'var(--cd-color-tabs-tab-line-default-text-default)', category: 'color', label: '标签文本色', usage: '标签默认文本色（组件消费）' },
  'tabs-tab-color-active': { value: 'var(--cd-color-tabs-tab-line-selected-text-default)', category: 'color', label: '选中文本色', usage: '标签选中文本色（组件消费）' },
  'tabs-tab-color-disabled': { value: 'var(--cd-color-tabs-tab-line-disabled-text-default)', category: 'color', label: '禁用文本色', usage: '标签禁用文本色（组件消费）' },
  'tabs-tab-padding': { value: 'var(--cd-spacing-tight) var(--cd-spacing-base)', category: 'spacing', label: '标签内边距', usage: '标签内边距（组件消费）' },
  'tabs-tab-font-size': { value: 'var(--cd-font-size-regular)', category: 'font', label: '标签字号', usage: '标签字号（组件消费）' },
  'tabs-ink-color': { value: 'var(--cd-color-tabs-tab-line-indicator-selected-icon-default)', category: 'color', label: '标示线色', usage: '线条式选中标示线颜色（组件消费）' },
  'tabs-ink-height': { value: 'var(--cd-width-tabs-bar-line-tab-border)', category: 'width', label: '标示线厚度', usage: '线条式标示线厚度（组件消费）' },
  'tabs-bar-border': { value: 'var(--cd-color-tabs-tab-line-default-border-default)', category: 'color', label: '轨道分割线色', usage: '标签栏底部分割线颜色（组件消费）' },
  'tabs-card-bg': { value: 'var(--cd-color-tabs-tab-card-bg-hover)', category: 'color', label: '卡片式背景色', usage: '卡片式标签默认背景（组件消费，对齐 Semi card hover fill）' },
  'tabs-card-bg-active': { value: 'var(--cd-color-tabs-tab-card-selected-bg-default)', category: 'color', label: '卡片式选中背景色', usage: '卡片式标签选中背景（组件消费）' },
  'tabs-card-radius': { value: 'var(--cd-radius-tabs-tab-button)', category: 'radius', label: '卡片式圆角', usage: '卡片式标签圆角（组件消费，对齐 Semi small 3px）' },
  // type=button（分段按钮组）
  'tabs-button-bg': { value: 'var(--cd-color-fill-0)', category: 'color', label: '按钮组底色', usage: '按钮组外层底色（组件消费）' },
  'tabs-button-bg-hover': { value: 'var(--cd-color-tabs-tab-button-bg-hover)', category: 'color', label: '按钮悬浮背景色', usage: '按钮式标签悬浮背景（组件消费）' },
  'tabs-button-bg-active': { value: 'var(--cd-color-tabs-tab-button-selected-bg-default)', category: 'color', label: '按钮选中背景色', usage: '按钮式标签选中背景（组件消费，对齐 Semi primary-light）' },
  'tabs-button-color-active': { value: 'var(--cd-color-tabs-tab-button-selected-text-default)', category: 'color', label: '按钮选中文本色', usage: '按钮式标签选中文本色（组件消费，对齐 Semi primary）' },
  'tabs-button-gap': { value: 'var(--cd-spacing-super-tight)', category: 'spacing', label: '按钮间距', usage: '按钮组内标签间距（组件消费）' },
  'tabs-button-pad': { value: 'var(--cd-spacing-super-tight)', category: 'spacing', label: '按钮组内边距', usage: '按钮组外层内边距（组件消费）' },

  // —— Dropdown 组件消费的遗留 token（Semi 无对应；tabs.ts 历史承载，保持不破坏消费）——
  'dropdown-bg': 'var(--cd-color-bg-0)',
  'dropdown-shadow': 'var(--cd-shadow-elevated)',
  'dropdown-radius': 'var(--cd-border-radius-medium)',
  'dropdown-z': 'var(--cd-z-dropdown)',
  'dropdown-min-width': '120px',
  'dropdown-item-padding': 'var(--cd-spacing-tight) var(--cd-spacing-base)',
  'dropdown-item-bg-hover': 'var(--cd-color-fill-0)',
  'dropdown-item-color-disabled': 'var(--cd-color-text-3)',
} satisfies TokenGroup;
