/**
 * Component tokens for Upload（M4 Input）。全量对齐 Semi Design
 * （semi-foundation/upload/variables.scss 85 个，2026-07 核对），并升级为带元数据的 TokenDef
 * 结构以支持 DSM。值为 var() 引用我们的 alias / global token，或字面量。
 * 末尾保留 chenzy-design Upload 实际消费的补充别名 token（Semi 无同名，组件消费）。
 *
 * 注：
 *  - Semi $color-upload_xxx → kebab 小写 color-upload-xxx；var(--semi-color-*) 一一对应
 *    var(--cd-color-*)。
 *  - Semi rgba(var(--semi-grey-3),1)（文件卡片默认预览背景）→ var(--cd-color-grey-3)（palette emit，精确对齐）。
 *  - $spacing-* → var(--cd-spacing-*) 同名；$font-weight-bold/regular →
 *    var(--cd-font-weight-*)；字面量（px / 数字字重）保留。
 *  - var(--semi-border-radius-*) → var(--cd-border-radius-*)；负值 → calc(-1 * var(...))。
 *  - 组件 token 名（color-upload-* / spacing-upload-* …）与 alias / global 层不同名，
 *    var() 无自引用死循环。
 */
import type { TokenGroup } from './token-def.js';

export const uploadTokens = {
  // —— Color ——
  'color-upload-text': { value: 'var(--cd-color-text-0)', category: 'color', label: '默认文本颜色', usage: '上传文件卡片等默认文本颜色' },
  'color-upload-assist-text': { value: 'var(--cd-color-text-2)', category: 'color', label: '辅助文本颜色', usage: '上传文件列表标题及文件大小文本颜色' },
  'color-upload-border': { value: 'var(--cd-color-border)', category: 'color', label: '描边颜色', usage: '图片墙添加按钮及拖拽区域描边颜色' },
  'color-upload-card-bg-hover': { value: 'var(--cd-color-fill-1)', category: 'color', label: '卡片背景色 - 悬浮', usage: '上传文件卡片背景色 - 悬浮' },
  'color-upload-card-bg': { value: 'var(--cd-color-fill-0)', category: 'color', label: '卡片背景色 - 默认', usage: '上传文件卡片背景色 - 默认' },
  'color-upload-card-fail-bg-hover': { value: 'var(--cd-color-danger-light-hover)', category: 'color', label: '失败卡片背景色 - 悬浮', usage: '上传失败文件卡片背景色 - 悬浮' },
  'color-upload-card-fail-bg': { value: 'var(--cd-color-danger-light-default)', category: 'color', label: '失败卡片背景色 - 默认', usage: '上传失败文件卡片背景色 - 默认' },
  'color-upload-clear-text': { value: 'var(--cd-color-primary)', category: 'color', label: '清空按钮文本颜色', usage: '上传清空按钮文本颜色' },
  'color-upload-drag-area-bg-hover': { value: 'var(--cd-color-primary-light-default)', category: 'color', label: '拖拽区背景色 - 悬浮', usage: '上传可拖拽区域背景颜色 - 悬浮' },
  'color-upload-drag-area-border-hover': { value: 'var(--cd-color-primary)', category: 'color', label: '拖拽区描边色 - 悬浮', usage: '上传可拖拽区域描边颜色 - 悬浮' },
  'color-upload-drag-area-disabled-text': { value: 'var(--cd-color-disabled-text)', category: 'color', label: '拖拽区禁用文本色', usage: '上传可拖拽区域禁用文本颜色' },
  'color-upload-drag-area-bg': { value: 'var(--cd-color-tertiary-light-default)', category: 'color', label: '拖拽区背景色 - 默认', usage: '上传可拖拽区域背景颜色 - 默认' },
  'color-upload-drag-area-icon': { value: 'var(--cd-color-primary)', category: 'color', label: '拖拽区图标颜色', usage: '上传可拖拽区域图标颜色' },
  'color-upload-drag-area-tips-text': { value: 'var(--cd-color-primary)', category: 'color', label: '拖拽区提示文本色', usage: '上传可拖拽区域提示文本颜色' },

  'color-upload-drag-area-main-text-default': { value: 'var(--cd-color-text-0)', category: 'color', label: '拖拽区主文本 - 默认', usage: '上传可拖拽区主要提示文本颜色 - 默认' },
  'color-upload-drag-area-main-text-hover': { value: 'var(--cd-color-text-0)', category: 'color', label: '拖拽区主文本 - 悬浮', usage: '上传可拖拽区主要提示文本颜色 - 悬浮' },
  'color-upload-drag-area-main-text-active': { value: 'var(--cd-color-text-0)', category: 'color', label: '拖拽区主文本 - 按下', usage: '上传可拖拽区主要提示文本颜色 - 按下' },
  'color-upload-drag-area-sub-text-default': { value: 'var(--cd-color-text-0)', category: 'color', label: '拖拽区副文本 - 默认', usage: '上传可拖拽区次要提示文本颜色 - 默认' },
  'color-upload-drag-area-sub-text-hover': { value: 'var(--cd-color-text-0)', category: 'color', label: '拖拽区副文本 - 悬浮', usage: '上传可拖拽区次要提示文本颜色 - 悬浮' },
  'color-upload-drag-area-sub-text-active': { value: 'var(--cd-color-text-0)', category: 'color', label: '拖拽区副文本 - 按下', usage: '上传可拖拽区次要提示文本颜色 - 按下' },

  'color-upload-file-card-fail-info-text': { value: 'var(--cd-color-danger)', category: 'color', label: '卡片失败提示文本色', usage: '上传文件卡片失败提示信息文本颜色' },
  'color-upload-file-card-preview-placeholder-bg': { value: 'var(--cd-color-grey-3)', category: 'color', label: '预览占位背景色', usage: '文件卡片默认预览背景颜色（对齐 Semi rgba(grey-3,1)）' },
  'color-upload-file-card-preview-placeholder-text': { value: 'var(--cd-color-white)', category: 'color', label: '预览占位图颜色', usage: '文件卡片默认预览图颜色' },
  'color-upload-file-card-retry-bg': { value: 'var(--cd-color-white)', category: 'color', label: '重试按钮背景色', usage: '图片墙上传卡片重新上传按钮背景颜色' },
  'color-upload-file-card-retry-text': { value: 'var(--cd-color-primary)', category: 'color', label: '重试按钮文本色', usage: '图片墙上传卡片重新上传按钮文本颜色' },
  'color-upload-icon': { value: 'var(--cd-color-tertiary)', category: 'color', label: '添加图标颜色', usage: '图片墙上传图标加号颜色' },
  'color-upload-pic-add-bg-active': { value: 'var(--cd-color-fill-2)', category: 'color', label: '图片墙添加背景 - 按下', usage: '图片墙上传背景色 - 按下' },
  'color-upload-pic-add-bg-hover': { value: 'var(--cd-color-fill-1)', category: 'color', label: '图片墙添加背景 - 悬浮', usage: '图片墙上传背景色 - 悬浮' },
  'color-upload-pic-add-bg': { value: 'var(--cd-color-fill-0)', category: 'color', label: '图片墙添加背景 - 默认', usage: '图片墙上传背景色 - 默认' },
  'color-upload-pic-remove-bg': { value: 'var(--cd-color-overlay-bg)', category: 'color', label: '图片墙移除图标背景', usage: '图片墙上传移除图标颜色' },
  'color-upload-picture-file-card-loading-error-icon': { value: 'var(--cd-color-danger)', category: 'color', label: '加载/失败图标色', usage: '图片墙上传卡片加载及失败状态图标颜色' },
  'color-upload-picture-file-card-error-border': { value: 'var(--cd-color-danger)', category: 'color', label: '失败状态描边色', usage: '图片墙上传卡片失败状态描边颜色' },
  'color-upload-picture-file-card-pic-info-text': { value: 'var(--cd-color-white)', category: 'color', label: '图片信息文字色', usage: '图片墙图片信息（序号）文字颜色' },
  'color-upload-picture-file-card-close-icon': { value: 'var(--cd-color-white)', category: 'color', label: '关闭图标颜色', usage: '图片墙关闭图标颜色' },
  'color-upload-picture-file-card-hover-bg': { value: 'var(--cd-color-overlay-bg)', category: 'color', label: '预览悬浮背景色', usage: '图片墙预览悬浮背景色' },
  'color-upload-preview-icon': { value: 'var(--cd-color-text-2)', category: 'color', label: '预览图标颜色', usage: '文本列表文件卡片预览图标颜色' },
  'color-upload-picture-preview-icon': { value: 'var(--cd-color-text-inverse)', category: 'color', label: '照片墙预览图标颜色', usage: '照片墙 hover 预览眼睛图标颜色（白，暗遮罩上可见，对齐 Semi 内联 white）' },
  'color-upload-retry-text': { value: 'var(--cd-color-primary)', category: 'color', label: '重试按钮文本色', usage: '上传文件卡片重新上传按钮文本颜色' },
  'color-upload-replace-text': { value: 'var(--cd-color-white)', category: 'color', label: '替换按钮文本色', usage: '图片墙上传卡片替换按钮文本颜色' },

  // —— Width / Height ——
  'height-upload-file-card': { value: '52px', category: 'height', label: '文件卡片高度', usage: '上传文件卡片高度' },
  'width-upload-file-card': { value: '250px', category: 'width', label: '文件卡片宽度', usage: '上传文件卡片宽度' },
  'height-upload-file-pic-card': { value: '96px', category: 'height', label: '图片墙卡片高度', usage: '图片墙上传卡片高度' },
  'width-upload-file-pic-card': { value: '96px', category: 'width', label: '图片墙卡片宽度', usage: '图片墙上传卡片宽度' },
  'width-upload-file-card-preview': { value: '36px', category: 'width', label: '预览图标宽度', usage: '文件卡片预览图标宽度' },
  'height-upload-file-card-preview': { value: '36px', category: 'height', label: '预览图标高度', usage: '文件卡片预览图标高度' },
  'width-upload-file-card-preview-img': { value: '36px', category: 'width', label: '预览图片宽度', usage: '文件卡片预览图片宽度' },
  'width-upload-file-card-info-name': { value: '106px', category: 'width', label: '信息名称宽度', usage: '文件卡片信息名称' },
  'width-upload-file-card-icon': { value: '11px', category: 'width', label: '卡片图标宽度', usage: '文件卡片图标宽度' },
  'width-upload-picture-add-border': { value: '2px', category: 'width', label: '图片墙添加描边宽', usage: '图片墙添加按钮描边宽度' },
  'width-upload-picture-file-card-img': { value: '96px', category: 'width', label: '图片墙卡片图宽', usage: '图片墙上传卡片宽度' },
  'width-upload-picture-file-card-close': { value: '16px', category: 'width', label: '删除按钮图标宽', usage: '图片墙上传卡片删除按钮图标宽度' },
  'width-upload-file-card-retry': { value: '24px', category: 'width', label: '重试按钮宽度', usage: '重新上传按钮宽度' },
  'width-upload-file-card-retry-icon': { value: '13px', category: 'width', label: '重试按钮图标宽', usage: '重新上传按钮图标宽度' },
  'height-upload-file-card-retry-icon': { value: '14px', category: 'height', label: '重试按钮图标高', usage: '重新上传按钮图标高度' },
  'width-upload-picture-file-card-loading-icon': { value: '14px', category: 'width', label: '加载 spin 宽度', usage: '上传加载 spin 宽度' },
  'width-upload-drag-area-border': { value: '2px', category: 'width', label: '拖拽区描边宽度', usage: '可拖拽上传描边宽度' },

  // —— Spacing ——
  'spacing-upload-title-choosen-marginright': { value: 'var(--cd-spacing-tight)', category: 'spacing', label: '已选标题右边距', usage: '已选择文件标题右侧外边距' },
  'spacing-upload-title-marginbottom': { value: 'var(--cd-spacing-extra-tight)', category: 'spacing', label: '列表标题下边距', usage: '文件列表标题底部外边距' },
  'spacing-upload-file-card-preview-margin': { value: 'var(--cd-spacing-tight)', category: 'spacing', label: '卡片预览外边距', usage: '上传文件卡片预览外边距' },
  'spacing-upload-file-card-info-size-marginleft': { value: 'var(--cd-spacing-tight)', category: 'spacing', label: '文件大小左边距', usage: '上传文件卡片文件大小文本左侧外边距' },
  'spacing-upload-file-card-info-retry-marginleft': { value: 'var(--cd-spacing-tight)', category: 'spacing', label: '重试按钮左边距', usage: '上传文件卡片重新上传按钮左侧外边距' },
  'spacing-upload-file-card-info-progress-margintop': { value: '4px', category: 'spacing', label: '进度条上边距', usage: '上传文件卡片进度顶部外边距' },
  'spacing-upload-file-card-close-marginleft': { value: 'var(--cd-spacing-tight)', category: 'spacing', label: '删除按钮左边距', usage: '上传文件卡片删除按钮左侧外边距' },
  'spacing-upload-file-card-close-marginright': { value: 'var(--cd-spacing-tight)', category: 'spacing', label: '删除按钮右边距', usage: '上传文件卡片删除按钮右侧外边距' },
  'spacing-upload-file-card-icon-marginright': { value: 'var(--cd-spacing-super-tight)', category: 'spacing', label: '卡片图标右边距', usage: '上传文件卡片图标右侧外边距' },
  'spacing-upload-picture-file-card-gap': { value: 'var(--cd-spacing-tight)', category: 'spacing', label: '图片墙卡片间距', usage: '图片墙卡片之间边距' },
  'spacing-upload-picture-file-card-marginbottom': { value: 'var(--cd-spacing-tight)', category: 'spacing', label: '图片墙卡片下边距', usage: '图片墙上传卡片底部外边距' },
  'spacing-upload-picture-file-card-close-top': { value: '8px', category: 'spacing', label: '删除按钮顶部位置', usage: '图片墙上传卡片删除按钮顶部位置' },
  'spacing-upload-picture-file-card-close-right': { value: '8px', category: 'spacing', label: '删除按钮右侧位置', usage: '图片墙上传卡片删除右侧位置' },
  'spacing-upload-picture-file-card-loading-error-bottom': { value: '6px', category: 'spacing', label: '加载图标底部位置', usage: '图片墙上传卡片加载中图标底部位置' },
  'spacing-upload-picture-file-card-loading-error-right': { value: '6px', category: 'spacing', label: '报错图标右侧位置', usage: '图片墙上传卡片报错图标底部位置' },
  'spacing-upload-picture-file-card-icon-error-top': { value: 'calc(-1 * 1px)', category: 'spacing', label: '报错图标顶部位置', usage: '图片墙上传卡片加载中图标顶部位置' },
  'spacing-upload-drag-area-padding': { value: 'var(--cd-spacing-base-tight)', category: 'spacing', label: '拖拽区内边距', usage: '可拖拽上传拖拽区域内边距' },
  'spacing-upload-drag-area-main-text-marginbottom': { value: 'var(--cd-spacing-extra-tight)', category: 'spacing', label: '拖拽标题下边距', usage: '可拖拽上传拖拽标题底部外边距' },

  // —— Radius ——
  'radius-upload-file-card': { value: 'var(--cd-border-radius-medium)', category: 'radius', label: '文件卡片圆角', usage: '上传文件卡片圆角' },
  'radius-upload-file-card-preview': { value: 'var(--cd-border-radius-small)', category: 'radius', label: '预览图圆角', usage: '上传文件卡片预览图圆角' },
  'radius-upload-picture-add': { value: 'var(--cd-border-radius-small)', category: 'radius', label: '图片墙添加圆角', usage: '图片墙上传文件添加按钮圆角' },
  'radius-upload-picture-file-card-img': { value: 'var(--cd-border-radius-small)', category: 'radius', label: '图片墙卡片圆角', usage: '图片墙上传卡片圆角' },
  'radius-upload-picture-file-card-close': { value: 'var(--cd-border-radius-circle)', category: 'radius', label: '删除按钮圆角', usage: '图片墙上传卡片删除按钮圆角' },
  'radius-upload-file-card-retry': { value: 'var(--cd-border-radius-circle)', category: 'radius', label: '重试按钮圆角', usage: '上传文件卡片重新上传圆角' },
  'radius-upload-drag-area': { value: 'var(--cd-border-radius-small)', category: 'radius', label: '拖拽区圆角', usage: '可拖拽上传拖拽区域圆角' },

  // —— Font ——
  'font-upload-file-card-info-name-fontweight': { value: 'var(--cd-font-weight-bold)', category: 'font', label: '文件名字重', usage: '上传文件卡片文件名字重' },
  'font-upload-file-card-info-size-fontweight': { value: 'var(--cd-font-weight-regular)', category: 'font', label: '文件尺寸字重', usage: '上传文件卡片文件尺寸字重' },
  'font-upload-drag-area-tips-fontweight': { value: '600', category: 'font', label: '拖拽提示字重', usage: '可拖拽上传提示文本字重' },
  'font-upload-picture-file-card-pic-info-fontsize': { value: '12px', category: 'font', label: '图片信息字号', usage: '图片墙图片信息字体大小' },
  'font-upload-picture-file-card-pic-info-fontweight': { value: '600', category: 'font', label: '图片信息字重', usage: '图片墙图片信息文本字重' },

  // 注：所有转发别名已退役（不向后兼容）。组件改为直接消费对应 Semi token
  // （list-item 错误态 → color-upload-file-card-fail-info-text；status=warning/error
  // 边框 → color-warning / color-danger）。
} satisfies TokenGroup;
