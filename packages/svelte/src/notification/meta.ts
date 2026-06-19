/**
 * Machine-readable component metadata for AI/docs consumption.
 * Notification — see specs/components/feedback/Notification.spec.md
 */
export const meta = {
  name: 'Notification',
  category: 'feedback',
  description:
    '通知提醒框：命令式全局反馈 API（notification.open/success/info/warning/error/close/update/destroyAll）。比 Toast 更丰富——标题 + 内容 + 图标；6 方位独立堆叠；单例容器惰性挂载到 body；自动关闭 + 悬停暂停 + maxCount 按方位 FIFO 淘汰 + 同 id 去重更新；error/warning role=alert(assertive)、其余 role=status(polite)。本子集：showProgress/footer 操作区/theme/RTL/Esc 关闭/portal getPopupContainer 延后。',
  exports: ['notification'],
  imperative: true,
  props: [
    { name: 'id', type: 'string', default: 'undefined', desc: '指定 id；已存在则原地更新' },
    { name: 'title', type: 'string', default: '—', desc: '通知标题' },
    { name: 'content', type: 'string', default: '—', desc: '通知正文' },
    {
      name: 'type',
      type: "'default'|'success'|'info'|'warning'|'error'",
      default: "'default'",
      desc: '语义类型，决定图标与强调色',
    },
    {
      name: 'duration',
      type: 'number',
      default: '4.5',
      desc: '自动关闭秒数；0 持久',
    },
    {
      name: 'placement',
      type: "'topLeft'|'top'|'topRight'|'bottomLeft'|'bottom'|'bottomRight'",
      default: "'topRight'",
      desc: '弹出位置，每方位独立堆叠',
    },
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
    note: 'error/warning 用 role=alert + aria-live=assertive，其余 role=status + aria-live=polite；标题 aria-labelledby、内容 aria-describedby；关闭按钮 button + aria-label「关闭」。不抢焦点、不锁滚动。',
  },
  tokens: [
    '--cd-notification-width',
    '--cd-notification-bg',
    '--cd-notification-color-title',
    '--cd-notification-color-content',
    '--cd-notification-border',
    '--cd-notification-radius',
    '--cd-notification-shadow',
    '--cd-notification-padding',
    '--cd-notification-gap',
    '--cd-notification-icon-success',
    '--cd-notification-icon-info',
    '--cd-notification-icon-warning',
    '--cd-notification-icon-error',
    '--cd-notification-close-color',
    '--cd-notification-close-color-hover',
    '--cd-notification-title-size',
    '--cd-notification-content-size',
    '--cd-notification-z',
    '--cd-notification-offset',
    '--cd-notification-motion-duration',
  ],
  responsive: false,
  examples: [
    { title: '成功', code: "notification.success({ title: '已上传', content: '文件保存成功' })" },
    { title: '错误', code: "notification.error({ title: '保存失败', content: '网络中断' })" },
    { title: '常驻', code: "notification.open({ title: '提醒', duration: 0 })" },
  ],
} as const;
