/**
 * Component tokens for Spin (M5 Feedback). 全量对齐 Semi Design
 * （semi-foundation/spin/variables.scss 仅 5 个变量），并升级为带元数据的 TokenDef
 * 结构以支持 DSM。值为 var() 引用我们的 alias / global token，或字面量。
 * 末尾保留 chenzy-design Spin 实际消费的补充 token（Semi 无 / 命名差异；组件消费）。
 *
 * 注：
 *  - Semi $width-spin_middle（20px）对应我们的默认尺寸。
 *  - Semi 无遮罩 / 动画时长 / z-index / tip 相关变量，均为 chenzy-design 补充，保留原名。
 */
import type { TokenGroup } from './token-def.js';

export const spinTokens = {
  // —— Semi 全量对齐（spin/variables.scss，5 变量） ——
  // Color
  'color-spin-bg': { value: 'var(--cd-color-primary)', category: 'color', label: '加载图标背景色', usage: '加载图标背景颜色' },
  // Width
  'width-spin-large': { value: '32px', category: 'width', label: '加载图标尺寸-大', usage: '加载图标尺寸 - 大' },
  'width-spin-middle': { value: '20px', category: 'width', label: '加载图标尺寸-中', usage: '加载图标尺寸 - 中' },
  'width-spin-small': { value: '14px', category: 'width', label: '加载图标尺寸-小', usage: '加载图标尺寸 - 小' },
  // Other
  'spin-opacity-children': { value: '0.5', category: 'other', label: '内容加载遮罩透明度', usage: 'loading 时被遮盖内容的半透明度（组件消费）' },

  // —— chenzy-design Spin 实际消费的补充 token（Semi 无 / 命名差异；组件消费） ——
  'spin-color': { value: 'var(--cd-color-spin-bg)', category: 'color', label: '指示器主色', usage: '加载指示器旋转弧线颜色（组件消费）' },
  'spin-track-color': { value: 'var(--cd-color-fill-1)', category: 'color', label: '指示器轨道色', usage: '加载指示器底部轨道颜色（组件消费）' },
  'spin-size-small': { value: 'var(--cd-width-spin-small)', category: 'width', label: '指示器尺寸-小', usage: '小尺寸加载指示器边长（组件消费）' },
  'spin-size-default': { value: 'var(--cd-width-spin-middle)', category: 'width', label: '指示器尺寸-默认', usage: '默认尺寸加载指示器边长（组件消费）' },
  'spin-size-large': { value: 'var(--cd-width-spin-large)', category: 'width', label: '指示器尺寸-大', usage: '大尺寸加载指示器边长（组件消费）' },
  'spin-duration': { value: '1s', category: 'animation', label: '旋转时长', usage: '加载指示器旋转一周时长（组件消费）' },
  'spin-duration-reduced': { value: '1.5s', category: 'animation', label: '呼吸时长', usage: 'reduced-motion 下呼吸动画时长（组件消费）' },
  'spin-tip-gap': { value: 'var(--cd-spacing-tight)', category: 'spacing', label: '指示器文案间距', usage: '指示器与 tip 文案间距（组件消费）' },
  'spin-tip-color': { value: 'var(--cd-color-text-1)', category: 'color', label: 'tip 文案色', usage: 'tip 文案颜色（组件消费）' },
  'spin-tip-font-size': { value: 'var(--cd-font-size-regular)', category: 'font', label: 'tip 文案字号', usage: 'tip 文案字号（组件消费）' },
  'spin-mask-bg': { value: 'rgba(255, 255, 255, 0.8)', category: 'color', label: '遮罩背景色', usage: 'wrapper / fullscreen 遮罩背景色（组件消费）' },
  'spin-z': { value: '10', category: 'other', label: '遮罩层级', usage: 'wrapper 遮罩 z-index（组件消费）' },
  'spin-z-fullscreen': { value: '1000', category: 'other', label: '全屏层级', usage: 'fullscreen 遮罩 z-index（组件消费）' },
  'spin-fade-duration': { value: 'var(--cd-motion-duration-fast)', category: 'animation', label: '淡入时长', usage: '遮罩淡入 / 内容模糊过渡时长（组件消费）' },
} satisfies TokenGroup;
