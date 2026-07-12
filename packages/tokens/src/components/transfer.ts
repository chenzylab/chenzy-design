/**
 * Component tokens for Transfer. 对齐 Semi Design
 * （semi-foundation/transfer/variables.scss），仅保留组件实际消费的 token，并升级为
 * 带元数据的 TokenDef 结构以支持 DSM。值为 var() 引用我们的 alias / global token，或字面量。
 * 末尾保留 chenzy-design Transfer 实际消费的补充 token（Semi 无 / 命名差异；组件消费），
 * 值对齐 Semi。
 */
import type { TokenGroup } from './token-def.js';

export const transferTokens = {
  // —— Color ——
  'color-transfer-header-text': { value: 'var(--cd-color-text-2)', category: 'color', label: 'header 文字色', usage: '穿梭框 header 文字颜色' },
  'color-transfer-empty-text': { value: 'var(--cd-color-text-2)', category: 'color', label: '空态文字色', usage: '穿梭框空状态文字颜色' },
  'color-transfer-group-title-text': { value: 'var(--cd-color-text-2)', category: 'color', label: '分组标题文字色', usage: '穿梭框分组标题文字颜色' },
  'color-transfer-close-icon-icon': { value: 'var(--cd-color-text-2)', category: 'color', label: '关闭按钮色', usage: '穿梭框关闭按钮颜色' },

  // —— chenzy-design Transfer 实际消费的补充 token（Semi 无 / 命名差异；组件消费；值对齐 Semi） ——
  'transfer-panel-width': { value: '200px', category: 'width', label: '面板宽度', usage: '单侧面板固定宽度（组件消费；Semi 用 50% 弹性宽度）' },
  'transfer-panel-height': { value: '240px', category: 'height', label: '面板高度', usage: '单侧面板高度（组件消费；Semi $height-transfer 为 400px，我们用更紧凑 240px）' },
  'transfer-panel-border': { value: 'var(--cd-color-border)', category: 'color', label: '面板描边色', usage: '面板描边（组件消费）' },
  'transfer-panel-radius': { value: 'var(--cd-border-radius-medium)', category: 'radius', label: '面板圆角', usage: '面板圆角（组件消费）' },
  'transfer-panel-header-bg': { value: 'var(--cd-color-fill-0)', category: 'color', label: '面板头背景色', usage: '面板头部背景（组件消费）' },
  'transfer-item-height': { value: '36px', category: 'height', label: '条目高度', usage: '列表条目最小高度（组件消费；对齐 Semi height-transfer_item-minHeight 36px）' },
  'transfer-item-bg-hover': { value: 'var(--cd-color-fill-0)', category: 'color', label: '条目悬浮背景色', usage: '条目悬浮背景（组件消费）' },
  'transfer-item-bg-checked': { value: 'var(--cd-color-primary-light-default)', category: 'color', label: '条目选中背景色', usage: '选项行 aria-selected 背景（组件消费）' },
  'transfer-item-disabled-text': { value: 'var(--cd-color-disabled-text)', category: 'color', label: '条目禁用文字色', usage: '禁用选项行文字（组件消费）' },
  'transfer-tree-indent': { value: '18px', category: 'spacing', label: '树缩进', usage: '树节点每层缩进（组件消费）' },
  'transfer-gap': { value: 'var(--cd-spacing-base-tight)', category: 'spacing', label: '双栏间距', usage: '双栏与操作按钮间距（组件消费）' },
} satisfies TokenGroup;
