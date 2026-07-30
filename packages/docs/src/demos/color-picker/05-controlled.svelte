<script lang="ts">
  import { ColorPicker, type ColorValue } from '@chenzy-design/svelte';

  let value = $state<ColorValue>(ColorPicker.colorStringToValue('#39c5bb'));
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
