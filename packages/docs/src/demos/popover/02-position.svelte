<script lang="ts">
  import { Popover, Button } from '@chenzy-design/svelte';
</script>

<div style="display: flex; gap: 8px; flex-wrap: wrap; justify-content: center; padding: 24px;">
  <Popover content="上方气泡" position="top" trigger="click">
    <Button>上</Button>
  </Popover>
  <Popover content="下方气泡" position="bottom" trigger="click">
    <Button>下</Button>
  </Popover>
  <Popover content="左侧气泡" position="left" trigger="click">
    <Button>左</Button>
  </Popover>
  <Popover content="右侧气泡" position="right" trigger="click">
    <Button>右</Button>
  </Popover>
</div>
