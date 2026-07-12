/**
 * Component tokens for Steps（M navigation）。全量对齐 Semi Design
 * （semi-foundation/steps/variables.scss，Color/Width/Height/Spacing/Radius/Font
 * 六族），并升级为带元数据的 TokenDef 结构以支持 DSM。值为 var() 引用我们的
 * alias / global token，或字面量。组件（Steps.svelte）直接消费这些 --cd-*-steps-*，
 * 不再经中间语义变量。
 *
 * 注：
 *  - Semi 的 var(--semi-color-*) 一一对应 var(--cd-color-*)；
 *    var(--semi-grey-3) → var(--cd-color-grey-3)（global palette）；
 *    rgba(var(--semi-white), 1) → var(--cd-color-white)（不透明白，语义等价）。
 *  - $spacing-base-tight → var(--cd-spacing-base-tight)（12px）；$spacing-base → var(--cd-spacing-base)（16px）。
 *  - var(--semi-border-radius-circle) → var(--cd-border-radius-circle)；
 *    var(--semi-border-radius-medium) → var(--cd-border-radius-medium)。
 *  - $font-weight-bold → var(--cd-font-weight-bold)；$font-weight-regular → var(--cd-font-weight-regular)；
 *    数字字重（600）保留字面量。
 *  - Semi 变量名的 `_`（如 steps_item_done_after）与 camelCase（minWidth/maxWidth/paddingTop）
 *    忠实转为小写连字符（→ done-after / minwidth / maxwidth / paddingtop），对齐 pagination 范式。
 *  - 字面量（px / % / 9999px / transparent / 32px / em）保留。
 *  - 组件 token 名（color-steps-* / width-steps-* …）与 alias / global 层不同名，
 *    var() 无自引用死循环。
 *  - Semi 的 transition_*-none / transform_scale-small 系动效占位（全为 none / 无缩放），
 *    渲染无实际效果，本层不复刻这些占位 token，避免引入无消费的中间变量。
 */
import type { TokenGroup } from './token-def.js';

