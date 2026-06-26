<script lang="ts">
  import { Popconfirm, Button, Text } from '@chenzy-design/svelte';

  let popResult = $state('（无）');
  let popContainerEl = $state<HTMLDivElement | null>(null);
</script>

<div style="display:flex; gap:24px; padding:40px 0">
  <Popconfirm
    type="danger"
    title="确定删除该项？"
    content="此操作无法撤销。"
    okText="删除"
    onConfirm={() => { popResult = '已删除'; }}
    onCancel={() => (popResult = '已取消')}
  >
    {#snippet trigger()}
      <Button type="danger">删除</Button>
    {/snippet}
  </Popconfirm>

  <Popconfirm
    placement="bottom"
    title="确定提交？"
    onConfirm={() => { popResult = '已提交'; }}
  >
    {#snippet trigger()}
      <Button type="primary">提交</Button>
    {/snippet}
  </Popconfirm>

  <Popconfirm
    type="warning"
    placement="right"
    title="退出登录？"
    content="退出后需重新登录。"
    onConfirm={() => { popResult = '已退出'; }}
  >
    {#snippet trigger()}
      <Button>退出</Button>
    {/snippet}
  </Popconfirm>

  <Popconfirm
    triggerType="hover"
    title="悬停触发"
    content="移开指针延迟关闭。"
    onConfirm={() => { popResult = '悬停已确认'; }}
  >
    {#snippet trigger()}
      <Button>悬停（hover）</Button>
    {/snippet}
  </Popconfirm>

  <Popconfirm
    type="danger"
    title="异步删除该项？"
    content="确认后等待 1s 模拟请求。"
    okText="删除"
    onConfirm={() =>
      new Promise((resolve) => setTimeout(() => {
        popResult = '异步删除完成';
        resolve(undefined);
      }, 1000))}
  >
    {#snippet trigger()}
      <Button type="danger">异步删除</Button>
    {/snippet}
  </Popconfirm>
</div>

<div bind:this={popContainerEl} style="position:relative"></div>
<div style="padding:12px 0">
  <Popconfirm
    title="挂载到自定义容器"
    content="浮层 portal 到下方容器而非 body。"
    getPopupContainer={() => popContainerEl}
    onConfirm={() => { popResult = '容器确认'; }}
  >
    {#snippet trigger()}
      <Button>getPopupContainer</Button>
    {/snippet}
  </Popconfirm>
</div>

<div style="display:flex; gap:24px; flex-wrap:wrap; padding:12px 0">
  <Popconfirm
    title="保留浮层 DOM"
    content="destroyOnClose=false：关闭后浮层不卸载，仅隐藏。"
    destroyOnClose={false}
    onConfirm={() => { popResult = 'keep-DOM 确认'; }}
  >
    {#snippet trigger()}
      <Button>destroyOnClose=false</Button>
    {/snippet}
  </Popconfirm>

  <Popconfirm
    title="关闭入场动效"
    content="motion=false：直接出现，无淡入缩放。"
    motion={false}
    onConfirm={() => { popResult = 'no-motion 确认'; }}
  >
    {#snippet trigger()}
      <Button>motion=false</Button>
    {/snippet}
  </Popconfirm>

  <Popconfirm
    title="箭头指向中心"
    content="arrowPointAtCenter：箭头对准触发元素中心。"
    placement="bottomStart"
    arrowPointAtCenter
    onConfirm={() => { popResult = 'arrow-center 确认'; }}
  >
    {#snippet trigger()}
      <Button>arrowPointAtCenter</Button>
    {/snippet}
  </Popconfirm>

  <Popconfirm
    title="透传按钮属性"
    content="okButtonProps/cancelButtonProps：确认按钮 danger，取消按钮 large。"
    okText="删除"
    okButtonProps={{ type: 'danger' }}
    cancelButtonProps={{ size: 'large', theme: 'outline' }}
    onConfirm={() => { popResult = 'button-props 确认'; }}
  >
    {#snippet trigger()}
      <Button>ok/cancelButtonProps</Button>
    {/snippet}
  </Popconfirm>
</div>

<Text type="tertiary">操作结果：{popResult}</Text>
