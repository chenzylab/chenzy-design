/**
 * Component tokens for Layout. See specs/components/basic/Layout.spec.md.
 * 升级为带元数据的 TokenDef 结构以支持 DSM。
 * Semi 无 semi-foundation/layout/variables.scss，故保留 chenzy-design 自有 token 与现值。
 */
import type { TokenGroup } from './token-def.js';

export const layoutTokens = {
  'layout-bg': { value: 'var(--cd-color-bg-0)', category: 'color', label: '整体背景', usage: 'Layout 根背景色' },
  'layout-header-bg': { value: 'var(--cd-color-bg-1)', category: 'color', label: '页头背景', usage: 'Header 背景色' },
  'layout-header-height': { value: '60px', category: 'height', label: '页头高度', usage: 'Header 默认高度' },
  'layout-header-z': { value: 'var(--cd-z-sticky)', category: 'other', label: '页头层级', usage: 'sticky Header z-index' },
  'layout-footer-bg': { value: 'var(--cd-color-bg-1)', category: 'color', label: '页脚背景', usage: 'Footer 背景色' },
  'layout-footer-color': { value: 'var(--cd-color-text-2)', category: 'color', label: '页脚文字色', usage: 'Footer 文字颜色' },
  'layout-content-bg': { value: 'var(--cd-color-bg-0)', category: 'color', label: '内容区背景', usage: 'Content 背景色' },
  'layout-content-padding': { value: 'var(--cd-spacing-loose)', category: 'spacing', label: '内容区内边距', usage: 'Content 默认内边距' },
  'layout-sider-bg': { value: 'var(--cd-color-bg-1)', category: 'color', label: '侧边栏背景', usage: 'Sider 背景色' },
  'layout-sider-width': { value: '200px', category: 'width', label: '侧边栏宽度', usage: 'Sider 展开宽度' },
  'layout-sider-collapsed-width': { value: '60px', category: 'width', label: '侧边栏收起宽度', usage: 'Sider 收起宽度' },
  'layout-sider-border': { value: 'var(--cd-color-border)', category: 'color', label: '侧边栏描边', usage: 'Sider 分隔描边色' },
  'layout-sider-trigger-bg': { value: 'var(--cd-color-bg-2)', category: 'color', label: '收起触发器背景', usage: 'Sider 折叠触发器背景色' },
  'layout-sider-trigger-color': { value: 'var(--cd-color-text-1)', category: 'color', label: '收起触发器图标色', usage: 'Sider 折叠触发器图标颜色' },
  'layout-sider-trigger-hover-bg': { value: 'var(--cd-color-fill-1)', category: 'color', label: '收起触发器背景（悬浮）', usage: 'Sider 折叠触发器背景 - 悬浮' },
  'layout-sider-zero-trigger-width': { value: '24px', category: 'width', label: '零宽触发器宽度', usage: 'collapsedWidth=0 时浮动触发块宽度' },
  'layout-sider-zero-trigger-height': { value: '48px', category: 'height', label: '零宽触发器高度', usage: 'collapsedWidth=0 时浮动触发块高度' },
  'layout-motion-duration': { value: 'var(--cd-motion-duration-mid)', category: 'animation', label: '动画时长', usage: 'Sider 展开 / 收起过渡时长' },
  'layout-motion-ease': { value: 'var(--cd-motion-ease-standard)', category: 'animation', label: '动画缓动', usage: 'Sider 展开 / 收起缓动函数' },
} satisfies TokenGroup;
