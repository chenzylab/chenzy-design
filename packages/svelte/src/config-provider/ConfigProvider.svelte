<script lang="ts">
  import { getContext, setContext, untrack } from 'svelte';
  import type { Snippet } from 'svelte';
  import {
    mergeConfig,
    DEFAULT_CONFIG,
    defaultResponsiveMap,
    EMPTY_SCREENS,
    registerMediaQuery,
    type ConfigInput,
    type ResolvedConfig,
    type ConfigDir,
    type ConfigTimeZone,
    type ResponsiveMap,
    type BreakpointScreens,
    type Breakpoint,
    type OnBreakpointScreensCallback,
    type OnBreakpointChangeCallback,
  } from '@chenzy-design/core';
  import { createLocale, type LocaleApi } from '@chenzy-design/locale';
  import type { Locale } from '@chenzy-design/locale';
  import { LOCALE_CONTEXT_KEY } from '../locale-provider/context.js';
  import {
    CONFIG_CONTEXT_KEY,
    type ConfigContextValue,
    type GetPopupContainer,
    type OnBreakpoint,
  } from './context.js';

  interface Props {
    /** 语言包对象；提供则注入 locale context（复用 LocaleProvider 机制），未提供沿用上层。对齐 Semi locale。 */
    locale?: Locale;
    /** 文本方向，默认 'ltr'；'rtl' 时渲染 `<div class="cd-rtl">` 包裹层，驱动组件镜像。对齐 Semi direction。 */
    direction?: ConfigDir;
    /** 默认时区（数字偏移小时 / 'GMT±' / IANA 标识）注入时间类组件；未设继承父级。对齐 Semi timeZone。 */
    timeZone?: ConfigTimeZone;
    /** 全局浮层默认挂载容器；浮层组件（Modal/Dropdown 等）未传自身 prop 时回退此值，未设继承父级（最终回退 document.body）。对齐 Semi getPopupContainer。 */
    getPopupContainer?: GetPopupContainer;
    /** 是否开启响应式断点监听；默认 false（不注册任何 matchMedia），开启后首次订阅时懒注册、无订阅时自动注销。对齐 Semi responsiveObserve。 */
    responsiveObserve?: boolean;
    /** 自定义断点配置（key 为 xs/sm/md/lg/xl/xxl，value 为 media query）；未传用默认断点。引用比较：inline 新对象会触发重注册。对齐 Semi responsiveMap。 */
    responsiveMap?: ResponsiveMap;
    children?: Snippet;
  }

  let {
    locale,
    direction,
    timeZone,
    getPopupContainer,
    responsiveObserve = false,
    responsiveMap,
    children,
  }: Props = $props();

  // 读父级 config（嵌套支持）：init 期调 getContext，无父级用 DEFAULT_CONFIG。
  const parentCfg = getContext<ConfigContextValue | undefined>(CONFIG_CONTEXT_KEY);

  // exactOptionalPropertyTypes：仅塞非 undefined 字段，避免显式 undefined 报错。
  const localInput = $derived.by(() => {
    const o: ConfigInput = {};
    if (direction !== undefined) o.direction = direction;
    if (timeZone !== undefined) o.timeZone = timeZone;
    return o;
  });

  // 合并：父级（或默认）+ 本地输入（就近 wins、undefined 继承）。
  const resolved = $derived(mergeConfig(parentCfg?.current ?? DEFAULT_CONFIG, localInput));

  // getPopupContainer 不参与 core 纯配置合并，就近合并：本地提供则 wins，否则继承父级。
  const resolvedPopupContainer = $derived(getPopupContainer ?? parentCfg?.getPopupContainer);

  // 当前生效断点配置（未传用默认）。引用变化触发重注册（对齐 Semi 的引用比较语义）。
  const effectiveMap = $derived<ResponsiveMap>(responsiveMap ?? defaultResponsiveMap);

  // --- 响应式断点（严格对齐 Semi ConfigProvider 的懒注册 / 订阅机制）---
  // 同步真相源：普通（非响应式）字段，镜像 Semi 的 currentScreensRef。订阅时的立即
  // 回调、notifyListeners、单断点订阅都读它，**不读 $state**，避免子组件在 $effect
  // 内订阅时追踪到 $state screens、随后 registerMediaQueries 写入触发订阅重跑而死循环
  // （effect_update_depth_exceeded）。
  let currentScreensRef: BreakpointScreens = { ...EMPTY_SCREENS };
  // 响应式镜像：仅供渲染层经 context getter 订阅（matchMedia 回调命令式写入）。
  let screens = $state<BreakpointScreens>({ ...EMPTY_SCREENS });
  // 订阅者集合：整表订阅 + 单断点订阅。
  const screensListeners = new Set<OnBreakpointScreensCallback>();
  const changeListeners = new Set<{
    breakpoints?: Breakpoint[] | undefined;
    callback: OnBreakpointChangeCallback;
  }>();
  let unRegisters: Array<() => void> = [];
  let hasRegistered = false;
  let warnedResponsiveObserve = false;

  const BREAKPOINT_KEYS: Breakpoint[] = ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'];

  function notifyListeners(changed?: Breakpoint, match?: boolean): void {
    // 读 ref（非响应式快照），对齐 Semi —— 不让订阅者回调追踪到 $state。
    const snapshot = { ...currentScreensRef };
    screensListeners.forEach((listener) => listener(snapshot));
    if (changed != null && match != null) {
      changeListeners.forEach(({ breakpoints, callback }) => {
        if (!breakpoints || breakpoints.includes(changed)) callback(changed, match);
      });
    }
  }

  function updateScreen(screen: Breakpoint, matches: boolean): void {
    if (currentScreensRef[screen] === matches) return;
    currentScreensRef = { ...currentScreensRef, [screen]: matches };
    screens = currentScreensRef; // 同步响应式镜像
    notifyListeners(screen, matches);
  }

  function registerMediaQueries(): void {
    if (hasRegistered) return;
    const map = effectiveMap;
    // 先同步读一次当前命中，再挂监听（callInInit:false 避免重复触发）。
    const initial: BreakpointScreens = { ...EMPTY_SCREENS };
    if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
      BREAKPOINT_KEYS.forEach((screen) => {
        initial[screen] = window.matchMedia(map[screen]).matches;
      });
    }
    currentScreensRef = initial;
    screens = initial; // 同步响应式镜像
    unRegisters = BREAKPOINT_KEYS.map((screen) =>
      registerMediaQuery(map[screen], {
        match: () => updateScreen(screen, true),
        unmatch: () => updateScreen(screen, false),
        callInInit: false,
      }),
    );
    hasRegistered = true;
  }

  function unregisterMediaQueries(): void {
    unRegisters.forEach((off) => off());
    unRegisters = [];
    hasRegistered = false;
    currentScreensRef = { ...EMPTY_SCREENS };
  }

  // dev 检测：兼容 Vite（import.meta.env.DEV）与非 Vite 消费方（缺失时静默 no-op），
  // 避免依赖 vite/client 环境类型即可通过 svelte-check。
  const isDev = (import.meta as ImportMeta & { env?: { DEV?: boolean } }).env?.DEV ?? false;

  function ensureRegistered(): void {
    if (!responsiveObserve) {
      if (!warnedResponsiveObserve && isDev) {
        warnedResponsiveObserve = true;
        console.warn(
          '[chenzy-design] ConfigProvider responsive observing is disabled by default. ' +
            'Set <ConfigProvider responsiveObserve> to enable breakpoint subscriptions.',
        );
      }
      return;
    }
    if (screensListeners.size === 0 && changeListeners.size === 0) return;
    registerMediaQueries();
  }

  function maybeUnregister(): void {
    if (
      responsiveObserve &&
      screensListeners.size === 0 &&
      changeListeners.size === 0
    ) {
      unregisterMediaQueries();
    }
  }

  const onBreakpoint = ((arg1: unknown, arg2?: unknown) => {
    // onBreakpoint(callback)
    if (typeof arg1 === 'function') {
      const cb = arg1 as OnBreakpointScreensCallback;
      screensListeners.add(cb);
      ensureRegistered();
      cb({ ...currentScreensRef }); // 订阅即回调一次当前状态（读 ref，不追踪 $state）
      return () => {
        screensListeners.delete(cb);
        maybeUnregister();
      };
    }
    // onBreakpoint(breakpoints, callback)
    const breakpoints = Array.isArray(arg1) ? (arg1 as Breakpoint[]) : undefined;
    const cb = arg2 as OnBreakpointChangeCallback;
    const entry = { breakpoints, callback: cb };
    changeListeners.add(entry);
    ensureRegistered();
    if (breakpoints && typeof cb === 'function') {
      breakpoints.forEach((bp) => cb(bp, currentScreensRef[bp])); // 读 ref，不追踪 $state
    }
    return () => {
      changeListeners.delete(entry);
      maybeUnregister();
    };
  }) as OnBreakpoint;

  // responsiveObserve 关掉时确保注销；responsiveMap 引用变化时（已注册）重注册。
  // 仅追踪 effectiveMap / responsiveObserve 两个依赖；body 全程 untrack，避免读写
  // screens 造成 effect 自反馈循环（effect_update_depth_exceeded）。
  $effect(() => {
    const observe = responsiveObserve;
    const map = effectiveMap;
    untrack(() => {
      if (!observe && hasRegistered) {
        unregisterMediaQueries();
      } else if (hasRegistered) {
        // map 变化：重注册以应用新断点（callInInit:false，靠 registerMediaQueries
        // 同步读的 initial 写入 screens 并经 context 传播；不在此主动 notify 子回调，
        // 以免写子组件 state 反馈回父级形成循环）。
        void map;
        unregisterMediaQueries();
        registerMediaQueries();
      }
    });
    // cleanup：组件卸载时注销全部监听。
    return () => untrack(() => unregisterMediaQueries());
  });

  // 注入 config context：getter 保证后代读到最新合并结果。红线：受控不回写 props。
  setContext(CONFIG_CONTEXT_KEY, {
    get current(): ResolvedConfig {
      return resolved;
    },
    get getPopupContainer(): GetPopupContainer | undefined {
      return resolvedPopupContainer;
    },
    get responsiveMap(): ResponsiveMap {
      return effectiveMap;
    },
    get screens(): BreakpointScreens {
      return screens;
    },
    get onBreakpoint(): OnBreakpoint {
      return onBreakpoint;
    },
  } satisfies ConfigContextValue);

  // 注入 locale context（仅当 locale prop 提供时）。timeZone 不经 locale，而是作为
  // ConfigContext 独立字段（resolved.timeZone）下发，由时间类组件（DatePicker/TimePicker）
  // 经 config context 读取作为自身 timeZone 默认值 —— 严格对齐 Semi（DatePicker 用
  // ConfigContext.Consumer 直接读 timeZone，与 locale 是两条独立通道）。
  const localeApi = $derived<LocaleApi | null>(
    locale ? createLocale({ locale, direction: resolved.direction }) : null,
  );
  // init 期捕获初始值决定是否注入 locale context（setContext 必须同步执行）。
  const hasLocale = untrack(() => locale !== undefined);
  if (hasLocale) {
    setContext(LOCALE_CONTEXT_KEY, {
      get current(): LocaleApi | null {
        return localeApi;
      },
    });
  }
</script>

{#if resolved.direction === 'rtl'}
  <div class="cd-rtl">{@render children?.()}</div>
{:else}
  {@render children?.()}
{/if}
