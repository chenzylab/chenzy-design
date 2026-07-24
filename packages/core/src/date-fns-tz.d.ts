/**
 * date-fns-tz@1.x 的 package.json `exports["."]` 未暴露 types 条目，Bundler moduleResolution
 * 下无法解析其自带 typings.d.ts。此处为本库用到的 API 补最小 ambient 声明（不改运行逻辑）。
 */
declare module 'date-fns-tz' {
  export interface OptionsWithTZ {
    timeZone?: string;
    [key: string]: unknown;
  }
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
