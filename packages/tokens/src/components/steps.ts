/**
 * Component tokens for Steps（M navigation）。全量对齐 Semi Design
 * （semi-foundation/steps/variables.scss 94 个），并升级为带元数据的 TokenDef
 * 结构以支持 DSM。值为 var() 引用我们的 alias / global token，或字面量。
 * 末尾保留 chenzy-design Steps 实际消费的补充 token（basic/nav/fill 三型 +
 * wait/process/finish/error 状态 + dot 模式；原名，Semi 无 / 命名差异；组件消费）。
 *
 * 注：
 *  - Semi 的 var(--semi-color-*) 一一对应 var(--cd-color-*)；
 *    var(--semi-color-white) → var(--cd-color-text-inverse)（= #ffffff，无 --cd-color-white alias）；
 *    rgba(var(--semi-white), 1) 即纯白 → var(--cd-color-text-inverse)；
 *    var(--semi-grey-3) → var(--cd-color-grey-3)（global palette）。
 *  - $spacing-base-tight → var(--cd-spacing-base-tight)（12px）；$spacing-base → var(--cd-spacing-base)（16px）。
 *  - var(--semi-border-radius-circle) → var(--cd-border-radius-circle)；
 *    var(--semi-border-radius-medium) → var(--cd-border-radius-medium)。
 *  - $font-weight-bold → var(--cd-font-weight-bold)；$font-weight-regular → var(--cd-font-weight-regular)。
 *  - Semi 变量名的 `_`（如 steps_item_done_after）忠实转为 `-`（对齐 radio/switch 范式）；
 *    字面量（px / % / 数字字重 600 / transparent / em）保留。
 *  - 组件 token 名（steps-icon-* / steps-basic-* …）与 alias / global 层不同名，
 *    var() 无自引用死循环。
 */
import type { TokenGroup } from './token-def.js';

