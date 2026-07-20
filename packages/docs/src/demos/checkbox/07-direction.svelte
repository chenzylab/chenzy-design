<script lang="ts">
  import { CheckboxGroup } from '@chenzy-design/svelte';

  const options = [
    { label: '抖音', value: 'abc' },
    { label: '今日头条', value: 'toutiao' },
  ];
</script>

<CheckboxGroup {options} direction="horizontal" ariaLabel="CheckboxGroup 示例" />
