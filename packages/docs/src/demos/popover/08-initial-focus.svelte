<script lang="ts">
  import { Popover, Button, Input, Space } from '@chenzy-design/svelte';
</script>

<Popover trigger="click">
  {#snippet content()}
    <div style="padding: 12px;">
      <Space>
        <Button>first focusable element</Button>
        <span style="display: inline-block; width: 140px;">
          <Input placeholder="focus here" />
        </span>
      </Space>
    </div>
  {/snippet}
  <Button>click me</Button>
</Popover>
