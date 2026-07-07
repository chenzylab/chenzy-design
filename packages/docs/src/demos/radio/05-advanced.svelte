<script lang="ts">
  import { Radio, Text, Space } from '@chenzy-design/svelte';

  let checked = $state(true);
</script>

<Space vertical align="start">
  <!-- mode="advanced"：已选中时再次点击可取消选择 -->
  <Radio value="opt" mode="advanced" checked={checked} onChange={(c) => (checked = c)}>
    允许取消选择（再次点击取消）
  </Radio>
  <Text type="tertiary">{checked ? '已选中' : '未选中'}</Text>
</Space>
