/**
 * Component tokens for Banner. 严格全量对齐 Semi Design
 * （semi-foundation/banner/variables.scss，22 个变量，无一增减）。
 * 组件样式直接消费下列 token，不再引入 Semi 没有的中间消费层。
 *
 * Semi kebab 化规则：`_`/camelCase → kebab，`--semi-color-*` → `--cd-color-*`，
 * `$spacing-*` → `--cd-spacing-*`，`var(--semi-border-radius-*)` → `var(--cd-border-radius-*)`，
 * 字面量（2px/24px/1px）忠实保留。
 * 注：Semi `$spacing-base-tight` = 12px、`$spacing-tight` = 8px，与我方 alias 同名同值。
 */
import type { TokenGroup } from './token-def.js';

export const bannerTokens = {
  // —— info（信息） ——
  'color-banner-info-bg-default': { value: 'var(--cd-color-info-light-default)', category: 'color', label: '背景色 - info', usage: '背景色 - info' },
  'color-banner-info-text-default': { value: 'var(--cd-color-info)', category: 'color', label: '文本颜色 - info', usage: '文本颜色 - info' },
  'color-banner-info-border-default': { value: 'var(--cd-color-info)', category: 'color', label: '描边颜色 - info', usage: '描边颜色 - info' },

  // —— warning（警告） ——
  'color-banner-warning-bg-default': { value: 'var(--cd-color-warning-light-default)', category: 'color', label: '背景色 - 警告', usage: '背景色 - 警告' },
  'color-banner-warning-text-default': { value: 'var(--cd-color-warning)', category: 'color', label: '文本颜色 - 警告', usage: '文本颜色 - 警告' },
  'color-banner-warning-border-default': { value: 'var(--cd-color-warning)', category: 'color', label: '描边颜色 - 警告', usage: '描边颜色 - 警告' },

  // —— success（成功） ——
  'color-banner-success-bg-default': { value: 'var(--cd-color-success-light-default)', category: 'color', label: '背景色 - 成功', usage: '背景色 - 成功' },
  'color-banner-success-text-default': { value: 'var(--cd-color-success)', category: 'color', label: '文本颜色 - 成功', usage: '文本颜色 - 成功' },
  'color-banner-success-border-default': { value: 'var(--cd-color-success)', category: 'color', label: '描边颜色 - 成功', usage: '描边颜色 - 成功' },

  // —— danger（危险） ——
  'color-banner-danger-bg-default': { value: 'var(--cd-color-danger-light-default)', category: 'color', label: '背景色 - 危险', usage: '背景色 - 危险' },
  'color-banner-danger-text-default': { value: 'var(--cd-color-danger)', category: 'color', label: '文本颜色 - 危险', usage: '文本颜色 - 危险' },
  'color-banner-danger-border-default': { value: 'var(--cd-color-danger)', category: 'color', label: '描边颜色 - 危险', usage: '描边颜色 - 危险' },

  // —— 圆角 ——
  'radius-banner': { value: 'var(--cd-border-radius-small)', category: 'radius', label: '圆角', usage: '圆角' },

  // —— 间距 ——
  'spacing-banner-closebtn-marginleft': { value: 'var(--cd-spacing-base-tight)', category: 'spacing', label: '关闭按钮左边距', usage: '关闭按钮左边距' },
  'spacing-banner-extra-margintop': { value: 'var(--cd-spacing-tight)', category: 'spacing', label: '额外内容顶边距', usage: '额外内容顶边距' },
  'spacing-banner-icon-marginright': { value: 'var(--cd-spacing-base-tight)', category: 'spacing', label: '图标右边距', usage: '图标右边距' },
  'spacing-banner-paddingx': { value: 'var(--cd-spacing-base-tight)', category: 'spacing', label: '整体水平内边距', usage: '整体水平内边距' },
  'spacing-banner-paddingy': { value: 'var(--cd-spacing-base-tight)', category: 'spacing', label: '整体垂直内边距', usage: '整体垂直内边距' },
  'spacing-banner-title-description-margintop': { value: '2px', category: 'spacing', label: '标题与描述间距', usage: '标题与描述信息的间距' },

  // —— 尺寸 / 描边宽度 ——
  'height-banner-closebtn': { value: '24px', category: 'height', label: '关闭按钮高度', usage: '关闭按钮高度' },
  'width-banner-closebtn': { value: '24px', category: 'width', label: '关闭按钮宽度', usage: '关闭按钮宽度' },
  'width-banner-border': { value: '1px', category: 'width', label: '描边宽度', usage: '描边宽度' },
} satisfies TokenGroup;
