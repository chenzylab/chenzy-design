<script lang="ts">
  import { JsonViewer } from '@chenzy-design/svelte';

  const value = JSON.stringify(
    {
      status: 'ok',
      data: { id: 1, tags: ['a', 'b'], enabled: true, note: null },
    },
    null,
    2,
  );
</script>

<div style="margin-bottom: 16px;">
  <JsonViewer {value} height={180} width="100%" options={{ readOnly: true }} />
</div>
