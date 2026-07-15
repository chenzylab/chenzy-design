/**
 * ConfigProvider helpers — framework-agnostic config merge + responsive utils.
 *
 * 严格对齐 Semi ConfigProvider（packages/semi-ui/configProvider）：ConfigProvider 是
 * 纯逻辑组件，仅下发 direction / timeZone / getPopupContainer 等跨组件公共配置，并提供
 * 响应式断点订阅能力。locale 维度由 svelte 层的 locale context 承担（不进 core 纯配置）。
 *
 * 纯函数 / 纯类型：context 注入与 matchMedia 生命周期由 svelte 层拥有；此处仅提供
 * 可测的合并逻辑、断点常量与 registerMediaQuery 工具（对齐 semi `_utils`）。
 */

import type { Breakpoint } from './breakpoints.js';

/** 文本方向。对齐 Semi direction。 */
export type ConfigDir = 'ltr' | 'rtl';

/** 时区标识：数字（距 UTC 偏移小时）或字符串（GMT±/IANA）。对齐 Semi timeZone。 */
export type ConfigTimeZone = string | number;

// 响应式断点键（xs..xxl）复用 breakpoints.ts 的 Breakpoint（与 Semi 六档一致），
// 不重复定义，避免 core 导出重名。

/** 断点 → media query 字符串映射。对齐 Semi ResponsiveMap。 */
export interface ResponsiveMap {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  xxl: string;
}

/** 各断点当前命中情况。对齐 Semi BreakpointScreens。 */
export interface BreakpointScreens {
  xs: boolean;
  sm: boolean;
  md: boolean;
  lg: boolean;
  xl: boolean;
  xxl: boolean;
}

/** 订阅回调：拿到完整 screens 映射。对齐 Semi OnBreakpointScreensCallback。 */
export type OnBreakpointScreensCallback = (screens: BreakpointScreens) => void;

/** 订阅回调：拿到单个断点变化。对齐 Semi OnBreakpointChangeCallback。 */
export type OnBreakpointChangeCallback = (screen: Breakpoint, match: boolean) => void;

/**
 * 默认断点配置。对齐 Semi defaultResponsiveMap，可经
 * `ConfigProvider.defaultResponsiveMap` 获取。
 */
export const defaultResponsiveMap: ResponsiveMap = {
  xs: '(max-width: 575px)',
  sm: '(min-width: 576px)',
  md: '(min-width: 768px)',
  lg: '(min-width: 992px)',
  xl: '(min-width: 1200px)',
  xxl: '(min-width: 1600px)',
};

/** 全部断点均未命中的初值。 */
export const EMPTY_SCREENS: BreakpointScreens = {
  xs: false,
  sm: false,
  md: false,
  lg: false,
  xl: false,
  xxl: false,
};

/**
 * ConfigProvider 传入的部分配置（undefined = 继承父级）。
 * 对齐 Semi ConfigProviderProps 中参与跨组件继承的纯配置字段。
 */
export interface ConfigInput {
  direction?: ConfigDir;
  timeZone?: ConfigTimeZone;
}

/** 完全解析后的配置（每个字段都存在）。 */
export interface ResolvedConfig {
  direction: ConfigDir;
  timeZone: ConfigTimeZone | undefined;
}

/** 默认配置。对齐 Semi defaultProps（direction: 'ltr'）。 */
export const DEFAULT_CONFIG: ResolvedConfig = {
  direction: 'ltr',
  timeZone: undefined,
};

/**
 * 把子配置浅合并到已解析的父配置：子字段仅在显式提供（非 undefined）时覆盖父级，
 * 省略字段继承父级值（就近 wins）。对齐 Semi 嵌套 Context 的继承语义。
 */
export function mergeConfig(parent: ResolvedConfig, child: ConfigInput): ResolvedConfig {
  return {
    direction: child.direction ?? parent.direction,
    timeZone: child.timeZone ?? parent.timeZone,
  };
}

