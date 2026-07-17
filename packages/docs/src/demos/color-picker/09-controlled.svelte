<script lang="ts">
  import { ColorPicker, Button, Space, Text, colorValueFromHex, type ColorValue } from '@chenzy-design/svelte';

  // 受控：外部持有 ColorValue 对象，按钮编程式设置
  let color = $state<ColorValue>(colorValueFromHex('#39c5bb'));
  const swatches = ['#39c5bb', '#3366ff', '#16a34a', '#f59e0b'];
</script>

<Space vertical align="start">
  <Space align="center">
    <ColorPicker value={color} alpha onChange={(c) => (color = c)} />
    <Text type="tertiary">当前：{color.hex}</Text>
  </Space>
  <Space>
    {#each swatches as s (s)}
      <Button size="small" type="tertiary" onclick={() => (color = colorValueFromHex(s))}>
        <span style="display:inline-flex;align-items:center;gap:6px">
          <span style="width:12px;height:12px;border-radius:3px;background:{s}"></span>
          {s}
        </span>
      </Button>
    {/each}
  </Space>
</Space>
