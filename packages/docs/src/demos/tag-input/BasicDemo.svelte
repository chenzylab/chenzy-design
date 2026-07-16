<script lang="ts">
  import { TagInput, Text } from '@chenzy-design/svelte';

  let tags = $state<string[]>(['svelte', 'vite']);
  let tagsCtrl = $state<string[]>([]);
  let tagsTrunc = $state<string[]>(['超长标签文本示例内容', '短']);
  let tagsDrag = $state<string[]>(['一', '二', '三', '四']);
  let tagInputCtrl = $state('');
</script>

<!-- 基础：回车或逗号添加（默认 separator=','） -->
<div style="width: 320px">
  <TagInput
    value={tags}
    placeholder="输入后回车或逗号"
    onChange={(t) => (tags = t)}
  />
  <Text type="tertiary">标签：{tags.join(' / ') || '（无）'}</Text>
</div>

<!-- 受控输入（强制大写） -->
<div style="width: 320px; margin-top: 12px" data-testid="taginput-controlled-input">
  <TagInput
    value={tagsCtrl}
    inputValue={tagInputCtrl}
    placeholder="受控输入：外部驱动文本"
    onChange={(t) => (tagsCtrl = t)}
    onInputChange={(v) => (tagInputCtrl = v.toUpperCase())}
  />
  <Text type="tertiary">输入(强制大写)：{tagInputCtrl || '（空）'}</Text>
</div>

<!-- 长标签省略 + 悬浮全文（showContentTooltip） -->
<div style="width: 320px; margin-top: 12px" data-testid="taginput-tooltip">
  <TagInput
    value={tagsTrunc}
    showContentTooltip
    placeholder="长标签省略，悬浮查看全文"
    onChange={(t) => (tagsTrunc = t)}
  />
  <Text type="tertiary">实际值：{tagsTrunc.join(' / ') || '（无）'}</Text>
</div>

<!-- 可拖拽重排 -->
<div style="width: 320px; margin-top: 12px" data-testid="taginput-draggable">
  <TagInput
    value={tagsDrag}
    draggable
    placeholder="可拖拽重排标签"
    onChange={(t) => (tagsDrag = t)}
  />
  <Text type="tertiary">顺序：{tagsDrag.join(' / ') || '（无）'}</Text>
</div>
