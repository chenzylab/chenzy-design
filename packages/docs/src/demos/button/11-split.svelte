<script lang="ts">
  import { SplitButtonGroup, Button } from '@chenzy-design/svelte';
  import { Dropdown } from '@chenzy-design/svelte';

  let last = $state('');

  const menu = [
    { node: 'item' as const, name: '编辑项目', key: 'edit', onClick: () => (last = '编辑项目') },
    { node: 'item' as const, name: '重置项目', key: 'reset', onClick: () => (last = '重置项目') },
    { node: 'divider' as const },
    { node: 'item' as const, name: '复制项目', key: 'copy', onClick: () => (last = '复制项目') },
    { node: 'item' as const, name: '从项目创建模版', key: 'tpl', onClick: () => (last = '创建模版') },
    { node: 'divider' as const },
    { node: 'item' as const, name: '删除项目', key: 'del', type: 'danger' as const, onClick: () => (last = '删除项目') },
  ];
</script>

{#snippet caret()}
  <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="m6 9 6 6 6-6" />
  </svg>
{/snippet}

<div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
  <SplitButtonGroup ariaLabel="项目操作按钮组">
    <Button theme="solid" type="primary" onclick={() => (last = '分裂按钮')}>分裂按钮</Button>
    <Dropdown trigger="click" position="bottomEnd" {menu}>
      <Button theme="solid" type="primary" icon={caret} ariaLabel="更多操作"></Button>
    </Dropdown>
  </SplitButtonGroup>

  <SplitButtonGroup ariaLabel="项目操作按钮组">
    <Button theme="light" type="primary" onclick={() => (last = '分裂按钮')}>分裂按钮</Button>
    <Dropdown trigger="click" position="bottomEnd" {menu}>
      <Button theme="light" type="primary" icon={caret} ariaLabel="更多操作"></Button>
    </Dropdown>
  </SplitButtonGroup>

  <SplitButtonGroup ariaLabel="项目操作按钮组">
    <Button theme="borderless" type="primary" onclick={() => (last = '分裂按钮')}>分裂按钮</Button>
    <Dropdown trigger="click" position="bottomEnd" {menu}>
      <Button theme="borderless" type="primary" icon={caret} ariaLabel="更多操作"></Button>
    </Dropdown>
  </SplitButtonGroup>
</div>

<div style="margin-top: 12px; font-size: 13px; color: var(--cd-color-text-2);">
  最近触发：{last || '（无）'}
</div>
