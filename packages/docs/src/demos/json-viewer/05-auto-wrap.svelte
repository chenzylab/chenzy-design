<script lang="ts">
  // 对齐 Semi「自动换行」：options.autoWrap 为 true 时根据内容长度自动换行。
  import { JsonViewer } from '@chenzy-design/svelte';

  const data = `{
    "name": "Semi",
    "version": "0.0.0",
    "description": "Semi Design is a design system that defines a set of mid_back design and front_end basic components."
}`;
</script>

<JsonViewer height={120} width={700} value={data} options={{ autoWrap: true }} />
