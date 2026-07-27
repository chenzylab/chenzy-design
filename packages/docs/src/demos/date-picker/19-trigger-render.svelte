<script lang="ts">
  import { DatePicker, Button } from '@chenzy-design/svelte';
  import { IconClose, IconChevronDown } from '@chenzy-design/icons';

  let date = $state<Date | null>(new Date());

  function pad(n: number): string {
    return String(n).padStart(2, '0');
  }
  function fmt(d: Date): string {
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }

  function onChange(value: unknown) {
    date = value as Date | null;
  }
  function onClear(e?: MouseEvent) {
    e?.stopPropagation();
    date = null;
  }
</script>

<DatePicker {onChange} value={date} format="yyyy-MM-dd">
  {#snippet triggerRender({ placeholder })}
    <Button theme="light" iconPosition="right">
      {#snippet icon()}
        {#if date}
          <IconClose onclick={onClear} />
        {:else}
          <IconChevronDown />
        {/if}
      {/snippet}
      {date ? fmt(date) : placeholder}
    </Button>
  {/snippet}
</DatePicker>
