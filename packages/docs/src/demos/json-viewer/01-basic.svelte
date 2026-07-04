<script lang="ts">
  import { JsonViewer } from '@chenzy-design/svelte';

  const value = JSON.stringify(
    {
      name: 'chenzy-design',
      version: '0.1.0',
      private: false,
      keywords: ['svelte', 'design-system'],
      engines: { node: '>=18' },
    },
    null,
    2,
  );
</script>

<JsonViewer {value} height={220} width="100%" />
