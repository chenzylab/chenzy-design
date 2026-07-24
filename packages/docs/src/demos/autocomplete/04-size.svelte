<script lang="ts">
  import { AutoComplete } from '@chenzy-design/svelte';

  const data = [1, 2, 3, 4];
</script>

<div>
  <AutoComplete {data} size="small" placeholder="small" style="width: 200px" />
  <br />
  <br />
  <AutoComplete {data} size="default" placeholder="default" style="width: 200px" />
  <br />
  <br />
  <AutoComplete {data} size="large" placeholder="large" style="width: 200px" />
</div>
