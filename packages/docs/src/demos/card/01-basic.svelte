<script lang="ts">
  import { Card, Typography } from '@chenzy-design/svelte';
</script>

<Card title="Semi Design" style="max-width: 360px;">
  {#snippet headerExtraContent()}
    <Typography.Text link={{ href: '#' }}>更多</Typography.Text>
  {/snippet}
  chenzy-design 是一套对齐 Semi Design 的组件系统，帮助设计师与开发者更容易地打造高质量、体验一致、符合设计规范的 Web 应用。
</Card>
