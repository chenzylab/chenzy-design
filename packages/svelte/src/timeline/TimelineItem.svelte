<!--
  Timeline.Item — 声明式单项，与 dataSource 模式渲染同一套 .cd-timeline__item 结构，
  从而复用父 Timeline 的 :nth-child 交替布局 CSS（alternate/center）与方向样式，无需索引计算。

  interactive：父 Timeline 开启时，项渲染为可聚焦 role=button，roving tabindex 由父持有的
  焦点 id 决定（getter 经 context 保持响应性，项不写 $state——红线 #2）。方向键 roving 上交父级
  处理，Enter/Space 触发本项 onClick。挂载时经 context 领号、卸载时退号（命令式 cleanup）。
-->
<script lang="ts">
  import { untrack, type Snippet } from 'svelte';
  import { getTimelineContext, type TimelineLineStyle } from './context.js';

  interface Props {
    /** 圆点颜色（等价 dataSource 项的 dotColor/color）。 */
    dotColor?: string;
    /** 圆点颜色别名（与 dotColor 等价，优先级低于 dotColor）。 */
    color?: string;
    /** 语义类型，给圆点附加 cd-timeline__dot--{type} class。 */
    type?: 'default' | 'ongoing' | 'success' | 'warning' | 'error';
    /** 自定义圆点 snippet，提供时替代默认圆点。 */
    dot?: Snippet;
    /** 单项连接线样式，覆盖父 Timeline 的 lineStyle。 */
    lineStyle?: TimelineLineStyle;
    /** 时间文本，渲染在内容下方（horizontal 模式同 dataSource）。 */
    time?: string;
    /** 覆盖父 Timeline mode 的单项定位（'left' | 'right'）。 */
    position?: 'left' | 'right';
    /** 辅助内容（时间旁附加信息），字符串或 Snippet。 */
    extra?: string | Snippet;
    /** interactive 模式下按 Enter/Space 或点击该节点触发。 */
    onClick?: () => void;
    children?: Snippet;
  }

  let { dotColor, color, type, dot, lineStyle, time, position, extra, onClick, children }: Props = $props();

  const ctx = getTimelineContext();

  // 未显式指定时回退到父 Timeline 的 lineStyle。
  const effectiveLine = $derived<TimelineLineStyle>(lineStyle ?? ctx?.getLineStyle() ?? 'solid');

  // dotColor 优先，其次 color 别名。
  const effectiveDotColor = $derived(dotColor ?? color);

  const dotInline = $derived(effectiveDotColor ? `--cd-timeline-dot-current: ${effectiveDotColor};` : undefined);

  const dotClass = $derived(
    ['cd-timeline__dot', type && type !== 'default' && `cd-timeline__dot--${type}`]
      .filter(Boolean)
      .join(' '),
  );

  // interactive：在 $effect 内 mount 领号 / unmount 退号（仿 Tabs；untrack 读初值仅跑一次，
  // 避免重注册打乱保序）。项自身不参与 roving 簿记 $state。
  const interactive = $derived(ctx?.getInteractive() ?? false);
  let myId = $state(-1);
  $effect(() => {
    const reg = ctx?.registerItem;
    if (!reg) return;
    const r = untrack(() => reg());
    myId = r.id;
    return r.unregister;
  });

  // roving tabindex：焦点项 0，其余 -1（焦点状态经 context getter 读取，保持响应性）。
  const tindex = $derived(interactive && myId >= 0 && ctx?.isFocused(myId) ? 0 : -1);

  function onKeydown(e: KeyboardEvent): void {
    if (!interactive) return;
    // Enter/Space 触发本项 onClick；方向键 roving 交父级。
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.();
      return;
    }
    ctx?.onItemKeydown(myId, e);
  }

  function onActivate(): void {
    if (!interactive) {
      onClick?.();
      return;
    }
    ctx?.onItemFocus(myId);
    onClick?.();
  }
</script>

{#if interactive}
  <!-- svelte-ignore a11y_no_noninteractive_element_to_interactive_role -->
  <li
    class={[
      'cd-timeline__item',
      'cd-timeline__item--interactive',
      effectiveLine === 'dashed' && 'cd-timeline__item--dashed',
      position && `cd-timeline__item--${position}`,
    ]}
    role="button"
    tabindex={tindex}
    data-tid={myId}
    onclick={onActivate}
    onkeydown={onKeydown}
    onfocus={() => ctx?.onItemFocus(myId)}
  >
    <span class="cd-timeline__tail" aria-hidden="true"></span>
    <span class={dotClass} style={dotInline} aria-hidden="true">
      {#if dot}{@render dot()}{/if}
    </span>
    <div class="cd-timeline__body">
      <div class="cd-timeline__content">{@render children?.()}</div>
      {#if time || extra}
        <div class="cd-timeline__time">
          {#if time}{time}{/if}
          {#if extra}
            {#if typeof extra === 'string'}
              <span class="cd-timeline__extra">{extra}</span>
            {:else}
              <span class="cd-timeline__extra">{@render extra()}</span>
            {/if}
          {/if}
        </div>
      {/if}
    </div>
  </li>
{:else}
  <li
    class={[
      'cd-timeline__item',
      effectiveLine === 'dashed' && 'cd-timeline__item--dashed',
      position && `cd-timeline__item--${position}`,
    ]}
  >
    <span class="cd-timeline__tail" aria-hidden="true"></span>
    <span class={dotClass} style={dotInline} aria-hidden="true">
      {#if dot}{@render dot()}{/if}
    </span>
    <div class="cd-timeline__body">
      <div class="cd-timeline__content">{@render children?.()}</div>
      {#if time || extra}
        <div class="cd-timeline__time">
          {#if time}{time}{/if}
          {#if extra}
            {#if typeof extra === 'string'}
              <span class="cd-timeline__extra">{extra}</span>
            {:else}
              <span class="cd-timeline__extra">{@render extra()}</span>
            {/if}
          {/if}
        </div>
      {/if}
    </div>
  </li>
{/if}

<style>
  /* 单项 dashed 覆盖：作用于自身 tail，优先于父级 solid。 */
  .cd-timeline__item--dashed .cd-timeline__tail {
    border-inline-start-style: dashed;
  }
  :global(.cd-timeline--horizontal) .cd-timeline__item--dashed .cd-timeline__tail {
    border-inline-start: none;
    border-block-start-style: dashed;
  }
</style>
