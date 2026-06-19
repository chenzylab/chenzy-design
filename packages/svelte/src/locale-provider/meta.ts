/**
 * Machine-readable component metadata for AI/docs consumption.
 * LocaleProvider — see specs/components/other/LocaleProvider.spec.md
 */
export const meta = {
  name: 'LocaleProvider',
  category: 'other',
  renderless: true,
  description:
    '语言上下文注入组件，renderless 无 DOM 输出，通过 setContext 注入 LocaleApi（t/formatDate/formatNumber/direction）供后代组件消费；含回退链 + Intl 缓存 + direction 推断，是 ConfigProvider 的 locale 维度子集。本子集 locale 传语言包对象，字符串码解析 / inherit 深合并 / timeZone / currency / registerLocale 延后。',
  exports: ['LocaleProvider'],
  props: [
    {
      name: 'locale',
      type: 'Locale',
      default: 'undefined',
      desc: '语言包对象（必填，本子集不支持字符串码解析）',
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
  ],
} as const;
