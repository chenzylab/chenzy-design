<script lang="ts">
  import { Slider } from '@chenzy-design/svelte';
</script>

<div>
  <div style="height: 300px; margin-left: 30px; margin-top: 10px; padding-right: 30px; display: inline-block">
    <Slider vertical />
  </div>
  <div style="height: 300px; margin-left: 30px; margin-top: 10px; padding-right: 30px; display: inline-block">
    <Slider vertical verticalReverse />
  </div>
  <div style="height: 300px; margin-left: 30px; margin-top: 10px; padding-right: 30px; display: inline-block">
    <Slider vertical range defaultValue={[20, 60]} />
  </div>
  <div style="height: 300px; margin-left: 30px; margin-top: 10px; padding-right: 30px; display: inline-block">
    <Slider vertical verticalReverse range defaultValue={[20, 60]} />
  </div>
  <div style="height: 300px; margin-left: 30px; margin-top: 10px; padding-right: 30px; display: inline-block">
    <Slider vertical range marks={{ 20: '20°C', 40: '40°C' }} step={10} defaultValue={[20, 60]} />
  </div>
  <div style="height: 300px; margin-left: 30px; margin-top: 10px; padding-right: 30px; display: inline-block">
    <Slider vertical verticalReverse range marks={{ 20: '20°C', 40: '40°C' }} step={10} defaultValue={[20, 60]} />
  </div>
</div>
