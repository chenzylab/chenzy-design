/**
 * Machine-readable component metadata for AI/docs consumption.
 * ConfigProvider — see specs/components/other/ConfigProvider.spec.md
 * 严格对齐 Semi ConfigProvider（packages/semi-ui/configProvider）。
 */
export const meta = {
  name: 'ConfigProvider',
  category: 'other',
  renderless: true,
  description:
    '全局配置总入口，借助 Svelte Context 向子树注入跨组件公共配置：locale（多语言，复用 LocaleProvider 的 createLocale + LOCALE_CONTEXT_KEY 机制注入）、direction（文本方向，rtl 时渲染 `<div class="cd-rtl">` 包裹层驱动组件镜像，否则 renderless 无 DOM）、timeZone（时区标识，数字偏移 / GMT± / IANA，透传给时间类组件）、getPopupContainer（全局浮层默认挂载容器，经 context 暴露给浮层组件在自身 prop 未传时回退，最终回退 document.body）。嵌套时浅合并（undefined 继承、就近 wins）。响应式断点：responsiveObserve 默认 false（不注册任何 matchMedia），开启后在首次订阅时懒注册监听、无订阅时自动注销；responsiveMap 自定义断点（key 为 xs/sm/md/lg/xl/xxl，引用比较，inline 新对象触发重注册）；onBreakpoint / screens 非 props，经 getConfigResponsive（等价 Semi ConfigConsumer）读取，onBreakpoint 支持 `(cb)`（拿完整 screens）与 `(breakpoints, cb)`（拿单断点变化）两种签名、订阅时立即回调一次；defaultResponsiveMap 作为默认断点导出。ConfigProvider 本身无独立 token / scss，是纯逻辑组件（对齐 Semi）。',
  exports: ['ConfigProvider'],
  props: [
    {
      name: 'locale',
      type: 'Locale',
      default: 'undefined',
      desc: '语言包对象；提供则注入 locale context（复用 LocaleProvider 机制），未提供则沿用上层。对齐 Semi locale',
    },
    {
      name: 'direction',
      type: "'ltr'|'rtl'",
      default: "'ltr'",
      desc: '文本方向；rtl 时渲染 `<div class="cd-rtl">` 包裹层驱动组件镜像，undefined 继承父级。对齐 Semi direction',
    },
    {
      name: 'timeZone',
      type: 'string|number',
      default: 'undefined',
      desc: '默认时区标识（数字为距 UTC 偏移小时，字符串为 GMT± 或 IANA 如 Asia/Shanghai），注入时间类组件；undefined 继承父级。对齐 Semi timeZone',
    },
    {
      name: 'getPopupContainer',
      type: '() => HTMLElement | null | undefined',
      default: '() => document.body',
      desc: '全局浮层默认挂载容器；经 context 暴露给浮层组件（Modal/Dropdown 等），其自身 getContainer/getPopupContainer prop 优先，未传时回退此值；undefined 继承父级。对齐 Semi getPopupContainer',
    },
    {
      name: 'responsiveObserve',
      type: 'boolean',
      default: 'false',
      desc: '是否开启响应式断点监听；默认关闭以避免全局注册 matchMedia 的性能开销，开启后首次订阅时懒注册、无订阅时自动注销。对齐 Semi responsiveObserve',
    },
    {
      name: 'responsiveMap',
      type: 'ResponsiveMap',
      default: 'defaultResponsiveMap',
      desc: '自定义断点配置（key 为 xs/sm/md/lg/xl/xxl，value 为 media query 字符串）；未传用默认断点。引用比较：inline 新对象会触发重注册，建议定义在组件外。对齐 Semi responsiveMap',
    },
  ],
  events: [],
  slots: [{ name: 'children', desc: '受配置作用域覆盖的后代内容' }],
  a11y: {
    hasRole: false,
    note: 'direction=rtl 时渲染 `<div class="cd-rtl">` 承载方向作用域供 RTL 辅助技术读取（对齐 Semi .semi-rtl）；其余方向 renderless 无 DOM、不打断 a11y 树；推荐宿主同步 html lang/dir。',
  },
  tokens: [],
  responsive: true,
  examples: [
    {
      title: '基本用法（时区）',
      code: '<ConfigProvider timeZone="GMT+08:00">{@render app()}</ConfigProvider>',
    },
    {
      title: '手动获取值',
      code: 'const cfg = getConfigContext(); // { direction, timeZone }',
    },
    {
      title: '响应式断点监听',
      code: '<ConfigProvider responsiveObserve {responsiveMap}>{@render app()}</ConfigProvider>',
    },
    {
      title: 'RTL 方向',
      code: '<ConfigProvider direction="rtl">{@render app()}</ConfigProvider>',
    },
    {
      title: '全局浮层容器',
      code: '<ConfigProvider getPopupContainer={() => document.getElementById("app")!}>{@render app()}</ConfigProvider>',
    },
    {
      title: '嵌套 direction 覆盖',
      code: '<ConfigProvider direction="ltr"><ConfigProvider direction="rtl">{@render rtlSection()}</ConfigProvider></ConfigProvider>',
    },
  ],
} as const;
