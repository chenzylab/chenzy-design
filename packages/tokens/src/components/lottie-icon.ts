/**
 * Component tokens for LottieIcon (M6 Other). 升级为带元数据的 TokenDef 结构以支持 DSM。
 * 回退 Alias，禁写死。Semi 无 semi-foundation/lottie/variables.scss，
 * 故保留 chenzy-design 自有 token 与现值。
 */
import type { TokenGroup } from './token-def.js';

export const lottieIconTokens = {
  'lottieicon-size': { value: '20px', category: 'width', label: '尺寸（默认）', usage: '动画图标默认宽高' },
  'lottieicon-size-small': { value: '16px', category: 'width', label: '尺寸（小）', usage: '小尺寸动画图标宽高' },
  'lottieicon-size-large': { value: '24px', category: 'width', label: '尺寸（大）', usage: '大尺寸动画图标宽高' },
  'lottieicon-color': { value: 'var(--cd-color-text-0)', category: 'color', label: '主色', usage: '可着色图层默认颜色' },
  'lottieicon-color-hover': { value: 'var(--cd-color-primary)', category: 'color', label: '主色（悬浮）', usage: '可着色图层悬浮颜色' },
  'lottieicon-bg-skeleton': { value: 'var(--cd-color-bg-1)', category: 'color', label: '骨架背景', usage: '加载占位骨架背景色' },
  'lottieicon-radius': { value: 'var(--cd-border-radius-small)', category: 'radius', label: '圆角', usage: '骨架 / 容器圆角' },
  'lottieicon-error-color': { value: 'var(--cd-color-danger)', category: 'color', label: '错误色', usage: '加载失败占位颜色' },
  'lottieicon-valign': { value: '-0.125em', category: 'other', label: '垂直对齐', usage: '随文本基线的垂直微调' },
} satisfies TokenGroup;
