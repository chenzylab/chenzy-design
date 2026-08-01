/**
 * Component tokens for SideBar（M4 show/AI，重量级套件，分阶段交付）。
 * P0 Container 浮层壳 + P1 主壳/Options 的容器背景/边框/宽度/header/Options 项 token。
 * 对标 Semi Sidebar，但补齐 chenzy-design 增强（focus 环、Options 激活态等）。
 * 拖拽把手为 Container 自有 token（Resizable 已严格对齐 Semi、不再提供把手 CSS 变量），
 * 故此处自定义拖拽把手命中区/线色/hover 色，语义独立。值为 var() 引用 alias / global
 * token，或字面量。见 specs/components/show/SideBar.spec.md §5。
 */
import type { TokenGroup } from './token-def.js';

export const sideBarTokens = {
  // —— 拖拽把手（Container 自有，不再依赖 Resizable）——
  'sidebar-handle-size': { value: 'var(--cd-spacing-tight)', category: 'spacing', label: '把手命中区厚度', usage: 'Container 拖拽把手命中区厚度（组件消费）' },
  'sidebar-handle-color': { value: 'var(--cd-color-border)', category: 'color', label: '把手可视线色', usage: 'Container 拖拽把手默认可视分隔线颜色（组件消费）' },
  'sidebar-handle-color-hover': { value: 'var(--cd-color-primary)', category: 'color', label: '把手 hover 色', usage: 'Container 拖拽把手 hover/拖拽高亮色（组件消费）' },

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

  // ————————————————————————————————————————————————————————————————
  // Annotation 引用溯源（名/值逐条镜像 Semi sideBar/variables.scss 的
  // $*-sidebar_annotation_*，共 33 条）。
  //
  // 此前本层是自造命名（-card-* / -cover-* / -detail-*），与 Semi 的
  // -item-* / -video-* / -footer-* 一套对不上，主题/DSM 按 Semi 变量名找不到。
  //
  // ⚠️ Semi 的 annotation **item 本身没有边框/背景/圆角**（只有 cursor:pointer），
  // 那些是本库自造的卡片观感；带边框圆角的是 video 子卡。故本库那几条标为「本库自有」保留，
  // 不硬塞进 Semi 名下。
  // ————————————————————————————————————————————————————————————————
  'color-sidebar-annotation-video-border': { value: 'var(--cd-color-border)', category: 'color', label: '引用视频卡片边框颜色', usage: 'Semi $color-sidebar_annotation_video-border' },
  'sidebar-annotation-video-duration-bg': { value: 'color-mix(in srgb, var(--cd-color-grey-7) 70%, transparent)', category: 'color', label: '引用视频时长背景颜色', usage: 'Semi $color-sidebar_annotation_video_duration-bg' },
  'sidebar-annotation-video-duration-text': { value: 'var(--cd-color-bg-0)', category: 'color', label: '引用视频时长文本颜色', usage: 'Semi $color-sidebar_annotation_video_duration-text' },
  'sidebar-annotation-video-title-text': { value: 'var(--cd-color-text-0)', category: 'color', label: '引用视频标题文本颜色', usage: 'Semi $color-sidebar_annotation_video_title-text' },
  'sidebar-annotation-footer-logo': { value: '14px', category: 'width', label: '引用项底部 logo 宽高', usage: 'Semi $width-sidebar_annotation_footer_logo' },
  'sidebar-annotation-footer-order-min-width': { value: '16px', category: 'width', label: '引用项底部序号最小宽度', usage: 'Semi $width-sidebar_annotation_footer_order-minWidth' },
  'height-sidebar-annotation-footer-order': { value: '16px', category: 'height', label: '引用项底部序号高度', usage: 'Semi $height-sidebar_annotation_footer_order' },
  'sidebar-annotation-video-play': { value: '20px', category: 'width', label: '引用视频播放按钮宽度', usage: 'Semi $width-sidebar_annotation_video_play' },
  'sidebar-annotation-video-img-wrapper': { value: '107px', category: 'height', label: '引用视频封面容器高度', usage: 'Semi $height-sidebar_annotation_video_img-wrapper' },
  'width-sidebar-annotation-video-border': { value: '1px', category: 'width', label: '引用视频卡片边框宽度', usage: 'Semi $width-sidebar_annotation_video-border' },
  'sidebar-annotation-video-item-title': { value: '40px', category: 'height', label: '引用视频标题高度', usage: 'Semi $height-sidebar_annotation_video_item_title' },
  'sidebar-annotation-container-padding': { value: '12px', category: 'spacing', label: '引用容器内边距', usage: 'Semi $spacing-sidebar_annotation_container-padding' },
  'sidebar-annotation-content-gap': { value: '8px', category: 'spacing', label: '引用内容项间距', usage: 'Semi $spacing-sidebar_annotation_content-gap' },
  'sidebar-annotation-footer-column-gap': { value: '4px', category: 'spacing', label: '引用底部列间距', usage: 'Semi $spacing-sidebar_annotation_footer-columnGap' },
  'sidebar-annotation-footer-order-padding-y': { value: '0', category: 'spacing', label: '引用序号垂直内边距', usage: 'Semi $spacing-sidebar_annotation_footer_order-paddingY' },
  'sidebar-annotation-footer-order-padding-x': { value: '2px', category: 'spacing', label: '引用序号水平内边距', usage: 'Semi $spacing-sidebar_annotation_footer_order-paddingX' },
  'sidebar-annotation-text-padding-y': { value: '3px', category: 'spacing', label: '引用文本区域垂直内边距', usage: 'Semi $spacing-sidebar_annotation_text-paddingY' },
  'sidebar-annotation-text-padding-x': { value: '12px', category: 'spacing', label: '引用文本区域水平内边距', usage: 'Semi $spacing-sidebar_annotation_text-paddingX' },
  'sidebar-annotation-video-content-padding-top': { value: '8px', category: 'spacing', label: '引用视频内容区域上内边距', usage: 'Semi $spacing-sidebar_annotation_video_content-paddingTop' },
  'sidebar-annotation-video-content-padding-right': { value: '8px', category: 'spacing', label: '引用视频内容区域右内边距', usage: 'Semi $spacing-sidebar_annotation_video_content-paddingRight' },
  'sidebar-annotation-video-content-padding-bottom': { value: '12px', category: 'spacing', label: '引用视频内容区域下内边距', usage: 'Semi $spacing-sidebar_annotation_video_content-paddingBottom' },
  'sidebar-annotation-video-content-padding-left': { value: '8px', category: 'spacing', label: '引用视频内容区域左内边距', usage: 'Semi $spacing-sidebar_annotation_video_content-paddingLeft' },
  'sidebar-annotation-video-duration-padding-y': { value: '2px', category: 'spacing', label: '引用视频时长垂直内边距', usage: 'Semi $spacing-sidebar_annotation_video_duration-paddingY' },
  'sidebar-annotation-video-duration-padding-x': { value: '4px', category: 'spacing', label: '引用视频时长水平内边距', usage: 'Semi $spacing-sidebar_annotation_video_duration-paddingX' },
  'sidebar-annotation-video-play-top': { value: '6px', category: 'spacing', label: '引用视频播放按钮顶部偏移', usage: 'Semi $spacing-sidebar_annotation_video_play-top' },
  'sidebar-annotation-video-play-right': { value: '6px', category: 'spacing', label: '引用视频播放按钮右侧偏移', usage: 'Semi $spacing-sidebar_annotation_video_play-right' },
  'sidebar-annotation-video-duration-bottom': { value: '6px', category: 'spacing', label: '引用视频时长底部偏移', usage: 'Semi $spacing-sidebar_annotation_video_duration-bottom' },
  'sidebar-annotation-video-duration-right': { value: '6px', category: 'spacing', label: '引用视频时长右侧偏移', usage: 'Semi $spacing-sidebar_annotation_video_duration-right' },
  'radius-sidebar-annotation-footer-order': { value: '8px', category: 'radius', label: '引用序号圆角', usage: 'Semi $radius-sidebar_annotation_footer_order' },
  'sidebar-annotation-video': { value: '6px', category: 'radius', label: '引用视频卡片圆角', usage: 'Semi $radius-sidebar_annotation_video' },
  'radius-sidebar-annotation-video-duration': { value: '4px', category: 'radius', label: '引用视频时长标签圆角', usage: 'Semi $radius-sidebar_annotation_video_duration' },
  'sidebar-annotation-footer-logo-font-size': { value: '14px', category: 'font', label: '引用底部 logo 字号', usage: 'Semi $font-sidebar_annotation_footer_logo-fontSize' },
  'sidebar-annotation-video-play-icon-font-size': { value: '12px', category: 'font', label: '引用视频播放图标大小', usage: 'Semi $font-sidebar_annotation_video_play_icon-fontSize' },

  // —— 以下 annotation 相关为**本库自有**：Semi 的 annotation item 只有 cursor:pointer，
  //    卡片观感（背景/边框/圆角/hover）与文本层级色号是本库的增强，Semi 无对应变量。——
  'sidebar-annotation-card-bg': { value: 'var(--cd-color-fill-0)', category: 'color', label: '卡片背景', usage: '本库自有：引用卡片背景（Semi item 无背景）' },
  'sidebar-annotation-card-bg-hover': { value: 'var(--cd-color-fill-1)', category: 'color', label: '卡片悬浮背景', usage: '本库自有：引用卡片悬浮背景' },
  'sidebar-annotation-card-border': { value: 'var(--cd-color-border)', category: 'color', label: '卡片边框', usage: '本库自有：引用卡片边框（Semi 仅 video 子卡有边框）' },
  'sidebar-annotation-card-radius': { value: 'var(--cd-border-radius-medium)', category: 'radius', label: '卡片圆角', usage: '本库自有：引用卡片圆角' },
  'sidebar-annotation-detail-color': { value: 'var(--cd-color-text-2)', category: 'color', label: '卡片摘要色', usage: '本库自有：文本卡摘要色（Semi 该处内联 text-0）' },
  'sidebar-annotation-detail-size': { value: 'var(--cd-font-size-secondary)', category: 'font', label: '卡片摘要字号', usage: '本库自有：文本卡摘要字号' },
  'sidebar-annotation-footer-color': { value: 'var(--cd-color-text-2)', category: 'color', label: '页脚站点色', usage: '本库自有：页脚站点名色（Semi 内联 text-0）' },
  'sidebar-annotation-order-color': { value: 'var(--cd-color-text-2)', category: 'color', label: '序号色', usage: '本库自有：序号色（Semi 内联 text-2，未抽变量）' },
  'sidebar-annotation-order-bg': { value: 'var(--cd-color-fill-1)', category: 'color', label: '序号背景', usage: '本库自有：序号背景（Semi 内联 fill-1，未抽变量）' },
  'sidebar-annotation-cover-bg': { value: 'var(--cd-color-fill-1)', category: 'color', label: '封面占位背景', usage: '本库自有：视频封面占位背景' },
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
  // —— FileContent 富文本查看/编辑列表（P5）——
  'sidebar-file-gap': { value: 'var(--cd-spacing-tight)', category: 'spacing', label: 'FileContent 工具栏与编辑区间距', usage: 'FileItem 工具栏与编辑区之间间距（组件消费）' },
  'sidebar-file-menu-gap': { value: 'var(--cd-spacing-extra-tight)', category: 'spacing', label: 'FileContent 工具栏按钮间距', usage: 'FileItem 工具栏按钮之间间距（组件消费）' },
  'sidebar-file-menu-padding': { value: 'var(--cd-spacing-extra-tight) 0', category: 'spacing', label: 'FileContent 工具栏内边距', usage: 'FileItem 工具栏内边距（组件消费）' },
  'sidebar-file-menu-border': { value: 'var(--cd-color-border)', category: 'color', label: 'FileContent 工具栏分隔线色', usage: 'FileItem 工具栏底边/竖分隔线颜色（组件消费）' },
  'sidebar-file-btn-radius': { value: 'var(--cd-border-radius-small)', category: 'radius', label: 'FileContent 工具按钮圆角', usage: 'FileItem 工具栏按钮圆角（组件消费）' },
  'sidebar-file-btn-color': { value: 'var(--cd-color-text-2)', category: 'color', label: 'FileContent 工具按钮默认色', usage: 'FileItem 工具栏按钮默认图标色（组件消费）' },
  'sidebar-file-btn-color-hover': { value: 'var(--cd-color-text-0)', category: 'color', label: 'FileContent 工具按钮 hover 色', usage: 'FileItem 工具栏按钮 hover 图标色（组件消费）' },
  'sidebar-file-btn-hover-bg': { value: 'var(--cd-color-fill-0)', category: 'color', label: 'FileContent 工具按钮 hover 背景', usage: 'FileItem 工具栏按钮 hover 背景（组件消费）' },
  'sidebar-file-btn-color-active': { value: 'var(--cd-color-primary)', category: 'color', label: 'FileContent 工具按钮激活色', usage: 'FileItem 工具栏按钮激活图标色（组件消费）' },
  'sidebar-file-btn-active-bg': { value: 'var(--cd-color-primary-light-default)', category: 'color', label: 'FileContent 工具按钮激活背景', usage: 'FileItem 工具栏按钮激活背景（组件消费）' },
  'sidebar-file-editor-color': { value: 'var(--cd-color-text-0)', category: 'color', label: 'FileContent 编辑区文本色', usage: 'FileItem 富文本编辑区正文颜色（组件消费）' },
  'sidebar-file-editor-size': { value: 'var(--cd-font-size-regular)', category: 'font', label: 'FileContent 编辑区字号', usage: 'FileItem 富文本编辑区正文字号（组件消费）' },
  'sidebar-file-editor-line-height': { value: 'var(--cd-line-height-loose)', category: 'font', label: 'FileContent 编辑区行高', usage: 'FileItem 富文本编辑区行高（组件消费）' },
  'sidebar-file-editor-min-height': { value: '48px', category: 'other', label: 'FileContent 编辑区最小高度', usage: 'FileItem 富文本编辑区最小高度（组件消费）' },
  'sidebar-file-image-radius': { value: 'var(--cd-border-radius-medium)', category: 'radius', label: 'FileContent 图片圆角', usage: 'FileItem 编辑区图片圆角（组件消费）' },
  'sidebar-file-image-slot-margin': { value: 'var(--cd-spacing-tight) 0', category: 'spacing', label: 'FileContent 图片上传槽外边距', usage: 'ImageUploadNode 上传槽外边距（组件消费）' },
  'sidebar-file-selection-bg': { value: 'var(--cd-color-primary-light-default)', category: 'color', label: 'FileContent 选区高亮背景', usage: '设链接时选区高亮 Mark 背景（组件消费）' },
} satisfies TokenGroup;
