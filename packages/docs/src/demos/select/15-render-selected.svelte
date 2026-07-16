<script lang="ts">
  import { Select } from '@chenzy-design/svelte';

  let val = $state<(string | number)[]>(['react', 'svelte']);
  const optionList = [
    { label: 'React', value: 'react', icon: '⚛️' },
    { label: 'Svelte', value: 'svelte', icon: '🔶' },
    { label: 'Vue', value: 'vue', icon: '💚' },
    { label: 'Angular', value: 'angular', icon: '🅰️' },
  ];
</script>

<div style="max-width:320px">
  <!-- renderSelectedItem：自定义已选 Tag 内容（多选）；此处在标签前加图标 -->
  <Select
    {optionList}
    multiple
    value={val}
    onChange={(v) => (val = v as (string | number)[])}
    placeholder="选择框架"
  >
    {#snippet renderSelectedItem({ option })}
      <span>{(option as { icon?: string }).icon} {option.label}</span>
    {/snippet}
  </Select>
</div>
