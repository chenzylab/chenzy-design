<script lang="ts">
  import { Popover, Button } from '@chenzy-design/svelte';

  let open = $state(false);
</script>

<Popover trigger="click" title="用户信息" open={open} onOpenChange={(v) => (open = v)}>
  {#snippet contentSlot()}
    <div style="min-width: 200px;">
      <p style="margin: 0 0 8px;">姓名：张三</p>
      <p style="margin: 0 0 8px;">部门：工程部</p>
      <p style="margin: 0 0 12px;">邮箱：zhangsan@example.com</p>
      <Button size="small" onclick={() => (open = false)}>关闭</Button>
    </div>
  {/snippet}
  <Button>查看详情</Button>
</Popover>
