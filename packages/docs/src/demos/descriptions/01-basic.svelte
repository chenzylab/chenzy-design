<script lang="ts">
  import { Descriptions, Tag, Icon } from '@chenzy-design/svelte';

  const arrowUpSvg =
    '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor"><path d="M12 5l7 7h-4v7h-6v-7H5z"/></svg>';
</script>

{#snippet retention()}
  <span
    >98%<Icon
      svg={arrowUpSvg}
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
