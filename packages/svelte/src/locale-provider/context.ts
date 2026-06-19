import type { LocaleApi } from '@chenzy-design/locale';

/** Svelte context key shared by LocaleProvider 与（未来的）ConfigProvider。 */
export const LOCALE_CONTEXT_KEY = Symbol('cd-locale');

export type { LocaleApi };
