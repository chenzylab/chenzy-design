/**
 * Component tokens for VideoPlayer（Plus / Show）。对齐 Semi Design VideoPlayer。
 * 值为 var() 引用我们的 alias / global token，或字面量（半透明遮罩类，Semi 亦用字面量）。
 *
 * 双主题：Semi 的 `theme` prop 仅切换播放器背景色（dark / light），其余控件永远
 * 是深色玻璃底 + 浅色前景（控件栏叠在视频上，与页面主题无关）。因此这里的
 * bg-dark / bg-light 两个背景 token 由组件按 theme prop 选用，其余控件 token 单一。
 *
 * 注：
 *  - 已播放进度用 var(--cd-color-primary)（对齐 Semi 主色进度）。
 *  - 轨道 / 缓冲 / 遮罩用半透明白/黑字面量（Semi 控件叠在深色视频上，不走页面 alias，
 *    否则浅色主题下会失明）——与 slider rail 保留字面量同理。
 *  - 图标 / 文本用 var(--cd-color-white)（= #fff，控件玻璃底上的浅色前景）。
 */
import type { TokenGroup } from './token-def.js';

export const videoPlayerTokens = {
  // —— 背景（受 theme prop 切换）——
  'video-player-bg-dark': {
    value: '#1c1f23',
    category: 'color',
    label: '暗色主题背景',
    usage: '播放器容器背景（theme="dark"，对齐 Semi 深色底）',
  },
  'video-player-bg-light': {
    value: 'var(--cd-color-bg-0)',
    category: 'color',
    label: '亮色主题背景',
    usage: '播放器容器背景（theme="light"）',
  },

  // —— 控件栏 —— (玻璃底叠在视频上，与页面主题无关)
  'video-player-controls-bg': {
    value: 'linear-gradient(180deg, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.6))',
    category: 'color',
    label: '控件栏背景渐变',
    usage: '底部控件栏从透明到半黑的渐变遮罩',
  },
  'video-player-icon-color': {
    value: 'var(--cd-color-white)',
    category: 'color',
    label: '控件图标色',
    usage: '播放/暂停/音量等控件图标颜色（浅色前景）',
  },
  'video-player-icon-color-hover': {
    value: 'rgba(255, 255, 255, 0.85)',
    category: 'color',
    label: '控件图标悬浮色',
    usage: '控件图标 hover 时颜色',
  },
  'video-player-text-color': {
    value: 'var(--cd-color-white)',
    category: 'color',
    label: '控件文本色',
    usage: '时间 / 通知等控件文本颜色（浅色前景）',
  },

  // —— 进度条 ——
  'video-player-progress-track': {
    value: 'rgba(255, 255, 255, 0.3)',
    category: 'color',
    label: '进度轨道色',
    usage: '进度条未播放轨道背景',
  },
  'video-player-progress-buffered': {
    value: 'rgba(255, 255, 255, 0.5)',
    category: 'color',
    label: '缓冲进度色',
    usage: '进度条已缓冲部分颜色',
  },
  'video-player-progress-played': {
    value: 'var(--cd-color-primary)',
    category: 'color',
    label: '已播放进度色',
    usage: '进度条已播放部分颜色（对齐 Semi 主色）',
  },
  'video-player-progress-handle': {
    value: 'var(--cd-color-white)',
    category: 'color',
    label: '进度拖拽手柄色',
    usage: '进度条拖拽手柄颜色',
  },
  'video-player-marker-color': {
    value: 'rgba(255, 255, 255, 0.85)',
    category: 'color',
    label: '章节标记色',
    usage: '进度条章节标记点颜色',
  },
  'video-player-progress-height': {
    value: '4px',
    category: 'height',
    label: '进度条高度',
    usage: '进度条轨道高度',
  },
  'video-player-progress-height-active': {
    value: '6px',
    category: 'height',
    label: '进度条悬浮高度',
    usage: '进度条 hover / 拖拽时加粗高度',
  },
  'video-player-handle-size': {
    value: '12px',
    category: 'width',
    label: '拖拽手柄尺寸',
    usage: '进度条拖拽手柄直径',
  },

  // —— 通知（loading / stall / mirror 等瞬时提示）——
  'video-player-notification-bg': {
    value: 'rgba(0, 0, 0, 0.6)',
    category: 'color',
    label: '通知背景',
    usage: '中央瞬时通知气泡背景',
  },
  'video-player-notification-color': {
    value: 'var(--cd-color-white)',
    category: 'color',
    label: '通知文字色',
    usage: '中央瞬时通知文字颜色',
  },
  'video-player-notification-radius': {
    value: 'var(--cd-border-radius-medium)',
    category: 'radius',
    label: '通知圆角',
    usage: '中央瞬时通知气泡圆角',
  },

  // —— 下拉菜单（倍率 / 清晰度 / 线路）——
  'video-player-menu-bg': {
    value: 'rgba(28, 31, 35, 0.9)',
    category: 'color',
    label: '控件菜单背景',
    usage: '倍率 / 清晰度 / 线路下拉菜单背景',
  },
  'video-player-menu-item-color': {
    value: 'var(--cd-color-white)',
    category: 'color',
    label: '菜单项文字色',
    usage: '下拉菜单项文字颜色',
  },
  'video-player-menu-item-bg-hover': {
    value: 'rgba(255, 255, 255, 0.12)',
    category: 'color',
    label: '菜单项悬浮背景',
    usage: '下拉菜单项 hover 背景',
  },
  'video-player-menu-item-color-active': {
    value: 'var(--cd-color-primary)',
    category: 'color',
    label: '菜单项选中色',
    usage: '下拉菜单当前选中项文字颜色',
  },
  'video-player-menu-radius': {
    value: 'var(--cd-border-radius-medium)',
    category: 'radius',
    label: '菜单圆角',
    usage: '下拉菜单圆角',
  },

  // —— 布局 ——
  'video-player-radius': {
    value: 'var(--cd-border-radius-medium)',
    category: 'radius',
    label: '播放器圆角',
    usage: '播放器容器圆角',
  },
  'video-player-controls-gap': {
    value: 'var(--cd-spacing-tight)',
    category: 'spacing',
    label: '控件间距',
    usage: '控件栏内各控件间距',
  },
  'video-player-controls-padding': {
    value: 'var(--cd-spacing-base-tight)',
    category: 'spacing',
    label: '控件栏内边距',
    usage: '控件栏内边距',
  },
  'video-player-transition': {
    value: 'var(--cd-motion-duration-fast)',
    category: 'animation',
    label: '控件过渡时长',
    usage: '控件显隐 / 图标 hover 过渡时长',
  },
} satisfies TokenGroup;
