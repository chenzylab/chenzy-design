<script lang="ts">
  // 对齐 Semi「基础容器」demo：motion / resizable 两个 Switch 交互式切换，
  // resizable 时容器有 minWidth/maxWidth 约束，否则退化固定宽度。
  import { SideBarContainer, Button, Switch } from '@chenzy-design/svelte';

  let visible = $state(false);
  let motion = $state(true);
  let resizable = $state(true);

  function toggleVisible() {
    visible = !visible;
  }
</script>

<div>
  <Button onclick={toggleVisible}>点我{visible ? '隐藏' : '展示'}容器</Button>
  <div style="display:flex; align-items:center; gap:8px; margin-top:10px;">
    是否有动画 <Switch checked={motion} onChange={(v) => (motion = v)} />
  </div>
  <div style="display:flex; align-items:center; gap:8px; margin-top:10px;">
    是否可伸缩 <Switch checked={resizable} onChange={(v) => (resizable = v)} />
  </div>
</div>

<SideBarContainer
  {visible}
  {motion}
  {resizable}
  minWidth={250}
  maxWidth="60%"
  title="基础容器示例"
  style={resizable ? undefined : 'width: 200px;'}
  onCancel={toggleVisible}
>
  <p>基础容器：贴视口右侧的浮层壳，role=dialog + focus-trap + Esc 关闭。</p>
  <p>关闭按钮 aria-label 走 i18n（关闭/Close）。</p>
</SideBarContainer>
