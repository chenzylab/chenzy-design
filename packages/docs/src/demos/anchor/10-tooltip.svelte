<!-- 对齐 Semi「显示工具提示」：showTooltip 在 Link 超出 maxWidth 时 hover 显示完整文字。 -->
<script lang="ts">
  import { Anchor } from '@chenzy-design/svelte';
</script>

<Anchor showTooltip maxWidth={160}>
  <Anchor.Link
    href="#tt-tooltip"
    title="工具提示是一个有用的工具，它可以在文字缩略时展示全部内容。"
  />
  <Anchor.Link href="#tt-comp" title="组件" />
  <Anchor.Link href="#tt-lang" title="设计语言" />
  <Anchor.Link href="#tt-material" title="物料平台" />
  <Anchor.Link href="#tt-theme" title="主题商店" />
</Anchor>
