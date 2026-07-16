<script lang="ts">
  import { Input, TextArea, Text } from '@chenzy-design/svelte';

  let inputCount = $state(0);
  let taCount = $state(0);
</script>

<div style="display:flex;flex-direction:column;gap:16px;max-width:360px">
  <!-- composition：开启后输入法（如拼音）未确认期间不触发 onChange，确认后触发一次。Input 与 TextArea 均支持。 -->
  <div style="display:flex;flex-direction:column;gap:6px">
    <Input composition onChange={() => (inputCount += 1)} placeholder="Input：拼音输入时不触发 onChange" />
    <Text type="tertiary">Input onChange 触发次数：{inputCount}</Text>
  </div>
  <div style="display:flex;flex-direction:column;gap:6px">
    <TextArea composition onChange={() => (taCount += 1)} placeholder="TextArea：拼音输入时不触发 onChange" />
    <Text type="tertiary">TextArea onChange 触发次数：{taCount}</Text>
  </div>
</div>
