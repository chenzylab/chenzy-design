<script lang="ts">
  import { List } from '@chenzy-design/svelte';

  const data = Array.from({ length: 9 }, (_, i) => ({
    key: String(i + 1),
    title: `卡片 ${i + 1}`,
  }));
</script>

<List dataSource={data} grid={{ column: 3, gutter: 16 }}>
  {#snippet renderItem(item)}
    <List.Item>
      <div style="background: var(--cd-color-fill-0, #f5f5f5); border-radius: 6px; padding: 16px; text-align: center;">
        {item.title}
      </div>
    </List.Item>
  {/snippet}
</List>
