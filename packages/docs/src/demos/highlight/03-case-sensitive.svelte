<script lang="ts">
  import { Highlight } from '@chenzy-design/svelte';
</script>

<div style="display: flex; flex-direction: column; gap: 8px;">
  <div>
    <span style="color: #888; font-size: 12px;">大小写不敏感（默认）：</span><br />
    <Highlight sourceString="Hello World, hello svelte" searchWords="hello" />
  </div>
  <div>
    <span style="color: #888; font-size: 12px;">大小写敏感：</span><br />
    <Highlight sourceString="Hello World, hello svelte" searchWords="hello" caseSensitive />
  </div>
</div>
