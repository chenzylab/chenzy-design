<script lang="ts">
  import { TagInput } from '@chenzy-design/svelte';

  let value = $state<string[]>(['抖音']);
</script>

<TagInput {value} onChange={(v) => (value = v)} />
