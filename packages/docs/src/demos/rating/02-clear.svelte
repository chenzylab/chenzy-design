<script lang="ts">
  import { Rating, Text, Space } from '@chenzy-design/svelte';

  let clearable = $state(3);
  let locked = $state(3);
</script>

<Space vertical>
  <Space>
    <Rating value={clearable} allowClear onChange={(v) => (clearable = v)} />
    <Text type="tertiary">允许清除（再次点击当前值清零）：{clearable}</Text>
  </Space>
  <Space>
    <Rating value={locked} allowClear={false} onChange={(v) => (locked = v)} />
    <Text type="tertiary">禁止清除：{locked}</Text>
  </Space>
</Space>
