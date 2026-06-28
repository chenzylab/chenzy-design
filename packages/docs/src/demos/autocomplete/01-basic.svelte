<script lang="ts">
  import { AutoComplete, Text } from '@chenzy-design/svelte';

  let value = $state('');
</script>

<div style="width: 220px">
  <AutoComplete
    data={['gmail.com', 'outlook.com', 'qq.com', '163.com']}
    {value}
    placeholder="输入邮箱后缀"
    onChange={(v) => (value = v)}
  />
  <Text type="tertiary">输入：{value || '（空）'}</Text>
</div>
