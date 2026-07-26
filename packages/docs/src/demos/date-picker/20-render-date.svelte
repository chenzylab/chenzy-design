<script lang="ts">
  import { DatePicker, Tooltip } from '@chenzy-design/svelte';

  const dateStyle =
    'width: 100%; height: 100%; border: 1px solid var(--cd-color-primary); display: flex; justify-content: center; align-items: center;';
</script>

<DatePicker>
  {#snippet renderDate(day)}
    {#if day === 1}
      <Tooltip content="Always Day 1">
        <div style={dateStyle}>{day}</div>
      </Tooltip>
    {:else}
      {day}
    {/if}
  {/snippet}
</DatePicker>
