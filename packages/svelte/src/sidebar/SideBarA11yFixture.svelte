<!--
  测试夹具：给 SideBar 提供 Snippet props（options icon / renderMainContent /
  renderDetailHeader / renderDetailContent），jsdom a11y 测试用。
-->
<script lang="ts">
  import SideBar from './SideBar.svelte';
  import type { SideBarOption, SideBarMode } from './types.js';

  interface Props {
    mode?: SideBarMode;
    activeKey?: string;
    onActiveOptionChange?: (e: Event, key: string) => void;
    onBackWard?: (e: Event, mode: SideBarMode) => void | Promise<void>;
  }

  let {
    mode = 'main',
    activeKey = 'tools',
    onActiveOptionChange,
    onBackWard,
  }: Props = $props();

  const options: SideBarOption[] = [
    { key: 'tools', name: 'Tools', icon: toolsIcon },
    { key: 'refs', name: 'References', icon: refsIcon },
  ];
</script>

{#snippet toolsIcon()}<span>T</span>{/snippet}
{#snippet refsIcon()}<span>R</span>{/snippet}

<SideBar
  {mode}
  {activeKey}
  {options}
  {onActiveOptionChange}
  {onBackWard}
  {renderMainContent}
  {renderDetailHeader}
  {renderDetailContent}
/>

{#snippet renderMainContent(key: string | undefined)}
  <div data-testid="main-content">Main: {key}</div>
{/snippet}

{#snippet renderDetailHeader(m: SideBarMode)}
  <span data-testid="detail-title">Detail: {m}</span>
{/snippet}

{#snippet renderDetailContent(m: SideBarMode)}
  <div data-testid="detail-content">Detail body: {m}</div>
{/snippet}
