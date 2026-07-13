<script lang="ts">
  import { Popconfirm, Button } from '@chenzy-design/svelte';

  let result = $state('');
</script>

<Popconfirm
  title="确定是否要保存此修改？"
  content="此修改将不可逆"
  onConfirm={() => { result = '确认保存！'; }}
  onCancel={() => { result = '取消保存！'; }}
>
  <Button>保存</Button>
</Popconfirm>

<span style="margin-left: 12px; color: var(--cd-color-text-2);">{result}</span>
