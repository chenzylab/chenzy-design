<!--
  Row — 24 栅格容器，配对 Col。严格对齐 Semi grid/row（float 机制 + type prop）：
  - type='flex' → cd-row-flex（display:flex）+ justify/align 类；缺省 → cd-row（display:block + float 清除浮动）。
  - gutter 用 screens 状态机做响应式（registerMediaQuery 订阅 6 档 media query，
    getGutter 用 responsiveArray 从大到小降级取第一个命中且有值的断点）。
  - gutter 走 Semi 真实四向负 margin：水平 marginLeft/Right、垂直 marginTop/Bottom，
    Col 经 context 读 gutters 施加对应四向 padding 抵消。
-->
<script lang="ts" module>
  export const ROW_CONTEXT_KEY = Symbol('cd-row');

  export interface RowContext {
    /** [水平, 垂直] 实际 gutter（px），Col 据此施加四向 padding。 */
    getGutters: () => [number, number];
  }
</script>

<script lang="ts">
  import type { Snippet } from 'svelte';
  import { setContext } from 'svelte';
  import {
    registerMediaQuery,
    defaultResponsiveMap,
    type Breakpoint,
    type BreakpointScreens,
  } from '@chenzy-design/core';

  type RowAlign = 'top' | 'middle' | 'bottom';
  type RowJustify = 'start' | 'end' | 'center' | 'space-between' | 'space-around';
  // 对齐 Semi：单轴 gutter = number | 响应式对象；整体可为 [x轴, y轴]。
  type Gutter = number | Partial<Record<Breakpoint, number>>;

  interface Props {
    /** 布局模式；'flex' 时启用 flex 布局并激活 justify/align。 */
    type?: 'flex';
    align?: RowAlign;
    justify?: RowJustify;
    gutter?: Gutter | [Gutter, Gutter];
    class?: string;
    style?: string;
    children?: Snippet;
  }

  let {
    type,
    align,
    justify = 'start',
    gutter = 0,
    class: className = '',
    style = '',
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
    // 逐键 mutate（screens[bp] = …）而非 spread 整体重建：registerMediaQuery 的 callInInit
    // 会在本 effect 同步执行期内立即回调 match/unmatch，若读取整个 screens 再写回会让 effect
    // 读写同一状态，触发 Svelte effect_update_depth_exceeded 无限循环。单键写不读整体，切断自依赖。
    const unregisters = (Object.keys(defaultResponsiveMap) as Breakpoint[]).map((screen) =>
      registerMediaQuery(defaultResponsiveMap[screen], {
        match: () => {
          screens[screen] = true;
        },
        unmatch: () => {
          screens[screen] = false;
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

  // Col 读此值施加匹配的四向 padding（对齐 Semi RowContext.gutters）。
  setContext<RowContext>(ROW_CONTEXT_KEY, { getGutters: () => gutters });

  // class 三段式对齐 Semi row.tsx classnames：
  //  type !== 'flex' → cd-row（基础）；type → cd-row-{type}；type && justify/align → cd-row-{type}-{justify}/-{align}。
  const cls = $derived(
    [
      type !== 'flex' && 'cd-row',
      type && `cd-row-${type}`,
      type && justify && `cd-row-${type}-${justify}`,
      type && align && `cd-row-${type}-${align}`,
      className,
    ]
      .filter(Boolean)
      .join(' '),
  );

  // gutter 内联样式对齐 Semi rowStyle：x轴负左右 margin、y轴负上下 margin；用户 style 追加在后可覆盖。
  const inlineStyle = $derived(
    [
      gutters[0] > 0 && `margin-left:${gutters[0] / -2}px;margin-right:${gutters[0] / -2}px`,
      gutters[1] > 0 && `margin-top:${gutters[1] / -2}px;margin-bottom:${gutters[1] / -2}px`,
      style,
    ]
      .filter(Boolean)
      .join(';'),
  );
</script>

<div class={cls} style={inlineStyle}>
  {@render children?.()}
</div>

<style>
  /* 严格镜像 Semi grid.scss。动态类名靠 :global 落地（Svelte 不静态收集拼接类名）。 */

  /* .cd-row：display:block + make-row（position:relative;height:auto;margin:0）+ clearfix。 */
  :global(.cd-row) {
    display: block;
    box-sizing: border-box;
    position: relative;
    height: auto;
    margin-right: 0;
    margin-left: 0;
  }
  :global(.cd-row)::before,
  :global(.cd-row)::after {
    display: table;
    content: '';
  }
  :global(.cd-row)::after {
    clear: both;
  }

  /* .cd-row-flex：display:flex + flex-flow:row wrap；伪元素改 display:flex。 */
  :global(.cd-row-flex) {
    display: flex;
    flex-flow: row wrap;
  }
  :global(.cd-row-flex)::before,
  :global(.cd-row-flex)::after {
    display: flex;
  }

  /* justify（x 轴）对齐 Semi。 */
  :global(.cd-row-flex-start) {
    justify-content: flex-start;
  }
  :global(.cd-row-flex-center) {
    justify-content: center;
  }
  :global(.cd-row-flex-end) {
    justify-content: flex-end;
  }
  :global(.cd-row-flex-space-between) {
    justify-content: space-between;
  }
  :global(.cd-row-flex-space-around) {
    justify-content: space-around;
  }

  /* align（y 轴）对齐 Semi。 */
  :global(.cd-row-flex-top) {
    align-items: flex-start;
  }
  :global(.cd-row-flex-middle) {
    align-items: center;
  }
  :global(.cd-row-flex-bottom) {
    align-items: flex-end;
  }
</style>
