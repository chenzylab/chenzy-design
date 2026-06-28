<script lang="ts">
  import { Popconfirm, Button, Text } from '@chenzy-design/svelte';

  let result = $state('（无）');

  // onConfirm 返回 Promise：确认按钮进入 loading，resolve 后关闭、reject 保持打开。
  function asyncDelete() {
    result = '删除中…';
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        result = '删除成功';
        resolve();
      }, 1200);
    });
  }

  let attempt = $state(0);
  // reject：保持打开，让用户重试。
  function flakyConfirm() {
    result = '提交中…';
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        attempt += 1;
        if (attempt % 2 === 1) {
          result = '提交失败，请重试';
          reject(new Error('fail'));
        } else {
          result = '提交成功';
          resolve();
        }
      }, 1000);
    });
  }
</script>

<div style="display:flex; gap:16px; padding:40px 0; flex-wrap:wrap">
  <!-- 异步确认：loading 期间禁用取消、屏蔽外部点击/Esc -->
  <Popconfirm
    type="danger"
    title="异步删除该项？"
    content="确认后等待请求返回再关闭。"
    okText="删除"
    onConfirm={asyncDelete}
  >
    {#snippet trigger()}
      <Button type="danger">异步删除</Button>
    {/snippet}
  </Popconfirm>

  <!-- 失败保持打开：reject 不关闭，可立即重试（第二次成功） -->
  <Popconfirm
    title="提交订单？"
    content="首次模拟失败、再次提交成功。"
    okText="提交"
    onConfirm={flakyConfirm}
  >
    {#snippet trigger()}
      <Button type="primary">提交订单</Button>
    {/snippet}
  </Popconfirm>
</div>

<Text type="tertiary">操作结果：{result}</Text>
