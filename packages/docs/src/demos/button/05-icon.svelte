<script lang="ts">
  import { Button } from '@chenzy-design/svelte';
  import { IconCamera, IconSidebar, IconChevronDown } from '@chenzy-design/icons';
</script>

{#snippet camera()}<IconCamera />{/snippet}
{#snippet sidebar()}<IconSidebar />{/snippet}
{#snippet chevronDown()}<IconChevronDown />{/snippet}

<div style="display: flex; flex-direction: column; gap: 16px;">
  <div style="display: flex; gap: 8px; align-items: center;">
    <strong style="flex-shrink: 0; white-space: nowrap;">默认状态：</strong>
    <Button icon={camera} ariaLabel="截屏" />
  </div>

  <div style="display: flex; gap: 8px; align-items: center;">
    <strong style="flex-shrink: 0; white-space: nowrap;">禁用状态：</strong>
    <Button disabled icon={camera} ariaLabel="截屏" />
  </div>

  <div style="display: flex; gap: 8px; align-items: center;">
    <strong style="flex-shrink: 0; white-space: nowrap;">复合类型：</strong>
    <Button type="primary" icon={camera} ariaLabel="截屏" />
    <Button type="secondary" icon={camera} ariaLabel="截屏" />
    <Button type="warning" icon={camera} ariaLabel="截屏" />
    <Button type="danger" icon={camera} ariaLabel="截屏" />
  </div>

  <div style="display: flex; gap: 8px; align-items: center;">
    <strong style="flex-shrink: 0; white-space: nowrap;">更改主题：</strong>
    <Button icon={camera} theme="solid" ariaLabel="截屏" />
    <Button icon={camera} theme="light" ariaLabel="截屏" />
  </div>

  <div style="display: flex; gap: 8px; align-items: center;">
    <strong style="flex-shrink: 0; white-space: nowrap;">更改图标位置：</strong>
    <Button icon={sidebar} theme="solid">收起</Button>
    <Button icon={chevronDown} theme="solid" iconPosition="right">展开选项</Button>
  </div>
</div>
