<script lang="ts">
  import { ColorPicker, colorStringToValue, type ColorValue } from '@chenzy-design/svelte';

  let value = $state<ColorValue>(colorStringToValue('#39c5bb'));
</script>

<div>
  <ColorPicker
    {value}
    onChange={(next: ColorValue) => {
      value = next;
    }}
    alpha={true}
  />
</div>
