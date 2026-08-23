/**
 * Machine-readable component metadata for AI/docs consumption.
 * LocaleProvider — see specs/components/other/LocaleProvider.spec.md
 */
export const meta = {
  name: 'LocaleProvider',
  category: 'other',
  renderless: true,
  description:
    '语言上下文注入组件，renderless 无 DOM 输出。严格对齐 Semi locale/localeProvider.tsx：唯一 prop 是 locale，通过 setContext 把解析后的 LocaleApi 原样注入子树，不做深合并/方向推断/时区货币继承/变更回调——这些能力在 Semi 里也不存在（Semi 只把 locale 对象透传给消费组件，格式化逻辑在各消费组件内部）。locale 支持语言包对象或字符串码（registerLocale 注册表 + 内置查表解析，本库为语言包数量少于 Semi 而补充的能力）。',
  exports: ['LocaleProvider'],
  props: [
    {
      name: 'locale',
      type: 'Locale | string',
      default: 'undefined',
      desc: "语言包对象或字符串码（如 'zh_CN'/'en-US'）；字符串经 registerLocale 注册表 + 内置查表解析，未知码回退 en_US",
    },
  ],
  events: [],
  slots: [
    {
      name: 'children',
      desc: '被覆盖语言环境的子树（无作用域参数，对齐 Semi children 为普通 ReactNode）',
    },
  ],
  a11y: {
    hasRole: false,
    note: '无 DOM 无 role；renderless 不丢焦点。lang/dir 同步由宿主自行处理（Semi 同样不提供该回调）。',
  },
  tokens: [],
  responsive: false,
  examples: [
    {
      title: '基础包裹',
      code: '<LocaleProvider {locale}>{@render app()}</LocaleProvider>',
    },
    {
      title: '局部覆盖',
      code: '<LocaleProvider locale={en_US}>{@render section()}</LocaleProvider>',
    },
    {
      title: '字符串码解析',
      code: '<LocaleProvider locale="en_US">{@render app()}</LocaleProvider>',
    },
    {
      title: '注册自定义包后用码',
      code: "registerLocale('fr_FR', fr); // 再 <LocaleProvider locale=\"fr_FR\">…",
    },
  ],
} as const;
