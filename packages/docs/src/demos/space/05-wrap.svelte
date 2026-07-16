<script lang="ts">
  import { Space, Button } from '@chenzy-design/svelte';
</script>

<Space wrap style="max-width:320px;">
  {#each Array(10) as _, i (i)}
    <Button theme="solid" type="secondary">按钮</Button>
  {/each}
</Space>
