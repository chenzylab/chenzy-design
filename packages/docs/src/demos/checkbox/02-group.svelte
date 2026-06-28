<script lang="ts">
  import { CheckboxGroup, Text } from '@chenzy-design/svelte';

  let checks = $state<(string | number)[]>(['a']);
</script>

<div style="display: flex; flex-direction: column; gap: 8px; align-items: flex-start;">
  <CheckboxGroup
    value={checks}
    onChange={(v) => (checks = v)}
    options={[
      { label: '选项 A', value: 'a' },
      { label: '选项 B', value: 'b' },
      { label: '选项 C（禁用）', value: 'c', disabled: true },
    ]}
  />
  <Text type="tertiary">已选：{checks.join(', ') || '（无）'}</Text>
</div>
