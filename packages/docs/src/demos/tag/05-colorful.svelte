<script lang="ts">
  import { Tag } from '@chenzy-design/svelte';
</script>

<div style="display: flex; flex-direction: column; gap: 16px;">
  <!-- 渐变色（gradient）：solid / light / ghost -->
  <div style="display: flex; gap: 10px; flex-wrap: wrap; align-items: center;">
    <Tag colorful gradient type="solid" shape="circle">AI</Tag>
    <Tag colorful gradient type="light" shape="circle">AI</Tag>
    <Tag colorful gradient type="ghost" shape="circle">AI</Tag>
  </div>
  <!-- 单色（非 gradient）：solid / light / ghost -->
  <div style="display: flex; gap: 10px; flex-wrap: wrap; align-items: center;">
    <Tag colorful type="solid" shape="circle">AI</Tag>
    <Tag colorful type="light" shape="circle">AI</Tag>
    <Tag colorful type="ghost" shape="circle">AI</Tag>
  </div>
</div>
