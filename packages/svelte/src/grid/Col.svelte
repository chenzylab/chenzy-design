<!--
  Col — Row 的子列，24 栅格。严格对齐 Semi grid/col（float 布局机制）：
  响应式为纯 CSS 类驱动（cd-col-{span}、cd-col-{bp}-{span}、offset/push/pull/order
  各基础类 + 断点类），布局用 float:left + width%（非 flex-basis），
  push→left、pull→right、offset→margin-left、order→order，靠 @media (min-width) 断点层叠。
  span=0 / {bp}-0 靠 cd-col-0 / cd-col-{bp}-0 的 display:none 隐藏。
  RTL 靠 .cd-rtl 覆盖（float:right、offset margin-right）。
  从 Row context 读 gutters 施加四向 padding（水平 + 垂直，抵消 Row 负 margin）。
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
    xs?: ColResponsive;
    sm?: ColResponsive;
    md?: ColResponsive;
    lg?: ColResponsive;
    xl?: ColResponsive;
    xxl?: ColResponsive;
    class?: string;
    style?: string;
    children?: Snippet;
  }

  let {
    span,
    offset = 0,
    order = 0,
    push = 0,
    pull = 0,
    xs,
    sm,
    md,
    lg,
    xl,
    xxl,
    class: className = '',
    style = '',
    children,
  }: Props = $props();

  const context = getContext<RowContext>(ROW_CONTEXT_KEY);
  if (!context) {
    throw new Error('please make sure <Col> inside <Row>');
  }

  const PREFIX = 'cd-col';
  const SIZES: Breakpoint[] = ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'];

  // 对齐 Semi col.tsx 的 classnames 逻辑：断点 props 归一为 ColConfig，逐字段
  // 按 Semi 的真值条件（基础层 span 用 !== undefined，order/offset/push/pull 用 truthy；
  // 断点层 span 用 !== undefined，其余用 v || v === 0）生成类。
  const classes = $derived.by(() => {
    const list: string[] = [PREFIX];

    // 基础层：order/offset/push/pull 用 truthy（0 不生成基础类）；span 用 !== undefined（span=0 → cd-col-0）。
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

  // gutter 经 context 施加四向 padding（对齐 Semi Col 从 RowContext.gutters 取 padding）：
  // 水平 g0/2 左右、垂直 g1/2 上下；用户 style 追加在后可覆盖。
  const inlineStyle = $derived.by(() => {
    const g = context.getGutters();
    return [
      g[0] > 0 && `padding-left:${g[0] / 2}px;padding-right:${g[0] / 2}px`,
      g[1] > 0 && `padding-top:${g[1] / 2}px;padding-bottom:${g[1] / 2}px`,
      style,
    ]
      .filter(Boolean)
      .join(';');
  });
</script>

<div class={classes} style={inlineStyle}>
  {@render children?.()}
</div>

<style>
  /* 纯 CSS 类驱动的 24×6 栅格，逐字镜像 Semi grid.scss（float 机制）。
     动态类名靠 :global 落地（Svelte 不静态收集拼接类名）。 */

  /* base col：position:relative 供 push/pull 定位。 */
  :global(.cd-col) {
    position: relative;
  }

  /* make-grid-columns：基础/xs/sm/md/lg 的 col-N 加 min-height（gutter=0 故无 padding）。 */
  :global(.cd-col-1),
  :global(.cd-col-2),
  :global(.cd-col-3),
  :global(.cd-col-4),
  :global(.cd-col-5),
  :global(.cd-col-6),
  :global(.cd-col-7),
  :global(.cd-col-8),
  :global(.cd-col-9),
  :global(.cd-col-10),
  :global(.cd-col-11),
  :global(.cd-col-12),
  :global(.cd-col-13),
  :global(.cd-col-14),
  :global(.cd-col-15),
  :global(.cd-col-16),
  :global(.cd-col-17),
  :global(.cd-col-18),
  :global(.cd-col-19),
  :global(.cd-col-20),
  :global(.cd-col-21),
  :global(.cd-col-22),
  :global(.cd-col-23),
  :global(.cd-col-24) {
    min-height: 1px;
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

  /* float-grid-columns (base) */
  :global(.cd-col-1) { flex: 0 0 auto; float: left; }
  :global(.cd-col-2) { flex: 0 0 auto; float: left; }
  :global(.cd-col-3) { flex: 0 0 auto; float: left; }
  :global(.cd-col-4) { flex: 0 0 auto; float: left; }
  :global(.cd-col-5) { flex: 0 0 auto; float: left; }
  :global(.cd-col-6) { flex: 0 0 auto; float: left; }
  :global(.cd-col-7) { flex: 0 0 auto; float: left; }
  :global(.cd-col-8) { flex: 0 0 auto; float: left; }
  :global(.cd-col-9) { flex: 0 0 auto; float: left; }
  :global(.cd-col-10) { flex: 0 0 auto; float: left; }
  :global(.cd-col-11) { flex: 0 0 auto; float: left; }
  :global(.cd-col-12) { flex: 0 0 auto; float: left; }
  :global(.cd-col-13) { flex: 0 0 auto; float: left; }
  :global(.cd-col-14) { flex: 0 0 auto; float: left; }
  :global(.cd-col-15) { flex: 0 0 auto; float: left; }
  :global(.cd-col-16) { flex: 0 0 auto; float: left; }
  :global(.cd-col-17) { flex: 0 0 auto; float: left; }
  :global(.cd-col-18) { flex: 0 0 auto; float: left; }
  :global(.cd-col-19) { flex: 0 0 auto; float: left; }
  :global(.cd-col-20) { flex: 0 0 auto; float: left; }
  :global(.cd-col-21) { flex: 0 0 auto; float: left; }
  :global(.cd-col-22) { flex: 0 0 auto; float: left; }
  :global(.cd-col-23) { flex: 0 0 auto; float: left; }
  :global(.cd-col-24) { flex: 0 0 auto; float: left; }
  /* loop-grid-columns: width / push / pull / offset / order */
  :global(.cd-col-1) { display: block; box-sizing: border-box; width: 4.16666667%; }
  :global(.cd-col-2) { display: block; box-sizing: border-box; width: 8.33333333%; }
  :global(.cd-col-3) { display: block; box-sizing: border-box; width: 12.5%; }
  :global(.cd-col-4) { display: block; box-sizing: border-box; width: 16.66666667%; }
  :global(.cd-col-5) { display: block; box-sizing: border-box; width: 20.83333333%; }
  :global(.cd-col-6) { display: block; box-sizing: border-box; width: 25%; }
  :global(.cd-col-7) { display: block; box-sizing: border-box; width: 29.16666667%; }
  :global(.cd-col-8) { display: block; box-sizing: border-box; width: 33.33333333%; }
  :global(.cd-col-9) { display: block; box-sizing: border-box; width: 37.5%; }
  :global(.cd-col-10) { display: block; box-sizing: border-box; width: 41.66666667%; }
  :global(.cd-col-11) { display: block; box-sizing: border-box; width: 45.83333333%; }
  :global(.cd-col-12) { display: block; box-sizing: border-box; width: 50%; }
  :global(.cd-col-13) { display: block; box-sizing: border-box; width: 54.16666667%; }
  :global(.cd-col-14) { display: block; box-sizing: border-box; width: 58.33333333%; }
  :global(.cd-col-15) { display: block; box-sizing: border-box; width: 62.5%; }
  :global(.cd-col-16) { display: block; box-sizing: border-box; width: 66.66666667%; }
  :global(.cd-col-17) { display: block; box-sizing: border-box; width: 70.83333333%; }
  :global(.cd-col-18) { display: block; box-sizing: border-box; width: 75%; }
  :global(.cd-col-19) { display: block; box-sizing: border-box; width: 79.16666667%; }
  :global(.cd-col-20) { display: block; box-sizing: border-box; width: 83.33333333%; }
  :global(.cd-col-21) { display: block; box-sizing: border-box; width: 87.5%; }
  :global(.cd-col-22) { display: block; box-sizing: border-box; width: 91.66666667%; }
  :global(.cd-col-23) { display: block; box-sizing: border-box; width: 95.83333333%; }
  :global(.cd-col-24) { display: block; box-sizing: border-box; width: 100%; }
  :global(.cd-col-push-1) { left: 4.16666667%; }
  :global(.cd-col-push-2) { left: 8.33333333%; }
  :global(.cd-col-push-3) { left: 12.5%; }
  :global(.cd-col-push-4) { left: 16.66666667%; }
  :global(.cd-col-push-5) { left: 20.83333333%; }
  :global(.cd-col-push-6) { left: 25%; }
  :global(.cd-col-push-7) { left: 29.16666667%; }
  :global(.cd-col-push-8) { left: 33.33333333%; }
  :global(.cd-col-push-9) { left: 37.5%; }
  :global(.cd-col-push-10) { left: 41.66666667%; }
  :global(.cd-col-push-11) { left: 45.83333333%; }
  :global(.cd-col-push-12) { left: 50%; }
  :global(.cd-col-push-13) { left: 54.16666667%; }
  :global(.cd-col-push-14) { left: 58.33333333%; }
  :global(.cd-col-push-15) { left: 62.5%; }
  :global(.cd-col-push-16) { left: 66.66666667%; }
  :global(.cd-col-push-17) { left: 70.83333333%; }
  :global(.cd-col-push-18) { left: 75%; }
  :global(.cd-col-push-19) { left: 79.16666667%; }
  :global(.cd-col-push-20) { left: 83.33333333%; }
  :global(.cd-col-push-21) { left: 87.5%; }
  :global(.cd-col-push-22) { left: 91.66666667%; }
  :global(.cd-col-push-23) { left: 95.83333333%; }
  :global(.cd-col-push-24) { left: 100%; }
  :global(.cd-col-pull-1) { right: 4.16666667%; }
  :global(.cd-col-pull-2) { right: 8.33333333%; }
  :global(.cd-col-pull-3) { right: 12.5%; }
  :global(.cd-col-pull-4) { right: 16.66666667%; }
  :global(.cd-col-pull-5) { right: 20.83333333%; }
  :global(.cd-col-pull-6) { right: 25%; }
  :global(.cd-col-pull-7) { right: 29.16666667%; }
  :global(.cd-col-pull-8) { right: 33.33333333%; }
  :global(.cd-col-pull-9) { right: 37.5%; }
  :global(.cd-col-pull-10) { right: 41.66666667%; }
  :global(.cd-col-pull-11) { right: 45.83333333%; }
  :global(.cd-col-pull-12) { right: 50%; }
  :global(.cd-col-pull-13) { right: 54.16666667%; }
  :global(.cd-col-pull-14) { right: 58.33333333%; }
  :global(.cd-col-pull-15) { right: 62.5%; }
  :global(.cd-col-pull-16) { right: 66.66666667%; }
  :global(.cd-col-pull-17) { right: 70.83333333%; }
  :global(.cd-col-pull-18) { right: 75%; }
  :global(.cd-col-pull-19) { right: 79.16666667%; }
  :global(.cd-col-pull-20) { right: 83.33333333%; }
  :global(.cd-col-pull-21) { right: 87.5%; }
  :global(.cd-col-pull-22) { right: 91.66666667%; }
  :global(.cd-col-pull-23) { right: 95.83333333%; }
  :global(.cd-col-pull-24) { right: 100%; }
  :global(.cd-col-offset-1) { margin-left: 4.16666667%; }
  :global(.cd-col-offset-2) { margin-left: 8.33333333%; }
  :global(.cd-col-offset-3) { margin-left: 12.5%; }
  :global(.cd-col-offset-4) { margin-left: 16.66666667%; }
  :global(.cd-col-offset-5) { margin-left: 20.83333333%; }
  :global(.cd-col-offset-6) { margin-left: 25%; }
  :global(.cd-col-offset-7) { margin-left: 29.16666667%; }
  :global(.cd-col-offset-8) { margin-left: 33.33333333%; }
  :global(.cd-col-offset-9) { margin-left: 37.5%; }
  :global(.cd-col-offset-10) { margin-left: 41.66666667%; }
  :global(.cd-col-offset-11) { margin-left: 45.83333333%; }
  :global(.cd-col-offset-12) { margin-left: 50%; }
  :global(.cd-col-offset-13) { margin-left: 54.16666667%; }
  :global(.cd-col-offset-14) { margin-left: 58.33333333%; }
  :global(.cd-col-offset-15) { margin-left: 62.5%; }
  :global(.cd-col-offset-16) { margin-left: 66.66666667%; }
  :global(.cd-col-offset-17) { margin-left: 70.83333333%; }
  :global(.cd-col-offset-18) { margin-left: 75%; }
  :global(.cd-col-offset-19) { margin-left: 79.16666667%; }
  :global(.cd-col-offset-20) { margin-left: 83.33333333%; }
  :global(.cd-col-offset-21) { margin-left: 87.5%; }
  :global(.cd-col-offset-22) { margin-left: 91.66666667%; }
  :global(.cd-col-offset-23) { margin-left: 95.83333333%; }
  :global(.cd-col-offset-24) { margin-left: 100%; }
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
  /* RTL: float:right + offset 镜像 margin-right */
  :global(.cd-rtl .cd-col-1) { float: right; }
  :global(.cd-rtl .cd-col-2) { float: right; }
  :global(.cd-rtl .cd-col-3) { float: right; }
  :global(.cd-rtl .cd-col-4) { float: right; }
  :global(.cd-rtl .cd-col-5) { float: right; }
  :global(.cd-rtl .cd-col-6) { float: right; }
  :global(.cd-rtl .cd-col-7) { float: right; }
  :global(.cd-rtl .cd-col-8) { float: right; }
  :global(.cd-rtl .cd-col-9) { float: right; }
  :global(.cd-rtl .cd-col-10) { float: right; }
  :global(.cd-rtl .cd-col-11) { float: right; }
  :global(.cd-rtl .cd-col-12) { float: right; }
  :global(.cd-rtl .cd-col-13) { float: right; }
  :global(.cd-rtl .cd-col-14) { float: right; }
  :global(.cd-rtl .cd-col-15) { float: right; }
  :global(.cd-rtl .cd-col-16) { float: right; }
  :global(.cd-rtl .cd-col-17) { float: right; }
  :global(.cd-rtl .cd-col-18) { float: right; }
  :global(.cd-rtl .cd-col-19) { float: right; }
  :global(.cd-rtl .cd-col-20) { float: right; }
  :global(.cd-rtl .cd-col-21) { float: right; }
  :global(.cd-rtl .cd-col-22) { float: right; }
  :global(.cd-rtl .cd-col-23) { float: right; }
  :global(.cd-rtl .cd-col-24) { float: right; }
  :global(.cd-rtl .cd-col-offset-1) { margin-left: auto; margin-right: 4.16666667%; }
  :global(.cd-rtl .cd-col-offset-2) { margin-left: auto; margin-right: 8.33333333%; }
  :global(.cd-rtl .cd-col-offset-3) { margin-left: auto; margin-right: 12.5%; }
  :global(.cd-rtl .cd-col-offset-4) { margin-left: auto; margin-right: 16.66666667%; }
  :global(.cd-rtl .cd-col-offset-5) { margin-left: auto; margin-right: 20.83333333%; }
  :global(.cd-rtl .cd-col-offset-6) { margin-left: auto; margin-right: 25%; }
  :global(.cd-rtl .cd-col-offset-7) { margin-left: auto; margin-right: 29.16666667%; }
  :global(.cd-rtl .cd-col-offset-8) { margin-left: auto; margin-right: 33.33333333%; }
  :global(.cd-rtl .cd-col-offset-9) { margin-left: auto; margin-right: 37.5%; }
  :global(.cd-rtl .cd-col-offset-10) { margin-left: auto; margin-right: 41.66666667%; }
  :global(.cd-rtl .cd-col-offset-11) { margin-left: auto; margin-right: 45.83333333%; }
  :global(.cd-rtl .cd-col-offset-12) { margin-left: auto; margin-right: 50%; }
  :global(.cd-rtl .cd-col-offset-13) { margin-left: auto; margin-right: 54.16666667%; }
  :global(.cd-rtl .cd-col-offset-14) { margin-left: auto; margin-right: 58.33333333%; }
  :global(.cd-rtl .cd-col-offset-15) { margin-left: auto; margin-right: 62.5%; }
  :global(.cd-rtl .cd-col-offset-16) { margin-left: auto; margin-right: 66.66666667%; }
  :global(.cd-rtl .cd-col-offset-17) { margin-left: auto; margin-right: 70.83333333%; }
  :global(.cd-rtl .cd-col-offset-18) { margin-left: auto; margin-right: 75%; }
  :global(.cd-rtl .cd-col-offset-19) { margin-left: auto; margin-right: 79.16666667%; }
  :global(.cd-rtl .cd-col-offset-20) { margin-left: auto; margin-right: 83.33333333%; }
  :global(.cd-rtl .cd-col-offset-21) { margin-left: auto; margin-right: 87.5%; }
  :global(.cd-rtl .cd-col-offset-22) { margin-left: auto; margin-right: 91.66666667%; }
  :global(.cd-rtl .cd-col-offset-23) { margin-left: auto; margin-right: 95.83333333%; }
  :global(.cd-rtl .cd-col-offset-24) { margin-left: auto; margin-right: 100%; }

  /* float-grid-columns (xs) */
  :global(.cd-col-xs-1) { flex: 0 0 auto; float: left; }
  :global(.cd-col-xs-2) { flex: 0 0 auto; float: left; }
  :global(.cd-col-xs-3) { flex: 0 0 auto; float: left; }
  :global(.cd-col-xs-4) { flex: 0 0 auto; float: left; }
  :global(.cd-col-xs-5) { flex: 0 0 auto; float: left; }
  :global(.cd-col-xs-6) { flex: 0 0 auto; float: left; }
  :global(.cd-col-xs-7) { flex: 0 0 auto; float: left; }
  :global(.cd-col-xs-8) { flex: 0 0 auto; float: left; }
  :global(.cd-col-xs-9) { flex: 0 0 auto; float: left; }
  :global(.cd-col-xs-10) { flex: 0 0 auto; float: left; }
  :global(.cd-col-xs-11) { flex: 0 0 auto; float: left; }
  :global(.cd-col-xs-12) { flex: 0 0 auto; float: left; }
  :global(.cd-col-xs-13) { flex: 0 0 auto; float: left; }
  :global(.cd-col-xs-14) { flex: 0 0 auto; float: left; }
  :global(.cd-col-xs-15) { flex: 0 0 auto; float: left; }
  :global(.cd-col-xs-16) { flex: 0 0 auto; float: left; }
  :global(.cd-col-xs-17) { flex: 0 0 auto; float: left; }
  :global(.cd-col-xs-18) { flex: 0 0 auto; float: left; }
  :global(.cd-col-xs-19) { flex: 0 0 auto; float: left; }
  :global(.cd-col-xs-20) { flex: 0 0 auto; float: left; }
  :global(.cd-col-xs-21) { flex: 0 0 auto; float: left; }
  :global(.cd-col-xs-22) { flex: 0 0 auto; float: left; }
  :global(.cd-col-xs-23) { flex: 0 0 auto; float: left; }
  :global(.cd-col-xs-24) { flex: 0 0 auto; float: left; }
  /* loop-grid-columns: width / push / pull / offset / order */
  :global(.cd-col-xs-1) { display: block; box-sizing: border-box; width: 4.16666667%; }
  :global(.cd-col-xs-2) { display: block; box-sizing: border-box; width: 8.33333333%; }
  :global(.cd-col-xs-3) { display: block; box-sizing: border-box; width: 12.5%; }
  :global(.cd-col-xs-4) { display: block; box-sizing: border-box; width: 16.66666667%; }
  :global(.cd-col-xs-5) { display: block; box-sizing: border-box; width: 20.83333333%; }
  :global(.cd-col-xs-6) { display: block; box-sizing: border-box; width: 25%; }
  :global(.cd-col-xs-7) { display: block; box-sizing: border-box; width: 29.16666667%; }
  :global(.cd-col-xs-8) { display: block; box-sizing: border-box; width: 33.33333333%; }
  :global(.cd-col-xs-9) { display: block; box-sizing: border-box; width: 37.5%; }
  :global(.cd-col-xs-10) { display: block; box-sizing: border-box; width: 41.66666667%; }
  :global(.cd-col-xs-11) { display: block; box-sizing: border-box; width: 45.83333333%; }
  :global(.cd-col-xs-12) { display: block; box-sizing: border-box; width: 50%; }
  :global(.cd-col-xs-13) { display: block; box-sizing: border-box; width: 54.16666667%; }
  :global(.cd-col-xs-14) { display: block; box-sizing: border-box; width: 58.33333333%; }
  :global(.cd-col-xs-15) { display: block; box-sizing: border-box; width: 62.5%; }
  :global(.cd-col-xs-16) { display: block; box-sizing: border-box; width: 66.66666667%; }
  :global(.cd-col-xs-17) { display: block; box-sizing: border-box; width: 70.83333333%; }
  :global(.cd-col-xs-18) { display: block; box-sizing: border-box; width: 75%; }
  :global(.cd-col-xs-19) { display: block; box-sizing: border-box; width: 79.16666667%; }
  :global(.cd-col-xs-20) { display: block; box-sizing: border-box; width: 83.33333333%; }
  :global(.cd-col-xs-21) { display: block; box-sizing: border-box; width: 87.5%; }
  :global(.cd-col-xs-22) { display: block; box-sizing: border-box; width: 91.66666667%; }
  :global(.cd-col-xs-23) { display: block; box-sizing: border-box; width: 95.83333333%; }
  :global(.cd-col-xs-24) { display: block; box-sizing: border-box; width: 100%; }
  :global(.cd-col-xs-push-1) { left: 4.16666667%; }
  :global(.cd-col-xs-push-2) { left: 8.33333333%; }
  :global(.cd-col-xs-push-3) { left: 12.5%; }
  :global(.cd-col-xs-push-4) { left: 16.66666667%; }
  :global(.cd-col-xs-push-5) { left: 20.83333333%; }
  :global(.cd-col-xs-push-6) { left: 25%; }
  :global(.cd-col-xs-push-7) { left: 29.16666667%; }
  :global(.cd-col-xs-push-8) { left: 33.33333333%; }
  :global(.cd-col-xs-push-9) { left: 37.5%; }
  :global(.cd-col-xs-push-10) { left: 41.66666667%; }
  :global(.cd-col-xs-push-11) { left: 45.83333333%; }
  :global(.cd-col-xs-push-12) { left: 50%; }
  :global(.cd-col-xs-push-13) { left: 54.16666667%; }
  :global(.cd-col-xs-push-14) { left: 58.33333333%; }
  :global(.cd-col-xs-push-15) { left: 62.5%; }
  :global(.cd-col-xs-push-16) { left: 66.66666667%; }
  :global(.cd-col-xs-push-17) { left: 70.83333333%; }
  :global(.cd-col-xs-push-18) { left: 75%; }
  :global(.cd-col-xs-push-19) { left: 79.16666667%; }
  :global(.cd-col-xs-push-20) { left: 83.33333333%; }
  :global(.cd-col-xs-push-21) { left: 87.5%; }
  :global(.cd-col-xs-push-22) { left: 91.66666667%; }
  :global(.cd-col-xs-push-23) { left: 95.83333333%; }
  :global(.cd-col-xs-push-24) { left: 100%; }
  :global(.cd-col-xs-pull-1) { right: 4.16666667%; }
  :global(.cd-col-xs-pull-2) { right: 8.33333333%; }
  :global(.cd-col-xs-pull-3) { right: 12.5%; }
  :global(.cd-col-xs-pull-4) { right: 16.66666667%; }
  :global(.cd-col-xs-pull-5) { right: 20.83333333%; }
  :global(.cd-col-xs-pull-6) { right: 25%; }
  :global(.cd-col-xs-pull-7) { right: 29.16666667%; }
  :global(.cd-col-xs-pull-8) { right: 33.33333333%; }
  :global(.cd-col-xs-pull-9) { right: 37.5%; }
  :global(.cd-col-xs-pull-10) { right: 41.66666667%; }
  :global(.cd-col-xs-pull-11) { right: 45.83333333%; }
  :global(.cd-col-xs-pull-12) { right: 50%; }
  :global(.cd-col-xs-pull-13) { right: 54.16666667%; }
  :global(.cd-col-xs-pull-14) { right: 58.33333333%; }
  :global(.cd-col-xs-pull-15) { right: 62.5%; }
  :global(.cd-col-xs-pull-16) { right: 66.66666667%; }
  :global(.cd-col-xs-pull-17) { right: 70.83333333%; }
  :global(.cd-col-xs-pull-18) { right: 75%; }
  :global(.cd-col-xs-pull-19) { right: 79.16666667%; }
  :global(.cd-col-xs-pull-20) { right: 83.33333333%; }
  :global(.cd-col-xs-pull-21) { right: 87.5%; }
  :global(.cd-col-xs-pull-22) { right: 91.66666667%; }
  :global(.cd-col-xs-pull-23) { right: 95.83333333%; }
  :global(.cd-col-xs-pull-24) { right: 100%; }
  :global(.cd-col-xs-offset-1) { margin-left: 4.16666667%; }
  :global(.cd-col-xs-offset-2) { margin-left: 8.33333333%; }
  :global(.cd-col-xs-offset-3) { margin-left: 12.5%; }
  :global(.cd-col-xs-offset-4) { margin-left: 16.66666667%; }
  :global(.cd-col-xs-offset-5) { margin-left: 20.83333333%; }
  :global(.cd-col-xs-offset-6) { margin-left: 25%; }
  :global(.cd-col-xs-offset-7) { margin-left: 29.16666667%; }
  :global(.cd-col-xs-offset-8) { margin-left: 33.33333333%; }
  :global(.cd-col-xs-offset-9) { margin-left: 37.5%; }
  :global(.cd-col-xs-offset-10) { margin-left: 41.66666667%; }
  :global(.cd-col-xs-offset-11) { margin-left: 45.83333333%; }
  :global(.cd-col-xs-offset-12) { margin-left: 50%; }
  :global(.cd-col-xs-offset-13) { margin-left: 54.16666667%; }
  :global(.cd-col-xs-offset-14) { margin-left: 58.33333333%; }
  :global(.cd-col-xs-offset-15) { margin-left: 62.5%; }
  :global(.cd-col-xs-offset-16) { margin-left: 66.66666667%; }
  :global(.cd-col-xs-offset-17) { margin-left: 70.83333333%; }
  :global(.cd-col-xs-offset-18) { margin-left: 75%; }
  :global(.cd-col-xs-offset-19) { margin-left: 79.16666667%; }
  :global(.cd-col-xs-offset-20) { margin-left: 83.33333333%; }
  :global(.cd-col-xs-offset-21) { margin-left: 87.5%; }
  :global(.cd-col-xs-offset-22) { margin-left: 91.66666667%; }
  :global(.cd-col-xs-offset-23) { margin-left: 95.83333333%; }
  :global(.cd-col-xs-offset-24) { margin-left: 100%; }
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
  /* RTL: float:right + offset 镜像 margin-right */
  :global(.cd-rtl .cd-col-xs-1) { float: right; }
  :global(.cd-rtl .cd-col-xs-2) { float: right; }
  :global(.cd-rtl .cd-col-xs-3) { float: right; }
  :global(.cd-rtl .cd-col-xs-4) { float: right; }
  :global(.cd-rtl .cd-col-xs-5) { float: right; }
  :global(.cd-rtl .cd-col-xs-6) { float: right; }
  :global(.cd-rtl .cd-col-xs-7) { float: right; }
  :global(.cd-rtl .cd-col-xs-8) { float: right; }
  :global(.cd-rtl .cd-col-xs-9) { float: right; }
  :global(.cd-rtl .cd-col-xs-10) { float: right; }
  :global(.cd-rtl .cd-col-xs-11) { float: right; }
  :global(.cd-rtl .cd-col-xs-12) { float: right; }
  :global(.cd-rtl .cd-col-xs-13) { float: right; }
  :global(.cd-rtl .cd-col-xs-14) { float: right; }
  :global(.cd-rtl .cd-col-xs-15) { float: right; }
  :global(.cd-rtl .cd-col-xs-16) { float: right; }
  :global(.cd-rtl .cd-col-xs-17) { float: right; }
  :global(.cd-rtl .cd-col-xs-18) { float: right; }
  :global(.cd-rtl .cd-col-xs-19) { float: right; }
  :global(.cd-rtl .cd-col-xs-20) { float: right; }
  :global(.cd-rtl .cd-col-xs-21) { float: right; }
  :global(.cd-rtl .cd-col-xs-22) { float: right; }
  :global(.cd-rtl .cd-col-xs-23) { float: right; }
  :global(.cd-rtl .cd-col-xs-24) { float: right; }
  :global(.cd-rtl .cd-col-xs-offset-1) { margin-left: auto; margin-right: 4.16666667%; }
  :global(.cd-rtl .cd-col-xs-offset-2) { margin-left: auto; margin-right: 8.33333333%; }
  :global(.cd-rtl .cd-col-xs-offset-3) { margin-left: auto; margin-right: 12.5%; }
  :global(.cd-rtl .cd-col-xs-offset-4) { margin-left: auto; margin-right: 16.66666667%; }
  :global(.cd-rtl .cd-col-xs-offset-5) { margin-left: auto; margin-right: 20.83333333%; }
  :global(.cd-rtl .cd-col-xs-offset-6) { margin-left: auto; margin-right: 25%; }
  :global(.cd-rtl .cd-col-xs-offset-7) { margin-left: auto; margin-right: 29.16666667%; }
  :global(.cd-rtl .cd-col-xs-offset-8) { margin-left: auto; margin-right: 33.33333333%; }
  :global(.cd-rtl .cd-col-xs-offset-9) { margin-left: auto; margin-right: 37.5%; }
  :global(.cd-rtl .cd-col-xs-offset-10) { margin-left: auto; margin-right: 41.66666667%; }
  :global(.cd-rtl .cd-col-xs-offset-11) { margin-left: auto; margin-right: 45.83333333%; }
  :global(.cd-rtl .cd-col-xs-offset-12) { margin-left: auto; margin-right: 50%; }
  :global(.cd-rtl .cd-col-xs-offset-13) { margin-left: auto; margin-right: 54.16666667%; }
  :global(.cd-rtl .cd-col-xs-offset-14) { margin-left: auto; margin-right: 58.33333333%; }
  :global(.cd-rtl .cd-col-xs-offset-15) { margin-left: auto; margin-right: 62.5%; }
  :global(.cd-rtl .cd-col-xs-offset-16) { margin-left: auto; margin-right: 66.66666667%; }
  :global(.cd-rtl .cd-col-xs-offset-17) { margin-left: auto; margin-right: 70.83333333%; }
  :global(.cd-rtl .cd-col-xs-offset-18) { margin-left: auto; margin-right: 75%; }
  :global(.cd-rtl .cd-col-xs-offset-19) { margin-left: auto; margin-right: 79.16666667%; }
  :global(.cd-rtl .cd-col-xs-offset-20) { margin-left: auto; margin-right: 83.33333333%; }
  :global(.cd-rtl .cd-col-xs-offset-21) { margin-left: auto; margin-right: 87.5%; }
  :global(.cd-rtl .cd-col-xs-offset-22) { margin-left: auto; margin-right: 91.66666667%; }
  :global(.cd-rtl .cd-col-xs-offset-23) { margin-left: auto; margin-right: 95.83333333%; }
  :global(.cd-rtl .cd-col-xs-offset-24) { margin-left: auto; margin-right: 100%; }

  @media (min-width: 576px) {
    /* float-grid-columns (sm) */
    :global(.cd-col-sm-1) { flex: 0 0 auto; float: left; }
    :global(.cd-col-sm-2) { flex: 0 0 auto; float: left; }
    :global(.cd-col-sm-3) { flex: 0 0 auto; float: left; }
    :global(.cd-col-sm-4) { flex: 0 0 auto; float: left; }
    :global(.cd-col-sm-5) { flex: 0 0 auto; float: left; }
    :global(.cd-col-sm-6) { flex: 0 0 auto; float: left; }
    :global(.cd-col-sm-7) { flex: 0 0 auto; float: left; }
    :global(.cd-col-sm-8) { flex: 0 0 auto; float: left; }
    :global(.cd-col-sm-9) { flex: 0 0 auto; float: left; }
    :global(.cd-col-sm-10) { flex: 0 0 auto; float: left; }
    :global(.cd-col-sm-11) { flex: 0 0 auto; float: left; }
    :global(.cd-col-sm-12) { flex: 0 0 auto; float: left; }
    :global(.cd-col-sm-13) { flex: 0 0 auto; float: left; }
    :global(.cd-col-sm-14) { flex: 0 0 auto; float: left; }
    :global(.cd-col-sm-15) { flex: 0 0 auto; float: left; }
    :global(.cd-col-sm-16) { flex: 0 0 auto; float: left; }
    :global(.cd-col-sm-17) { flex: 0 0 auto; float: left; }
    :global(.cd-col-sm-18) { flex: 0 0 auto; float: left; }
    :global(.cd-col-sm-19) { flex: 0 0 auto; float: left; }
    :global(.cd-col-sm-20) { flex: 0 0 auto; float: left; }
    :global(.cd-col-sm-21) { flex: 0 0 auto; float: left; }
    :global(.cd-col-sm-22) { flex: 0 0 auto; float: left; }
    :global(.cd-col-sm-23) { flex: 0 0 auto; float: left; }
    :global(.cd-col-sm-24) { flex: 0 0 auto; float: left; }
    /* loop-grid-columns: width / push / pull / offset / order */
    :global(.cd-col-sm-1) { display: block; box-sizing: border-box; width: 4.16666667%; }
    :global(.cd-col-sm-2) { display: block; box-sizing: border-box; width: 8.33333333%; }
    :global(.cd-col-sm-3) { display: block; box-sizing: border-box; width: 12.5%; }
    :global(.cd-col-sm-4) { display: block; box-sizing: border-box; width: 16.66666667%; }
    :global(.cd-col-sm-5) { display: block; box-sizing: border-box; width: 20.83333333%; }
    :global(.cd-col-sm-6) { display: block; box-sizing: border-box; width: 25%; }
    :global(.cd-col-sm-7) { display: block; box-sizing: border-box; width: 29.16666667%; }
    :global(.cd-col-sm-8) { display: block; box-sizing: border-box; width: 33.33333333%; }
    :global(.cd-col-sm-9) { display: block; box-sizing: border-box; width: 37.5%; }
    :global(.cd-col-sm-10) { display: block; box-sizing: border-box; width: 41.66666667%; }
    :global(.cd-col-sm-11) { display: block; box-sizing: border-box; width: 45.83333333%; }
    :global(.cd-col-sm-12) { display: block; box-sizing: border-box; width: 50%; }
    :global(.cd-col-sm-13) { display: block; box-sizing: border-box; width: 54.16666667%; }
    :global(.cd-col-sm-14) { display: block; box-sizing: border-box; width: 58.33333333%; }
    :global(.cd-col-sm-15) { display: block; box-sizing: border-box; width: 62.5%; }
    :global(.cd-col-sm-16) { display: block; box-sizing: border-box; width: 66.66666667%; }
    :global(.cd-col-sm-17) { display: block; box-sizing: border-box; width: 70.83333333%; }
    :global(.cd-col-sm-18) { display: block; box-sizing: border-box; width: 75%; }
    :global(.cd-col-sm-19) { display: block; box-sizing: border-box; width: 79.16666667%; }
    :global(.cd-col-sm-20) { display: block; box-sizing: border-box; width: 83.33333333%; }
    :global(.cd-col-sm-21) { display: block; box-sizing: border-box; width: 87.5%; }
    :global(.cd-col-sm-22) { display: block; box-sizing: border-box; width: 91.66666667%; }
    :global(.cd-col-sm-23) { display: block; box-sizing: border-box; width: 95.83333333%; }
    :global(.cd-col-sm-24) { display: block; box-sizing: border-box; width: 100%; }
    :global(.cd-col-sm-push-1) { left: 4.16666667%; }
    :global(.cd-col-sm-push-2) { left: 8.33333333%; }
    :global(.cd-col-sm-push-3) { left: 12.5%; }
    :global(.cd-col-sm-push-4) { left: 16.66666667%; }
    :global(.cd-col-sm-push-5) { left: 20.83333333%; }
    :global(.cd-col-sm-push-6) { left: 25%; }
    :global(.cd-col-sm-push-7) { left: 29.16666667%; }
    :global(.cd-col-sm-push-8) { left: 33.33333333%; }
    :global(.cd-col-sm-push-9) { left: 37.5%; }
    :global(.cd-col-sm-push-10) { left: 41.66666667%; }
    :global(.cd-col-sm-push-11) { left: 45.83333333%; }
    :global(.cd-col-sm-push-12) { left: 50%; }
    :global(.cd-col-sm-push-13) { left: 54.16666667%; }
    :global(.cd-col-sm-push-14) { left: 58.33333333%; }
    :global(.cd-col-sm-push-15) { left: 62.5%; }
    :global(.cd-col-sm-push-16) { left: 66.66666667%; }
    :global(.cd-col-sm-push-17) { left: 70.83333333%; }
    :global(.cd-col-sm-push-18) { left: 75%; }
    :global(.cd-col-sm-push-19) { left: 79.16666667%; }
    :global(.cd-col-sm-push-20) { left: 83.33333333%; }
    :global(.cd-col-sm-push-21) { left: 87.5%; }
    :global(.cd-col-sm-push-22) { left: 91.66666667%; }
    :global(.cd-col-sm-push-23) { left: 95.83333333%; }
    :global(.cd-col-sm-push-24) { left: 100%; }
    :global(.cd-col-sm-pull-1) { right: 4.16666667%; }
    :global(.cd-col-sm-pull-2) { right: 8.33333333%; }
    :global(.cd-col-sm-pull-3) { right: 12.5%; }
    :global(.cd-col-sm-pull-4) { right: 16.66666667%; }
    :global(.cd-col-sm-pull-5) { right: 20.83333333%; }
    :global(.cd-col-sm-pull-6) { right: 25%; }
    :global(.cd-col-sm-pull-7) { right: 29.16666667%; }
    :global(.cd-col-sm-pull-8) { right: 33.33333333%; }
    :global(.cd-col-sm-pull-9) { right: 37.5%; }
    :global(.cd-col-sm-pull-10) { right: 41.66666667%; }
    :global(.cd-col-sm-pull-11) { right: 45.83333333%; }
    :global(.cd-col-sm-pull-12) { right: 50%; }
    :global(.cd-col-sm-pull-13) { right: 54.16666667%; }
    :global(.cd-col-sm-pull-14) { right: 58.33333333%; }
    :global(.cd-col-sm-pull-15) { right: 62.5%; }
    :global(.cd-col-sm-pull-16) { right: 66.66666667%; }
    :global(.cd-col-sm-pull-17) { right: 70.83333333%; }
    :global(.cd-col-sm-pull-18) { right: 75%; }
    :global(.cd-col-sm-pull-19) { right: 79.16666667%; }
    :global(.cd-col-sm-pull-20) { right: 83.33333333%; }
    :global(.cd-col-sm-pull-21) { right: 87.5%; }
    :global(.cd-col-sm-pull-22) { right: 91.66666667%; }
    :global(.cd-col-sm-pull-23) { right: 95.83333333%; }
    :global(.cd-col-sm-pull-24) { right: 100%; }
    :global(.cd-col-sm-offset-1) { margin-left: 4.16666667%; }
    :global(.cd-col-sm-offset-2) { margin-left: 8.33333333%; }
    :global(.cd-col-sm-offset-3) { margin-left: 12.5%; }
    :global(.cd-col-sm-offset-4) { margin-left: 16.66666667%; }
    :global(.cd-col-sm-offset-5) { margin-left: 20.83333333%; }
    :global(.cd-col-sm-offset-6) { margin-left: 25%; }
    :global(.cd-col-sm-offset-7) { margin-left: 29.16666667%; }
    :global(.cd-col-sm-offset-8) { margin-left: 33.33333333%; }
    :global(.cd-col-sm-offset-9) { margin-left: 37.5%; }
    :global(.cd-col-sm-offset-10) { margin-left: 41.66666667%; }
    :global(.cd-col-sm-offset-11) { margin-left: 45.83333333%; }
    :global(.cd-col-sm-offset-12) { margin-left: 50%; }
    :global(.cd-col-sm-offset-13) { margin-left: 54.16666667%; }
    :global(.cd-col-sm-offset-14) { margin-left: 58.33333333%; }
    :global(.cd-col-sm-offset-15) { margin-left: 62.5%; }
    :global(.cd-col-sm-offset-16) { margin-left: 66.66666667%; }
    :global(.cd-col-sm-offset-17) { margin-left: 70.83333333%; }
    :global(.cd-col-sm-offset-18) { margin-left: 75%; }
    :global(.cd-col-sm-offset-19) { margin-left: 79.16666667%; }
    :global(.cd-col-sm-offset-20) { margin-left: 83.33333333%; }
    :global(.cd-col-sm-offset-21) { margin-left: 87.5%; }
    :global(.cd-col-sm-offset-22) { margin-left: 91.66666667%; }
    :global(.cd-col-sm-offset-23) { margin-left: 95.83333333%; }
    :global(.cd-col-sm-offset-24) { margin-left: 100%; }
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
    /* RTL: float:right + offset 镜像 margin-right */
    :global(.cd-rtl .cd-col-sm-1) { float: right; }
    :global(.cd-rtl .cd-col-sm-2) { float: right; }
    :global(.cd-rtl .cd-col-sm-3) { float: right; }
    :global(.cd-rtl .cd-col-sm-4) { float: right; }
    :global(.cd-rtl .cd-col-sm-5) { float: right; }
    :global(.cd-rtl .cd-col-sm-6) { float: right; }
    :global(.cd-rtl .cd-col-sm-7) { float: right; }
    :global(.cd-rtl .cd-col-sm-8) { float: right; }
    :global(.cd-rtl .cd-col-sm-9) { float: right; }
    :global(.cd-rtl .cd-col-sm-10) { float: right; }
    :global(.cd-rtl .cd-col-sm-11) { float: right; }
    :global(.cd-rtl .cd-col-sm-12) { float: right; }
    :global(.cd-rtl .cd-col-sm-13) { float: right; }
    :global(.cd-rtl .cd-col-sm-14) { float: right; }
    :global(.cd-rtl .cd-col-sm-15) { float: right; }
    :global(.cd-rtl .cd-col-sm-16) { float: right; }
    :global(.cd-rtl .cd-col-sm-17) { float: right; }
    :global(.cd-rtl .cd-col-sm-18) { float: right; }
    :global(.cd-rtl .cd-col-sm-19) { float: right; }
    :global(.cd-rtl .cd-col-sm-20) { float: right; }
    :global(.cd-rtl .cd-col-sm-21) { float: right; }
    :global(.cd-rtl .cd-col-sm-22) { float: right; }
    :global(.cd-rtl .cd-col-sm-23) { float: right; }
    :global(.cd-rtl .cd-col-sm-24) { float: right; }
    :global(.cd-rtl .cd-col-sm-offset-1) { margin-left: auto; margin-right: 4.16666667%; }
    :global(.cd-rtl .cd-col-sm-offset-2) { margin-left: auto; margin-right: 8.33333333%; }
    :global(.cd-rtl .cd-col-sm-offset-3) { margin-left: auto; margin-right: 12.5%; }
    :global(.cd-rtl .cd-col-sm-offset-4) { margin-left: auto; margin-right: 16.66666667%; }
    :global(.cd-rtl .cd-col-sm-offset-5) { margin-left: auto; margin-right: 20.83333333%; }
    :global(.cd-rtl .cd-col-sm-offset-6) { margin-left: auto; margin-right: 25%; }
    :global(.cd-rtl .cd-col-sm-offset-7) { margin-left: auto; margin-right: 29.16666667%; }
    :global(.cd-rtl .cd-col-sm-offset-8) { margin-left: auto; margin-right: 33.33333333%; }
    :global(.cd-rtl .cd-col-sm-offset-9) { margin-left: auto; margin-right: 37.5%; }
    :global(.cd-rtl .cd-col-sm-offset-10) { margin-left: auto; margin-right: 41.66666667%; }
    :global(.cd-rtl .cd-col-sm-offset-11) { margin-left: auto; margin-right: 45.83333333%; }
    :global(.cd-rtl .cd-col-sm-offset-12) { margin-left: auto; margin-right: 50%; }
    :global(.cd-rtl .cd-col-sm-offset-13) { margin-left: auto; margin-right: 54.16666667%; }
    :global(.cd-rtl .cd-col-sm-offset-14) { margin-left: auto; margin-right: 58.33333333%; }
    :global(.cd-rtl .cd-col-sm-offset-15) { margin-left: auto; margin-right: 62.5%; }
    :global(.cd-rtl .cd-col-sm-offset-16) { margin-left: auto; margin-right: 66.66666667%; }
    :global(.cd-rtl .cd-col-sm-offset-17) { margin-left: auto; margin-right: 70.83333333%; }
    :global(.cd-rtl .cd-col-sm-offset-18) { margin-left: auto; margin-right: 75%; }
    :global(.cd-rtl .cd-col-sm-offset-19) { margin-left: auto; margin-right: 79.16666667%; }
    :global(.cd-rtl .cd-col-sm-offset-20) { margin-left: auto; margin-right: 83.33333333%; }
    :global(.cd-rtl .cd-col-sm-offset-21) { margin-left: auto; margin-right: 87.5%; }
    :global(.cd-rtl .cd-col-sm-offset-22) { margin-left: auto; margin-right: 91.66666667%; }
    :global(.cd-rtl .cd-col-sm-offset-23) { margin-left: auto; margin-right: 95.83333333%; }
    :global(.cd-rtl .cd-col-sm-offset-24) { margin-left: auto; margin-right: 100%; }
  }

  @media (min-width: 768px) {
    /* float-grid-columns (md) */
    :global(.cd-col-md-1) { flex: 0 0 auto; float: left; }
    :global(.cd-col-md-2) { flex: 0 0 auto; float: left; }
    :global(.cd-col-md-3) { flex: 0 0 auto; float: left; }
    :global(.cd-col-md-4) { flex: 0 0 auto; float: left; }
    :global(.cd-col-md-5) { flex: 0 0 auto; float: left; }
    :global(.cd-col-md-6) { flex: 0 0 auto; float: left; }
    :global(.cd-col-md-7) { flex: 0 0 auto; float: left; }
    :global(.cd-col-md-8) { flex: 0 0 auto; float: left; }
    :global(.cd-col-md-9) { flex: 0 0 auto; float: left; }
    :global(.cd-col-md-10) { flex: 0 0 auto; float: left; }
    :global(.cd-col-md-11) { flex: 0 0 auto; float: left; }
    :global(.cd-col-md-12) { flex: 0 0 auto; float: left; }
    :global(.cd-col-md-13) { flex: 0 0 auto; float: left; }
    :global(.cd-col-md-14) { flex: 0 0 auto; float: left; }
    :global(.cd-col-md-15) { flex: 0 0 auto; float: left; }
    :global(.cd-col-md-16) { flex: 0 0 auto; float: left; }
    :global(.cd-col-md-17) { flex: 0 0 auto; float: left; }
    :global(.cd-col-md-18) { flex: 0 0 auto; float: left; }
    :global(.cd-col-md-19) { flex: 0 0 auto; float: left; }
    :global(.cd-col-md-20) { flex: 0 0 auto; float: left; }
    :global(.cd-col-md-21) { flex: 0 0 auto; float: left; }
    :global(.cd-col-md-22) { flex: 0 0 auto; float: left; }
    :global(.cd-col-md-23) { flex: 0 0 auto; float: left; }
    :global(.cd-col-md-24) { flex: 0 0 auto; float: left; }
    /* loop-grid-columns: width / push / pull / offset / order */
    :global(.cd-col-md-1) { display: block; box-sizing: border-box; width: 4.16666667%; }
    :global(.cd-col-md-2) { display: block; box-sizing: border-box; width: 8.33333333%; }
    :global(.cd-col-md-3) { display: block; box-sizing: border-box; width: 12.5%; }
    :global(.cd-col-md-4) { display: block; box-sizing: border-box; width: 16.66666667%; }
    :global(.cd-col-md-5) { display: block; box-sizing: border-box; width: 20.83333333%; }
    :global(.cd-col-md-6) { display: block; box-sizing: border-box; width: 25%; }
    :global(.cd-col-md-7) { display: block; box-sizing: border-box; width: 29.16666667%; }
    :global(.cd-col-md-8) { display: block; box-sizing: border-box; width: 33.33333333%; }
    :global(.cd-col-md-9) { display: block; box-sizing: border-box; width: 37.5%; }
    :global(.cd-col-md-10) { display: block; box-sizing: border-box; width: 41.66666667%; }
    :global(.cd-col-md-11) { display: block; box-sizing: border-box; width: 45.83333333%; }
    :global(.cd-col-md-12) { display: block; box-sizing: border-box; width: 50%; }
    :global(.cd-col-md-13) { display: block; box-sizing: border-box; width: 54.16666667%; }
    :global(.cd-col-md-14) { display: block; box-sizing: border-box; width: 58.33333333%; }
    :global(.cd-col-md-15) { display: block; box-sizing: border-box; width: 62.5%; }
    :global(.cd-col-md-16) { display: block; box-sizing: border-box; width: 66.66666667%; }
    :global(.cd-col-md-17) { display: block; box-sizing: border-box; width: 70.83333333%; }
    :global(.cd-col-md-18) { display: block; box-sizing: border-box; width: 75%; }
    :global(.cd-col-md-19) { display: block; box-sizing: border-box; width: 79.16666667%; }
    :global(.cd-col-md-20) { display: block; box-sizing: border-box; width: 83.33333333%; }
    :global(.cd-col-md-21) { display: block; box-sizing: border-box; width: 87.5%; }
    :global(.cd-col-md-22) { display: block; box-sizing: border-box; width: 91.66666667%; }
    :global(.cd-col-md-23) { display: block; box-sizing: border-box; width: 95.83333333%; }
    :global(.cd-col-md-24) { display: block; box-sizing: border-box; width: 100%; }
    :global(.cd-col-md-push-1) { left: 4.16666667%; }
    :global(.cd-col-md-push-2) { left: 8.33333333%; }
    :global(.cd-col-md-push-3) { left: 12.5%; }
    :global(.cd-col-md-push-4) { left: 16.66666667%; }
    :global(.cd-col-md-push-5) { left: 20.83333333%; }
    :global(.cd-col-md-push-6) { left: 25%; }
    :global(.cd-col-md-push-7) { left: 29.16666667%; }
    :global(.cd-col-md-push-8) { left: 33.33333333%; }
    :global(.cd-col-md-push-9) { left: 37.5%; }
    :global(.cd-col-md-push-10) { left: 41.66666667%; }
    :global(.cd-col-md-push-11) { left: 45.83333333%; }
    :global(.cd-col-md-push-12) { left: 50%; }
    :global(.cd-col-md-push-13) { left: 54.16666667%; }
    :global(.cd-col-md-push-14) { left: 58.33333333%; }
    :global(.cd-col-md-push-15) { left: 62.5%; }
    :global(.cd-col-md-push-16) { left: 66.66666667%; }
    :global(.cd-col-md-push-17) { left: 70.83333333%; }
    :global(.cd-col-md-push-18) { left: 75%; }
    :global(.cd-col-md-push-19) { left: 79.16666667%; }
    :global(.cd-col-md-push-20) { left: 83.33333333%; }
    :global(.cd-col-md-push-21) { left: 87.5%; }
    :global(.cd-col-md-push-22) { left: 91.66666667%; }
    :global(.cd-col-md-push-23) { left: 95.83333333%; }
    :global(.cd-col-md-push-24) { left: 100%; }
    :global(.cd-col-md-pull-1) { right: 4.16666667%; }
    :global(.cd-col-md-pull-2) { right: 8.33333333%; }
    :global(.cd-col-md-pull-3) { right: 12.5%; }
    :global(.cd-col-md-pull-4) { right: 16.66666667%; }
    :global(.cd-col-md-pull-5) { right: 20.83333333%; }
    :global(.cd-col-md-pull-6) { right: 25%; }
    :global(.cd-col-md-pull-7) { right: 29.16666667%; }
    :global(.cd-col-md-pull-8) { right: 33.33333333%; }
    :global(.cd-col-md-pull-9) { right: 37.5%; }
    :global(.cd-col-md-pull-10) { right: 41.66666667%; }
    :global(.cd-col-md-pull-11) { right: 45.83333333%; }
    :global(.cd-col-md-pull-12) { right: 50%; }
    :global(.cd-col-md-pull-13) { right: 54.16666667%; }
    :global(.cd-col-md-pull-14) { right: 58.33333333%; }
    :global(.cd-col-md-pull-15) { right: 62.5%; }
    :global(.cd-col-md-pull-16) { right: 66.66666667%; }
    :global(.cd-col-md-pull-17) { right: 70.83333333%; }
    :global(.cd-col-md-pull-18) { right: 75%; }
    :global(.cd-col-md-pull-19) { right: 79.16666667%; }
    :global(.cd-col-md-pull-20) { right: 83.33333333%; }
    :global(.cd-col-md-pull-21) { right: 87.5%; }
    :global(.cd-col-md-pull-22) { right: 91.66666667%; }
    :global(.cd-col-md-pull-23) { right: 95.83333333%; }
    :global(.cd-col-md-pull-24) { right: 100%; }
    :global(.cd-col-md-offset-1) { margin-left: 4.16666667%; }
    :global(.cd-col-md-offset-2) { margin-left: 8.33333333%; }
    :global(.cd-col-md-offset-3) { margin-left: 12.5%; }
    :global(.cd-col-md-offset-4) { margin-left: 16.66666667%; }
    :global(.cd-col-md-offset-5) { margin-left: 20.83333333%; }
    :global(.cd-col-md-offset-6) { margin-left: 25%; }
    :global(.cd-col-md-offset-7) { margin-left: 29.16666667%; }
    :global(.cd-col-md-offset-8) { margin-left: 33.33333333%; }
    :global(.cd-col-md-offset-9) { margin-left: 37.5%; }
    :global(.cd-col-md-offset-10) { margin-left: 41.66666667%; }
    :global(.cd-col-md-offset-11) { margin-left: 45.83333333%; }
    :global(.cd-col-md-offset-12) { margin-left: 50%; }
    :global(.cd-col-md-offset-13) { margin-left: 54.16666667%; }
    :global(.cd-col-md-offset-14) { margin-left: 58.33333333%; }
    :global(.cd-col-md-offset-15) { margin-left: 62.5%; }
    :global(.cd-col-md-offset-16) { margin-left: 66.66666667%; }
    :global(.cd-col-md-offset-17) { margin-left: 70.83333333%; }
    :global(.cd-col-md-offset-18) { margin-left: 75%; }
    :global(.cd-col-md-offset-19) { margin-left: 79.16666667%; }
    :global(.cd-col-md-offset-20) { margin-left: 83.33333333%; }
    :global(.cd-col-md-offset-21) { margin-left: 87.5%; }
    :global(.cd-col-md-offset-22) { margin-left: 91.66666667%; }
    :global(.cd-col-md-offset-23) { margin-left: 95.83333333%; }
    :global(.cd-col-md-offset-24) { margin-left: 100%; }
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
    /* RTL: float:right + offset 镜像 margin-right */
    :global(.cd-rtl .cd-col-md-1) { float: right; }
    :global(.cd-rtl .cd-col-md-2) { float: right; }
    :global(.cd-rtl .cd-col-md-3) { float: right; }
    :global(.cd-rtl .cd-col-md-4) { float: right; }
    :global(.cd-rtl .cd-col-md-5) { float: right; }
    :global(.cd-rtl .cd-col-md-6) { float: right; }
    :global(.cd-rtl .cd-col-md-7) { float: right; }
    :global(.cd-rtl .cd-col-md-8) { float: right; }
    :global(.cd-rtl .cd-col-md-9) { float: right; }
    :global(.cd-rtl .cd-col-md-10) { float: right; }
    :global(.cd-rtl .cd-col-md-11) { float: right; }
    :global(.cd-rtl .cd-col-md-12) { float: right; }
    :global(.cd-rtl .cd-col-md-13) { float: right; }
    :global(.cd-rtl .cd-col-md-14) { float: right; }
    :global(.cd-rtl .cd-col-md-15) { float: right; }
    :global(.cd-rtl .cd-col-md-16) { float: right; }
    :global(.cd-rtl .cd-col-md-17) { float: right; }
    :global(.cd-rtl .cd-col-md-18) { float: right; }
    :global(.cd-rtl .cd-col-md-19) { float: right; }
    :global(.cd-rtl .cd-col-md-20) { float: right; }
    :global(.cd-rtl .cd-col-md-21) { float: right; }
    :global(.cd-rtl .cd-col-md-22) { float: right; }
    :global(.cd-rtl .cd-col-md-23) { float: right; }
    :global(.cd-rtl .cd-col-md-24) { float: right; }
    :global(.cd-rtl .cd-col-md-offset-1) { margin-left: auto; margin-right: 4.16666667%; }
    :global(.cd-rtl .cd-col-md-offset-2) { margin-left: auto; margin-right: 8.33333333%; }
    :global(.cd-rtl .cd-col-md-offset-3) { margin-left: auto; margin-right: 12.5%; }
    :global(.cd-rtl .cd-col-md-offset-4) { margin-left: auto; margin-right: 16.66666667%; }
    :global(.cd-rtl .cd-col-md-offset-5) { margin-left: auto; margin-right: 20.83333333%; }
    :global(.cd-rtl .cd-col-md-offset-6) { margin-left: auto; margin-right: 25%; }
    :global(.cd-rtl .cd-col-md-offset-7) { margin-left: auto; margin-right: 29.16666667%; }
    :global(.cd-rtl .cd-col-md-offset-8) { margin-left: auto; margin-right: 33.33333333%; }
    :global(.cd-rtl .cd-col-md-offset-9) { margin-left: auto; margin-right: 37.5%; }
    :global(.cd-rtl .cd-col-md-offset-10) { margin-left: auto; margin-right: 41.66666667%; }
    :global(.cd-rtl .cd-col-md-offset-11) { margin-left: auto; margin-right: 45.83333333%; }
    :global(.cd-rtl .cd-col-md-offset-12) { margin-left: auto; margin-right: 50%; }
    :global(.cd-rtl .cd-col-md-offset-13) { margin-left: auto; margin-right: 54.16666667%; }
    :global(.cd-rtl .cd-col-md-offset-14) { margin-left: auto; margin-right: 58.33333333%; }
    :global(.cd-rtl .cd-col-md-offset-15) { margin-left: auto; margin-right: 62.5%; }
    :global(.cd-rtl .cd-col-md-offset-16) { margin-left: auto; margin-right: 66.66666667%; }
    :global(.cd-rtl .cd-col-md-offset-17) { margin-left: auto; margin-right: 70.83333333%; }
    :global(.cd-rtl .cd-col-md-offset-18) { margin-left: auto; margin-right: 75%; }
    :global(.cd-rtl .cd-col-md-offset-19) { margin-left: auto; margin-right: 79.16666667%; }
    :global(.cd-rtl .cd-col-md-offset-20) { margin-left: auto; margin-right: 83.33333333%; }
    :global(.cd-rtl .cd-col-md-offset-21) { margin-left: auto; margin-right: 87.5%; }
    :global(.cd-rtl .cd-col-md-offset-22) { margin-left: auto; margin-right: 91.66666667%; }
    :global(.cd-rtl .cd-col-md-offset-23) { margin-left: auto; margin-right: 95.83333333%; }
    :global(.cd-rtl .cd-col-md-offset-24) { margin-left: auto; margin-right: 100%; }
  }

  @media (min-width: 992px) {
    /* float-grid-columns (lg) */
    :global(.cd-col-lg-1) { flex: 0 0 auto; float: left; }
    :global(.cd-col-lg-2) { flex: 0 0 auto; float: left; }
    :global(.cd-col-lg-3) { flex: 0 0 auto; float: left; }
    :global(.cd-col-lg-4) { flex: 0 0 auto; float: left; }
    :global(.cd-col-lg-5) { flex: 0 0 auto; float: left; }
    :global(.cd-col-lg-6) { flex: 0 0 auto; float: left; }
    :global(.cd-col-lg-7) { flex: 0 0 auto; float: left; }
    :global(.cd-col-lg-8) { flex: 0 0 auto; float: left; }
    :global(.cd-col-lg-9) { flex: 0 0 auto; float: left; }
    :global(.cd-col-lg-10) { flex: 0 0 auto; float: left; }
    :global(.cd-col-lg-11) { flex: 0 0 auto; float: left; }
    :global(.cd-col-lg-12) { flex: 0 0 auto; float: left; }
    :global(.cd-col-lg-13) { flex: 0 0 auto; float: left; }
    :global(.cd-col-lg-14) { flex: 0 0 auto; float: left; }
    :global(.cd-col-lg-15) { flex: 0 0 auto; float: left; }
    :global(.cd-col-lg-16) { flex: 0 0 auto; float: left; }
    :global(.cd-col-lg-17) { flex: 0 0 auto; float: left; }
    :global(.cd-col-lg-18) { flex: 0 0 auto; float: left; }
    :global(.cd-col-lg-19) { flex: 0 0 auto; float: left; }
    :global(.cd-col-lg-20) { flex: 0 0 auto; float: left; }
    :global(.cd-col-lg-21) { flex: 0 0 auto; float: left; }
    :global(.cd-col-lg-22) { flex: 0 0 auto; float: left; }
    :global(.cd-col-lg-23) { flex: 0 0 auto; float: left; }
    :global(.cd-col-lg-24) { flex: 0 0 auto; float: left; }
    /* loop-grid-columns: width / push / pull / offset / order */
    :global(.cd-col-lg-1) { display: block; box-sizing: border-box; width: 4.16666667%; }
    :global(.cd-col-lg-2) { display: block; box-sizing: border-box; width: 8.33333333%; }
    :global(.cd-col-lg-3) { display: block; box-sizing: border-box; width: 12.5%; }
    :global(.cd-col-lg-4) { display: block; box-sizing: border-box; width: 16.66666667%; }
    :global(.cd-col-lg-5) { display: block; box-sizing: border-box; width: 20.83333333%; }
    :global(.cd-col-lg-6) { display: block; box-sizing: border-box; width: 25%; }
    :global(.cd-col-lg-7) { display: block; box-sizing: border-box; width: 29.16666667%; }
    :global(.cd-col-lg-8) { display: block; box-sizing: border-box; width: 33.33333333%; }
    :global(.cd-col-lg-9) { display: block; box-sizing: border-box; width: 37.5%; }
    :global(.cd-col-lg-10) { display: block; box-sizing: border-box; width: 41.66666667%; }
    :global(.cd-col-lg-11) { display: block; box-sizing: border-box; width: 45.83333333%; }
    :global(.cd-col-lg-12) { display: block; box-sizing: border-box; width: 50%; }
    :global(.cd-col-lg-13) { display: block; box-sizing: border-box; width: 54.16666667%; }
    :global(.cd-col-lg-14) { display: block; box-sizing: border-box; width: 58.33333333%; }
    :global(.cd-col-lg-15) { display: block; box-sizing: border-box; width: 62.5%; }
    :global(.cd-col-lg-16) { display: block; box-sizing: border-box; width: 66.66666667%; }
    :global(.cd-col-lg-17) { display: block; box-sizing: border-box; width: 70.83333333%; }
    :global(.cd-col-lg-18) { display: block; box-sizing: border-box; width: 75%; }
    :global(.cd-col-lg-19) { display: block; box-sizing: border-box; width: 79.16666667%; }
    :global(.cd-col-lg-20) { display: block; box-sizing: border-box; width: 83.33333333%; }
    :global(.cd-col-lg-21) { display: block; box-sizing: border-box; width: 87.5%; }
    :global(.cd-col-lg-22) { display: block; box-sizing: border-box; width: 91.66666667%; }
    :global(.cd-col-lg-23) { display: block; box-sizing: border-box; width: 95.83333333%; }
    :global(.cd-col-lg-24) { display: block; box-sizing: border-box; width: 100%; }
    :global(.cd-col-lg-push-1) { left: 4.16666667%; }
    :global(.cd-col-lg-push-2) { left: 8.33333333%; }
    :global(.cd-col-lg-push-3) { left: 12.5%; }
    :global(.cd-col-lg-push-4) { left: 16.66666667%; }
    :global(.cd-col-lg-push-5) { left: 20.83333333%; }
    :global(.cd-col-lg-push-6) { left: 25%; }
    :global(.cd-col-lg-push-7) { left: 29.16666667%; }
    :global(.cd-col-lg-push-8) { left: 33.33333333%; }
    :global(.cd-col-lg-push-9) { left: 37.5%; }
    :global(.cd-col-lg-push-10) { left: 41.66666667%; }
    :global(.cd-col-lg-push-11) { left: 45.83333333%; }
    :global(.cd-col-lg-push-12) { left: 50%; }
    :global(.cd-col-lg-push-13) { left: 54.16666667%; }
    :global(.cd-col-lg-push-14) { left: 58.33333333%; }
    :global(.cd-col-lg-push-15) { left: 62.5%; }
    :global(.cd-col-lg-push-16) { left: 66.66666667%; }
    :global(.cd-col-lg-push-17) { left: 70.83333333%; }
    :global(.cd-col-lg-push-18) { left: 75%; }
    :global(.cd-col-lg-push-19) { left: 79.16666667%; }
    :global(.cd-col-lg-push-20) { left: 83.33333333%; }
    :global(.cd-col-lg-push-21) { left: 87.5%; }
    :global(.cd-col-lg-push-22) { left: 91.66666667%; }
    :global(.cd-col-lg-push-23) { left: 95.83333333%; }
    :global(.cd-col-lg-push-24) { left: 100%; }
    :global(.cd-col-lg-pull-1) { right: 4.16666667%; }
    :global(.cd-col-lg-pull-2) { right: 8.33333333%; }
    :global(.cd-col-lg-pull-3) { right: 12.5%; }
    :global(.cd-col-lg-pull-4) { right: 16.66666667%; }
    :global(.cd-col-lg-pull-5) { right: 20.83333333%; }
    :global(.cd-col-lg-pull-6) { right: 25%; }
    :global(.cd-col-lg-pull-7) { right: 29.16666667%; }
    :global(.cd-col-lg-pull-8) { right: 33.33333333%; }
    :global(.cd-col-lg-pull-9) { right: 37.5%; }
    :global(.cd-col-lg-pull-10) { right: 41.66666667%; }
    :global(.cd-col-lg-pull-11) { right: 45.83333333%; }
    :global(.cd-col-lg-pull-12) { right: 50%; }
    :global(.cd-col-lg-pull-13) { right: 54.16666667%; }
    :global(.cd-col-lg-pull-14) { right: 58.33333333%; }
    :global(.cd-col-lg-pull-15) { right: 62.5%; }
    :global(.cd-col-lg-pull-16) { right: 66.66666667%; }
    :global(.cd-col-lg-pull-17) { right: 70.83333333%; }
    :global(.cd-col-lg-pull-18) { right: 75%; }
    :global(.cd-col-lg-pull-19) { right: 79.16666667%; }
    :global(.cd-col-lg-pull-20) { right: 83.33333333%; }
    :global(.cd-col-lg-pull-21) { right: 87.5%; }
    :global(.cd-col-lg-pull-22) { right: 91.66666667%; }
    :global(.cd-col-lg-pull-23) { right: 95.83333333%; }
    :global(.cd-col-lg-pull-24) { right: 100%; }
    :global(.cd-col-lg-offset-1) { margin-left: 4.16666667%; }
    :global(.cd-col-lg-offset-2) { margin-left: 8.33333333%; }
    :global(.cd-col-lg-offset-3) { margin-left: 12.5%; }
    :global(.cd-col-lg-offset-4) { margin-left: 16.66666667%; }
    :global(.cd-col-lg-offset-5) { margin-left: 20.83333333%; }
    :global(.cd-col-lg-offset-6) { margin-left: 25%; }
    :global(.cd-col-lg-offset-7) { margin-left: 29.16666667%; }
    :global(.cd-col-lg-offset-8) { margin-left: 33.33333333%; }
    :global(.cd-col-lg-offset-9) { margin-left: 37.5%; }
    :global(.cd-col-lg-offset-10) { margin-left: 41.66666667%; }
    :global(.cd-col-lg-offset-11) { margin-left: 45.83333333%; }
    :global(.cd-col-lg-offset-12) { margin-left: 50%; }
    :global(.cd-col-lg-offset-13) { margin-left: 54.16666667%; }
    :global(.cd-col-lg-offset-14) { margin-left: 58.33333333%; }
    :global(.cd-col-lg-offset-15) { margin-left: 62.5%; }
    :global(.cd-col-lg-offset-16) { margin-left: 66.66666667%; }
    :global(.cd-col-lg-offset-17) { margin-left: 70.83333333%; }
    :global(.cd-col-lg-offset-18) { margin-left: 75%; }
    :global(.cd-col-lg-offset-19) { margin-left: 79.16666667%; }
    :global(.cd-col-lg-offset-20) { margin-left: 83.33333333%; }
    :global(.cd-col-lg-offset-21) { margin-left: 87.5%; }
    :global(.cd-col-lg-offset-22) { margin-left: 91.66666667%; }
    :global(.cd-col-lg-offset-23) { margin-left: 95.83333333%; }
    :global(.cd-col-lg-offset-24) { margin-left: 100%; }
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
    /* RTL: float:right + offset 镜像 margin-right */
    :global(.cd-rtl .cd-col-lg-1) { float: right; }
    :global(.cd-rtl .cd-col-lg-2) { float: right; }
    :global(.cd-rtl .cd-col-lg-3) { float: right; }
    :global(.cd-rtl .cd-col-lg-4) { float: right; }
    :global(.cd-rtl .cd-col-lg-5) { float: right; }
    :global(.cd-rtl .cd-col-lg-6) { float: right; }
    :global(.cd-rtl .cd-col-lg-7) { float: right; }
    :global(.cd-rtl .cd-col-lg-8) { float: right; }
    :global(.cd-rtl .cd-col-lg-9) { float: right; }
    :global(.cd-rtl .cd-col-lg-10) { float: right; }
    :global(.cd-rtl .cd-col-lg-11) { float: right; }
    :global(.cd-rtl .cd-col-lg-12) { float: right; }
    :global(.cd-rtl .cd-col-lg-13) { float: right; }
    :global(.cd-rtl .cd-col-lg-14) { float: right; }
    :global(.cd-rtl .cd-col-lg-15) { float: right; }
    :global(.cd-rtl .cd-col-lg-16) { float: right; }
    :global(.cd-rtl .cd-col-lg-17) { float: right; }
    :global(.cd-rtl .cd-col-lg-18) { float: right; }
    :global(.cd-rtl .cd-col-lg-19) { float: right; }
    :global(.cd-rtl .cd-col-lg-20) { float: right; }
    :global(.cd-rtl .cd-col-lg-21) { float: right; }
    :global(.cd-rtl .cd-col-lg-22) { float: right; }
    :global(.cd-rtl .cd-col-lg-23) { float: right; }
    :global(.cd-rtl .cd-col-lg-24) { float: right; }
    :global(.cd-rtl .cd-col-lg-offset-1) { margin-left: auto; margin-right: 4.16666667%; }
    :global(.cd-rtl .cd-col-lg-offset-2) { margin-left: auto; margin-right: 8.33333333%; }
    :global(.cd-rtl .cd-col-lg-offset-3) { margin-left: auto; margin-right: 12.5%; }
    :global(.cd-rtl .cd-col-lg-offset-4) { margin-left: auto; margin-right: 16.66666667%; }
    :global(.cd-rtl .cd-col-lg-offset-5) { margin-left: auto; margin-right: 20.83333333%; }
    :global(.cd-rtl .cd-col-lg-offset-6) { margin-left: auto; margin-right: 25%; }
    :global(.cd-rtl .cd-col-lg-offset-7) { margin-left: auto; margin-right: 29.16666667%; }
    :global(.cd-rtl .cd-col-lg-offset-8) { margin-left: auto; margin-right: 33.33333333%; }
    :global(.cd-rtl .cd-col-lg-offset-9) { margin-left: auto; margin-right: 37.5%; }
    :global(.cd-rtl .cd-col-lg-offset-10) { margin-left: auto; margin-right: 41.66666667%; }
    :global(.cd-rtl .cd-col-lg-offset-11) { margin-left: auto; margin-right: 45.83333333%; }
    :global(.cd-rtl .cd-col-lg-offset-12) { margin-left: auto; margin-right: 50%; }
    :global(.cd-rtl .cd-col-lg-offset-13) { margin-left: auto; margin-right: 54.16666667%; }
    :global(.cd-rtl .cd-col-lg-offset-14) { margin-left: auto; margin-right: 58.33333333%; }
    :global(.cd-rtl .cd-col-lg-offset-15) { margin-left: auto; margin-right: 62.5%; }
    :global(.cd-rtl .cd-col-lg-offset-16) { margin-left: auto; margin-right: 66.66666667%; }
    :global(.cd-rtl .cd-col-lg-offset-17) { margin-left: auto; margin-right: 70.83333333%; }
    :global(.cd-rtl .cd-col-lg-offset-18) { margin-left: auto; margin-right: 75%; }
    :global(.cd-rtl .cd-col-lg-offset-19) { margin-left: auto; margin-right: 79.16666667%; }
    :global(.cd-rtl .cd-col-lg-offset-20) { margin-left: auto; margin-right: 83.33333333%; }
    :global(.cd-rtl .cd-col-lg-offset-21) { margin-left: auto; margin-right: 87.5%; }
    :global(.cd-rtl .cd-col-lg-offset-22) { margin-left: auto; margin-right: 91.66666667%; }
    :global(.cd-rtl .cd-col-lg-offset-23) { margin-left: auto; margin-right: 95.83333333%; }
    :global(.cd-rtl .cd-col-lg-offset-24) { margin-left: auto; margin-right: 100%; }
  }

  @media (min-width: 1200px) {
    /* float-grid-columns (xl) */
    :global(.cd-col-xl-1) { flex: 0 0 auto; float: left; }
    :global(.cd-col-xl-2) { flex: 0 0 auto; float: left; }
    :global(.cd-col-xl-3) { flex: 0 0 auto; float: left; }
    :global(.cd-col-xl-4) { flex: 0 0 auto; float: left; }
    :global(.cd-col-xl-5) { flex: 0 0 auto; float: left; }
    :global(.cd-col-xl-6) { flex: 0 0 auto; float: left; }
    :global(.cd-col-xl-7) { flex: 0 0 auto; float: left; }
    :global(.cd-col-xl-8) { flex: 0 0 auto; float: left; }
    :global(.cd-col-xl-9) { flex: 0 0 auto; float: left; }
    :global(.cd-col-xl-10) { flex: 0 0 auto; float: left; }
    :global(.cd-col-xl-11) { flex: 0 0 auto; float: left; }
    :global(.cd-col-xl-12) { flex: 0 0 auto; float: left; }
    :global(.cd-col-xl-13) { flex: 0 0 auto; float: left; }
    :global(.cd-col-xl-14) { flex: 0 0 auto; float: left; }
    :global(.cd-col-xl-15) { flex: 0 0 auto; float: left; }
    :global(.cd-col-xl-16) { flex: 0 0 auto; float: left; }
    :global(.cd-col-xl-17) { flex: 0 0 auto; float: left; }
    :global(.cd-col-xl-18) { flex: 0 0 auto; float: left; }
    :global(.cd-col-xl-19) { flex: 0 0 auto; float: left; }
    :global(.cd-col-xl-20) { flex: 0 0 auto; float: left; }
    :global(.cd-col-xl-21) { flex: 0 0 auto; float: left; }
    :global(.cd-col-xl-22) { flex: 0 0 auto; float: left; }
    :global(.cd-col-xl-23) { flex: 0 0 auto; float: left; }
    :global(.cd-col-xl-24) { flex: 0 0 auto; float: left; }
    /* loop-grid-columns: width / push / pull / offset / order */
    :global(.cd-col-xl-1) { display: block; box-sizing: border-box; width: 4.16666667%; }
    :global(.cd-col-xl-2) { display: block; box-sizing: border-box; width: 8.33333333%; }
    :global(.cd-col-xl-3) { display: block; box-sizing: border-box; width: 12.5%; }
    :global(.cd-col-xl-4) { display: block; box-sizing: border-box; width: 16.66666667%; }
    :global(.cd-col-xl-5) { display: block; box-sizing: border-box; width: 20.83333333%; }
    :global(.cd-col-xl-6) { display: block; box-sizing: border-box; width: 25%; }
    :global(.cd-col-xl-7) { display: block; box-sizing: border-box; width: 29.16666667%; }
    :global(.cd-col-xl-8) { display: block; box-sizing: border-box; width: 33.33333333%; }
    :global(.cd-col-xl-9) { display: block; box-sizing: border-box; width: 37.5%; }
    :global(.cd-col-xl-10) { display: block; box-sizing: border-box; width: 41.66666667%; }
    :global(.cd-col-xl-11) { display: block; box-sizing: border-box; width: 45.83333333%; }
    :global(.cd-col-xl-12) { display: block; box-sizing: border-box; width: 50%; }
    :global(.cd-col-xl-13) { display: block; box-sizing: border-box; width: 54.16666667%; }
    :global(.cd-col-xl-14) { display: block; box-sizing: border-box; width: 58.33333333%; }
    :global(.cd-col-xl-15) { display: block; box-sizing: border-box; width: 62.5%; }
    :global(.cd-col-xl-16) { display: block; box-sizing: border-box; width: 66.66666667%; }
    :global(.cd-col-xl-17) { display: block; box-sizing: border-box; width: 70.83333333%; }
    :global(.cd-col-xl-18) { display: block; box-sizing: border-box; width: 75%; }
    :global(.cd-col-xl-19) { display: block; box-sizing: border-box; width: 79.16666667%; }
    :global(.cd-col-xl-20) { display: block; box-sizing: border-box; width: 83.33333333%; }
    :global(.cd-col-xl-21) { display: block; box-sizing: border-box; width: 87.5%; }
    :global(.cd-col-xl-22) { display: block; box-sizing: border-box; width: 91.66666667%; }
    :global(.cd-col-xl-23) { display: block; box-sizing: border-box; width: 95.83333333%; }
    :global(.cd-col-xl-24) { display: block; box-sizing: border-box; width: 100%; }
    :global(.cd-col-xl-push-1) { left: 4.16666667%; }
    :global(.cd-col-xl-push-2) { left: 8.33333333%; }
    :global(.cd-col-xl-push-3) { left: 12.5%; }
    :global(.cd-col-xl-push-4) { left: 16.66666667%; }
    :global(.cd-col-xl-push-5) { left: 20.83333333%; }
    :global(.cd-col-xl-push-6) { left: 25%; }
    :global(.cd-col-xl-push-7) { left: 29.16666667%; }
    :global(.cd-col-xl-push-8) { left: 33.33333333%; }
    :global(.cd-col-xl-push-9) { left: 37.5%; }
    :global(.cd-col-xl-push-10) { left: 41.66666667%; }
    :global(.cd-col-xl-push-11) { left: 45.83333333%; }
    :global(.cd-col-xl-push-12) { left: 50%; }
    :global(.cd-col-xl-push-13) { left: 54.16666667%; }
    :global(.cd-col-xl-push-14) { left: 58.33333333%; }
    :global(.cd-col-xl-push-15) { left: 62.5%; }
    :global(.cd-col-xl-push-16) { left: 66.66666667%; }
    :global(.cd-col-xl-push-17) { left: 70.83333333%; }
    :global(.cd-col-xl-push-18) { left: 75%; }
    :global(.cd-col-xl-push-19) { left: 79.16666667%; }
    :global(.cd-col-xl-push-20) { left: 83.33333333%; }
    :global(.cd-col-xl-push-21) { left: 87.5%; }
    :global(.cd-col-xl-push-22) { left: 91.66666667%; }
    :global(.cd-col-xl-push-23) { left: 95.83333333%; }
    :global(.cd-col-xl-push-24) { left: 100%; }
    :global(.cd-col-xl-pull-1) { right: 4.16666667%; }
    :global(.cd-col-xl-pull-2) { right: 8.33333333%; }
    :global(.cd-col-xl-pull-3) { right: 12.5%; }
    :global(.cd-col-xl-pull-4) { right: 16.66666667%; }
    :global(.cd-col-xl-pull-5) { right: 20.83333333%; }
    :global(.cd-col-xl-pull-6) { right: 25%; }
    :global(.cd-col-xl-pull-7) { right: 29.16666667%; }
    :global(.cd-col-xl-pull-8) { right: 33.33333333%; }
    :global(.cd-col-xl-pull-9) { right: 37.5%; }
    :global(.cd-col-xl-pull-10) { right: 41.66666667%; }
    :global(.cd-col-xl-pull-11) { right: 45.83333333%; }
    :global(.cd-col-xl-pull-12) { right: 50%; }
    :global(.cd-col-xl-pull-13) { right: 54.16666667%; }
    :global(.cd-col-xl-pull-14) { right: 58.33333333%; }
    :global(.cd-col-xl-pull-15) { right: 62.5%; }
    :global(.cd-col-xl-pull-16) { right: 66.66666667%; }
    :global(.cd-col-xl-pull-17) { right: 70.83333333%; }
    :global(.cd-col-xl-pull-18) { right: 75%; }
    :global(.cd-col-xl-pull-19) { right: 79.16666667%; }
    :global(.cd-col-xl-pull-20) { right: 83.33333333%; }
    :global(.cd-col-xl-pull-21) { right: 87.5%; }
    :global(.cd-col-xl-pull-22) { right: 91.66666667%; }
    :global(.cd-col-xl-pull-23) { right: 95.83333333%; }
    :global(.cd-col-xl-pull-24) { right: 100%; }
    :global(.cd-col-xl-offset-1) { margin-left: 4.16666667%; }
    :global(.cd-col-xl-offset-2) { margin-left: 8.33333333%; }
    :global(.cd-col-xl-offset-3) { margin-left: 12.5%; }
    :global(.cd-col-xl-offset-4) { margin-left: 16.66666667%; }
    :global(.cd-col-xl-offset-5) { margin-left: 20.83333333%; }
    :global(.cd-col-xl-offset-6) { margin-left: 25%; }
    :global(.cd-col-xl-offset-7) { margin-left: 29.16666667%; }
    :global(.cd-col-xl-offset-8) { margin-left: 33.33333333%; }
    :global(.cd-col-xl-offset-9) { margin-left: 37.5%; }
    :global(.cd-col-xl-offset-10) { margin-left: 41.66666667%; }
    :global(.cd-col-xl-offset-11) { margin-left: 45.83333333%; }
    :global(.cd-col-xl-offset-12) { margin-left: 50%; }
    :global(.cd-col-xl-offset-13) { margin-left: 54.16666667%; }
    :global(.cd-col-xl-offset-14) { margin-left: 58.33333333%; }
    :global(.cd-col-xl-offset-15) { margin-left: 62.5%; }
    :global(.cd-col-xl-offset-16) { margin-left: 66.66666667%; }
    :global(.cd-col-xl-offset-17) { margin-left: 70.83333333%; }
    :global(.cd-col-xl-offset-18) { margin-left: 75%; }
    :global(.cd-col-xl-offset-19) { margin-left: 79.16666667%; }
    :global(.cd-col-xl-offset-20) { margin-left: 83.33333333%; }
    :global(.cd-col-xl-offset-21) { margin-left: 87.5%; }
    :global(.cd-col-xl-offset-22) { margin-left: 91.66666667%; }
    :global(.cd-col-xl-offset-23) { margin-left: 95.83333333%; }
    :global(.cd-col-xl-offset-24) { margin-left: 100%; }
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
    /* RTL: float:right + offset 镜像 margin-right */
    :global(.cd-rtl .cd-col-xl-1) { float: right; }
    :global(.cd-rtl .cd-col-xl-2) { float: right; }
    :global(.cd-rtl .cd-col-xl-3) { float: right; }
    :global(.cd-rtl .cd-col-xl-4) { float: right; }
    :global(.cd-rtl .cd-col-xl-5) { float: right; }
    :global(.cd-rtl .cd-col-xl-6) { float: right; }
    :global(.cd-rtl .cd-col-xl-7) { float: right; }
    :global(.cd-rtl .cd-col-xl-8) { float: right; }
    :global(.cd-rtl .cd-col-xl-9) { float: right; }
    :global(.cd-rtl .cd-col-xl-10) { float: right; }
    :global(.cd-rtl .cd-col-xl-11) { float: right; }
    :global(.cd-rtl .cd-col-xl-12) { float: right; }
    :global(.cd-rtl .cd-col-xl-13) { float: right; }
    :global(.cd-rtl .cd-col-xl-14) { float: right; }
    :global(.cd-rtl .cd-col-xl-15) { float: right; }
    :global(.cd-rtl .cd-col-xl-16) { float: right; }
    :global(.cd-rtl .cd-col-xl-17) { float: right; }
    :global(.cd-rtl .cd-col-xl-18) { float: right; }
    :global(.cd-rtl .cd-col-xl-19) { float: right; }
    :global(.cd-rtl .cd-col-xl-20) { float: right; }
    :global(.cd-rtl .cd-col-xl-21) { float: right; }
    :global(.cd-rtl .cd-col-xl-22) { float: right; }
    :global(.cd-rtl .cd-col-xl-23) { float: right; }
    :global(.cd-rtl .cd-col-xl-24) { float: right; }
    :global(.cd-rtl .cd-col-xl-offset-1) { margin-left: auto; margin-right: 4.16666667%; }
    :global(.cd-rtl .cd-col-xl-offset-2) { margin-left: auto; margin-right: 8.33333333%; }
    :global(.cd-rtl .cd-col-xl-offset-3) { margin-left: auto; margin-right: 12.5%; }
    :global(.cd-rtl .cd-col-xl-offset-4) { margin-left: auto; margin-right: 16.66666667%; }
    :global(.cd-rtl .cd-col-xl-offset-5) { margin-left: auto; margin-right: 20.83333333%; }
    :global(.cd-rtl .cd-col-xl-offset-6) { margin-left: auto; margin-right: 25%; }
    :global(.cd-rtl .cd-col-xl-offset-7) { margin-left: auto; margin-right: 29.16666667%; }
    :global(.cd-rtl .cd-col-xl-offset-8) { margin-left: auto; margin-right: 33.33333333%; }
    :global(.cd-rtl .cd-col-xl-offset-9) { margin-left: auto; margin-right: 37.5%; }
    :global(.cd-rtl .cd-col-xl-offset-10) { margin-left: auto; margin-right: 41.66666667%; }
    :global(.cd-rtl .cd-col-xl-offset-11) { margin-left: auto; margin-right: 45.83333333%; }
    :global(.cd-rtl .cd-col-xl-offset-12) { margin-left: auto; margin-right: 50%; }
    :global(.cd-rtl .cd-col-xl-offset-13) { margin-left: auto; margin-right: 54.16666667%; }
    :global(.cd-rtl .cd-col-xl-offset-14) { margin-left: auto; margin-right: 58.33333333%; }
    :global(.cd-rtl .cd-col-xl-offset-15) { margin-left: auto; margin-right: 62.5%; }
    :global(.cd-rtl .cd-col-xl-offset-16) { margin-left: auto; margin-right: 66.66666667%; }
    :global(.cd-rtl .cd-col-xl-offset-17) { margin-left: auto; margin-right: 70.83333333%; }
    :global(.cd-rtl .cd-col-xl-offset-18) { margin-left: auto; margin-right: 75%; }
    :global(.cd-rtl .cd-col-xl-offset-19) { margin-left: auto; margin-right: 79.16666667%; }
    :global(.cd-rtl .cd-col-xl-offset-20) { margin-left: auto; margin-right: 83.33333333%; }
    :global(.cd-rtl .cd-col-xl-offset-21) { margin-left: auto; margin-right: 87.5%; }
    :global(.cd-rtl .cd-col-xl-offset-22) { margin-left: auto; margin-right: 91.66666667%; }
    :global(.cd-rtl .cd-col-xl-offset-23) { margin-left: auto; margin-right: 95.83333333%; }
    :global(.cd-rtl .cd-col-xl-offset-24) { margin-left: auto; margin-right: 100%; }
  }

  @media (min-width: 1600px) {
    /* float-grid-columns (xxl) */
    :global(.cd-col-xxl-1) { flex: 0 0 auto; float: left; }
    :global(.cd-col-xxl-2) { flex: 0 0 auto; float: left; }
    :global(.cd-col-xxl-3) { flex: 0 0 auto; float: left; }
    :global(.cd-col-xxl-4) { flex: 0 0 auto; float: left; }
    :global(.cd-col-xxl-5) { flex: 0 0 auto; float: left; }
    :global(.cd-col-xxl-6) { flex: 0 0 auto; float: left; }
    :global(.cd-col-xxl-7) { flex: 0 0 auto; float: left; }
    :global(.cd-col-xxl-8) { flex: 0 0 auto; float: left; }
    :global(.cd-col-xxl-9) { flex: 0 0 auto; float: left; }
    :global(.cd-col-xxl-10) { flex: 0 0 auto; float: left; }
    :global(.cd-col-xxl-11) { flex: 0 0 auto; float: left; }
    :global(.cd-col-xxl-12) { flex: 0 0 auto; float: left; }
    :global(.cd-col-xxl-13) { flex: 0 0 auto; float: left; }
    :global(.cd-col-xxl-14) { flex: 0 0 auto; float: left; }
    :global(.cd-col-xxl-15) { flex: 0 0 auto; float: left; }
    :global(.cd-col-xxl-16) { flex: 0 0 auto; float: left; }
    :global(.cd-col-xxl-17) { flex: 0 0 auto; float: left; }
    :global(.cd-col-xxl-18) { flex: 0 0 auto; float: left; }
    :global(.cd-col-xxl-19) { flex: 0 0 auto; float: left; }
    :global(.cd-col-xxl-20) { flex: 0 0 auto; float: left; }
    :global(.cd-col-xxl-21) { flex: 0 0 auto; float: left; }
    :global(.cd-col-xxl-22) { flex: 0 0 auto; float: left; }
    :global(.cd-col-xxl-23) { flex: 0 0 auto; float: left; }
    :global(.cd-col-xxl-24) { flex: 0 0 auto; float: left; }
    /* loop-grid-columns: width / push / pull / offset / order */
    :global(.cd-col-xxl-1) { display: block; box-sizing: border-box; width: 4.16666667%; }
    :global(.cd-col-xxl-2) { display: block; box-sizing: border-box; width: 8.33333333%; }
    :global(.cd-col-xxl-3) { display: block; box-sizing: border-box; width: 12.5%; }
    :global(.cd-col-xxl-4) { display: block; box-sizing: border-box; width: 16.66666667%; }
    :global(.cd-col-xxl-5) { display: block; box-sizing: border-box; width: 20.83333333%; }
    :global(.cd-col-xxl-6) { display: block; box-sizing: border-box; width: 25%; }
    :global(.cd-col-xxl-7) { display: block; box-sizing: border-box; width: 29.16666667%; }
    :global(.cd-col-xxl-8) { display: block; box-sizing: border-box; width: 33.33333333%; }
    :global(.cd-col-xxl-9) { display: block; box-sizing: border-box; width: 37.5%; }
    :global(.cd-col-xxl-10) { display: block; box-sizing: border-box; width: 41.66666667%; }
    :global(.cd-col-xxl-11) { display: block; box-sizing: border-box; width: 45.83333333%; }
    :global(.cd-col-xxl-12) { display: block; box-sizing: border-box; width: 50%; }
    :global(.cd-col-xxl-13) { display: block; box-sizing: border-box; width: 54.16666667%; }
    :global(.cd-col-xxl-14) { display: block; box-sizing: border-box; width: 58.33333333%; }
    :global(.cd-col-xxl-15) { display: block; box-sizing: border-box; width: 62.5%; }
    :global(.cd-col-xxl-16) { display: block; box-sizing: border-box; width: 66.66666667%; }
    :global(.cd-col-xxl-17) { display: block; box-sizing: border-box; width: 70.83333333%; }
    :global(.cd-col-xxl-18) { display: block; box-sizing: border-box; width: 75%; }
    :global(.cd-col-xxl-19) { display: block; box-sizing: border-box; width: 79.16666667%; }
    :global(.cd-col-xxl-20) { display: block; box-sizing: border-box; width: 83.33333333%; }
    :global(.cd-col-xxl-21) { display: block; box-sizing: border-box; width: 87.5%; }
    :global(.cd-col-xxl-22) { display: block; box-sizing: border-box; width: 91.66666667%; }
    :global(.cd-col-xxl-23) { display: block; box-sizing: border-box; width: 95.83333333%; }
    :global(.cd-col-xxl-24) { display: block; box-sizing: border-box; width: 100%; }
    :global(.cd-col-xxl-push-1) { left: 4.16666667%; }
    :global(.cd-col-xxl-push-2) { left: 8.33333333%; }
    :global(.cd-col-xxl-push-3) { left: 12.5%; }
    :global(.cd-col-xxl-push-4) { left: 16.66666667%; }
    :global(.cd-col-xxl-push-5) { left: 20.83333333%; }
    :global(.cd-col-xxl-push-6) { left: 25%; }
    :global(.cd-col-xxl-push-7) { left: 29.16666667%; }
    :global(.cd-col-xxl-push-8) { left: 33.33333333%; }
    :global(.cd-col-xxl-push-9) { left: 37.5%; }
    :global(.cd-col-xxl-push-10) { left: 41.66666667%; }
    :global(.cd-col-xxl-push-11) { left: 45.83333333%; }
    :global(.cd-col-xxl-push-12) { left: 50%; }
    :global(.cd-col-xxl-push-13) { left: 54.16666667%; }
    :global(.cd-col-xxl-push-14) { left: 58.33333333%; }
    :global(.cd-col-xxl-push-15) { left: 62.5%; }
    :global(.cd-col-xxl-push-16) { left: 66.66666667%; }
    :global(.cd-col-xxl-push-17) { left: 70.83333333%; }
    :global(.cd-col-xxl-push-18) { left: 75%; }
    :global(.cd-col-xxl-push-19) { left: 79.16666667%; }
    :global(.cd-col-xxl-push-20) { left: 83.33333333%; }
    :global(.cd-col-xxl-push-21) { left: 87.5%; }
    :global(.cd-col-xxl-push-22) { left: 91.66666667%; }
    :global(.cd-col-xxl-push-23) { left: 95.83333333%; }
    :global(.cd-col-xxl-push-24) { left: 100%; }
    :global(.cd-col-xxl-pull-1) { right: 4.16666667%; }
    :global(.cd-col-xxl-pull-2) { right: 8.33333333%; }
    :global(.cd-col-xxl-pull-3) { right: 12.5%; }
    :global(.cd-col-xxl-pull-4) { right: 16.66666667%; }
    :global(.cd-col-xxl-pull-5) { right: 20.83333333%; }
    :global(.cd-col-xxl-pull-6) { right: 25%; }
    :global(.cd-col-xxl-pull-7) { right: 29.16666667%; }
    :global(.cd-col-xxl-pull-8) { right: 33.33333333%; }
    :global(.cd-col-xxl-pull-9) { right: 37.5%; }
    :global(.cd-col-xxl-pull-10) { right: 41.66666667%; }
    :global(.cd-col-xxl-pull-11) { right: 45.83333333%; }
    :global(.cd-col-xxl-pull-12) { right: 50%; }
    :global(.cd-col-xxl-pull-13) { right: 54.16666667%; }
    :global(.cd-col-xxl-pull-14) { right: 58.33333333%; }
    :global(.cd-col-xxl-pull-15) { right: 62.5%; }
    :global(.cd-col-xxl-pull-16) { right: 66.66666667%; }
    :global(.cd-col-xxl-pull-17) { right: 70.83333333%; }
    :global(.cd-col-xxl-pull-18) { right: 75%; }
    :global(.cd-col-xxl-pull-19) { right: 79.16666667%; }
    :global(.cd-col-xxl-pull-20) { right: 83.33333333%; }
    :global(.cd-col-xxl-pull-21) { right: 87.5%; }
    :global(.cd-col-xxl-pull-22) { right: 91.66666667%; }
    :global(.cd-col-xxl-pull-23) { right: 95.83333333%; }
    :global(.cd-col-xxl-pull-24) { right: 100%; }
    :global(.cd-col-xxl-offset-1) { margin-left: 4.16666667%; }
    :global(.cd-col-xxl-offset-2) { margin-left: 8.33333333%; }
    :global(.cd-col-xxl-offset-3) { margin-left: 12.5%; }
    :global(.cd-col-xxl-offset-4) { margin-left: 16.66666667%; }
    :global(.cd-col-xxl-offset-5) { margin-left: 20.83333333%; }
    :global(.cd-col-xxl-offset-6) { margin-left: 25%; }
    :global(.cd-col-xxl-offset-7) { margin-left: 29.16666667%; }
    :global(.cd-col-xxl-offset-8) { margin-left: 33.33333333%; }
    :global(.cd-col-xxl-offset-9) { margin-left: 37.5%; }
    :global(.cd-col-xxl-offset-10) { margin-left: 41.66666667%; }
    :global(.cd-col-xxl-offset-11) { margin-left: 45.83333333%; }
    :global(.cd-col-xxl-offset-12) { margin-left: 50%; }
    :global(.cd-col-xxl-offset-13) { margin-left: 54.16666667%; }
    :global(.cd-col-xxl-offset-14) { margin-left: 58.33333333%; }
    :global(.cd-col-xxl-offset-15) { margin-left: 62.5%; }
    :global(.cd-col-xxl-offset-16) { margin-left: 66.66666667%; }
    :global(.cd-col-xxl-offset-17) { margin-left: 70.83333333%; }
    :global(.cd-col-xxl-offset-18) { margin-left: 75%; }
    :global(.cd-col-xxl-offset-19) { margin-left: 79.16666667%; }
    :global(.cd-col-xxl-offset-20) { margin-left: 83.33333333%; }
    :global(.cd-col-xxl-offset-21) { margin-left: 87.5%; }
    :global(.cd-col-xxl-offset-22) { margin-left: 91.66666667%; }
    :global(.cd-col-xxl-offset-23) { margin-left: 95.83333333%; }
    :global(.cd-col-xxl-offset-24) { margin-left: 100%; }
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
    /* RTL: float:right + offset 镜像 margin-right */
    :global(.cd-rtl .cd-col-xxl-1) { float: right; }
    :global(.cd-rtl .cd-col-xxl-2) { float: right; }
    :global(.cd-rtl .cd-col-xxl-3) { float: right; }
    :global(.cd-rtl .cd-col-xxl-4) { float: right; }
    :global(.cd-rtl .cd-col-xxl-5) { float: right; }
    :global(.cd-rtl .cd-col-xxl-6) { float: right; }
    :global(.cd-rtl .cd-col-xxl-7) { float: right; }
    :global(.cd-rtl .cd-col-xxl-8) { float: right; }
    :global(.cd-rtl .cd-col-xxl-9) { float: right; }
    :global(.cd-rtl .cd-col-xxl-10) { float: right; }
    :global(.cd-rtl .cd-col-xxl-11) { float: right; }
    :global(.cd-rtl .cd-col-xxl-12) { float: right; }
    :global(.cd-rtl .cd-col-xxl-13) { float: right; }
    :global(.cd-rtl .cd-col-xxl-14) { float: right; }
    :global(.cd-rtl .cd-col-xxl-15) { float: right; }
    :global(.cd-rtl .cd-col-xxl-16) { float: right; }
    :global(.cd-rtl .cd-col-xxl-17) { float: right; }
    :global(.cd-rtl .cd-col-xxl-18) { float: right; }
    :global(.cd-rtl .cd-col-xxl-19) { float: right; }
    :global(.cd-rtl .cd-col-xxl-20) { float: right; }
    :global(.cd-rtl .cd-col-xxl-21) { float: right; }
    :global(.cd-rtl .cd-col-xxl-22) { float: right; }
    :global(.cd-rtl .cd-col-xxl-23) { float: right; }
    :global(.cd-rtl .cd-col-xxl-24) { float: right; }
    :global(.cd-rtl .cd-col-xxl-offset-1) { margin-left: auto; margin-right: 4.16666667%; }
    :global(.cd-rtl .cd-col-xxl-offset-2) { margin-left: auto; margin-right: 8.33333333%; }
    :global(.cd-rtl .cd-col-xxl-offset-3) { margin-left: auto; margin-right: 12.5%; }
    :global(.cd-rtl .cd-col-xxl-offset-4) { margin-left: auto; margin-right: 16.66666667%; }
    :global(.cd-rtl .cd-col-xxl-offset-5) { margin-left: auto; margin-right: 20.83333333%; }
    :global(.cd-rtl .cd-col-xxl-offset-6) { margin-left: auto; margin-right: 25%; }
    :global(.cd-rtl .cd-col-xxl-offset-7) { margin-left: auto; margin-right: 29.16666667%; }
    :global(.cd-rtl .cd-col-xxl-offset-8) { margin-left: auto; margin-right: 33.33333333%; }
    :global(.cd-rtl .cd-col-xxl-offset-9) { margin-left: auto; margin-right: 37.5%; }
    :global(.cd-rtl .cd-col-xxl-offset-10) { margin-left: auto; margin-right: 41.66666667%; }
    :global(.cd-rtl .cd-col-xxl-offset-11) { margin-left: auto; margin-right: 45.83333333%; }
    :global(.cd-rtl .cd-col-xxl-offset-12) { margin-left: auto; margin-right: 50%; }
    :global(.cd-rtl .cd-col-xxl-offset-13) { margin-left: auto; margin-right: 54.16666667%; }
    :global(.cd-rtl .cd-col-xxl-offset-14) { margin-left: auto; margin-right: 58.33333333%; }
    :global(.cd-rtl .cd-col-xxl-offset-15) { margin-left: auto; margin-right: 62.5%; }
    :global(.cd-rtl .cd-col-xxl-offset-16) { margin-left: auto; margin-right: 66.66666667%; }
    :global(.cd-rtl .cd-col-xxl-offset-17) { margin-left: auto; margin-right: 70.83333333%; }
    :global(.cd-rtl .cd-col-xxl-offset-18) { margin-left: auto; margin-right: 75%; }
    :global(.cd-rtl .cd-col-xxl-offset-19) { margin-left: auto; margin-right: 79.16666667%; }
    :global(.cd-rtl .cd-col-xxl-offset-20) { margin-left: auto; margin-right: 83.33333333%; }
    :global(.cd-rtl .cd-col-xxl-offset-21) { margin-left: auto; margin-right: 87.5%; }
    :global(.cd-rtl .cd-col-xxl-offset-22) { margin-left: auto; margin-right: 91.66666667%; }
    :global(.cd-rtl .cd-col-xxl-offset-23) { margin-left: auto; margin-right: 95.83333333%; }
    :global(.cd-rtl .cd-col-xxl-offset-24) { margin-left: auto; margin-right: 100%; }
  }
</style>
