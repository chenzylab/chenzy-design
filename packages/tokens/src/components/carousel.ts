/**
 * Component tokens for Carousel — token 名逐字照搬 Semi
 * `@douyinfe/semi-foundation/carousel/variables.scss`。
 *
 * 命名规则（同 calendar.ts）：Semi `$<cat>-carousel_<rest>` → `carousel-<cat>-<rest>`
 *   （cat = color/width/height/spacing/radius；`_`→`-`；驼峰拆为小写连字符；保留 Semi 拼写）。
 *   保留 cat 段以消除 Semi `$width-`/`$height-` 同名冲突。
 *
 * 值对齐 Semi 真实语义并关联项目色板：
 *   - `rgba(var(--semi-black), α)`  → `rgba(0, 0, 0, α)`（项目 black = rgba(0,0,0,1)）。
 *   - `rgba(var(--semi-white), α)`  → `rgba(255, 255, 255, α)`（项目 white = rgba(255,255,255,1)）。
 *   - `rgba(var(--semi-blue-6), α)` → `color-mix(... var(--cd-color-primary) N%, transparent)`
 *       关联主色 token（α=1 时直接取 var(--cd-color-primary)）。
 *   - transition 曲线/时长直接引用项目动效 token。
 *
 * 名、值、作用 DOM 均与 Semi 一致；仅保留 Carousel.svelte 实际消费的变量。
 */
import type { TokenGroup } from './token-def.js';

