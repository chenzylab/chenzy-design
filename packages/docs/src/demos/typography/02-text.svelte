<script lang="ts">
  import { Text } from '@chenzy-design/svelte';
</script>

<div style="display: flex; flex-direction: column; gap: 8px;">
  <Text>默认文本</Text>
  <Text type="secondary">次要文本</Text>
  <Text type="tertiary">三级文本</Text>
  <Text type="quaternary">四级文本</Text>
  <Text type="success">成功文本</Text>
  <Text type="warning">警告文本</Text>
  <Text type="danger">危险文本</Text>
  <div style="display: flex; gap: 12px; flex-wrap: wrap;">
    <Text strong>加粗</Text>
    <Text underline>下划线</Text>
    <Text delete>删除线</Text>
    <Text mark>标记</Text>
    <Text code>code</Text>
    <Text disabled>禁用</Text>
  </div>
</div>
