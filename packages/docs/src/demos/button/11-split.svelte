<script lang="ts">
  import { SplitButtonGroup, Button } from '@chenzy-design/svelte';
  import { Dropdown } from '@chenzy-design/svelte';
  import { IconTreeTriangleDown } from '@chenzy-design/icons';

  const menu = [
    { node: 'item' as const, name: '编辑项目', key: 'edit', onClick: () => console.log('编辑项目点击') },
    { node: 'item' as const, name: '重置项目', key: 'reset' },
    { node: 'divider' as const },
    { node: 'item' as const, name: '复制项目', key: 'copy' },
    { node: 'item' as const, name: '从项目创建模版', key: 'tpl' },
    { node: 'divider' as const },
    { node: 'item' as const, name: '删除项目', key: 'del', type: 'danger' as const },
  ];
</script>

{#snippet caret()}<IconTreeTriangleDown />{/snippet}

<div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
  <SplitButtonGroup ariaLabel="项目操作按钮组">
    <Button theme="solid" type="primary">分裂按钮</Button>
    <Dropdown trigger="click" position="bottomEnd" {menu}>
      <Button theme="solid" type="primary" icon={caret} ariaLabel="更多操作"></Button>
    </Dropdown>
  </SplitButtonGroup>

  <SplitButtonGroup ariaLabel="项目操作按钮组">
    <Button theme="light" type="primary">分裂按钮</Button>
    <Dropdown trigger="click" position="bottomEnd" {menu}>
      <Button theme="light" type="primary" icon={caret} ariaLabel="更多操作"></Button>
    </Dropdown>
  </SplitButtonGroup>

  <SplitButtonGroup ariaLabel="项目操作按钮组">
    <Button theme="borderless" type="primary">分裂按钮</Button>
    <Dropdown trigger="click" position="bottomEnd" {menu}>
      <Button theme="borderless" type="primary" icon={caret} ariaLabel="更多操作"></Button>
    </Dropdown>
  </SplitButtonGroup>
</div>
