<script lang="ts">
  import { Dropdown, Button, Text } from '@chenzy-design/svelte';
  import type { DropdownItem } from '@chenzy-design/svelte';

  let lastDropdown = $state('');
  let dropdownPopupContainer = $state<HTMLDivElement | null>(null);

  const dropdownItems = [
    { key: 'edit', label: '编辑' },
    { key: 'copy', label: '复制' },
    { key: 'delete', label: '删除', danger: true },
  ];

  // 嵌套子菜单 + divider + group demo（多层嵌套）
  const dropdownTreeItems: DropdownItem[] = [
    { key: 'new', label: '新建' },
    {
      key: 'export',
      label: '导出为',
      children: [
        { key: 'export-pdf', label: 'PDF' },
        { key: 'export-png', label: 'PNG' },
        {
          key: 'export-more',
          label: '更多格式',
          children: [
            { key: 'export-svg', label: 'SVG' },
            { key: 'export-webp', label: 'WebP' },
          ],
        },
      ],
    },
    { type: 'divider' },
    {
      type: 'group',
      label: '编辑操作',
      children: [
        { key: 'cut', label: '剪切' },
        { key: 'paste', label: '粘贴', disabled: true },
      ],
    },
    { type: 'divider' },
    { key: 'remove', label: '删除', danger: true },
  ];
</script>

<div style="display:flex; flex-direction:column; gap:16px; align-items:flex-start">
  <Dropdown
    items={dropdownItems}
    trigger="click"
    onSelect={(k) => (lastDropdown = String(k))}
  >
    {#snippet triggerContent()}
      <Button type="secondary">操作菜单 ▾</Button>
    {/snippet}
  </Dropdown>
  <Text type="tertiary">上次选择：{lastDropdown || '（无）'}</Text>

  <div data-testid="dropdown-contextmenu">
    <Text type="tertiary">右键菜单（菜单定位到光标处）</Text>
    <Dropdown
      items={dropdownItems}
      trigger="contextMenu"
      onSelect={(k) => (lastDropdown = String(k))}
    >
      {#snippet triggerContent()}
        <div
          style="display:flex;align-items:center;justify-content:center;width:240px;height:80px;border:1px dashed var(--cd-color-border);border-radius:6px;color:var(--cd-color-text-2)"
        >
          在此区域点击右键
        </div>
      {/snippet}
    </Dropdown>
  </div>

  <div data-testid="dropdown-submenu">
    <Text type="tertiary">嵌套子菜单 + divider 分隔 + group 分组（多层）</Text>
    <Dropdown
      items={dropdownTreeItems}
      trigger="click"
      onSelect={(k) => (lastDropdown = String(k))}
    >
      {#snippet triggerContent()}
        <Button type="secondary">文件菜单 ▾</Button>
      {/snippet}
    </Dropdown>
  </div>

  <div data-testid="dropdown-destroy">
    <Text type="tertiary">destroyOnClose：关闭即卸载浮层 DOM，重开重建</Text>
    <Dropdown
      items={dropdownItems}
      trigger="click"
      destroyOnClose
      onSelect={(k) => (lastDropdown = String(k))}
    >
      {#snippet triggerContent()}
        <Button type="secondary">destroyOnClose ▾</Button>
      {/snippet}
    </Dropdown>
  </div>

  <div data-testid="dropdown-container">
    <Text type="tertiary">getPopupContainer：浮层挂到指定容器（非 body）</Text>
    <div
      bind:this={dropdownPopupContainer}
      style="position:relative;padding:16px;border:1px dashed var(--cd-color-border);border-radius:6px;overflow:hidden"
    >
      <Dropdown
        items={dropdownTreeItems}
        trigger="click"
        getPopupContainer={() => dropdownPopupContainer}
        onSelect={(k) => (lastDropdown = String(k))}
      >
        {#snippet triggerContent()}
          <Button type="secondary">挂到容器 ▾</Button>
        {/snippet}
      </Dropdown>
    </div>
  </div>
</div>
