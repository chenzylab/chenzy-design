<!--
  Row — 24 栅格容器，配对 Col。对齐 Semi grid/row：
  gutter 用 screens 状态机做响应式（registerMediaQuery 订阅 6 档 media query，
  getGutter 用 responsiveArray 从大到小降级取第一个命中且有值的断点），
  gutter 负 margin 技术，Col 经 context 读 gutters 施加左右 padding。
  align/justify/wrap 为本库相较 Semi 额外提供的 flex 便捷 prop。
-->
<script lang="ts" module>
  export const ROW_CONTEXT_KEY = Symbol('cd-row');

  export interface RowContext {
    /** [水平, 垂直] 实际 gutter（px），Col 据此施加左右 padding。 */
    getGutters: () => [number, number];
  }
</script>

<script lang="ts">
  import type { Snippet } from 'svelte';
  import { setContext } from 'svelte';
  import {
    registerMediaQuery,
    defaultResponsiveMap,
    EMPTY_SCREENS,
    type Breakpoint,
    type BreakpointScreens,
  } from '@chenzy-design/core';

  type RowAlign = 'top' | 'middle' | 'bottom' | 'baseline' | 'stretch';
  type RowJustify = 'start' | 'end' | 'center' | 'space-between' | 'space-around' | 'space-evenly';
  // 对齐 Semi：单轴 gutter = number | 响应式对象；整体可为 [x轴, y轴]。
  type Gutter = number | Partial<Record<Breakpoint, number>>;

  interface Props {
    gutter?: Gutter | [Gutter, Gutter];
    align?: RowAlign;
    justify?: RowJustify;
    wrap?: boolean;
    class?: string;
    children?: Snippet;
  }

  let {
    gutter = 0,
    align = 'top',
    justify = 'start',
    wrap = true,
    class: className = '',
    children,
  }: Props = $props();

  // 从大到小的降级查找顺序，对齐 Semi responsiveArray。
  const responsiveArray: Breakpoint[] = ['xxl', 'xl', 'lg', 'md', 'sm', 'xs'];

  // 各断点当前命中情况。仅当 gutter 为响应式对象时才需要订阅并更新。
  // 初值全 true，对齐 Semi Row 的 state.screens 初值（未测量前视作全命中）。
  let screens = $state<BreakpointScreens>({
    xs: true,
    sm: true,
    md: true,
    lg: true,
    xl: true,
    xxl: true,
  });

  // 对齐 Semi：gutter 为对象（含数组或响应式对象）时才订阅 media query 更新 screens。
  const isObjectGutter = $derived(typeof gutter === 'object');

  $effect(() => {
    if (!isObjectGutter) return;
    const unregisters = (Object.keys(defaultResponsiveMap) as Breakpoint[]).map((screen) =>
      registerMediaQuery(defaultResponsiveMap[screen], {
        match: () => {
          screens = { ...screens, [screen]: true };
        },
        unmatch: () => {
          screens = { ...screens, [screen]: false };
        },
      }),
    );
    return () => unregisters.forEach((unregister) => unregister());
  });

  // 对齐 Semi getGutter：整体归一为 [x轴, y轴]，每轴若为响应式对象则用 responsiveArray
  // 从大到小找第一个 screens[bp] 命中且该轴在此断点有值的 gutter；否则取数值本身。
  const gutters = $derived.by<[number, number]>(() => {
    const results: [number, number] = [0, 0];
    const normalized: [Gutter, Gutter] = Array.isArray(gutter) ? [gutter[0], gutter[1]] : [gutter, 0];
    normalized.forEach((g, index) => {
      if (typeof g === 'object') {
        for (let i = 0; i < responsiveArray.length; i += 1) {
          const bp = responsiveArray[i]!;
          if (screens[bp] && g[bp] !== undefined) {
            results[index] = g[bp] as number;
            break;
          }
        }
      } else {
        results[index] = g || 0;
      }
    });
    return results;
  });

  const gutterX = $derived(gutters[0]);
  const gutterY = $derived(gutters[1]);

  // Col 读此值施加匹配的左右 padding（对齐 Semi RowContext.gutters）。
  setContext<RowContext>(ROW_CONTEXT_KEY, { getGutters: () => gutters });

  const alignItems = $derived.by(() => {
    switch (align) {
      case 'middle':
        return 'center';
      case 'bottom':
        return 'flex-end';
      case 'baseline':
        return 'baseline';
      case 'stretch':
        return 'stretch';
      default:
        return 'flex-start';
    }
  });

  const justifyContent = $derived.by(() => {
    switch (justify) {
      case 'start':
        return 'flex-start';
      case 'end':
        return 'flex-end';
      case 'center':
        return 'center';
      default:
        return justify;
    }
  });

  const cls = $derived(['cd-row', className].filter(Boolean).join(' '));

  const inlineStyle = $derived(
    [
      `--cd-grid-gutter-x:${gutterX}px`,
      `--cd-grid-gutter-y:${gutterY}px`,
      `align-items:${alignItems}`,
      `justify-content:${justifyContent}`,
      `flex-wrap:${wrap ? 'wrap' : 'nowrap'}`,
    ].join(';'),
  );
</script>

<div class={cls} style={inlineStyle}>
  {@render children?.()}
</div>

<style>
  .cd-row {
    display: flex;
    flex-flow: row wrap;
    min-width: 0;
    margin-inline: calc(var(--cd-grid-gutter-x) / -2);
    row-gap: var(--cd-grid-gutter-y);
  }
</style>
