import type { Locale, LocaleApi } from '@chenzy-design/locale';

/** Svelte context key shared by LocaleProvider 与（未来的）ConfigProvider。 */
export const LOCALE_CONTEXT_KEY = Symbol('cd-locale');

/**
 * 注入到 context 的对象。`current` 是消费端读的 LocaleApi（getter，随语言切换更新）；
 * `resolved`/`timeZone`/`currency` 供嵌套 LocaleProvider 做 inherit 深合并与配置继承，
 * 消费组件无需关心。
 */
export interface LocaleContextValue {
  /** 最近注入的 LocaleApi（getter，渲染期重新读取拿到最新值）。 */
  readonly current: LocaleApi;
  /** 当前生效的完整语言包对象，供子级 inherit 深合并的父基底。 */
  readonly resolved: Locale;
  /** 当前生效的默认时区，供子级未显式设置时继承。 */
  readonly timeZone: string | undefined;
  /** 当前生效的默认货币，供子级未显式设置时继承。 */
  readonly currency: string | undefined;
}

export type { Locale, LocaleApi };
