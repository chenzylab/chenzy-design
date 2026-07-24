<script lang="ts">
  import { Slider } from '@chenzy-design/svelte';
</script>

<div>
  <div>
    <div>Default</div>
    <Slider showBoundary={true} />
  </div>
  <br />
  <br />
  <div>
    <div>Range</div>
    <Slider defaultValue={[20, 60]} range />
  </div>
  <br />
  <br />
  <div>
    <div>Disabled</div>
    <Slider defaultValue={40} disabled />
  </div>
</div>
