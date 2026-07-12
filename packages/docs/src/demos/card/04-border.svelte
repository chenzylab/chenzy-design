<script lang="ts">
  import { Card } from '@chenzy-design/svelte';
</script>

<!-- bordered 控制外边框，headerLine / footerLine 控制头/尾与内容区的分隔线 -->
<div style="display: inline-block; padding: 20px; background-color: var(--cd-color-fill-0);">
  <Card style="max-width: 360px;" bordered={false} headerLine={true} title="Semi Design">
    chenzy-design 是一套对齐 Semi Design 的组件系统，包含设计语言与一整套可复用的前端组件。
  </Card>
</div>
