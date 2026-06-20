/**
 * Machine-readable component metadata for AI/docs consumption.
 * ConfigProvider — see specs/components/other/ConfigProvider.spec.md
 */
export const meta = {
  name: 'ConfigProvider',
  category: 'other',
  renderless: true,
  description:
    '全局配置总入口，通过 setContext 注入 locale/theme/dir/size/zIndexBase/transition/reducedMotion 等配置 context 供子树继承；嵌套时浅合并（undefined 继承、就近 wins）；theme="dark" 在 wrap 根写 data-theme 触发 tokens 暗色调色板，theme="auto" 经命令式 matchMedia 监听 prefers-color-scheme 实时解析 light/dark（系统切换自动响应、带 cleanup）；reducedMotion(boolean|"auto") 控制动画降级，显式开启时写全局标记（wrap 时在包裹 div、renderless 时命令式写 documentElement 的 data-reduced-motion）令依赖 motion-duration token 的动画退化，"auto" 沿用系统原生 @media；wrap=true 渲染 display:contents 包裹元素建立独立主题/方向作用域，默认 wrap=false renderless 无 DOM；locale 维度复用 LocaleProvider 的 createLocale + LOCALE_CONTEXT_KEY 机制。本子集 getPopupContainer / getValidateMessages / as 自定义标签延后。',
  exports: ['ConfigProvider'],
  props: [
    {
      name: 'locale',
      type: 'Locale',
      default: 'undefined',
      desc: '语言包对象；提供则注入 locale context（复用 LocaleProvider 机制），未提供则沿用上层',
    },
    {
      name: 'theme',
      type: "'light'|'dark'|'auto'",
      default: 'undefined',
      desc: '主题，undefined 继承父级；dark 在 wrap 根写 data-theme 触发暗色调色板；auto 跟随系统 prefers-color-scheme 实时切 light/dark',
    },
    {
      name: 'reducedMotion',
      type: "boolean|'auto'",
      default: "'auto'",
      desc: '动画降级开关，undefined 继承父级（默认 auto）；true 强制降级、false 强制开启、auto 跟随系统 prefers-reduced-motion；显式开启时写全局 data-reduced-motion 标记令动画退化',
    },
    {
      name: 'dir',
      type: "'ltr'|'rtl'",
      default: 'undefined',
      desc: '文本方向，undefined 继承父级',
    },
    {
      name: 'size',
      type: "'small'|'default'|'large'",
      default: 'undefined',
      desc: '默认尺寸，undefined 继承父级',
    },
    {
      name: 'zIndexBase',
      type: 'number',
      default: 'undefined',
      desc: '浮层 z-index 基线，undefined 继承父级（DEFAULT 1000）',
    },
    {
      name: 'transition',
      type: 'boolean',
      default: 'undefined',
      desc: '是否启用过渡动画，undefined 继承父级',
    },
    {
      name: 'wrap',
      type: 'boolean',
      default: 'false',
      desc: 'true 时渲染 display:contents 包裹 div，建立主题/方向作用域；false 为 renderless 无 DOM',
    },
  ],
  events: [
    { name: 'onThemeChange', desc: 'theme 变化时通知（受控，不回写）；info.applied 为 auto 解析后实际落地的 light/dark' },
    { name: 'onReducedMotionChange', desc: 'reducedMotion 解析结果变化时通知（受控，不回写）；info.reduced=true 表示已降级' },
    { name: 'onLocaleChange', desc: 'locale 变化时通知（受控，不回写）' },
    { name: 'onDirChange', desc: 'dir 变化时通知（受控，不回写）' },
    { name: 'onConfigChange', desc: '合并后配置变化时通知（受控，不回写）' },
  ],
  slots: [{ name: 'children', desc: '受配置作用域覆盖的后代内容' }],
  a11y: {
    hasRole: false,
    note: '无 role；wrap div 用 display:contents 不生成盒子、不打断 a11y 树；dir 属性写入供 RTL 辅助技术读取；推荐宿主同步 html lang/dir。',
  },
  tokens: [],
  responsive: false,
  examples: [
    {
      title: '应用根配置',
      code: '<ConfigProvider {locale} theme="light" dir="ltr">{@render app()}</ConfigProvider>',
    },
    {
      title: '局部暗色覆盖',
      code: '<ConfigProvider wrap theme="dark">{@render panel()}</ConfigProvider>',
    },
    {
      title: '跟随系统主题（auto）',
      code: '<ConfigProvider wrap theme="auto">{@render app()}</ConfigProvider>',
    },
    {
      title: '强制降级动画',
      code: '<ConfigProvider reducedMotion>{@render app()}</ConfigProvider>',
    },
    {
      title: '嵌套 dir 覆盖',
      code: '<ConfigProvider dir="ltr"><ConfigProvider wrap dir="rtl">{@render rtlSection()}</ConfigProvider></ConfigProvider>',
    },
  ],
} as const;
