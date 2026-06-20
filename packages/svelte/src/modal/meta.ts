/**
 * Machine-readable component metadata for AI/docs consumption.
 * Modal — see specs/components/feedback/Modal.spec.md
 */
export const meta = {
  name: 'Modal',
  category: 'feedback',
  description:
    '模态对话框：fixed 遮罩 + 面板，portal 到 body（或 getContainer）脱离父层叠上下文，role=dialog aria-modal；useFocusTrap 焦点捕获与归还、Esc/遮罩点击关闭（受 keyboard/maskClosable 控制）、useScrollLock 锁背景滚动；头/体/尾结构，ok/cancel 默认按钮可换自定义尾部，danger okType；reduced-motion 关闭过渡。受控 open 不回写，仅 onOpenChange/onCancel 通知。destroyOnClose 关闭即卸载内容、重开重建（默认 false 保留 DOM）。draggable 按住标题栏拖动面板（偏移派生 transform 叠加定位，重开重置，pointer 事件绑 window）。堆叠 z-index 由模块级计数器分配（声明式与命令式共享，后开者在上、关闭回收）。命令式工厂 Modal.confirm/info/success/warning/error（亦可解构 modal）：mount 到 body 临时 host、async onOk 自动 loading、返回 { destroy, update }。',
  exports: ['Modal', 'modal'],
  props: [
    { name: 'open', type: 'boolean', default: 'undefined', desc: '受控显隐；受控时不回写' },
    { name: 'title', type: 'string', default: 'undefined', desc: '标题文案' },
    {
      name: 'titleSnippet',
      type: 'Snippet',
      default: 'undefined',
      desc: '自定义标题，覆盖 title',
    },
    { name: 'width', type: 'number|string', default: '448', desc: '面板宽度' },
    { name: 'centered', type: 'boolean', default: 'false', desc: '垂直居中（否则距顶）' },
    { name: 'closable', type: 'boolean', default: 'true', desc: '右上角关闭按钮' },
    { name: 'maskClosable', type: 'boolean', default: 'true', desc: '点遮罩关闭' },
    { name: 'keyboard', type: 'boolean', default: 'true', desc: 'Esc 关闭' },
    {
      name: 'draggable',
      type: 'boolean',
      default: 'false',
      desc: '按住标题栏拖动面板（偏移叠加在定位上，重开重置）；鼠标增强不影响键盘/焦点',
    },
    {
      name: 'confirmLoading',
      type: 'boolean',
      default: 'false',
      desc: '确认按钮 loading 态',
    },
    { name: 'okText', type: 'string', default: "'确定'" },
    { name: 'cancelText', type: 'string', default: "'取消'" },
    { name: 'okType', type: "'primary'|'danger'", default: "'primary'", desc: '确认按钮类型' },
    {
      name: 'destroyOnClose',
      type: 'boolean',
      default: 'false',
      desc: '关闭即卸载内部内容（{#if} 卸载），重开重建；默认保留 DOM 仅隐藏',
    },
    {
      name: 'getContainer',
      type: '() => HTMLElement | null',
      default: 'undefined',
      desc: 'Portal 容器，缺省 document.body',
    },
    {
      name: 'footer',
      type: 'Snippet<[{ ok; cancel }]>|null',
      default: 'undefined',
      desc: 'null 隐藏默认按钮；snippet 自定义尾部',
    },
    { name: 'children', type: 'Snippet', default: 'undefined', desc: '内容主体' },
    { name: 'ariaLabel', type: 'string', default: 'undefined', desc: '无 title 时的 aria-label' },
    { name: 'onOk', type: '() => void', default: 'undefined' },
    { name: 'onCancel', type: '() => void', default: 'undefined' },
    { name: 'onOpenChange', type: '(open: boolean) => void', default: 'undefined' },
    { name: 'onAfterClose', type: '() => void', default: 'undefined', desc: '关闭过渡结束触发' },
  ],
  events: [
    { name: 'onOk', desc: '确认按钮点击（非受控自动关闭）' },
    { name: 'onCancel', desc: '取消/关闭按钮/遮罩/Esc 关闭' },
    { name: 'onOpenChange', desc: '显隐变化通知' },
    { name: 'onAfterClose', desc: '关闭过渡结束' },
  ],
  slots: [
    { name: 'children', desc: '内容主体' },
    { name: 'titleSnippet', desc: '自定义标题' },
    { name: 'footer', desc: '自定义尾部（接收 { ok, cancel }）' },
  ],
  a11y: {
    hasRole: true,
    focusable: true,
    note: 'role=dialog + aria-modal=true；有 title 用 aria-labelledby，无则 aria-label；useFocusTrap 捕获 Tab 焦点并在关闭时归还触发元素；Esc 关闭受 keyboard 控制；useScrollLock 锁背景滚动；关闭按钮 aria-label「关闭」。',
  },
  tokens: [
    '--cd-modal-radius',
    '--cd-modal-bg',
    '--cd-modal-shadow',
    '--cd-modal-mask-bg',
    '--cd-modal-padding',
    '--cd-modal-header-gap',
    '--cd-modal-footer-gap',
    '--cd-modal-title-color',
    '--cd-modal-title-size',
    '--cd-modal-body-color',
    '--cd-modal-close-color',
    '--cd-modal-close-hover-bg',
    '--cd-modal-z',
    '--cd-modal-motion-duration',
  ],
  responsive: false,
  examples: [
    {
      title: '基础确认框',
      code: '<Modal open={visible} title="提示" onOk={() => (visible = false)} onCancel={() => (visible = false)}>确认操作？</Modal>',
    },
    {
      title: '自定义尾部',
      code: '<Modal open={visible} title="标题">\n  内容\n  {#snippet footer({ cancel })}<Button onclick={cancel}>知道了</Button>{/snippet}\n</Modal>',
    },
    {
      title: 'danger 确认',
      code: '<Modal open={visible} title="删除" okType="danger" okText="删除" onOk={remove}>不可恢复，确定删除？</Modal>',
    },
    {
      title: '命令式确认（异步 onOk 自动 loading）',
      code: "Modal.confirm({ title: '确认操作', content: '确定执行？', onOk: () => fetch('/api/do') });",
    },
    {
      title: 'destroyOnClose 重开重建',
      code: '<Modal open={visible} title="表单" destroyOnClose>...每次重开重置内部状态...</Modal>',
    },
  ],
} as const;
