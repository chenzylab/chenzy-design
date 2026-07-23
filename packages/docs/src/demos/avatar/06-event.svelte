<script lang="ts">
  import { Avatar } from '@chenzy-design/svelte';
  import { IconCamera } from '@chenzy-design/icons';
</script>

<!-- hover 时通过 hoverMask 传入覆盖层内容（无默认样式）；支持 onClick / onMouseEnter / onMouseLeave -->
<Avatar color="red" alt="Bob Downton">
  BD
  {#snippet hoverMask()}
    <div
      style="background-color:var(--cd-color-overlay-bg);height:100%;width:100%;display:flex;align-items:center;justify-content:center;color:#fff;"
    >
      <IconCamera />
    </div>
  {/snippet}
</Avatar>
