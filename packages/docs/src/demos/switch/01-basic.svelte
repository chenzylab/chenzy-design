<script lang="ts">
  import { Switch } from '@chenzy-design/svelte';
</script>

<div>
  <Switch onChange={(v) => console.log(v)} aria-label="a switch for demo"></Switch>
  <br />
  <Switch defaultChecked onChange={(v) => console.log(v)} aria-label="a switch for semi demo"></Switch>
</div>
