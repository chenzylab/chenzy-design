<script lang="ts">
  import { Icon } from '@chenzy-design/svelte';

  const arrow =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
</script>

<div style="display: flex; gap: 20px; align-items: center; flex-wrap: wrap;">
  <Icon size="large" rotate={0} svg={arrow} />
  <Icon size="large" rotate={90} svg={arrow} />
  <Icon size="large" rotate={180} svg={arrow} />
  <Icon size="large" rotate={270} svg={arrow} />
</div>
