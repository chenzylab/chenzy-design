<script lang="ts">
  // 基本用法：size 设置尺寸（large/default/small），header/footer 自定义头尾，bordered 外框。
  import { List } from '@chenzy-design/svelte';

  const data = [
    '从明天起，做一个幸福的人',
    '喂马，劈柴，周游世界',
    '从明天起，关心粮食和蔬菜',
    '我有一所房子，面朝大海，春暖花开',
  ];
</script>

<div style="display:flex; flex-direction:column; gap:24px;">
  <div>
    <h4 style="margin:0 0 12px;">Default Size</h4>
    <List dataSource={data} header="Header" footer="Footer" bordered>
      {#snippet renderItem(item)}
        <List.Item>{item}</List.Item>
      {/snippet}
    </List>
  </div>

  <div>
    <h4 style="margin:0 0 12px;">Small Size</h4>
    <List dataSource={data} size="small" header="Header" footer="Footer" bordered>
      {#snippet renderItem(item)}
        <List.Item>{item}</List.Item>
      {/snippet}
    </List>
  </div>

  <div>
    <h4 style="margin:0 0 12px;">Large Size</h4>
    <List dataSource={data} size="large" header="Header" footer="Footer" bordered>
      {#snippet renderItem(item)}
        <List.Item>{item}</List.Item>
      {/snippet}
    </List>
  </div>
</div>
