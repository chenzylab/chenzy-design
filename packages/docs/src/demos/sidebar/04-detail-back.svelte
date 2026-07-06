<script lang="ts">
  import { SideBarContainer, SideBar, Button } from '@chenzy-design/svelte';

  let visible = $state(false);
  let mode = $state<'main' | 'code'>('main');
</script>

<Button onclick={() => (visible = true)}>打开详情路由</Button>

<SideBarContainer {visible} title="详情路由" onCancel={() => (visible = false)}>
  <SideBar
    {mode}
    renderMainContent={mainContent}
    renderDetailHeader={detailHeader}
    renderDetailContent={detailContent}
    onBackWard={() => {
      mode = 'main';
    }}
  />
</SideBarContainer>

{#snippet mainContent()}
  <div style="padding: 4px 0;">
    <p>主视图。点击进入详情视图（mode='code'）。</p>
    <Button size="small" onclick={() => (mode = 'code')}>查看代码详情</Button>
  </div>
{/snippet}

{#snippet detailHeader(m: string)}
  <strong>详情：{m}</strong>
{/snippet}

{#snippet detailContent(m: string)}
  <div style="padding: 4px 0;">
    <p>详情内容（mode={m}）。左上返回按钮（onBackWard，可异步）回到主视图。</p>
    <p>P4/P5 会在此渲染 code/file 具体内容；本阶段为自定义渲染路径 + 路由骨架。</p>
  </div>
{/snippet}
