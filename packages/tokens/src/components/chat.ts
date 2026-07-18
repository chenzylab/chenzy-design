/**
 * Component tokens for Chat — 严格镜像 Semi semi-foundation/chat/variables.scss（~130 条）。
 *
 * 命名对齐 Semi：`$category-chat_部位_细节` → `--cd-chat-部位-细节`（保留 Semi 的 BEM-like 分段，
 * 连字符化 camelCase：chatBox→chatBox、inputBottom→inputBottom 等原样，marginY 等驼峰转 kebab）。
 * 值对齐 Semi：`var(--semi-*)` → `var(--cd-*)`；`rgba(var(--semi-grey-N), 1)` → `var(--cd-color-grey-N)`
 * （alpha=1 纯色）；`rgba(var(--semi-grey-N), a)`（a<1）→ color-mix 等价（本库色板是 hex，见 tag.ts 惯例）。
 * 移除此前 33 个自造语义 token（cd-chat-bubble-user-bg 等），无向后兼容。
 *
 * 见 plus 对齐工程；消费方 packages/svelte/src/chat/*.svelte。
 */
import type { TokenGroup } from './token-def.js';

export const chatTokens = {
  // —— radius ——
  'chat-chatBox-content-radius': { value: 'var(--cd-border-radius-large)', category: 'radius', label: '聊天框内容圆角', usage: '消息内容气泡圆角' },
  'chat-inputBox-container-radius': { value: '16px', category: 'radius', label: '输入框容器圆角', usage: '输入框容器圆角' },
  'chat-attachment-img-radius': { value: 'var(--cd-border-radius-medium)', category: 'radius', label: '附件图片圆角', usage: '附件图片圆角' },
  'chat-attachment-file-radius': { value: 'var(--cd-border-radius-medium)', category: 'radius', label: '附件文件圆角', usage: '附件文件圆角' },
  'chat-hint-item-radius': { value: 'var(--cd-border-radius-large)', category: 'radius', label: '提示条圆角', usage: '提示条圆角' },
  'chat-chatBox-content-code-radius': { value: 'var(--cd-border-radius-large)', category: 'radius', label: '代码块圆角', usage: '代码块圆角' },
  'chat-chatBox-content-code-topSlot-copy-radius': { value: 'var(--cd-border-radius-large)', category: 'radius', label: '代码块复制按钮圆角', usage: '代码块顶部复制按钮圆角' },
  'chat-dropArea-radius': { value: '16px', category: 'radius', label: '拖拽区圆角', usage: '拖拽上传区域圆角' },

  // —— color ——
  'chat-action-content-bg': { value: 'var(--cd-color-bg-0)', category: 'color', label: '操作按钮背景', usage: '返回底部/停止生成按钮背景' },
  'chat-action-content-border': { value: 'var(--cd-color-border)', category: 'color', label: '操作按钮描边', usage: '返回底部/停止生成按钮描边' },
  'chat-divider': { value: 'var(--cd-color-text-2)', category: 'color', label: '分割线文字', usage: '分割线文字颜色' },
  'chat-chatBox-title': { value: 'var(--cd-color-text-0)', category: 'color', label: '聊天框标题', usage: '聊天框标题颜色' },
  'chat-chatBox-action-icon': { value: 'var(--cd-color-text-2)', category: 'color', label: '操作图标', usage: '操作区按钮图标颜色' },
  'chat-chatBox-action-icon-hover': { value: 'var(--cd-color-text-0)', category: 'color', label: '操作图标悬浮', usage: '操作区按钮图标 hover 颜色' },
  'chat-chatBox-action-bg-hover': { value: 'transparent', category: 'color', label: '操作按钮悬浮背景', usage: '操作区按钮 hover 背景' },
  'chat-chatBox-content-text': { value: 'var(--cd-color-text-0)', category: 'color', label: '内容文字', usage: '聊天框内容文字颜色' },
  'chat-chatBox-content-bg': { value: 'var(--cd-color-fill-0)', category: 'color', label: '内容背景', usage: '聊天框内容背景（助手）' },
  'chat-chatBox-content-user-bg': { value: 'var(--cd-color-primary)', category: 'color', label: '用户内容背景', usage: '用户消息内容背景' },
  'chat-chatBox-content-user-text': { value: 'var(--cd-color-white)', category: 'color', label: '用户内容文字', usage: '用户消息内容文字' },
  'chat-chatBox-content-error-bg': { value: 'var(--cd-color-danger-hover)', category: 'color', label: '错误内容背景', usage: '错误消息内容背景' },
  'chat-chatBox-content-error-text': { value: 'var(--cd-color-white)', category: 'color', label: '错误内容文字', usage: '错误消息内容文字' },
  'chat-inputBottom-clearButton-icon': { value: 'var(--cd-color-text-2)', category: 'color', label: '清空按钮图标', usage: '清空上下文按钮图标颜色' },
  'chat-inputBottom-uploadButton-icon': { value: 'var(--cd-color-text-0)', category: 'color', label: '上传按钮图标', usage: '上传按钮图标颜色' },
  'chat-inputBottom-sendButton-icon-disable': { value: 'var(--cd-color-primary-disabled)', category: 'color', label: '发送按钮禁用图标', usage: '发送按钮禁用态图标颜色' },
  'chat-inputBox-container-border': { value: 'var(--cd-color-border)', category: 'color', label: '输入框容器边框', usage: '输入框容器边框颜色' },
  'chat-attachment-clear-icon': { value: 'var(--cd-color-text-2)', category: 'color', label: '附件清除图标', usage: '附件清除图标颜色' },
  'chat-attachment-file-bg': { value: 'var(--cd-color-fill-0)', category: 'color', label: '附件文件背景', usage: '附件文件背景' },
  'chat-attachment-fail': { value: 'var(--cd-color-danger)', category: 'color', label: '附件失败提示', usage: '附件上传失败提示图标颜色' },
  'chat-chatBox-user-attachment-file-bg': { value: 'var(--cd-color-bg-0)', category: 'color', label: '用户附件文件背景', usage: '用户聊天框附件文件背景' },
  'chat-chatBox-other-attachment-file-bg': { value: 'var(--cd-color-fill-2)', category: 'color', label: '附件文件背景', usage: '聊天框附件文件背景' },
  'chat-attachment-file-icon': { value: 'var(--cd-color-text-2)', category: 'color', label: '附件文件图标', usage: '附件文件图标颜色' },
  'chat-attachment-file-title': { value: 'var(--cd-color-text-0)', category: 'color', label: '附件文件标题', usage: '附件文件标题颜色' },
  'chat-attachment-file-metadata-text': { value: 'var(--cd-color-text-2)', category: 'color', label: '附件文件元数据', usage: '附件文件元数据文字颜色' },
  'chat-hint-item-border': { value: 'var(--cd-color-border)', category: 'color', label: '提示条边框', usage: '提示条边框颜色' },
  'chat-hint-item-bg': { value: 'transparent', category: 'color', label: '提示条背景', usage: '提示条背景' },
  'chat-hint-item-bg-hover': { value: 'var(--cd-color-fill-0)', category: 'color', label: '提示条悬浮背景', usage: '提示条 hover 背景' },
  'chat-hint-content-text': { value: 'var(--cd-color-text-1)', category: 'color', label: '提示条文字', usage: '提示条文字颜色' },
  'chat-hint-icon': { value: 'var(--cd-color-text-2)', category: 'color', label: '提示条图标', usage: '提示条图标颜色' },
  'chat-chatBox-loading-bg': { value: 'var(--cd-color-text-0)', category: 'color', label: '加载图标颜色', usage: '加载中圆圈颜色' },
  'chat-chatBox-code-topSlot': { value: 'var(--cd-color-white)', category: 'color', label: '代码块顶部字体', usage: '代码块顶部字体颜色（Semi rgba(--semi-white,1)）' },
  'chat-chatBox-code-topSlot-bg': { value: 'var(--cd-color-grey-4)', category: 'color', label: '代码块顶部背景', usage: '代码块顶部背景色（Semi rgba(--semi-grey-4,1)）' },
  'chat-chatBox-code-topSlot-toCopy-bg-hover': { value: 'var(--cd-color-grey-5)', category: 'color', label: '复制按钮悬浮背景', usage: '代码块复制按钮 hover 背景（Semi rgba(--semi-grey-5,1)）' },
  'chat-chatBox-code-content': { value: 'var(--cd-color-bg-0)', category: 'color', label: '代码块内容背景', usage: '代码块内容背景色' },
  'chat-action-content-bg-hover': { value: 'var(--cd-color-tertiary-light-hover)', category: 'color', label: '操作按钮悬浮背景', usage: '返回底部/停止生成按钮 hover 背景' },
  'chat-dropArea-bg': { value: 'color-mix(in srgb, var(--cd-color-grey-2) 90%, transparent)', category: 'color', label: '拖拽区背景', usage: '拖拽区域背景（Semi rgba(--semi-grey-2,0.9)）' },
  'chat-dropArea-border': { value: 'var(--cd-color-border)', category: 'color', label: '拖拽区边框', usage: '拖拽区域边框颜色' },

  // —— spacing ——
  'chat-paddingY': { value: '12px', category: 'spacing', label: '组件上下内边距', usage: 'chat 组件上下内边距' },
  'chat-container-paddingX': { value: '16px', category: 'spacing', label: '消息框水平内边距', usage: '消息框水平内边距' },
  'chat-action-content-bottom': { value: '0', category: 'spacing', label: '操作按钮底部边距', usage: '返回底部/停止生成按钮底部边距' },
  'chat-chatBox-marginY': { value: '8px', category: 'spacing', label: '聊天框上下外边距', usage: '聊天框上下外边距' },
  'chat-chatBox-columnGap': { value: '12px', category: 'spacing', label: '聊天框列间距', usage: '聊天框内容列间距' },
  'chat-chatBox-action-columnGap': { value: '10px', category: 'spacing', label: '操作区列间距', usage: '操作区按钮列间距' },
  'chat-chatBox-action-marginX': { value: '10px', category: 'spacing', label: '操作区左右外边距', usage: '操作区左右外边距' },
  'chat-chatBox-action-btn-padding': { value: '0', category: 'spacing', label: '操作按钮内边距', usage: '操作区按钮内边距' },
  'chat-chatBox-content-paddingY': { value: '8px', category: 'spacing', label: '内容上下内边距', usage: '聊天框内容上下内边距' },
  'chat-chatBox-content-paddingX': { value: '12px', category: 'spacing', label: '内容左右内边距', usage: '聊天框内容左右内边距' },
  'chat-inputBox-paddingTop': { value: '8px', category: 'spacing', label: '输入框顶部内边距', usage: '输入框顶部内边距' },
  'chat-inputBox-paddingBottom': { value: '8px', category: 'spacing', label: '输入框底部内边距', usage: '输入框底部内边距' },
  'chat-inputBox-paddingX': { value: '16px', category: 'spacing', label: '输入框左右内边距', usage: '输入框左右内边距' },
  'chat-inputBox-container-padding': { value: '11px', category: 'spacing', label: '输入框容器内边距', usage: '输入框容器内边距' },
  'chat-inputBox-inner-columnGap': { value: '4px', category: 'spacing', label: '输入框列间距', usage: '输入框容器列间距' },
  'chat-inputBox-marginY': { value: '4px', category: 'spacing', label: '输入框上下外边距', usage: '输入框上下外边距' },
  'chat-attachment-columnGap': { value: '10px', category: 'spacing', label: '附件列间距', usage: '附件列间距' },
  'chat-attachment-rowGap': { value: '5px', category: 'spacing', label: '附件行间距', usage: '附件行间距' },
  'chat-attachment-marginX': { value: '12px', category: 'spacing', label: '附件左右外边距', usage: '附件左右外边距' },
  'chat-attachment-clear-top': { value: '8px', category: 'spacing', label: '附件清除顶部间距', usage: '附件清除图标顶部间距' },
  'chat-attachment-clear-right': { value: '8px', category: 'spacing', label: '附件清除右间距', usage: '附件清除图标右间距' },
  'chat-attachment-file-columnGap': { value: '5px', category: 'spacing', label: '文件附件列间距', usage: '文件附件列间距' },
  'chat-attachment-file-padding': { value: '5px', category: 'spacing', label: '文件附件内边距', usage: '文件附件内边距' },
  'chat-chatBox-loading-item-gap': { value: '15px', category: 'spacing', label: '加载圆圈间距', usage: '加载图标圆圈间距' },
  'chat-divider-marginY': { value: '12px', category: 'spacing', label: '分割线上下外边距', usage: '分割线上下外边距' },
  'chat-chatBox-content-attachment-marginY': { value: '4px', category: 'spacing', label: '内容附件上下外边距', usage: '内容文件/图片上下外边距' },
  'chat-chatBox-content-attachment-marginRight': { value: '4px', category: 'spacing', label: '内容附件右外边距', usage: '内容文件/图片右外边距' },
  'chat-chatBox-content-code-topSlot-paddingX': { value: '5px', category: 'spacing', label: '代码块顶部横向内边距', usage: '代码块顶部横向内边距' },
  'chat-chatBox-content-code-topSlot-paddingY': { value: '8px', category: 'spacing', label: '代码块顶部纵向内边距', usage: '代码块顶部纵向内边距' },
  'chat-chatBox-content-code-topSlot-copy-columnGap': { value: '5px', category: 'spacing', label: '复制按钮列间距', usage: '代码块复制按钮列间距' },
  'chat-chatBox-content-code-topSlot-copy-padding': { value: '5px', category: 'spacing', label: '复制按钮内边距', usage: '代码块复制按钮内边距' },
  'chat-chatBox-wrap': { value: '8px', category: 'spacing', label: '聊天框外层间距', usage: '聊天框外层间距' },
  'chat-hint-rowGap': { value: '10px', category: 'spacing', label: '提示条行间距', usage: '提示条行间距' },
  'chat-hint-marginY': { value: '12px', category: 'spacing', label: '提示条容器上下外边距', usage: '提示条容器上下外边距' },
  'chat-hint-marginLeft': { value: '34px', category: 'spacing', label: '提示条容器左外边距', usage: '提示条容器左外边距' },
  'chat-hint-item-marginY': { value: '8px', category: 'spacing', label: '提示条上下外边距', usage: '提示条上下外边距' },
  'chat-hint-item-marginX': { value: '12px', category: 'spacing', label: '提示条左右外边距', usage: '提示条左右外边距' },
  'chat-hint-item-columnGap': { value: '20px', category: 'spacing', label: '提示条内容列间距', usage: '提示条内容列间距' },
  'chat-chatBox-loading-item-marginX': { value: '18px', category: 'spacing', label: '加载圆圈左右外边距', usage: '加载中心圆圈左右外边距' },
  'chat-chatBox-loading-item-marginY': { value: '6px', category: 'spacing', label: '加载圆圈上下外边距', usage: '加载中心圆圈上下外边距' },

  // —— width ——
  'chat-backBottom-wrapper-width': { value: '42px', category: 'width', label: '返回按钮宽度', usage: '返回底部按钮宽度' },
  'chat-action-content-border-width': { value: '1px', category: 'width', label: '操作按钮描边宽度', usage: '返回底部/停止生成按钮描边宽度' },
  'chat-inputBottom-clearButton-width': { value: '48px', category: 'width', label: '清空按钮宽度', usage: '清空按钮宽度' },
  'chat-inputBottom-uploadButton-width': { value: '32px', category: 'width', label: '上传按钮宽度', usage: '上传按钮宽度' },
  'chat-inputBottom-sendButton-width': { value: '32px', category: 'width', label: '发送按钮宽度', usage: '发送按钮宽度' },
  'chat-inputBox-container-border-width': { value: '1px', category: 'width', label: '输入框容器边框宽度', usage: '输入框容器边框宽度' },
  'chat-attachment-file-width': { value: '50px', category: 'width', label: '附件文件宽度', usage: '附件文件宽度' },
  'chat-hint-item-border-width': { value: '1px', category: 'width', label: '提示条边框宽度', usage: '提示条边框宽度' },
  'chat-chatBox-loading-width': { value: '8px', category: 'width', label: '加载圆圈宽度', usage: '加载中单个圆圈宽度' },
  'chat-attachment-file-title-width': { value: '90px', category: 'width', label: '附件文件标题最大宽度', usage: '附件文件标题最大宽度' },
  'chat-max-width': { value: '800px', category: 'width', label: 'chat 最大宽度', usage: 'chat 组件最大宽度' },
  'chat-dropArea-border-width': { value: '5px', category: 'width', label: '拖拽区边框宽度', usage: '拖拽上传边框宽度' },
  'chat-chatBox-content-code-topSlot-copy-width': { value: '150px', category: 'width', label: '复制按钮最小宽度', usage: '代码块复制按钮最小宽度' },
  'chat-chatBox-avatar-width': { value: '24px', category: 'width', label: '头像宽度', usage: '聊天框头像宽度' },

  // —— height ——
  'chat-action-stop-height': { value: '42px', category: 'height', label: '停止生成按钮高度', usage: '停止生成按钮高度' },

  // —— font ——
  'chat-divider-font-weight': { value: 'var(--cd-font-weight-regular)', category: 'font', label: '分割线字重', usage: '分割线字重' },
  'chat-divider-font-size': { value: 'var(--cd-font-size-small)', category: 'font', label: '分割线字号', usage: '分割线字号' },
  'chat-chatBox-title-line-height': { value: '20px', category: 'font', label: '标题行高', usage: '聊天框标题行高' },
  'chat-chatBox-title-font-size': { value: 'var(--cd-font-size-header-6)', category: 'font', label: '标题字号', usage: '聊天框标题字号' },
  'chat-chatBox-title-font-weight': { value: 'var(--cd-font-weight-regular)', category: 'font', label: '标题字重', usage: '聊天框标题字重' },
  'chat-inputBottom-clearButton-icon-font-size': { value: '30px', category: 'font', label: '清空按钮图标大小', usage: '清空上下文按钮图标大小' },
  'chat-attachment-file-title-font-size': { value: 'var(--cd-font-size-header-6)', category: 'font', label: '附件文件标题字号', usage: '附件文件标题字号' },
  'chat-attachment-file-metadata-font-size': { value: 'var(--cd-font-size-regular)', category: 'font', label: '附件文件元数据字号', usage: '附件文件元数据字号' },
  'chat-hint-content-font-size': { value: 'var(--cd-font-size-regular)', category: 'font', label: '提示条文字大小', usage: '提示条文字大小' },
  'chat-chatBox-code-topSlot-font-size': { value: '12px', category: 'font', label: '代码块顶部字号', usage: '代码块顶部字号' },
  'chat-chatBox-code-topSlot-line-height': { value: '16px', category: 'font', label: '代码块顶部行高', usage: '代码块顶部区域行高' },
  'chat-dropArea-text-font-size': { value: '48px', category: 'font', label: '拖拽区文字大小', usage: '拖拽上传区域文字大小' },

  // —— z-index ——
  'chat-dropArea-z': { value: '10', category: 'other', label: '拖拽区层级', usage: '拖拽上传区域 z-index' },
  'chat-action-z': { value: '1', category: 'other', label: '操作按钮层级', usage: '返回底部/停止生成按钮 z-index' },
} satisfies TokenGroup;
