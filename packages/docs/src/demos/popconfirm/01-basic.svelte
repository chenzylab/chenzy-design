<script lang="ts">
  import { Popconfirm, Button, Text } from '@chenzy-design/svelte';

  let result = $state('');
</script>

<div style="display:flex; gap:16px; padding:40px 0; flex-wrap:wrap">
  <Popconfirm
    type="danger"
    title="确定删除该项？"
    content="此操作无法撤销。"
    okText="删除"
    onConfirm={() => { result = '已删除'; }}
    onCancel={() => (result = '已取消')}
  >
    {#snippet trigger()}
      <Button type="danger">删除</Button>
    {/snippet}
  </Popconfirm>

  <Popconfirm
    placement="bottom"
    title="确定提交？"
    onConfirm={() => { result = '已提交'; }}
  >
    {#snippet trigger()}
      <Button type="primary">提交</Button>
    {/snippet}
  </Popconfirm>

  <Popconfirm
    type="warning"
    placement="right"
    title="退出登录？"
    content="退出后需重新登录。"
    onConfirm={() => { result = '已退出'; }}
  >
    {#snippet trigger()}
      <Button>退出</Button>
    {/snippet}
  </Popconfirm>
</div>

<Text type="tertiary">操作结果：{result || '（无）'}</Text>
