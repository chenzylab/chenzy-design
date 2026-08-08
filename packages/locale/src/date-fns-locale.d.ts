/**
 * date-fns@2 的 `date-fns/locale` 是 CJS，Node ESM loader 在 docs dev SSR 下解析不出命名导出
 * （报 "Did you mean to import date-fns/esm/locale/index.js?"）。故改用真 ESM 子路径
 * `date-fns/esm/locale/index.js`——但带 `.js` 后缀的深路径 TS 又找不到对应 typings，
 * 这里补最小 ambient 声明（不改运行逻辑）。同 core/date-fns-tz.d.ts 的既有修法。
 *
 * 只声明本库用到的两个 locale；类型对齐 Locale 接口里 dateFnsLocale 的结构性声明。
 */
declare module 'date-fns/esm/locale/index.js' {
  interface DateFnsLocale {
    code?: string;
    formatLong?: unknown;
    localize?: unknown;
    match?: unknown;
    options?: unknown;
  }
  export const zhCN: DateFnsLocale;
  export const enUS: DateFnsLocale;
}
