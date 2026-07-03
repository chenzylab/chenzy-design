/**
 * Component tokens for Anchor. 全量对齐 Semi Design（semi-foundation/anchor/variables.scss
 * 26 个），升级为带元数据的 TokenDef 结构以支持 DSM。
 * 值为 var() 引用我们的 alias / global token，或字面量。
 * 末尾保留 chenzy-design Anchor 实际消费的补充 token（Semi 无：横排缩进等）。
 *
 * 注：Semi 的 var(--semi-color-white) 我们无对应 --cd-color-white alias，
 * 用最接近的 --cd-color-text-inverse（= #ffffff）替代，未发明新 alias。
 * Semi 的自引用（$color-anchor_title_active-text-hover: $color-anchor_title-text-hover）
 * 保留为 var() 自引用另一个 anchor token。
 */
import type { TokenGroup } from './token-def.js';

export const anchorTokens = {
  // —— Color：滑轨 slide ——
  'color-anchor-slide-default-bg-default': { value: 'var(--cd-color-border)', category: 'color', label: '滑轨背景色', usage: '滑轨背景颜色' },
  'color-anchor-slide-primary-bg-active': { value: 'var(--cd-color-primary)', category: 'color', label: '选中色-Primary', usage: '选中颜色 - Primary' },
  'color-anchor-slide-tertiary-bg-active': { value: 'var(--cd-color-tertiary)', category: 'color', label: '选中色-Tertiary', usage: '选中颜色 - Tietrary' },
  'color-anchor-slide-muted-bg-active': { value: 'var(--cd-color-text-inverse)', category: 'color', label: '选中色-Muted', usage: '选中颜色 - Muted' },

  // —— Color：标题文字 title ——
  'color-anchor-title-text-default': { value: 'var(--cd-color-text-2)', category: 'color', label: '文字色-未选中', usage: '文字颜色 - 未选中' },
  'color-anchor-title-text-hover': { value: 'var(--cd-color-tertiary-hover)', category: 'color', label: '文字色-未选中悬浮', usage: '文字颜色 - 未选中悬浮态' },
  'color-anchor-title-active-text-hover': { value: 'var(--cd-color-anchor-title-text-hover)', category: 'color', label: '文字色-选中悬浮', usage: '文字颜色 - 选中悬浮态' },
  'color-anchor-title-text-active': { value: 'var(--cd-color-text-0)', category: 'color', label: '文字色-选中', usage: '文字颜色 - 选中' },
  'color-anchor-title-text-disabled': { value: 'var(--cd-color-disabled-text)', category: 'color', label: '文字色-禁用', usage: '文字颜色 - 禁用' },

  'color-anchor-title-bg-default': { value: 'transparent', category: 'color', label: '标题背景色', usage: '背景色' },
  'color-anchor-title-bg-active': { value: 'transparent', category: 'color', label: '标题选中背景色', usage: '背景色 - 选中' },

  'color-anchor-title-outline-focus': { value: 'var(--cd-color-primary-light-active)', category: 'color', label: '轮廓聚焦色', usage: '轮廓 - 聚焦' },

  // —— Spacing ——
  'spacing-anchor-slide-left': { value: 'var(--cd-spacing-none)', category: 'spacing', label: '滑轨左侧位置', usage: '滑轨左侧位置' },
  'spacing-anchor-slide-top': { value: 'var(--cd-spacing-none)', category: 'spacing', label: '滑轨顶部位置', usage: '滑轨顶部位置' },
  'spacing-anchor-slide-default-y': { value: 'var(--cd-spacing-extra-tight)', category: 'spacing', label: '选项间距-默认', usage: '选项间距 - 默认' },
  'spacing-anchor-slide-small-y': { value: 'var(--cd-spacing-extra-tight)', category: 'spacing', label: '选项间距-紧凑', usage: '选项间距 - 紧凑' },
  'spacing-anchor-link-paddingleft': { value: 'var(--cd-spacing-tight)', category: 'spacing', label: '选项文字左边距', usage: '选项文字左边距' },
  'spacing-anchor-link-title-paddingtop': { value: 'var(--cd-spacing-extra-tight)', category: 'spacing', label: '选项文字顶部内边距', usage: '选项文字顶部内边距' },
  'spacing-anchor-link-title-paddingbottom': { value: 'var(--cd-spacing-extra-tight)', category: 'spacing', label: '选项文字底部内边距', usage: '选项文字底部内边距' },

  // —— Size ——
  'width-anchor-slide-default': { value: '2px', category: 'width', label: '滑轨宽度', usage: '滑轨宽度' },
  'height-anchor-slide-default': { value: '20px', category: 'height', label: '选项高度-默认', usage: '选项高度 - 默认' },
  'height-anchor-slide-small': { value: '16px', category: 'height', label: '选项高度-小尺寸', usage: '选项高度 - 小尺寸' },

  // —— Radius ——
  'radius-anchor-slide': { value: '1px', category: 'radius', label: '滑轨圆角', usage: '滑轨圆角' },

  // —— Width：轮廓 outline ——
  'width-anchor-outline': { value: '2px', category: 'width', label: '轮廓宽度', usage: 'anchor轮廓宽度' },
  'width-anchor-outlineoffset': { value: '-2px', category: 'width', label: '轮廓 outline-offset', usage: 'anchor轮廓 outline-offset 宽度' },
  'width-anchor-outline-border-radius': { value: '3px', category: 'width', label: '轮廓圆角', usage: 'anchor轮廓圆角' },

  // —— chenzy-design 补充（Semi 无）：组件实际消费 ——
  'anchor-link-color': { value: 'var(--cd-color-anchor-title-text-default)', category: 'color', label: '链接文字色', usage: '链接默认文字颜色（组件消费）' },
  'anchor-link-color-active': { value: 'var(--cd-color-anchor-title-text-active)', category: 'color', label: '链接选中文字色', usage: '链接选中/悬浮文字颜色（组件消费）' },
  'anchor-link-padding': { value: 'var(--cd-spacing-extra-tight) var(--cd-spacing-tight)', category: 'spacing', label: '链接内边距', usage: '链接文字内边距（组件消费）' },
  'anchor-indent': { value: 'var(--cd-spacing-base)', category: 'spacing', label: '嵌套缩进', usage: '多级嵌套子列表逐级缩进（组件消费）' },
  'anchor-rail-color': { value: 'var(--cd-color-anchor-slide-default-bg-default)', category: 'color', label: '滑轨底色', usage: '滑轨（rail）背景颜色（组件消费）' },
  'anchor-ink-color': { value: 'var(--cd-color-anchor-slide-primary-bg-active)', category: 'color', label: 'ink 颜色', usage: '激活链接 ink 边框颜色（组件消费）' },
  'anchor-ink-width': { value: 'var(--cd-width-anchor-slide-default)', category: 'width', label: 'ink 宽度', usage: '激活链接 ink 边框宽度（组件消费）' },
} satisfies TokenGroup;