export const stepsTokens = {
  // —— Color ——
  'color-steps-bg-active': { value: 'var(--cd-color-fill-1)', category: 'color', label: '步骤条背景-按下态', usage: '步骤条背景 - 按下态' },
  'color-steps-bg-default': { value: 'var(--cd-color-text-2)', category: 'color', label: '未到达图标背景', usage: '未到达步骤条图标背景（fill 型 wait 态左侧图标底）' },
  'color-steps-bg-hover': { value: 'var(--cd-color-fill-0)', category: 'color', label: '步骤条背景-悬浮态', usage: '步骤条背景 - 悬浮态' },
  'color-steps-border-default': { value: 'transparent', category: 'color', label: '步骤条描边-默认', usage: '步骤条描边 - 默认（fill 型 item 外框）' },
  'color-steps-icon-default': { value: 'var(--cd-color-text-2)', category: 'color', label: '未到达图标色', usage: '未到达步骤条图标颜色（fill 型 wait 态图标）' },
  'color-steps-text-default': { value: 'var(--cd-color-white)', category: 'color', label: '图标默认文本色', usage: '步骤条图标默认文本颜色（fill 型 plain 左侧序号）' },
  'color-steps-danger-text-active': { value: 'var(--cd-color-danger-active)', category: 'color', label: '错误文本-按下态', usage: '错误步骤条文本颜色 - 按下态' },
  'color-steps-danger-text-default': { value: 'var(--cd-color-danger)', category: 'color', label: '错误文本-默认态', usage: '错误步骤条文本颜色 - 默认态' },
  'color-steps-danger-text-hover': { value: 'var(--cd-color-danger-hover)', category: 'color', label: '错误文本-悬浮态', usage: '错误步骤条文本颜色 - 悬浮态' },
  'color-steps-icon-after-bg': { value: 'var(--cd-color-fill-2)', category: 'color', label: '垂直连接线颜色', usage: 'basic 垂直型图标下方连接线颜色（wait 段）' },
  'color-steps-item-description-text-hover': { value: 'var(--cd-color-focus-border)', category: 'color', label: '描述文本-悬浮态', usage: '步骤条辅助描述文本颜色 - 悬浮态' },
  'color-steps-item-done-after-bg': { value: 'var(--cd-color-primary)', category: 'color', label: '完成连接线颜色', usage: '完成步骤条尾部连接线颜色（basic 水平型）' },
  'color-steps-item-done-icon-after-bg': { value: 'var(--cd-color-primary)', category: 'color', label: '完成垂直连接线颜色', usage: '完成步骤条图标下方连接线颜色（basic 垂直型）' },
  'color-steps-item-error-left-icon': { value: 'var(--cd-color-danger)', category: 'color', label: '错误图标色', usage: '错误步骤条图标颜色' },
  'color-steps-item-error-left-number-icon': { value: 'var(--cd-color-primary)', category: 'color', label: '错误序号文本色', usage: '错误步骤条数字序号文本颜色' },
  'color-steps-item-finish-icon': { value: 'var(--cd-color-primary)', category: 'color', label: '已完成图标色', usage: '已完成步骤条图标颜色' },
  'color-steps-item-finish-number-icon': { value: 'var(--cd-color-white)', category: 'color', label: '已完成对勾图标色', usage: '已完成步骤条对勾图标颜色' },
  'color-steps-item-left-number-icon-bg': { value: 'var(--cd-color-primary)', category: 'color', label: '图标背景色', usage: '步骤条图标背景颜色（basic 型 number-icon 圆底）' },
  'color-steps-item-left-number-icon-icon': { value: 'var(--cd-color-white)', category: 'color', label: '图标文字色', usage: '步骤条图标文字颜色（basic 型 number-icon 内文）' },
  'color-steps-item-process-left-icon': { value: 'var(--cd-color-primary)', category: 'color', label: '进行中对勾图标色', usage: '进行中步骤条对勾图标颜色' },
  'color-steps-item-process-left-number-icon': { value: 'var(--cd-color-white)', category: 'color', label: '进行中内部图标色', usage: '进行中步骤条内部图标颜色' },
  'color-steps-item-title-text-hover': { value: 'var(--cd-color-focus-border)', category: 'color', label: '标题悬停色', usage: '步骤条标题文字悬停颜色' },
  'color-steps-item-wait-left-icon-icon': { value: 'var(--cd-color-text-2)', category: 'color', label: '未到达图标色', usage: '未到达步骤条图标颜色' },
  'color-steps-item-wait-left-number-icon-bg-hover': { value: 'var(--cd-color-secondary-light-default)', category: 'color', label: '未到达图标背景-悬浮态', usage: '未到达步骤条图标背景颜色 - 悬浮态' },
  'color-steps-item-wait-left-number-icon-bg': { value: 'var(--cd-color-fill-0)', category: 'color', label: '未到达图标背景', usage: '未到达步骤条图标背景颜色' },
  'color-steps-item-wait-left-number-icon-icon-hover': { value: 'var(--cd-color-focus-border)', category: 'color', label: '未到达图标色-悬浮态', usage: '未到达步骤条图标颜色 - 悬浮态' },
  'color-steps-item-wait-left-number-icon-icon': { value: 'var(--cd-color-text-2)', category: 'color', label: '未到达内部图标色', usage: '未到达步骤条内部图标颜色' },
  'color-steps-item-wait-title-text': { value: 'var(--cd-color-text-2)', category: 'color', label: '未到达标题色', usage: '未到达步骤条标题文字颜色' },
  'color-steps-item-warning-left-icon': { value: 'var(--cd-color-warning)', category: 'color', label: '警告图标色', usage: '警告步骤条图标颜色' },
  'color-steps-item-warning-left-number-icon': { value: 'var(--cd-color-white)', category: 'color', label: '警告序号文本色', usage: '警告步骤条数字序号文本颜色' },
  'color-steps-main-text-default': { value: 'var(--cd-color-text-0)', category: 'color', label: '标题文本色', usage: '步骤条标题文本颜色' },
  'color-steps-minor-text-default': { value: 'var(--cd-color-text-2)', category: 'color', label: '辅助描述文本色', usage: '步骤条辅助描述文本颜色' },
  'color-steps-nav-item-container-text': { value: 'var(--cd-color-text-2)', category: 'color', label: '导航容器文本色', usage: '导航型步骤条容器内文本颜色' },
  'color-steps-nav-item-icon': { value: 'var(--cd-color-grey-3)', category: 'color', label: '导航图标色', usage: '导航型步骤条序号图标颜色' },
  'color-steps-nav-item-title-text-active': { value: 'var(--cd-color-text-0)', category: 'color', label: '导航标题色-激活态', usage: '导航型步骤条标题颜色 - 激活态' },
  'color-steps-primary-bg-default': { value: 'var(--cd-color-primary)', category: 'color', label: 'fill 进行中背景-旧', usage: 'fill 进行中步骤条左侧图标背景色 - 默认' },
  'color-steps-primary-icon-default': { value: 'var(--cd-color-primary)', category: 'color', label: 'fill 进行中图标色-旧', usage: 'fill 进行中步骤条图标/标题色 - 默认' },
  'color-steps-process-bg-default': { value: 'var(--cd-color-primary-light-default)', category: 'color', label: 'fill 进行中背景', usage: 'fill 进行中步骤条 item 背景色 - 默认' },
  'color-steps-success-text-active': { value: 'var(--cd-color-success-active)', category: 'color', label: 'fill 完成文字-按下态', usage: 'fill 已完成步骤条文字颜色 - 按下态' },
  'color-steps-success-text-default': { value: 'var(--cd-color-success)', category: 'color', label: 'fill 完成文字-默认态', usage: 'fill 已完成步骤条文字颜色 - 默认态' },
  'color-steps-success-text-hover': { value: 'var(--cd-color-success-hover)', category: 'color', label: 'fill 完成文字-悬浮态', usage: 'fill 已完成步骤条文字颜色 - 悬浮态' },
  'color-steps-title-after-bg': { value: 'var(--cd-color-fill-2)', category: 'color', label: '水平连接线颜色', usage: 'basic 水平型标题后连接线颜色（wait 段）' },
  'color-steps-warning-text-active': { value: 'var(--cd-color-warning-active)', category: 'color', label: 'fill 警告文字-按下态', usage: 'fill 警告步骤条文字颜色 - 按下态' },
  'color-steps-warning-text-default': { value: 'var(--cd-color-warning)', category: 'color', label: 'fill 警告文字-默认态', usage: 'fill 警告步骤条文字颜色 - 默认态' },
  'color-steps-warning-text-hover': { value: 'var(--cd-color-warning-hover)', category: 'color', label: 'fill 警告文字-悬浮态', usage: 'fill 警告步骤条文字颜色 - 悬浮态' },

  // —— Width / Height ——
  'width-steps-basic-item-description': { value: '100%', category: 'width', label: '描述文本宽度', usage: 'basic 型辅助描述文本宽度' },
  'width-steps-basic-item-description-maxwidth': { value: '268px', category: 'width', label: '描述文本最大宽度', usage: 'basic 型辅助描述文本最大宽度' },
  'width-steps-basic-item-title-maxwidth': { value: '80%', category: 'width', label: '标题最大宽度', usage: 'basic 水平型标题最大宽度' },
  'height-steps-basic-vertical-icon-content-minheight': { value: '42px', category: 'height', label: '垂直图标内容最小高度', usage: 'basic 垂直型图标+内容最小高度' },
  'width-steps-basic-vertical-item-title-maxwidth': { value: '100%', category: 'width', label: '垂直标题最大宽度', usage: 'basic 垂直型标题最大宽度' },
  'width-steps-basic-vertical-item-description': { value: '100%', category: 'width', label: '垂直描述文本宽度', usage: 'basic 垂直型辅助描述文本宽度' },
  'height-steps-basic-vertical-small-item-content-minheight': { value: '40px', category: 'height', label: '迷你垂直内容最小高度', usage: 'basic 迷你垂直型内容区最小高度' },
  'height-steps-basic-item-left-icon': { value: '24px', category: 'height', label: '左侧图标高度', usage: 'basic 型左侧图标高度' },
  'width-steps-basic-item-left-number-icon': { value: '24px', category: 'width', label: '序号图标宽度', usage: 'basic 型左侧序号图标宽度' },
  'height-steps-basic-item-left-number-icon': { value: '24px', category: 'height', label: '序号图标高度', usage: 'basic 型左侧序号图标高度' },
  'height-steps-basic-small-item-left-icon': { value: '20px', category: 'height', label: '迷你左侧图标高度', usage: 'basic 迷你型左侧图标高度' },
  'width-steps-basic-small-item-left-number-icon': { value: '20px', category: 'width', label: '迷你序号图标尺寸', usage: 'basic 迷你型左侧序号图标宽高' },
  'height-steps-basic-item': { value: '72px', category: 'height', label: 'basic 步骤条高度', usage: 'basic 型步骤条高度' },
  'height-steps-item': { value: '72px', category: 'height', label: 'fill 步骤条高度', usage: 'fill 型步骤条高度' },
  'width-steps-item-border': { value: '1px', category: 'width', label: 'fill item 边框宽度', usage: 'fill 型 item 外框边框宽度' },
  'width-steps-item-title': { value: '100%', category: 'width', label: 'fill 标题宽度', usage: 'fill 型标题宽度' },
  'width-steps-item-description': { value: '100%', category: 'width', label: 'fill 描述宽度', usage: 'fill 型辅助描述文本宽度' },
  'width-steps-item-left-icon': { value: '24px', category: 'width', label: 'fill 左侧图标宽度', usage: 'fill 型左侧图标宽度' },
  'width-steps-item-left': { value: '24px', category: 'width', label: 'fill 左侧容器宽度', usage: 'fill 型左侧图标容器宽度' },
  'height-steps-item-left': { value: '24px', category: 'height', label: 'fill 左侧容器高度', usage: 'fill 型左侧图标容器高度' },
  'width-steps-title-after': { value: '9999px', category: 'width', label: '水平连接线长度', usage: 'basic 水平型连接线长度' },
  'height-steps-title-after': { value: '1px', category: 'height', label: '水平连接线高度', usage: 'basic 水平型连接线高度' },
  'width-steps-vertical-icon-after': { value: '1px', category: 'width', label: '垂直连接线宽度', usage: 'basic 垂直型连接线宽度' },
  'height-steps-vertical-icon-after': { value: '9999px', category: 'height', label: '垂直连接线长度', usage: 'basic 垂直型连接线长度' },
  'width-steps-nav-item-icon-minwidth': { value: '60px', category: 'width', label: '导航图标最小宽度', usage: '导航型步骤条图标最小宽度' },
  'width-steps-nav-item-title-maxwidth': { value: '17em', category: 'width', label: '导航标题最大宽度', usage: '导航型步骤条标题最大宽度' },

  // —— Spacing ——
  'spacing-steps-basic-item-paddingleft': { value: '16px', category: 'spacing', label: 'basic 左内边距', usage: 'basic 型步骤条左侧内边距' },
  'spacing-steps-basic-vertical-item-paddingtop': { value: '9px', category: 'spacing', label: 'basic 垂直顶内边距', usage: 'basic 垂直型步骤条顶部内边距' },
  'spacing-steps-basic-vertical-item-content-paddingbottom': { value: '22px', category: 'spacing', label: 'basic 垂直内容底内边距', usage: 'basic 垂直型内容区底部内边距' },
  'spacing-steps-basic-vertical-item-icon-paddingbottom': { value: '9px', category: 'spacing', label: 'basic 垂直图标底内边距', usage: 'basic 垂直型图标底部内边距' },
  'spacing-steps-basic-item-left-marginright': { value: '8px', category: 'spacing', label: 'basic 图标右外边距', usage: 'basic 型图标右侧外边距' },
  'spacing-steps-basic-item-title-paddingright': { value: '16px', category: 'spacing', label: 'basic 标题右内边距', usage: 'basic 型标题右侧内边距' },
  'spacing-steps-basic-item-title-paddingbottom': { value: '4px', category: 'spacing', label: 'basic 标题底内边距', usage: 'basic 型标题底部内边距' },
  'spacing-steps-basic-item-marginright': { value: '16px', category: 'spacing', label: 'basic 标题右外边距', usage: 'basic 型标题右侧外边距' },
  'spacing-steps-item-marginright': { value: '16px', category: 'spacing', label: 'fill 右外边距', usage: 'fill 型步骤条右侧外边距' },
  'spacing-steps-item-paddingy': { value: 'var(--cd-spacing-base-tight)', category: 'spacing', label: 'fill 垂直内边距', usage: 'fill 型步骤条垂直方向内边距' },
  'spacing-steps-item-paddingx': { value: 'var(--cd-spacing-base)', category: 'spacing', label: 'fill 水平内边距', usage: 'fill 型步骤条水平方向内边距' },
  'spacing-steps-item-content-marginleft': { value: 'var(--cd-spacing-base)', category: 'spacing', label: 'fill 内容左外边距', usage: 'fill 型水平内容区左侧外边距' },

  // —— Radius ——
  'radius-steps-basic-item-left-number-icon': { value: 'var(--cd-border-radius-circle)', category: 'radius', label: '序号图标圆角', usage: 'basic 型左侧序号图标圆角（圆形）' },
  'radius-steps-item': { value: 'var(--cd-border-radius-medium)', category: 'radius', label: 'fill item 圆角', usage: 'fill 型步骤条整体圆角' },
  'radius-steps-item-left': { value: '32px', category: 'radius', label: 'fill 左侧图标圆角', usage: 'fill 型左侧图标圆角' },

  // —— Font ——
  'font-steps-basic-item-left-number-icon-fontweight': { value: '600', category: 'font', label: '序号图标字重', usage: 'basic 型序号数字图标文本字重' },
  'font-steps-basic-item-title-fontweight': { value: '600', category: 'font', label: 'basic 标题字重', usage: 'basic 型标题文本字重' },
  'font-steps-basic-item-title-lineheight': { value: '24px', category: 'font', label: 'basic 标题行高', usage: 'basic 型标题文本行高' },
  'font-steps-item-title-fontweight': { value: 'var(--cd-font-weight-bold)', category: 'font', label: 'fill 标题字重', usage: 'fill 型标题文本字重' },
  'font-steps-item-left-fontweight': { value: 'var(--cd-font-weight-bold)', category: 'font', label: 'fill 序号字重', usage: 'fill 型左侧图标内部文本字重' },
  'font-steps-item-left-lineheight': { value: '32px', category: 'font', label: 'fill 序号行高', usage: 'fill 型左侧图标内部文本行高' },
  'font-steps-nav-item-title-fontweight': { value: 'var(--cd-font-weight-regular)', category: 'font', label: '导航标题字重', usage: '导航型步骤条标题文本字重 - 默认态' },
  'font-steps-nav-item-title-active-fontweight': { value: '600', category: 'font', label: '导航标题字重-激活', usage: '导航型步骤条标题文本字重 - 激活态' },
} satisfies TokenGroup;
