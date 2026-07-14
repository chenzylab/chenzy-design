<script lang="ts">
  import { Popconfirm, Button } from '@chenzy-design/svelte';

  // onConfirm/onCancel 返回 Promise：对应按钮进入 loading，
  // resolve 关闭气泡、reject 保持打开（对齐 Semi 延时关闭）。
  const onConfirm = () =>
    new Promise<void>((resolve) => {
      setTimeout(() => {
        console.log('resolve, close popconfirm');
        resolve();
      }, 2000);
    });

  const onCancel = () =>
    new Promise<void>((_resolve, reject) => {
      setTimeout(() => {
        console.log('reject, popconfirm still exist');
        reject();
      }, 2000);
    });
</script>

<Popconfirm
  title="确定是否要保存此修改？"
  content="此修改将不可逆"
  {onConfirm}
  {onCancel}
>
  <Button>保存</Button>
</Popconfirm>
