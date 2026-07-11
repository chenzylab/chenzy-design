<script lang="ts">
  import { Calendar } from '@chenzy-design/svelte';

  // 对齐 Semi「自定义渲染 - 事件」：用 dateGridRender 在某列绝对定位塞事件块。
  const displayValue = new Date(2019, 6, 23, 8, 32, 0);
</script>

<!-- dateGridRender 返回 Snippet：内部各事件块自行绝对定位（top/height 相对该列滚动内容） -->
{#snippet daySchedule()}
  <div class="dg-schedule-evt" style="top: 500px; height: 50px;">吃饭 🍰</div>
  <div class="dg-schedule-evt" style="top: 0; height: 400px;">睡觉 😪</div>
  <div class="dg-schedule-evt" style="top: 700px; height: 100px;">打豆豆 🎮</div>
{/snippet}

<!-- 对齐 Semi：dateString === new Date(2019, 6, 23).toString() -->
<Calendar
  mode="week"
  height={700}
  {displayValue}
  dateGridRender={(dateString) => (dateString === new Date(2019, 6, 23).toString() ? daySchedule : null)}
/>

<!-- 独立 class（不与 06 的 .evt 撞车）；对齐 Semi dailyEventStyle：无 color，border/background/padding。 -->
<style>
  :global(.dg-schedule-evt) {
    position: absolute;
    inset-inline: 0;
    box-sizing: border-box;
    padding: 10px;
    background: var(--cd-color-primary-light-default);
    border: 1px solid var(--cd-color-primary);
    border-radius: 3px;
    overflow: hidden;
  }
</style>
