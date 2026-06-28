<script lang="ts">
  import { TagInput, Text } from '@chenzy-design/svelte';

  let small = $state<string[]>(['sm']);
  let large = $state<string[]>(['blur', 'add']);
  let locked = $state<string[]>(['readonly', 'lib']);
</script>

<div style="display:flex;flex-direction:column;gap:16px;width:360px">
  <div>
    <Text type="secondary">small + 失焦自动添加</Text>
    <TagInput
      size="small"
      value={small}
      addOnBlur
      showClear
      placeholder="输入后点击别处即添加"
      onChange={(t) => (small = t)}
    />
    <Text type="tertiary">标签：{small.join(' / ') || '（无）'}</Text>
  </div>

  <div>
    <Text type="secondary">large</Text>
    <TagInput
      size="large"
      value={large}
      addOnBlur
      placeholder="大尺寸"
      onChange={(t) => (large = t)}
    />
    <Text type="tertiary">标签：{large.join(' / ') || '（无）'}</Text>
  </div>

  <div>
    <Text type="secondary">disabled</Text>
    <TagInput disabled value={locked} placeholder="已禁用" />
    <Text type="tertiary">标签：{locked.join(' / ')}</Text>
  </div>
</div>
