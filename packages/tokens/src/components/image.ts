/**
 * Component tokens for Image (M4 Show). 对齐 Semi semi-foundation/image/variables.scss。
 * 逐条镜像 Semi 变量：名 → 值一一对应，DOM 结构消费点见 image.scss。
 *
 * 值映射（Semi → 本项目）：
 *   --semi-border-radius-small   → var(--cd-border-radius-small)
 *   --semi-border-radius-medium  → var(--cd-border-radius-medium)
 *   --semi-color-overlay-bg      → var(--cd-color-overlay-bg)
 *   --semi-color-white           → var(--cd-color-white)
 *   --semi-color-fill-0          → var(--cd-color-fill-0)
 *   --semi-color-disabled-text   → var(--cd-color-disabled-text)
 *
 * Semi 注释「明暗主题下一致，没采用变量写法」的固定 rgba 原样保留（对齐 Semi）：
 *   icon-bg / header-close-bg / footer-bg = rgba(0,0,0,0.75)
 *   divider-bg = rgba(255,255,255,0.5)  ·  disabled = rgba(249,249,249,0.35)  ·  spin = #ccc
 */
import type { TokenGroup } from './token-def.js';

export const imageTokens = {
  // ---- 圆角 ----
  'image-radius': {
    value: 'var(--cd-border-radius-small)',
    category: 'radius',
    label: '图像圆角',
    usage: '$radius-image：图片容器与 img 圆角',
  },
  'image-preview-footer-radius': {
    value: 'var(--cd-border-radius-medium)',
    category: 'radius',
    label: '预览操作区圆角',
    usage: '$radius-image_preview_footer：预览底部工具栏圆角',
  },

  // ---- 颜色 ----
  'image-mask-bg': {
    value: 'var(--cd-color-overlay-bg)',
    category: 'color',
    label: '蒙层背景',
    usage: '$color-image_mask-bg：图片 hover 预览蒙层背景',
  },
  'image-mask-info-text': {
    value: 'var(--cd-color-white)',
    category: 'color',
    label: '蒙层文字',
    usage: '$color-image_mask_info_text：蒙层「预览」文字颜色',
  },
  'image-status-bg': {
    value: 'var(--cd-color-fill-0)',
    category: 'color',
    label: '状态背景',
    usage: '$color-image_status-bg：加载失败/占位区背景',
  },
  'image-status-color': {
    value: 'var(--cd-color-disabled-text)',
    category: 'color',
    label: '状态图标色',
    usage: '$color-image_status：加载失败破图 icon 颜色',
  },
  'image-preview-bg': {
    value: 'var(--cd-color-overlay-bg)',
    category: 'color',
    label: '预览背景',
    usage: '$color-image_preview-bg：预览浮层遮罩背景',
  },
  'image-preview-icon-color': {
    value: 'var(--cd-color-white)',
    category: 'color',
    label: '预览切换图标色',
    usage: '$color-image_preview_icon：中部左右切换 icon 颜色',
  },
  'image-preview-header-color': {
    value: 'var(--cd-color-white)',
    category: 'color',
    label: '预览标题色',
    usage: '$color-image_preview_header：预览 header 文字颜色',
  },
  'image-preview-footer-icon-color': {
    value: 'var(--cd-color-white)',
    category: 'color',
    label: '预览工具栏图标色',
    usage: '$color-image_preview_footer_icon：footer icon/页码颜色',
  },
  'image-preview-footer-slider-rail-color': {
    value: 'var(--cd-color-white)',
    category: 'color',
    label: '预览滑轨色',
    usage: '$color-image_preview_footer_slider_rail：缩放 slider 滑轨颜色',
  },
  // 以下 Semi 明暗一致，固定 rgba（对齐 Semi 原值，不走变量）
  'image-preview-disabled-color': {
    value: 'rgba(249, 249, 249, 0.35)',
    category: 'color',
    label: '预览禁用色',
    usage: '$color-image_preview_disabled：禁用 icon 颜色（Semi 明暗一致）',
  },
  'image-preview-icon-bg': {
    value: 'rgba(0, 0, 0, 0.75)',
    category: 'color',
    label: '预览切换图标背景',
    usage: '$color-image_preview_icon-bg：中部切换 icon 圆形背景（Semi 明暗一致）',
  },
  'image-header-close-bg': {
    value: 'rgba(0, 0, 0, 0.75)',
    category: 'color',
    label: '关闭按钮 hover 背景',
    usage: '$color-image_header_close-bg：header 关闭 icon hover 背景（Semi 明暗一致）',
  },
  'image-preview-footer-bg': {
    value: 'rgba(0, 0, 0, 0.75)',
    category: 'color',
    label: '预览工具栏背景',
    usage: '$color-image_preview_footer-bg：footer 操作区背景（Semi 明暗一致）',
  },
  'image-preview-divider-bg': {
    value: 'rgba(255, 255, 255, 0.5)',
    category: 'color',
    label: '预览分割线色',
    usage: '$color-image-preview_divider-bg：footer 分割线颜色（Semi 明暗一致）',
  },
  'image-preview-image-spin-color': {
    value: '#ccc',
    category: 'color',
    label: '预览加载色',
    usage: '$color-image_preview_image_spin：预览图 Spin 加载颜色（Semi 明暗一致）',
  },

  // ---- 尺寸：中部切换 icon ----
  'image-preview-icon-size': {
    value: '40px',
    category: 'width',
    label: '切换图标尺寸',
    usage: '$width/height-image_preview_icon：中部左右切换 icon 宽高',
  },
  'image-preview-icon-offset-x': {
    value: '24px',
    category: 'spacing',
    label: '切换图标边距',
    usage: '$spacing-image_preview_icon-x：切换 icon 距页面左右距离',
  },

  // ---- 尺寸：header ----
  'image-preview-header-height': {
    value: '60px',
    category: 'height',
    label: '预览头高',
    usage: '$height-image_preview_header：预览 header 高度',
  },
  'image-preview-header-padding-x': {
    value: '24px',
    category: 'spacing',
    label: '预览头横向内边距',
    usage: '$spacing-image_preview_header-paddingX',
  },
  'image-preview-header-close-size': {
    value: '30px',
    category: 'width',
    label: '关闭热区尺寸',
    usage: '$width/height-image_preview_header_close：关闭 icon 热区宽高',
  },

  // ---- 尺寸：footer ----
  'image-preview-footer-height': {
    value: '48px',
    category: 'height',
    label: '预览工具栏高',
    usage: '$height-image_preview_footer：footer 操作区高度',
  },
  'image-preview-footer-padding-x': {
    value: '16px',
    category: 'spacing',
    label: '工具栏横向内边距',
    usage: '$spacing-image_preview_footer-paddingX',
  },
  'image-preview-footer-page-margin-x': {
    value: '12px',
    category: 'spacing',
    label: '页码横向外边距',
    usage: '$spacing-image_preview_footer_page-marginX：页码 x 外边距',
  },
  'image-preview-footer-gap': {
    value: '16px',
    category: 'spacing',
    label: '工具栏图标间距',
    usage: '$spacing-image_preview_footer_gap-marginLeft：icon 左外边距',
  },
  'image-preview-footer-divider-margin-x': {
    value: '16px',
    category: 'spacing',
    label: '分割线横向外边距',
    usage: '$spacing-image_preview_footer_divider-marginX',
  },

  // ---- 尺寸：footer slider ----
  'image-preview-footer-slider-width': {
    value: '132px',
    category: 'width',
    label: '缩放条宽',
    usage: '$width-image_preview_footer_slider：缩放 slider 宽度',
  },
  'image-preview-footer-slider-padding-x': {
    value: '16px',
    category: 'spacing',
    label: '缩放条横向内边距',
    usage: '$spacing-image_preview_footer_slider-paddingX',
  },
  'image-preview-footer-slider-height': {
    value: '2px',
    category: 'height',
    label: '缩放条轨高',
    usage: '$height-image_preview_footer_slider：slider 轨道高度',
  },
  'image-preview-footer-slider-handle-size': {
    value: '16px',
    category: 'width',
    label: '缩放条滑块尺寸',
    usage: '$width/height-image_preview_footer_slider_handle：slider 滑块宽高',
  },

  // ---- 蒙层文字上边距 ----
  'image-mask-info-text-margin-top': {
    value: '8px',
    category: 'spacing',
    label: '蒙层文字上边距',
    usage: '$spacing-image_mask_info_text-marginTop：蒙层「预览」文字距图标上边距',
  },

  // ---- z-index ----
  'image-preview-z': {
    value: '1070',
    category: 'other',
    label: '预览层级',
    usage: '$z-image_preview：预览浮层 z-index',
  },
} satisfies TokenGroup;
