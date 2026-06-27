<script lang="ts">
  import { Switch } from '@chenzy-design/svelte';
</script>

<div style="display: flex; gap: 16px; align-items: center;">
  <Switch defaultValue={true} checkedChildren="开" uncheckedChildren="关" />
  <Switch defaultValue={false} checkedChildren="ON" uncheckedChildren="OFF" />
</div>
