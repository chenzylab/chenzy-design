<script lang="ts">
  import { Popconfirm, Button, Space } from '@chenzy-design/svelte';
</script>

<!-- okButtonProps / cancelButtonProps 传 autoFocus：打开面板时自动聚焦对应按钮。
     content 传带 { initialFocusRef } 入参的 snippet：用 use:initialFocusRef 绑定到浮层内元素，打开时聚焦。 -->
<Space>
  <Popconfirm
    title="确定是否要保存此修改？"
    content="此修改将不可逆"
    okButtonProps={{ autoFocus: true, type: 'danger' }}
  >
    <Button>确认聚焦</Button>
  </Popconfirm>

  <Popconfirm
    title="确定是否要保存此修改？"
    content="此修改将不可逆"
    cancelButtonProps={{ autoFocus: true }}
  >
    <Button>取消聚焦</Button>
  </Popconfirm>

  <Popconfirm title="确定是否要保存此修改？">
    {#snippet content({ initialFocusRef })}
      <input use:initialFocusRef placeholder="focus here" />
    {/snippet}
    <Button>内容聚焦</Button>
  </Popconfirm>
</Space>
