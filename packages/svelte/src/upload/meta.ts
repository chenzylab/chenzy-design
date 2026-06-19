/**
 * Machine-readable component metadata for AI/docs consumption.
 * See specs/00-foundation/ai-friendly.spec.md.
 */
export const meta = {
  name: 'Upload',
  category: 'input',
  description: '文件上传，支持点击与拖拽选择、文件列表（名称/大小/状态/移除）。本轮不做真实网络上传。',
  props: [
    { name: 'value', type: 'UploadFileItem[]', default: 'undefined', desc: '受控文件列表；提供则为受控' },
    { name: 'defaultValue', type: 'UploadFileItem[]', default: '[]', desc: '非受控初始文件列表' },
    { name: 'accept', type: 'string', default: 'undefined', desc: '接受的文件类型（input accept）' },
    { name: 'multiple', type: 'boolean', default: 'false' },
    { name: 'limit', type: 'number', default: 'undefined', desc: '最大文件数；超出触发 onExceed' },
    { name: 'maxSize', type: 'number', default: 'undefined', desc: '单文件最大体积（KB）；超限标记 error' },
    { name: 'disabled', type: 'boolean', default: 'false' },
    { name: 'listType', type: "'text'|'none'", default: 'text' },
    { name: 'drag', type: 'boolean', default: 'false', desc: 'true 渲染拖拽区，false 渲染按钮' },
    { name: 'action', type: 'string', default: 'undefined', desc: '上传地址；有则选文件后自动 XHR 上传' },
    { name: 'uploadName', type: 'string', default: "'file'", desc: '表单字段名' },
    { name: 'headers', type: 'Record<string,string>', default: 'undefined', desc: '额外请求头' },
    { name: 'uploadData', type: 'Record<string,string>', default: 'undefined', desc: '额外表单字段' },
    { name: 'customRequest', type: '(item: UploadFileItem) => void', default: 'undefined', desc: '提供则由外部接管上传（优先于 action）' },
    { name: 'onChange', type: '(list: UploadFileItem[]) => void', default: 'undefined' },
    { name: 'onExceed', type: '(files: File[]) => void', default: 'undefined' },
    { name: 'onSuccess', type: '(response: string, item: UploadFileItem) => void', default: 'undefined' },
    { name: 'onError', type: '(item: UploadFileItem) => void', default: 'undefined' },
    { name: 'children', type: 'Snippet', default: 'undefined', desc: '自定义触发器内容' },
  ],
  a11y: {
    role: 'button',
    keyboard: ['Enter', 'Space'],
    notes: ['隐藏的 file input（visually-hidden）', '触发器为 button', '移除按钮 aria-label「移除」', 'dragger role=button + tabindex + 键盘 Enter/Space'],
  },
  tokens: ['--cd-upload-*', '--cd-focus-ring', '--cd-color-danger', '--cd-spacing-*'],
} as const;
