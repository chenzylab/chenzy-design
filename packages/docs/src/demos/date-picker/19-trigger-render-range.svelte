<script lang="ts">
  import { DatePicker, Button } from '@chenzy-design/svelte';
  import { IconClose, IconChevronDown } from '@chenzy-design/icons';

  let date = $state<[Date | null, Date | null] | null>(null);

  function pad(n: number): string {
    return String(n).padStart(2, '0');
  }
  function fmt(d: Date): string {
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  }
  function triggerContent(): string {
    if (Array.isArray(date) && date[0] && date[1]) {
      return `${fmt(date[0])} ~ ${fmt(date[1])}`;
    }
    return '请选择日期时间范围';
  }

  function onChange(value: unknown) {
    date = value as [Date | null, Date | null] | null;
    console.log(value);
  }
  function onClear(e?: MouseEvent) {
    e?.stopPropagation();
    date = null;
  }

  const hasValue = $derived(Array.isArray(date) && !!date[0]);
</script>

<DatePicker type="dateTimeRange" {onChange} value={date}>
  {#snippet triggerRender()}
    <Button theme="light" iconPosition="right">
      {#snippet icon()}
        {#if hasValue}
          <IconClose onclick={onClear} />
        {:else}
          <IconChevronDown />
        {/if}
      {/snippet}
      {triggerContent()}
    </Button>
  {/snippet}
</DatePicker>
