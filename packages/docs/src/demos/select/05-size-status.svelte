<script lang="ts">
  import { Select, Space, Text } from '@chenzy-design/svelte';

  const optionList = [
    { label: '选项 A', value: 'a' },
    { label: '选项 B', value: 'b' },
  ];
</script>

<Space vertical align="start">
  <!-- size 三档尺寸 -->
  <div style="width:240px"><Select {optionList} size="small" placeholder="small" /></div>
  <div style="width:240px"><Select {optionList} size="default" placeholder="default" /></div>
  <div style="width:240px"><Select {optionList} size="large" placeholder="large" /></div>
  <!-- validateStatus 校验态 -->
  <Text type="tertiary">校验状态：</Text>
  <div style="width:240px"><Select {optionList} validateStatus="warning" placeholder="warning" /></div>
  <div style="width:240px"><Select {optionList} validateStatus="error" placeholder="error" /></div>
</Space>
