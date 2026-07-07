<script lang="ts">
  import { Space, Button } from '@chenzy-design/svelte';
</script>

<!-- block：占满父容器宽度（display:flex）；tag：语义化根标签（这里用 nav） -->
<div style="border:1px dashed var(--cd-color-border);padding:12px;">
  <div style="margin-bottom:8px;color:var(--cd-color-text-2);">block（占满宽度）+ align="center"</div>
  <Space block align="center" tag="nav">
    <Button theme="solid" type="primary">首页</Button>
    <Button type="tertiary">文档</Button>
    <Button type="tertiary">关于</Button>
  </Space>
</div>
