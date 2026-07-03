/**
 * Component tokens for Transfer. 全量对齐 Semi Design
 * （semi-foundation/transfer/variables.scss，47 个变量），并升级为带元数据的
 * TokenDef 结构以支持 DSM。值为 var() 引用我们的 alias / global token，或字面量。
 * 末尾保留 chenzy-design Transfer 实际消费的补充 token（Semi 无 / 命名差异；组件消费），
 * 值对齐 Semi。
 *
 * 注：Semi 的 var(--semi-color-white) 我们无对应 --cd-color-white alias，
 * 用最接近的 --cd-color-text-inverse（= #ffffff）替代，未发明新 alias。
 */
import type { TokenGroup } from './token-def.js';

export const transferTokens = {
  // —— Color ——
  'color-transfer-bg': { value: 'var(--cd-color-bg-1)', category: 'color', label: '穿梭框背景色', usage: '穿梭框背景颜色 - 默认' },
  'color-transfer-disabled-bg': { value: 'var(--cd-color-disabled-fill)', category: 'color', label: '禁用背景色', usage: '穿梭框背景颜色 - 禁用' },
  'color-transfer-border': { value: 'var(--cd-color-border)', category: 'color', label: '描边色', usage: '穿梭框描边颜色 - 默认' },
  'color-transfer-header-text': { value: 'var(--cd-color-text-2)', category: 'color', label: 'header 文字色', usage: '穿梭框 header 文字颜色' },
  'color-transfer-empty-text': { value: 'var(--cd-color-text-2)', category: 'color', label: '空态文字色', usage: '穿梭框空状态文字颜色' },
  'color-transfer-group-title-text': { value: 'var(--cd-color-text-2)', category: 'color', label: '分组标题文字色', usage: '穿梭框分组标题文字颜色' },
  'color-transfer-disabled-text': { value: 'var(--cd-color-disabled-text)', category: 'color', label: '禁用文字色', usage: '穿梭框禁用文本文字颜色' },
  'color-transfer-close-icon-icon': { value: 'var(--cd-color-text-2)', category: 'color', label: '关闭按钮色', usage: '穿梭框关闭按钮颜色' },
  'color-transfer-item-text': { value: 'var(--cd-color-text-1)', category: 'color', label: '常规文字色', usage: '穿梭框常规文字颜色' },
  'color-transfer-selected-item-text': { value: 'var(--cd-color-text-0)', category: 'color', label: '选中条目文字色', usage: '穿梭框选中条目文字颜色' },
  'color-transfer-item-bg-default': { value: 'var(--cd-color-text-inverse)', category: 'color', label: '条目背景色', usage: '穿梭框条目背景色 - 默认' },
  'color-transfer-item-bg-hover': { value: 'var(--cd-color-fill-0)', category: 'color', label: '条目背景色', usage: '穿梭框条目背景色 - 悬浮' },
  'color-transfer-item-bg-active': { value: 'var(--cd-color-fill-1)', category: 'color', label: '条目背景色', usage: '穿梭框条目背景色 - 按下' },

  // —— Width / Height ——
  'width-transfer-border': { value: '1px', category: 'width', label: '描边宽度', usage: '穿梭框描边宽度' },
  'width-transfer-minwidth': { value: '402px', category: 'width', label: '整体最小宽度', usage: '穿梭框整体最小宽度' },
  'height-transfer': { value: '400px', category: 'height', label: '穿梭框高度', usage: '穿梭框高度' },
  'height-transfer-header': { value: '24px', category: 'height', label: 'header 高度', usage: '穿梭框 header 高度' },
  'height-transfer-item-minheight': { value: '36px', category: 'height', label: '条目最小高度', usage: '穿梭框条目最小高度' },
  'width-transfer-item-close-icon': { value: 'var(--cd-width-icon-small)', category: 'width', label: '删除按钮宽度', usage: '穿梭框选中条目删除按钮宽度' },
  'width-transfer-left': { value: '50%', category: 'width', label: '左侧面板宽度', usage: '穿梭框左侧面板宽度' },
  'width-transfer-right': { value: '50%', category: 'width', label: '右侧面板宽度', usage: '穿梭框右侧面板宽度' },
  'height-transfer-left-empty': { value: '36px', category: 'height', label: '空态高度', usage: '穿梭框空状态高度' },
  'width-transfer-left-border': { value: 'var(--cd-border-thickness-control)', category: 'width', label: '分割线宽度', usage: '穿梭框双侧面板分割线宽度' },
  'height-transfer-right-header': { value: '32px', category: 'height', label: '右侧 header 高度', usage: '穿梭框 header 高度' },
  'height-transfer-right-empty': { value: '100%', category: 'height', label: '右侧空态高度', usage: '穿梭框右侧空状态宽度' },
  'width-transfer-empty': { value: '100%', category: 'width', label: '整体空态宽度', usage: '穿梭框整体空状态宽度' },
  'height-transfer-group-title': { value: '28px', category: 'height', label: '分组标题高度', usage: '穿梭框分组标题高度' },

  // —— Spacing ——
  'spacing-transfer-header-margintop': { value: '12px', category: 'spacing', label: 'header 顶外边距', usage: '穿梭框 header 顶部外边距' },
  'spacing-transfer-header-marginright': { value: '12px', category: 'spacing', label: 'header 右外边距', usage: '穿梭框 header 右侧外边距' },
  'spacing-transfer-header-marginbottom': { value: '8px', category: 'spacing', label: 'header 底外边距', usage: '穿梭框 header 底部外边距' },
  'spacing-transfer-header-marginleft': { value: '12px', category: 'spacing', label: 'header 左外边距', usage: '穿梭框 header 左侧外边距' },
  'spacing-transfer-header-all-marginleft': { value: 'var(--cd-spacing-base)', category: 'spacing', label: '全选按钮左外边距', usage: '穿梭框全选按钮左侧外边距' },
  'spacing-transfer-item-paddingtop': { value: 'var(--cd-spacing-tight)', category: 'spacing', label: '条目顶内边距', usage: '穿梭框条目顶部内边距' },
  'spacing-transfer-item-paddingright': { value: '9px', category: 'spacing', label: '条目右内边距', usage: '穿梭框条目右侧内边距' },
  'spacing-transfer-item-paddingbottom': { value: 'var(--cd-spacing-tight)', category: 'spacing', label: '条目底内边距', usage: '穿梭框条目底部内边距' },
  'spacing-transfer-item-paddingleft': { value: 'var(--cd-spacing-base-tight)', category: 'spacing', label: '条目左内边距', usage: '穿梭框条目左侧内边距' },
  'spacing-transfer-right-header-margintop': { value: 'var(--cd-spacing-base-tight)', category: 'spacing', label: '右侧 header 顶外边距', usage: '穿梭框右侧面板 header 顶部外边距' },
  'spacing-transfer-right-header-marginbottom': { value: '0', category: 'spacing', label: '右侧 header 底外边距', usage: '穿梭框右侧面板 header 底部外边距' },
  'spacing-transfer-right-item-drag-handler-marginright': { value: '4px', category: 'spacing', label: '拖动图标右外边距', usage: '穿梭框拖动图标右侧外边距' },
  'spacing-transfer-filter-margintop': { value: '12px', category: 'spacing', label: '搜索顶外边距', usage: '穿梭框搜索顶部外边距' },
  'spacing-transfer-filter-marginright': { value: '12px', category: 'spacing', label: '搜索右外边距', usage: '穿梭框搜索右侧外边距' },
  'spacing-transfer-filter-marginbottom': { value: '0', category: 'spacing', label: '搜索底外边距', usage: '穿梭框搜索底部外边距' },
  'spacing-transfer-filter-marginleft': { value: '12px', category: 'spacing', label: '搜索左外边距', usage: '穿梭框搜索左侧外边距' },
  'spacing-transfer-group-title-paddingleft': { value: 'var(--cd-spacing-base-tight)', category: 'spacing', label: '分组标题左内边距', usage: '穿梭框分组标题左侧内边距' },

  // —— Radius ——
  'radius-transfer': { value: 'var(--cd-border-radius-medium)', category: 'radius', label: '穿梭框圆角', usage: '穿梭框圆角' },

  // —— Font ——
  'font-transfer-header-all-fontweight': { value: '600', category: 'font', label: '全选字重', usage: '穿梭框字重' },

  // —— Other（z-index）——
  'z-transfer-right-item-drag-item-move': { value: '2000', category: 'other', label: '拖拽元素层级', usage: '穿梭框右侧面板中正在拖拽元素的 z-index' },

  // —— chenzy-design Transfer 实际消费的补充 token（Semi 无 / 命名差异；组件消费；值对齐 Semi） ——
  'transfer-panel-width': { value: '200px', category: 'width', label: '面板宽度', usage: '单侧面板固定宽度（组件消费；Semi 用 50% 弹性宽度）' },
  'transfer-panel-height': { value: '240px', category: 'height', label: '面板高度', usage: '单侧面板高度（组件消费；Semi $height-transfer 为 400px，我们用更紧凑 240px）' },
  'transfer-panel-border': { value: 'var(--cd-color-transfer-border)', category: 'color', label: '面板描边色', usage: '面板描边（组件消费；转引 color-transfer-border）' },
  'transfer-panel-radius': { value: 'var(--cd-radius-transfer)', category: 'radius', label: '面板圆角', usage: '面板圆角（组件消费；转引 radius-transfer）' },
  'transfer-panel-header-bg': { value: 'var(--cd-color-fill-0)', category: 'color', label: '面板头背景色', usage: '面板头部背景（组件消费）' },
  'transfer-item-height': { value: '36px', category: 'height', label: '条目高度', usage: '列表条目最小高度（组件消费；对齐 Semi height-transfer_item-minHeight 36px）' },
  'transfer-item-bg-hover': { value: 'var(--cd-color-transfer-item-bg-hover)', category: 'color', label: '条目悬浮背景色', usage: '条目悬浮背景（组件消费；转引 color-transfer-item-bg-hover）' },
  'transfer-item-bg-checked': { value: 'var(--cd-color-primary-light-default)', category: 'color', label: '条目选中背景色', usage: '选项行 aria-selected 背景（组件消费）' },
  'transfer-item-disabled-text': { value: 'var(--cd-color-disabled-text)', category: 'color', label: '条目禁用文字色', usage: '禁用选项行文字（组件消费；转引 color-transfer-disabled-text）' },
  'transfer-tree-indent': { value: '18px', category: 'spacing', label: '树缩进', usage: '树节点每层缩进（组件消费）' },
  'transfer-gap': { value: 'var(--cd-spacing-base-tight)', category: 'spacing', label: '双栏间距', usage: '双栏与操作按钮间距（组件消费）' },
} satisfies TokenGroup;
