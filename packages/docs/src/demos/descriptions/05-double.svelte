<script lang="ts">
  import { Descriptions, Icon } from '@chenzy-design/svelte';

  const arrowUpSvg =
    '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor"><path d="M12 5l7 7h-4v7h-6v-7H5z"/></svg>';

  const cardStyle =
    'box-shadow: var(--cd-shadow-elevated); background-color: var(--cd-color-bg-2); border-radius: 4px; padding: 10px; width: 600px;';
</script>

{#snippet retention()}
  <span
    >98%<Icon svg={arrowUpSvg} size="small" style="color: red; margin-left: 4px;" /></span
  >
{/snippet}

<!-- row=true 双行显示，支持 small / medium（默认）/ large 三种大小；此时 align 失效。 -->
<div style="display: flex; flex-direction: column; gap: 16px;">
  <Descriptions
    row
    size="small"
    style={cardStyle}
    data={[
      { key: '实际用户数量', value: '1,480,000' },
      { key: '7天留存', value: retention },
      { key: '安全等级', value: '3级' },
    ]}
  />
  <Descriptions
    row
    style={cardStyle}
    data={[
      { key: '实际用户数量', value: '1,480,000' },
      { key: '7天留存', value: retention },
      { key: '安全等级', value: '3级' },
    ]}
  />
  <Descriptions
    row
    size="large"
    style={cardStyle}
    data={[
      { key: '实际用户数量', value: '1,480,000' },
      { key: '7天留存', value: retention },
      { key: '安全等级', value: '3级' },
    ]}
  />
</div>
