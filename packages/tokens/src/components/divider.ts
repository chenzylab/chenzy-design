/**
 * Component tokens for Divider. 全量对齐 Semi Design
 * （semi-foundation/divider/variables.scss，19 个），升级为带元数据的 TokenDef
 * 结构以支持 DSM。值为 var() 引用我们的 alias / global token，或字面量。
 * 末尾保留 chenzy-design Divider 实际消费的补充 token（Semi 无），值对齐 Semi。
 *
 * 见 specs/components/basic/Divider.spec.md、specs/00-foundation/dsm.spec.md §4。
 */
import type { TokenGroup } from './token-def.js';

export const dividerTokens = {
  // —— 水平模式外间距 ——
  'spacing-divider-horizontal-marginleft': { value: '0px', category: 'spacing', label: '水平模式左间距', usage: '水平模式左间距' },
  'spacing-divider-horizontal-marginright': { value: '0px', category: 'spacing', label: '水平模式右间距', usage: '水平模式右间距' },
  'spacing-divider-horizontal-margintop': { value: '1px', category: 'spacing', label: '水平模式上间距', usage: '水平模式上间距' },
  'spacing-divider-horizontal-marginbottom': { value: '1px', category: 'spacing', label: '水平模式下间距', usage: '水平模式下间距' },

  // —— 垂直模式外间距 ——
  'spacing-divider-vertical-marginleft': { value: '1px', category: 'spacing', label: '垂直模式左间距', usage: '垂直模式左间距' },
  'spacing-divider-vertical-marginright': { value: '1px', category: 'spacing', label: '垂直模式右间距', usage: '垂直模式右间距' },
  'spacing-divider-vertical-margintop': { value: '0px', category: 'spacing', label: '垂直模式上间距', usage: '垂直模式上间距' },
  'spacing-divider-vertical-marginbottom': { value: '0px', category: 'spacing', label: '垂直模式下间距', usage: '垂直模式下间距' },

  // —— 纯文字内容内间距 ——
  'spacing-divider-inner-text-paddingleft': { value: '8px', category: 'spacing', label: '文字左间距', usage: '内容为纯文字时内容左间距' },
  'spacing-divider-inner-text-paddingright': { value: '8px', category: 'spacing', label: '文字右间距', usage: '内容为纯文字时内容右间距' },
  'spacing-divider-inner-text-paddingtop': { value: '0px', category: 'spacing', label: '文字上间距', usage: '内容为纯文字时内容上间距' },
  'spacing-divider-inner-text-paddingbottom': { value: '0px', category: 'spacing', label: '文字下间距', usage: '内容为纯文字时内容下间距' },

  // —— 对齐文字时的线段宽度 ——
  'width-divider-inner-text-left-line': { value: '40px', category: 'width', label: '左对齐线宽', usage: '左对齐文字时左间距宽度' },
  'width-divider-inner-text-right-line': { value: '40px', category: 'width', label: '右对齐线宽', usage: '右对齐文字时右间距宽度' },

  // —— 线宽 / 高度 ——
  'width-divider-border': { value: '1px', category: 'width', label: '分割线宽度', usage: '分割线宽度' },
  'height-divider-vertical': { value: '20px', category: 'height', label: '垂直分割线高度', usage: '垂直分割线高度' },

  // —— 颜色 / 字重 ——
  'color-divider-border-color': { value: 'var(--cd-color-border)', category: 'color', label: '分割线颜色', usage: '分割线颜色' },
  'color-divider-text-default': { value: 'var(--cd-color-text-0)', category: 'color', label: '标题颜色', usage: '标题颜色' },
  'font-divider-text-weight': { value: 'var(--cd-font-weight-bold)', category: 'font', label: '分割线文字字重', usage: '分割线文字字重' },

  // —— chenzy-design Divider 实际消费的补充 token（Semi 无；组件消费；值对齐 Semi） ——
  'divider-color': { value: 'var(--cd-color-divider-border-color)', category: 'color', label: '分割线颜色', usage: '分割线描边颜色（组件消费）' },
  'divider-thickness': { value: 'var(--cd-width-divider-border)', category: 'width', label: '分割线宽度', usage: '分割线宽度（组件消费；对齐 Semi 1px）' },
  'divider-spacing': { value: 'var(--cd-spacing-divider-horizontal-margintop)', category: 'spacing', label: '分割线主轴外边距', usage: '分割线主轴外边距（组件消费；对齐 Semi 1px）' },
  'divider-text-color': { value: 'var(--cd-color-divider-text-default)', category: 'color', label: '文字颜色', usage: '带文字分割线文字颜色（组件消费；对齐 Semi text-0）' },
  'divider-text-font-size': { value: 'var(--cd-font-size-regular)', category: 'font', label: '文字字号', usage: '带文字分割线文字字号（组件消费）' },
  'divider-text-gap': { value: 'var(--cd-spacing-divider-inner-text-paddingleft)', category: 'spacing', label: '文字两侧间距', usage: '带文字分割线文字与线段间距（组件消费；对齐 Semi 8px）' },
  'divider-text-weight': { value: 'var(--cd-font-divider-text-weight)', category: 'font', label: '文字字重', usage: 'plain=false 时文字字重（组件消费；对齐 Semi bold）' },
} satisfies TokenGroup;
