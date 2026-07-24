<script lang="ts">
  import { Rating } from '@chenzy-design/svelte';

  let value = $state(0);
  const desc = ['terrible', 'bad', 'normal', 'good', 'wonderful'];
</script>

<div>
  <span>
    How was the help you received:
    {#if value}<span>{desc[value - 1]}</span>{/if}
  </span>
  <br />
  <Rating tooltips={desc} onChange={(val) => (value = val)} {value} />
</div>
