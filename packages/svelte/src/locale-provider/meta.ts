/**
 * Machine-readable component metadata for AI/docs consumption.
 * LocaleProvider — see specs/components/other/LocaleProvider.spec.md
 */
export const meta = {
  name: 'LocaleProvider',
  category: 'other',
  renderless: true,
  description:
    '语言上下文注入组件，renderless 无 DOM 输出，通过 setContext 注入 LocaleApi（t/formatDate/formatNumber/direction）供后代组件消费；含回退链 + Intl 缓存 + direction 推断，是 ConfigProvider 的 locale 维度子集。locale 支持语言包对象或字符串码（registerLocale 注册表 + 内置查表解析）；嵌套时 inherit 深合并父级语言包（子覆盖父）；timeZone/currency 经 context 注入 formatDate/formatNumber。',
  exports: ['LocaleProvider'],
  props: [
    {
      name: 'locale',
      type: 'Locale | string',
      default: 'undefined',
      desc: "语言包对象或字符串码（如 'zh_CN'/'en-US'）；字符串经 registerLocale 注册表 + 内置查表解析，未知码回退 en_US",
    },
    {
      name: 'fallback',
      type: 'Locale',
      default: 'undefined',
      desc: '缺失 key 回退包，默认内部用 en_US',
    },
    {
      name: 'direction',
      type: "'ltr'|'rtl'|'auto'",
      default: "'auto'",
      desc: "文本方向，'auto' 按 locale.rtl 推断",
    },
    {
      name: 'inherit',
      type: 'boolean',
      default: 'true',
      desc: '嵌套时深合并父级 LocaleProvider 语言包（子覆盖父，未覆盖继承父）；false 则整体替换',
    },
    {
      name: 'timeZone',
      type: 'string',
      default: 'undefined',
      desc: "默认 IANA 时区（如 'Asia/Shanghai'）注入 formatDate；未设时继承父级",
    },
    {
      name: 'currency',
      type: 'string',
      default: 'undefined',
      desc: "默认 ISO 4217 货币（如 'CNY'）用于 currency 风格 formatNumber；未设时继承父级",
    },
  ],
  events: [{ name: 'onLocaleChange', desc: 'locale/direction 变化时通知（受控，不回写）' }],
  slots: [
    {
      name: 'children',
      desc: '作用域参数 { locale, t, formatDate, formatNumber, direction }',
    },
  ],
  a11y: {
    hasRole: false,
    note: '无 DOM 无 role；推荐宿主监听 onLocaleChange 同步 html lang/dir 满足 WCAG 3.1.2；renderless 不丢焦点。',
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
      title: 'slot 作用域格式化',
      code: '<LocaleProvider {locale}>{#snippet children({ t, formatNumber })}{t("Modal.okText")} {formatNumber(1234.5)}{/snippet}</LocaleProvider>',
    },
    {
      title: '字符串码解析',
      code: '<LocaleProvider locale="en_US">{@render app()}</LocaleProvider>',
    },
    {
      title: '注册自定义包后用码',
      code: "registerLocale('fr_FR', fr); // 再 <LocaleProvider locale=\"fr_FR\">…",
    },
    {
      title: '嵌套 inherit 深合并',
      code: '<LocaleProvider locale={zh_CN}>{@render outer()}<LocaleProvider locale={{ Modal: { okText: "好的" } }}>{@render inner()}</LocaleProvider></LocaleProvider>',
    },
    {
      title: '时区 / 货币',
      code: '<LocaleProvider locale="zh_CN" timeZone="Asia/Shanghai" currency="CNY">{@render app()}</LocaleProvider>',
    },
  ],
} as const;
