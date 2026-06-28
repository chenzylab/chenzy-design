<script lang="ts">
  import { Tooltip, Button } from '@chenzy-design/svelte';
</script>

<div style="display: flex; gap: 8px; flex-wrap: wrap; justify-content: center; padding: 32px;">
  <Tooltip content="上方提示" placement="top">
    <Button>上</Button>
  </Tooltip>
  <Tooltip content="下方提示" placement="bottom">
    <Button>下</Button>
  </Tooltip>
  <Tooltip content="左侧提示" placement="left">
    <Button>左</Button>
  </Tooltip>
  <Tooltip content="右侧提示" placement="right">
    <Button>右</Button>
  </Tooltip>
</div>
