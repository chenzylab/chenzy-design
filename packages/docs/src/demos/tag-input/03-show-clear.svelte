<script lang="ts">
  import { TagInput } from '@chenzy-design/svelte';
</script>

<TagInput
  showClear
  defaultValue={['抖音', '火山']}
  placeholder="请输入..."
  onChange={(v) => console.log(v)}
/>
