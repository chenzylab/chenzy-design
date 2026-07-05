<script lang="ts">
  import { AIChatInput } from '@chenzy-design/svelte';
  import type { AIChatInputSuggestion } from '@chenzy-design/svelte';

  // 聚焦编辑区弹出建议面板：↑↓ 环绕导航、Enter 选中、Esc 关闭、点击外部关闭。
  // onSuggestClick 未提供时默认把建议文本填入编辑器；此处自定义为记录选择。
  const suggestions: AIChatInputSuggestion[] = [
    '帮我写一段 Svelte 5 组件',
    { content: '把这段文字翻译成英文' },
    '总结要点并给出 TODO',
  ];
  let picked = $state('（点击输入框查看建议）');
</script>

<div style="max-width: 560px;">
  <AIChatInput
    {suggestions}
    placeholder="点此聚焦查看建议…"
    onSuggestClick={(s) => (picked = typeof s === 'string' ? s : s.content)}
  />
  <p style="margin-top: 12px; color: var(--cd-color-text-2);">已选建议：{picked}</p>
</div>
