<script lang="ts">
  import { getContext, setContext, untrack } from 'svelte';
  import type { Snippet } from 'svelte';
  import {
    mergeConfig,
    DEFAULT_CONFIG,
    type ConfigInput,
    type ResolvedConfig,
    type ConfigTheme,
    type ConfigDir,
    type ConfigSize,
  } from '@chenzy-design/core';
  import { createLocale, type LocaleApi } from '@chenzy-design/locale';
  import type { Locale } from '@chenzy-design/locale';
  import { LOCALE_CONTEXT_KEY } from '../locale-provider/context.js';
  import { CONFIG_CONTEXT_KEY, type ConfigContextValue } from './context.js';

  interface Props {
    /** 语言包；提供则注入 locale context（复用 LocaleProvider 机制），未提供沿用上层。 */
    locale?: Locale;
    /** 主题，undefined 继承父级；dark 在 wrap 根写 data-theme 触发暗色调色板。 */
    theme?: ConfigTheme;
    /** 文本方向，undefined 继承父级。 */
    dir?: ConfigDir;
    /** 默认尺寸，undefined 继承父级。 */
    size?: ConfigSize;
    /** 浮层 z-index 基线，undefined 继承父级。 */
    zIndexBase?: number;
    /** 是否启用过渡动画，undefined 继承父级。 */
    transition?: boolean;
    /** 默认 false：true 时渲染包裹 div（display:contents）建立主题/方向作用域。 */
    wrap?: boolean;
    /** wrap 元素标签，默认 'div'（本子集固定 div，as 标 TODO）。 */
    as?: string;
    /** theme 变化通知（受控，不回写）。 */
    onThemeChange?: (info: { theme: ConfigTheme }) => void;
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
    dir,
    size,
    zIndexBase,
    transition,
    wrap = false,
    // `as` 本子集固定 div（TODO 自定义标签），声明于 Props 但不解构以免未用绑定。
    onThemeChange,
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
    if (dir !== undefined) o.dir = dir;
    if (size !== undefined) o.size = size;
    if (zIndexBase !== undefined) o.zIndexBase = zIndexBase;
    if (transition !== undefined) o.transition = transition;
    return o;
  });

  // 合并：父级（或默认）+ 本地输入（就近 wins、undefined 继承）。
  const resolved = $derived(mergeConfig(parentCfg?.current ?? DEFAULT_CONFIG, localInput));

  // 注入 config context：getter 保证后代读到最新合并结果。红线：受控不回写 props。
  setContext(CONFIG_CONTEXT_KEY, {
    get current(): ResolvedConfig {
      return resolved;
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
    onThemeChange?.({ theme: resolved.theme });
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
  <div
    class="cd-config-provider cd-config-provider--{resolved.size}"
    data-theme={resolved.theme === 'dark' ? 'dark' : undefined}
    dir={resolved.dir}
  >
    {@render children?.()}
  </div>
{:else}
  {@render children?.()}
{/if}

<style>
  .cd-config-provider {
    display: contents;
  }
</style>
