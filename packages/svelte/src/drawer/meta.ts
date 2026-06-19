/**
 * Machine-readable component metadata for AI/docs consumption.
 * Drawer — see specs/components/feedback/Drawer.spec.md
 */
export const meta = {
  name: 'Drawer',
  category: 'feedback',
  description:
    '抽屉浮层：四方向（left/right/top/bottom）贴边面板，复用 Modal 浮层模式——fixed 容器 + 面板（无 portal），role=dialog aria-modal；useFocusTrap 焦点捕获与归还、useDismiss Esc 关闭（closeOnEsc）、mask 时 useScrollLock 锁背景滚动；mask/maskClosable 遮罩点击关闭、closable 右上角关闭按钮；size(small/default/large) 预设宽高，width/height 优先覆盖；头/体/尾结构。有 title 用 aria-labelledby，否则 aria-label。别名 SideSheet（行为一致）。受控 open 不回写，仅 onOpenChange/onClose 通知。本子集；嵌套层栈管理、destroyOnClose、portal-to-body、滑入过渡动画延后。',
  exports: ['Drawer', 'SideSheet'],
  props: [
    { name: 'open', type: 'boolean', default: 'undefined', desc: '受控显隐；受控时不回写' },
    {
      name: 'placement',
      type: "'left'|'right'|'top'|'bottom'",
      default: "'right'",
      desc: '贴边方向',
    },
    {
      name: 'size',
      type: "'small'|'default'|'large'",
      default: "'default'",
      desc: '预设宽（横向）/高（纵向）',
    },
    {
      name: 'width',
      type: 'number|string',
      default: 'undefined',
      desc: 'left/right 宽度，优先于 size',
    },
    {
      name: 'height',
      type: 'number|string',
      default: 'undefined',
      desc: 'top/bottom 高度，优先于 size',
    },
    { name: 'title', type: 'string', default: 'undefined', desc: '标题文案' },
    {
      name: 'titleSnippet',
      type: 'Snippet',
      default: 'undefined',
      desc: '自定义标题，覆盖 title',
    },
    { name: 'mask', type: 'boolean', default: 'true', desc: '显示遮罩；false 不锁滚动且容器不拦截' },
    { name: 'maskClosable', type: 'boolean', default: 'true', desc: '点遮罩关闭' },
    { name: 'closeOnEsc', type: 'boolean', default: 'true', desc: 'Esc 关闭' },
    { name: 'closable', type: 'boolean', default: 'true', desc: '右上角关闭按钮' },
    {
      name: 'footer',
      type: 'Snippet|null',
      default: 'undefined',
      desc: '吸底操作区；未提供不渲染',
    },
    { name: 'children', type: 'Snippet', default: 'undefined', desc: '主体内容' },
    { name: 'ariaLabel', type: 'string', default: 'undefined', desc: '无 title 时的 aria-label' },
    { name: 'onOpenChange', type: '(open: boolean) => void', default: 'undefined' },
    { name: 'onClose', type: '() => void', default: 'undefined' },
  ],
  events: [
    { name: 'onOpenChange', desc: '显隐变化通知' },
    { name: 'onClose', desc: '关闭按钮/遮罩/Esc 关闭' },
  ],
  slots: [
    { name: 'children', desc: '主体内容' },
    { name: 'titleSnippet', desc: '自定义标题' },
    { name: 'footer', desc: '吸底操作区' },
  ],
  a11y: {
    hasRole: true,
    focusable: true,
    note: 'role=dialog + aria-modal（随 mask）；有 title 用 aria-labelledby，无则 aria-label；useFocusTrap 捕获 Tab 焦点并在关闭时归还触发元素；closeOnEsc 控制 Esc 关闭；mask 时 useScrollLock 锁背景滚动；关闭按钮 aria-label「关闭」。',
  },
  tokens: [
    '--cd-drawer-bg',
    '--cd-drawer-color-text',
    '--cd-drawer-color-title',
    '--cd-drawer-border',
    '--cd-drawer-mask-bg',
    '--cd-drawer-shadow',
    '--cd-drawer-width',
    '--cd-drawer-width-small',
    '--cd-drawer-width-large',
    '--cd-drawer-height',
    '--cd-drawer-height-small',
    '--cd-drawer-height-large',
    '--cd-drawer-header-padding',
    '--cd-drawer-body-padding',
    '--cd-drawer-footer-padding',
    '--cd-drawer-title-color',
    '--cd-drawer-title-size',
    '--cd-drawer-close-color',
    '--cd-drawer-close-color-hover',
    '--cd-drawer-close-hover-bg',
    '--cd-drawer-z',
    '--cd-drawer-motion-duration',
  ],
  responsive: false,
  examples: [
    {
      title: '右侧抽屉',
      code: '<Drawer open={visible} title="详情" onClose={() => (visible = false)}>内容</Drawer>',
    },
    {
      title: '左侧抽屉',
      code: '<Drawer open={visible} placement="left" title="菜单" onClose={() => (visible = false)}>导航</Drawer>',
    },
    {
      title: '底部抽屉',
      code: '<Drawer open={visible} placement="bottom" size="large" onClose={() => (visible = false)}>面板内容</Drawer>',
    },
  ],
} as const;
