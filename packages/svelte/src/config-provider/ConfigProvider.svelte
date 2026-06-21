<script lang="ts">
  import { getContext, setContext, untrack } from 'svelte';
  import type { Snippet } from 'svelte';
  import {
    mergeConfig,
    DEFAULT_CONFIG,
    resolveAppliedTheme,
    resolveReducedMotion,
    type ConfigInput,
    type ResolvedConfig,
    type ConfigTheme,
    type AppliedTheme,
    type ConfigDir,
    type ConfigSize,
    type ReducedMotionInput,
  } from '@chenzy-design/core';
  import { createLocale, type LocaleApi } from '@chenzy-design/locale';
  import type { Locale } from '@chenzy-design/locale';
  import { LOCALE_CONTEXT_KEY } from '../locale-provider/context.js';
  import {
    CONFIG_CONTEXT_KEY,
    type ConfigContextValue,
    type GetPopupContainer,
    type GetValidateMessages,
  } from './context.js';

  interface Props {
    /** 语言包；提供则注入 locale context（复用 LocaleProvider 机制），未提供沿用上层。 */
    locale?: Locale;
    /** 主题，undefined 继承父级；dark 在 wrap 根写 data-theme 触发暗色调色板；auto 跟随系统 prefers-color-scheme 实时切 light/dark。 */
    theme?: ConfigTheme;
    /** 是否降级动画：true 强制降级、false 强制开启、'auto'（默认）跟随系统 prefers-reduced-motion；为真时写全局标记令库内动画退化。 */
    reducedMotion?: ReducedMotionInput;
    /** 文本方向，undefined 继承父级。 */
    dir?: ConfigDir;
    /** 默认尺寸，undefined 继承父级。 */
    size?: ConfigSize;
    /** 浮层 z-index 基线，undefined 继承父级。 */
    zIndexBase?: number;
    /** 是否启用过渡动画，undefined 继承父级。 */
    transition?: boolean;
    /** 全局浮层默认挂载容器；浮层组件（Modal/Dropdown 等）未传自身 prop 时回退此值，undefined 继承父级（最终回退 document.body）。 */
    getPopupContainer?: GetPopupContainer;
    /** 全局表单校验文案覆盖；按 `Form.*` 键返回模板（支持 {label}/{min}/{max} 插值），仅覆盖列出键、其余回退 locale；undefined 继承父级。 */
    getValidateMessages?: GetValidateMessages;
    /** 默认 false：true 时渲染包裹元素（display:contents）建立主题/方向作用域。 */
    wrap?: boolean;
    /** wrap 元素标签，默认 'div'；可设 section/article/main 等语义标签。 */
    as?: string;
    /** theme 变化通知（受控，不回写）；applied 为 auto 解析后实际落地的 light/dark。 */
    onThemeChange?: (info: { theme: ConfigTheme; applied: AppliedTheme }) => void;
    /** reducedMotion 解析结果变化通知（受控，不回写）；reduced=true 表示已降级。 */
    onReducedMotionChange?: (info: { reducedMotion: ReducedMotionInput; reduced: boolean }) => void;
    /** locale 变化通知（受控，不回写）。 */
    onLocaleChange?: (info: { locale: string }) => void;
    /** dir 变化通知（受控，不回写）。 */
    onDirChange?: (info: { dir: ConfigDir }) => void;
    /** 合并后配置变化通知（受控，不回写）。 */
    onConfigChange?: (info: { config: ResolvedConfig }) => void;
    children?: Snippet;
  }

  let {
    locale,
    theme,
    reducedMotion,
    dir,
    size,
    zIndexBase,
    transition,
    getPopupContainer,
    getValidateMessages,
    wrap = false,
    as = 'div',
    onThemeChange,
    onReducedMotionChange,
    onLocaleChange,
    onDirChange,
    onConfigChange,
    children,
  }: Props = $props();

  // 读父级 config（嵌套支持）：init 期调 getContext，无父级用 DEFAULT_CONFIG。
  const parentCfg = getContext<ConfigContextValue | undefined>(CONFIG_CONTEXT_KEY);

  // exactOptionalPropertyTypes：仅塞非 undefined 字段，避免显式 undefined 报错。
  const localInput = $derived.by(() => {
    const o: ConfigInput = {};
    if (theme !== undefined) o.theme = theme;
    if (reducedMotion !== undefined) o.reducedMotion = reducedMotion;
    if (dir !== undefined) o.dir = dir;
    if (size !== undefined) o.size = size;
    if (zIndexBase !== undefined) o.zIndexBase = zIndexBase;
    if (transition !== undefined) o.transition = transition;
    return o;
  });

  // 合并：父级（或默认）+ 本地输入（就近 wins、undefined 继承）。
  const resolved = $derived(mergeConfig(parentCfg?.current ?? DEFAULT_CONFIG, localInput));

  // --- 系统媒体偏好（命令式 matchMedia 监听 + cleanup，红线 #3）---
  // SSR 安全：window 不存在或不支持 matchMedia 时退化为 false（不暗、不降级）。
  const mqlSupported =
    typeof window !== 'undefined' && typeof window.matchMedia === 'function';
  // $state 持有系统偏好快照；监听器命令式写入，$derived 据此纯函数解析。
  let systemPrefersDark = $state(
    mqlSupported && window.matchMedia('(prefers-color-scheme: dark)').matches,
  );
  let systemReducedMotion = $state(
    mqlSupported && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );

  // theme=auto 解析为实际 light/dark（纯函数，红线 #2）。
  const appliedTheme = $derived(resolveAppliedTheme(resolved.theme, systemPrefersDark));
  // reducedMotion 最终是否降级（纯函数，红线 #2）。
  const reduced = $derived(resolveReducedMotion(resolved.reducedMotion, systemReducedMotion));

  // 仅在确有依赖系统态时才挂监听，避免无谓订阅。
  const needsColorScheme = $derived(resolved.theme === 'auto');
  const needsMotionQuery = $derived(resolved.reducedMotion === 'auto');

  // prefers-color-scheme 监听：仅 theme=auto 时订阅，系统切换实时更新（红线 #3）。
  $effect(() => {
    if (!mqlSupported || !needsColorScheme) return;
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    systemPrefersDark = mql.matches;
    const onChange = (e: MediaQueryListEvent): void => {
      systemPrefersDark = e.matches;
    };
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  });

  // prefers-reduced-motion 监听：仅 reducedMotion=auto 时订阅（红线 #3）。
  $effect(() => {
    if (!mqlSupported || !needsMotionQuery) return;
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    systemReducedMotion = mql.matches;
    const onChange = (e: MediaQueryListEvent): void => {
      systemReducedMotion = e.matches;
    };
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  });

  // 全局降级标记：renderless（wrap=false）时命令式写到 documentElement（红线 #3），
  // 令全库 reduced-motion 退化生效；wrap=true 时改写在包裹 div 上（见模板）。
  // 仅显式 reducedMotion 才接管全局标记（'auto' 沿用系统 CSS @media，避免误置）。
  $effect(() => {
    if (wrap || typeof document === 'undefined') return;
    if (resolved.reducedMotion === 'auto') return; // auto 留给原生 @media
    const root = document.documentElement;
    if (reduced) root.setAttribute('data-reduced-motion', '');
    else root.removeAttribute('data-reduced-motion');
    return () => root.removeAttribute('data-reduced-motion');
  });

  // 函数型配置（getPopupContainer/getValidateMessages）不参与 core 的纯配置合并，
  // 在此就近合并：本地提供则 wins，未提供继承父级（红线 #2 派生、不回写 props）。
  const resolvedPopupContainer = $derived(getPopupContainer ?? parentCfg?.getPopupContainer);
  const resolvedValidateMessages = $derived(
    getValidateMessages ?? parentCfg?.getValidateMessages,
  );

  // 注入 config context：getter 保证后代读到最新合并结果。红线：受控不回写 props。
  setContext(CONFIG_CONTEXT_KEY, {
    get current(): ResolvedConfig {
      return resolved;
    },
    get getPopupContainer(): GetPopupContainer | undefined {
      return resolvedPopupContainer;
    },
    get getValidateMessages(): GetValidateMessages | undefined {
      return resolvedValidateMessages;
    },
  } satisfies ConfigContextValue);

  // 注入 locale context（仅当 locale prop 提供时）；direction 跟随合并后的 dir。
  const localeApi = $derived(locale ? createLocale({ locale, direction: resolved.dir }) : null);
  // init 期捕获初始值决定是否注入 locale context（setContext 必须同步执行）；
  // 用 untrack 显式取初始快照，避免 state_referenced_locally 误报。
  const hasLocale = untrack(() => locale !== undefined);
  if (hasLocale) {
    setContext(LOCALE_CONTEXT_KEY, {
      get current(): LocaleApi | null {
        return localeApi;
      },
    });
  }

  // 红线：$effect 只调通知回调，无 DOM/几何。首次也触发可接受。
  $effect(() => {
    onThemeChange?.({ theme: resolved.theme, applied: appliedTheme });
  });
  $effect(() => {
    onReducedMotionChange?.({ reducedMotion: resolved.reducedMotion, reduced });
  });
  $effect(() => {
    onDirChange?.({ dir: resolved.dir });
  });
  $effect(() => {
    onConfigChange?.({ config: resolved });
  });
  $effect(() => {
    if (localeApi) onLocaleChange?.({ locale: localeApi.code });
  });
</script>

{#if wrap}
  <svelte:element
    this={as}
    class="cd-config-provider cd-config-provider--{resolved.size}"
    data-theme={appliedTheme === 'dark' ? 'dark' : undefined}
    data-reduced-motion={resolved.reducedMotion !== 'auto' && reduced ? '' : undefined}
    dir={resolved.dir}
  >
    {@render children?.()}
  </svelte:element>
{:else}
  {@render children?.()}
{/if}

<style>
  .cd-config-provider {
    display: contents;
  }
</style>
