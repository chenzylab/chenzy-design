<script lang="ts">
  import { Dropdown, Button } from '@chenzy-design/svelte';

  const items = [
    { key: 'edit', label: '编辑' },
    { key: 'copy', label: '复制' },
    { key: 'delete', label: '删除', danger: true },
  ];
</script>

<div style="display:flex; gap:16px; align-items:flex-start">
  <Dropdown {items} trigger="hover">
    {#snippet triggerContent()}
      <Button type="secondary">Hover 触发 ▾</Button>
    {/snippet}
  </Dropdown>

  <Dropdown {items} trigger="click">
    {#snippet triggerContent()}
      <Button type="secondary">Click 触发 ▾</Button>
    {/snippet}
  </Dropdown>

  <Dropdown {items} trigger="contextMenu">
    {#snippet triggerContent()}
      <Button type="secondary">右键触发</Button>
    {/snippet}
  </Dropdown>
</div>
