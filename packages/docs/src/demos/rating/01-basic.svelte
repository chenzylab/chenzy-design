<script lang="ts">
  import { Rating, Text, Space } from '@chenzy-design/svelte';
</script>

<!-- 基本用法：两种尺寸 default / small（对齐 Semi 基本用法） -->
<Space vertical>
  <Space>
    <Rating defaultValue={5} />
    <Text type="tertiary">默认尺寸</Text>
  </Space>
  <Space>
    <Rating size="small" defaultValue={5} />
    <Text type="tertiary">小尺寸（small）</Text>
  </Space>
</Space>
