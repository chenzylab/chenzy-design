<script lang="ts">
  import { Tooltip, Popconfirm, Button } from '@chenzy-design/svelte';

  // Tooltip、Popconfirm、Popover 都需劫持 children 的事件（onmouseenter/onclick…）配置 trigger。
  // 直接嵌套会使外层 trigger 失效，需在中间加一层 span 隔离事件劫持（对齐 Semi）。
</script>

<Popconfirm title="确认" content="是否确认删除">
  <span style="display: inline-block;">
    <Tooltip content="删除评价">
      <Button type="danger">删除</Button>
    </Tooltip>
  </span>
</Popconfirm>
