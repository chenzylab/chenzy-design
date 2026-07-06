<script lang="ts">
  import { SideBarContainer, SideBar, Button } from '@chenzy-design/svelte';
  import type { SideBarOption } from '@chenzy-design/svelte';

  let visible = $state(false);
  let activeKey = $state('tools');

  const options: SideBarOption[] = [
    { key: 'tools', name: '工具', icon: toolsIcon },
    { key: 'refs', name: '来源', icon: refsIcon },
    { key: 'files', name: '文件', icon: filesIcon },
  ];
</script>

{#snippet toolsIcon()}⚙{/snippet}
{#snippet refsIcon()}❝{/snippet}
{#snippet filesIcon()}▤{/snippet}

<Button onclick={() => (visible = true)}>打开主视图</Button>

<SideBarContainer {visible} title="AI 信息栏" onCancel={() => (visible = false)}>
  <SideBar
    mode="main"
    {activeKey}
    {options}
    onActiveOptionChange={(_e, key) => (activeKey = key)}
    {renderMainContent}
  />
</SideBarContainer>

{#snippet renderMainContent(key: string | undefined)}
  <div style="padding: 4px 0;">
    当前 Option：<strong>{key}</strong>
    <p>顶部 Options 图标 tab 组：role=tablist + roving tabindex + ←→ 键盘切换，name 作无障碍名。</p>
  </div>
{/snippet}
