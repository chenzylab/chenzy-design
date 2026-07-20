<script lang="ts">
  import { Switch } from '@chenzy-design/svelte';

  let checked = $state(true);

  function onChange(v: boolean) {
    checked = v;
  }
</script>

<Switch {checked} aria-label="a switch for demo" {onChange} />
