<script lang="ts">
  import { Avatar } from '@chenzy-design/svelte';
</script>

<!-- hover 时显示覆盖层（hoverMask，无默认样式），并支持 onClick / onMouseEnter / onMouseLeave -->
<Avatar
  color="red"
  alt="Bob Downton"
  onClick={() => alert('点击头像')}
>
  BD
  {#snippet hoverMask()}
    <div
      style="background-color:var(--cd-color-mask);height:100%;width:100%;display:flex;align-items:center;justify-content:center;color:#fff;font-size:16px;"
    >
      📷
    </div>
  {/snippet}
</Avatar>
