<script lang="ts">
  import { Button } from '@chenzy-design/svelte';
</script>

{#snippet camera()}
  <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
    <circle cx="12" cy="13" r="3" />
  </svg>
{/snippet}
{#snippet sidebar()}
  <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <rect x="3" y="4" width="18" height="16" rx="2" /><path d="M9 4v16" />
  </svg>
{/snippet}
{#snippet chevronDown()}
  <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="m6 9 6 6 6-6" />
  </svg>
{/snippet}

<div style="display: flex; flex-direction: column; gap: 16px;">
  <!-- 默认状态：纯图标按钮 -->
  <div style="display: flex; gap: 8px; align-items: center;">
    <strong style="width: 96px;">默认状态：</strong>
    <Button type="primary" icon={camera} ariaLabel="拍照" />
  </div>

  <!-- 禁用状态 -->
  <div style="display: flex; gap: 8px; align-items: center;">
    <strong style="width: 96px;">禁用状态：</strong>
    <Button type="primary" icon={camera} disabled ariaLabel="拍照" />
  </div>

  <!-- 复合类型：四种 type 的纯图标 -->
  <div style="display: flex; gap: 8px; align-items: center;">
    <strong style="width: 96px;">复合类型：</strong>
    <Button type="primary" icon={camera} ariaLabel="主要" />
    <Button type="secondary" icon={camera} ariaLabel="次要" />
    <Button type="warning" icon={camera} ariaLabel="警告" />
    <Button type="danger" icon={camera} ariaLabel="危险" />
  </div>

  <!-- 更改主题：同一图标在 solid / light 下 -->
  <div style="display: flex; gap: 8px; align-items: center;">
    <strong style="width: 96px;">更改主题：</strong>
    <Button type="primary" theme="solid" icon={camera} ariaLabel="实底" />
    <Button type="primary" theme="light" icon={camera} ariaLabel="浅色" />
  </div>

  <!-- 更改图标位置：图标在左 / 在右 -->
  <div style="display: flex; gap: 8px; align-items: center;">
    <strong style="width: 96px;">更改图标位置：</strong>
    <Button type="primary" theme="solid" icon={sidebar}>收起</Button>
    <Button type="primary" theme="solid" icon={chevronDown} iconPosition="right">展开选项</Button>
  </div>
</div>
