<script lang="ts">
  import { Layout } from '@chenzy-design/svelte';
</script>

<style>
  .demo-header { background: #4f46e5; color: #fff; padding: 0 24px; font-weight: 600; }
  .demo-content { background: #f5f3ff; color: #4338ca; padding: 24px; }
  .demo-footer { background: #e0e7ff; font-size: 12px; color: #6366f1; }
</style>

<div style="min-height: 240px; display: flex; flex-direction: column;">
  <Layout>
    <Layout.Header class="demo-header">Header</Layout.Header>
    <Layout.Content class="demo-content" padding>
      上中下三段式结构：Header 固定高度，Content 自动撑满，Footer 贴底。
    </Layout.Content>
    <Layout.Footer class="demo-footer">Footer · chenzy-design</Layout.Footer>
  </Layout>
</div>
