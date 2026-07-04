/**
 * Component tokens for AudioPlayer（M4 富媒体，对齐 Semi AudioPlayer）。
 * Semi 底层无第三方媒体库：纯封装原生 <audio> + 自建工具栏，深/浅双主题。
 * 值回退 Alias / 语义 token，禁写死。深浅差异由所引 alias（bg/fill/text）随主题切换承担，
 * 组件层只做语义映射；仅极少数需在组件层显式区分深浅的项走 var(..., fallback)。
 * 见 specs/components/show/AudioPlayer.spec.md §5。
 */
import type { TokenGroup } from './token-def.js';

export const audioPlayerTokens = {
  // 容器
  'audio-player-bg': {
    value: 'var(--cd-color-bg-2)',
    category: 'color',
    label: '背景色',
    usage: '播放器容器背景（深/浅随 bg alias 切换）',
  },
  'audio-player-radius': {
    value: 'var(--cd-border-radius-medium)',
    category: 'radius',
    label: '圆角',
    usage: '播放器容器圆角',
  },
  'audio-player-border': {
    value: 'var(--cd-color-border)',
    category: 'color',
    label: '描边色',
    usage: '播放器容器描边',
  },
  'audio-player-shadow': {
    value: 'var(--cd-shadow-elevated)',
    category: 'other',
    label: '阴影',
    usage: '播放器容器投影',
  },
  // 工具栏
  'audio-player-toolbar-bg': {
    value: 'var(--cd-color-fill-0)',
    category: 'color',
    label: '工具栏背景',
    usage: '工具栏背景填充',
  },
  'audio-player-icon': {
    value: 'var(--cd-color-text-1)',
    category: 'color',
    label: '图标色',
    usage: '工具栏图标默认色',
  },
  'audio-player-icon-hover': {
    value: 'var(--cd-color-text-0)',
    category: 'color',
    label: '图标色（悬浮）',
    usage: '工具栏图标悬浮/激活色',
  },
  'audio-player-icon-disabled': {
    value: 'var(--cd-color-text-3)',
    category: 'color',
    label: '图标色（禁用）',
    usage: '工具栏图标禁用色（如首/末曲上/下曲）',
  },
  // 进度条
  'audio-player-progress-track': {
    value: 'var(--cd-color-fill-1)',
    category: 'color',
    label: '进度轨道色',
    usage: '进度条未播放轨道色',
  },
  'audio-player-progress-played': {
    value: 'var(--cd-color-primary)',
    category: 'color',
    label: '已播放色',
    usage: '进度条已播放部分（品牌色）',
  },
  'audio-player-progress-thumb': {
    value: 'var(--cd-color-primary)',
    category: 'color',
    label: '进度手柄色',
    usage: '进度条拖拽手柄色',
  },
  'audio-player-progress-height': {
    value: '4px',
    category: 'height',
    label: '进度条高度',
    usage: '进度轨道高度',
  },
  // 文本
  'audio-player-title': {
    value: 'var(--cd-color-text-0)',
    category: 'color',
    label: '标题色',
    usage: '曲目标题文本色',
  },
  'audio-player-time': {
    value: 'var(--cd-color-text-2)',
    category: 'color',
    label: '时间色',
    usage: '当前/总时间文本色',
  },
  'audio-player-time-font-size': {
    value: 'var(--cd-font-size-small)',
    category: 'font',
    label: '时间字号',
    usage: '时间文本字号',
  },
  // 封面
  'audio-player-cover-size': {
    value: '48px',
    category: 'width',
    label: '封面尺寸',
    usage: '封面缩略图宽高',
  },
  'audio-player-cover-radius': {
    value: 'var(--cd-border-radius-small)',
    category: 'radius',
    label: '封面圆角',
    usage: '封面缩略图圆角',
  },
  // 动效
  'audio-player-motion-duration': {
    value: 'var(--cd-motion-duration-fast)',
    category: 'animation',
    label: '动画时长',
    usage: '图标/进度悬浮过渡时长',
  },
} satisfies TokenGroup;
