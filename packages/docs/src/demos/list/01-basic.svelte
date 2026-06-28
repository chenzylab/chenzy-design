<script lang="ts">
  import { List } from '@chenzy-design/svelte';

  const data = [
    { key: '1', title: '列表项一', description: '这是第一条列表项的描述文字' },
    { key: '2', title: '列表项二', description: '这是第二条列表项的描述文字' },
    { key: '3', title: '列表项三', description: '这是第三条列表项的描述文字' },
    { key: '4', title: '列表项四', description: '这是第四条列表项的描述文字' },
  ];
</script>

<List dataSource={data} bordered>
  {#snippet renderItem(item)}
    <List.Item>
      <List.Item.Meta title={item.title} description={item.description} />
    </List.Item>
  {/snippet}
</List>
