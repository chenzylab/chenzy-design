<script lang="ts">
  import { Popconfirm, Button, Text } from '@chenzy-design/svelte';

  let result = $state('（无）');
</script>

<div style="display:flex; gap:16px; padding:40px 0; flex-wrap:wrap">
  <!-- 自定义确认/取消文案 -->
  <Popconfirm
    title="发布这篇文章？"
    content="发布后将对所有人可见。"
    okText="立即发布"
    cancelText="再想想"
    onConfirm={() => { result = '已发布'; }}
    onCancel={() => { result = '取消发布'; }}
  >
    {#snippet trigger()}
      <Button type="primary">发布</Button>
    {/snippet}
  </Popconfirm>

  <!-- 危险确认：okType=danger 高亮确认按钮 -->
  <Popconfirm
    type="danger"
    title="永久删除账户？"
    content="所有数据将被清除，无法恢复。"
    okText="删除账户"
    okType="danger"
    onConfirm={() => { result = '账户已删除'; }}
  >
    {#snippet trigger()}
      <Button type="danger">删除账户</Button>
    {/snippet}
  </Popconfirm>

  <!-- 透传按钮额外属性：确认按钮加大、取消按钮 outline -->
  <Popconfirm
    title="归档该任务？"
    content="归档后可在归档区找回。"
    okText="归档"
    okButtonProps={{ size: 'default', type: 'warning' }}
    cancelButtonProps={{ theme: 'outline' }}
    onConfirm={() => { result = '已归档'; }}
  >
    {#snippet trigger()}
      <Button>归档</Button>
    {/snippet}
  </Popconfirm>

  <!-- 隐藏取消按钮：仅确认 -->
  <Popconfirm
    title="知道了吗？"
    content="showCancel=false：仅保留确认按钮。"
    okText="知道了"
    showCancel={false}
    onConfirm={() => { result = '已知晓'; }}
  >
    {#snippet trigger()}
      <Button>仅确认</Button>
    {/snippet}
  </Popconfirm>
</div>

<Text type="tertiary">操作结果：{result}</Text>
