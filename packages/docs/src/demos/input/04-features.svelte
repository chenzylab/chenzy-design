<script lang="ts">
  import { Input } from '@chenzy-design/svelte';
  import { IconClose } from '@chenzy-design/icons';
</script>

<div style="display: flex; flex-direction: column; gap: 12px; max-width: 320px;">
  <!-- showClear：有内容且 hover/focus 时点击图标清空 -->
  <Input showClear defaultValue="点击右侧图标清除" placeholder="showClear" />
  <!-- clearIcon：自定义清除图标 -->
  <Input showClear defaultValue="自定义清除图标">
    {#snippet clearIcon()}<IconClose />{/snippet}
  </Input>
</div>
