<script lang="ts">
  import { Spin, Button } from '@chenzy-design/svelte';

  let loading = $state(false);
</script>

<div>
  <Button onclick={() => (loading = !loading)} style="margin-right:20px">
    延迟显示的 spin
  </Button>
  <Spin delay={1000} spinning={loading}></Spin>
</div>
