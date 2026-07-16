<!--
  Layout — 布局容器（对齐 Semi）。默认 column 方向；存在 Sider 时切换为 row。
  纯布局容器：不附带背景色、文本色、宽高等样式，按需通过 style / class 自定义。
  Sider 自动检测：Sider 挂载时经 context 注册，翻转方向为 row；显式 hasSider 始终优先。
  注意：子组件 onMount 在父之后执行，SSR/首帧可能先 column 再切 row；
  SSR 正确性请显式传 hasSider。
-->
<script lang="ts" module>
  export const LAYOUT_CONTEXT_KEY = Symbol('cd-layout');

  export interface LayoutContext {
    addSider: (id: string) => void;
    removeSider: (id: string) => void;
  }
</script>

<script lang="ts">
  import type { Snippet } from 'svelte';
  import { setContext } from 'svelte';
  import { SvelteSet } from 'svelte/reactivity';

  interface Props {
    /** 显式声明含侧边栏 → row 方向；一般不用指定，可用于 SSR 避免样式闪动。 */
    hasSider?: boolean;
    class?: string;
    /** 根元素自定义内联样式（透传）。Layout 不附带背景/尺寸样式，按需自定义。 */
    style?: string;
    /** 可访问性标签（透传到根元素 aria-label）。 */
    ariaLabel?: string;
    /** 可访问性 role（透传到根元素，覆盖默认语义）。 */
    role?: string;
    children?: Snippet;
  }

  let {
    hasSider,
    class: className = '',
    style,
    ariaLabel,
    role,
    children,
  }: Props = $props();

  // 已注册的 Sider id 集合，对齐 Semi 的 siders 数组。
  // SvelteSet：普通 Set 的 .add()/.delete() 不触发 Svelte 5 响应式，siders.size 派生不更新
  // 会导致 has-sider class 加不上、Sider 方向不翻转（真机才暴露）。
  const siders = new SvelteSet<string>();

  setContext<LayoutContext>(LAYOUT_CONTEXT_KEY, {
    addSider: (id) => siders.add(id),
    removeSider: (id) => siders.delete(id),
  });

  const isRow = $derived(typeof hasSider === 'boolean' ? hasSider : siders.size > 0);

  const cls = $derived(
    ['cd-layout', isRow && 'cd-layout-has-sider', className].filter(Boolean).join(' '),
  );
</script>

<section class={cls} {style} aria-label={ariaLabel} {role}>
  {@render children?.()}
</section>

<style>
  .cd-layout {
    display: flex;
    flex: auto;
    flex-direction: column;
    min-height: auto;
    box-sizing: border-box;
  }
  .cd-layout-has-sider {
    flex-direction: row;
  }
  /* 内层 Layout / Content 在 has-sider 行内裁掉横向溢出（对齐 Semi）。 */
  .cd-layout-has-sider > :global(.cd-layout),
  .cd-layout-has-sider > :global(.cd-layout-content) {
    overflow-x: hidden;
  }
  /* RTL */
  :global(.cd-rtl) .cd-layout,
  :global(.cd-portal-rtl) .cd-layout {
    direction: rtl;
  }
</style>
