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
  // —— line 线条式：悬浮态 ——
  // —— line 线条式：按下态 ——
  // —— line 线条式：选中态 ——
  // —— line 线条式：垂直 ——
  // —— line 线条式：禁用态 ——

  // —— card 卡片式 ——

  // —— button 按钮式 ——

  // —— 图标 ——
  'color-tabs-tab-icon-default': { value: 'var(--cd-color-text-2)', category: 'color', label: '图标色', usage: '页签图标颜色 - 默认' },
  'color-tabs-tab-icon-hover': { value: 'var(--cd-color-text-0)', category: 'color', label: '图标色', usage: '页签图标颜色 - 悬浮' },
  'color-tabs-tab-icon-active': { value: 'var(--cd-color-text-0)', category: 'color', label: '图标色', usage: '页签图标颜色 - 按下' },
  'color-tabs-tab-selected-icon-default': { value: 'var(--cd-color-primary)', category: 'color', label: '选中图标色', usage: '页签图标颜色 - 选中' },

  // —— 聚焦轮廓 ——

  // —— 内容区 ——

  // —— 滚动折叠箭头 ——

  // —— 斜线式分割线 ——

  // —— 字重 ——

  // —— 折叠菜单高度 ——

  // —— 线宽 / 轮廓宽度 ——

  // —— 尺寸档：高度 / 行高 ——

  // —— 「更多」触发器图标外边距 ——

  // —— 折叠箭头 / 附加操作 / 图标间距 ——
  'spacing-tabs-tab-icon-marginright': { value: 'var(--cd-spacing-tight)', category: 'spacing', label: '图标右外边距', usage: '页签图标右外边距' },

  // —— line 横向内/外边距（默认档）——

  // —— line 横向（小尺寸档）——

  // —— line 横向（中等尺寸档）——

  // —— line 垂直左内边距 ——

  // —— 斜线式内/外边距 ——

  // —— 内容区内边距 ——
  'spacing-tabs-content-paddingy': { value: '5px', category: 'spacing', label: '内容区垂直内边距', usage: '页签内容区垂直方向内边距' },
  'spacing-tabs-content-left-paddingx': { value: '5px', category: 'spacing', label: '垂直内容区水平内边距', usage: '垂直页签内容区水平方向内边距' },

  // —— card 内/外边距 ——

  // —— button 内/外边距 ——

  // —— 圆角 ——

  // —— 字号 ——

  // —— chenzy-design Tabs 组件实际消费的老 token（原名不动，值对齐 Semi；组件消费）——
  // line 默认 text-2、选中 text-0 深字，标示线（ink）才是 primary。
  'tabs-tab-color': { value: 'var(--cd-color-text-2)', category: 'color', label: '标签文本色', usage: '标签默认文本色（组件消费）' },
  'tabs-tab-color-active': { value: 'var(--cd-color-text-0)', category: 'color', label: '选中文本色', usage: '标签选中文本色（组件消费）' },
  'tabs-tab-color-disabled': { value: 'var(--cd-color-disabled-text)', category: 'color', label: '禁用文本色', usage: '标签禁用文本色（组件消费）' },
  'tabs-tab-padding': { value: 'var(--cd-spacing-tight) var(--cd-spacing-base)', category: 'spacing', label: '标签内边距', usage: '标签内边距（组件消费）' },
  'tabs-tab-font-size': { value: 'var(--cd-font-size-regular)', category: 'font', label: '标签字号', usage: '标签字号（组件消费）' },
  'tabs-ink-color': { value: 'var(--cd-color-primary)', category: 'color', label: '标示线色', usage: '线条式选中标示线颜色（组件消费）' },
  'tabs-ink-height': { value: '2px', category: 'width', label: '标示线厚度', usage: '线条式标示线厚度（组件消费）' },
  'tabs-bar-border': { value: 'var(--cd-color-border)', category: 'color', label: '轨道分割线色', usage: '标签栏底部分割线颜色（组件消费）' },
  'tabs-card-bg': { value: 'var(--cd-color-fill-0)', category: 'color', label: '卡片式背景色', usage: '卡片式标签默认背景（组件消费，对齐 Semi card hover fill）' },
  'tabs-card-bg-active': { value: 'var(--cd-color-bg-1)', category: 'color', label: '卡片式选中背景色', usage: '卡片式标签选中背景（组件消费）' },
  'tabs-card-radius': { value: 'var(--cd-border-radius-small)', category: 'radius', label: '卡片式圆角', usage: '卡片式标签圆角（组件消费，对齐 Semi small 3px）' },
  // type=button（分段按钮组）
  'tabs-button-bg': { value: 'var(--cd-color-fill-0)', category: 'color', label: '按钮组底色', usage: '按钮组外层底色（组件消费）' },
  'tabs-button-bg-hover': { value: 'var(--cd-color-fill-0)', category: 'color', label: '按钮悬浮背景色', usage: '按钮式标签悬浮背景（组件消费）' },
  'tabs-button-bg-active': { value: 'var(--cd-color-primary-light-default)', category: 'color', label: '按钮选中背景色', usage: '按钮式标签选中背景（组件消费，对齐 Semi primary-light）' },
  'tabs-button-color-active': { value: 'var(--cd-color-primary)', category: 'color', label: '按钮选中文本色', usage: '按钮式标签选中文本色（组件消费，对齐 Semi primary）' },
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
