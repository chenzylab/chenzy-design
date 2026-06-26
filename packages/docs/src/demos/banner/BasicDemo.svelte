<script lang="ts">
  import { Banner, Button } from '@chenzy-design/svelte';

  let bannerOpen = $state(true);
</script>

<div style="display:flex; flex-direction:column; gap:12px; max-width:640px">
  <Banner type="info" title="系统提示" description="这是一条信息横幅，用于展示当前页面的全局状态。" />
  <Banner type="success" title="保存成功" description="你的更改已成功保存。" />
  <Banner type="warning" fullMode={false} bordered title="存储空间不足" description="剩余空间不足 10%，请及时清理。" />
  <Banner type="danger" fullMode={false} bordered title="订阅已过期" description="高级功能已停用，续费后立即恢复。">
    {#snippet action({ close })}
      <Button type="primary" size="small" onclick={close}>立即续费</Button>
    {/snippet}
  </Banner>
</div>

<div style="margin-top:16px; max-width:640px">
  <Button onclick={() => (bannerOpen = true)} disabled={bannerOpen}>显示可关闭横幅</Button>
  <div style="margin-top:8px">
    <Banner
      type="info"
      open={bannerOpen}
      closeOnEsc
      onOpenChange={(info) => (bannerOpen = info.open)}
      title="可关闭横幅"
      description="点击右侧关闭按钮收起，或按 Esc 关闭；受控 open 状态。"
    />
  </div>
</div>
