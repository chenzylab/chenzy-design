<script lang="ts">
  import { SideSheet, Input, Button, Text } from '@chenzy-design/svelte';

  let ssRight = $state(false);
  let ssLeft = $state(false);
  let ssTop = $state(false);
  let ssBottom = $state(false);
  let ssSmall = $state(false);
  let ssLarge = $state(false);
  let ssNoMask = $state(false);
  let ssFooter = $state(false);
  let ssDestroy = $state(false);
  let ssReason = $state('');
</script>

<Text type="tertiary">受控 open + onOpenChange，reason: {ssReason || '—'}</Text>
<div style="display:flex; gap:12px; flex-wrap:wrap; margin-top:8px">
  <Button type="primary" onclick={() => (ssRight = true)}>右侧（模态）</Button>
  <Button onclick={() => (ssLeft = true)}>左侧</Button>
  <Button onclick={() => (ssTop = true)}>顶部</Button>
  <Button onclick={() => (ssBottom = true)}>底部</Button>
  <Button onclick={() => (ssSmall = true)}>small</Button>
  <Button onclick={() => (ssLarge = true)}>large</Button>
  <Button onclick={() => (ssNoMask = true)}>非模态 mask=false</Button>
  <Button onclick={() => (ssFooter = true)}>Footer close()</Button>
  <Button onclick={() => (ssDestroy = true)}>destroyOnClose</Button>
</div>

<SideSheet
  open={ssRight}
  placement="right"
  title="编辑用户"
  onOpenChange={(e) => {
    ssRight = e.open;
    ssReason = e.reason;
  }}
>
  <p style="margin:0; line-height:1.8">
    右侧模态面板：焦点捕获、背景滚动锁定、Esc/遮罩关闭，关闭后焦点归还触发按钮。
  </p>
</SideSheet>

<SideSheet
  open={ssLeft}
  placement="left"
  title="导航菜单"
  onOpenChange={(e) => (ssLeft = e.open)}
>
  <p style="margin:0; line-height:1.8">左侧滑入。</p>
</SideSheet>

<SideSheet
  open={ssTop}
  placement="top"
  title="系统通知"
  onOpenChange={(e) => (ssTop = e.open)}
>
  <p style="margin:0; line-height:1.8">顶部滑入。</p>
</SideSheet>

<SideSheet
  open={ssBottom}
  placement="bottom"
  title="筛选条件"
  onOpenChange={(e) => (ssBottom = e.open)}
>
  <p style="margin:0; line-height:1.8">底部滑入。</p>
</SideSheet>

<SideSheet
  open={ssSmall}
  placement="right"
  size="small"
  title="small 尺寸"
  onOpenChange={(e) => (ssSmall = e.open)}
>
  <p style="margin:0; line-height:1.8">small 预设宽度。</p>
</SideSheet>

<SideSheet
  open={ssLarge}
  placement="right"
  size="large"
  title="large 尺寸"
  onOpenChange={(e) => (ssLarge = e.open)}
>
  <p style="margin:0; line-height:1.8">large 预设宽度（90%）。</p>
</SideSheet>

<SideSheet
  open={ssNoMask}
  placement="right"
  mask={false}
  outsideClosable
  title="通知中心（非模态）"
  onOpenChange={(e) => (ssNoMask = e.open)}
>
  <p style="margin:0; line-height:1.8">
    mask=false：无遮罩、不锁背景滚动、不抢焦点，打开时仍可与主页面交互。点击面板外部关闭（outsideClosable）。
  </p>
</SideSheet>

<SideSheet
  open={ssFooter}
  placement="right"
  title="高级筛选"
  onOpenChange={(e) => (ssFooter = e.open)}
>
  <p style="margin:0; line-height:1.8">Footer 暴露 close()，按钮可关闭面板。</p>
  {#snippet footer({ close })}
    <Button onclick={close}>取消</Button>
    <Button type="primary" onclick={close}>应用筛选</Button>
  {/snippet}
</SideSheet>

<SideSheet
  open={ssDestroy}
  placement="right"
  title="destroyOnClose"
  destroyOnClose
  onOpenChange={(e) => (ssDestroy = e.open)}
>
  <p style="margin:0 0 12px; line-height:1.8">关闭即卸载，重开重置内部状态。</p>
  <Input placeholder="输入后关闭重开会清空" />
</SideSheet>
