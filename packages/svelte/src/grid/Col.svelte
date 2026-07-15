<!--
  Col — Row 的子列，24 栅格。对齐 Semi grid/col：
  响应式为纯 CSS 类驱动（cd-col-{span}、cd-col-{bp}-{span}、offset/push/pull/order
  各基础类 + 断点类），断点样式由 @media (min-width) 层叠，不读 JS 断点。
  span=0 / {bp}-0 靠 cd-col-0 / cd-col-{bp}-0 的 display:none 隐藏。
  仍从 Row context 读 gutters 施加左右 padding。flex 为本库相较 Semi 额外的便捷 prop。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { getContext } from 'svelte';
  import { ROW_CONTEXT_KEY, type RowContext } from './Row.svelte';

  type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';

  type ColConfig = {
    span?: number;
    order?: number;
    offset?: number;
    push?: number;
    pull?: number;
  };
  type ColResponsive = number | ColConfig;

  interface Props {
    /** 0-24；0 隐藏该列 */
    span?: number;
    offset?: number;
    order?: number;
    push?: number;
    pull?: number;
    /** 设置后优先于 span，直接控制 flex（本库相较 Semi 额外提供） */
    flex?: string | number;
    xs?: ColResponsive;
    sm?: ColResponsive;
    md?: ColResponsive;
    lg?: ColResponsive;
    xl?: ColResponsive;
    xxl?: ColResponsive;
    class?: string;
    children?: Snippet;
  }

  let {
    span,
    offset = 0,
    order = 0,
    push = 0,
    pull = 0,
    flex,
    xs,
    sm,
    md,
    lg,
    xl,
    xxl,
    class: className = '',
    children,
  }: Props = $props();

  const context = getContext<RowContext>(ROW_CONTEXT_KEY);
  if (!context) {
    throw new Error('please make sure <Col> inside <Row>');
  }

  const PREFIX = 'cd-col';
  const SIZES: Breakpoint[] = ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'];

  // 对齐 Semi col.tsx 的 classnames 逻辑：断点 props 归一为 ColConfig，逐字段
  // 按 Semi 的真值条件（span 用 !== undefined，其余用 v || v === 0）生成类。
  const classes = $derived.by(() => {
    const list: string[] = [PREFIX];

    // 基础层：对齐 Semi 基础类真值条件（order/offset/push/pull 用 truthy，
    // 即 0 不生成基础类；span 用 !== undefined，故 span=0 会生成 cd-col-0）。
    if (span !== undefined) list.push(`${PREFIX}-${span}`);
    if (order) list.push(`${PREFIX}-order-${order}`);
    if (offset) list.push(`${PREFIX}-offset-${offset}`);
    if (push) list.push(`${PREFIX}-push-${push}`);
    if (pull) list.push(`${PREFIX}-pull-${pull}`);

    // 断点层：数值 → span；对象 → 子集。真值条件对齐 Semi sizeClassObj。
    const byBp: Record<Breakpoint, ColResponsive | undefined> = { xs, sm, md, lg, xl, xxl };
    for (const size of SIZES) {
      const raw = byBp[size];
      if (raw === undefined) continue;
      const cfg: ColConfig = typeof raw === 'number' ? { span: raw } : raw;
      if (cfg.span !== undefined) list.push(`${PREFIX}-${size}-${cfg.span}`);
      if (cfg.order || cfg.order === 0) list.push(`${PREFIX}-${size}-order-${cfg.order}`);
      if (cfg.offset || cfg.offset === 0) list.push(`${PREFIX}-${size}-offset-${cfg.offset}`);
      if (cfg.push || cfg.push === 0) list.push(`${PREFIX}-${size}-push-${cfg.push}`);
      if (cfg.pull || cfg.pull === 0) list.push(`${PREFIX}-${size}-pull-${cfg.pull}`);
    }

    if (className) list.push(className);
    return list.join(' ');
  });

  // gutter 经 context 施加左右 padding（对齐 Semi Col 从 RowContext.gutters 取 padding）。
  const gutterX = $derived(context.getGutters()[0]);

  // flex 为本库额外能力：设置后以内联样式直接控制 flex（优先于 span 类）。
  const flexStyle = $derived.by(() => {
    if (flex === undefined) return '';
    const value = typeof flex === 'number' ? `${flex} ${flex} auto` : flex;
    return `flex:${value}`;
  });

  const inlineStyle = $derived(
    [gutterX > 0 && `padding-inline:${gutterX / 2}px`, flexStyle]
      .filter(Boolean)
      .join(';'),
  );
</script>

<div class={classes} style={inlineStyle}>
  {@render children?.()}
</div>

