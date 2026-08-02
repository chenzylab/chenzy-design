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

  // —— Container / Header（Semi 侧只有下面 5 条：一条左边框 + header 的三向内边距与下边框）——
  'color-sidebar-container-border-left': { value: 'var(--cd-color-border)', category: 'color', label: '容器左边框颜色', usage: 'Semi $color-sidebar_container-borderLeft' },
  'color-sidebar-container-header-border-bottom': { value: 'var(--cd-color-border)', category: 'color', label: '容器头部底边框的颜色', usage: 'Semi $color-sidebar_container_header-borderBottom' },
  'width-sidebar-container-border-left': { value: '1px', category: 'width', label: '容器左边框宽度', usage: 'Semi $width-sidebar_container-borderLeft' },
  'width-sidebar-container-header-border-bottom': { value: '1px', category: 'width', label: '容器头部下边框宽度', usage: 'Semi $width-sidebar_container_header_borderBottom' },
  'sidebar-container-header-padding-right': { value: '12px', category: 'spacing', label: '容器头部右内边距', usage: 'Semi $spacing-sidebar_container_header-paddingRight' },
  'sidebar-container-header-padding-left': { value: '20px', category: 'spacing', label: '容器头部左内边距', usage: 'Semi $spacing-sidebar_container_header-paddingLeft' },
  'sidebar-container-header-padding-y': { value: '12px', category: 'spacing', label: '容器头部垂直内边距', usage: 'Semi $spacing-sidebar_container_header-paddingY' },
  'sidebar-detail-header-text': { value: 'var(--cd-color-text-0)', category: 'color', label: '详情视图顶部文本颜色', usage: 'Semi $color-sidebar_detail_header-text' },

  // —— 以下 Container/Header 项为**本库自有**：
  //    Semi 的 SideBar 容器是「贴边的一块面板」，只有一条 border-left，
  //    背景/阴影/圆角/宽度/层级/动效全由使用方或外层浮层承担，其变量表里没有对应项。
  //    本库 Container 是自带浮层壳的组件，故这些是本库多出来的一层。——
  'sidebar-bg': { value: 'var(--cd-color-bg-2)', category: 'color', label: '容器背景', usage: '本库自有：Container 浮层背景（Semi 容器无背景变量）' },
  'sidebar-color': { value: 'var(--cd-color-text-1)', category: 'color', label: '容器正文色', usage: '本库自有：Container 正文色' },
  'sidebar-border': { value: 'var(--cd-color-border)', category: 'color', label: '容器边框色', usage: '本库自有：Container 边框/分隔线（Semi 只有 border-left 一条）' },
  'sidebar-shadow': { value: 'var(--cd-shadow-elevated)', category: 'other', label: '容器阴影', usage: '本库自有：Container 浮层阴影' },
  'sidebar-radius': { value: 'var(--cd-border-radius-large)', category: 'radius', label: '容器圆角', usage: '本库自有：Container 贴边对侧圆角' },
  'sidebar-width': { value: '400px', category: 'other', label: '容器默认宽度', usage: '本库自有：Container 默认宽度' },
  'sidebar-z': { value: 'var(--cd-z-modal)', category: 'other', label: '层叠层级', usage: '本库自有：Container 浮层 z-index 基线' },
  // 展开/收起动效（名/值逐条镜像 Semi sidebar/animation.scss）。
  // 原来只有一条 -motion-duration 指向通用 --cd-motion-duration-mid(200ms)，与 Semi 的 180ms 不符。
  'sidebar-inner-show-duration': { value: '180ms', category: 'animation', label: '侧边栏打开动画时长', usage: 'Semi $animation_duration_sidebar_inner-show' },
  'sidebar-inner-show-function': { value: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)', category: 'animation', label: '侧边栏打开过渡曲线', usage: 'Semi $animation_function_sidebar_inner-show' },
  'sidebar-inner-show-delay': { value: '0ms', category: 'animation', label: '侧边栏打开延迟', usage: 'Semi $animation_delay_sidebar_inner-show' },
  'sidebar-inner-hide-duration': { value: '180ms', category: 'animation', label: '侧边栏关闭动画时长', usage: 'Semi $animation_duration_sidebar_inner-hide' },
  'sidebar-inner-hide-function': { value: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)', category: 'animation', label: '侧边栏关闭过渡曲线', usage: 'Semi $animation_function_sidebar_inner-hide' },
  'sidebar-inner-hide-delay': { value: '0ms', category: 'animation', label: '侧边栏关闭延迟', usage: 'Semi $animation_delay_sidebar_inner-hide' },
  'sidebar-title-color': { value: 'var(--cd-color-text-0)', category: 'color', label: '标题颜色', usage: '本库自有：header 标题色（Semi 未抽变量）' },
  'sidebar-title-size': { value: 'var(--cd-font-size-regular)', category: 'font', label: '标题字号', usage: '本库自有：header 标题字号' },
  'sidebar-title-weight': { value: 'var(--cd-font-weight-bold)', category: 'font', label: '标题字重', usage: '本库自有：header 标题字重' },
  'sidebar-close-color': { value: 'var(--cd-color-text-2)', category: 'color', label: '关闭图标色', usage: '本库自有：关闭按钮图标色（Semi 用 Button 自带态）' },
  'sidebar-close-hover-bg': { value: 'var(--cd-color-fill-1)', category: 'color', label: '关闭悬浮背景', usage: '本库自有：关闭按钮悬浮背景' },
  'sidebar-close-radius': { value: 'var(--cd-border-radius-small)', category: 'radius', label: '关闭按钮圆角', usage: '本库自有：关闭按钮圆角' },
  'sidebar-body-padding': { value: '16px', category: 'spacing', label: '内容区内边距', usage: '本库自有：Container 内容区内边距' },


  // —— MCPConfigure（名/值逐条镜像 Semi $*-sidebar_mcp_*，19 条）——
  'sidebar-mcp-header-counter-text': { value: 'var(--cd-color-text-2)', category: 'color', label: 'MCP 配置头部计数器颜色', usage: 'Semi $color-sidebar_mcp_header_counter-text' },
  'sidebar-mcp-item-label': { value: 'var(--cd-color-text-0)', category: 'color', label: 'MCP 配置项标题颜色', usage: 'Semi $color-sidebar_mcp_item_label' },
  'sidebar-mcp-item-desc': { value: 'var(--cd-color-text-0)', category: 'color', label: 'MCP 配置项描述颜色', usage: 'Semi $color-sidebar_mcp_item_desc' },
  'color-sidebar-mcp-item-border-bottom': { value: 'var(--cd-color-border)', category: 'color', label: 'MCP 配置项底部边框颜色', usage: 'Semi $color-sidebar_mcp_item-borderBottom' },
  'sidebar-mcp-item-sign': { value: '32px', category: 'width', label: 'MCP 配置项图标容器宽高', usage: 'Semi $width-sidebar_mcp_item_sign' },
  'sidebar-mcp-item-button': { value: '24px', category: 'width', label: 'MCP 配置项图标按钮宽高', usage: 'Semi $width-sidebar_mcp_item_button' },
  'width-sidebar-mcp-item-border-bottom': { value: '1px', category: 'width', label: 'MCP 配置项底部比框宽度', usage: 'Semi $width-sidebar_mcp_item-borderBottom' },
  'sidebar-mcp-content-padding-y': { value: '20px', category: 'spacing', label: 'MCP 配置内容区域垂直内边距', usage: 'Semi $spacing-sidebar_mcp_content-paddingY' },
  'sidebar-mcp-content-padding-x': { value: '16px', category: 'spacing', label: 'MCP 配置内容区域水平内边距', usage: 'Semi $spacing-sidebar_mcp_content-paddingX' },
  'sidebar-mcp-search-margin-y': { value: '16px', category: 'spacing', label: 'MCP 配置搜索区域垂直外边距', usage: 'Semi $spacing-sidebar_mcp_search-marginY' },
  'sidebar-mcp-search-margin-x': { value: '0', category: 'spacing', label: 'MCP 配置搜索区域水平外边距', usage: 'Semi $spacing-sidebar_mcp_search-marginX' },
  'sidebar-mcp-search-container-column-gap': { value: '8px', category: 'spacing', label: 'MCP 配置搜索容器列间距', usage: 'Semi $spacing-sidebar_mcp_search_container-columnGap' },
  'sidebar-mcp-item-padding-y': { value: '8px', category: 'spacing', label: 'MCP 配置项垂直内边距', usage: 'Semi $spacing-sidebar_mcp_item-paddingY' },
  'sidebar-mcp-item-padding-x': { value: '16px', category: 'spacing', label: 'MCP 配置项水平内边距', usage: 'Semi $spacing-sidebar_mcp_item-paddingX' },
  'sidebar-mcp-item-sign-margin-right': { value: '12px', category: 'spacing', label: 'MCP 配置项图标右侧外边距', usage: 'Semi $spacing-sidebar_mcp_item_sign-marginRight' },
  'sidebar-mcp-item-content-margin-right': { value: '24px', category: 'spacing', label: 'MCP 配置项内容右侧外边距', usage: 'Semi $spacing-sidebar_mcp_item_content-marginRight' },
  'sidebar-mcp-item-button-configure-margin-right': { value: '12px', category: 'spacing', label: 'MCP 配置项配置按钮右侧外边距', usage: 'Semi $spacing-sidebar_mcp_item_button_configure-marginRight' },
  'sidebar-mcp-custom-empty-margin-top': { value: '64px', category: 'spacing', label: 'MCP 自定义空态顶部外边距', usage: 'Semi $spacing-sidebar_mcp_custom_empty-marginTop' },
  'sidebar-mcp-item-sign-icon-font-size': { value: '32px', category: 'font', label: 'MCP 配置项图标字号', usage: 'Semi $font-sidebar_mcp_item_sign_icon-fontSize' },


  // —— file 编辑器菜单栏（名/值逐条镜像 Semi $*-sidebar_menu_bar_* 与 $*-sidebar_file_menu_bar_*）——
  'color-sidebar-menu-bar-border-top': { value: 'var(--cd-color-border)', category: 'color', label: '富文本编辑器菜单栏顶部边框颜色', usage: 'Semi $color-sidebar_menu_bar-borderTop' },
  'color-sidebar-menu-bar-border-bottom': { value: 'var(--cd-color-border)', category: 'color', label: '富文本编辑器菜单栏底部边框颜色', usage: 'Semi $color-sidebar_menu_bar-borderBottom' },
  'sidebar-menu-bar-dropdown-item-active-text': { value: 'var(--cd-color-primary)', category: 'color', label: '富文本编辑器菜单栏下拉框中选择项文本颜色', usage: 'Semi $color-sidebar_menu_bar_dropdown_item-active-text' },
  'sidebar-menu-bar-dropdown-item-active-bg': { value: 'var(--cd-color-fill-0)', category: 'color', label: '富文本编辑器菜单栏下拉框中选择项背景颜色', usage: 'Semi $color-sidebar_menu_bar_dropdown_item-active-bg' },
  'sidebar-menu-bar-btn-active-bg': { value: 'var(--cd-color-fill-0)', category: 'color', label: '富文本编辑器菜单栏按钮背景颜色-激活', usage: 'Semi $color-sidebar_menu_bar_btn-active-bg' },
  'sidebar-menu-bar-link-dropdown-btn-active': { value: 'var(--cd-color-primary)', category: 'color', label: '富文本编辑器菜单栏链接按钮下拉框按钮颜色-激活', usage: 'Semi $color-sidebar_menu_bar_link_dropdown_btn-active' },
  'width-sidebar-menu-bar-border-top': { value: '1px', category: 'width', label: '富文本编辑器菜单栏顶部边框宽度', usage: 'Semi $width-sidebar_menu_bar-borderTop' },
  'width-sidebar-menu-bar-border-bottom': { value: '1px', category: 'width', label: '富文本编辑器菜单栏底部边框宽度', usage: 'Semi $width-sidebar_menu_bar-borderBottom' },
  'sidebar-file-menu-bar-gap': { value: '2px', category: 'spacing', label: '富文本编辑器菜单栏间距', usage: 'Semi $spacing-sidebar_file_menu_bar-gap' },
  'sidebar-file-menu-bar-padding-y': { value: '2px', category: 'spacing', label: '富文本编辑器菜单栏垂直内边距', usage: 'Semi $spacing-sidebar_file_menu_bar-paddingY' },
  'sidebar-file-menu-bar-padding-x': { value: '12px', category: 'spacing', label: '富文本编辑器菜单栏水平内边距', usage: 'Semi $spacing-sidebar_file_menu_bar-paddingX' },
  'sidebar-file-menu-bar-codeblock-padding': { value: '8px', category: 'spacing', label: '富文本编辑器菜单栏代码块按钮内边距', usage: 'Semi $spacing-sidebar_file_menu_bar_codeblock-padding' },
  'sidebar-file-menu-bar-link-dropdown-padding': { value: '8px', category: 'spacing', label: '富文本编辑器菜单栏链接按钮下拉内容内边距', usage: 'Semi $spacing-sidebar_file_menu_bar-link-dropdown-padding' },
  'sidebar-menu-bar-divider-margin': { value: '0px', category: 'spacing', label: '富文本编辑器分割线外边距', usage: 'Semi $spacing-sidebar_menu_bar_divider-margin' },
  'sidebar-file-menu-bar-codeblock-font-size': { value: '12px', category: 'font', label: '富文本编辑器菜单栏代码块按钮字号', usage: 'Semi $font-sidebar_file_menu_bar_codeblock-fontSize' },
  'sidebar-file-menu-bar-codeblock-line-height': { value: '16px', category: 'font', label: '富文本编辑器菜单栏代码块按钮行高', usage: 'Semi $font-sidebar_file_menu_bar_codeblock-lineHeight' },

  // —— Options 图标 tab 组（P1）——
  // —— Options / Collapse（名/值逐条镜像 Semi $*-sidebar_options_* 与 $*-sidebar_collapse_*）——
  'color-sidebar-options-border-bottom': { value: 'var(--cd-color-border)', category: 'color', label: '视图选项区域底部边框颜色', usage: 'Semi $color-sidebar_options-borderBottom' },
  'sidebar-options-button-text': { value: 'var(--cd-color-text-2)', category: 'color', label: '视图顶部按钮文本颜色', usage: 'Semi $color-sidebar_options_button-text' },
  'width-sidebar-options-border-bottom': { value: '1px', category: 'width', label: '视图选项区域底部边框宽度', usage: 'Semi $width-sidebar_options-borderBottom' },
  'sidebar-options-gap': { value: '8px', category: 'spacing', label: '视图顶部按钮区域间距', usage: 'Semi $spacing-sidebar_options-gap' },
  'sidebar-options-padding-y': { value: '8px', category: 'spacing', label: '视图顶部按钮区域垂直内边距', usage: 'Semi $spacing-sidebar_options-paddingY' },
  'sidebar-options-padding-x': { value: '12px', category: 'spacing', label: '视图顶部按钮区域水平内边距', usage: 'Semi $spacing-sidebar_options-paddingX' },
  'sidebar-options-button-margin-left': { value: '4px', category: 'spacing', label: '选项按钮左外边距', usage: 'Semi $spacing-sidebar_options_button-marginLeft' },

  'color-sidebar-collapse-item-border': { value: 'var(--cd-color-border)', category: 'color', label: '折叠项边框颜色', usage: 'Semi $color-sidebar_collapse_item-border' },
  'color-sidebar-collapse-item-content-border-top': { value: 'var(--cd-color-border)', category: 'color', label: '折叠项展开时内容顶部边框颜色', usage: 'Semi $color-sidebar_collapse_item_content-borderTop' },
  'width-sidebar-collapse-item-border': { value: '1px', category: 'width', label: '折叠项边框宽度', usage: 'Semi $width-sidebar_collapse_item_border' },
  'width-sidebar-collapse-item-content-border-top': { value: '1px', category: 'width', label: '折叠项展开时内容顶部边框宽度', usage: 'Semi $width-sidebar_collapse_item_content-borderTop' },
  'sidebar-collapse-header-expand-btn': { value: '24px', category: 'width', label: '折叠面板展开按钮宽高', usage: 'Semi $width-sidebar_collapse_header_expand_btn' },
  'sidebar-collapse-item-margin-bottom': { value: '8px', category: 'spacing', label: '折叠项底部外边距', usage: 'Semi $spacing-sidebar_collapse_item_marginBottom' },
  'sidebar-collapse-header-padding-y': { value: '8px', category: 'spacing', label: '折叠项头部垂直内边距', usage: 'Semi $spacing-sidebar_collapse_header-paddingY' },
  'sidebar-collapse-header-padding-x': { value: '16px', category: 'spacing', label: '折叠项头部水平内边距', usage: 'Semi $spacing-sidebar_collapse_header-paddingX' },
  'sidebar-collapse-header-content-gap': { value: '8px', category: 'spacing', label: '折叠项头部内容间距', usage: 'Semi $spacing-sidebar_collapse_header_content_gap' },
  'sidebar-collapse-header-content-padding-right': { value: '8px', category: 'spacing', label: '折叠项头部内容右侧内边距', usage: 'Semi $spacing-sidebar_collapse_header_content_paddingRight' },
  'sidebar-collapse-header-expand-btn-padding': { value: '4px', category: 'spacing', label: '折叠项展开按钮内边距', usage: 'Semi $spacing-sidebar_collapse_header_expand_btn-padding' },
  'radius-sidebar-collapse-item': { value: '8px', category: 'radius', label: '折叠项圆角', usage: 'Semi $radius-sidebar_collapse_item' },
  'sidebar-main-collapse-file-content-max-height': { value: '400px', category: 'height', label: '主视图文件内容最大高度', usage: 'Semi $height-sidebar_main_collapse_file_content-maxHeight' },
  'sidebar-main-collapse-code-content-max-height': { value: '200px', category: 'height', label: '主视图代码内容最大高度', usage: 'Semi $height-sidebar_main_collapse_code_content-maxHeight' },
  'sidebar-main-content-padding': { value: '12px', category: 'spacing', label: '主视图内容区内边距', usage: 'Semi $spacing-sidebar_main_content-padding' },
  'sidebar-detail-header-padding': { value: '12px', category: 'spacing', label: '详情头内边距', usage: 'Semi $spacing-sidebar_detail_header-padding' },
  'sidebar-detail-header-left-column-gap': { value: '8px', category: 'spacing', label: '详情头左侧列间距', usage: 'Semi $spacing-sidebar_detail_header_left-columnGap' },
  'sidebar-detail-header-right-column-gap': { value: '4px', category: 'spacing', label: '详情头右侧列间距', usage: 'Semi $spacing-sidebar_detail_header_right-columnGap' },

  // —— 以下 Option 项为**本库自有**：本库的 Options 是图标 tab（方形命中区 + hover/激活态），
  //    Semi 的 options 是一排 Button，尺寸/圆角/三态色全归 Button 管，其 variables.scss
  //    里只有 $color-sidebar_options_button-text 一条文本色。——
  'sidebar-option-size': { value: '32px', category: 'other', label: 'Option 项尺寸', usage: '本库自有：图标 tab 命中区尺寸（Semi 用 Button 无此变量）' },
  'sidebar-option-radius': { value: 'var(--cd-border-radius-medium)', category: 'radius', label: 'Option 圆角', usage: '本库自有：图标 tab 圆角' },
  'sidebar-option-color-hover': { value: 'var(--cd-color-text-0)', category: 'color', label: 'Option hover 色', usage: '本库自有：图标 tab hover 色' },
  'sidebar-option-bg-hover': { value: 'var(--cd-color-fill-0)', category: 'color', label: 'Option hover 背景', usage: '本库自有：图标 tab hover 背景' },
  'sidebar-option-color-active': { value: 'var(--cd-color-primary)', category: 'color', label: 'Option 激活色', usage: '本库自有：图标 tab 激活色' },
  'sidebar-option-bg-active': { value: 'var(--cd-color-primary-light-default)', category: 'color', label: 'Option 激活背景', usage: '本库自有：图标 tab 激活背景' },

  // —— 详情返回按钮（P1）——

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
  // CodeContent 的「折叠头」在 Semi 侧就是 collapse-header（上面那组 $*-sidebar_collapse_header_*），
  // 故这几条改指同一批 Semi 变量，不再另立 -code-head-* 一套。
  // 仍保留为本库自有的两条：Semi 的折叠头图标/文本色是内联 text-1、字重用全局
  // $font-weight-regular，没有抽成 sidebar 专属变量。
  'sidebar-code-head-icon-color': { value: 'var(--cd-color-text-1)', category: 'color', label: 'CodeContent 头部图标色', usage: '本库自有：折叠头图标色（Semi 内联 text-1）' },
  'sidebar-code-head-color': { value: 'var(--cd-color-text-0)', category: 'color', label: 'CodeContent 头部文本色', usage: '本库自有：折叠头文本色（Semi 未抽变量）' },
  'sidebar-code-expand-hover-bg': { value: 'var(--cd-color-fill-1)', category: 'color', label: 'CodeContent 展开按钮悬浮背景', usage: '本库自有：展开按钮悬浮背景（Semi 用 Button 自带态）' },
  'sidebar-code-body-padding': { value: 'var(--cd-spacing-tight) 0', category: 'spacing', label: 'CodeContent 内容区内边距', usage: '本库自有：折叠内容区内边距' },

  // —— MCPConfigure MCP 工具配置面板（P3）——
  'sidebar-mcp-gap': { value: 'var(--cd-spacing-base-tight)', category: 'spacing', label: 'MCP 区块间距', usage: 'MCPConfigure 搜索/分组区块之间纵向间距（组件消费）' },
  'sidebar-mcp-count-color': { value: 'var(--cd-color-text-2)', category: 'color', label: 'MCP 计数色', usage: 'MCPConfigure 已激活计数文本颜色（组件消费）' },
  'sidebar-mcp-count-size': { value: 'var(--cd-font-size-secondary)', category: 'font', label: 'MCP 计数字号', usage: 'MCPConfigure 已激活计数字号（组件消费）' },
  'sidebar-mcp-item-gap': { value: 'var(--cd-spacing-tight)', category: 'spacing', label: 'MCP 列表项间距', usage: 'MCPConfigure 列表项纵向间距（组件消费）' },
  'sidebar-mcp-item-padding': { value: 'var(--cd-spacing-tight)', category: 'spacing', label: 'MCP 列表项内边距', usage: 'MCPConfigure 单个工具项内边距（组件消费）' },
  'sidebar-mcp-item-radius': { value: 'var(--cd-border-radius-medium)', category: 'radius', label: 'MCP 列表项圆角', usage: 'MCPConfigure 工具项圆角（组件消费）' },
  'sidebar-mcp-item-bg': { value: 'var(--cd-color-fill-0)', category: 'color', label: 'MCP 列表项背景', usage: 'MCPConfigure 工具项背景（组件消费）' },
  'sidebar-mcp-item-bg-hover': { value: 'var(--cd-color-fill-1)', category: 'color', label: 'MCP 列表项悬浮背景', usage: 'MCPConfigure 工具项悬浮背景（组件消费）' },
  'sidebar-mcp-item-border': { value: 'var(--cd-color-border)', category: 'color', label: 'MCP 列表项边框', usage: 'MCPConfigure 工具项边框（组件消费）' },
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
