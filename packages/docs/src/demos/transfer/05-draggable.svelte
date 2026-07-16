<script lang="ts">
  import { Transfer, Text } from '@chenzy-design/svelte';

  const data = Array.from({ length: 10 }, (_, i) => ({
    key: `${i}`,
    label: `选项 ${i}`,
  }));

  let value = $state<(string | number)[]>(['0', '1', '2', '3']);
</script>

<!-- draggable：右侧已选列可鼠标拖拽重排，新顺序仅经 onChange 通知 -->
<Transfer draggable dataSource={data} {value} onChange={(keys) => (value = keys)} />
<Text type="tertiary">当前顺序：{value.join(', ') || '（无）'}</Text>
