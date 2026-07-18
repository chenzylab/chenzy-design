/**
 * Component tokens for Form. 全量对齐 Semi Design（semi-foundation/form/variables.scss
 * 53 行，~40 个有效变量），并升级为带元数据的 TokenDef 结构以支持 DSM。
 * 值为 var() 引用我们的 alias / global token，或字面量。
 * 分五组：field / label / extra / errormessage / section。
 * 组件直接消费这些 Semi 对齐 token（去中间层：不再插一层短名别名，对齐 Space/Toast）。
 * 末尾仅保留 2 个 spinner 超集 token（Semi 无异步校验指示器）。
 *
 * 映射约定（逐条亲验 Semi variables.scss + 我们的 global/scales.ts + alias/index.ts）：
 * - Semi `var(--semi-color-*)` → 我们 `var(--cd-color-*)`（语义名一一对应）。
 * - Semi `$spacing-base/-base-tight/-extra-tight/-tight/-super-tight/-super-loose`
 *   → 我们 `var(--cd-spacing-*)` 同名（已全部存在于生成 CSS）。
 * - Semi `$font-weight-bold` → 我们 `var(--cd-font-weight-bold)`。
 * - Semi `$height-control-default` → 我们 `var(--cd-control-height-default)`。
 * - Semi `$border-thickness-control` → 我们 `var(--cd-border-thickness-control)`。
 * - Semi `var(--semi-color-tertiary)` → `var(--cd-color-tertiary)`；
 *   `var(--semi-color-disabled-text)` → `var(--cd-color-disabled-text)`。
 * - calc：Semi `($height-control-default - 20px) * 0.5`
 *   → `calc((var(--cd-control-height-default) - 20px) * 0.5)`（同理 24px）；
 *   `$spacing-super-loose - $spacing-base-tight`
 *   → `calc(var(--cd-spacing-super-loose) - var(--cd-spacing-base-tight))`。
 * - 字面量（0px / 0）保留字面量。
 */
import type { TokenGroup } from './token-def.js';

