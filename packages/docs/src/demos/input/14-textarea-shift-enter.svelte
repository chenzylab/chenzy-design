<script lang="ts">
  import { TextArea, Text } from '@chenzy-design/svelte';

  let text = $state('');
  // 禁用 Enter 换行，仅 Shift + Enter 才换行（对齐 Semi disabledEnterStartNewLine）。
  // 也可用 onKeyDown 手动 preventDefault 实现。
</script>

<div style="display:flex;flex-direction:column;gap:8px;max-width:420px">
  <Text type="tertiary">使用 Shift + Enter 换行（单独 Enter 不换行）</Text>
  <TextArea
    value={text}
    onChange={(v) => (text = v)}
    disabledEnterStartNewLine
    autosize={{ minRows: 2, maxRows: 6 }}
    placeholder="按 Enter 无效，Shift + Enter 换行"
  />
</div>
