<script lang="ts">
  import { TagInput } from '@chenzy-design/svelte';

  let value = $state('abc');
</script>

<TagInput inputValue={value} onInputChange={(v) => (value = v)} />
