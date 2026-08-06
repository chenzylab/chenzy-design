<script lang="ts">
  import { JsonViewer } from '@chenzy-design/svelte';

  const data = `{
    "name": "Semi",
    "version": "0.0.0"
}`;
</script>

<div style="margin-bottom: 16px;">
  <JsonViewer height={100} width={700} value={data} />
</div>
