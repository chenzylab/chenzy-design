<script lang="ts">
  // 严格对齐 Semi「建议」demo：建议列表**由输入内容动态派生**（而非静态常量）——
  // 输入长度 1–3 个字符时，把四条模版拼在输入内容后作为候选；≥4 或为空则清空。
  // 逻辑逐条照搬 Semi 的 onChange（含 `\n` 早退与 suggestion 已空则不重复 setState）。
  import { AIChatInput } from '@chenzy-design/svelte';
  import type { AIChatInputChangePayload, AIChatInputSuggestion } from '@chenzy-design/svelte';

  const uploadProps = { action: 'https://api.semi.design/upload' };
  const suggestionTemplate = ['天气如何', '空气质量', '工作进程', '日程安排'];

  let suggestions = $state<AIChatInputSuggestion[]>([]);

  // Semi 的 onContentChange 入参是 Content[]，取 content[0].text；
  // 本库载荷是 { text, html, json }，text 即整段纯文本，语义等价。
  function onContentChange(payload: AIChatInputChangePayload): void {
    const value = payload.text;

    if (value === undefined || value.includes('\n')) {
      if (suggestions.length === 0) return;
      suggestions = [];
      return;
    }
    if (value.length === 0) {
      suggestions = [];
    } else if (value.length > 0 && value.length < 4) {
      suggestions = suggestionTemplate.map((item) => `${value}，${item}`);
    } else {
      suggestions = [];
    }
  }
</script>

<div style="margin: 12px;">
  <AIChatInput
    {suggestions}
    {onContentChange}
    {uploadProps}
    placeholder="输入内容，当内容长度小于 4 个字符可以看到建议，使用上下按键可切换候选项"
  />
</div>