export const formTokens = {
  // —— form field ——
  'spacing-form-field-horizontal-paddingright': { value: 'var(--cd-spacing-base)', category: 'spacing', label: '水平项右内边距', usage: '水平布局表单项右侧内边距' },
  'spacing-form-field-group-horizontal-paddingright': { value: 'var(--cd-spacing-base)', category: 'spacing', label: '水平组标题右内边距', usage: '水平布局表单组标题右侧内边距' },
  'spacing-form-field-vertical-paddingtop': { value: 'var(--cd-spacing-base-tight)', category: 'spacing', label: '垂直项上内边距', usage: '表单项顶部内边距（垂直布局）' },
  'spacing-form-field-vertical-paddingbottom': { value: 'var(--cd-spacing-base-tight)', category: 'spacing', label: '垂直项下内边距', usage: '表单项底部内边距（垂直布局）' },
  'spacing-form-field-group-vertical-paddingtop': { value: 'var(--cd-spacing-base-tight)', category: 'spacing', label: '垂直组上内边距', usage: '垂直布局表单组顶部内边距' },
  'spacing-form-field-group-vertical-paddingbottom': { value: 'var(--cd-spacing-base-tight)', category: 'spacing', label: '垂直组下内边距', usage: '垂直布局表单组底部内边距' },

  // —— form label ——
  'spacing-form-label-paddingright': { value: 'var(--cd-spacing-base)', category: 'spacing', label: '标签右内边距', usage: '表单项标签右侧边距（水平布局）' },
  'spacing-form-label-paddingtop': { value: 'calc((var(--cd-control-height-default) - 20px) * 0.5)', category: 'spacing', label: '标签上内边距', usage: '表单项标签顶部内边距（水平布局）' },
  'spacing-form-label-marginbottom': { value: 'var(--cd-spacing-extra-tight)', category: 'spacing', label: '标签下外边距', usage: '表单项标签底部外边距' },
  'spacing-form-label-margintop': { value: '0px', category: 'spacing', label: '标签上外边距', usage: '表单项标签顶部外边距' },
  'spacing-form-label-extra-marginleft': { value: 'var(--cd-spacing-extra-tight)', category: 'spacing', label: '额外信息左边距', usage: '表单项标签额外信息左侧边距' },
  'spacing-form-label-required-marginleft': { value: 'var(--cd-spacing-extra-tight)', category: 'spacing', label: '必填标志左边距', usage: '表单项标签必填标志左侧边距' },
  'spacing-form-label-posleft-marginright': { value: '0', category: 'spacing', label: '左标签右外边距', usage: '表单项左侧标签右侧外边距' },
  'spacing-form-label-posleft-marginbottom': { value: '0', category: 'spacing', label: '左标签下外边距', usage: '表单项左侧标签底部外边距' },
  'spacing-form-label-postop-paddingtop': { value: 'var(--cd-spacing-extra-tight)', category: 'spacing', label: '顶标签上内边距', usage: '表单项顶部标签顶部边距' },
  'spacing-form-label-postop-paddingbottom': { value: 'var(--cd-spacing-extra-tight)', category: 'spacing', label: '顶标签下内边距', usage: '表单项顶部标签底部边距' },

  // —— form extra ——
  'spacing-form-extra-posmid-margintop': { value: 'var(--cd-spacing-extra-tight)', category: 'spacing', label: '额外提示上外边距（中）', usage: '表单项额外提示信息顶部外边距 - 额外信息处于中间时' },
  'spacing-form-extra-posmid-marginbottom': { value: 'var(--cd-spacing-extra-tight)', category: 'spacing', label: '额外提示下外边距（中）', usage: '表单项额外提示信息底部外边距 - 额外信息处于中间时' },
  'spacing-form-extra-posbottom-margintop': { value: 'var(--cd-spacing-extra-tight)', category: 'spacing', label: '额外提示上外边距（底）', usage: '表单项额外提示信息顶部外边距 - 额外信息处于底部时' },

  // —— form switch / rating（额外 margin 对齐高度 32px）——
  'spacing-form-switch-rating-marginy': { value: 'calc((var(--cd-control-height-default) - 24px) * 0.5)', category: 'spacing', label: 'Switch/Rating 上下边距', usage: 'Switch / Rating 表单项顶部内边距（水平布局）' },

  // —— label / requiredMark 颜色与字重 ——
  'color-form-requiredmark-disabled-text-default': { value: 'var(--cd-color-danger)', category: 'color', label: '禁用必填标记色', usage: '禁用表单项必填标记颜色' },
  'color-form-label-disabled-text-default': { value: 'var(--cd-color-disabled-text)', category: 'color', label: '禁用标签文字色', usage: '禁用表单项标签文字颜色' },
  'font-form-label-fontweight': { value: 'var(--cd-font-weight-bold)', category: 'font', label: '标签字重', usage: '表单项标签字重' },
  'color-form-label-text-default': { value: 'var(--cd-color-text-0)', category: 'color', label: '标签文字色', usage: '表单项标签文字颜色' },
  'color-form-label-optional-text-default': { value: 'var(--cd-color-tertiary)', category: 'color', label: '可选标记色', usage: '表单项标签可选标记颜色' },
  'color-form-label-extra-text-default': { value: 'var(--cd-color-tertiary)', category: 'color', label: '标签图标色', usage: '表单项标签图标颜色' },
  'color-form-requiredmark-text-default': { value: 'var(--cd-color-danger)', category: 'color', label: '必填标记色', usage: '必填标记颜色' },
  'font-form-requiredmark-fontweight': { value: 'var(--cd-font-weight-bold)', category: 'font', label: '必填标识字重', usage: '表单必填标识字重' },

  // —— form errormessage ——
  'color-form-message-error-text-default': { value: 'var(--cd-color-danger)', category: 'color', label: '错误提示色', usage: '错误提示颜色' },
  'color-form-alerticon-icon-default': { value: 'var(--cd-color-warning)', category: 'color', label: '警告图标色', usage: '警告图标颜色' },
  'spacing-form-statusicon-marginright': { value: 'var(--cd-spacing-extra-tight)', category: 'spacing', label: '状态图标右外边距', usage: '表单校验状态图标右侧外边距' },
  'spacing-form-message-margintop': { value: 'var(--cd-spacing-extra-tight)', category: 'spacing', label: '提示信息上外边距', usage: '表单错误信息、辅助文字顶部外边距' },

  // —— form section ——
  'color-form-section-text-default': { value: 'var(--cd-color-text-0)', category: 'color', label: '分组标题文字色', usage: '表单分组标题文字颜色' },
  'color-form-section-border-default': { value: 'var(--cd-color-border)', category: 'color', label: '分组描边色', usage: '表单分组标题底部描边颜色' },
  'width-form-section-border': { value: 'var(--cd-border-thickness-control)', category: 'width', label: '分组描边宽度', usage: '表单分组标题底部描边宽度' },
  'spacing-form-section-margintop': { value: 'calc(var(--cd-spacing-super-loose) - var(--cd-spacing-base-tight))', category: 'spacing', label: '分组上内边距', usage: '表单分组顶部内边距' },
  'spacing-form-section-text-paddingbottom': { value: 'var(--cd-spacing-tight)', category: 'spacing', label: '分组标题下内边距', usage: '表单分组标题底部内边距' },
  'spacing-form-section-text-marginbottom': { value: 'var(--cd-spacing-extra-tight)', category: 'spacing', label: '分组标题下外边距', usage: '表单分组标题底部外边距' },
  'spacing-form-section-text-paddingtop': { value: '0px', category: 'spacing', label: '分组标题上内边距', usage: '表单分组标题顶部内边距' },
  'spacing-form-section-text-margintop': { value: '0px', category: 'spacing', label: '分组标题上外边距', usage: '表单分组标题顶部外边距' },

  // —— 异步校验 spinner（Semi 无；chenzy-design 独有的纯 CSS 校验指示器）——
  // 保留：Semi 无异步 spinner，属本库超集，组件直接消费。
  'form-spinner-track-color': { value: 'var(--cd-color-fill-2)', category: 'color', label: 'spinner 轨道色', usage: '异步校验指示器圆环轨道颜色（组件消费）' },
  'form-spinner-active-color': { value: 'var(--cd-color-primary)', category: 'color', label: 'spinner 激活色', usage: '异步校验指示器圆环激活弧颜色（组件消费）' },
} satisfies TokenGroup;
