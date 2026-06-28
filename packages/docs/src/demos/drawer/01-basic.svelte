<script lang="ts">
  import { Drawer, Button } from '@chenzy-design/svelte';

  let open = $state(false);
</script>

<Button type="primary" onclick={() => (open = true)}>打开抽屉</Button>

<Drawer
  title="抽屉标题"
  open={open}
  onOpenChange={(v) => (open = v)}
  onClose={() => (open = false)}
>
  <p>抽屉内容区域，适合放置详情、表单或辅助信息。</p>
</Drawer>
