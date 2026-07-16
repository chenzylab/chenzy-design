<script lang="ts">
  import { Rating, Text, Space } from '@chenzy-design/svelte';
</script>

<!-- 只读展示：设置 disabled 即无法交互，用于展示既定分值（对齐 Semi 只读用法） -->
<Space vertical>
  <Space>
    <Rating defaultValue={3} disabled />
    <Text type="tertiary">只读整星：展示分值，不可交互</Text>
  </Space>
  <Space>
    <Rating defaultValue={3.65} allowHalf disabled />
    <Text type="tertiary">只读半星：allowHalf 支持展示 .5 外的小数</Text>
  </Space>
</Space>
