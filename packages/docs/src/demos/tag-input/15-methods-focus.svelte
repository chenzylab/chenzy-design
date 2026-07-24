<script lang="ts">
  import { TagInput, Button } from '@chenzy-design/svelte';

  let ref = $state<ReturnType<typeof TagInput>>();
</script>

<TagInput defaultValue={['抖音', '火山']} bind:this={ref} />
<Button style="margin-top: 10px" onclick={() => ref?.focus()}>点击按钮聚焦</Button>
