<script lang="ts">
  import { Popconfirm, Button } from '@chenzy-design/svelte';
</script>

<div style="display: flex; gap: 16px; flex-wrap: wrap;">
  <Popconfirm
    type="danger"
    title="确定删除该项？"
    content="此操作无法撤销。"
    okText="删除"
    cancelText="再想想"
  >
    <Button type="danger">危险确认</Button>
  </Popconfirm>

  <Popconfirm
    title="确定提交？"
    showCancel={false}
    okText="我知道了"
  >
    <Button type="primary">仅确认</Button>
  </Popconfirm>

  <Popconfirm
    title="确定归档？"
    content="归档后可在回收站找回。"
    okButtonProps={{ theme: 'solid' }}
  >
    <Button>归档</Button>
  </Popconfirm>
</div>
