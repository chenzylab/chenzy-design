<script lang="ts">
  import { Divider } from '@chenzy-design/svelte';
</script>

<div style="max-width: 640px;">
  <span>1px（默认线宽）</span>
  <Divider margin={12} thickness={1} />
  <span>2px</span>
  <Divider margin={12} thickness={2} />
  <span>4px</span>
  <Divider margin={12} thickness={4} />
</div>
