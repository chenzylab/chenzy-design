<script lang="ts">
  import { Breadcrumb } from '@chenzy-design/svelte';
  import { IconHome, IconFolder, IconArticle } from '@chenzy-design/icons';
</script>

<Breadcrumb>
  <Breadcrumb.Item href="#">
    {#snippet icon()}<IconHome size="small" />{/snippet}
    首页
  </Breadcrumb.Item>
  <Breadcrumb.Item href="#">
    {#snippet icon()}<IconFolder size="small" />{/snippet}
    组件库
  </Breadcrumb.Item>
  <Breadcrumb.Item>
    {#snippet icon()}<IconArticle size="small" />{/snippet}
    Breadcrumb
  </Breadcrumb.Item>
</Breadcrumb>
