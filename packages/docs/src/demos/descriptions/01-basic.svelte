<script lang="ts">
  import { Descriptions, Tag } from '@chenzy-design/svelte';
  import { IconArrowUp } from '@chenzy-design/icons';
</script>

{#snippet retention()}
  <span
    >98%<IconArrowUp
      size="small"
      style="color: var(--cd-color-success); margin-left: 2px;"
    /></span
  >
{/snippet}

{#snippet tagValue()}
  <Tag style="margin: 0;">电商</Tag>
{/snippet}

<Descriptions
  data={[
    { key: '实际用户数量', value: '1,480,000' },
    { key: '7天留存', value: retention },
    { key: '安全等级', value: '3级' },
    { key: '垂类标签', value: tagValue },
    { key: '认证状态', value: '未认证' },
  ]}
/>
