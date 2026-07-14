<script lang="ts">
  import { SplitTagGroup, Tag } from '@chenzy-design/svelte';

  // 子 Tag 保留自身颜色 / 类型，连接外观纯视觉不影响语义。
</script>

<div style="display: flex; flex-direction: column; gap: 12px; align-items: flex-start;">
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
</div>
