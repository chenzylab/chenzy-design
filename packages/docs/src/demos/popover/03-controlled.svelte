<script lang="ts">
  import { Popover, RadioGroup, Radio } from '@chenzy-design/svelte';

  let visible = $state(false);
</script>

<Popover {visible} trigger="custom">
  {#snippet content()}
    <div style="padding: 12px; max-width: 240px;">
      设置 trigger='custom' 后，气泡的显示完全受 visible 控制。
    </div>
  {/snippet}
  <RadioGroup type="button" value={visible} onChange={(e) => (visible = e.target.value as boolean)}>
    <Radio value={true}>受控显示</Radio>
    <Radio value={false}>受控隐藏</Radio>
  </RadioGroup>
</Popover>