export const carouselTokens = {
  // ============================ Color · 指示器（$color-carousel_indicator_*）============================
  // dark 主题：rgba(var(--semi-black), .5/.7/1)
  'carousel-color-indicator-theme-dark-bg-default': { value: 'rgba(0, 0, 0, 0.5)', category: 'color', label: '深色指示器背景-默认', usage: 'Semi $color-carousel_indicator_theme_dark-bg-default（.indicator-item-dark 默认底）' },
  'carousel-color-indicator-theme-dark-bg-hover': { value: 'rgba(0, 0, 0, 0.7)', category: 'color', label: '深色指示器背景-悬浮', usage: 'Semi $color-carousel_indicator_theme_dark-bg-hover（.indicator-item-dark:hover 底）' },
  'carousel-color-indicator-theme-dark-bg-active': { value: 'rgba(0, 0, 0, 1)', category: 'color', label: '深色指示器背景-选中', usage: 'Semi $color-carousel_indicator_theme_dark-bg-active（.indicator-item-dark-active 底）' },

  // primary 主题：rgba(var(--semi-blue-6), .4/.7/1)
  'carousel-color-indicator-theme-primary-bg-default': { value: 'color-mix(in srgb, var(--cd-color-primary) 40%, transparent)', category: 'color', label: '主色指示器背景-默认', usage: 'Semi $color-carousel_indicator_theme_primary-bg-default（.indicator-item-primary 默认底）' },
  'carousel-color-indicator-theme-primary-bg-hover': { value: 'color-mix(in srgb, var(--cd-color-primary) 70%, transparent)', category: 'color', label: '主色指示器背景-悬浮', usage: 'Semi $color-carousel_indicator_theme_primary-bg-hover（.indicator-item-primary:hover 底）' },
  'carousel-color-indicator-theme-primary-bg-active': { value: 'var(--cd-color-primary)', category: 'color', label: '主色指示器背景-选中', usage: 'Semi $color-carousel_indicator_theme_primary-bg-active（.indicator-item-primary-active 底）' },

  // light 主题：rgba(var(--semi-white), .4/.7/1)
  'carousel-color-indicator-theme-light-bg-default': { value: 'rgba(255, 255, 255, 0.4)', category: 'color', label: '浅色指示器背景-默认', usage: 'Semi $color-carousel_indicator_theme_light-bg-default（.indicator-item-light 默认底）' },
  'carousel-color-indicator-theme-light-bg-hover': { value: 'rgba(255, 255, 255, 0.7)', category: 'color', label: '浅色指示器背景-悬浮', usage: 'Semi $color-carousel_indicator_theme_light-bg-hover（.indicator-item-light:hover 底）' },
  'carousel-color-indicator-theme-light-bg-active': { value: 'rgba(255, 255, 255, 1)', category: 'color', label: '浅色指示器背景-选中', usage: 'Semi $color-carousel_indicator_theme_light-bg-active（.indicator-item-light-active 底）' },

  // ============================ Color · 箭头（$color-carousel_arrow_*）============================
  // dark：rgba(var(--semi-black), .5/1)
  'carousel-color-arrow-theme-dark-bg-default': { value: 'rgba(0, 0, 0, 0.5)', category: 'color', label: '深色箭头色-默认', usage: 'Semi $color-carousel_arrow_theme_dark-bg-default（.arrow-dark 默认色）' },
  'carousel-color-arrow-theme-dark-bg-hover': { value: 'rgba(0, 0, 0, 1)', category: 'color', label: '深色箭头色-悬浮', usage: 'Semi $color-carousel_arrow_theme_dark-bg-hover（.arrow-dark:hover 色）' },

  // primary：rgba(var(--semi-blue-6), .4/1)
  'carousel-color-arrow-theme-primary-bg-default': { value: 'color-mix(in srgb, var(--cd-color-primary) 40%, transparent)', category: 'color', label: '主色箭头色-默认', usage: 'Semi $color-carousel_arrow_theme_primary-bg-default（.arrow-primary 默认色）' },
  'carousel-color-arrow-theme-primary-bg-hover': { value: 'var(--cd-color-primary)', category: 'color', label: '主色箭头色-悬浮', usage: 'Semi $color-carousel_arrow_theme_primary-bg-hover（.arrow-primary:hover 色）' },

  // light：rgba(var(--semi-white), .4/1)
  'carousel-color-arrow-theme-light-bg-default': { value: 'rgba(255, 255, 255, 0.4)', category: 'color', label: '浅色箭头色-默认', usage: 'Semi $color-carousel_arrow_theme_light-bg-default（.arrow-light 默认色）' },
  'carousel-color-arrow-theme-light-bg-hover': { value: 'rgba(255, 255, 255, 1)', category: 'color', label: '浅色箭头色-悬浮', usage: 'Semi $color-carousel_arrow_theme_light-bg-hover（.arrow-light:hover 色）' },

  // ============================ Width（$width-carousel_*）============================
  'carousel-width-indicator-line': { value: '240px', category: 'width', label: '条状指示器最大宽', usage: 'Semi $width-carousel_indicator_line（.indicator-line 容器宽）' },
  'carousel-width-indicator-columnar-small': { value: '4px', category: 'width', label: '小柱状指示器宽', usage: 'Semi $width-carousel_indicator_columnar_small（.indicator-columnar-item-small 宽）' },
  'carousel-width-indicator-columnar-medium': { value: '6px', category: 'width', label: '中柱状指示器宽', usage: 'Semi $width-carousel_indicator_columnar_medium（.indicator-columnar-item-medium 宽）' },
  'carousel-width-indicator-dot-small': { value: '8px', category: 'width', label: '小点状指示器宽', usage: 'Semi $width-carousel_indicator_dot_small（.indicator-dot-item-small 宽/高）' },
  'carousel-width-indicator-dot-medium': { value: '12px', category: 'width', label: '中点状指示器宽', usage: 'Semi $width-carousel_indicator_dot_medium（.indicator-dot-item-medium 宽/高）' },
  'carousel-width-arrow': { value: '32px', category: 'width', label: '箭头字号', usage: 'Semi $width-carousel_arrow（.arrow font-size）' },

  // ============================ Height（$height-carousel_*）============================
  'carousel-height-indicator-columnar-small-default': { value: '12px', category: 'height', label: '小柱状指示器高-默认', usage: 'Semi $height-carousel_indicator_columnar_small_default（.indicator-columnar-item-small 高）' },
  'carousel-height-indicator-columnar-small-active': { value: '20px', category: 'height', label: '小柱状指示器高-选中', usage: 'Semi $height-carousel_indicator_columnar_small_active（.indicator-columnar-item-small-active 高）' },
  'carousel-height-indicator-columnar-medium-default': { value: '20px', category: 'height', label: '中柱状指示器高-默认', usage: 'Semi $height-carousel_indicator_columnar_medium_default（.indicator-columnar-item-medium 高）' },
  'carousel-height-indicator-columnar-medium-active': { value: '28px', category: 'height', label: '中柱状指示器高-选中', usage: 'Semi $height-carousel_indicator_columnar_medium_active（.indicator-columnar-item-medium-active 高）' },
  'carousel-height-indicator-line-small': { value: '4px', category: 'height', label: '小条状指示器高', usage: 'Semi $height-carousel_indicator_line_small（.indicator-line-item-small 高）' },
  'carousel-height-indicator-line-medium': { value: '6px', category: 'height', label: '中条状指示器高', usage: 'Semi $height-carousel_indicator_line_medium（.indicator-line-item-medium 高）' },

  // ============================ Radius（$radius-carousel_*）============================
  'carousel-radius-indicator-dot': { value: '50%', category: 'radius', label: '点状指示器圆角', usage: 'Semi $radius-carousel_indicator_dot（.indicator-dot-item 圆角）' },

  // ============================ Spacing（$spacing-carousel_*）============================
  'carousel-spacing-indicator-padding': { value: '32px', category: 'spacing', label: '指示器绝对定位内边距', usage: 'Semi $spacing-carousel_indicator-padding（.indicator-left/center/right 边距）' },
  'carousel-spacing-indicator-columnar-marginx': { value: '4px', category: 'spacing', label: '柱状指示器水平间距', usage: 'Semi $spacing-carousel_indicator_columnar-marginX（.indicator-columnar-item margin）' },
  'carousel-spacing-indicator-line-marginx': { value: '4px', category: 'spacing', label: '条状指示器水平间距', usage: 'Semi $spacing-carousel_indicator_line-marginX（.indicator-line-item margin）' },
  'carousel-spacing-indicator-dot-marginx': { value: '8px', category: 'spacing', label: '点状指示器水平间距', usage: 'Semi $spacing-carousel_indicator_dot-marginX（.indicator-dot-item margin）' },
  'carousel-spacing-arrow-left': { value: '20px', category: 'spacing', label: '左箭头定位', usage: 'Semi $spacing-carousel_arrow-left（.arrow-prev left）' },
  'carousel-spacing-arrow-right': { value: '20px', category: 'spacing', label: '右箭头定位', usage: 'Semi $spacing-carousel_arrow-right（.arrow-next right）' },

  // ============================ Animation（$transition_*_carousel_*）============================
  // Semi 用 easeOut；项目动效档最接近的是 ease-standard（cubic-bezier(.4,0,.2,1)）。
  'carousel-animation-transition-function': { value: 'var(--cd-motion-ease-standard)', category: 'animation', label: '指示器/箭头过渡曲线', usage: 'Semi $transition_function_carousel_*（背景/文字色过渡 easeOut）' },
  'carousel-animation-transition-duration': { value: 'var(--cd-motion-duration-none)', category: 'animation', label: '指示器/箭头过渡时长', usage: 'Semi $transition_duration_carousel_*（背景/文字色过渡时长 none）' },
  'carousel-animation-transition-delay': { value: 'var(--cd-motion-duration-none)', category: 'animation', label: '指示器/箭头过渡延迟', usage: 'Semi $transition_delay_carousel_*（背景/文字色过渡延迟 none）' },
} satisfies TokenGroup;
