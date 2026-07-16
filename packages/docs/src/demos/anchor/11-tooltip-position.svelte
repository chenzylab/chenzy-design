<!-- 对齐 Semi「工具提示位置」：position 设置 Tooltip 显示位置，仅 showTooltip=true 时生效。 -->
<script lang="ts">
  import { Anchor } from '@chenzy-design/svelte';
</script>

<Anchor showTooltip position="right" maxWidth={160}>
  <Anchor.Link
    href="#tp-tooltip"
    title="工具提示是一个有用的工具，它可以在文字缩略时展示全部内容。"
  />
  <Anchor.Link href="#tp-comp" title="组件" />
  <Anchor.Link href="#tp-lang" title="设计语言" />
  <Anchor.Link href="#tp-material" title="物料平台" />
  <Anchor.Link href="#tp-theme" title="主题商店" />
</Anchor>
