<script lang="ts">
  import { ColorPicker, Button, type ColorValue } from '@chenzy-design/svelte';
</script>

<div>
  <ColorPicker alpha={true} onChange={(value: ColorValue) => console.log(value)} usePopover={true} />
  <br />
  <div>自定义 trigger</div>
  <ColorPicker alpha={true} onChange={(value: ColorValue) => console.log(value)} usePopover={true}>
    <Button>Trigger</Button>
  </ColorPicker>
</div>
