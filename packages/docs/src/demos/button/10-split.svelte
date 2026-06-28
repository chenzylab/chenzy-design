<script lang="ts">
  import { SplitButtonGroup } from '@chenzy-design/svelte';

  let last = $state('');

  const items = [
    { key: 'save', label: '保存' },
    { key: 'save-as', label: '另存为…' },
    { type: 'divider' as const },
    { key: 'export', label: '导出 PDF' },
  ];
</script>

<div style="display: flex; flex-direction: column; gap: 12px; align-items: flex-start;">
  <SplitButtonGroup
    type="primary"
    theme="solid"
    {items}
    triggerAriaLabel="更多保存选项"
    onclick={() => (last = '提交')}
    onSelect={(key) => (last = String(key))}
  >
    提交
  </SplitButtonGroup>

  <SplitButtonGroup
    type="secondary"
    theme="outline"
    {items}
    triggerAriaLabel="更多操作"
    onclick={() => (last = '操作')}
    onSelect={(key) => (last = String(key))}
  >
    操作
  </SplitButtonGroup>

  <span style="font-size: 13px; color: var(--cd-color-text-2);">
    最近触发：{last || '（无）'}
  </span>
</div>
