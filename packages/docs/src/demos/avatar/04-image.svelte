<script lang="ts">
  import { Avatar } from '@chenzy-design/svelte';

  const src = 'https://api.dicebear.com/7.x/avataaars/svg?seed=cat';
</script>

<div style="display: flex; gap: 12px; align-items: center;">
  <Avatar alt="漂亮的猫咪" {src} />
  <Avatar alt="可爱的猫咪" size="small" {src} />
</div>
