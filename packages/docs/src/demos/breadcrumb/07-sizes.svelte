<script lang="ts">
  import { Breadcrumb } from '@chenzy-design/svelte';
  import { IconHome, IconFolder } from '@chenzy-design/icons';
</script>

<!-- 尺寸对齐 Semi：仅 compact 布尔驱动。compact（默认）字号紧凑；compact={false} 图标与文字尺寸增大。 -->
<div style="display:flex; flex-direction:column; gap:16px; align-items:flex-start">
  <Breadcrumb compact>
    <Breadcrumb.Item href="#">
      {#snippet icon()}<IconHome size="small" />{/snippet}
      首页
    </Breadcrumb.Item>
    <Breadcrumb.Item href="#">
      {#snippet icon()}<IconFolder size="small" />{/snippet}
      组件库
    </Breadcrumb.Item>
    <Breadcrumb.Item>Compact</Breadcrumb.Item>
  </Breadcrumb>

  <Breadcrumb compact={false}>
    <Breadcrumb.Item href="#">
      {#snippet icon()}<IconHome />{/snippet}
      首页
    </Breadcrumb.Item>
    <Breadcrumb.Item href="#">
      {#snippet icon()}<IconFolder />{/snippet}
      组件库
    </Breadcrumb.Item>
    <Breadcrumb.Item>Loose</Breadcrumb.Item>
  </Breadcrumb>
</div>
