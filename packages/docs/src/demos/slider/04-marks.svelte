<script lang="ts">
  import { Slider } from '@chenzy-design/svelte';
</script>

<div>
  <div>step=10</div>
  <Slider
    step={10}
    marks={{ 0: '0', 10: '10', 20: '20', 30: '30', 40: '40', 50: '50', 100: '100' }}
    defaultValue={[10, 100]}
    range={true}
  />
  <br />
  <br />
  <div>step=0.1</div>
  <Slider
    step={0.1}
    marks={{ 0.1: '0.1', 0.2: '0.2', 0.3: '0.3', 0.4: '0.4', 0.5: '0.5' }}
    min={0}
    max={1}
    defaultValue={[0.1, 0.5]}
    range={true}
  />
  <br />
  <br />
  <div>Marks</div>
  <Slider
    marks={{ 20: '20°C', 40: '40°C' }}
    defaultValue={[0, 100]}
    tipFormatter={(v) => `${v}°C`}
    range={true}
    getAriaValueText={(value) => `${value}°C`}
  />
  <br />
  <br />
  <div>Included</div>
  <Slider
    marks={{ 20: '20°C', 40: '40°C' }}
    included={false}
    defaultValue={[0, 100]}
    range={true}
    tipFormatter={(v) => `${v}°C`}
    getAriaValueText={(value) => `${value}°C`}
  />
</div>
