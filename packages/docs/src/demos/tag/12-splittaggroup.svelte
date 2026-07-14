<script lang="ts">
  import { SplitTagGroup, Tag } from '@chenzy-design/svelte';

  // 多个 Tag 组合成整体：首尾圆角、中间圆角为 0，形成连续视觉效果。
</script>

<div style="display: flex; flex-direction: column; gap: 12px; align-items: flex-start;">
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
</div>
