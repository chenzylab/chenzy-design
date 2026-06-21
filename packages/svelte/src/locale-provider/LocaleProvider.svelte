<script lang="ts">
  import { setContext } from 'svelte';
  import type { Snippet } from 'svelte';
  import {
    createLocale,
    resolveLocale,
    mergeLocale,
    en_US,
    type LocaleApi,
    type Direction,
    type CreateLocaleOptions,
  } from '@chenzy-design/locale';
  import type { Locale } from '@chenzy-design/locale';
  import { LOCALE_CONTEXT_KEY, type LocaleContextValue } from './context.js';
  import { getLocaleContext } from './index.js';

  interface Props {
    /**
     * 语言包对象，或内置/已注册的字符串码（如 'zh_CN' / 'en-US'）。
     * 字符串码经 registerLocale 注册表 + 内置包查表解析；未知码回退 en_US。
     */
    locale: Locale | string;
    /** 缺失 key 回退包，默认 createLocale 内部用 en_US。 */
    fallback?: Locale;
    /** 文本方向，默认 'auto'（按 locale.rtl 推断）。 */
    direction?: Direction | 'auto';
    /**
     * 嵌套时是否深合并父级 LocaleProvider 的语言包（子覆盖父，未覆盖继承父）。
     * 默认 true；设 false 则整体替换，仅用本级语言包。
     */
    inherit?: boolean;
    /** 默认 IANA 时区（如 'Asia/Shanghai'）注入 formatDate；未设时继承父级。 */
    timeZone?: string;
    /** 默认 ISO 4217 货币（如 'CNY'）用于 currency 风格 formatNumber；未设时继承父级。 */
    currency?: string;
    /** locale/direction 变化时的通知回调（受控，不回写）。 */
    onLocaleChange?: (info: { locale: string; direction: Direction }) => void;
    children?: Snippet<
      [
        {
          locale: string;
          t: LocaleApi['t'];
          formatDate: LocaleApi['formatDate'];
          formatNumber: LocaleApi['formatNumber'];
          direction: Direction;
        },
      ]
    >;
  }

  let {
    locale,
    fallback,
    direction = 'auto',
    inherit = true,
    timeZone,
    currency,
    onLocaleChange,
    children,
  }: Props = $props();

  // 最近的父级 LocaleProvider 上下文（初始化期读一次）；用于 inherit 深合并与配置继承。
  const parent = getLocaleContext();

  // 解析本级语言包：字符串码经注册表/内置查表，未知码回退 en_US；对象原样使用。
  // 红线 #2：resolveLocale / mergeLocale 为 @chenzy-design/locale 的纯函数。
  const resolved = $derived.by<Locale>(() => {
    const own = resolveLocale(locale) ?? en_US;
    // inherit：深合并父级生效包作基底，子覆盖父、未覆盖继承父。
    return inherit && parent ? (mergeLocale(parent.resolved, own) as Locale) : own;
  });

  // 时区/货币：本级未设时继承父级生效值（仅 inherit 时；否则只用本级）。
  const effTimeZone = $derived(timeZone ?? (inherit ? parent?.timeZone : undefined));
  const effCurrency = $derived(currency ?? (inherit ? parent?.currency : undefined));

  // 派生 LocaleApi：依赖变化时重建（Intl 缓存随之重置，可接受）。
  // exactOptionalPropertyTypes 下条件构造 options，避免给可选属性传 undefined。
  const api = $derived.by<LocaleApi>(() => {
    const options: CreateLocaleOptions = { locale: resolved, direction };
    if (fallback) options.fallback = fallback;
    if (effTimeZone) options.timeZone = effTimeZone;
    if (effCurrency) options.currency = effCurrency;
    return createLocale(options);
  });

  // setContext 注入带 getter 的稳定引用对象，使后代 getContext 读到最新值。
  // 红线 #1：locale 受控，仅注入不回写。resolved/timeZone/currency 供子级 inherit 用。
  setContext<LocaleContextValue>(LOCALE_CONTEXT_KEY, {
    get current(): LocaleApi {
      return api;
    },
    get resolved(): Locale {
      return resolved;
    },
    get timeZone(): string | undefined {
      return effTimeZone;
    },
    get currency(): string | undefined {
      return effCurrency;
    },
  });

  // 红线 #3：$effect 只调通知回调，无 DOM/几何操作。首次 mount 也会触发一次（payload 为初始 locale，可接受）。
  $effect(() => {
    onLocaleChange?.({ locale: api.code, direction: api.direction });
  });
</script>

{#if children}{@render children({ locale: api.code, t: api.t, formatDate: api.formatDate, formatNumber: api.formatNumber, direction: api.direction })}{/if}
