<script lang="ts">
  import { TagInput } from '@chenzy-design/svelte';
</script>

<TagInput
  defaultValue={['抖音', '火山', '西瓜视频']}
  allowDuplicates={false}
  placeholder="请输入..."
  onChange={(v) => console.log(v)}
/>
