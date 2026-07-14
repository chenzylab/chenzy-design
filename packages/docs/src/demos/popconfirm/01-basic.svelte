<script lang="ts">
  import { Popconfirm, Button, Toast } from '@chenzy-design/svelte';

  const onConfirm = () => {
    Toast.success('确认保存！');
  };
  const onCancel = () => {
    Toast.warning('取消保存！');
  };
</script>

<Popconfirm
  title="确定是否要保存此修改？"
  content="此修改将不可逆"
  {onConfirm}
  {onCancel}
>
  <Button>保存</Button>
</Popconfirm>
