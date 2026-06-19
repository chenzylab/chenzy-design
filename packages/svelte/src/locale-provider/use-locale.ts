import { createLocale, en_US, type LocaleApi } from '@chenzy-design/locale';
import { getLocaleContext } from './index.js';

// 无 Provider 时的回退实例：用 en_US 构造一次并缓存（模块级单例），
// 避免每个未被 LocaleProvider 包裹的组件各自重建 createLocale。
let fallbackApi: LocaleApi | undefined;
function getFallbackApi(): LocaleApi {
  if (!fallbackApi) fallbackApi = createLocale({ locale: en_US });
  return fallbackApi;
}

/**
 * 统一的 locale 消费入口。组件在 `<script>` 顶层（初始化期）调用一次拿到
 * 一个稳定 getter，再在 `$derived` 里读 `loc().t('Component.field')`。
 *
 * - 有 `<LocaleProvider>` 包裹：返回最近注入的 LocaleApi（随语言切换响应更新）。
 * - 无 Provider：回退到 en_US 构造的 LocaleApi（不崩溃、不渲染空串）。
 *
 * 返回函数而非直接返回 api：context 的 `{ current }` 是 getter，必须在
 * 渲染期重新读取才能在语言切换后拿到新 api，故包成 `() => LocaleApi`。
 */
export function useLocale(): () => LocaleApi {
  const ctx = getLocaleContext();
  return () => ctx?.current ?? getFallbackApi();
}
