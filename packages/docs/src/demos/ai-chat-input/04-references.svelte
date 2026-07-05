<script lang="ts">
  import { AIChatInput } from '@chenzy-design/svelte';
  import type { AIChatInputReference } from '@chenzy-design/svelte';

  // 引用条渲染于编辑区上方：text 显示 content、file 显示 name、image 显示缩略图。
  // 点击引用、删除引用各有回调；删除后从受控列表移除。
  let references = $state<AIChatInputReference[]>([
    { type: 'text', id: 'r1', content: '上一轮的结论：优先做基础输入' },
    { type: 'file', id: 'r2', name: 'AIChatInput.spec.md' },
  ]);
  let lastClicked = $state('（未点击）');

  function handleDelete(ref: AIChatInputReference): void {
    references = references.filter((r) => r.id !== ref.id);
  }
</script>

<div style="max-width: 560px;">
  <AIChatInput
    {references}
    placeholder="带引用的输入…"
    onReferenceClick={(r) => (lastClicked = r.type === 'text' ? (r.content ?? '') : (r.name ?? r.id))}
    onReferenceDelete={handleDelete}
  />
  <p style="margin-top: 12px; color: var(--cd-color-text-2);">
    最近点击的引用：{lastClicked}
  </p>
</div>
