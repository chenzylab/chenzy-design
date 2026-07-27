/**
 * date-fns-tz@1.x 的 package.json `exports["."]` / `exports["./esm"]` 均未暴露 types 条目，Bundler
 * moduleResolution 下无法解析其自带 typings.d.ts。此处为本库用到的 API 补最小 ambient 声明（不改运行逻辑）。
 *
 * 两个模块标识都声明：`date-fns-tz`（CJS `.` 入口，其它消费方可能用）与 `date-fns-tz/esm`（真 ESM 版，
 * date-fns-extra.ts 用它以让 dev SSR 的 Node ESM loader 能解析命名导出）。类型完全一致，故共用同一形状。
 */
interface DateFnsTzOptionsWithTZ {
  timeZone?: string;
  [key: string]: unknown;
}
declare module 'date-fns-tz' {
  export type OptionsWithTZ = DateFnsTzOptionsWithTZ;
  export function toDate(argument: string | number | Date, options?: OptionsWithTZ): Date;
  export function format(date: number | Date, formatToken: string, options?: OptionsWithTZ): string;
  export function utcToZonedTime(
    date: string | number | Date,
    timeZone: string,
    options?: OptionsWithTZ,
  ): Date;
  export function zonedTimeToUtc(
    date: string | number | Date,
    timeZone: string,
    options?: OptionsWithTZ,
  ): Date;
}
declare module 'date-fns-tz/esm' {
  export type OptionsWithTZ = DateFnsTzOptionsWithTZ;
  export function toDate(argument: string | number | Date, options?: OptionsWithTZ): Date;
  export function format(date: number | Date, formatToken: string, options?: OptionsWithTZ): string;
  export function utcToZonedTime(
    date: string | number | Date,
    timeZone: string,
    options?: OptionsWithTZ,
  ): Date;
  export function zonedTimeToUtc(
    date: string | number | Date,
    timeZone: string,
    options?: OptionsWithTZ,
  ): Date;
}
