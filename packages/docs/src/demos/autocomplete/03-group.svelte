<script lang="ts">
  import { AutoComplete } from '@chenzy-design/svelte';

  let value = $state('');

  // data 支持字符串或 { value, label, disabled } 对象项（对齐 Semi data 形态）。
  const all = [
    { value: 'react', label: 'React' },
    { value: 'vue', label: 'Vue' },
    { value: 'svelte', label: 'Svelte' },
    { value: 'solid', label: 'Solid' },
    { value: 'angular', label: 'Angular', disabled: true },
  ];
  let data = $state<typeof all>([]);

  function onSearch(query: string) {
    const q = query.toLowerCase();
    data = q ? all.filter((o) => o.label.toLowerCase().includes(q)) : all;
  }
</script>

<div style="width: 260px">
  <!-- 对象候选项：含 label / value / disabled；onSelectWithObject 回传完整对象 -->
  <AutoComplete
    {data}
    {value}
    placeholder="输入框架名（Angular 禁用）"
    onSelectWithObject
    {onSearch}
    onChange={(v) => (value = String(v))}
  />
</div>
