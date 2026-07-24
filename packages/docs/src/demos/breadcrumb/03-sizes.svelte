<script lang="ts">
  import { Breadcrumb } from '@chenzy-design/svelte';
  import { IconHome } from '@chenzy-design/icons';
</script>

<!-- 尺寸对齐 Semi：默认 compact 紧凑；compact={false} 使图标和文字尺寸增加。 -->
<div>
  <Breadcrumb compact>
    <Breadcrumb.Item>
      {#snippet icon()}<IconHome size="small" />{/snippet}
    </Breadcrumb.Item>
    <Breadcrumb.Item>Breadcrumb</Breadcrumb.Item>
    <Breadcrumb.Item>Loose</Breadcrumb.Item>
  </Breadcrumb>
  <br />
  <Breadcrumb compact={false}>
    <Breadcrumb.Item>
      {#snippet icon()}<IconHome size="small" />{/snippet}
    </Breadcrumb.Item>
    <Breadcrumb.Item>Breadcrumb</Breadcrumb.Item>
    <Breadcrumb.Item>Loose</Breadcrumb.Item>
  </Breadcrumb>
</div>
