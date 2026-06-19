/**
 * Machine-readable component metadata for AI/docs consumption.
 * ResizeObserver — see specs/components/other/ResizeObserver.spec.md
 */
export const meta = {
  name: 'ResizeObserver',
  category: 'other',
  renderless: true,
  description:
    '尺寸监听工具组件，封装原生 ResizeObserver（经 @chenzy-design/core 归一化），渲染一个无视觉样式的包裹元素作为观测容器，slot 暴露 width/height/entry，onResize 分发归一化尺寸事件；SSR/老浏览器静默降级；另导出 resize action 供轻量 use:resize 用法。本子集 content-box/border-box + 单目标，throttle/debounce/多目标/device-pixel-content-box/单例池延后。',
  exports: ['ResizeObserver', 'resize', 'createResizeObserver'],
  props: [
    {
      name: 'box',
      type: "'content-box'|'border-box'",
      default: "'content-box'",
      desc: '观测盒模型，content-box 仅内容区，border-box 含 padding+border',
    },
    {
      name: 'disabled',
      type: 'boolean',
      default: 'false',
      desc: '暂停尺寸分发，observer 仍监听但不向 slot/回调通知',
    },
    {
      name: 'observeOnMount',
      type: 'boolean',
      default: 'true',
      desc: '挂载后立即测量一次（ResizeObserver 原生在 observe 时即触发首次回调，天然满足）',
    },
    {
      name: 'tag',
      type: 'string',
      default: "'div'",
      desc: '包裹元素标签，本子集固定 div（自定义 tag 延后）',
    },
  ],
  events: [
    { name: 'onResize', desc: '尺寸变化时分发归一化 entry（受控，不回写）' },
    { name: 'onFirstMeasure', desc: '首次测量完成时分发归一化 entry' },
  ],
  slots: [
    {
      name: 'children',
      desc: '作用域参数 { width, height, entry }，entry 首次测量前为 null',
    },
  ],
  a11y: {
    hasRole: false,
    note: '包裹元素不设 role/aria，透明容器不进 a11y 树、不可聚焦、不移动焦点。',
  },
  tokens: [],
  responsive: false,
  examples: [
    {
      title: 'slot 测量',
      code: '<ResizeObserver>{#snippet children({ width, height })}{width} × {height}{/snippet}</ResizeObserver>',
    },
    {
      title: 'use:resize action 轻量用法',
      code: '<div use:resize={{ onResize: (e) => console.log(e.width, e.height) }}>...</div>',
    },
    {
      title: 'border-box 观测',
      code: '<ResizeObserver box="border-box" onResize={(e) => (size = e)}>{@render content()}</ResizeObserver>',
    },
  ],
} as const;
