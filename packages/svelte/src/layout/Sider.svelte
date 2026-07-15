<!--
  Sider — Layout 侧边栏（对齐 Semi）。纯布局容器，不附带背景/尺寸样式，按需自定义。
  挂载时经 context 向 Layout 注册（使 Layout 切换为 row 方向），卸载时注销。
  breakpoint：可传 responsiveMap 的键数组（xs/sm/md/lg/xl/xxl），命中/解除断点时回调 onBreakpoint。
  DOM 结构：<aside class="cd-layout-sider"><div class="cd-layout-sider-children">…</div></aside>
-->
<script lang="ts" module>
  /** 六档响应断点（对齐 Semi）。注意 xs 为 max-width，其余为 min-width。 */
  export const responsiveMap = {
    xs: '(max-width: 575px)',
    sm: '(min-width: 576px)',
    md: '(min-width: 768px)',
    lg: '(min-width: 992px)',
    xl: '(min-width: 1200px)',
    xxl: '(min-width: 1600px)',
  } as const;

  export type Breakpoint = keyof typeof responsiveMap;

  let uid = 0;

  /** 注册一个 media query，命中/解除时回调（对齐 Semi registerMediaQuery，callInInit=true）。 */
  function registerMediaQuery(
    media: string,
    match: () => void,
    unmatch: () => void,
  ): () => void {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return () => undefined;
    }
    const mql = window.matchMedia(media);
    const handler = (e: MediaQueryList | MediaQueryListEvent): void => {
      if (e.matches) match();
      else unmatch();
    };
    handler(mql);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }
</script>

<script lang="ts">
  import type { Snippet } from 'svelte';
  import { getContext, onMount } from 'svelte';
  import { LAYOUT_CONTEXT_KEY, type LayoutContext } from './Layout.svelte';

  interface Props {
    /** 触发响应式布局的断点，可选值 xs/sm/md/lg/xl/xxl。 */
    breakpoint?: Breakpoint[];
    /** 触发响应式布局断点时的回调 (screen, matched)。 */
    onBreakpoint?: (screen: Breakpoint, matched: boolean) => void;
    class?: string;
    /** 根元素自定义内联样式（透传）。 */
    style?: string;
    /** 可访问性标签（透传到 aside 的 aria-label，描述该 Sider 作用）。 */
    ariaLabel?: string;
    /** 可访问性 role（透传到根元素）。 */
    role?: string;
    children?: Snippet;
  }

  let {
    breakpoint,
    onBreakpoint,
    class: className = '',
    style,
    ariaLabel,
    role,
    children,
  }: Props = $props();

  const layout = getContext<LayoutContext | undefined>(LAYOUT_CONTEXT_KEY);

  // eslint-disable-next-line no-plusplus
  const uniqueId = `cd-layout-sider-${++uid}`;

  onMount(() => {
    layout?.addSider(uniqueId);

    const bpts = (breakpoint ?? []).filter((s): s is Breakpoint => s in responsiveMap);
    const unregisters = bpts.map((screen) =>
      registerMediaQuery(
        responsiveMap[screen],
        () => onBreakpoint?.(screen, true),
        () => onBreakpoint?.(screen, false),
      ),
    );

    return () => {
      unregisters.forEach((un) => un());
      layout?.removeSider(uniqueId);
    };
  });

  const cls = $derived(['cd-layout-sider', className].filter(Boolean).join(' '));
</script>

<aside class={cls} {style} aria-label={ariaLabel} {role}>
  <div class="cd-layout-sider-children">
    {@render children?.()}
  </div>
</aside>

<style>
  .cd-layout-sider {
    position: relative;
    min-width: auto;
    box-sizing: border-box;
  }
  .cd-layout-sider-children {
    height: 100%;
    /* 对齐 Semi：抵消子内容 margin 折叠导致的高度偏差。 */
    margin-top: -0.1px;
    padding-top: 0.1px;
    box-sizing: border-box;
  }
</style>
