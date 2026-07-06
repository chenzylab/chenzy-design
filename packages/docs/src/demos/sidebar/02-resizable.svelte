<script lang="ts">
  import { SideBarContainer, Button } from '@chenzy-design/svelte';

  let visible = $state(false);
</script>

<Button onclick={() => (visible = true)}>打开可伸缩侧边栏</Button>

<SideBarContainer
  {visible}
  title="可伸缩"
  resizable
  minWidth={280}
  maxWidth={560}
  defaultSize={{ width: 400 }}
  onCancel={() => (visible = false)}
>
  <p>拖拽左边缘调整宽度（复用 Resizable 的 createResizeDrag，clamp minWidth/maxWidth）。</p>
  <p>把手为 role=separator，聚焦后按 ←/→ 键盘调宽，Home/End 到最小/最大。</p>
</SideBarContainer>
