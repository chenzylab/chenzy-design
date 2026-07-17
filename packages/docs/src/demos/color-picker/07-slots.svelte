<script lang="ts">
  import { ColorPicker, Text, colorValueFromHex, type ColorValue } from '@chenzy-design/svelte';

  let color = $state<ColorValue>(colorValueFromHex('#3366ff'));
</script>

<ColorPicker value={color} onChange={(c) => (color = c)}>
  {#snippet topSlot()}
    <div style="padding:4px 0;font-size:12px;color:var(--cd-color-text-2)">选择主题色</div>
  {/snippet}
  {#snippet bottomSlot()}
    <div style="padding-top:8px;border-top:1px solid var(--cd-color-border);font-size:12px">
      <Text type="tertiary">当前：{color.hex}</Text>
    </div>
  {/snippet}
</ColorPicker>
