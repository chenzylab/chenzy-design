<script lang="ts">
  import { TagInput } from '@chenzy-design/svelte';
</script>

<TagInput
  maxTagCount={2}
  showRestTagsPopover={true}
  restTagsPopoverProps={{ position: 'top' }}
  defaultValue={['抖音', '火山', '西瓜视频']}
  onChange={(v) => console.log(v)}
/>
