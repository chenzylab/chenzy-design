<script lang="ts">
  import { setContext } from 'svelte';
  import type { Snippet } from 'svelte';
  import { createLocale, resolveLocale, en_US, type LocaleApi } from '@chenzy-design/locale';
  import type { Locale } from '@chenzy-design/locale';
  import { LOCALE_CONTEXT_KEY, type LocaleContextValue } from './context.js';

  // 对齐 Semi `localeProvider.tsx`：唯一 prop 是 locale，无 fallback/direction/inherit/
  // timeZone/currency/onLocaleChange —— Semi LocaleProvider 只是 `<LocaleContext.Provider
  // value={locale}>{children}</LocaleContext.Provider>`，不做合并/推断/格式化。
  interface Props {
    /**
     * 语言包对象，或内置/已注册的字符串码（如 'zh_CN' / 'en-US'）。
     * 字符串码经 registerLocale 注册表 + 内置包查表解析；未知码回退 en_US（本库补充，
     * Semi 的 locale 只接受语言包对象，无注册表）。
     */
    locale: Locale | string;
    children?: Snippet;
  }

  let { locale, children }: Props = $props();

  // 解析本级语言包：字符串码经注册表/内置查表，未知码回退 en_US；对象原样使用。
  const resolved = $derived<Locale>(resolveLocale(locale) ?? en_US);

  // 派生 LocaleApi：依赖变化时重建（Intl 缓存随之重置，可接受）。
  const api = $derived.by<LocaleApi>(() => createLocale({ locale: resolved }));

  // setContext 注入带 getter 的稳定引用对象，使后代 getContext 读到最新值。
  // 红线：locale 受控，仅注入不回写。对齐 ConfigProvider 注入同形状的 { current }。
  setContext<LocaleContextValue>(LOCALE_CONTEXT_KEY, {
    get current(): LocaleApi {
      return api;
    },
  });
</script>

{@render children?.()}
