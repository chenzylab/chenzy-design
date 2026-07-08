<script lang="ts">
  import { TagInput, Space } from '@chenzy-design/svelte';
</script>

<Space vertical align="start" style="width: 320px">
  <TagInput
    prefix="标签："
    defaultValue={['svelte', 'vite']}
    placeholder="输入后回车添加"
  />
  <TagInput
    suffix="个"
    defaultValue={['前端', '设计']}
    placeholder="输入后回车添加"
  />
</Space>
