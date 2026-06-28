<script lang="ts">
  import { Banner } from '@chenzy-design/svelte';
</script>

<div style="display: flex; flex-direction: column; gap: 12px; max-width: 640px;">
  <Banner type="info" title="系统提示" description="这是一条信息横幅，用于展示当前页面的全局状态。" />
  <Banner type="success" title="保存成功" description="你的更改已成功保存。" />
  <Banner type="warning" title="存储不足" description="剩余空间不足 10%，请及时清理。" />
  <Banner type="danger" title="订阅已过期" description="高级功能已停用，续费后立即恢复。" />
</div>
