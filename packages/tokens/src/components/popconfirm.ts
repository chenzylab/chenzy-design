/**
 * Component tokens for Popconfirm (M5 Feedback). 全量对齐 Semi Design
 * （semi-foundation/popconfirm/variables.scss 23 个），并升级为带元数据的 TokenDef
 * 结构以支持 DSM。值为 var() 引用我们的 alias / global token，或字面量。
 * 末尾保留 chenzy-design Popconfirm 实际消费的补充 token（Semi 无 / 命名差异；组件消费）。
 *
 * 注：
 *  - Semi 的 $spacing-popconfirm-* calc 依赖同族 token，忠实翻译为 CSS calc(...)，
 *    引用本组 token 的 CSS 变量名（--cd-spacing-popconfirm-*，非自引用）。
 *  - $font-weight-bold → var(--cd-font-weight-bold)；var(--semi-border-radius-medium)
 *    → var(--cd-border-radius-medium)。
 *  - 末尾组件消费段沿用旧 token 名（--cd-popconfirm-*），值改读上面的 Semi token，
 *    与 Semi 语义 1:1；两段命名不同，无 var() 自引用死循环。
 */
import type { TokenGroup } from './token-def.js';

export const popconfirmTokens = {
  // —— Color ——
  'color-popconfirm-header-text': { value: 'var(--cd-color-text-0)', category: 'color', label: '标题文字颜色', usage: '标题文字颜色' },
  'color-popconfirm-body-text': { value: 'var(--cd-color-text-2)', category: 'color', label: '正文文字颜色', usage: '正文文字颜色' },
  'color-popconfirm-header-alert-icon': { value: 'var(--cd-color-warning)', category: 'color', label: '警示图标颜色', usage: '警示图标颜色' },

  // —— Width / Height ——
  'width-popconfirm-icon': { value: '24px', category: 'width', label: '图标宽度', usage: '图标宽度' },
  'width-popconfirm-close-btn': { value: '24px', category: 'width', label: '关闭按钮宽度', usage: '关闭按钮宽度' },
  'width-popconfirm-maxwidth': { value: '400px', category: 'width', label: '整体最大宽度', usage: '整体最大宽度' },

  // —— Spacing ——
  'spacing-popconfirm-top': { value: '24px', category: 'spacing', label: '顶部内边距', usage: '顶部内边距' },
  'spacing-popconfirm-bottom': { value: '20px', category: 'spacing', label: '底部内边距', usage: '底部内边距' },
  'spacing-popconfirm-btn-close-margin': { value: '24px', category: 'spacing', label: '关闭按钮外边距', usage: '关闭按钮顶部 & 右侧外边距' },
  'spacing-popconfirm-with-arrow-padding': { value: '12px', category: 'spacing', label: '带箭头内边距', usage: '顶部内边距' },
  'spacing-popconfirm-header-title-marginbottom': { value: '8px', category: 'spacing', label: 'header 标题底外边距', usage: 'header 标题底部外边距' },
  'spacing-popconfirm-header-content-p-padding': { value: '0', category: 'spacing', label: 'header 正文内边距', usage: 'header 正文内边距' },
  'spacing-popconfirm-header-content-p-margin': { value: '0', category: 'spacing', label: 'header 正文外边距', usage: 'header 正文外边距' },
  'spacing-popconfirm-body-p-padding': { value: '0', category: 'spacing', label: 'body 正文内边距', usage: 'body 正文内边距' },
  'spacing-popconfirm-body-p-margin': { value: '0', category: 'spacing', label: 'body 正文外边距', usage: 'body 正文外边距' },
  'spacing-popconfirm-footer-margintop': { value: '25px', category: 'spacing', label: 'footer 顶外边距', usage: 'footer 顶部外边距' },
  'spacing-popconfirm-footer-btn-marginright': { value: '8px', category: 'spacing', label: 'footer 按钮右外边距', usage: 'footer 按钮右侧外边距' },
  'spacing-popconfirm-popover-with-arrow-inner-padding': { value: 'calc(var(--cd-spacing-popconfirm-top) - var(--cd-spacing-popconfirm-with-arrow-padding)) calc(var(--cd-spacing-popconfirm-top) - var(--cd-spacing-popconfirm-with-arrow-padding)) calc(var(--cd-spacing-popconfirm-top) - var(--cd-spacing-popconfirm-with-arrow-padding)) calc(var(--cd-spacing-popconfirm-bottom) - var(--cd-spacing-popconfirm-with-arrow-padding))', category: 'spacing', label: '带箭头浮层内边距', usage: '带三角形箭头时的内边距' },
  'spacing-popconfirm-popover-with-arrow-inner-rtl-padding': { value: 'calc(var(--cd-spacing-popconfirm-top) - var(--cd-spacing-popconfirm-with-arrow-padding)) calc(var(--cd-spacing-popconfirm-bottom) - var(--cd-spacing-popconfirm-with-arrow-padding)) calc(var(--cd-spacing-popconfirm-top) - var(--cd-spacing-popconfirm-with-arrow-padding)) calc(var(--cd-spacing-popconfirm-top) - var(--cd-spacing-popconfirm-with-arrow-padding))', category: 'spacing', label: '带箭头浮层内边距(rtl)', usage: '带三角形箭头时的内边距(rtl)' },
  'spacing-popconfirm-popover-with-arrow-inner-btn-close-margintop': { value: 'calc(var(--cd-spacing-popconfirm-btn-close-margin) - var(--cd-spacing-popconfirm-with-arrow-padding))', category: 'spacing', label: '带箭头关闭按钮顶外边距', usage: '带三角形箭头时关闭按钮的顶部外边距' },
  'spacing-popconfirm-header-icon-marginright': { value: '12px', category: 'spacing', label: 'header 图标右外边距', usage: 'header 图标的右侧外边距' },

  // —— Font ——
  'font-popconfirm-header-title-fontweight': { value: 'var(--cd-font-weight-bold)', category: 'font', label: 'header 标题字重', usage: 'header 标题字重' },

  // —— Radius ——
  'radius-popconfirm-popover': { value: 'var(--cd-border-radius-medium)', category: 'radius', label: '气泡确认框圆角', usage: '气泡确认框圆角大小' },

  // —— chenzy-design Popconfirm 实际消费的补充 token（Semi 无 / 命名差异；值对齐 Semi；组件消费） ——
  'popconfirm-bg': { value: 'var(--cd-color-bg-0)', category: 'color', label: '浮层背景色', usage: '气泡浮层背景色（组件消费）' },
  'popconfirm-color-text': { value: 'var(--cd-color-popconfirm-header-text)', category: 'color', label: '文字颜色', usage: '标题文字颜色 = Semi header-text（组件消费）' },
  'popconfirm-color-text-secondary': { value: 'var(--cd-color-popconfirm-body-text)', category: 'color', label: '次要文字色', usage: '正文文字颜色 = Semi body-text text-2（组件消费）' },
  'popconfirm-border': { value: 'var(--cd-color-border)', category: 'color', label: '浮层边框色', usage: '气泡浮层边框颜色（组件消费）' },
  'popconfirm-shadow': { value: 'var(--cd-shadow-elevated)', category: 'other', label: '浮层阴影', usage: '气泡浮层投影（组件消费）' },
  'popconfirm-radius': { value: 'var(--cd-radius-popconfirm-popover)', category: 'radius', label: '浮层圆角', usage: '气泡浮层圆角 = Semi radius medium（组件消费）' },
  'popconfirm-padding': { value: 'var(--cd-spacing-popconfirm-top)', category: 'spacing', label: '浮层内边距', usage: '气泡浮层内边距 = Semi top 24（组件消费）' },
  'popconfirm-icon-color-danger': { value: 'var(--cd-color-danger)', category: 'color', label: '危险图标色', usage: 'danger 类型图标颜色（组件消费）' },
  'popconfirm-icon-color-warning': { value: 'var(--cd-color-popconfirm-header-alert-icon)', category: 'color', label: '警示图标色', usage: 'warning 类型图标颜色 = Semi alert-icon warning（组件消费）' },
  'popconfirm-icon-color-info': { value: 'var(--cd-color-popconfirm-header-alert-icon)', category: 'color', label: '提示图标色', usage: 'default 类型图标颜色 = Semi alert-icon warning（组件消费）' },
  'popconfirm-title-color': { value: 'var(--cd-color-popconfirm-header-text)', category: 'color', label: '标题颜色', usage: '标题文字颜色 = Semi header-text（组件消费）' },
  'popconfirm-title-size': { value: 'var(--cd-font-size-regular)', category: 'font', label: '标题字号', usage: '标题文字大小（组件消费）' },
  'popconfirm-title-weight': { value: 'var(--cd-font-popconfirm-header-title-fontweight)', category: 'font', label: '标题字重', usage: '标题字重 = Semi bold（组件消费）' },
  'popconfirm-content-size': { value: 'var(--cd-font-size-small)', category: 'font', label: '正文字号', usage: '正文文字大小（组件消费）' },
  'popconfirm-max-width': { value: 'var(--cd-width-popconfirm-maxwidth)', category: 'width', label: '最大宽度', usage: '浮层最大宽度 = Semi 400（组件消费）' },
  'popconfirm-z': { value: '1000', category: 'other', label: '层级', usage: '浮层 z-index（组件消费）' },
  'popconfirm-gap-footer': { value: 'var(--cd-spacing-popconfirm-footer-btn-marginright)', category: 'spacing', label: 'footer 按钮间距', usage: 'footer 按钮间距 = Semi 8（组件消费）' },
  'popconfirm-arrow-size': { value: '8px', category: 'width', label: '箭头尺寸', usage: '箭头三角边长（组件消费）' },
  'popconfirm-motion-duration': { value: 'var(--cd-motion-duration-fast)', category: 'animation', label: '动效时长', usage: '入场动效时长（组件消费）' },
  'popconfirm-motion-easing': { value: 'var(--cd-motion-ease-standard)', category: 'animation', label: '动效曲线', usage: '入场动效缓动曲线（组件消费）' },
  'popconfirm-body-gap': { value: 'var(--cd-spacing-popconfirm-header-icon-marginright)', category: 'spacing', label: '图标与内容间距', usage: 'body 图标与内容间距 = Semi header-icon-marginRight 12（组件消费）' },
  'popconfirm-title-gap': { value: 'var(--cd-spacing-popconfirm-header-title-marginbottom)', category: 'spacing', label: '标题与正文间距', usage: '标题与正文间距 = Semi header-title-marginBottom 8（组件消费）' },
  'popconfirm-footer-margin-top': { value: 'var(--cd-spacing-popconfirm-footer-margintop)', category: 'spacing', label: 'footer 顶外边距', usage: 'footer 顶部外边距 = Semi footer-marginTop 25（组件消费）' },
} satisfies TokenGroup;
