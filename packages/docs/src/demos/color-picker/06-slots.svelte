<script lang="ts">
  import { ColorPicker, type ColorValue } from '@chenzy-design/svelte';
</script>

<ColorPicker alpha={true} onChange={(value: ColorValue) => console.log(value)}>
  {#snippet topSlot()}
    <div>TopSlot</div>
  {/snippet}
  {#snippet bottomSlot()}
    <div>Bottom Slot</div>
  {/snippet}
</ColorPicker>
