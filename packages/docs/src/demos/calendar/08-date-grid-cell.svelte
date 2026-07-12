<script lang="ts">
  import { Calendar } from '@chenzy-design/svelte';

  // 对齐 Semi「自定义渲染 - 单元格样式」：dateGridRender 给重要日期铺一层背景（需绝对定位）。
  const displayValue = new Date(2019, 6, 23, 8, 32, 0);
  // 对齐 Semi importDates：[7/2、7/8、7/19、7/23]。
  const importDates = [new Date(2019, 6, 2), new Date(2019, 6, 8), new Date(2019, 6, 19), new Date(2019, 6, 23)];
</script>

{#snippet importantCell()}
  <div class="important-date"></div>
{/snippet}

<!-- 对齐 Semi：importDates.filter(date => date.toString() === dateString).length -->
<Calendar
  mode="month"
  height={700}
  {displayValue}
  dateGridRender={(dateString) =>
    importDates.filter((date) => date.toString() === dateString).length ? importantCell : null}
/>

<style>
  :global(.important-date) {
    position: absolute;
    inset: 0;
    background-color: var(--cd-color-danger-light-default);
    pointer-events: none;
  }
</style>
