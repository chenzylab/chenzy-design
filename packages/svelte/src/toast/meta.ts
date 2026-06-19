/**
 * Machine-readable component metadata for AI/docs consumption.
 * Toast — see specs/components/feedback/Toast.spec.md
 */
export const meta = {
  name: 'Toast',
  category: 'feedback',
  description:
    '轻提示：命令式全局反馈 API（Toast.info/success/warning/error/loading/open/close/update/destroyAll）。单例容器惰性挂载到 body；类型预设图标 + 自动消失 + 悬停暂停 + maxCount FIFO 淘汰 + 同 id 去重更新；error/warning role=alert(assertive)、其余 role=status(polite)。本子集：6 方位仅 top/bottom，promise/stack/theme/单例 live region 延后。',
  exports: ['Toast'],
  imperative: true,
  props: [
    { name: 'content', type: 'string', default: '—', desc: '提示文本（必填）' },
    { name: 'id', type: 'string', default: 'undefined', desc: '指定 id；已存在则原地更新并重启定时器' },
    {
      name: 'type',
      type: "'info'|'success'|'warning'|'error'|'loading'",
      default: "'info'",
      desc: '语义类型，决定图标与色',
    },
    {
      name: 'duration',
      type: 'number',
      default: '3',
      desc: '自动消失秒数；0 持久。loading 默认 0',
    },
    { name: 'position', type: "'top'|'bottom'", default: "'top'", desc: '出现方位' },
    { name: 'closable', type: 'boolean', default: 'true', desc: '是否显示关闭按钮' },
    { name: 'pauseOnHover', type: 'boolean', default: 'true', desc: '悬停/聚焦时暂停定时器' },
    {
      name: 'onClose',
      type: "(id: string, reason: 'timeout'|'manual'|'replace'|'destroyAll') => void",
      default: 'undefined',
      desc: '关闭回调，附关闭原因',
    },
  ],
  events: [{ name: 'onClose', desc: '单条关闭（超时/手动/被替换/清空）时触发，带 id 与 reason' }],
  slots: [],
  a11y: {
    hasRole: true,
    focusable: false,
    note: 'error/warning 用 role=alert + aria-live=assertive，其余 role=status + aria-live=polite；关闭按钮 button + aria-label「关闭」。不抢焦点、不锁滚动。TODO：单例 live region 延后，当前每条卡片自带 role/aria-live。',
  },
  tokens: [
    '--cd-toast-bg',
    '--cd-toast-color-text',
    '--cd-toast-color-icon-info',
    '--cd-toast-color-icon-success',
    '--cd-toast-color-icon-warning',
    '--cd-toast-color-icon-error',
    '--cd-toast-color-close',
    '--cd-toast-color-close-hover',
    '--cd-toast-radius',
    '--cd-toast-shadow',
    '--cd-toast-padding',
    '--cd-toast-gap',
    '--cd-toast-font-size',
    '--cd-toast-max-width',
    '--cd-toast-min-width',
    '--cd-toast-stack-gap',
    '--cd-toast-z',
    '--cd-toast-motion-duration',
  ],
  responsive: false,
  examples: [
    { title: '成功', code: "Toast.success('已保存')" },
    { title: '错误', code: "Toast.error('保存失败')" },
    { title: '加载（持久）', code: "Toast.loading('上传中', { duration: 0 })" },
  ],
} as const;
