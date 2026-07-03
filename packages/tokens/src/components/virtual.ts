/**
 * Component tokens for VirtualList & Carousel (M4 Show). 升级为带元数据的 TokenDef
 * 结构以支持 DSM。
 *
 * VirtualList 是底层虚拟滚动工具，Semi 无独立 variables.scss —— 保留自有 token / 现值。
 * Carousel 有 semi-foundation/carousel/variables.scss，但 Semi 按 dark/primary/light
 * 三主题各拆一组指示器 / 箭头 token（命名体系不同）；chenzy-design 收敛为单组透明度
 * token。透明度已对齐 Semi（light 指示器 .4 / dark 箭头 .5），箭头尺寸 32px 亦对齐
 * Semi $width-carousel_arrow。其余保留现值。
 */
import type { TokenGroup } from './token-def.js';

export const virtualTokens = {
  // —— VirtualList ——
  'virtual-list-bg': { value: 'var(--cd-color-bg-0)', category: 'color', label: '列表背景', usage: '虚拟列表容器背景色' },
  'virtual-list-scrollbar': { value: 'var(--cd-color-fill-1)', category: 'color', label: '滚动条颜色', usage: '虚拟列表滚动条颜色' },

  // —— Carousel ——
  'carousel-radius': { value: 'var(--cd-border-radius-large)', category: 'radius', label: '轮播圆角', usage: '轮播容器圆角' },
  // 半透明白/黑（透明度对齐 Semi light 指示器 .4 / dark 箭头 .5）
  'carousel-indicator-color': { value: 'rgba(255, 255, 255, 0.4)', category: 'color', label: '指示器颜色', usage: '指示器背景色 - 默认（对齐 Semi light .4）' },
  'carousel-indicator-color-active': { value: 'rgba(255, 255, 255, 1)', category: 'color', label: '指示器颜色（选中）', usage: '指示器背景色 - 选中' },
  'carousel-indicator-gap': { value: 'var(--cd-spacing-tight)', category: 'spacing', label: '指示器间距', usage: '指示器之间的间距' },
  'carousel-arrow-bg': { value: 'rgba(0, 0, 0, 0.5)', category: 'color', label: '箭头背景', usage: '切换箭头背景色（对齐 Semi dark .5）' },
  'carousel-arrow-color': { value: 'var(--cd-color-bg-0)', category: 'color', label: '箭头颜色', usage: '切换箭头图标颜色' },
  'carousel-arrow-size': { value: '32px', category: 'width', label: '箭头尺寸', usage: '切换箭头宽高（对齐 Semi $width-carousel_arrow）' },
} satisfies TokenGroup;
