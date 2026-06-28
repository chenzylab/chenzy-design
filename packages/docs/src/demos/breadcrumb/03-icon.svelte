<script lang="ts">
  import { Breadcrumb, Icon } from '@chenzy-design/svelte';

  const homeSvg =
    '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor"><path d="M12 3 4 9v12h5v-7h6v7h5V9z"/></svg>';
  const folderSvg =
    '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor"><path d="M10 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-8z"/></svg>';
  const docSvg =
    '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor"><path d="M6 2h8l4 4v16H6z"/></svg>';
</script>

<Breadcrumb>
  <Breadcrumb.Item href="#">
    {#snippet icon()}<Icon svg={homeSvg} size="small" />{/snippet}
    首页
  </Breadcrumb.Item>
  <Breadcrumb.Item href="#">
    {#snippet icon()}<Icon svg={folderSvg} size="small" />{/snippet}
    组件库
  </Breadcrumb.Item>
  <Breadcrumb.Item>
    {#snippet icon()}<Icon svg={docSvg} size="small" />{/snippet}
    Breadcrumb
  </Breadcrumb.Item>
</Breadcrumb>
