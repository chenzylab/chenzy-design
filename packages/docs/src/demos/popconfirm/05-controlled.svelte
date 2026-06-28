<script lang="ts">
  import { Popconfirm, Button, Text } from '@chenzy-design/svelte';

  // 受控显隐：open 由外部 state 驱动，onOpenChange 同步回写。
  let open = $state(false);
  let result = $state('（无）');
</script>

<div style="display:flex; gap:16px; align-items:center; padding:40px 0; flex-wrap:wrap">
  <Popconfirm
    {open}
    title="受控气泡"
    content="open 由外部状态控制，确认/取消/外部点击都通过 onOpenChange 回写。"
    onOpenChange={(info) => {
      open = info.open;
      result = `open=${info.open}（reason: ${info.reason}）`;
    }}
    onConfirm={() => { result = '受控确认'; }}
  >
    {#snippet trigger()}
      <Button type="primary">受控触发器</Button>
    {/snippet}
  </Popconfirm>

  <Button onclick={() => (open = !open)}>
    外部按钮：{open ? '关闭' : '打开'}
  </Button>

  <!-- 自定义标题/内容 snippet -->
  <Popconfirm
    onConfirm={() => { result = '富文本确认'; }}
  >
    {#snippet titleSnippet()}
      <span style="color:var(--cd-color-danger)">⚠ 自定义标题</span>
    {/snippet}
    {#snippet contentSnippet()}
      <div>
        通过 <code>titleSnippet</code> / <code>contentSnippet</code> 渲染富文本内容。
      </div>
    {/snippet}
    {#snippet trigger()}
      <Button>自定义内容</Button>
    {/snippet}
  </Popconfirm>
</div>

<Text type="tertiary">操作结果：{result}</Text>
