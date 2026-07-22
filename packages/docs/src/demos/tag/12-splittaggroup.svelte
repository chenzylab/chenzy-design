<script lang="ts">
  import { SplitTagGroup, Tag, Space } from '@chenzy-design/svelte';

  // 多个 Tag 组合成整体：首尾圆角、中间圆角为 0，形成连续视觉效果。
</script>

<Space vertical align="start">
  <SplitTagGroup>
    <Tag color="blue" type="solid">标签一</Tag>
    <Tag color="cyan" type="solid">标签二</Tag>
    <Tag color="teal" type="solid">标签三</Tag>
  </SplitTagGroup>

  <SplitTagGroup>
    <Tag color="violet" shape="circle">组合</Tag>
    <Tag color="purple" shape="circle">标签</Tag>
    <Tag color="pink" shape="circle">示例</Tag>
    <Tag color="red" shape="circle">效果</Tag>
  </SplitTagGroup>

  <SplitTagGroup>
    <Tag color="amber" type="light">浅色</Tag>
    <Tag color="orange" type="light">组合</Tag>
    <Tag color="yellow" type="light">标签</Tag>
  </SplitTagGroup>

  <SplitTagGroup>
    <Tag color="green" type="ghost">镂空</Tag>
    <Tag color="light-green" type="ghost">样式</Tag>
    <Tag color="lime" type="ghost">组合</Tag>
  </SplitTagGroup>
</Space>
