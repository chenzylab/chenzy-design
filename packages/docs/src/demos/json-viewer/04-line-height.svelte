<script lang="ts">
  // 对齐 Semi「设置行高」：options.lineHeight 控制每行高度（默认 20）。
  import { JsonViewer } from '@chenzy-design/svelte';

  const value = JSON.stringify(
    { name: 'chenzy-design', version: '0.1.0', keywords: ['svelte', 'design-system'] },
    null,
    2,
  );
</script>

<JsonViewer {value} height={220} width="100%" options={{ lineHeight: 30 }} />