export const stepsTokens = {
  // —— Color ——
  'color-steps-bg-active': { value: 'var(--cd-color-fill-1)', category: 'color', label: '步骤条背景', usage: '步骤条背景 - 按下态' },
  'color-steps-bg-default': { value: 'var(--cd-color-text-2)', category: 'color', label: '图标背景', usage: '未到达步骤条图标背景' },
  'color-steps-bg-hover': { value: 'var(--cd-color-fill-0)', category: 'color', label: '步骤条背景', usage: '步骤条背景 - 悬浮态' },
  'color-steps-border-default': { value: 'transparent', category: 'color', label: '步骤条描边', usage: '步骤条描边 - 默认' },
  'color-steps-icon-default': { value: 'var(--cd-color-text-2)', category: 'color', label: '图标背景', usage: '未到达步骤条图标背景' },
  'color-steps-text-default': { value: 'var(--cd-color-text-inverse)', category: 'color', label: '图标默认文本颜色', usage: '步骤条图标默认文本颜色' },
  'color-steps-danger-text-active': { value: 'var(--cd-color-danger-active)', category: 'color', label: '错误文本颜色', usage: '错误步骤条文本颜色 - 按下态' },
  'color-steps-danger-text-default': { value: 'var(--cd-color-danger)', category: 'color', label: '错误文本颜色', usage: '错误步骤条文本颜色 - 默认态' },
  'color-steps-danger-text-hover': { value: 'var(--cd-color-danger-hover)', category: 'color', label: '错误文本颜色', usage: '错误步骤条文本颜色 - 悬浮态' },
  'color-steps-icon-after-bg': { value: 'var(--cd-color-fill-2)', category: 'color', label: '图标连线颜色', usage: '步骤条图标尾部连接线颜色' },
  'color-steps-item-description-text-hover': { value: 'var(--cd-color-focus-border)', category: 'color', label: '辅助描述文本颜色', usage: '步骤条辅助描述文本颜色 - 悬浮态' },
  'color-steps-item-done-after-bg': { value: 'var(--cd-color-primary)', category: 'color', label: '完成连线颜色', usage: '完成步骤条尾部连接线颜色' },
  'color-steps-item-done-icon-after-bg': { value: 'var(--cd-color-primary)', category: 'color', label: '完成图标连线颜色', usage: '完成步骤条图标尾部连接线颜色' },
  'color-steps-item-error-left-icon': { value: 'var(--cd-color-danger)', category: 'color', label: '错误图标颜色', usage: '错误步骤条图标颜色' },
  'color-steps-item-error-left-number-icon': { value: 'var(--cd-color-primary)', category: 'color', label: '错误数字序号颜色', usage: '错误步骤条数字序号文本颜色' },
  'color-steps-item-finish-icon': { value: 'var(--cd-color-primary)', category: 'color', label: '已完成图标颜色', usage: '已完成步骤条图标颜色' },
  'color-steps-item-finish-number-icon': { value: 'var(--cd-color-text-inverse)', category: 'color', label: '已完成对勾颜色', usage: '已完成步骤条对勾图标颜色' },
  'color-steps-item-left-number-icon-bg': { value: 'var(--cd-color-primary)', category: 'color', label: '图标背景颜色', usage: '步骤条图标背景颜色' },
  'color-steps-item-left-number-icon-icon': { value: 'var(--cd-color-text-inverse)', category: 'color', label: '图标文字颜色', usage: '步骤条图标文字颜色' },
  'color-steps-item-process-left-icon': { value: 'var(--cd-color-primary)', category: 'color', label: '进行中对勾颜色', usage: '进行中步骤条对勾图标颜色' },
  'color-steps-item-process-left-number-icon': { value: 'var(--cd-color-text-inverse)', category: 'color', label: '进行中内部图标颜色', usage: '进行中步骤条内部图标颜色' },
  'color-steps-item-title-text-hover': { value: 'var(--cd-color-focus-border)', category: 'color', label: '标题悬停颜色', usage: '步骤条标题文字悬停颜色' },
  'color-steps-item-wait-left-icon-icon': { value: 'var(--cd-color-text-2)', category: 'color', label: '未到达图标颜色', usage: '未到达步骤条图标颜色' },
  'color-steps-item-wait-left-number-icon-bg-hover': { value: 'var(--cd-color-secondary-light-default)', category: 'color', label: '未到达图标背景颜色', usage: '未到达步骤条图标背景颜色 - 悬浮态' },
  'color-steps-item-wait-left-number-icon-bg': { value: 'var(--cd-color-fill-0)', category: 'color', label: '未到达图标背景颜色', usage: '未到达步骤条图标背景颜色' },
  'color-steps-item-wait-left-number-icon-icon-hover': { value: 'var(--cd-color-focus-border)', category: 'color', label: '未到达图标颜色', usage: '未到达步骤条图标颜色 - 悬浮态' },
  'color-steps-item-wait-left-number-icon-icon': { value: 'var(--cd-color-text-2)', category: 'color', label: '未到达内部图标颜色', usage: '未到达步骤条内部图标颜色' },
  'color-steps-item-wait-title-text': { value: 'var(--cd-color-text-2)', category: 'color', label: '未到达标题文字颜色', usage: '未到达步骤条标题文字颜色' },
  'color-steps-item-warning-left-icon': { value: 'var(--cd-color-warning)', category: 'color', label: '警告图标颜色', usage: '警告步骤条图标颜色' },
  'color-steps-item-warning-left-number-icon': { value: 'var(--cd-color-text-inverse)', category: 'color', label: '警告数字序号颜色', usage: '警告步骤条数字序号文本颜色' },
  'color-steps-main-text-default': { value: 'var(--cd-color-text-0)', category: 'color', label: '标题文本颜色', usage: '步骤条标题文本颜色' },
  'color-steps-minor-text-default': { value: 'var(--cd-color-text-2)', category: 'color', label: '辅助描述文本颜色', usage: '步骤条辅助描述文本颜色' },
  'color-steps-nav-item-container-text': { value: 'var(--cd-color-text-2)', category: 'color', label: '容器内文本颜色', usage: '步骤条容器内文本颜色' },
  'color-steps-nav-item-icon': { value: 'var(--cd-color-grey-3)', category: 'color', label: '导航型图标颜色', usage: '导航型步骤条图标颜色' },
  'color-steps-nav-item-title-text-active': { value: 'var(--cd-color-text-0)', category: 'color', label: '标题颜色', usage: '步骤条标题颜色 - 按下态' },
  'color-steps-primary-bg-default': { value: 'var(--cd-color-primary)', category: 'color', label: '旧版进行中背景色', usage: '旧版进行中步骤条背景色 - 默认' },
  'color-steps-primary-icon-default': { value: 'var(--cd-color-primary)', category: 'color', label: '旧版进行中图标色', usage: '旧版进行中步骤条图标色 - 默认' },
  'color-steps-process-bg-default': { value: 'var(--cd-color-primary-light-default)', category: 'color', label: '旧版进行中背景色', usage: '旧版进行中步骤条背景色 - 默认' },
  'color-steps-success-text-active': { value: 'var(--cd-color-success-active)', category: 'color', label: '旧版已完成文字颜色', usage: '旧版已完成步骤条文字颜色 - 按下态' },
  'color-steps-success-text-default': { value: 'var(--cd-color-success)', category: 'color', label: '旧版已完成文字颜色', usage: '旧版已完成步骤条文字颜色 - 默认态' },
  'color-steps-success-text-hover': { value: 'var(--cd-color-success-hover)', category: 'color', label: '旧版已完成文字颜色', usage: '旧版已完成步骤条文字颜色 - 悬浮态' },
  'color-steps-title-after-bg': { value: 'var(--cd-color-fill-2)', category: 'color', label: '旧版连线颜色', usage: '旧版步骤条连线颜色' },
  'color-steps-warning-text-active': { value: 'var(--cd-color-warning-active)', category: 'color', label: '旧版警告文字颜色', usage: '旧版警告步骤条文字颜色 - 按下态' },
  'color-steps-warning-text-default': { value: 'var(--cd-color-warning)', category: 'color', label: '旧版警告文字颜色', usage: '旧版警告步骤条文字颜色 - 默认态' },
  'color-steps-warning-text-hover': { value: 'var(--cd-color-warning-hover)', category: 'color', label: '旧版警告文字颜色', usage: '旧版警告步骤条文字颜色 - 悬浮态' },

  // —— Width / Height ——
  'width-steps-basic-item-description': { value: '100%', category: 'width', label: '辅助描述文本宽度', usage: '步骤条辅助描述文本宽度' },
  'width-steps-basic-item-description-maxwidth': { value: '268px', category: 'width', label: '辅助描述最大宽度', usage: '步骤条辅助描述文本最大宽度' },
  'width-steps-basic-item-title-maxwidth': { value: '80%', category: 'width', label: '标题宽度', usage: '步骤条标题宽度' },
  'height-steps-basic-vertical-icon-content-minheight': { value: '42px', category: 'height', label: '垂直图标内容最小高度', usage: '垂直步骤条图标+内容最小高度' },
  'width-steps-basic-vertical-item-title-maxwidth': { value: '100%', category: 'width', label: '垂直标题最大宽度', usage: '垂直步骤条标题最大宽度' },
  'width-steps-basic-vertical-item-description': { value: '100%', category: 'width', label: '垂直辅助描述最大宽度', usage: '垂直步骤条辅助描述文本最大宽度' },
  'height-steps-basic-vertical-small-item-content-minheight': { value: '40px', category: 'height', label: '小尺寸垂直内容最小高度', usage: '小尺寸垂直步骤条内容最小高度' },
  'height-steps-basic-item-left-icon': { value: '24px', category: 'height', label: '左侧图标高度', usage: '步骤条左侧图标高度' },
  'width-steps-basic-item-left-number-icon': { value: '24px', category: 'width', label: '左侧图标宽度', usage: '步骤条左侧图标宽度' },
  'height-steps-basic-item-left-number-icon': { value: '24px', category: 'height', label: '左侧图标高度', usage: '步骤条左侧图标高度' },
  'height-steps-basic-small-item-left-icon': { value: '20px', category: 'height', label: '小尺寸左侧图标高度', usage: '小尺寸步骤条左侧图标高度' },
  'width-steps-basic-small-item-left-number-icon': { value: '20px', category: 'width', label: '小尺寸左侧数字图标高度', usage: '小尺寸步骤条左侧数字图标高度' },
  'height-steps-basic-item': { value: '72px', category: 'height', label: '简易版步骤条高度', usage: '简易版步骤条高度' },
  'height-steps-item': { value: '72px', category: 'height', label: '旧版步骤条高度', usage: '旧版步骤条高度' },
  'width-steps-item-border': { value: '1px', category: 'width', label: '旧版步骤条边框', usage: '旧版步骤条边框宽度' },
  'width-steps-item-title': { value: '100%', category: 'width', label: '标题宽度', usage: '步骤条标题宽度' },
  'width-steps-item-description': { value: '100%', category: 'width', label: '辅助描述文本宽度', usage: '步骤条辅助描述文本宽度' },
  'width-steps-item-left-icon': { value: '24px', category: 'width', label: '左侧图标宽度', usage: '步骤条左侧图标宽度' },
  'width-steps-item-left': { value: '24px', category: 'width', label: '左侧图标容器宽度', usage: '步骤条左侧图标容器宽度' },
  'height-steps-item-left': { value: '24px', category: 'height', label: '左侧图标容器高度', usage: '步骤条左侧图标容器高度' },
  'width-steps-title-after': { value: '9999px', category: 'width', label: '连接线长度', usage: '步骤条连接线长度' },
  'height-steps-title-after': { value: '1px', category: 'height', label: '连接线高度', usage: '步骤条连接线高度' },
  'width-steps-vertical-icon-after': { value: '1px', category: 'width', label: '垂直连接线宽度', usage: '垂直步骤条连接线宽度' },
  'height-steps-vertical-icon-after': { value: '9999px', category: 'height', label: '垂直连接线长度', usage: '垂直步骤条连接线长度' },
  'width-steps-nav-item-icon-minwidth': { value: '60px', category: 'width', label: '导航型图标最小宽度', usage: '导航型步骤条图标最小宽度' },
  'width-steps-nav-item-title-maxwidth': { value: '17em', category: 'width', label: '导航型标题最大宽度', usage: '导航型步骤条标题最大宽度' },

  // —— Spacing ——
  'spacing-steps-basic-item-paddingleft': { value: '16px', category: 'spacing', label: '简版左侧内边距', usage: '简版步骤条左侧内边距' },
  'spacing-steps-basic-vertical-item-paddingtop': { value: '9px', category: 'spacing', label: '简版垂直顶部内边距', usage: '简版垂直步骤条顶部内边距' },
  'spacing-steps-basic-vertical-item-content-paddingbottom': { value: '22px', category: 'spacing', label: '简版垂直内容底部内边距', usage: '简版垂直步骤条内容区底部内边距' },
  'spacing-steps-basic-vertical-item-icon-paddingbottom': { value: '9px', category: 'spacing', label: '简版垂直图标底部内边距', usage: '简版垂直步骤条图标底部内边距' },
  'spacing-steps-basic-item-left-marginright': { value: '8px', category: 'spacing', label: '简版图标右侧外边距', usage: '简版步骤条图标右侧外边距' },
  'spacing-steps-basic-item-title-paddingright': { value: '16px', category: 'spacing', label: '简版标题右侧内边距', usage: '简版步骤条标题右侧内边距' },
  'spacing-steps-basic-item-title-paddingbottom': { value: '4px', category: 'spacing', label: '简版标题底部内边距', usage: '简版步骤条标题底部内边距' },
  'spacing-steps-basic-item-marginright': { value: '16px', category: 'spacing', label: '简版标题右侧外边距', usage: '简版步骤条标题右侧外边距' },
  'spacing-steps-item-marginright': { value: '16px', category: 'spacing', label: '旧版右侧外边距', usage: '旧版步骤条右侧外边距' },
  'spacing-steps-item-paddingy': { value: 'var(--cd-spacing-base-tight)', category: 'spacing', label: '旧版垂直内边距', usage: '旧版步骤条垂直方向内边距' },
  'spacing-steps-item-paddingx': { value: 'var(--cd-spacing-base)', category: 'spacing', label: '旧版水平内边距', usage: '旧版步骤条水平方向内边距' },
  'spacing-steps-item-content-marginleft': { value: 'var(--cd-spacing-base)', category: 'spacing', label: '旧版内容区左侧外边距', usage: '旧版步骤条水平内容区左侧外边距' },

  // —— Radius ——
  'radius-steps-basic-item-left-number-icon': { value: 'var(--cd-border-radius-circle)', category: 'radius', label: '左侧图标圆角', usage: '步骤条左侧图标圆角' },
  'radius-steps-item': { value: 'var(--cd-border-radius-medium)', category: 'radius', label: '整体圆角', usage: '步骤条整体圆角' },
  'radius-steps-item-left': { value: '32px', category: 'radius', label: '左侧距离', usage: '步骤条左侧距离' },

  // —— Font ——
  'font-steps-basic-item-left-number-icon-fontweight': { value: '600', category: 'font', label: '数字图标字重', usage: '步骤条数字图标文本字重' },
  'font-steps-basic-item-title-fontweight': { value: '600', category: 'font', label: '标题字重', usage: '步骤条标题文本字重' },
  'font-steps-basic-item-title-lineheight': { value: '24px', category: 'font', label: '标题行高', usage: '步骤条标题文本行高' },
  'font-steps-item-title-fontweight': { value: 'var(--cd-font-weight-bold)', category: 'font', label: '标题字重', usage: '步骤条标题文本字重' },
  'font-steps-item-left-fontweight': { value: 'var(--cd-font-weight-bold)', category: 'font', label: '左侧图标字重', usage: '步骤条标题左侧图标内部文本字重' },
  'font-steps-item-left-lineheight': { value: '32px', category: 'font', label: '左侧图标行高', usage: '步骤条标题左侧图标内部文本行高' },
  'font-steps-nav-item-title-fontweight': { value: 'var(--cd-font-weight-regular)', category: 'font', label: '导航型标题字重', usage: '导航型步骤条标题文本字重 - 默认态' },
  'font-steps-nav-item-title-active-fontweight': { value: '600', category: 'font', label: '导航型标题字重', usage: '导航型步骤条标题文本字重 - 激活态' },

  // —— chenzy-design Steps 实际消费的补充 token（Semi 无 / 命名差异；组件消费） ——
  // 图标节点尺寸 / fill 型（实心）默认态
  'steps-icon-size': { value: '24px', category: 'width', label: '图标节点尺寸', usage: '步骤条图标节点边长（组件消费，对齐 Semi height-steps-basic-item-left-icon）' },
  'steps-icon-bg': { value: 'var(--cd-color-steps-item-wait-left-number-icon-bg)', category: 'color', label: '未到达图标背景', usage: 'wait 态图标背景（组件消费）' },
  'steps-icon-color': { value: 'var(--cd-color-steps-item-wait-left-number-icon-icon)', category: 'color', label: '未到达图标文字色', usage: 'wait 态图标文字色（组件消费）' },
  'steps-icon-color-active': { value: 'var(--cd-color-steps-item-left-number-icon-icon)', category: 'color', label: '激活图标文字色', usage: 'process/finish 态图标文字色（组件消费）' },
  'steps-icon-bg-process': { value: 'var(--cd-color-steps-item-left-number-icon-bg)', category: 'color', label: '进行中图标背景', usage: 'process 态图标背景（组件消费）' },
  'steps-icon-bg-finish': { value: 'var(--cd-color-steps-item-done-after-bg)', category: 'color', label: '已完成图标背景', usage: 'finish 态图标背景（组件消费）' },
  'steps-icon-bg-error': { value: 'var(--cd-color-steps-item-error-left-icon)', category: 'color', label: '错误图标背景', usage: 'error 态图标背景（组件消费）' },

  // 标题 / 描述文字
  'steps-title-color': { value: 'var(--cd-color-steps-main-text-default)', category: 'color', label: '标题文字色', usage: '步骤条标题文字色（组件消费）' },
  'steps-desc-color': { value: 'var(--cd-color-steps-minor-text-default)', category: 'color', label: '描述文字色', usage: '步骤条辅助描述文字色（组件消费）' },

  // 连接线
  'steps-line-color': { value: 'var(--cd-color-steps-title-after-bg)', category: 'color', label: '连接线颜色', usage: '步骤条连接线默认色（组件消费）' },
  'steps-line-color-finish': { value: 'var(--cd-color-steps-item-done-after-bg)', category: 'color', label: '已完成连线颜色', usage: '已完成步骤连接线色（组件消费）' },

  // basic 线框型：节点圆圈描边而非实心填充
  'steps-basic-color': { value: 'var(--cd-color-steps-item-wait-left-icon-icon)', category: 'color', label: '线框默认文字色', usage: 'basic 型 wait 态图标文字色（组件消费）' },
  'steps-basic-border': { value: 'var(--cd-color-border)', category: 'color', label: '线框默认描边', usage: 'basic 型 wait 态图标描边（组件消费）' },
  'steps-basic-color-process': { value: 'var(--cd-color-steps-item-process-left-icon)', category: 'color', label: '线框进行中文字色', usage: 'basic 型 process 态图标文字色（组件消费）' },
  'steps-basic-border-process': { value: 'var(--cd-color-steps-item-left-number-icon-bg)', category: 'color', label: '线框进行中描边', usage: 'basic 型 process 态图标描边（组件消费）' },
  'steps-basic-color-finish': { value: 'var(--cd-color-steps-item-finish-icon)', category: 'color', label: '线框已完成文字色', usage: 'basic 型 finish 态图标文字色（组件消费）' },
  'steps-basic-border-finish': { value: 'var(--cd-color-steps-item-done-after-bg)', category: 'color', label: '线框已完成描边', usage: 'basic 型 finish 态图标描边（组件消费）' },
  'steps-basic-color-error': { value: 'var(--cd-color-steps-item-error-left-icon)', category: 'color', label: '线框错误文字色', usage: 'basic 型 error 态图标文字色（组件消费）' },
  'steps-basic-border-error': { value: 'var(--cd-color-steps-danger-text-default)', category: 'color', label: '线框错误描边', usage: 'basic 型 error 态图标描边（组件消费）' },

  // dot 模式：图标缩为小圆点，process 态放大
  'steps-dot-size': { value: '8px', category: 'width', label: '圆点尺寸', usage: 'dot 模式圆点边长（组件消费）' },
  'steps-dot-size-active': { value: '10px', category: 'width', label: '激活圆点尺寸', usage: 'dot 模式 process 态圆点边长（组件消费）' },
} satisfies TokenGroup;
