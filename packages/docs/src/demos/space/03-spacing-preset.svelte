<script lang="ts">
  import { Space, Button } from '@chenzy-design/svelte';

  const presets = ['tight', 'medium', 'loose'] as const;
</script>

<Space vertical align="start" spacing="loose">
  {#each presets as spacing (spacing)}
    <div>
      <div style="margin-bottom:8px;color:var(--cd-color-text-2);">spacing="{spacing}"</div>
      <Space {spacing}>
        <Button theme="solid" type="primary">按钮</Button>
        <Button theme="solid" type="primary">按钮</Button>
        <Button theme="solid" type="primary">按钮</Button>
        <Button theme="solid" type="primary">按钮</Button>
      </Space>
    </div>
  {/each}
</Space>
