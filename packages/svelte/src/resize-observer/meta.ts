/**
 * Machine-readable component metadata for AI/docs consumption.
 * ResizeObserver — see specs/components/other/ResizeObserver.spec.md
 */
export const meta = {
  name: 'ResizeObserver',
  category: 'other',
  renderless: true,
  description:
    '尺寸监听工具组件，封装原生 ResizeObserver（经 @chenzy-design/core 归一化），渲染一个无视觉样式的包裹元素作为观测容器，slot 暴露 width/height/entry，onResize 分发归一化尺寸事件；内置 throttle/debounce 节流去抖与 multiple 多目标观测；SSR/老浏览器静默降级，fallbackToWindow 可降级为 window.resize 近似监听；onResizeStart/onResizeEnd 暴露连续变化的首帧与静默结束边界事件；另导出 resize action 供轻量 use:resize 用法、getGlobalResizeObserver 单例池供大列表共享。盒模型支持 content-box/border-box/device-pixel-content-box，包裹元素标签可经 tag 自定义。',
  exports: [
    'ResizeObserver',
    'resize',
    'createResizeObserver',
    'getGlobalResizeObserver',
  ],
  props: [
    {
      name: 'box',
      type: "'content-box'|'border-box'|'device-pixel-content-box'",
      default: "'content-box'",
      desc: '观测盒模型：content-box 仅内容区，border-box 含 padding+border，device-pixel-content-box 物理像素内容盒（含 DPR；不支持时回退 content-box）',
    },
    {
      name: 'disabled',
      type: 'boolean',
      default: 'false',
      desc: '暂停尺寸分发，observer 仍监听但不向 slot/回调通知',
    },
    {
      name: 'throttle',
      type: 'number',
      default: '0',
      desc: '节流间隔(ms)，leading+trailing，0 即原生即时。与 debounce 互斥（同时 >0 时 debounce 优先）',
    },
    {
      name: 'debounce',
      type: 'number',
      default: '0',
      desc: '防抖等待(ms)，trailing-only，0 关闭。与 throttle 互斥（优先于 throttle）',
    },
    {
      name: 'multiple',
      type: 'boolean',
      default: 'false',
      desc: '多目标：观测包裹元素的所有直接子元素，onResize 逐个抛出，用 entry.target 区分',
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
      desc: '包裹元素标签，经 svelte:element 渲染；须为可生成盒子的元素（勿用 display:contents 类标签）',
    },
    {
      name: 'fallbackToWindow',
      type: 'boolean',
      default: 'false',
      desc: '原生 ResizeObserver 不可用（SSR/老环境）或显式开启时，降级监听 window.resize 并用 getBoundingClientRect 近似重测（精度较低）',
    },
  ],
  events: [
    { name: 'onResize', desc: '尺寸变化时分发归一化 entry（受控，不回写）' },
    { name: 'onFirstMeasure', desc: '首次测量完成时分发归一化 entry' },
    { name: 'onResizeStart', desc: '一段连续尺寸变化的首帧触发（"调整中"态）' },
    {
      name: 'onResizeEnd',
      desc: '连续变化静默结束后触发，payload 为最后一帧（"调整完成"）',
    },
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
