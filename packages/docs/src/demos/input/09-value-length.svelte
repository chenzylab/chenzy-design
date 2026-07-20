<script lang="ts">
  import { Input, Text } from '@chenzy-design/svelte';

  let value = $state('');
  // 自定义计数：按 Unicode 码点计（emoji 记为 1），替代默认 UTF-16 长度
  const countGraphemes = (str: string) => [...str].length;
</script>

<div style="display:flex;flex-direction:column;gap:8px;max-width:320px">
  <!-- getValueLength 自定义字符计数（emoji 按可见长度计），限制可见长度 ≤ 10 -->
  <Input
    value={value}
    onChange={(v) => (value = v)}
    maxLength={10}
    getValueLength={countGraphemes}
    placeholder="最多 10 个字符（emoji 记 1）"
  />
  <Text type="tertiary">
    自定义计数 {countGraphemes(value)} · 原生 length {value.length}
  </Text>
</div>
