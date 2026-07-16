<script lang="ts">
  import { Switch } from '@chenzy-design/svelte';
</script>

<div style="display: flex; gap: 16px; align-items: center;">
  <Switch defaultValue={true} checkedText="开" uncheckedText="关" />
  <Switch defaultValue={false} checkedText="ON" uncheckedText="OFF" />
</div>
