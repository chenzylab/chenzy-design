<script lang="ts">
  import { Descriptions, Tag, Card } from '@chenzy-design/svelte';

  const data = [
    { key: '实际用户数量', value: '1,480,000' },
    { key: '7天留存', value: '98%' },
    { key: '安全等级', value: '3级' },
    { key: '垂类标签', value: tagValue },
    { key: '认证状态', value: '未认证' },
  ];
  const aligns = ['center', 'justify', 'left', 'plain'] as const;
</script>

{#snippet tagValue()}
  <Tag style="margin: 0;">电商</Tag>
{/snippet}

<div style="display: flex; flex-wrap: wrap; gap: 16px;">
  {#each aligns as align (align)}
    <Card>
      <Descriptions {align} {data} />
    </Card>
  {/each}
</div>
