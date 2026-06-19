<script lang="ts">
  import { setContext } from 'svelte';
  import type { Snippet } from 'svelte';
  import {
    createLocale,
    type LocaleApi,
    type Direction,
    type CreateLocaleOptions,
  } from '@chenzy-design/locale';
  import type { Locale } from '@chenzy-design/locale';
  import { LOCALE_CONTEXT_KEY } from './context.js';

  interface Props {
    /** 语言包对象（必填，本子集不支持字符串码解析）。 */
    locale: Locale;
    /** 缺失 key 回退包，默认 createLocale 内部用 en_US。 */
    fallback?: Locale;
    /** 文本方向，默认 'auto'（按 locale.rtl 推断）。 */
    direction?: Direction | 'auto';
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

  let { locale, fallback, direction = 'auto', onLocaleChange, children }: Props = $props();

  // 派生 LocaleApi：locale/fallback/direction 变化时重建（Intl 缓存随之重置，可接受）。
  // exactOptionalPropertyTypes 下条件构造 options，避免给可选属性传 undefined。
  const api = $derived.by<LocaleApi>(() => {
    const options: CreateLocaleOptions = { locale, direction };
    if (fallback) options.fallback = fallback;
    return createLocale(options);
  });

  // setContext 注入带 getter 的稳定引用对象，使后代 getContext 读到最新 api。
  // 红线 #1：locale 受控，仅注入不回写。
  setContext(LOCALE_CONTEXT_KEY, {
    get current(): LocaleApi {
      return api;
    },
  });

  // 红线 #3：$effect 只调通知回调，无 DOM/几何操作。首次 mount 也会触发一次（payload 为初始 locale，可接受）。
  $effect(() => {
    onLocaleChange?.({ locale: api.code, direction: api.direction });
  });
</script>

{#if children}{@render children({ locale: api.code, t: api.t, formatDate: api.formatDate, formatNumber: api.formatNumber, direction: api.direction })}{/if}
