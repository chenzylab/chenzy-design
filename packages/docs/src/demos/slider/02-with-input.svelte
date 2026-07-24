<script lang="ts">
  import { Slider, InputNumber } from '@chenzy-design/svelte';

  let value = $state<number>(10);

  const getSliderValue = (newValue: number | number[] | string | null) => {
    if (isNaN(Number(newValue))) {
      return;
    }
    value = Number(newValue) / 1;
  };
</script>

<div>
  <div style="width: 320px; margin-right: 15px">
    <Slider step={1} {value} onChange={getSliderValue} />
  </div>
  <InputNumber onChange={getSliderValue} style="width: 100px" {value} min={0} max={100} />
</div>
