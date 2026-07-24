<script lang="ts">
  import { Slider } from '@chenzy-design/svelte';
</script>

<div>
  <Slider tipFormatter={(v) => `${v}%`} getAriaValueText={(v) => `${v}%`} />
  <br />
  <br />
  <Slider tipFormatter={() => null} />
</div>
