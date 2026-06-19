import { getContext } from 'svelte';
import { LOCALE_CONTEXT_KEY, type LocaleApi } from './context.js';

export { default as LocaleProvider } from './LocaleProvider.svelte';
export { LOCALE_CONTEXT_KEY, type LocaleApi } from './context.js';
export { meta as localeProviderMeta } from './meta.js';

/**
 * 读取最近 LocaleProvider 注入的 LocaleApi。
 * 约束：getContext 只能在组件初始化期调用，故此 helper 必须在消费组件的
 * `<script>` 顶层（初始化期）调用，返回的 `{ current }` 持有最新 LocaleApi。
 */
export function getLocaleContext(): { current: LocaleApi } | undefined {
  return getContext(LOCALE_CONTEXT_KEY);
}

export { useLocale } from './use-locale.js';
