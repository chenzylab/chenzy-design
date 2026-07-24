<script lang="ts">
  import { Rating } from '@chenzy-design/svelte';
</script>

<div>
  <Rating allowHalf defaultValue={3.5} />
  <br />
  <Rating allowHalf defaultValue={3.65} disabled />
</div>
