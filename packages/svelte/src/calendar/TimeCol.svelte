<!--
  TimeCol — 日/周/多日视图左侧的时间列，对齐 Semi `semi-ui/calendar/timeCol.tsx`。
  DOM：div.calendar-time(.sticky-left) > ul.calendar-time-items > li.calendar-time-item > span
  文案由 hourLabel 提供（Semi 是 formatTime + LocaleConsumer），第 0 项恒为空串
  （对齐 Semi renderTime 的 `list.splice(0, 1, '')`，在 formatTime 之后执行）。
-->
<script lang="ts">
  import { HOURS_IN_DAY } from './constants.js';

  interface Props {
    /** 每小时的展示文案（由父组件按 locale / renderTimeDisplay 计算） */
    hourLabel: (hour: number) => string;
    /** 所属视图：week/range 与 day 的 sticky-left class 前缀不同（对齐 Semi） */
    variant: 'day' | 'week';
  }

  let { hourLabel, variant }: Props = $props();

  const HOURS = Array.from({ length: HOURS_IN_DAY }, (_, h) => h);
</script>

<div class="cd-calendar-time cd-calendar-{variant}-sticky-left" aria-hidden="true">
  <ul class="cd-calendar-time-items">
    {#each HOURS as h (h)}
      <li class="cd-calendar-time-item"><span>{hourLabel(h)}</span></li>
    {/each}
  </ul>
</div>

<style>
  /* sticky 左列（对齐 Semi -sticky-left）。父组件的同名规则管不到本组件根节点
     （Svelte scoped 类不跨组件），故这里自带一份；全天 tag 列那份仍在 Calendar.svelte。 */
  .cd-calendar-day-sticky-left,
  .cd-calendar-week-sticky-left {
    position: sticky;
    inset-inline-start: 0;
    z-index: var(--cd-calendar-z-stickyleft);
    background: var(--cd-calendar-color-sticky-bg);
  }

  /* 时间列（对齐 Semi .calendar-time / .time-items / .time-item） */
  .cd-calendar-time {
    height: auto;
    display: flex;
    flex: none;
    align-items: flex-start;
    padding-right: var(--cd-calendar-spacing-time-padding-right);
  }
  /* ul/li reset：原先靠父组件根节点的 :where(ul,li) 兜底，拆分后本组件自带 */
  .cd-calendar-time-items {
    position: relative;
    min-width: var(--cd-calendar-width-tag-col);
    background: var(--cd-calendar-color-bg);
    box-sizing: border-box;
    margin: 0 0 0 auto;
    padding: 0;
    list-style: none;
  }
  .cd-calendar-time-item {
    position: relative;
    height: var(--cd-calendar-height-day-grid);
    text-align: right;
    padding: 0;
    margin: 0;
    list-style: none;
  }
  .cd-calendar-time-item span {
    display: block;
    position: relative;
    top: var(--cd-calendar-spacing-time-item-span-top);
    color: var(--cd-calendar-color-day-text-default);
    font-size: var(--cd-font-size-regular);
  }
</style>
