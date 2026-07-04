<script lang="ts">
  import { JsonViewer } from '@chenzy-design/svelte';

  // 传入未格式化的紧凑 JSON，配合 formatOptions 控制缩进。
  const value = '{"a":1,"b":{"c":2,"d":[3,4]},"e":"text"}';
</script>

<JsonViewer
  {value}
  height={180}
  width="100%"
  options={{ formatOptions: { tabSize: 2, insertSpaces: true, eol: '\n' } }}
/>
