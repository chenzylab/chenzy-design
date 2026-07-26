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

/**
 * 响应式断点键（xs..xxl），与 Semi Design / Ant Design 六档一致。
 * 断点系统的类型与常量归属此处（config-provider 是响应式配置的落点）。
 */
export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';

/** 各断点的 min-width（px）。xs 为 0（基础层无媒体查询）。对齐 Semi 断点尺寸。 */
export const BREAKPOINTS: Record<Breakpoint, number> = {
  xs: 0,
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
  xxl: 1600,
};

/** 文本方向。对齐 Semi direction。 */
export type ConfigDir = 'ltr' | 'rtl';

/** 时区标识：数字（距 UTC 偏移小时）或字符串（GMT±/IANA）。对齐 Semi timeZone。 */
export type ConfigTimeZone = string | number;

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
