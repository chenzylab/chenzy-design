<script lang="ts">
  import { ColorPicker, colorStringToValue, type ColorValue } from '@chenzy-design/svelte';
</script>

<div>
  <ColorPicker
    defaultValue={colorStringToValue('rgb(57,197,187)')}
    onChange={(value: ColorValue) => {
      console.log(value);
    }}
    class=""
    alpha={true}
  />
</div>
