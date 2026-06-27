<script lang="ts">
  import { Switch } from '@chenzy-design/svelte';
</script>

<div style="display: flex; gap: 16px; align-items: center;">
  <Switch disabled defaultValue={false} />
  <Switch disabled defaultValue={true} />
  <Switch loading defaultValue={true} />
</div>
