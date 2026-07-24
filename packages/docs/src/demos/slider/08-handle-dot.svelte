<script lang="ts">
  import { Slider } from '@chenzy-design/svelte';
</script>

<div>
  <div>
    <div>Default</div>
    <Slider showBoundary={true} handleDot={{ size: '4px', color: 'blue' }} />
  </div>
  <br />
  <br />
  <div>
    <div>Range</div>
    <Slider
      defaultValue={[20, 60]}
      range
      handleDot={[
        { size: '4px', color: 'blue' },
        { size: '4px', color: 'pink' },
      ]}
    />
  </div>
</div>
