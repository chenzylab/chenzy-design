<script lang="ts">
  import { Rating, Text, Space } from '@chenzy-design/svelte';

  let half = $state(2.5);
</script>

<Space vertical>
  <!-- 可交互半星：allowHalf 时点击星左/右半选 0.5 / 整星 -->
  <Space>
    <Rating value={half} allowHalf onChange={(v) => (half = v)} />
    <Text type="tertiary">可交互半星：{half}</Text>
  </Space>

  <!-- 自定义尺寸（size 传 number）需配合自定义字符才生效 -->
  <Space>
    <Rating character="♥" size={40} allowHalf defaultValue={3} style="color:var(--cd-color-danger)" />
    <Text type="tertiary">size={40} + 自定义字符 + 半星</Text>
  </Space>
</Space>
