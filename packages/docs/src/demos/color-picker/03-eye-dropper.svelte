<script lang="ts">
  import { ColorPicker, type ColorValue } from '@chenzy-design/svelte';
</script>

<ColorPicker
  alpha={true}
  eyeDropper={true}
  onChange={(value: ColorValue) => console.log(value)}
/>
