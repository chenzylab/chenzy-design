<script lang="ts">
  import { Select } from '@chenzy-design/svelte';

  const optionList = [
    { label: '选项 A', value: 'a' },
    { label: '选项 B', value: 'b' },
    { label: '选项 C', value: 'c' },
  ];
</script>

<div style="max-width:280px">
  <!-- dropdownStyle/dropdownClassName：自定义浮层样式（勿含 position/transform） -->
  <Select
    {optionList}
    placeholder="自定义弹层样式"
    dropdownStyle="border:1px solid var(--cd-color-primary)"
    dropdownClassName="my-custom-dropdown"
  />
</div>
