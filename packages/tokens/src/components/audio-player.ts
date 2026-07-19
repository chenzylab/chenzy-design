/**
 * Component tokens for AudioPlayer — 严格镜像 Semi semi-foundation/audioPlayer/variables.scss（40 个）。
 * 命名/值对齐 Semi：`$color-audio-player-background` → `--cd-color-audio-player-background` 等；
 * 值 `rgba(var(--semi-x-n),a)` → alpha=1 用 `var(--cd-color-x-n)`，alpha<1 用 color-mix；
 * `var(--semi-color-*)` → `var(--cd-color-*)`；字面量原样。深/浅双主题各一套色值（Semi 用 -light 后缀区分）。
 * 见 plus 对齐工程 [[plus-components-align-semi-batch]]。
 */
import type { TokenGroup } from './token-def.js';

export const audioPlayerTokens = {
  // —— Dark 主题颜色（5，对齐 Semi）——
  'color-audio-player-background': {
    value: 'color-mix(in srgb, var(--cd-color-grey-9) 80%, transparent)',
    category: 'color',
    label: '容器背景(dark)',
    usage: '根容器背景（dark，对齐 Semi rgba(grey-9,.8)）',
  },
  'color-audio-player-control-icon': {
    value: 'var(--cd-color-bg-0)',
    category: 'color',
    label: '控制图标色(dark)',
    usage: '控制按钮图标色；也用作 play 按钮背景（对齐 Semi color-bg-0）',
  },
  'color-audio-player-control-icon-play': {
    value: 'var(--cd-color-text-0)',
    category: 'color',
    label: 'play 图标色(dark)',
    usage: 'play 按钮图标色（对齐 Semi color-text-0）',
  },
  'color-audio-player-font-color': {
    value: 'var(--cd-color-bg-0)',
    category: 'color',
    label: '文字色(dark)',
    usage: 'info-title / info-time 文字色（对齐 Semi color-bg-0）',
  },
  'color-audio-player-font-color-speed': {
    value: 'var(--cd-color-grey-8)',
    category: 'color',
    label: '倍速/音量面板背景(dark)',
    usage: '倍速块 / 倍速菜单 / 音量面板背景（对齐 Semi grey-8）',
  },

  // —— Light 主题颜色（4，对齐 Semi）——
  'color-audio-player-background-light': {
    value: 'var(--cd-color-bg-0)',
    category: 'color',
    label: '容器背景(light)',
    usage: '根容器背景（light，对齐 Semi color-bg-0）',
  },
  'color-audio-player-control-icon-light': {
    value: 'var(--cd-color-grey-9)',
    category: 'color',
    label: '控制图标色(light)',
    usage: 'light 控制图标；play 按钮背景（light，对齐 Semi grey-9）',
  },
  'color-audio-player-control-icon-play-light': {
    value: 'var(--cd-color-bg-0)',
    category: 'color',
    label: 'play 图标色(light)',
    usage: 'play 图标色（light，对齐 Semi color-bg-0）',
  },
  'color-audio-player-font-color-light': {
    value: 'var(--cd-color-grey-9)',
    category: 'color',
    label: '文字色(light)',
    usage: 'info-title/time 文字（light，对齐 Semi grey-9）',
  },

  // —— 字号（1）——
  'font-size-audio-player-text': {
    value: '14px',
    category: 'font',
    label: '正文字号',
    usage: 'info-title/time 字号（对齐 Semi 14px）',
  },

  // —— 间距 gap（3）——
  'gap-audio-player-small': {
    value: '4px',
    category: 'spacing',
    label: '小间距',
    usage: 'info gap / error / time span 间距（对齐 Semi 4px；音量面板 gap 用 *2=8px）',
  },
  'gap-audio-player-medium': {
    value: '16px',
    category: 'spacing',
    label: '中间距',
    usage: 'control gap / info-container gap（对齐 Semi 16px）',
  },
  'gap-audio-player-large': {
    value: '24px',
    category: 'spacing',
    label: '大间距',
    usage: '根容器 gap（对齐 Semi 24px）',
  },

  // —— 尺寸（9）——
  'width-audio-player-max': {
    value: '1440px',
    category: 'width',
    label: '最大宽度',
    usage: '根 max-width（对齐 Semi 1440px）',
  },
  'height-audio-player': {
    value: '78px',
    category: 'height',
    label: '容器高度',
    usage: '根高度（对齐 Semi 78px）',
  },
  'width-audio-player-slider': {
    value: '323px',
    category: 'width',
    label: '进度条容器宽',
    usage: 'slider-container 宽（对齐 Semi 323px）',
  },
  'width-audio-player-speed': {
    value: '40px',
    category: 'width',
    label: '倍速块宽',
    usage: '倍速块宽（对齐 Semi 40px）',
  },
  'height-audio-player-speed': {
    value: '24px',
    category: 'height',
    label: '倍速块高',
    usage: '倍速块高（对齐 Semi 24px）',
  },
  'width-audio-player-speed-menu': {
    value: '65px',
    category: 'width',
    label: '倍速菜单宽',
    usage: '倍速菜单宽（对齐 Semi 65px）',
  },
  'width-audio-player-volume': {
    value: '43px',
    category: 'width',
    label: '音量面板宽',
    usage: '音量面板宽（对齐 Semi 43px）',
  },
  'height-audio-player-volume': {
    value: '164px',
    category: 'height',
    label: '音量面板高',
    usage: '音量面板高（对齐 Semi 164px）',
  },
  'height-audio-player-time': {
    value: '22px',
    category: 'height',
    label: '时间行高',
    usage: 'info-time 高（对齐 Semi 22px）',
  },

  // —— 圆角（3）——
  'border-radius-audio-player-speed': {
    value: '3px',
    category: 'radius',
    label: '倍速块圆角',
    usage: '倍速块圆角（对齐 Semi 3px）',
  },
  'border-radius-audio-player-volume': {
    value: '4px',
    category: 'radius',
    label: '音量面板圆角',
    usage: '音量面板圆角（对齐 Semi 4px）',
  },
  'border-radius-audio-player-slider': {
    value: '9999px',
    category: 'radius',
    label: 'slider 圆角',
    usage: 'slider / progress 圆角（对齐 Semi 9999px）',
  },

  // —— 小字号 + 行高（2）——
  'font-size-audio-player-small': {
    value: '12px',
    category: 'font',
    label: '小字号',
    usage: '倍速/音量标题字号（对齐 Semi 12px）',
  },
  'line-height-audio-player-small': {
    value: '16px',
    category: 'font',
    label: '小字行高',
    usage: '倍速/音量标题行高（对齐 Semi 16px）',
  },

  // —— Slider 尺寸（2）——
  'width-audio-player-slider-bar': {
    value: '4px',
    category: 'width',
    label: 'slider 条厚度',
    usage: 'slider 条厚度（对齐 Semi 4px）',
  },
  'size-audio-player-slider-dot': {
    value: '16px',
    category: 'width',
    label: '拖拽圆点尺寸',
    usage: '拖拽圆点宽高（对齐 Semi 16px）',
  },

  // —— 其它颜色（6）——
  'color-audio-player-disabled-bg': {
    value: 'color-mix(in srgb, var(--cd-color-grey-0) 35%, transparent)',
    category: 'color',
    label: 'play 禁用背景(dark)',
    usage: 'play 禁用背景（dark，对齐 Semi rgba(grey-0,.35)）',
  },
  'color-audio-player-slider-bg': {
    value: 'var(--cd-color-grey-5)',
    category: 'color',
    label: 'slider 轨道色(dark)',
    usage: 'slider 轨道底色（dark，对齐 Semi grey-5）',
  },
  'color-audio-player-slider-bg-light': {
    value: 'var(--cd-color-grey-2)',
    category: 'color',
    label: 'slider 轨道色(light)',
    usage: 'slider 轨道底色（light，对齐 Semi grey-2）',
  },
  'color-audio-player-slider-progress': {
    value: 'var(--cd-color-blue-4)',
    category: 'color',
    label: '进度填充色',
    usage: '进度条填充色（对齐 Semi blue-4）',
  },
  'color-audio-player-slider-dot-bg': {
    value: 'var(--cd-color-white)',
    category: 'color',
    label: '拖拽圆点背景',
    usage: '拖拽圆点背景（对齐 Semi white）',
  },
  'color-audio-player-disabled-text': {
    value: 'var(--cd-color-grey-7)',
    category: 'color',
    label: 'play 禁用图标色(dark)',
    usage: 'play 禁用图标色（dark，对齐 Semi color-grey-7）',
  },

  // —— 补充颜色（5）——
  'color-audio-player-text-default': {
    value: 'var(--cd-color-grey-0)',
    category: 'color',
    label: '默认文字色',
    usage: '倍速菜单项 / 音量标题文字（对齐 Semi color-default=grey-0）',
  },
  'color-audio-player-light-disabled-bg': {
    value: 'var(--cd-color-disabled-text)',
    category: 'color',
    label: 'play 禁用背景(light)',
    usage: 'play 禁用背景（light，对齐 Semi color-disabled-text）',
  },
  'color-audio-player-light-disabled-text': {
    value: 'var(--cd-color-white)',
    category: 'color',
    label: 'play 禁用图标色(light)',
    usage: 'play 禁用图标色（light，对齐 Semi white）',
  },
  'color-audio-player-light-text': {
    value: 'var(--cd-color-grey-9)',
    category: 'color',
    label: '菜单项文字(light)',
    usage: '倍速菜单项 / 音量标题文字（light，对齐 Semi grey-9）',
  },
  'color-audio-player-light-hover-bg': {
    value: 'var(--cd-color-grey-1)',
    category: 'color',
    label: '菜单项 hover 背景(light)',
    usage: '倍速菜单项 hover 背景（light，对齐 Semi grey-1）',
  },
} satisfies TokenGroup;
