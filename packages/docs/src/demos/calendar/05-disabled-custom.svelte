<script lang="ts">
  import { Calendar, Tag } from '@chenzy-design/svelte';

  const anchor = new Date(2026, 5, 1);

  // 禁用周末与本月 25 号之后的日期
  function disabledDate(date: Date): boolean {
    const day = date.getDay();
    if (day === 0 || day === 6) return true;
    return date.getMonth() === 5 && date.getDate() > 25;
  }
</script>

{#snippet cell({ date, isToday }: { date: Date; isToday: boolean })}
  <div style="display:flex;flex-direction:column;align-items:flex-end;gap:2px;width:100%;">
    <span style="font-weight:{isToday ? 700 : 400};">{date.getDate()}</span>
    {#if date.getDate() === 18}
      <Tag size="small" color="success">休</Tag>
    {/if}
  </div>
{/snippet}

<Calendar defaultValue={anchor} {disabledDate} dateCell={cell} />
