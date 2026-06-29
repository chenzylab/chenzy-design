<script lang="ts">
  import { Layout } from '@chenzy-design/svelte';
</script>

<div style="border: 1px solid var(--cd-color-border); border-radius: 8px; overflow: hidden;">
  <Layout>
    <Layout.Header
      style="display:flex; align-items:center; justify-content:center; background: var(--cd-color-fill-0); color: var(--cd-color-text-1); font-weight:600;"
    >
      Header
    </Layout.Header>
    <Layout.Content
      style="height: 200px; display:flex; align-items:center; justify-content:center; background: var(--cd-color-bg-0); color: var(--cd-color-text-2);"
    >
      Content
    </Layout.Content>
    <Layout.Footer
      style="display:flex; align-items:center; justify-content:center; background: var(--cd-color-fill-0); color: var(--cd-color-text-2);"
    >
      Footer
    </Layout.Footer>
  </Layout>
</div>
