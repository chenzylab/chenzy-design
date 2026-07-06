<script lang="ts">
  import { SideBarContainer, Button } from '@chenzy-design/svelte';

  let visible = $state(false);
</script>

<Button onclick={() => (visible = true)}>打开侧边栏</Button>

<SideBarContainer
  {visible}
  title="信息栏"
  resizable={false}
  onCancel={() => (visible = false)}
>
  <p>基础容器：贴视口右侧的浮层壳，role=dialog + focus-trap + Esc 关闭。</p>
  <p>关闭按钮 aria-label 走 i18n（关闭/Close）。</p>
</SideBarContainer>
