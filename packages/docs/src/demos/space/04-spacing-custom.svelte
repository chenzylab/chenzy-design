<script lang="ts">
  import { Space, Button } from '@chenzy-design/svelte';
</script>

<Space vertical align="start" spacing="loose">
  <div>
    <div style="margin-bottom:8px;color:var(--cd-color-text-2);">spacing=&#123;32&#125;（自定义 number）</div>
    <Space spacing={32}>
      <Button theme="solid" type="primary">按钮</Button>
      <Button theme="solid" type="primary">按钮</Button>
      <Button theme="solid" type="primary">按钮</Button>
    </Space>
  </div>

  <div>
    <div style="margin-bottom:8px;color:var(--cd-color-text-2);">
      spacing=&#123;[8, 24]&#125;（数组 [水平, 垂直]，配合 wrap）
    </div>
    <Space spacing={[8, 24]} wrap style="max-width:320px;">
      {#each Array(10) as _, i (i)}
        <Button theme="solid" type="primary">按钮</Button>
      {/each}
    </Space>
  </div>
</Space>
