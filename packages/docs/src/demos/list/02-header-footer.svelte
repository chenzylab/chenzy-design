<script lang="ts">
  import { List } from '@chenzy-design/svelte';

  const data = ['消息 A', '消息 B', '消息 C'];
</script>

<List dataSource={data} bordered header="消息列表" footer="共 3 条消息">
  {#snippet renderItem(item)}
    <List.Item>{item}</List.Item>
  {/snippet}
</List>
