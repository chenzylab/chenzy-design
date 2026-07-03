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

  // —— Width / Height ——

  // —— Spacing ——

  // —— Radius ——

  // —— Font ——

  // —— chenzy-design Steps 实际消费的补充 token（Semi 无 / 命名差异；组件消费） ——
  // 图标节点尺寸 / fill 型（实心）默认态
  'steps-icon-size': { value: '24px', category: 'width', label: '图标节点尺寸', usage: '步骤条图标节点边长（组件消费，对齐 Semi height-steps-basic-item-left-icon）' },
  'steps-icon-bg': { value: 'var(--cd-color-fill-0)', category: 'color', label: '未到达图标背景', usage: 'wait 态图标背景（组件消费）' },
  'steps-icon-color': { value: 'var(--cd-color-text-2)', category: 'color', label: '未到达图标文字色', usage: 'wait 态图标文字色（组件消费）' },
  'steps-icon-color-active': { value: 'var(--cd-color-text-inverse)', category: 'color', label: '激活图标文字色', usage: 'process/finish 态图标文字色（组件消费）' },
  'steps-icon-bg-process': { value: 'var(--cd-color-primary)', category: 'color', label: '进行中图标背景', usage: 'process 态图标背景（组件消费）' },
  'steps-icon-bg-finish': { value: 'var(--cd-color-primary)', category: 'color', label: '已完成图标背景', usage: 'finish 态图标背景（组件消费）' },
  'steps-icon-bg-error': { value: 'var(--cd-color-danger)', category: 'color', label: '错误图标背景', usage: 'error 态图标背景（组件消费）' },

  // 标题 / 描述文字
  'steps-title-color': { value: 'var(--cd-color-text-0)', category: 'color', label: '标题文字色', usage: '步骤条标题文字色（组件消费）' },
  'steps-desc-color': { value: 'var(--cd-color-text-2)', category: 'color', label: '描述文字色', usage: '步骤条辅助描述文字色（组件消费）' },

  // 连接线
  'steps-line-color': { value: 'var(--cd-color-fill-2)', category: 'color', label: '连接线颜色', usage: '步骤条连接线默认色（组件消费）' },
  'steps-line-color-finish': { value: 'var(--cd-color-primary)', category: 'color', label: '已完成连线颜色', usage: '已完成步骤连接线色（组件消费）' },

  // basic 线框型：节点圆圈描边而非实心填充
  'steps-basic-color': { value: 'var(--cd-color-text-2)', category: 'color', label: '线框默认文字色', usage: 'basic 型 wait 态图标文字色（组件消费）' },
  'steps-basic-border': { value: 'var(--cd-color-border)', category: 'color', label: '线框默认描边', usage: 'basic 型 wait 态图标描边（组件消费）' },
  'steps-basic-color-process': { value: 'var(--cd-color-primary)', category: 'color', label: '线框进行中文字色', usage: 'basic 型 process 态图标文字色（组件消费）' },
  'steps-basic-border-process': { value: 'var(--cd-color-primary)', category: 'color', label: '线框进行中描边', usage: 'basic 型 process 态图标描边（组件消费）' },
  'steps-basic-color-finish': { value: 'var(--cd-color-primary)', category: 'color', label: '线框已完成文字色', usage: 'basic 型 finish 态图标文字色（组件消费）' },
  'steps-basic-border-finish': { value: 'var(--cd-color-primary)', category: 'color', label: '线框已完成描边', usage: 'basic 型 finish 态图标描边（组件消费）' },
  'steps-basic-color-error': { value: 'var(--cd-color-danger)', category: 'color', label: '线框错误文字色', usage: 'basic 型 error 态图标文字色（组件消费）' },
  'steps-basic-border-error': { value: 'var(--cd-color-danger)', category: 'color', label: '线框错误描边', usage: 'basic 型 error 态图标描边（组件消费）' },

  // dot 模式：图标缩为小圆点，process 态放大
  'steps-dot-size': { value: '8px', category: 'width', label: '圆点尺寸', usage: 'dot 模式圆点边长（组件消费）' },
  'steps-dot-size-active': { value: '10px', category: 'width', label: '激活圆点尺寸', usage: 'dot 模式 process 态圆点边长（组件消费）' },
} satisfies TokenGroup;
