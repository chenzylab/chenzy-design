<script lang="ts">
  import { Descriptions } from '@chenzy-design/svelte';
  import { IconArrowUp } from '@chenzy-design/icons';

  const data = [
    { key: '实际用户数量', value: '1,480,000' },
    { key: '7天留存', value: retention },
    { key: '安全等级', value: '3级' },
  ];
  const style =
    'box-shadow: var(--cd-shadow-elevated); background-color: var(--cd-color-bg-2); border-radius: 4px; padding: 10px; margin-right: 20px; width: 600px;';
</script>

{#snippet retention()}
  <span>
    98%
    <IconArrowUp size="small" style="color: red; margin-left: 4px;" />
  </span>
{/snippet}

<div>
  <Descriptions {data} row size="small" {style} />
  <br />
  <Descriptions {data} row {style} />
  <br />
  <Descriptions {data} row size="large" {style} />
</div>