// --- 时区值层偏移（对齐 Semi utcToZonedTime 语义；不依赖 date-fns，不碰原生 Intl 时区）---
// Semi 的 timeZone 不是在显示层给格式化器附加 timeZone，而是在【值层】用 date-fns-tz 的
// utcToZonedTime 把绝对时刻（UTC）转成「目标时区墙上时间」对应的一个 Date，随后底层一律用
// date-fns format 按该 Date 的本地字段序列化。本库刻意不依赖 date-fns，故用纯偏移换算复刻
// 该语义：对固定偏移（数字小时 / 'GMT±HH:mm'）精确等价；具名 IANA（含夏令时）不支持，
// 因为无 tz 数据库无从判定，属有意的能力边界（demo 仅用 GMT± / 数字，与 Semi demo 一致）。

const GMT_STRING_REG = /^GMT([-+])(\d{2}):(\d{2})$/;

/**
 * 把 timeZone（数字=距 UTC 的小时偏移 | 'GMT±HH:mm'）解析成「分钟偏移」；无法解析（含具名
 * IANA 标识、非法串）返回 undefined，调用方据此回退到不做时区转换（用本地时区）。
 */
export function parseTimeZoneOffsetMinutes(tz: string | number): number | undefined {
  if (typeof tz === 'number') {
    return Number.isFinite(tz) ? Math.round(tz * 60) : undefined;
  }
  const matches = tz.match(GMT_STRING_REG);
  if (!matches) return undefined;
  const sign = matches[1] === '-' ? -1 : 1;
  const hours = parseInt(matches[2] ?? '0', 10);
  const minutes = parseInt(matches[3] ?? '0', 10);
  return sign * (hours * 60 + minutes);
}

/**
 * 把一个绝对时刻（Date）转成「目标时区墙上时间」对应的 Date —— 该 Date 的本地字段
 * (getHours/getFullYear…) 即目标时区的墙上时间。对齐 Semi utcToZonedTime（固定偏移场景）：
 * 消费方随后用现有的本地字段序列化（getHours 等 / Intl 不传 timeZone）即得到该时区的显示文案。
 * timeZone 无法解析（具名 IANA / 非法）时原样返回入参 Date，等价于不做时区转换。
 */
export function zonedWallTime(date: Date, tz: string | number | undefined): Date {
  if (tz == null) return date;
  const offsetMinutes = parseTimeZoneOffsetMinutes(tz);
  if (offsetMinutes === undefined) return date;
  // date.getTime() 是 UTC 毫秒；加上目标时区偏移，再用「负本地偏移」抵消，使得读出的
  // 本地字段恰好等于目标时区墙上时间。等价于 date-fns-tz utcToZonedTime 的固定偏移分支。
  const localOffsetMinutes = date.getTimezoneOffset(); // 本地相对 UTC，东区为负
  const deltaMinutes = offsetMinutes + localOffsetMinutes;
  return new Date(date.getTime() + deltaMinutes * 60_000);
}

interface RegisterMediaQueryOption {
  match?: (e: MediaQueryList | MediaQueryListEvent) => void;
  unmatch?: (e: MediaQueryList | MediaQueryListEvent) => void;
  /** true 时注册后立即以当前状态回调一次。对齐 Semi callInInit 默认 true。 */
  callInInit?: boolean;
}

/**
 * 注册 media query 的 match/unmatch 回调，返回注销函数。
 * 逐字对齐 Semi `_utils` 的 registerMediaQuery：SSR（无 window）返回 noop；
 * 优先 addEventListener，回退老浏览器 addListener；callInInit 默认立即回调一次。
 */
export function registerMediaQuery(
  media: string,
  { match, unmatch, callInInit = true }: RegisterMediaQueryOption,
): () => void {
  if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
    const mediaQueryList = window.matchMedia(media);
    const handlerMediaChange = (e: MediaQueryList | MediaQueryListEvent): void => {
      if (e.matches) {
        match?.(e);
      } else {
        unmatch?.(e);
      }
    };
    if (callInInit) handlerMediaChange(mediaQueryList);
    if (Object.prototype.hasOwnProperty.call(mediaQueryList, 'addEventListener')) {
      mediaQueryList.addEventListener('change', handlerMediaChange);
      return (): void => mediaQueryList.removeEventListener('change', handlerMediaChange);
    }
    mediaQueryList.addListener(handlerMediaChange);
    return (): void => mediaQueryList.removeListener(handlerMediaChange);
  }
  return () => undefined;
}
