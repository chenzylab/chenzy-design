<script lang="ts">
  import { Tooltip, Button } from '@chenzy-design/svelte';
</script>

<div style="display: flex; gap: 12px; flex-wrap: wrap;">
  <Tooltip content="操作成功完成" status="default">
    <Button>默认</Button>
  </Tooltip>
  <Tooltip content="请检查输入内容" status="warning">
    <Button type="warning">警告</Button>
  </Tooltip>
  <Tooltip content="操作失败，请重试" status="error">
    <Button type="danger">错误</Button>
  </Tooltip>
</div>
