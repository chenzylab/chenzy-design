<script lang="ts">
  import { AutoComplete } from '@chenzy-design/svelte';

  let value = $state('');

  // 分组数据：{ label, options: [] }，options 可为字符串或 { value, label, disabled }
  const data = [
    {
      label: '前端框架',
      options: ['React', 'Vue', 'Svelte', 'Solid'],
    },
    {
      label: '后端语言',
      options: [
        { value: 'go', label: 'Go' },
        { value: 'rust', label: 'Rust' },
        { value: 'java', label: 'Java', disabled: true },
      ],
    },
  ];
</script>

<div style="width: 260px">
  <AutoComplete
    {data}
    {value}
    openOnFocus
    placeholder="聚焦展开分组候选"
    onChange={(v) => (value = v)}
  />
</div>
