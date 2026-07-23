<script lang="ts">
  import { Tooltip, Popconfirm, Button } from '@chenzy-design/svelte';
</script>

<Popconfirm content="是否确认删除" title="确认" style="width: 320px;">
  <span style="display: inline-block;">
    <Tooltip content="删除评价">
      <Button type="danger">删除</Button>
    </Tooltip>
  </span>
</Popconfirm>
