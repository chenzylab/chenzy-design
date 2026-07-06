/**
 * Component tokens for SideBar（M4 show/AI，重量级套件，分阶段交付）。
 * P0 Container 浮层壳 + P1 主壳/Options 的容器背景/边框/宽度/header/Options 项 token。
 * 对标 Semi Sidebar，但补齐 chenzy-design 增强（focus 环、Options 激活态等）。
 * 拖拽把手复用 Resizable 的 --cd-resizable-handle-* token（Container 复用 Resizable），
 * 不再重复定义。值为 var() 引用 alias / global token，或字面量。
 * 见 specs/components/show/SideBar.spec.md §5。
 */
import type { TokenGroup } from './token-def.js';

export const sideBarTokens = {
  // —— Container 面板 ——
  'sidebar-bg': { value: 'var(--cd-color-bg-2)', category: 'color', label: '容器背景', usage: 'Container 浮层背景（组件消费）' },
  'sidebar-color': { value: 'var(--cd-color-text-1)', category: 'color', label: '容器正文色', usage: 'Container 正文文字颜色（组件消费）' },
  'sidebar-border': { value: 'var(--cd-color-border)', category: 'color', label: '容器边框色', usage: 'Container 边框/分隔线颜色（组件消费）' },
  'sidebar-shadow': { value: 'var(--cd-shadow-elevated)', category: 'other', label: '容器阴影', usage: 'Container 浮层阴影（组件消费）' },
  'sidebar-radius': { value: 'var(--cd-border-radius-large)', category: 'radius', label: '容器圆角', usage: 'Container 贴边对侧圆角（组件消费）' },
  'sidebar-width': { value: '400px', category: 'other', label: '容器默认宽度', usage: 'Container 默认宽度（组件消费）' },
  'sidebar-z': { value: 'var(--cd-z-modal)', category: 'other', label: '层叠层级', usage: 'Container 浮层 z-index 基线（组件消费；运行时按堆叠计数覆盖）' },
  'sidebar-motion-duration': { value: 'var(--cd-motion-duration-mid)', category: 'animation', label: '展开动效时长', usage: 'Container 展开/收起过渡时长（组件消费）' },

  // —— Header ——
  'sidebar-header-padding': { value: 'var(--cd-spacing-base-tight) 16px', category: 'spacing', label: 'header 内边距', usage: 'Container header 内边距（组件消费）' },
  'sidebar-title-color': { value: 'var(--cd-color-text-0)', category: 'color', label: '标题颜色', usage: 'Container 标题文字颜色（组件消费）' },
  'sidebar-title-size': { value: 'var(--cd-font-size-regular)', category: 'font', label: '标题字号', usage: 'Container 标题字号（组件消费）' },
  'sidebar-title-weight': { value: 'var(--cd-font-weight-bold)', category: 'font', label: '标题字重', usage: 'Container 标题字重（组件消费）' },
  'sidebar-close-color': { value: 'var(--cd-color-text-2)', category: 'color', label: '关闭图标色', usage: '关闭按钮图标颜色（组件消费）' },
  'sidebar-close-hover-bg': { value: 'var(--cd-color-fill-1)', category: 'color', label: '关闭悬浮背景', usage: '关闭按钮悬浮背景（组件消费）' },
  'sidebar-close-radius': { value: 'var(--cd-border-radius-small)', category: 'radius', label: '关闭按钮圆角', usage: '关闭按钮圆角（组件消费）' },

  // —— Body ——
  'sidebar-body-padding': { value: '16px', category: 'spacing', label: '内容区内边距', usage: 'Container 内容区内边距（组件消费）' },

  // —— Options 图标 tab 组（P1）——
  'sidebar-options-gap': { value: 'var(--cd-spacing-tight)', category: 'spacing', label: 'Options 项间距', usage: 'Options 图标 tab 项之间间距（组件消费）' },
  'sidebar-options-padding': { value: 'var(--cd-spacing-tight) 16px', category: 'spacing', label: 'Options 栏内边距', usage: 'Options 图标 tab 栏内边距（组件消费）' },
  'sidebar-option-size': { value: '32px', category: 'other', label: 'Option 项尺寸', usage: '单个 Option 图标 tab 命中区尺寸（组件消费）' },
  'sidebar-option-radius': { value: 'var(--cd-border-radius-medium)', category: 'radius', label: 'Option 圆角', usage: '单个 Option 圆角（组件消费）' },
  'sidebar-option-color': { value: 'var(--cd-color-text-2)', category: 'color', label: 'Option 默认色', usage: 'Option 图标默认颜色（组件消费）' },
  'sidebar-option-color-hover': { value: 'var(--cd-color-text-0)', category: 'color', label: 'Option hover 色', usage: 'Option hover 图标颜色（组件消费）' },
  'sidebar-option-bg-hover': { value: 'var(--cd-color-fill-0)', category: 'color', label: 'Option hover 背景', usage: 'Option hover 背景（组件消费）' },
  'sidebar-option-color-active': { value: 'var(--cd-color-primary)', category: 'color', label: 'Option 激活色', usage: '当前激活 Option 图标颜色（组件消费）' },
  'sidebar-option-bg-active': { value: 'var(--cd-color-primary-light-default)', category: 'color', label: 'Option 激活背景', usage: '当前激活 Option 背景（组件消费）' },

  // —— 详情返回按钮（P1）——
  'sidebar-back-color': { value: 'var(--cd-color-text-1)', category: 'color', label: '返回按钮色', usage: '详情视图返回按钮颜色（组件消费）' },
  'sidebar-back-hover-bg': { value: 'var(--cd-color-fill-1)', category: 'color', label: '返回按钮悬浮背景', usage: '详情视图返回按钮悬浮背景（组件消费）' },

  // —— Annotation 引用溯源卡片（P2）——
  'sidebar-annotation-gap': { value: 'var(--cd-spacing-tight)', category: 'spacing', label: 'Annotation 条目间距', usage: 'Annotation 分组内条目之间间距（组件消费）' },
  'sidebar-annotation-card-bg': { value: 'var(--cd-color-fill-0)', category: 'color', label: '卡片背景', usage: 'Annotation 引用卡片背景（组件消费）' },
  'sidebar-annotation-card-bg-hover': { value: 'var(--cd-color-fill-1)', category: 'color', label: '卡片悬浮背景', usage: 'Annotation 引用卡片悬浮背景（组件消费）' },
  'sidebar-annotation-card-border': { value: 'var(--cd-color-border)', category: 'color', label: '卡片边框', usage: 'Annotation 引用卡片边框（组件消费）' },
  'sidebar-annotation-card-radius': { value: 'var(--cd-border-radius-medium)', category: 'radius', label: '卡片圆角', usage: 'Annotation 引用卡片圆角（组件消费）' },
  'sidebar-annotation-card-padding': { value: 'var(--cd-spacing-tight)', category: 'spacing', label: '卡片内边距', usage: 'Annotation 引用卡片内边距（组件消费）' },
  'sidebar-annotation-title-color': { value: 'var(--cd-color-text-0)', category: 'color', label: '卡片标题色', usage: 'Annotation 卡片标题颜色（组件消费）' },
  'sidebar-annotation-title-size': { value: 'var(--cd-font-size-regular)', category: 'font', label: '卡片标题字号', usage: 'Annotation 卡片标题字号（组件消费）' },
  'sidebar-annotation-detail-color': { value: 'var(--cd-color-text-2)', category: 'color', label: '卡片摘要色', usage: 'Annotation 文本卡片摘要颜色（组件消费）' },
  'sidebar-annotation-detail-size': { value: 'var(--cd-font-size-secondary)', category: 'font', label: '卡片摘要字号', usage: 'Annotation 文本卡片摘要字号（组件消费）' },
  'sidebar-annotation-footer-color': { value: 'var(--cd-color-text-2)', category: 'color', label: '页脚站点色', usage: 'Annotation 卡片页脚站点名颜色（组件消费）' },
  'sidebar-annotation-order-color': { value: 'var(--cd-color-text-2)', category: 'color', label: '序号色', usage: 'Annotation 卡片引用序号颜色（组件消费）' },
  'sidebar-annotation-order-bg': { value: 'var(--cd-color-fill-1)', category: 'color', label: '序号背景', usage: 'Annotation 卡片引用序号背景（组件消费）' },
  'sidebar-annotation-duration-bg': { value: 'rgba(0, 0, 0, 0.6)', category: 'color', label: '时长遮罩背景', usage: 'Annotation 视频卡片时长标签背景（组件消费）' },
  'sidebar-annotation-duration-color': { value: '#fff', category: 'color', label: '时长文字色', usage: 'Annotation 视频卡片时长标签文字色（组件消费）' },
  'sidebar-annotation-cover-bg': { value: 'var(--cd-color-fill-1)', category: 'color', label: '封面占位背景', usage: 'Annotation 视频卡片封面占位背景（组件消费）' },
  // —— CodeContent 代码/JSON 预览列表（P4）——
  'sidebar-code-head-gap': { value: 'var(--cd-spacing-tight)', category: 'spacing', label: 'CodeContent 头部图标间距', usage: 'CodeContent 折叠头图标与文本间距（组件消费）' },
  'sidebar-code-head-icon-color': { value: 'var(--cd-color-text-2)', category: 'color', label: 'CodeContent 头部图标色', usage: 'CodeContent 折叠头前导图标颜色（组件消费）' },
  'sidebar-code-head-color': { value: 'var(--cd-color-text-0)', category: 'color', label: 'CodeContent 头部文本色', usage: 'CodeContent 折叠头 name 文本颜色（组件消费）' },
  'sidebar-code-head-size': { value: 'var(--cd-font-size-regular)', category: 'font', label: 'CodeContent 头部字号', usage: 'CodeContent 折叠头 name 字号（组件消费）' },
  'sidebar-code-head-weight': { value: 'var(--cd-font-weight-medium)', category: 'font', label: 'CodeContent 头部字重', usage: 'CodeContent 折叠头 name 字重（组件消费）' },
  'sidebar-code-expand-color': { value: 'var(--cd-color-text-2)', category: 'color', label: 'CodeContent 展开按钮色', usage: 'CodeContent 全屏展开按钮图标颜色（组件消费）' },
  'sidebar-code-expand-hover-bg': { value: 'var(--cd-color-fill-1)', category: 'color', label: 'CodeContent 展开按钮悬浮背景', usage: 'CodeContent 全屏展开按钮悬浮背景（组件消费）' },
  'sidebar-code-body-padding': { value: 'var(--cd-spacing-tight) 0', category: 'spacing', label: 'CodeContent 内容区内边距', usage: 'CodeContent 折叠内容区（代码/JSON）内边距（组件消费）' },

  // —— MCPConfigure MCP 工具配置面板（P3）——
  'sidebar-mcp-gap': { value: 'var(--cd-spacing-base-tight)', category: 'spacing', label: 'MCP 区块间距', usage: 'MCPConfigure 搜索/分组区块之间纵向间距（组件消费）' },
  'sidebar-mcp-count-color': { value: 'var(--cd-color-text-2)', category: 'color', label: 'MCP 计数色', usage: 'MCPConfigure 已激活计数文本颜色（组件消费）' },
  'sidebar-mcp-count-size': { value: 'var(--cd-font-size-secondary)', category: 'font', label: 'MCP 计数字号', usage: 'MCPConfigure 已激活计数字号（组件消费）' },
  'sidebar-mcp-group-title-color': { value: 'var(--cd-color-text-2)', category: 'color', label: 'MCP 分组标题色', usage: 'MCPConfigure 内置/自定义分组标题颜色（组件消费）' },
  'sidebar-mcp-group-title-size': { value: 'var(--cd-font-size-secondary)', category: 'font', label: 'MCP 分组标题字号', usage: 'MCPConfigure 分组标题字号（组件消费）' },
  'sidebar-mcp-item-gap': { value: 'var(--cd-spacing-tight)', category: 'spacing', label: 'MCP 列表项间距', usage: 'MCPConfigure 列表项纵向间距（组件消费）' },
  'sidebar-mcp-item-padding': { value: 'var(--cd-spacing-tight)', category: 'spacing', label: 'MCP 列表项内边距', usage: 'MCPConfigure 单个工具项内边距（组件消费）' },
  'sidebar-mcp-item-gutter': { value: 'var(--cd-spacing-tight)', category: 'spacing', label: 'MCP 列表项内元素间距', usage: 'MCPConfigure 工具项内图标/文本/动作横向间距（组件消费）' },
  'sidebar-mcp-item-radius': { value: 'var(--cd-border-radius-medium)', category: 'radius', label: 'MCP 列表项圆角', usage: 'MCPConfigure 工具项圆角（组件消费）' },
  'sidebar-mcp-item-bg': { value: 'var(--cd-color-fill-0)', category: 'color', label: 'MCP 列表项背景', usage: 'MCPConfigure 工具项背景（组件消费）' },
  'sidebar-mcp-item-bg-hover': { value: 'var(--cd-color-fill-1)', category: 'color', label: 'MCP 列表项悬浮背景', usage: 'MCPConfigure 工具项悬浮背景（组件消费）' },
  'sidebar-mcp-item-border': { value: 'var(--cd-color-border)', category: 'color', label: 'MCP 列表项边框', usage: 'MCPConfigure 工具项边框（组件消费）' },
  'sidebar-mcp-icon-size': { value: '32px', category: 'other', label: 'MCP 图标尺寸', usage: 'MCPConfigure 工具项前置图标尺寸（组件消费）' },
  'sidebar-mcp-icon-radius': { value: 'var(--cd-border-radius-small)', category: 'radius', label: 'MCP 图标圆角', usage: 'MCPConfigure 工具项前置图标圆角（组件消费）' },
  'sidebar-mcp-icon-bg': { value: 'var(--cd-color-fill-1)', category: 'color', label: 'MCP 图标占位背景', usage: 'MCPConfigure 工具项前置图标占位背景（组件消费）' },
  'sidebar-mcp-label-color': { value: 'var(--cd-color-text-0)', category: 'color', label: 'MCP 工具名色', usage: 'MCPConfigure 工具名文本颜色（组件消费）' },
  'sidebar-mcp-label-size': { value: 'var(--cd-font-size-regular)', category: 'font', label: 'MCP 工具名字号', usage: 'MCPConfigure 工具名字号（组件消费）' },
  'sidebar-mcp-desc-color': { value: 'var(--cd-color-text-2)', category: 'color', label: 'MCP 描述色', usage: 'MCPConfigure 工具描述文本颜色（组件消费）' },
  'sidebar-mcp-desc-size': { value: 'var(--cd-font-size-secondary)', category: 'font', label: 'MCP 描述字号', usage: 'MCPConfigure 工具描述字号（组件消费）' },
  'sidebar-mcp-action-color': { value: 'var(--cd-color-text-2)', category: 'color', label: 'MCP 动作按钮色', usage: 'MCPConfigure 配置/编辑动作按钮图标颜色（组件消费）' },
  'sidebar-mcp-action-hover-bg': { value: 'var(--cd-color-fill-1)', category: 'color', label: 'MCP 动作按钮悬浮背景', usage: 'MCPConfigure 配置/编辑动作按钮悬浮背景（组件消费）' },
  'sidebar-mcp-empty-color': { value: 'var(--cd-color-text-2)', category: 'color', label: 'MCP 空态色', usage: 'MCPConfigure 自定义空态文本颜色（组件消费）' },
} satisfies TokenGroup;
