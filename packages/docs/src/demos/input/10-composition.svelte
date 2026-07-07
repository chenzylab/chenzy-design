<script lang="ts">
  import { Input, Text } from '@chenzy-design/svelte';

  let count = $state(0);
</script>

<div style="display:flex;flex-direction:column;gap:8px;max-width:320px">
  <!-- composition：开启后输入法（如拼音）未确认期间不触发 onChange，确认后触发一次 -->
  <Input
    composition
    onChange={() => (count += 1)}
    placeholder="拼音输入时不触发 onChange"
  />
  <Text type="tertiary">onChange 触发次数：{count}</Text>
</div>
