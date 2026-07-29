<script lang="ts">
  import * as dateFns from 'date-fns';
  import { TimePicker, Tag } from '@chenzy-design/svelte';
  import { IconClock } from '@chenzy-design/icons';

  const formatToken = 'HH:mm:ss';
  let time = $state<Date | null>(new Date());
</script>

<TimePicker
  value={time}
  format={formatToken}
  onChange={(t) => (time = Array.isArray(t) ? t[0] : t)}
>
  {#snippet triggerRender({ placeholder })}
    <Tag
      color="cyan"
      size="large"
      shape="circle"
      style="padding: 12px; padding-right: 16px; font-size: 14px"
      type="light"
      contentAlign="center"
      prefixIcon={clockIcon}
    >
      {time ? dateFns.format(time, formatToken) : placeholder}
    </Tag>
  {/snippet}
</TimePicker>

{#snippet clockIcon()}
  <IconClock />
{/snippet}
