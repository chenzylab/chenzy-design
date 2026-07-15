<script lang="ts">
  import { Layout } from '@chenzy-design/svelte';

  // 对齐 Semi commonStyle：高 64、行高 64、fill-0 背景。
  const commonStyle =
    'height: 64px; line-height: 64px; text-align: center; background: var(--cd-color-fill-0);';
</script>

<Layout>
  <Layout.Header style={commonStyle}>Header</Layout.Header>
  <Layout.Content style="height: 300px; line-height: 300px; text-align: center;">
    Content
  </Layout.Content>
  <Layout.Footer style={commonStyle}>Footer</Layout.Footer>
</Layout>
