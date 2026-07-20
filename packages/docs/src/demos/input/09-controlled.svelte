<script lang="ts">
  import { Input } from '@chenzy-design/svelte';

  let value = $state('controlInput');

  function onChange(val: string) {
    console.log(val);
    value = val;
  }
</script>

<Input {value} {onChange} />
