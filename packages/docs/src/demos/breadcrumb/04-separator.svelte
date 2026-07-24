<script lang="ts">
  import { Breadcrumb, Tag } from '@chenzy-design/svelte';
  import { IconArrowRight } from '@chenzy-design/icons';
</script>

<div>
  <Breadcrumb separator=">">
    <Breadcrumb.Item>Semi-ui</Breadcrumb.Item>
    <Breadcrumb.Item>Breadcrumb</Breadcrumb.Item>
    <Breadcrumb.Item>Default</Breadcrumb.Item>
  </Breadcrumb>
  <br />
  <Breadcrumb>
    {#snippet separator()}<IconArrowRight size="small" />{/snippet}
    <Breadcrumb.Item>Semi-ui</Breadcrumb.Item>
    <Breadcrumb.Item>Breadcrumb</Breadcrumb.Item>
    <Breadcrumb.Item>Default</Breadcrumb.Item>
  </Breadcrumb>
  <br />
  <Tag>{`v>=1.16.0`}</Tag>
  <br />
  <Breadcrumb>
    <Breadcrumb.Item separator=":">Semi-ui</Breadcrumb.Item>
    <Breadcrumb.Item>Breadcrumb</Breadcrumb.Item>
    <Breadcrumb.Item>Default</Breadcrumb.Item>
  </Breadcrumb>
</div>
