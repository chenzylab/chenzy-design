<script lang="ts">
  import { Banner } from '@chenzy-design/svelte';
  import { IconBell, IconClose } from '@chenzy-design/icons';

  // 通过 icon 自定义图标；通过 closeIcon 自定义关闭图标。
</script>

<Banner type="info" description="通过 icon 属性自定义横幅图标。">
  {#snippet icon()}
    <IconBell size="large" />
  {/snippet}
</Banner>
<br />
<Banner type="success" description="通过 closeIcon 属性自定义关闭图标。">
  {#snippet closeIcon()}
    <IconClose />
  {/snippet}
</Banner>
