<script lang="ts">
  import { Breadcrumb } from '@chenzy-design/svelte';
  import { IconHome, IconArticle } from '@chenzy-design/icons';
</script>

<Breadcrumb>
  <Breadcrumb.Item>
    {#snippet icon()}<IconHome size="small" />{/snippet}
  </Breadcrumb.Item>
  <Breadcrumb.Item>
    {#snippet icon()}<IconArticle size="small" />{/snippet}
    Breadcrumb
  </Breadcrumb.Item>
  <Breadcrumb.Item>With Icon</Breadcrumb.Item>
</Breadcrumb>
