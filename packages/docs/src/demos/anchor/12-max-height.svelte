<!-- 对齐 Semi「max-height」story：设 maxHeight 控制 Anchor 高度，超出时 Anchor 自身滚动。 -->
<script lang="ts">
  import { Anchor } from '@chenzy-design/svelte';
</script>

<Anchor maxHeight={100}>
  <Anchor.Link href="#mh-组件" title="组件" />
  <Anchor.Link href="#mh-设计语言" title="设计语言" />
  <Anchor.Link href="#mh-物料平台" title="物料平台" />
  <Anchor.Link href="#mh-主题商店" title="主题商店" />
  <Anchor.Link
    href="#mh-工具提示"
    title="工具提示是一个有用的工具，它可以在文字缩略时展示全部内容。"
  />
</Anchor>
