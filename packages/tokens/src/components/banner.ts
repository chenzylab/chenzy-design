/**
 * Component tokens for Banner (M5 Feedback). 全量对齐 Semi Design
 * （semi-foundation/banner/variables.scss 22 个），并升级为带元数据的 TokenDef 结构以支持 DSM。
 * 值为 var() 引用我们的 alias / global token，或字面量。
 * 末尾保留 chenzy-design Banner 实际消费的补充 token（Semi 无；值对齐 Semi 语义），
 * 组件消费段读上方 Semi 对齐 token 或 alias，避免同名 var() 自引用死循环。
 *
 * Semi kebab 化：`_`/camelCase → kebab，`--semi-color-*` → `--cd-color-*`，
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
  'spacing-banner-extra-margintop': { value: 'var(--cd-spacing-tight)', category: 'spacing', label: '关闭按钮顶边距', usage: '关闭按钮顶边距' },
  'spacing-banner-icon-marginright': { value: 'var(--cd-spacing-base-tight)', category: 'spacing', label: '图标右边距', usage: '关闭按钮顶边距' },
  'spacing-banner-paddingx': { value: 'var(--cd-spacing-base-tight)', category: 'spacing', label: '整体水平内边距', usage: '整体水平内边距' },
  'spacing-banner-paddingy': { value: 'var(--cd-spacing-base-tight)', category: 'spacing', label: '整体垂直内边距', usage: '整体垂直内边距' },
  'spacing-banner-title-description-margintop': { value: '2px', category: 'spacing', label: '标题与描述间距', usage: '标题与描述信息的间距' },

  // —— 尺寸 / 描边宽度 ——
  'height-banner-closebtn': { value: '24px', category: 'height', label: '关闭按钮高度', usage: '关闭按钮高度' },
  'width-banner-closebtn': { value: '24px', category: 'width', label: '关闭按钮宽度', usage: '关闭按钮宽度' },
  'width-banner-border': { value: '1px', category: 'width', label: '描边宽度', usage: '描边宽度' },

  // —— chenzy-design Banner 实际消费的补充 token（Semi 无；值对齐 Semi 语义；组件消费） ——
  'banner-radius': { value: 'var(--cd-radius-banner)', category: 'radius', label: '横幅圆角', usage: 'card 形态圆角（组件消费）' },
  'banner-padding-y': { value: 'var(--cd-spacing-banner-paddingy)', category: 'spacing', label: '垂直内边距', usage: '横幅垂直内边距（组件消费）' },
  'banner-padding-x': { value: 'var(--cd-spacing-banner-paddingx)', category: 'spacing', label: '水平内边距', usage: '横幅水平内边距（组件消费）' },
  'banner-gap': { value: 'var(--cd-spacing-banner-icon-marginright)', category: 'spacing', label: '图标与内容间距', usage: '图标与内容区间距（组件消费）' },
  'banner-content-gap': { value: 'var(--cd-spacing-banner-title-description-margintop)', category: 'spacing', label: '标题与描述间距', usage: '标题与描述纵向间距（组件消费）' },
  'banner-icon-size': { value: '20px', category: 'width', label: '图标尺寸', usage: '语义图标尺寸（组件消费）' },
  'banner-accent-width': { value: '4px', category: 'width', label: '竖条宽度', usage: 'full 模式左侧 accent 竖条宽度（chenzy 设计，Semi 无 accent 竖条概念；组件消费）' },
  'banner-border-width': { value: 'var(--cd-width-banner-border)', category: 'width', label: '边框宽度', usage: 'card bordered 边框宽度（组件消费）' },
  'banner-border-color': { value: 'var(--cd-color-border)', category: 'color', label: '边框颜色', usage: 'card bordered 边框颜色（组件消费）' },
  'banner-title-color': { value: 'var(--cd-color-text-0)', category: 'color', label: '标题颜色', usage: '标题文本颜色（组件消费）' },
  'banner-title-size': { value: 'var(--cd-font-size-regular)', category: 'font', label: '标题字号', usage: '标题字号（组件消费）' },
  'banner-title-weight': { value: 'var(--cd-font-weight-medium)', category: 'font', label: '标题字重', usage: '标题字重（组件消费）' },
  'banner-desc-color': { value: 'var(--cd-color-text-1)', category: 'color', label: '描述颜色', usage: '描述文本颜色（组件消费）' },
  'banner-desc-size': { value: 'var(--cd-font-size-small)', category: 'font', label: '描述字号', usage: '描述字号（组件消费）' },
  // 四语义色（bg 用各自 *-light-default，accent/text 用对应语义色 —— 直读上方 Semi 对齐 token）
  'banner-info-bg': { value: 'var(--cd-color-banner-info-bg-default)', category: 'color', label: 'info 背景', usage: 'info 背景色（组件消费）' },
  'banner-info-accent': { value: 'var(--cd-color-banner-info-text-default)', category: 'color', label: 'info 强调色', usage: 'info 图标 / 竖条色（组件消费）' },
  'banner-success-bg': { value: 'var(--cd-color-banner-success-bg-default)', category: 'color', label: 'success 背景', usage: 'success 背景色（组件消费）' },
  'banner-success-accent': { value: 'var(--cd-color-banner-success-text-default)', category: 'color', label: 'success 强调色', usage: 'success 图标 / 竖条色（组件消费）' },
  'banner-warning-bg': { value: 'var(--cd-color-banner-warning-bg-default)', category: 'color', label: 'warning 背景', usage: 'warning 背景色（组件消费）' },
  'banner-warning-accent': { value: 'var(--cd-color-banner-warning-text-default)', category: 'color', label: 'warning 强调色', usage: 'warning 图标 / 竖条色（组件消费）' },
  'banner-danger-bg': { value: 'var(--cd-color-banner-danger-bg-default)', category: 'color', label: 'danger 背景', usage: 'danger 背景色（组件消费）' },
  'banner-danger-accent': { value: 'var(--cd-color-banner-danger-text-default)', category: 'color', label: 'danger 强调色', usage: 'danger 图标 / 竖条色（组件消费）' },
  // 关闭按钮
  'banner-close-color': { value: 'var(--cd-color-text-2)', category: 'color', label: '关闭按钮色', usage: '关闭按钮图标颜色（组件消费）' },
  'banner-close-hover-bg': { value: 'var(--cd-color-fill-1)', category: 'color', label: '关闭按钮悬浮背景', usage: '关闭按钮悬浮背景（组件消费）' },
  'banner-close-radius': { value: 'var(--cd-border-radius-small)', category: 'radius', label: '关闭按钮圆角', usage: '关闭按钮圆角（组件消费）' },
  'banner-motion-duration': { value: 'var(--cd-motion-duration-fast)', category: 'animation', label: '过渡时长', usage: '关闭按钮背景过渡时长（组件消费）' },
} satisfies TokenGroup;