<style>
  /* 纯 CSS 类驱动的 24×6 栅格，忠实镜像 Semi grid.scss 的百分比与断点值。
     本库用 flex-basis 百分比（非 float），故基础 cd-col 走 flex 布局。
     动态类名靠 :global 落地（Svelte 不会静态收集拼接出的类名）。 */

  /* base col：position:relative 供 push/pull 的 inset 定位；box-sizing 让
     gutter padding 计入 flex-basis 百分比，避免溢出换行。 */
  :global(.cd-col) {
    position: relative;
    min-width: 0;
    box-sizing: border-box;
  }

  /* span=0 / 各断点 span=0 → display:none（对齐 Semi .cd-col-0 等）。 */
  :global(.cd-col-0),
  :global(.cd-col-xs-0),
  :global(.cd-col-sm-0),
  :global(.cd-col-md-0),
  :global(.cd-col-lg-0),
  :global(.cd-col-xl-0),
  :global(.cd-col-xxl-0) {
    display: none;
  }

  /* --- 基础层 col-1..24 + offset/push/pull/order（无媒体查询，含 xs 语义）--- */
  /* span N：flex-basis 百分比 + max-width 夹紧，等价 Semi width 百分比。 */
  :global(.cd-col-1) { flex: 0 0 4.16666667%; max-width: 4.16666667%; }
  :global(.cd-col-2) { flex: 0 0 8.33333333%; max-width: 8.33333333%; }
  :global(.cd-col-3) { flex: 0 0 12.5%; max-width: 12.5%; }
  :global(.cd-col-4) { flex: 0 0 16.66666667%; max-width: 16.66666667%; }
  :global(.cd-col-5) { flex: 0 0 20.83333333%; max-width: 20.83333333%; }
  :global(.cd-col-6) { flex: 0 0 25%; max-width: 25%; }
  :global(.cd-col-7) { flex: 0 0 29.16666667%; max-width: 29.16666667%; }
  :global(.cd-col-8) { flex: 0 0 33.33333333%; max-width: 33.33333333%; }
  :global(.cd-col-9) { flex: 0 0 37.5%; max-width: 37.5%; }
  :global(.cd-col-10) { flex: 0 0 41.66666667%; max-width: 41.66666667%; }
  :global(.cd-col-11) { flex: 0 0 45.83333333%; max-width: 45.83333333%; }
  :global(.cd-col-12) { flex: 0 0 50%; max-width: 50%; }
  :global(.cd-col-13) { flex: 0 0 54.16666667%; max-width: 54.16666667%; }
  :global(.cd-col-14) { flex: 0 0 58.33333333%; max-width: 58.33333333%; }
  :global(.cd-col-15) { flex: 0 0 62.5%; max-width: 62.5%; }
  :global(.cd-col-16) { flex: 0 0 66.66666667%; max-width: 66.66666667%; }
  :global(.cd-col-17) { flex: 0 0 70.83333333%; max-width: 70.83333333%; }
  :global(.cd-col-18) { flex: 0 0 75%; max-width: 75%; }
  :global(.cd-col-19) { flex: 0 0 79.16666667%; max-width: 79.16666667%; }
  :global(.cd-col-20) { flex: 0 0 83.33333333%; max-width: 83.33333333%; }
  :global(.cd-col-21) { flex: 0 0 87.5%; max-width: 87.5%; }
  :global(.cd-col-22) { flex: 0 0 91.66666667%; max-width: 91.66666667%; }
  :global(.cd-col-23) { flex: 0 0 95.83333333%; max-width: 95.83333333%; }
  :global(.cd-col-24) { flex: 0 0 100%; max-width: 100%; }

  :global(.cd-col-push-1) { inset-inline-start: 4.16666667%; }
  :global(.cd-col-push-2) { inset-inline-start: 8.33333333%; }
  :global(.cd-col-push-3) { inset-inline-start: 12.5%; }
  :global(.cd-col-push-4) { inset-inline-start: 16.66666667%; }
  :global(.cd-col-push-5) { inset-inline-start: 20.83333333%; }
  :global(.cd-col-push-6) { inset-inline-start: 25%; }
  :global(.cd-col-push-7) { inset-inline-start: 29.16666667%; }
  :global(.cd-col-push-8) { inset-inline-start: 33.33333333%; }
  :global(.cd-col-push-9) { inset-inline-start: 37.5%; }
  :global(.cd-col-push-10) { inset-inline-start: 41.66666667%; }
  :global(.cd-col-push-11) { inset-inline-start: 45.83333333%; }
  :global(.cd-col-push-12) { inset-inline-start: 50%; }
  :global(.cd-col-push-13) { inset-inline-start: 54.16666667%; }
  :global(.cd-col-push-14) { inset-inline-start: 58.33333333%; }
  :global(.cd-col-push-15) { inset-inline-start: 62.5%; }
  :global(.cd-col-push-16) { inset-inline-start: 66.66666667%; }
  :global(.cd-col-push-17) { inset-inline-start: 70.83333333%; }
  :global(.cd-col-push-18) { inset-inline-start: 75%; }
  :global(.cd-col-push-19) { inset-inline-start: 79.16666667%; }
  :global(.cd-col-push-20) { inset-inline-start: 83.33333333%; }
  :global(.cd-col-push-21) { inset-inline-start: 87.5%; }
  :global(.cd-col-push-22) { inset-inline-start: 91.66666667%; }
  :global(.cd-col-push-23) { inset-inline-start: 95.83333333%; }
  :global(.cd-col-push-24) { inset-inline-start: 100%; }

  :global(.cd-col-pull-1) { inset-inline-end: 4.16666667%; }
  :global(.cd-col-pull-2) { inset-inline-end: 8.33333333%; }
  :global(.cd-col-pull-3) { inset-inline-end: 12.5%; }
  :global(.cd-col-pull-4) { inset-inline-end: 16.66666667%; }
  :global(.cd-col-pull-5) { inset-inline-end: 20.83333333%; }
  :global(.cd-col-pull-6) { inset-inline-end: 25%; }
  :global(.cd-col-pull-7) { inset-inline-end: 29.16666667%; }
  :global(.cd-col-pull-8) { inset-inline-end: 33.33333333%; }
  :global(.cd-col-pull-9) { inset-inline-end: 37.5%; }
  :global(.cd-col-pull-10) { inset-inline-end: 41.66666667%; }
  :global(.cd-col-pull-11) { inset-inline-end: 45.83333333%; }
  :global(.cd-col-pull-12) { inset-inline-end: 50%; }
  :global(.cd-col-pull-13) { inset-inline-end: 54.16666667%; }
  :global(.cd-col-pull-14) { inset-inline-end: 58.33333333%; }
  :global(.cd-col-pull-15) { inset-inline-end: 62.5%; }
  :global(.cd-col-pull-16) { inset-inline-end: 66.66666667%; }
  :global(.cd-col-pull-17) { inset-inline-end: 70.83333333%; }
  :global(.cd-col-pull-18) { inset-inline-end: 75%; }
  :global(.cd-col-pull-19) { inset-inline-end: 79.16666667%; }
  :global(.cd-col-pull-20) { inset-inline-end: 83.33333333%; }
  :global(.cd-col-pull-21) { inset-inline-end: 87.5%; }
  :global(.cd-col-pull-22) { inset-inline-end: 91.66666667%; }
  :global(.cd-col-pull-23) { inset-inline-end: 95.83333333%; }
  :global(.cd-col-pull-24) { inset-inline-end: 100%; }

  :global(.cd-col-offset-1) { margin-inline-start: 4.16666667%; }
  :global(.cd-col-offset-2) { margin-inline-start: 8.33333333%; }
  :global(.cd-col-offset-3) { margin-inline-start: 12.5%; }
  :global(.cd-col-offset-4) { margin-inline-start: 16.66666667%; }
  :global(.cd-col-offset-5) { margin-inline-start: 20.83333333%; }
  :global(.cd-col-offset-6) { margin-inline-start: 25%; }
  :global(.cd-col-offset-7) { margin-inline-start: 29.16666667%; }
  :global(.cd-col-offset-8) { margin-inline-start: 33.33333333%; }
  :global(.cd-col-offset-9) { margin-inline-start: 37.5%; }
  :global(.cd-col-offset-10) { margin-inline-start: 41.66666667%; }
  :global(.cd-col-offset-11) { margin-inline-start: 45.83333333%; }
  :global(.cd-col-offset-12) { margin-inline-start: 50%; }
  :global(.cd-col-offset-13) { margin-inline-start: 54.16666667%; }
  :global(.cd-col-offset-14) { margin-inline-start: 58.33333333%; }
  :global(.cd-col-offset-15) { margin-inline-start: 62.5%; }
  :global(.cd-col-offset-16) { margin-inline-start: 66.66666667%; }
  :global(.cd-col-offset-17) { margin-inline-start: 70.83333333%; }
  :global(.cd-col-offset-18) { margin-inline-start: 75%; }
  :global(.cd-col-offset-19) { margin-inline-start: 79.16666667%; }
  :global(.cd-col-offset-20) { margin-inline-start: 83.33333333%; }
  :global(.cd-col-offset-21) { margin-inline-start: 87.5%; }
  :global(.cd-col-offset-22) { margin-inline-start: 91.66666667%; }
  :global(.cd-col-offset-23) { margin-inline-start: 95.83333333%; }
  :global(.cd-col-offset-24) { margin-inline-start: 100%; }

  :global(.cd-col-order-1) { order: 1; }
  :global(.cd-col-order-2) { order: 2; }
  :global(.cd-col-order-3) { order: 3; }
  :global(.cd-col-order-4) { order: 4; }
  :global(.cd-col-order-5) { order: 5; }
  :global(.cd-col-order-6) { order: 6; }
  :global(.cd-col-order-7) { order: 7; }
  :global(.cd-col-order-8) { order: 8; }
  :global(.cd-col-order-9) { order: 9; }
  :global(.cd-col-order-10) { order: 10; }
  :global(.cd-col-order-11) { order: 11; }
  :global(.cd-col-order-12) { order: 12; }
  :global(.cd-col-order-13) { order: 13; }
  :global(.cd-col-order-14) { order: 14; }
  :global(.cd-col-order-15) { order: 15; }
  :global(.cd-col-order-16) { order: 16; }
  :global(.cd-col-order-17) { order: 17; }
  :global(.cd-col-order-18) { order: 18; }
  :global(.cd-col-order-19) { order: 19; }
  :global(.cd-col-order-20) { order: 20; }
  :global(.cd-col-order-21) { order: 21; }
  :global(.cd-col-order-22) { order: 22; }
  :global(.cd-col-order-23) { order: 23; }
  :global(.cd-col-order-24) { order: 24; }

  /* --- 断点层：sm/md/lg/xl/xxl 各包在 @media (min-width) 内，源码顺序层叠 --- */
  /* xs 无媒体查询（属基础层语义）：cd-col-xs-N 等直接生效，与基础类同层。 */
  :global(.cd-col-xs-1) { flex: 0 0 4.16666667%; max-width: 4.16666667%; }
  :global(.cd-col-xs-2) { flex: 0 0 8.33333333%; max-width: 8.33333333%; }
  :global(.cd-col-xs-3) { flex: 0 0 12.5%; max-width: 12.5%; }
  :global(.cd-col-xs-4) { flex: 0 0 16.66666667%; max-width: 16.66666667%; }
  :global(.cd-col-xs-5) { flex: 0 0 20.83333333%; max-width: 20.83333333%; }
  :global(.cd-col-xs-6) { flex: 0 0 25%; max-width: 25%; }
  :global(.cd-col-xs-7) { flex: 0 0 29.16666667%; max-width: 29.16666667%; }
  :global(.cd-col-xs-8) { flex: 0 0 33.33333333%; max-width: 33.33333333%; }
  :global(.cd-col-xs-9) { flex: 0 0 37.5%; max-width: 37.5%; }
  :global(.cd-col-xs-10) { flex: 0 0 41.66666667%; max-width: 41.66666667%; }
  :global(.cd-col-xs-11) { flex: 0 0 45.83333333%; max-width: 45.83333333%; }
  :global(.cd-col-xs-12) { flex: 0 0 50%; max-width: 50%; }
  :global(.cd-col-xs-13) { flex: 0 0 54.16666667%; max-width: 54.16666667%; }
  :global(.cd-col-xs-14) { flex: 0 0 58.33333333%; max-width: 58.33333333%; }
  :global(.cd-col-xs-15) { flex: 0 0 62.5%; max-width: 62.5%; }
  :global(.cd-col-xs-16) { flex: 0 0 66.66666667%; max-width: 66.66666667%; }
  :global(.cd-col-xs-17) { flex: 0 0 70.83333333%; max-width: 70.83333333%; }
  :global(.cd-col-xs-18) { flex: 0 0 75%; max-width: 75%; }
  :global(.cd-col-xs-19) { flex: 0 0 79.16666667%; max-width: 79.16666667%; }
  :global(.cd-col-xs-20) { flex: 0 0 83.33333333%; max-width: 83.33333333%; }
  :global(.cd-col-xs-21) { flex: 0 0 87.5%; max-width: 87.5%; }
  :global(.cd-col-xs-22) { flex: 0 0 91.66666667%; max-width: 91.66666667%; }
  :global(.cd-col-xs-23) { flex: 0 0 95.83333333%; max-width: 95.83333333%; }
  :global(.cd-col-xs-24) { flex: 0 0 100%; max-width: 100%; }
  :global(.cd-col-xs-push-1) { inset-inline-start: 4.16666667%; }
  :global(.cd-col-xs-push-2) { inset-inline-start: 8.33333333%; }
  :global(.cd-col-xs-push-3) { inset-inline-start: 12.5%; }
  :global(.cd-col-xs-push-4) { inset-inline-start: 16.66666667%; }
  :global(.cd-col-xs-push-5) { inset-inline-start: 20.83333333%; }
  :global(.cd-col-xs-push-6) { inset-inline-start: 25%; }
  :global(.cd-col-xs-push-7) { inset-inline-start: 29.16666667%; }
  :global(.cd-col-xs-push-8) { inset-inline-start: 33.33333333%; }
  :global(.cd-col-xs-push-9) { inset-inline-start: 37.5%; }
  :global(.cd-col-xs-push-10) { inset-inline-start: 41.66666667%; }
  :global(.cd-col-xs-push-11) { inset-inline-start: 45.83333333%; }
  :global(.cd-col-xs-push-12) { inset-inline-start: 50%; }
  :global(.cd-col-xs-push-13) { inset-inline-start: 54.16666667%; }
  :global(.cd-col-xs-push-14) { inset-inline-start: 58.33333333%; }
  :global(.cd-col-xs-push-15) { inset-inline-start: 62.5%; }
  :global(.cd-col-xs-push-16) { inset-inline-start: 66.66666667%; }
  :global(.cd-col-xs-push-17) { inset-inline-start: 70.83333333%; }
  :global(.cd-col-xs-push-18) { inset-inline-start: 75%; }
  :global(.cd-col-xs-push-19) { inset-inline-start: 79.16666667%; }
  :global(.cd-col-xs-push-20) { inset-inline-start: 83.33333333%; }
  :global(.cd-col-xs-push-21) { inset-inline-start: 87.5%; }
  :global(.cd-col-xs-push-22) { inset-inline-start: 91.66666667%; }
  :global(.cd-col-xs-push-23) { inset-inline-start: 95.83333333%; }
  :global(.cd-col-xs-push-24) { inset-inline-start: 100%; }
  :global(.cd-col-xs-pull-1) { inset-inline-end: 4.16666667%; }
  :global(.cd-col-xs-pull-2) { inset-inline-end: 8.33333333%; }
  :global(.cd-col-xs-pull-3) { inset-inline-end: 12.5%; }
  :global(.cd-col-xs-pull-4) { inset-inline-end: 16.66666667%; }
  :global(.cd-col-xs-pull-5) { inset-inline-end: 20.83333333%; }
  :global(.cd-col-xs-pull-6) { inset-inline-end: 25%; }
  :global(.cd-col-xs-pull-7) { inset-inline-end: 29.16666667%; }
  :global(.cd-col-xs-pull-8) { inset-inline-end: 33.33333333%; }
  :global(.cd-col-xs-pull-9) { inset-inline-end: 37.5%; }
  :global(.cd-col-xs-pull-10) { inset-inline-end: 41.66666667%; }
  :global(.cd-col-xs-pull-11) { inset-inline-end: 45.83333333%; }
  :global(.cd-col-xs-pull-12) { inset-inline-end: 50%; }
  :global(.cd-col-xs-pull-13) { inset-inline-end: 54.16666667%; }
  :global(.cd-col-xs-pull-14) { inset-inline-end: 58.33333333%; }
  :global(.cd-col-xs-pull-15) { inset-inline-end: 62.5%; }
  :global(.cd-col-xs-pull-16) { inset-inline-end: 66.66666667%; }
  :global(.cd-col-xs-pull-17) { inset-inline-end: 70.83333333%; }
  :global(.cd-col-xs-pull-18) { inset-inline-end: 75%; }
  :global(.cd-col-xs-pull-19) { inset-inline-end: 79.16666667%; }
  :global(.cd-col-xs-pull-20) { inset-inline-end: 83.33333333%; }
  :global(.cd-col-xs-pull-21) { inset-inline-end: 87.5%; }
  :global(.cd-col-xs-pull-22) { inset-inline-end: 91.66666667%; }
  :global(.cd-col-xs-pull-23) { inset-inline-end: 95.83333333%; }
  :global(.cd-col-xs-pull-24) { inset-inline-end: 100%; }
  :global(.cd-col-xs-offset-1) { margin-inline-start: 4.16666667%; }
  :global(.cd-col-xs-offset-2) { margin-inline-start: 8.33333333%; }
  :global(.cd-col-xs-offset-3) { margin-inline-start: 12.5%; }
  :global(.cd-col-xs-offset-4) { margin-inline-start: 16.66666667%; }
  :global(.cd-col-xs-offset-5) { margin-inline-start: 20.83333333%; }
  :global(.cd-col-xs-offset-6) { margin-inline-start: 25%; }
  :global(.cd-col-xs-offset-7) { margin-inline-start: 29.16666667%; }
  :global(.cd-col-xs-offset-8) { margin-inline-start: 33.33333333%; }
  :global(.cd-col-xs-offset-9) { margin-inline-start: 37.5%; }
  :global(.cd-col-xs-offset-10) { margin-inline-start: 41.66666667%; }
  :global(.cd-col-xs-offset-11) { margin-inline-start: 45.83333333%; }
  :global(.cd-col-xs-offset-12) { margin-inline-start: 50%; }
  :global(.cd-col-xs-offset-13) { margin-inline-start: 54.16666667%; }
  :global(.cd-col-xs-offset-14) { margin-inline-start: 58.33333333%; }
  :global(.cd-col-xs-offset-15) { margin-inline-start: 62.5%; }
  :global(.cd-col-xs-offset-16) { margin-inline-start: 66.66666667%; }
  :global(.cd-col-xs-offset-17) { margin-inline-start: 70.83333333%; }
  :global(.cd-col-xs-offset-18) { margin-inline-start: 75%; }
  :global(.cd-col-xs-offset-19) { margin-inline-start: 79.16666667%; }
  :global(.cd-col-xs-offset-20) { margin-inline-start: 83.33333333%; }
  :global(.cd-col-xs-offset-21) { margin-inline-start: 87.5%; }
  :global(.cd-col-xs-offset-22) { margin-inline-start: 91.66666667%; }
  :global(.cd-col-xs-offset-23) { margin-inline-start: 95.83333333%; }
  :global(.cd-col-xs-offset-24) { margin-inline-start: 100%; }
  :global(.cd-col-xs-order-1) { order: 1; }
  :global(.cd-col-xs-order-2) { order: 2; }
  :global(.cd-col-xs-order-3) { order: 3; }
  :global(.cd-col-xs-order-4) { order: 4; }
  :global(.cd-col-xs-order-5) { order: 5; }
  :global(.cd-col-xs-order-6) { order: 6; }
  :global(.cd-col-xs-order-7) { order: 7; }
  :global(.cd-col-xs-order-8) { order: 8; }
  :global(.cd-col-xs-order-9) { order: 9; }
  :global(.cd-col-xs-order-10) { order: 10; }
  :global(.cd-col-xs-order-11) { order: 11; }
  :global(.cd-col-xs-order-12) { order: 12; }
  :global(.cd-col-xs-order-13) { order: 13; }
  :global(.cd-col-xs-order-14) { order: 14; }
  :global(.cd-col-xs-order-15) { order: 15; }
  :global(.cd-col-xs-order-16) { order: 16; }
  :global(.cd-col-xs-order-17) { order: 17; }
  :global(.cd-col-xs-order-18) { order: 18; }
  :global(.cd-col-xs-order-19) { order: 19; }
  :global(.cd-col-xs-order-20) { order: 20; }
  :global(.cd-col-xs-order-21) { order: 21; }
  :global(.cd-col-xs-order-22) { order: 22; }
  :global(.cd-col-xs-order-23) { order: 23; }
  :global(.cd-col-xs-order-24) { order: 24; }

  @media (min-width: 576px) {
    :global(.cd-col-sm-1) { flex: 0 0 4.16666667%; max-width: 4.16666667%; }
    :global(.cd-col-sm-2) { flex: 0 0 8.33333333%; max-width: 8.33333333%; }
    :global(.cd-col-sm-3) { flex: 0 0 12.5%; max-width: 12.5%; }
    :global(.cd-col-sm-4) { flex: 0 0 16.66666667%; max-width: 16.66666667%; }
    :global(.cd-col-sm-5) { flex: 0 0 20.83333333%; max-width: 20.83333333%; }
    :global(.cd-col-sm-6) { flex: 0 0 25%; max-width: 25%; }
    :global(.cd-col-sm-7) { flex: 0 0 29.16666667%; max-width: 29.16666667%; }
    :global(.cd-col-sm-8) { flex: 0 0 33.33333333%; max-width: 33.33333333%; }
    :global(.cd-col-sm-9) { flex: 0 0 37.5%; max-width: 37.5%; }
    :global(.cd-col-sm-10) { flex: 0 0 41.66666667%; max-width: 41.66666667%; }
    :global(.cd-col-sm-11) { flex: 0 0 45.83333333%; max-width: 45.83333333%; }
    :global(.cd-col-sm-12) { flex: 0 0 50%; max-width: 50%; }
    :global(.cd-col-sm-13) { flex: 0 0 54.16666667%; max-width: 54.16666667%; }
    :global(.cd-col-sm-14) { flex: 0 0 58.33333333%; max-width: 58.33333333%; }
    :global(.cd-col-sm-15) { flex: 0 0 62.5%; max-width: 62.5%; }
    :global(.cd-col-sm-16) { flex: 0 0 66.66666667%; max-width: 66.66666667%; }
    :global(.cd-col-sm-17) { flex: 0 0 70.83333333%; max-width: 70.83333333%; }
    :global(.cd-col-sm-18) { flex: 0 0 75%; max-width: 75%; }
    :global(.cd-col-sm-19) { flex: 0 0 79.16666667%; max-width: 79.16666667%; }
    :global(.cd-col-sm-20) { flex: 0 0 83.33333333%; max-width: 83.33333333%; }
    :global(.cd-col-sm-21) { flex: 0 0 87.5%; max-width: 87.5%; }
    :global(.cd-col-sm-22) { flex: 0 0 91.66666667%; max-width: 91.66666667%; }
    :global(.cd-col-sm-23) { flex: 0 0 95.83333333%; max-width: 95.83333333%; }
    :global(.cd-col-sm-24) { flex: 0 0 100%; max-width: 100%; }
    :global(.cd-col-sm-push-1) { inset-inline-start: 4.16666667%; }
    :global(.cd-col-sm-push-2) { inset-inline-start: 8.33333333%; }
    :global(.cd-col-sm-push-3) { inset-inline-start: 12.5%; }
    :global(.cd-col-sm-push-4) { inset-inline-start: 16.66666667%; }
    :global(.cd-col-sm-push-5) { inset-inline-start: 20.83333333%; }
    :global(.cd-col-sm-push-6) { inset-inline-start: 25%; }
    :global(.cd-col-sm-push-7) { inset-inline-start: 29.16666667%; }
    :global(.cd-col-sm-push-8) { inset-inline-start: 33.33333333%; }
    :global(.cd-col-sm-push-9) { inset-inline-start: 37.5%; }
    :global(.cd-col-sm-push-10) { inset-inline-start: 41.66666667%; }
    :global(.cd-col-sm-push-11) { inset-inline-start: 45.83333333%; }
    :global(.cd-col-sm-push-12) { inset-inline-start: 50%; }
    :global(.cd-col-sm-push-13) { inset-inline-start: 54.16666667%; }
    :global(.cd-col-sm-push-14) { inset-inline-start: 58.33333333%; }
    :global(.cd-col-sm-push-15) { inset-inline-start: 62.5%; }
    :global(.cd-col-sm-push-16) { inset-inline-start: 66.66666667%; }
    :global(.cd-col-sm-push-17) { inset-inline-start: 70.83333333%; }
    :global(.cd-col-sm-push-18) { inset-inline-start: 75%; }
    :global(.cd-col-sm-push-19) { inset-inline-start: 79.16666667%; }
    :global(.cd-col-sm-push-20) { inset-inline-start: 83.33333333%; }
    :global(.cd-col-sm-push-21) { inset-inline-start: 87.5%; }
    :global(.cd-col-sm-push-22) { inset-inline-start: 91.66666667%; }
    :global(.cd-col-sm-push-23) { inset-inline-start: 95.83333333%; }
    :global(.cd-col-sm-push-24) { inset-inline-start: 100%; }
    :global(.cd-col-sm-pull-1) { inset-inline-end: 4.16666667%; }
    :global(.cd-col-sm-pull-2) { inset-inline-end: 8.33333333%; }
    :global(.cd-col-sm-pull-3) { inset-inline-end: 12.5%; }
    :global(.cd-col-sm-pull-4) { inset-inline-end: 16.66666667%; }
    :global(.cd-col-sm-pull-5) { inset-inline-end: 20.83333333%; }
    :global(.cd-col-sm-pull-6) { inset-inline-end: 25%; }
    :global(.cd-col-sm-pull-7) { inset-inline-end: 29.16666667%; }
    :global(.cd-col-sm-pull-8) { inset-inline-end: 33.33333333%; }
    :global(.cd-col-sm-pull-9) { inset-inline-end: 37.5%; }
    :global(.cd-col-sm-pull-10) { inset-inline-end: 41.66666667%; }
    :global(.cd-col-sm-pull-11) { inset-inline-end: 45.83333333%; }
    :global(.cd-col-sm-pull-12) { inset-inline-end: 50%; }
    :global(.cd-col-sm-pull-13) { inset-inline-end: 54.16666667%; }
    :global(.cd-col-sm-pull-14) { inset-inline-end: 58.33333333%; }
    :global(.cd-col-sm-pull-15) { inset-inline-end: 62.5%; }
    :global(.cd-col-sm-pull-16) { inset-inline-end: 66.66666667%; }
    :global(.cd-col-sm-pull-17) { inset-inline-end: 70.83333333%; }
    :global(.cd-col-sm-pull-18) { inset-inline-end: 75%; }
    :global(.cd-col-sm-pull-19) { inset-inline-end: 79.16666667%; }
    :global(.cd-col-sm-pull-20) { inset-inline-end: 83.33333333%; }
    :global(.cd-col-sm-pull-21) { inset-inline-end: 87.5%; }
    :global(.cd-col-sm-pull-22) { inset-inline-end: 91.66666667%; }
    :global(.cd-col-sm-pull-23) { inset-inline-end: 95.83333333%; }
    :global(.cd-col-sm-pull-24) { inset-inline-end: 100%; }
    :global(.cd-col-sm-offset-1) { margin-inline-start: 4.16666667%; }
    :global(.cd-col-sm-offset-2) { margin-inline-start: 8.33333333%; }
    :global(.cd-col-sm-offset-3) { margin-inline-start: 12.5%; }
    :global(.cd-col-sm-offset-4) { margin-inline-start: 16.66666667%; }
    :global(.cd-col-sm-offset-5) { margin-inline-start: 20.83333333%; }
    :global(.cd-col-sm-offset-6) { margin-inline-start: 25%; }
    :global(.cd-col-sm-offset-7) { margin-inline-start: 29.16666667%; }
    :global(.cd-col-sm-offset-8) { margin-inline-start: 33.33333333%; }
    :global(.cd-col-sm-offset-9) { margin-inline-start: 37.5%; }
    :global(.cd-col-sm-offset-10) { margin-inline-start: 41.66666667%; }
    :global(.cd-col-sm-offset-11) { margin-inline-start: 45.83333333%; }
    :global(.cd-col-sm-offset-12) { margin-inline-start: 50%; }
    :global(.cd-col-sm-offset-13) { margin-inline-start: 54.16666667%; }
    :global(.cd-col-sm-offset-14) { margin-inline-start: 58.33333333%; }
    :global(.cd-col-sm-offset-15) { margin-inline-start: 62.5%; }
    :global(.cd-col-sm-offset-16) { margin-inline-start: 66.66666667%; }
    :global(.cd-col-sm-offset-17) { margin-inline-start: 70.83333333%; }
    :global(.cd-col-sm-offset-18) { margin-inline-start: 75%; }
    :global(.cd-col-sm-offset-19) { margin-inline-start: 79.16666667%; }
    :global(.cd-col-sm-offset-20) { margin-inline-start: 83.33333333%; }
    :global(.cd-col-sm-offset-21) { margin-inline-start: 87.5%; }
    :global(.cd-col-sm-offset-22) { margin-inline-start: 91.66666667%; }
    :global(.cd-col-sm-offset-23) { margin-inline-start: 95.83333333%; }
    :global(.cd-col-sm-offset-24) { margin-inline-start: 100%; }
    :global(.cd-col-sm-order-1) { order: 1; }
    :global(.cd-col-sm-order-2) { order: 2; }
    :global(.cd-col-sm-order-3) { order: 3; }
    :global(.cd-col-sm-order-4) { order: 4; }
    :global(.cd-col-sm-order-5) { order: 5; }
    :global(.cd-col-sm-order-6) { order: 6; }
    :global(.cd-col-sm-order-7) { order: 7; }
    :global(.cd-col-sm-order-8) { order: 8; }
    :global(.cd-col-sm-order-9) { order: 9; }
    :global(.cd-col-sm-order-10) { order: 10; }
    :global(.cd-col-sm-order-11) { order: 11; }
    :global(.cd-col-sm-order-12) { order: 12; }
    :global(.cd-col-sm-order-13) { order: 13; }
    :global(.cd-col-sm-order-14) { order: 14; }
    :global(.cd-col-sm-order-15) { order: 15; }
    :global(.cd-col-sm-order-16) { order: 16; }
    :global(.cd-col-sm-order-17) { order: 17; }
    :global(.cd-col-sm-order-18) { order: 18; }
    :global(.cd-col-sm-order-19) { order: 19; }
    :global(.cd-col-sm-order-20) { order: 20; }
    :global(.cd-col-sm-order-21) { order: 21; }
    :global(.cd-col-sm-order-22) { order: 22; }
    :global(.cd-col-sm-order-23) { order: 23; }
    :global(.cd-col-sm-order-24) { order: 24; }
  }

  @media (min-width: 768px) {
    :global(.cd-col-md-1) { flex: 0 0 4.16666667%; max-width: 4.16666667%; }
    :global(.cd-col-md-2) { flex: 0 0 8.33333333%; max-width: 8.33333333%; }
    :global(.cd-col-md-3) { flex: 0 0 12.5%; max-width: 12.5%; }
    :global(.cd-col-md-4) { flex: 0 0 16.66666667%; max-width: 16.66666667%; }
    :global(.cd-col-md-5) { flex: 0 0 20.83333333%; max-width: 20.83333333%; }
    :global(.cd-col-md-6) { flex: 0 0 25%; max-width: 25%; }
    :global(.cd-col-md-7) { flex: 0 0 29.16666667%; max-width: 29.16666667%; }
    :global(.cd-col-md-8) { flex: 0 0 33.33333333%; max-width: 33.33333333%; }
    :global(.cd-col-md-9) { flex: 0 0 37.5%; max-width: 37.5%; }
    :global(.cd-col-md-10) { flex: 0 0 41.66666667%; max-width: 41.66666667%; }
    :global(.cd-col-md-11) { flex: 0 0 45.83333333%; max-width: 45.83333333%; }
    :global(.cd-col-md-12) { flex: 0 0 50%; max-width: 50%; }
    :global(.cd-col-md-13) { flex: 0 0 54.16666667%; max-width: 54.16666667%; }
    :global(.cd-col-md-14) { flex: 0 0 58.33333333%; max-width: 58.33333333%; }
    :global(.cd-col-md-15) { flex: 0 0 62.5%; max-width: 62.5%; }
    :global(.cd-col-md-16) { flex: 0 0 66.66666667%; max-width: 66.66666667%; }
    :global(.cd-col-md-17) { flex: 0 0 70.83333333%; max-width: 70.83333333%; }
    :global(.cd-col-md-18) { flex: 0 0 75%; max-width: 75%; }
    :global(.cd-col-md-19) { flex: 0 0 79.16666667%; max-width: 79.16666667%; }
    :global(.cd-col-md-20) { flex: 0 0 83.33333333%; max-width: 83.33333333%; }
    :global(.cd-col-md-21) { flex: 0 0 87.5%; max-width: 87.5%; }
    :global(.cd-col-md-22) { flex: 0 0 91.66666667%; max-width: 91.66666667%; }
    :global(.cd-col-md-23) { flex: 0 0 95.83333333%; max-width: 95.83333333%; }
    :global(.cd-col-md-24) { flex: 0 0 100%; max-width: 100%; }
    :global(.cd-col-md-push-1) { inset-inline-start: 4.16666667%; }
    :global(.cd-col-md-push-2) { inset-inline-start: 8.33333333%; }
    :global(.cd-col-md-push-3) { inset-inline-start: 12.5%; }
    :global(.cd-col-md-push-4) { inset-inline-start: 16.66666667%; }
    :global(.cd-col-md-push-5) { inset-inline-start: 20.83333333%; }
    :global(.cd-col-md-push-6) { inset-inline-start: 25%; }
    :global(.cd-col-md-push-7) { inset-inline-start: 29.16666667%; }
    :global(.cd-col-md-push-8) { inset-inline-start: 33.33333333%; }
    :global(.cd-col-md-push-9) { inset-inline-start: 37.5%; }
    :global(.cd-col-md-push-10) { inset-inline-start: 41.66666667%; }
    :global(.cd-col-md-push-11) { inset-inline-start: 45.83333333%; }
    :global(.cd-col-md-push-12) { inset-inline-start: 50%; }
    :global(.cd-col-md-push-13) { inset-inline-start: 54.16666667%; }
    :global(.cd-col-md-push-14) { inset-inline-start: 58.33333333%; }
    :global(.cd-col-md-push-15) { inset-inline-start: 62.5%; }
    :global(.cd-col-md-push-16) { inset-inline-start: 66.66666667%; }
    :global(.cd-col-md-push-17) { inset-inline-start: 70.83333333%; }
    :global(.cd-col-md-push-18) { inset-inline-start: 75%; }
    :global(.cd-col-md-push-19) { inset-inline-start: 79.16666667%; }
    :global(.cd-col-md-push-20) { inset-inline-start: 83.33333333%; }
    :global(.cd-col-md-push-21) { inset-inline-start: 87.5%; }
    :global(.cd-col-md-push-22) { inset-inline-start: 91.66666667%; }
    :global(.cd-col-md-push-23) { inset-inline-start: 95.83333333%; }
    :global(.cd-col-md-push-24) { inset-inline-start: 100%; }
    :global(.cd-col-md-pull-1) { inset-inline-end: 4.16666667%; }
    :global(.cd-col-md-pull-2) { inset-inline-end: 8.33333333%; }
    :global(.cd-col-md-pull-3) { inset-inline-end: 12.5%; }
    :global(.cd-col-md-pull-4) { inset-inline-end: 16.66666667%; }
    :global(.cd-col-md-pull-5) { inset-inline-end: 20.83333333%; }
    :global(.cd-col-md-pull-6) { inset-inline-end: 25%; }
    :global(.cd-col-md-pull-7) { inset-inline-end: 29.16666667%; }
    :global(.cd-col-md-pull-8) { inset-inline-end: 33.33333333%; }
    :global(.cd-col-md-pull-9) { inset-inline-end: 37.5%; }
    :global(.cd-col-md-pull-10) { inset-inline-end: 41.66666667%; }
    :global(.cd-col-md-pull-11) { inset-inline-end: 45.83333333%; }
    :global(.cd-col-md-pull-12) { inset-inline-end: 50%; }
    :global(.cd-col-md-pull-13) { inset-inline-end: 54.16666667%; }
    :global(.cd-col-md-pull-14) { inset-inline-end: 58.33333333%; }
    :global(.cd-col-md-pull-15) { inset-inline-end: 62.5%; }
    :global(.cd-col-md-pull-16) { inset-inline-end: 66.66666667%; }
    :global(.cd-col-md-pull-17) { inset-inline-end: 70.83333333%; }
    :global(.cd-col-md-pull-18) { inset-inline-end: 75%; }
    :global(.cd-col-md-pull-19) { inset-inline-end: 79.16666667%; }
    :global(.cd-col-md-pull-20) { inset-inline-end: 83.33333333%; }
    :global(.cd-col-md-pull-21) { inset-inline-end: 87.5%; }
    :global(.cd-col-md-pull-22) { inset-inline-end: 91.66666667%; }
    :global(.cd-col-md-pull-23) { inset-inline-end: 95.83333333%; }
    :global(.cd-col-md-pull-24) { inset-inline-end: 100%; }
    :global(.cd-col-md-offset-1) { margin-inline-start: 4.16666667%; }
    :global(.cd-col-md-offset-2) { margin-inline-start: 8.33333333%; }
    :global(.cd-col-md-offset-3) { margin-inline-start: 12.5%; }
    :global(.cd-col-md-offset-4) { margin-inline-start: 16.66666667%; }
    :global(.cd-col-md-offset-5) { margin-inline-start: 20.83333333%; }
    :global(.cd-col-md-offset-6) { margin-inline-start: 25%; }
    :global(.cd-col-md-offset-7) { margin-inline-start: 29.16666667%; }
    :global(.cd-col-md-offset-8) { margin-inline-start: 33.33333333%; }
    :global(.cd-col-md-offset-9) { margin-inline-start: 37.5%; }
    :global(.cd-col-md-offset-10) { margin-inline-start: 41.66666667%; }
    :global(.cd-col-md-offset-11) { margin-inline-start: 45.83333333%; }
    :global(.cd-col-md-offset-12) { margin-inline-start: 50%; }
    :global(.cd-col-md-offset-13) { margin-inline-start: 54.16666667%; }
    :global(.cd-col-md-offset-14) { margin-inline-start: 58.33333333%; }
    :global(.cd-col-md-offset-15) { margin-inline-start: 62.5%; }
    :global(.cd-col-md-offset-16) { margin-inline-start: 66.66666667%; }
    :global(.cd-col-md-offset-17) { margin-inline-start: 70.83333333%; }
    :global(.cd-col-md-offset-18) { margin-inline-start: 75%; }
    :global(.cd-col-md-offset-19) { margin-inline-start: 79.16666667%; }
    :global(.cd-col-md-offset-20) { margin-inline-start: 83.33333333%; }
    :global(.cd-col-md-offset-21) { margin-inline-start: 87.5%; }
    :global(.cd-col-md-offset-22) { margin-inline-start: 91.66666667%; }
    :global(.cd-col-md-offset-23) { margin-inline-start: 95.83333333%; }
    :global(.cd-col-md-offset-24) { margin-inline-start: 100%; }
    :global(.cd-col-md-order-1) { order: 1; }
    :global(.cd-col-md-order-2) { order: 2; }
    :global(.cd-col-md-order-3) { order: 3; }
    :global(.cd-col-md-order-4) { order: 4; }
    :global(.cd-col-md-order-5) { order: 5; }
    :global(.cd-col-md-order-6) { order: 6; }
    :global(.cd-col-md-order-7) { order: 7; }
    :global(.cd-col-md-order-8) { order: 8; }
    :global(.cd-col-md-order-9) { order: 9; }
    :global(.cd-col-md-order-10) { order: 10; }
    :global(.cd-col-md-order-11) { order: 11; }
    :global(.cd-col-md-order-12) { order: 12; }
    :global(.cd-col-md-order-13) { order: 13; }
    :global(.cd-col-md-order-14) { order: 14; }
    :global(.cd-col-md-order-15) { order: 15; }
    :global(.cd-col-md-order-16) { order: 16; }
    :global(.cd-col-md-order-17) { order: 17; }
    :global(.cd-col-md-order-18) { order: 18; }
    :global(.cd-col-md-order-19) { order: 19; }
    :global(.cd-col-md-order-20) { order: 20; }
    :global(.cd-col-md-order-21) { order: 21; }
    :global(.cd-col-md-order-22) { order: 22; }
    :global(.cd-col-md-order-23) { order: 23; }
    :global(.cd-col-md-order-24) { order: 24; }
  }

  @media (min-width: 992px) {
    :global(.cd-col-lg-1) { flex: 0 0 4.16666667%; max-width: 4.16666667%; }
    :global(.cd-col-lg-2) { flex: 0 0 8.33333333%; max-width: 8.33333333%; }
    :global(.cd-col-lg-3) { flex: 0 0 12.5%; max-width: 12.5%; }
    :global(.cd-col-lg-4) { flex: 0 0 16.66666667%; max-width: 16.66666667%; }
    :global(.cd-col-lg-5) { flex: 0 0 20.83333333%; max-width: 20.83333333%; }
    :global(.cd-col-lg-6) { flex: 0 0 25%; max-width: 25%; }
    :global(.cd-col-lg-7) { flex: 0 0 29.16666667%; max-width: 29.16666667%; }
    :global(.cd-col-lg-8) { flex: 0 0 33.33333333%; max-width: 33.33333333%; }
    :global(.cd-col-lg-9) { flex: 0 0 37.5%; max-width: 37.5%; }
    :global(.cd-col-lg-10) { flex: 0 0 41.66666667%; max-width: 41.66666667%; }
    :global(.cd-col-lg-11) { flex: 0 0 45.83333333%; max-width: 45.83333333%; }
    :global(.cd-col-lg-12) { flex: 0 0 50%; max-width: 50%; }
    :global(.cd-col-lg-13) { flex: 0 0 54.16666667%; max-width: 54.16666667%; }
    :global(.cd-col-lg-14) { flex: 0 0 58.33333333%; max-width: 58.33333333%; }
    :global(.cd-col-lg-15) { flex: 0 0 62.5%; max-width: 62.5%; }
    :global(.cd-col-lg-16) { flex: 0 0 66.66666667%; max-width: 66.66666667%; }
    :global(.cd-col-lg-17) { flex: 0 0 70.83333333%; max-width: 70.83333333%; }
    :global(.cd-col-lg-18) { flex: 0 0 75%; max-width: 75%; }
    :global(.cd-col-lg-19) { flex: 0 0 79.16666667%; max-width: 79.16666667%; }
    :global(.cd-col-lg-20) { flex: 0 0 83.33333333%; max-width: 83.33333333%; }
    :global(.cd-col-lg-21) { flex: 0 0 87.5%; max-width: 87.5%; }
    :global(.cd-col-lg-22) { flex: 0 0 91.66666667%; max-width: 91.66666667%; }
    :global(.cd-col-lg-23) { flex: 0 0 95.83333333%; max-width: 95.83333333%; }
    :global(.cd-col-lg-24) { flex: 0 0 100%; max-width: 100%; }
    :global(.cd-col-lg-push-1) { inset-inline-start: 4.16666667%; }
    :global(.cd-col-lg-push-2) { inset-inline-start: 8.33333333%; }
    :global(.cd-col-lg-push-3) { inset-inline-start: 12.5%; }
    :global(.cd-col-lg-push-4) { inset-inline-start: 16.66666667%; }
    :global(.cd-col-lg-push-5) { inset-inline-start: 20.83333333%; }
    :global(.cd-col-lg-push-6) { inset-inline-start: 25%; }
    :global(.cd-col-lg-push-7) { inset-inline-start: 29.16666667%; }
    :global(.cd-col-lg-push-8) { inset-inline-start: 33.33333333%; }
    :global(.cd-col-lg-push-9) { inset-inline-start: 37.5%; }
    :global(.cd-col-lg-push-10) { inset-inline-start: 41.66666667%; }
    :global(.cd-col-lg-push-11) { inset-inline-start: 45.83333333%; }
    :global(.cd-col-lg-push-12) { inset-inline-start: 50%; }
    :global(.cd-col-lg-push-13) { inset-inline-start: 54.16666667%; }
    :global(.cd-col-lg-push-14) { inset-inline-start: 58.33333333%; }
    :global(.cd-col-lg-push-15) { inset-inline-start: 62.5%; }
    :global(.cd-col-lg-push-16) { inset-inline-start: 66.66666667%; }
    :global(.cd-col-lg-push-17) { inset-inline-start: 70.83333333%; }
    :global(.cd-col-lg-push-18) { inset-inline-start: 75%; }
    :global(.cd-col-lg-push-19) { inset-inline-start: 79.16666667%; }
    :global(.cd-col-lg-push-20) { inset-inline-start: 83.33333333%; }
    :global(.cd-col-lg-push-21) { inset-inline-start: 87.5%; }
    :global(.cd-col-lg-push-22) { inset-inline-start: 91.66666667%; }
    :global(.cd-col-lg-push-23) { inset-inline-start: 95.83333333%; }
    :global(.cd-col-lg-push-24) { inset-inline-start: 100%; }
    :global(.cd-col-lg-pull-1) { inset-inline-end: 4.16666667%; }
    :global(.cd-col-lg-pull-2) { inset-inline-end: 8.33333333%; }
    :global(.cd-col-lg-pull-3) { inset-inline-end: 12.5%; }
    :global(.cd-col-lg-pull-4) { inset-inline-end: 16.66666667%; }
    :global(.cd-col-lg-pull-5) { inset-inline-end: 20.83333333%; }
    :global(.cd-col-lg-pull-6) { inset-inline-end: 25%; }
    :global(.cd-col-lg-pull-7) { inset-inline-end: 29.16666667%; }
    :global(.cd-col-lg-pull-8) { inset-inline-end: 33.33333333%; }
    :global(.cd-col-lg-pull-9) { inset-inline-end: 37.5%; }
    :global(.cd-col-lg-pull-10) { inset-inline-end: 41.66666667%; }
    :global(.cd-col-lg-pull-11) { inset-inline-end: 45.83333333%; }
    :global(.cd-col-lg-pull-12) { inset-inline-end: 50%; }
    :global(.cd-col-lg-pull-13) { inset-inline-end: 54.16666667%; }
    :global(.cd-col-lg-pull-14) { inset-inline-end: 58.33333333%; }
    :global(.cd-col-lg-pull-15) { inset-inline-end: 62.5%; }
    :global(.cd-col-lg-pull-16) { inset-inline-end: 66.66666667%; }
    :global(.cd-col-lg-pull-17) { inset-inline-end: 70.83333333%; }
    :global(.cd-col-lg-pull-18) { inset-inline-end: 75%; }
    :global(.cd-col-lg-pull-19) { inset-inline-end: 79.16666667%; }
    :global(.cd-col-lg-pull-20) { inset-inline-end: 83.33333333%; }
    :global(.cd-col-lg-pull-21) { inset-inline-end: 87.5%; }
    :global(.cd-col-lg-pull-22) { inset-inline-end: 91.66666667%; }
    :global(.cd-col-lg-pull-23) { inset-inline-end: 95.83333333%; }
    :global(.cd-col-lg-pull-24) { inset-inline-end: 100%; }
    :global(.cd-col-lg-offset-1) { margin-inline-start: 4.16666667%; }
    :global(.cd-col-lg-offset-2) { margin-inline-start: 8.33333333%; }
    :global(.cd-col-lg-offset-3) { margin-inline-start: 12.5%; }
    :global(.cd-col-lg-offset-4) { margin-inline-start: 16.66666667%; }
    :global(.cd-col-lg-offset-5) { margin-inline-start: 20.83333333%; }
    :global(.cd-col-lg-offset-6) { margin-inline-start: 25%; }
    :global(.cd-col-lg-offset-7) { margin-inline-start: 29.16666667%; }
    :global(.cd-col-lg-offset-8) { margin-inline-start: 33.33333333%; }
    :global(.cd-col-lg-offset-9) { margin-inline-start: 37.5%; }
    :global(.cd-col-lg-offset-10) { margin-inline-start: 41.66666667%; }
    :global(.cd-col-lg-offset-11) { margin-inline-start: 45.83333333%; }
    :global(.cd-col-lg-offset-12) { margin-inline-start: 50%; }
    :global(.cd-col-lg-offset-13) { margin-inline-start: 54.16666667%; }
    :global(.cd-col-lg-offset-14) { margin-inline-start: 58.33333333%; }
    :global(.cd-col-lg-offset-15) { margin-inline-start: 62.5%; }
    :global(.cd-col-lg-offset-16) { margin-inline-start: 66.66666667%; }
    :global(.cd-col-lg-offset-17) { margin-inline-start: 70.83333333%; }
    :global(.cd-col-lg-offset-18) { margin-inline-start: 75%; }
    :global(.cd-col-lg-offset-19) { margin-inline-start: 79.16666667%; }
    :global(.cd-col-lg-offset-20) { margin-inline-start: 83.33333333%; }
    :global(.cd-col-lg-offset-21) { margin-inline-start: 87.5%; }
    :global(.cd-col-lg-offset-22) { margin-inline-start: 91.66666667%; }
    :global(.cd-col-lg-offset-23) { margin-inline-start: 95.83333333%; }
    :global(.cd-col-lg-offset-24) { margin-inline-start: 100%; }
    :global(.cd-col-lg-order-1) { order: 1; }
    :global(.cd-col-lg-order-2) { order: 2; }
    :global(.cd-col-lg-order-3) { order: 3; }
    :global(.cd-col-lg-order-4) { order: 4; }
    :global(.cd-col-lg-order-5) { order: 5; }
    :global(.cd-col-lg-order-6) { order: 6; }
    :global(.cd-col-lg-order-7) { order: 7; }
    :global(.cd-col-lg-order-8) { order: 8; }
    :global(.cd-col-lg-order-9) { order: 9; }
    :global(.cd-col-lg-order-10) { order: 10; }
    :global(.cd-col-lg-order-11) { order: 11; }
    :global(.cd-col-lg-order-12) { order: 12; }
    :global(.cd-col-lg-order-13) { order: 13; }
    :global(.cd-col-lg-order-14) { order: 14; }
    :global(.cd-col-lg-order-15) { order: 15; }
    :global(.cd-col-lg-order-16) { order: 16; }
    :global(.cd-col-lg-order-17) { order: 17; }
    :global(.cd-col-lg-order-18) { order: 18; }
    :global(.cd-col-lg-order-19) { order: 19; }
    :global(.cd-col-lg-order-20) { order: 20; }
    :global(.cd-col-lg-order-21) { order: 21; }
    :global(.cd-col-lg-order-22) { order: 22; }
    :global(.cd-col-lg-order-23) { order: 23; }
    :global(.cd-col-lg-order-24) { order: 24; }
  }

  @media (min-width: 1200px) {
    :global(.cd-col-xl-1) { flex: 0 0 4.16666667%; max-width: 4.16666667%; }
    :global(.cd-col-xl-2) { flex: 0 0 8.33333333%; max-width: 8.33333333%; }
    :global(.cd-col-xl-3) { flex: 0 0 12.5%; max-width: 12.5%; }
    :global(.cd-col-xl-4) { flex: 0 0 16.66666667%; max-width: 16.66666667%; }
    :global(.cd-col-xl-5) { flex: 0 0 20.83333333%; max-width: 20.83333333%; }
    :global(.cd-col-xl-6) { flex: 0 0 25%; max-width: 25%; }
    :global(.cd-col-xl-7) { flex: 0 0 29.16666667%; max-width: 29.16666667%; }
    :global(.cd-col-xl-8) { flex: 0 0 33.33333333%; max-width: 33.33333333%; }
    :global(.cd-col-xl-9) { flex: 0 0 37.5%; max-width: 37.5%; }
    :global(.cd-col-xl-10) { flex: 0 0 41.66666667%; max-width: 41.66666667%; }
    :global(.cd-col-xl-11) { flex: 0 0 45.83333333%; max-width: 45.83333333%; }
    :global(.cd-col-xl-12) { flex: 0 0 50%; max-width: 50%; }
    :global(.cd-col-xl-13) { flex: 0 0 54.16666667%; max-width: 54.16666667%; }
    :global(.cd-col-xl-14) { flex: 0 0 58.33333333%; max-width: 58.33333333%; }
    :global(.cd-col-xl-15) { flex: 0 0 62.5%; max-width: 62.5%; }
    :global(.cd-col-xl-16) { flex: 0 0 66.66666667%; max-width: 66.66666667%; }
    :global(.cd-col-xl-17) { flex: 0 0 70.83333333%; max-width: 70.83333333%; }
    :global(.cd-col-xl-18) { flex: 0 0 75%; max-width: 75%; }
    :global(.cd-col-xl-19) { flex: 0 0 79.16666667%; max-width: 79.16666667%; }
    :global(.cd-col-xl-20) { flex: 0 0 83.33333333%; max-width: 83.33333333%; }
    :global(.cd-col-xl-21) { flex: 0 0 87.5%; max-width: 87.5%; }
    :global(.cd-col-xl-22) { flex: 0 0 91.66666667%; max-width: 91.66666667%; }
    :global(.cd-col-xl-23) { flex: 0 0 95.83333333%; max-width: 95.83333333%; }
    :global(.cd-col-xl-24) { flex: 0 0 100%; max-width: 100%; }
    :global(.cd-col-xl-push-1) { inset-inline-start: 4.16666667%; }
    :global(.cd-col-xl-push-2) { inset-inline-start: 8.33333333%; }
    :global(.cd-col-xl-push-3) { inset-inline-start: 12.5%; }
    :global(.cd-col-xl-push-4) { inset-inline-start: 16.66666667%; }
    :global(.cd-col-xl-push-5) { inset-inline-start: 20.83333333%; }
    :global(.cd-col-xl-push-6) { inset-inline-start: 25%; }
    :global(.cd-col-xl-push-7) { inset-inline-start: 29.16666667%; }
    :global(.cd-col-xl-push-8) { inset-inline-start: 33.33333333%; }
    :global(.cd-col-xl-push-9) { inset-inline-start: 37.5%; }
    :global(.cd-col-xl-push-10) { inset-inline-start: 41.66666667%; }
    :global(.cd-col-xl-push-11) { inset-inline-start: 45.83333333%; }
    :global(.cd-col-xl-push-12) { inset-inline-start: 50%; }
    :global(.cd-col-xl-push-13) { inset-inline-start: 54.16666667%; }
    :global(.cd-col-xl-push-14) { inset-inline-start: 58.33333333%; }
    :global(.cd-col-xl-push-15) { inset-inline-start: 62.5%; }
    :global(.cd-col-xl-push-16) { inset-inline-start: 66.66666667%; }
    :global(.cd-col-xl-push-17) { inset-inline-start: 70.83333333%; }
    :global(.cd-col-xl-push-18) { inset-inline-start: 75%; }
    :global(.cd-col-xl-push-19) { inset-inline-start: 79.16666667%; }
    :global(.cd-col-xl-push-20) { inset-inline-start: 83.33333333%; }
    :global(.cd-col-xl-push-21) { inset-inline-start: 87.5%; }
    :global(.cd-col-xl-push-22) { inset-inline-start: 91.66666667%; }
    :global(.cd-col-xl-push-23) { inset-inline-start: 95.83333333%; }
    :global(.cd-col-xl-push-24) { inset-inline-start: 100%; }
    :global(.cd-col-xl-pull-1) { inset-inline-end: 4.16666667%; }
    :global(.cd-col-xl-pull-2) { inset-inline-end: 8.33333333%; }
    :global(.cd-col-xl-pull-3) { inset-inline-end: 12.5%; }
    :global(.cd-col-xl-pull-4) { inset-inline-end: 16.66666667%; }
    :global(.cd-col-xl-pull-5) { inset-inline-end: 20.83333333%; }
    :global(.cd-col-xl-pull-6) { inset-inline-end: 25%; }
    :global(.cd-col-xl-pull-7) { inset-inline-end: 29.16666667%; }
    :global(.cd-col-xl-pull-8) { inset-inline-end: 33.33333333%; }
    :global(.cd-col-xl-pull-9) { inset-inline-end: 37.5%; }
    :global(.cd-col-xl-pull-10) { inset-inline-end: 41.66666667%; }
    :global(.cd-col-xl-pull-11) { inset-inline-end: 45.83333333%; }
    :global(.cd-col-xl-pull-12) { inset-inline-end: 50%; }
    :global(.cd-col-xl-pull-13) { inset-inline-end: 54.16666667%; }
    :global(.cd-col-xl-pull-14) { inset-inline-end: 58.33333333%; }
    :global(.cd-col-xl-pull-15) { inset-inline-end: 62.5%; }
    :global(.cd-col-xl-pull-16) { inset-inline-end: 66.66666667%; }
    :global(.cd-col-xl-pull-17) { inset-inline-end: 70.83333333%; }
    :global(.cd-col-xl-pull-18) { inset-inline-end: 75%; }
    :global(.cd-col-xl-pull-19) { inset-inline-end: 79.16666667%; }
    :global(.cd-col-xl-pull-20) { inset-inline-end: 83.33333333%; }
    :global(.cd-col-xl-pull-21) { inset-inline-end: 87.5%; }
    :global(.cd-col-xl-pull-22) { inset-inline-end: 91.66666667%; }
    :global(.cd-col-xl-pull-23) { inset-inline-end: 95.83333333%; }
    :global(.cd-col-xl-pull-24) { inset-inline-end: 100%; }
    :global(.cd-col-xl-offset-1) { margin-inline-start: 4.16666667%; }
    :global(.cd-col-xl-offset-2) { margin-inline-start: 8.33333333%; }
    :global(.cd-col-xl-offset-3) { margin-inline-start: 12.5%; }
    :global(.cd-col-xl-offset-4) { margin-inline-start: 16.66666667%; }
    :global(.cd-col-xl-offset-5) { margin-inline-start: 20.83333333%; }
    :global(.cd-col-xl-offset-6) { margin-inline-start: 25%; }
    :global(.cd-col-xl-offset-7) { margin-inline-start: 29.16666667%; }
    :global(.cd-col-xl-offset-8) { margin-inline-start: 33.33333333%; }
    :global(.cd-col-xl-offset-9) { margin-inline-start: 37.5%; }
    :global(.cd-col-xl-offset-10) { margin-inline-start: 41.66666667%; }
    :global(.cd-col-xl-offset-11) { margin-inline-start: 45.83333333%; }
    :global(.cd-col-xl-offset-12) { margin-inline-start: 50%; }
    :global(.cd-col-xl-offset-13) { margin-inline-start: 54.16666667%; }
    :global(.cd-col-xl-offset-14) { margin-inline-start: 58.33333333%; }
    :global(.cd-col-xl-offset-15) { margin-inline-start: 62.5%; }
    :global(.cd-col-xl-offset-16) { margin-inline-start: 66.66666667%; }
    :global(.cd-col-xl-offset-17) { margin-inline-start: 70.83333333%; }
    :global(.cd-col-xl-offset-18) { margin-inline-start: 75%; }
    :global(.cd-col-xl-offset-19) { margin-inline-start: 79.16666667%; }
    :global(.cd-col-xl-offset-20) { margin-inline-start: 83.33333333%; }
    :global(.cd-col-xl-offset-21) { margin-inline-start: 87.5%; }
    :global(.cd-col-xl-offset-22) { margin-inline-start: 91.66666667%; }
    :global(.cd-col-xl-offset-23) { margin-inline-start: 95.83333333%; }
    :global(.cd-col-xl-offset-24) { margin-inline-start: 100%; }
    :global(.cd-col-xl-order-1) { order: 1; }
    :global(.cd-col-xl-order-2) { order: 2; }
    :global(.cd-col-xl-order-3) { order: 3; }
    :global(.cd-col-xl-order-4) { order: 4; }
    :global(.cd-col-xl-order-5) { order: 5; }
    :global(.cd-col-xl-order-6) { order: 6; }
    :global(.cd-col-xl-order-7) { order: 7; }
    :global(.cd-col-xl-order-8) { order: 8; }
    :global(.cd-col-xl-order-9) { order: 9; }
    :global(.cd-col-xl-order-10) { order: 10; }
    :global(.cd-col-xl-order-11) { order: 11; }
    :global(.cd-col-xl-order-12) { order: 12; }
    :global(.cd-col-xl-order-13) { order: 13; }
    :global(.cd-col-xl-order-14) { order: 14; }
    :global(.cd-col-xl-order-15) { order: 15; }
    :global(.cd-col-xl-order-16) { order: 16; }
    :global(.cd-col-xl-order-17) { order: 17; }
    :global(.cd-col-xl-order-18) { order: 18; }
    :global(.cd-col-xl-order-19) { order: 19; }
    :global(.cd-col-xl-order-20) { order: 20; }
    :global(.cd-col-xl-order-21) { order: 21; }
    :global(.cd-col-xl-order-22) { order: 22; }
    :global(.cd-col-xl-order-23) { order: 23; }
    :global(.cd-col-xl-order-24) { order: 24; }
  }

  @media (min-width: 1600px) {
    :global(.cd-col-xxl-1) { flex: 0 0 4.16666667%; max-width: 4.16666667%; }
    :global(.cd-col-xxl-2) { flex: 0 0 8.33333333%; max-width: 8.33333333%; }
    :global(.cd-col-xxl-3) { flex: 0 0 12.5%; max-width: 12.5%; }
    :global(.cd-col-xxl-4) { flex: 0 0 16.66666667%; max-width: 16.66666667%; }
    :global(.cd-col-xxl-5) { flex: 0 0 20.83333333%; max-width: 20.83333333%; }
    :global(.cd-col-xxl-6) { flex: 0 0 25%; max-width: 25%; }
    :global(.cd-col-xxl-7) { flex: 0 0 29.16666667%; max-width: 29.16666667%; }
    :global(.cd-col-xxl-8) { flex: 0 0 33.33333333%; max-width: 33.33333333%; }
    :global(.cd-col-xxl-9) { flex: 0 0 37.5%; max-width: 37.5%; }
    :global(.cd-col-xxl-10) { flex: 0 0 41.66666667%; max-width: 41.66666667%; }
    :global(.cd-col-xxl-11) { flex: 0 0 45.83333333%; max-width: 45.83333333%; }
    :global(.cd-col-xxl-12) { flex: 0 0 50%; max-width: 50%; }
    :global(.cd-col-xxl-13) { flex: 0 0 54.16666667%; max-width: 54.16666667%; }
    :global(.cd-col-xxl-14) { flex: 0 0 58.33333333%; max-width: 58.33333333%; }
    :global(.cd-col-xxl-15) { flex: 0 0 62.5%; max-width: 62.5%; }
    :global(.cd-col-xxl-16) { flex: 0 0 66.66666667%; max-width: 66.66666667%; }
    :global(.cd-col-xxl-17) { flex: 0 0 70.83333333%; max-width: 70.83333333%; }
    :global(.cd-col-xxl-18) { flex: 0 0 75%; max-width: 75%; }
    :global(.cd-col-xxl-19) { flex: 0 0 79.16666667%; max-width: 79.16666667%; }
    :global(.cd-col-xxl-20) { flex: 0 0 83.33333333%; max-width: 83.33333333%; }
    :global(.cd-col-xxl-21) { flex: 0 0 87.5%; max-width: 87.5%; }
    :global(.cd-col-xxl-22) { flex: 0 0 91.66666667%; max-width: 91.66666667%; }
    :global(.cd-col-xxl-23) { flex: 0 0 95.83333333%; max-width: 95.83333333%; }
    :global(.cd-col-xxl-24) { flex: 0 0 100%; max-width: 100%; }
    :global(.cd-col-xxl-push-1) { inset-inline-start: 4.16666667%; }
    :global(.cd-col-xxl-push-2) { inset-inline-start: 8.33333333%; }
    :global(.cd-col-xxl-push-3) { inset-inline-start: 12.5%; }
    :global(.cd-col-xxl-push-4) { inset-inline-start: 16.66666667%; }
    :global(.cd-col-xxl-push-5) { inset-inline-start: 20.83333333%; }
    :global(.cd-col-xxl-push-6) { inset-inline-start: 25%; }
    :global(.cd-col-xxl-push-7) { inset-inline-start: 29.16666667%; }
    :global(.cd-col-xxl-push-8) { inset-inline-start: 33.33333333%; }
    :global(.cd-col-xxl-push-9) { inset-inline-start: 37.5%; }
    :global(.cd-col-xxl-push-10) { inset-inline-start: 41.66666667%; }
    :global(.cd-col-xxl-push-11) { inset-inline-start: 45.83333333%; }
    :global(.cd-col-xxl-push-12) { inset-inline-start: 50%; }
    :global(.cd-col-xxl-push-13) { inset-inline-start: 54.16666667%; }
    :global(.cd-col-xxl-push-14) { inset-inline-start: 58.33333333%; }
    :global(.cd-col-xxl-push-15) { inset-inline-start: 62.5%; }
    :global(.cd-col-xxl-push-16) { inset-inline-start: 66.66666667%; }
    :global(.cd-col-xxl-push-17) { inset-inline-start: 70.83333333%; }
    :global(.cd-col-xxl-push-18) { inset-inline-start: 75%; }
    :global(.cd-col-xxl-push-19) { inset-inline-start: 79.16666667%; }
    :global(.cd-col-xxl-push-20) { inset-inline-start: 83.33333333%; }
    :global(.cd-col-xxl-push-21) { inset-inline-start: 87.5%; }
    :global(.cd-col-xxl-push-22) { inset-inline-start: 91.66666667%; }
    :global(.cd-col-xxl-push-23) { inset-inline-start: 95.83333333%; }
    :global(.cd-col-xxl-push-24) { inset-inline-start: 100%; }
    :global(.cd-col-xxl-pull-1) { inset-inline-end: 4.16666667%; }
    :global(.cd-col-xxl-pull-2) { inset-inline-end: 8.33333333%; }
    :global(.cd-col-xxl-pull-3) { inset-inline-end: 12.5%; }
    :global(.cd-col-xxl-pull-4) { inset-inline-end: 16.66666667%; }
    :global(.cd-col-xxl-pull-5) { inset-inline-end: 20.83333333%; }
    :global(.cd-col-xxl-pull-6) { inset-inline-end: 25%; }
    :global(.cd-col-xxl-pull-7) { inset-inline-end: 29.16666667%; }
    :global(.cd-col-xxl-pull-8) { inset-inline-end: 33.33333333%; }
    :global(.cd-col-xxl-pull-9) { inset-inline-end: 37.5%; }
    :global(.cd-col-xxl-pull-10) { inset-inline-end: 41.66666667%; }
    :global(.cd-col-xxl-pull-11) { inset-inline-end: 45.83333333%; }
    :global(.cd-col-xxl-pull-12) { inset-inline-end: 50%; }
    :global(.cd-col-xxl-pull-13) { inset-inline-end: 54.16666667%; }
    :global(.cd-col-xxl-pull-14) { inset-inline-end: 58.33333333%; }
    :global(.cd-col-xxl-pull-15) { inset-inline-end: 62.5%; }
    :global(.cd-col-xxl-pull-16) { inset-inline-end: 66.66666667%; }
    :global(.cd-col-xxl-pull-17) { inset-inline-end: 70.83333333%; }
    :global(.cd-col-xxl-pull-18) { inset-inline-end: 75%; }
    :global(.cd-col-xxl-pull-19) { inset-inline-end: 79.16666667%; }
    :global(.cd-col-xxl-pull-20) { inset-inline-end: 83.33333333%; }
    :global(.cd-col-xxl-pull-21) { inset-inline-end: 87.5%; }
    :global(.cd-col-xxl-pull-22) { inset-inline-end: 91.66666667%; }
    :global(.cd-col-xxl-pull-23) { inset-inline-end: 95.83333333%; }
    :global(.cd-col-xxl-pull-24) { inset-inline-end: 100%; }
    :global(.cd-col-xxl-offset-1) { margin-inline-start: 4.16666667%; }
    :global(.cd-col-xxl-offset-2) { margin-inline-start: 8.33333333%; }
    :global(.cd-col-xxl-offset-3) { margin-inline-start: 12.5%; }
    :global(.cd-col-xxl-offset-4) { margin-inline-start: 16.66666667%; }
    :global(.cd-col-xxl-offset-5) { margin-inline-start: 20.83333333%; }
    :global(.cd-col-xxl-offset-6) { margin-inline-start: 25%; }
    :global(.cd-col-xxl-offset-7) { margin-inline-start: 29.16666667%; }
    :global(.cd-col-xxl-offset-8) { margin-inline-start: 33.33333333%; }
    :global(.cd-col-xxl-offset-9) { margin-inline-start: 37.5%; }
    :global(.cd-col-xxl-offset-10) { margin-inline-start: 41.66666667%; }
    :global(.cd-col-xxl-offset-11) { margin-inline-start: 45.83333333%; }
    :global(.cd-col-xxl-offset-12) { margin-inline-start: 50%; }
    :global(.cd-col-xxl-offset-13) { margin-inline-start: 54.16666667%; }
    :global(.cd-col-xxl-offset-14) { margin-inline-start: 58.33333333%; }
    :global(.cd-col-xxl-offset-15) { margin-inline-start: 62.5%; }
    :global(.cd-col-xxl-offset-16) { margin-inline-start: 66.66666667%; }
    :global(.cd-col-xxl-offset-17) { margin-inline-start: 70.83333333%; }
    :global(.cd-col-xxl-offset-18) { margin-inline-start: 75%; }
    :global(.cd-col-xxl-offset-19) { margin-inline-start: 79.16666667%; }
    :global(.cd-col-xxl-offset-20) { margin-inline-start: 83.33333333%; }
    :global(.cd-col-xxl-offset-21) { margin-inline-start: 87.5%; }
    :global(.cd-col-xxl-offset-22) { margin-inline-start: 91.66666667%; }
    :global(.cd-col-xxl-offset-23) { margin-inline-start: 95.83333333%; }
    :global(.cd-col-xxl-offset-24) { margin-inline-start: 100%; }
    :global(.cd-col-xxl-order-1) { order: 1; }
    :global(.cd-col-xxl-order-2) { order: 2; }
    :global(.cd-col-xxl-order-3) { order: 3; }
    :global(.cd-col-xxl-order-4) { order: 4; }
    :global(.cd-col-xxl-order-5) { order: 5; }
    :global(.cd-col-xxl-order-6) { order: 6; }
    :global(.cd-col-xxl-order-7) { order: 7; }
    :global(.cd-col-xxl-order-8) { order: 8; }
    :global(.cd-col-xxl-order-9) { order: 9; }
    :global(.cd-col-xxl-order-10) { order: 10; }
    :global(.cd-col-xxl-order-11) { order: 11; }
    :global(.cd-col-xxl-order-12) { order: 12; }
    :global(.cd-col-xxl-order-13) { order: 13; }
    :global(.cd-col-xxl-order-14) { order: 14; }
    :global(.cd-col-xxl-order-15) { order: 15; }
    :global(.cd-col-xxl-order-16) { order: 16; }
    :global(.cd-col-xxl-order-17) { order: 17; }
    :global(.cd-col-xxl-order-18) { order: 18; }
    :global(.cd-col-xxl-order-19) { order: 19; }
    :global(.cd-col-xxl-order-20) { order: 20; }
    :global(.cd-col-xxl-order-21) { order: 21; }
    :global(.cd-col-xxl-order-22) { order: 22; }
    :global(.cd-col-xxl-order-23) { order: 23; }
    :global(.cd-col-xxl-order-24) { order: 24; }
  }
</style>
