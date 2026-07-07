<script lang="ts">
  import { Layout } from '@chenzy-design/svelte';
</script>

<!-- Content 弹性撑满（flex:1），高度由外层容器决定：外层固定高度 + Layout height:100% 撑满，
     Content 自然填充 Header/Footer 之间的剩余空间（不要在 Content 上写死 height）。 -->
<div style="height: 320px; border: 1px solid var(--cd-color-border); border-radius: 8px; overflow: hidden;">
  <Layout style="height: 100%;">
    <Layout.Header
      style="display:flex; align-items:center; justify-content:center; background: var(--cd-color-fill-0); color: var(--cd-color-text-1); font-weight:600;"
    >
      Header
    </Layout.Header>
    <Layout.Content
      style="display:flex; align-items:center; justify-content:center; background: var(--cd-color-bg-0); color: var(--cd-color-text-2);"
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
