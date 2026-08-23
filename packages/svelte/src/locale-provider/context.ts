import type { Locale, LocaleApi } from '@chenzy-design/locale';

/** Svelte context key shared by LocaleProvider 与 ConfigProvider（对齐 Semi locale/context.tsx 的 LocaleContext）。 */
export const LOCALE_CONTEXT_KEY = Symbol.for('cd-locale');

/**
 * 注入到 context 的对象。对齐 Semi `React.createContext<Locale>`：
 * 只透传 `current`（消费端读的 LocaleApi，getter，随语言切换更新），无其它字段。
 */
export interface LocaleContextValue {
  /** 最近注入的 LocaleApi（getter，渲染期重新读取拿到最新值）。 */
  readonly current: LocaleApi;
}

export type { Locale, LocaleApi };
