<script lang="ts">
  import { Rating, Text, Space } from '@chenzy-design/svelte';

  const tooltips = ['很差', '较差', '一般', '推荐', '力荐'];
  let heart = $state(4);
  let grade = $state(3);
</script>

<Space direction="vertical">
  <Space>
    <Rating value={heart} character="♥" {tooltips} onChange={(v) => (heart = v)} />
    <Text type="tertiary">自定义字符 + 逐项提示：{tooltips[grade - 1] ?? '未评'}</Text>
  </Space>
  <Space>
    <Rating value={grade} character="A" onChange={(v) => (grade = v)} />
    <Text type="tertiary">自定义字符（字母）：{grade}</Text>
  </Space>
</Space>
