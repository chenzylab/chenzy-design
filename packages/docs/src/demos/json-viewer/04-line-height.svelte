<script lang="ts">
  // 对齐 Semi「设置行高」：options.lineHeight 设置固定行高（单位 px，默认 18）。
  import { JsonViewer } from '@chenzy-design/svelte';

  const data = `{
    "name": "Semi",
    "version": "0.0.0"
}`;
</script>

<div>
  <div style="margin-bottom: 12px; overflow: hidden;">
    <JsonViewer height={100} width={700} value={data} options={{ lineHeight: 20 }} />
  </div>
  <div style="margin-bottom: 12px; overflow: hidden;">
    <JsonViewer height={120} width={700} value={data} options={{ lineHeight: 24 }} />
  </div>
  <div style="margin-bottom: 12px; overflow: hidden;">
    <JsonViewer height={120} width={700} value={data} options={{ lineHeight: 26 }} />
  </div>
</div>
