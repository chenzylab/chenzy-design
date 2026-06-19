/**
 * @chenzy-design/locale — i18n interface, language packs, formatting.
 * Default bundle ships zh_CN only; others tree-shake / dynamic-import.
 */
export type { Locale } from './interface.js';
export { zh_CN } from './zh_CN.js';
export { en_US } from './en_US.js';
export { interpolate, formatDate, formatNumber } from './format.js';
export {
  createLocale,
  type LocaleApi,
  type CreateLocaleOptions,
  type Direction,
} from './create-locale.js';
