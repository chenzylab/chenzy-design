<!--
  Timeline.Item — 严格对齐 Semi timeline/item.tsx。
  DOM：<li class="cd-timeline-item {posCls} {class}"> > .item-tail + .item-head(-custom/-{type}) + .item-content(children + extra + time)。
  位置类 posCls 对齐 Semi getPosCls：
    - 显式 position → cd-timeline-item-{position}（覆盖父 mode）
    - alternate → 无 position 时按兄弟顺序索引奇偶 left/right
    - center → 无 position 时统一 left
    - left/right → cd-timeline-item-{mode}
  声明式子项经 context 拿父 mode 与自身顺序索引；dataSource 模式由父 Timeline 直接传 posCls（此时 mode/index 为 undefined，走 posClass prop 分支）。
-->
<script lang="ts">
  import { untrack, type Snippet } from 'svelte';
  import { getTimelineContext } from './context.js';
  import type { TimelineItemType, TimelineItemPosition } from './types.js';

  interface Props {
    /** 自定义圆点色值（对齐 Semi color，设置 head backgroundColor）。 */
    color?: string | undefined;
    /** 时间文本，渲染在内容下方。 */
    time?: string | Snippet | undefined;
    /** 当前圆点模式。 */
    type?: TimelineItemType | undefined;
    /** 自定义时间轴点（提供时 head 附加 -custom class）。 */
    dot?: string | Snippet | undefined;
    /** 自定义辅助内容，渲染在内容与时间之间。 */
    extra?: string | Snippet | undefined;
    /** 自定义节点位置，覆盖 Timeline 的 mode 选项。 */
    position?: TimelineItemPosition | undefined;
    class?: string | undefined;
    style?: string | undefined;
    /** 鼠标点击事件的回调。 */
    onClick?: ((e: MouseEvent) => void) | undefined;
    /** 内部：dataSource 模式下父 Timeline 直接注入的位置类（优先于 context 计算）。 */
    posClass?: string | undefined;
    children?: Snippet | undefined;
  }

  let {
    color,
    time,
    type = 'default',
    dot,
    extra,
    position,
    class: className,
    style,
    onClick,
    posClass,
    children,
  }: Props = $props();

  const ctx = getTimelineContext();

  // 声明式：挂载登记，getIndex() 反映本项在兄弟中的当前顺序索引（alternate 奇偶用）。
  // getIndex 依赖父级 version（每次兄弟增减 bump），故 $derived 读取即保持响应。
  let handle = $state<{ getIndex: () => number; unregister: () => void } | null>(null);
  $effect(() => {
    const reg = ctx?.registerItem;
    if (!reg) return;
    const r = untrack(() => reg());
    handle = r;
    return () => {
      r.unregister();
      handle = null;
    };
  });
  const index = $derived(handle?.getIndex() ?? 0);

  const mode = $derived(ctx?.getMode() ?? 'left');

  // 位置类：对齐 Semi getPosCls。dataSource 模式由父传 posClass 直接用。
  const positionClass = $derived.by(() => {
    if (posClass !== undefined) return posClass;
    if (position) return `cd-timeline-item-${position}`;
    if (mode === 'alternate') return index % 2 === 0 ? 'cd-timeline-item-left' : 'cd-timeline-item-right';
    if (mode === 'center') return 'cd-timeline-item-left';
    if (mode === 'left' || mode === 'right') return `cd-timeline-item-${mode}`;
    return '';
  });

  const itemCls = $derived(
    ['cd-timeline-item', positionClass, className].filter(Boolean).join(' '),
  );

  const headCls = $derived(
    [
      'cd-timeline-item-head',
      dot && 'cd-timeline-item-head-custom',
      type && `cd-timeline-item-head-${type}`,
    ]
      .filter(Boolean)
      .join(' '),
  );

  // color 设置 head 背景色（对齐 Semi dotStyle）。
  const headStyle = $derived(color ? `background-color: ${color};` : undefined);
</script>

<!-- Semi Timeline.Item 将 onClick 直接挂在 <li> 上（无键盘等价，节点本身非交互控件），此处忠实对齐。 -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<li class={itemCls} {style} onclick={onClick}>
  <div class="cd-timeline-item-tail" aria-hidden="true"></div>
  <div class={headCls} style={headStyle} aria-hidden="true">
    {#if dot}
      {#if typeof dot === 'string'}{dot}{:else}{@render dot()}{/if}
    {/if}
  </div>
  <div class="cd-timeline-item-content">
    {@render children?.()}
    {#if extra}
      <div class="cd-timeline-item-content-extra">
        {#if typeof extra === 'string'}{extra}{:else}{@render extra()}{/if}
      </div>
    {/if}
    {#if time}
      <div class="cd-timeline-item-content-time">
        {#if typeof time === 'string'}{time}{:else}{@render time()}{/if}
      </div>
    {/if}
  </div>
</li>
