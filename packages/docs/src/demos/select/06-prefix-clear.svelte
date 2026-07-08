<script lang="ts">
  import { Select } from '@chenzy-design/svelte';

  let val = $state<string | undefined>('a');
  const options = [
    { label: '选项 A', value: 'a' },
    { label: '选项 B', value: 'b' },
    { label: '选项 C', value: 'c' },
  ];
</script>

<div style="display:flex;flex-direction:column;gap:12px;max-width:280px">
  <!-- prefix 前缀 + clearable 清除按钮 -->
  <Select {options} value={val} clearable onChange={(v) => (val = v as string)} placeholder="带前缀与清除">
    {#snippet prefix()}<span style="color:var(--cd-color-text-2)">🔍</span>{/snippet}
  </Select>
  <!-- showArrow=false 隐藏箭头 -->
  <Select {options} showArrow={false} placeholder="无下拉箭头" />
</div>
